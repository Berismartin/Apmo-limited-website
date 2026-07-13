"use client"

import { AppImage } from "@/components/ui/app-image"
import { useRef, useState, useCallback, useEffect } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/constants"
import type { ProductImage } from "@/types"

const maxImageUploadMb = MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)

interface ImageUploaderProps {
  existing?: ProductImage[]
  productId?: string
  onDeleteImage?: (imageUrl: string) => Promise<void>
}

export function ImageUploader({ existing = [], onDeleteImage }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const dataTransferRef = useRef<DataTransfer | null>(null)

  useEffect(() => {
    dataTransferRef.current = new DataTransfer()
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const syncInputFiles = useCallback(() => {
    if (inputRef.current && dataTransferRef.current) {
      inputRef.current.files = dataTransferRef.current.files
    }
  }, [])

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (!files.length) return
      if (!dataTransferRef.current) dataTransferRef.current = new DataTransfer()

      const newPreviews: { url: string; name: string }[] = []
      const rejected: string[] = []

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/") || file.size === 0) continue

        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
          rejected.push(file.name)
          continue
        }

        dataTransferRef.current.items.add(file)
        newPreviews.push({
          url: URL.createObjectURL(file),
          name: file.name,
        })
      }

      if (rejected.length > 0) {
        setUploadError(
          rejected.length === 1
            ? `"${rejected[0]}" is over ${maxImageUploadMb} MB.`
            : `${rejected.length} files are over ${maxImageUploadMb} MB.`
        )
      } else {
        setUploadError(null)
      }

      if (newPreviews.length === 0) return

      setPreviews((prev) => [...prev, ...newPreviews])
      syncInputFiles()
    },
    [syncInputFiles]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files?.length) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files)
      // Reset so the same file can be re-selected after removal
      e.target.value = ""
      syncInputFiles()
    }
  }

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[index].url)
      copy.splice(index, 1)
      return copy
    })

    if (dataTransferRef.current && inputRef.current) {
      const dt = new DataTransfer()
      const files = dataTransferRef.current.files
      for (let i = 0; i < files.length; i++) {
        if (i !== index) dt.items.add(files[i])
      }
      dataTransferRef.current = dt
      inputRef.current.files = dt.files
    }
  }

  const handleDelete = async (url: string) => {
    if (!onDeleteImage) return
    setDeletingUrl(url)
    try {
      await onDeleteImage(url)
    } finally {
      setDeletingUrl(null)
    }
  }

  return (
    <div className="space-y-5">
      {existing.length > 0 && (
        <div className="space-y-2">
          <Label>Current images</Label>
          <div className="flex flex-wrap gap-3">
            {existing.map((img) => (
              <div
                key={img.url}
                className="group relative h-24 w-24 overflow-hidden rounded-xl border border-rose-100 bg-rose-50 shadow-sm"
              >
                <input type="hidden" name="existing_image_url" value={img.url} />
                <AppImage
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="96px"
                  className="object-cover transition-opacity group-hover:opacity-70"
                />
                {onDeleteImage && (
                  <button
                    type="button"
                    onClick={() => handleDelete(img.url)}
                    disabled={deletingUrl === img.url}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100"
                    aria-label={`Delete ${img.alt}`}
                  >
                    {deletingUrl === img.url ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                        <X className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="image_file">
          {existing.length > 0 ? "Upload new images" : "Product images"}
        </Label>

        <input
          ref={inputRef}
          id="image_file"
          name="image_file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={handleChange}
          aria-label="Upload product images"
        />

        {previews.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {previews.map((preview, idx) => (
              <div
                key={preview.url}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-rose-200 bg-rose-50 shadow-sm"
              >
                <AppImage
                  src={preview.url}
                  alt={preview.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePreview(idx)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-rose-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-rose-100"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images – click or drag and drop"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors select-none ${
            isDragging
              ? "border-rose-400 bg-rose-50 text-rose-700"
              : "border-rose-200 bg-rose-50/40 text-muted-foreground hover:border-rose-300 hover:bg-rose-50"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              isDragging ? "bg-rose-100" : "bg-rose-100/60"
            }`}
          >
            {isDragging ? (
              <ImageIcon className="h-6 w-6 text-rose-600" />
            ) : (
              <Upload className="h-6 w-6 text-rose-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragging ? "Drop images to upload" : "Drag & drop images or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WebP or GIF · max {maxImageUploadMb} MB each · uploaded as-is
            </p>
          </div>
        </div>

        {uploadError ? (
          <p className="text-sm text-rose-700" role="alert">
            {uploadError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
