"use client"

import { AppImage } from "@/components/ui/app-image"
import { useRef, useState, useCallback, useEffect } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Crop, Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/constants"
import type { ProductImage } from "@/types"

const maxImageUploadMb = MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)

interface ImageUploaderProps {
  existing?: ProductImage[]
  productId?: string
  onDeleteImage?: (imageUrl: string) => Promise<void>
  /** Product forms can square-crop each new image before upload. */
  enableCrop?: boolean
  /** Called whenever the files that should be submitted change. */
  onReadyFilesChange?: (files: File[]) => void
}

export function attachReadyImageFiles(formData: FormData, files: File[]) {
  formData.delete("image_file")
  for (const file of files) {
    formData.append("image_file", file)
  }
}

// Longest edge of a cropped image — big enough for zoom, small enough for the upload limit.
const MAX_CROP_EDGE = 2000

async function cropImageFile(file: File, url: string, area: Area): Promise<File> {
  const image = new Image()
  image.src = url
  await image.decode()

  const edge = Math.min(Math.round(area.width), MAX_CROP_EDGE)
  const canvas = document.createElement("canvas")
  canvas.width = edge
  canvas.height = edge
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Could not crop this image")
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, edge, edge)

  // Canvas can't write GIF; keep PNG/WebP transparency, everything else as JPEG.
  const type = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg"
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92))
  if (!blob) throw new Error("Could not crop this image")

  const extension = type.split("/")[1].replace("jpeg", "jpg")
  const name = file.name.replace(/\.[^/.]+$/, "") + `-crop.${extension}`
  return new File([blob], name, { type, lastModified: Date.now() })
}

type PendingImage = {
  id: string
  file: File
  url: string
}

export function ImageUploader({
  existing = [],
  onDeleteImage,
  enableCrop = false,
  onReadyFilesChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pending, setPending] = useState<PendingImage[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [cropTargetId, setCropTargetId] = useState<string | null>(null)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [cropZoom, setCropZoom] = useState(1)
  const [cropArea, setCropArea] = useState<Area | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [cropError, setCropError] = useState<string | null>(null)
  const dataTransferRef = useRef<DataTransfer | null>(null)
  const onReadyFilesChangeRef = useRef(onReadyFilesChange)
  onReadyFilesChangeRef.current = onReadyFilesChange

  useEffect(() => {
    dataTransferRef.current = new DataTransfer()
    return () => {
      pending.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const syncInputFiles = useCallback((items: PendingImage[]) => {
    const files = items.map((item) => item.file)
    onReadyFilesChangeRef.current?.(files)

    const dt = new DataTransfer()
    for (const file of files) {
      dt.items.add(file)
    }
    dataTransferRef.current = dt
    if (inputRef.current) {
      inputRef.current.files = dt.files
    }
  }, [])

  const updatePending = useCallback(
    (updater: (prev: PendingImage[]) => PendingImage[]) => {
      setPending((prev) => {
        const next = updater(prev)
        syncInputFiles(next)
        return next
      })
    },
    [syncInputFiles]
  )

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      if (!files.length) return

      const rejected: string[] = []
      const additions: PendingImage[] = []

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/") || file.size === 0) continue

        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
          rejected.push(file.name)
          continue
        }

        additions.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          url: URL.createObjectURL(file),
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

      if (additions.length === 0) return

      updatePending((prev) => [...prev, ...additions])
    },
    [updatePending]
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
      e.target.value = ""
    }
  }

  const removePending = (id: string) => {
    updatePending((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((item) => item.id !== id)
    })
  }

  const openCrop = (id: string) => {
    setCropPosition({ x: 0, y: 0 })
    setCropZoom(1)
    setCropArea(null)
    setCropError(null)
    setCropTargetId(id)
  }

  const cropTarget = pending.find((item) => item.id === cropTargetId)

  const applyCrop = async () => {
    if (!cropTarget || !cropArea) return
    setIsCropping(true)
    try {
      const croppedFile = await cropImageFile(cropTarget.file, cropTarget.url, cropArea)
      if (croppedFile.size > MAX_IMAGE_UPLOAD_BYTES) {
        throw new Error(`The cropped image is over ${maxImageUploadMb} MB.`)
      }
      const croppedUrl = URL.createObjectURL(croppedFile)
      updatePending((prev) =>
        prev.map((item) => {
          if (item.id !== cropTarget.id) return item
          URL.revokeObjectURL(item.url)
          return { ...item, file: croppedFile, url: croppedUrl }
        })
      )
      setCropTargetId(null)
    } catch (error) {
      setCropError(error instanceof Error ? error.message : "Could not crop this image")
    } finally {
      setIsCropping(false)
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

      <div className="space-y-3">
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

        {pending.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {pending.map((item) => (
              <div
                key={item.id}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-rose-200 bg-rose-50 shadow-sm"
              >
                <AppImage
                  src={item.url}
                  alt={item.file.name}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={() => removePending(item.id)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-rose-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-rose-100"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
                {enableCrop ? (
                  <button
                    type="button"
                    onClick={() => openCrop(item.id)}
                    className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-rose-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-rose-100"
                    aria-label={`Crop ${item.file.name}`}
                    title="Crop to square"
                  >
                    <Crop className="h-3 w-3" />
                  </button>
                ) : null}
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
              {isDragging
                ? "Drop images to upload"
                : "Drag & drop images or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WebP or GIF · max {maxImageUploadMb} MB each
              {enableCrop ? " · crop to square before saving" : " · uploaded as-is"}
            </p>
          </div>
        </div>

        {uploadError ? (
          <p className="text-sm text-rose-700" role="alert">
            {uploadError}
          </p>
        ) : null}
      </div>

      {enableCrop ? (
        <Dialog
          open={Boolean(cropTarget)}
          onOpenChange={(open) => {
            if (!open && !isCropping) setCropTargetId(null)
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Crop to square</DialogTitle>
            </DialogHeader>
            {cropTarget ? (
              <div className="relative mx-auto aspect-square w-[min(100%,60dvh)] overflow-hidden rounded-xl bg-[#351426]">
                <Cropper
                  image={cropTarget.url}
                  crop={cropPosition}
                  zoom={cropZoom}
                  aspect={1}
                  onCropChange={setCropPosition}
                  onZoomChange={setCropZoom}
                  onCropComplete={(_, pixels) => setCropArea(pixels)}
                />
              </div>
            ) : null}
            <label className="grid gap-2 text-xs text-muted-foreground">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                className="accent-rose-600"
              />
            </label>
            {cropError ? (
              <p className="text-sm text-rose-700" role="alert">
                {cropError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isCropping}
                onClick={() => setCropTargetId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isCropping || !cropArea}
                onClick={applyCrop}
              >
                {isCropping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Apply crop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
