import sharp from "sharp"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/constants"
import { slugify } from "@/lib/utils"

export const productImageBucket = "apmo_bucket"
export const maxImageUploadBytes = MAX_IMAGE_UPLOAD_BYTES

// Product photos are frequently uploaded straight from a phone camera at
// full resolution. Nothing on the site displays them larger than this, so
// resizing down before upload shrinks both the upload payload and every
// later page load — instead of shipping the original to every visitor.
const MAX_IMAGE_DIMENSION = 1600
const WEBP_QUALITY = 82

// Upload several images at once, but cap concurrency so a big batch doesn't
// open dozens of simultaneous connections to Supabase Storage.
const UPLOAD_CONCURRENCY = 4

export interface ProcessedProductImage {
  url: string
  width?: number
  height?: number
}

interface PreparedImage {
  buffer: Buffer
  contentType: string
  extension: string
  width?: number
  height?: number
}

/**
 * Resize/re-encode an uploaded image before it's stored. Animated GIFs are
 * passed through untouched (sharp would flatten them to a single frame);
 * everything else is downscaled to fit within MAX_IMAGE_DIMENSION and
 * re-encoded as WebP.
 */
async function prepareImage(file: File): Promise<PreparedImage> {
  const input = Buffer.from(await file.arrayBuffer())

  if (file.type === "image/gif") {
    return { buffer: input, contentType: file.type, extension: "gif" }
  }

  const resized = sharp(input, { animated: false })
    // Respect EXIF orientation before the metadata that encodes it is stripped.
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })

  const { data, info } = await resized.toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    contentType: "image/webp",
    extension: "webp",
    width: info.width,
    height: info.height,
  }
}

export async function uploadProductImagesFromFormData(
  formData: FormData,
  slug: string
): Promise<ProcessedProductImage[]> {
  const files = formData
    .getAll("image_file")
    .filter((file): file is File => file instanceof File && file.size > 0)

  if (files.length === 0) return []

  // Validate every file before uploading any of them, so a single bad file
  // in a multi-image batch can't leave earlier files uploaded and orphaned.
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`"${file.name}" must be an image`)
    }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error(
        `"${file.name}" is too large. Maximum image size is 2 MB.`
      )
    }
  }

  const supabase = createSupabaseAdminClient()
  const folder = storageFolder(slug)
  const results: ProcessedProductImage[] = new Array(files.length)

  let cursor = 0
  async function worker() {
    while (cursor < files.length) {
      const index = cursor++
      const file = files[index]
      const prepared = await prepareImage(file)
      const baseName = sanitizeFilename(file.name).replace(/\.[^/.]+$/, "")
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${baseName}.${prepared.extension}`

      const { error } = await supabase.storage
        .from(productImageBucket)
        .upload(path, prepared.buffer, {
          contentType: prepared.contentType,
          upsert: true,
          cacheControl: "31536000",
        })

      if (error) throw new Error(error.message)

      const { data } = supabase.storage.from(productImageBucket).getPublicUrl(path)
      results[index] = {
        url: data.publicUrl,
        width: prepared.width,
        height: prepared.height,
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker)
  )

  return results
}

export async function uploadProductImageFromFormData(
  formData: FormData,
  slug: string
): Promise<ProcessedProductImage | null> {
  const results = await uploadProductImagesFromFormData(formData, slug)
  return results[0] ?? null
}

/** Keep nested folders like `blog/my-post` instead of collapsing to `blogmy-post`. */
function storageFolder(slug: string) {
  return slug
    .split("/")
    .map((part) => slugify(part))
    .filter(Boolean)
    .join("/")
}

function sanitizeFilename(name: string) {
  const base = name.replace(/[/\\]/g, "").trim() || "image"
  return base.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").slice(0, 120)
}
