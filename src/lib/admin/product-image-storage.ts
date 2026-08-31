import type sharpType from "sharp"
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
const IMAGE_QUALITY = 82

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

// sharp ships a platform-specific native binary (libvips). Some hosts run a
// different OS/arch for the build step than for the running server (or
// simply never installed the optional platform package), and in that case
// `sharp` fails to load entirely. Importing it lazily — instead of as a
// top-level `import sharp from "sharp"` — means that failure only surfaces
// when an image is actually being uploaded, not on every single page that
// happens to import this module (which is what made unrelated admin pages
// 500 the moment this file was touched). The result is cached so we don't
// retry a broken install on every image in a batch.
let sharpModulePromise: Promise<typeof sharpType | null> | null = null

function loadSharp(): Promise<typeof sharpType | null> {
  if (!sharpModulePromise) {
    sharpModulePromise = import("sharp")
      .then((mod) => mod.default)
      .catch((error) => {
        console.error(
          "[product-image-storage] sharp failed to load — uploading images " +
            "without resizing instead of failing the request. This usually " +
            "means the platform-specific sharp binary isn't installed for " +
            "this runtime (see https://sharp.pixelplumbing.com/install#cross-platform).",
          error
        )
        return null
      })
  }
  return sharpModulePromise
}

function extensionFromFile(file: File): string {
  const fromName = file.name.split(".").pop()
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/i.test(fromName)) {
    return fromName.toLowerCase()
  }
  const fromType = file.type.split("/")[1]
  return fromType ? fromType.toLowerCase() : "bin"
}

/**
 * Resize an uploaded image before it's stored, re-encoding it in the SAME
 * format it was uploaded in (jpeg stays jpeg, png stays png, webp stays
 * webp). Animated GIFs are passed through untouched (sharp would flatten
 * them to a single frame). If sharp isn't usable in this environment, or
 * fails on a specific file, the original file is uploaded as-is rather than
 * failing the upload.
 *
 * Deliberately NOT converting everything to webp: a storage bucket's
 * allowed-mime-types allowlist (see the apmo_bucket migrations) may not
 * include whatever format this converts to, and changing the format on the
 * way out is a good way to have uploads start silently failing against an
 * allowlist that was never updated to expect it.
 */
async function prepareImage(file: File): Promise<PreparedImage> {
  const input = Buffer.from(await file.arrayBuffer())
  const originalExtension = extensionFromFile(file)

  if (file.type === "image/gif") {
    return { buffer: input, contentType: file.type, extension: "gif" }
  }

  const sharp = await loadSharp()
  if (!sharp) {
    return { buffer: input, contentType: file.type, extension: originalExtension }
  }

  try {
    let pipeline = sharp(input, { animated: false })
      // Respect EXIF orientation before the metadata that encodes it is stripped.
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })

    let contentType = file.type
    let extension = originalExtension

    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      pipeline = pipeline.jpeg({ quality: IMAGE_QUALITY })
      contentType = "image/jpeg"
      extension = "jpg"
    } else if (file.type === "image/png") {
      pipeline = pipeline.png({ compressionLevel: 9 })
      contentType = "image/png"
      extension = "png"
    } else if (file.type === "image/webp") {
      pipeline = pipeline.webp({ quality: IMAGE_QUALITY })
      contentType = "image/webp"
      extension = "webp"
    }
    // Anything else (e.g. avif, tiff): resize only, keep the original
    // container format sharp inferred from the input rather than guessing.

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })

    return { buffer: data, contentType, extension, width: info.width, height: info.height }
  } catch (error) {
    console.error(
      `[product-image-storage] sharp failed to process "${file.name}" — uploading it unresized.`,
      error
    )
    return { buffer: input, contentType: file.type, extension: originalExtension }
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
