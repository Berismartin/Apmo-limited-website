"use client"

import { AppImage } from "@/components/ui/app-image"
import { useRef, useState, useCallback, useEffect } from "react"
import { Check, Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/constants"
import type { ProductImage } from "@/types"

const maxImageUploadMb = MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)

interface ImageUploaderProps {
  existing?: ProductImage[]
  productId?: string
  onDeleteImage?: (imageUrl: string) => Promise<void>
  /** Product forms can opt into background removal with approve/reject. */
  enableBackgroundRemoval?: boolean
}

type PendingImage = {
  id: string
  originalFile: File
  originalUrl: string
  processedFile?: File
  processedUrl?: string
  status: "ready" | "processing" | "review" | "error"
  error?: string
  removeBackground: boolean
}

export function ImageUploader({
  existing = [],
  onDeleteImage,
  enableBackgroundRemoval = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [pending, setPending] = useState<PendingImage[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const dataTransferRef = useRef<DataTransfer | null>(null)

  useEffect(() => {
    dataTransferRef.current = new DataTransfer()
    return () => {
      pending.forEach((item) => {
        URL.revokeObjectURL(item.originalUrl)
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const syncInputFiles = useCallback((items: PendingImage[]) => {
    const dt = new DataTransfer()
    for (const item of items) {
      if (item.status !== "ready") continue
      const file =
        item.removeBackground && item.processedFile
          ? item.processedFile
          : item.originalFile
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

  // Background removal loads and runs a full ML model client-side (WASM).
  // Firing several of these at once is what makes a multi-image upload feel
  // like it has hung — chain jobs onto a queue so only one runs at a time.
  const bgRemovalQueueRef = useRef<Promise<void>>(Promise.resolve())

  const processBackgroundRemoval = useCallback((itemId: string, file: File) => {
    const job = async () => {
      try {
        const { removeBackground: removeBg } = await import("@imgly/background-removal")
        const blob = await removeBg(file, {
          output: { format: "image/png", quality: 0.9 },
          model: "isnet_fp16",
        })

        const processedName = file.name.replace(/\.[^/.]+$/, "") + "-nobg.png"
        const processedFile = new File([blob], processedName, {
          type: "image/png",
          lastModified: Date.now(),
        })
        const processedUrl = URL.createObjectURL(processedFile)

        updatePending((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item
            if (item.processedUrl) URL.revokeObjectURL(item.processedUrl)
            return {
              ...item,
              processedFile,
              processedUrl,
              status: "review",
              error: undefined,
            }
          })
        )
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Background removal failed"
        updatePending((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, status: "error", error: message }
              : item
          )
        )
      }
    }

    // Chain onto the queue regardless of whether the previous job succeeded
    // or failed, so one failure doesn't stall every image behind it.
    bgRemovalQueueRef.current = bgRemovalQueueRef.current.then(job, job)
  }, [updatePending])

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

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const shouldRemoveBg = enableBackgroundRemoval && removeBackground
        additions.push({
          id,
          originalFile: file,
          originalUrl: URL.createObjectURL(file),
          status: shouldRemoveBg ? "processing" : "ready",
          removeBackground: shouldRemoveBg,
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

      for (const item of additions) {
        if (item.status === "processing") {
          void processBackgroundRemoval(item.id, item.originalFile)
        }
      }
    },
    [
      enableBackgroundRemoval,
      removeBackground,
      processBackgroundRemoval,
      updatePending,
    ]
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
      if (target) {
        URL.revokeObjectURL(target.originalUrl)
        if (target.processedUrl) URL.revokeObjectURL(target.processedUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const approveProcessed = (id: string) => {
    updatePending((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "ready", removeBackground: true }
          : item
      )
    )
  }

  const rejectProcessed = (id: string) => {
    updatePending((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl)
        return {
          ...item,
          processedFile: undefined,
          processedUrl: undefined,
          removeBackground: false,
          status: "ready",
          error: undefined,
        }
      })
    )
  }

  const retryProcessing = (id: string) => {
    const item = pending.find((entry) => entry.id === id)
    if (!item) return
    updatePending((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: "processing",
              error: undefined,
              removeBackground: true,
            }
          : entry
      )
    )
    void processBackgroundRemoval(id, item.originalFile)
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

  const reviewing = pending.filter((item) => item.status === "review")
  const processing = pending.filter((item) => item.status === "processing")
  const readyOrError = pending.filter(
    (item) => item.status === "ready" || item.status === "error"
  )

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

        {enableBackgroundRemoval ? (
          <label className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={removeBackground}
              onChange={(e) => setRemoveBackground(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input"
            />
            <span>
              <span className="font-medium text-[#351426]">
                Remove background from new images
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                We’ll process each image, show a preview, then you can approve or
                reject before it is uploaded.
              </span>
            </span>
          </label>
        ) : null}

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

        {processing.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <div className="flex items-center gap-2 font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Removing background…
            </div>
            <p className="mt-1 text-xs text-amber-900/80">
              First run may take longer while the model downloads. Please wait.
            </p>
          </div>
        ) : null}

        {reviewing.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-medium text-[#351426]">
              Review background removal · {item.originalFile.name}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Original
                </p>
                <div className="relative aspect-square overflow-hidden rounded-xl border border-rose-100 bg-rose-50">
                  <AppImage
                    src={item.originalUrl}
                    alt={`Original ${item.originalFile.name}`}
                    fill
                    sizes="240px"
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Background removed
                </p>
                <div
                  className="relative aspect-square overflow-hidden rounded-xl border border-rose-100"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #f1e4ea 25%, transparent 25%), linear-gradient(-45deg, #f1e4ea 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1e4ea 75%), linear-gradient(-45deg, transparent 75%, #f1e4ea 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                    backgroundColor: "#fff",
                  }}
                >
                  {item.processedUrl ? (
                    <AppImage
                      src={item.processedUrl}
                      alt={`Processed ${item.originalFile.name}`}
                      fill
                      sizes="240px"
                      className="object-contain"
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={() => approveProcessed(item.id)}>
                <Check className="mr-2 h-4 w-4" />
                Approve cutout
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => rejectProcessed(item.id)}
              >
                Reject — keep original
              </Button>
            </div>
          </div>
        ))}

        {readyOrError.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {readyOrError.map((item) => (
              <div
                key={item.id}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-rose-200 bg-rose-50 shadow-sm"
                style={
                  item.removeBackground && item.processedUrl
                    ? {
                        backgroundImage:
                          "linear-gradient(45deg, #f1e4ea 25%, transparent 25%), linear-gradient(-45deg, #f1e4ea 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1e4ea 75%), linear-gradient(-45deg, transparent 75%, #f1e4ea 75%)",
                        backgroundSize: "12px 12px",
                        backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
                        backgroundColor: "#fff",
                      }
                    : undefined
                }
              >
                <AppImage
                  src={
                    item.removeBackground && item.processedUrl
                      ? item.processedUrl
                      : item.originalUrl
                  }
                  alt={item.originalFile.name}
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
                {item.status === "error" ? (
                  <button
                    type="button"
                    onClick={() => retryProcessing(item.id)}
                    className="absolute inset-x-1 bottom-1 rounded bg-rose-700 px-1 py-0.5 text-[10px] font-medium text-white"
                  >
                    Retry
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
              {enableBackgroundRemoval && removeBackground
                ? " · background removal preview before upload"
                : " · uploaded as-is"}
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
