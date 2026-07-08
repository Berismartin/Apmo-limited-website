"use client"

import Image from "next/image"
import { useRef, useState, useCallback } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { ProductImage } from "@/types"

interface ImageUploaderProps {
  existing?: ProductImage[]
  productId?: string
  onDeleteImage?: (imageUrl: string) => Promise<void>
}

export function ImageUploader({ existing = [], productId, onDeleteImage }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    // Sync to the hidden file input so the form picks it up
    const dt = new DataTransfer()
    dt.items.add(file)
    if (inputRef.current) inputRef.current.files = dt.files
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const clearPreview = () => {
    setPreview(null)
    setFileName(null)
    if (inputRef.current) inputRef.current.value = ""
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
                <Image
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
          {existing.length > 0 ? "Replace / add image" : "Product image"}
        </Label>

        {/* Hidden real file input consumed by the Server Action */}
        <input
          ref={inputRef}
          id="image_file"
          name="image_file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={handleChange}
          aria-label="Upload product image"
        />

        {preview ? (
          /* Preview card */
          <div className="relative overflow-hidden rounded-xl border border-rose-200 bg-rose-50">
            <div className="relative h-52 w-full">
              <Image
                src={preview}
                alt="Upload preview"
                fill
                sizes="100vw"
                className="object-contain p-2"
              />
            </div>
            <div className="flex items-center justify-between border-t border-rose-100 bg-white px-4 py-2.5">
              <span className="truncate text-xs text-muted-foreground">{fileName}</span>
              <button
                type="button"
                onClick={clearPreview}
                className="ml-2 shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-700"
                aria-label="Remove selected image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Drop zone */
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload image – click or drag and drop"
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
              {isDragging ? (
                <ImageIcon className="h-6 w-6 text-rose-600" />
              ) : (
                <Upload className="h-6 w-6 text-rose-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragging ? "Drop to upload" : "Drag & drop or click to browse"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, WebP or GIF · converted to WebP automatically
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Manual URL fallback ────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="image_url">Or enter image URL</Label>
          <Input
            id="image_url"
            name="image_url"
            placeholder="/images/site_images/IMG_1706.jpg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_alt">Image alt text</Label>
          <Input
            id="image_alt"
            name="image_alt"
            defaultValue={existing[0]?.alt ?? ""}
          />
        </div>
      </div>
    </div>
  )
}
