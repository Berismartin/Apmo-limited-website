"use client"

import { AppImage } from "@/components/ui/app-image"
import { useRef, useState, useCallback, useEffect } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { ProductImage } from "@/types"

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return resolve(file)

        let width = img.width
        let height = img.height
        const max_size = 1600

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width
            width = max_size
          }
        } else {
          if (height > max_size) {
            width *= max_size / height
            height = max_size
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              })
              resolve(newFile)
            } else {
              resolve(file)
            }
          },
          "image/webp",
          0.82
        )
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

interface ImageUploaderProps {
  existing?: ProductImage[]
  productId?: string
  onDeleteImage?: (imageUrl: string) => Promise<void>
}

export function ImageUploader({ existing = [], productId, onDeleteImage }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const dataTransferRef = useRef<DataTransfer | null>(null)

  useEffect(() => {
    dataTransferRef.current = new DataTransfer()
    return () => {
      // Cleanup object URLs on unmount
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!files.length) return
    setIsProcessing(true)

    try {
      if (!dataTransferRef.current) dataTransferRef.current = new DataTransfer()
      
      const newPreviews: { url: string; name: string }[] = []
      
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue
        
        const processedFile = await compressImage(file)
        dataTransferRef.current.items.add(processedFile)
        
        const url = URL.createObjectURL(processedFile)
        newPreviews.push({ url, name: processedFile.name })
      }

      setPreviews(prev => [...prev, ...newPreviews])
      
      if (inputRef.current) {
        inputRef.current.files = dataTransferRef.current.files
      }
    } finally {
      setIsProcessing(false)
    }
  }, [])

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
    }
  }

  const removePreview = (index: number) => {
    setPreviews(prev => {
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
      {/* ── Existing images gallery ────────────────────────────────── */}
      {existing.length > 0 && (
        <div className="space-y-2">
          <Label>Current images</Label>
          <div className="flex flex-wrap gap-3">
            {existing.map((img) => (
              <div key={img.url} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-rose-100 bg-rose-50 shadow-sm">
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

      {/* ── Drag-and-drop upload zone ──────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="image_file">
          {existing.length > 0 ? "Upload new images" : "Product images"}
        </Label>

        {/* Hidden real file input consumed by the Server Action */}
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
              <div key={preview.url} className="relative h-24 w-24 overflow-hidden rounded-xl border border-rose-200 bg-rose-50 shadow-sm">
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

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images – click or drag and drop"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors select-none ${
            isDragging
              ? "border-rose-400 bg-rose-50 text-rose-700"
              : "border-rose-200 bg-rose-50/40 text-muted-foreground hover:border-rose-300 hover:bg-rose-50"
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isDragging ? "bg-rose-100" : "bg-rose-100/60"}`}>
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
            ) : isDragging ? (
              <ImageIcon className="h-6 w-6 text-rose-600" />
            ) : (
              <Upload className="h-6 w-6 text-rose-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isProcessing ? "Processing images..." : isDragging ? "Drop images to upload" : "Drag & drop images or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WebP or GIF · converted to WebP automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
