import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/constants"
import { slugify } from "@/lib/utils"

export const productImageBucket = "apmo_bucket"
export const maxImageUploadBytes = MAX_IMAGE_UPLOAD_BYTES

export interface ProcessedProductImage {
  url: string
  width?: number
  height?: number
}

export async function uploadProductImagesFromFormData(
  formData: FormData,
  slug: string
): Promise<ProcessedProductImage[]> {
  const files = formData.getAll("image_file")
  const results: ProcessedProductImage[] = []
  const folder = storageFolder(slug)

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) {
      continue
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Uploaded file must be an image")
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error(
        `"${file.name}" is too large. Maximum image size is 2 MB.`
      )
    }

    const supabase = createSupabaseAdminClient()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${sanitizeFilename(file.name)}`

    const { error } = await supabase.storage
      .from(productImageBucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: "31536000",
      })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from(productImageBucket).getPublicUrl(path)
    results.push({
      url: data.publicUrl,
    })
  }

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
