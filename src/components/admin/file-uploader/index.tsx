"use client"

import { useRef, useState } from "react"
import { FilePlus, X, Loader2, FileText } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { formatFileSize } from "@/lib/db/queries/designs"
import type { FileItem } from "@/lib/db/queries/designs"

const FORMAT_ICONS: Record<string, string> = {
  pdf: "📄",
  psd: "🎨",
  eps: "✏️",
  ai: "🖌️",
  png: "🖼️",
  jpg: "🖼️",
  zip: "📦",
}

interface Props {
  files: FileItem[]
  onChange: (files: FileItem[]) => void
}

export function FileUploader({ files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setUploading(true)

    for (const file of Array.from(fileList)) {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/uploads/files", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Error al subir archivo")
        continue
      }

      const data = await res.json()
      const newFile: FileItem = {
        storageKey: data.storageKey,
        originalFilename: data.originalFilename,
        displayName: data.originalFilename.replace(/\.[^/.]+$/, ""),
        fileFormat: data.fileFormat,
        mimeType: data.mimeType,
        fileSizeBytes: data.fileSizeBytes,
        displayOrder: files.length,
      }
      onChange([...files, newFile])
    }

    setUploading(false)
  }

  async function handleDelete(index: number) {
    const file = files[index]
    if (file.id) {
      const res = await fetch(`/api/admin/files/${file.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Error al eliminar archivo")
        return
      }
    }
    onChange(files.filter((_, i) => i !== index).map((f, i) => ({ ...f, displayOrder: i })))
  }

  function handleDisplayName(index: number, value: string) {
    onChange(files.map((f, i) => (i === index ? { ...f, displayName: value } : f)))
  }

  return (
    <div className="space-y-3">
      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {files.map((file, i) => (
            <div key={file.storageKey} className="flex items-center gap-3 p-3">
              <span className="text-xl" title={file.fileFormat ?? ""}>
                {FORMAT_ICONS[file.fileFormat ?? ""] ?? <FileText className="size-5" />}
              </span>

              <div className="flex-1 min-w-0">
                <Input
                  value={file.displayName ?? ""}
                  onChange={(e) => handleDisplayName(i, e.target.value)}
                  placeholder="Nombre del archivo"
                  className="h-7 text-sm"
                />
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {file.fileFormat?.toUpperCase()}
                  {file.fileSizeBytes ? ` · ${formatFileSize(file.fileSizeBytes)}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(i)}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </button>
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
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/60"
      >
        {uploading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <FilePlus className="size-5 text-muted-foreground" />
        )}
        <p className="text-sm font-medium text-foreground">
          {uploading ? "Subiendo..." : "Subir archivos"}
        </p>
        <p className="text-xs text-muted-foreground">PDF, PSD, EPS, AI, PNG, ZIP — máx. 200 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.psd,.eps,.ai,.png,.jpg,.jpeg,.zip"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
