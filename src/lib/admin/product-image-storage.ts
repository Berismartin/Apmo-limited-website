import sharp from "sharp"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"

export const productImageBucket = "apmo_bucket"

const maxImageSize = 1600
const webpQuality = 82

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

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) {
      continue
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Uploaded file must be an image")
    }

    const { buffer, width, height } = await processProductImage(file)
    const supabase = createSupabaseAdminClient()
    // Add unique string to path to avoid name collisions on fast parallel uploads
    const path = `${slugify(slug)}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}.webp`

    const { error } = await supabase.storage.from(productImageBucket).upload(path, buffer, {
      contentType: "image/webp",
      upsert: true,
    })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from(productImageBucket).getPublicUrl(path)
    results.push({
      url: data.publicUrl,
      width,
      height,
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

async function processProductImage(file: File) {
  const inputBuffer = Buffer.from(await file.arrayBuffer())
  const processed = sharp(inputBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: maxImageSize,
      height: maxImageSize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: webpQuality })

  const { data, info } = await processed.toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    width: info.width ?? undefined,
    height: info.height ?? undefined,
  }
}