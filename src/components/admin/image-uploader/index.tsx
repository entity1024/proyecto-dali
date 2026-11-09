"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, X, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ImageItem } from "@/lib/db/queries/designs"

interface Props {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
}

export function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/uploads/images", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Error al subir imagen")
        continue
      }

      const data = await res.json()
      const newImage: ImageItem = {
        storageKey: data.storageKey,
        thumbnailKey: data.thumbnailKey,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        isPrimary: images.length === 0, // primera imagen es primary por defecto
        displayOrder: images.length,
        width: data.width,
        height: data.height,
        originalFilename: data.originalFilename,
      }
      onChange([...images, newImage])
    }

    setUploading(false)
  }

  async function handleDelete(index: number) {
    const img = images[index]
    // Si ya tiene ID de BD, eliminar via API
    if (img.id) {
      const res = await fetch(`/api/admin/images/${img.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Error al eliminar imagen")
        return
      }
    }
    const updated = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      displayOrder: i,
      isPrimary: i === 0 ? true : img.isPrimary,
    }))
    onChange(updated)
  }

  function handleSetPrimary(index: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })))
  }

  return (
    <div className="space-y-3">
      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.storageKey}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-muted",
                img.isPrimary ? "border-primary" : "border-border"
              )}
            >
              <Image
                src={img.thumbnailUrl ?? img.url ?? ""}
                alt={img.altText ?? ""}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 25vw"
              />

              {/* Badge principal */}
              {img.isPrimary && (
                <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Principal
                </span>
              )}

              {/* Acciones hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(i)}
                    className="rounded-full bg-white/90 p-1.5 text-amber-500 hover:bg-white"
                    title="Marcar como principal"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="rounded-full bg-white/90 p-1.5 text-destructive hover:bg-white"
                  title="Eliminar"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/60"
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="size-6 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Subiendo..." : "Subir imágenes"}
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP — máx. 10 MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
