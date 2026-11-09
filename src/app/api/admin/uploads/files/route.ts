import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getStorageProvider } from "@/lib/storage"
import {
  ALLOWED_FILE_MIME_TYPES,
  MAX_FILE_SIZE,
  generateFileKey,
  detectFileFormat,
} from "@/lib/storage/utils"

export async function POST(req: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // ─── Parse multipart ─────────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Request inválido" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'file' requerido" }, { status: 400 })
  }

  // ─── Validaciones ────────────────────────────────────────────────────────
  if (!ALLOWED_FILE_MIME_TYPES[file.type]) {
    // Algunos formatos (PSD, AI) tienen MIME types no estándar según el OS
    // Permitimos application/octet-stream si la extensión está en la lista
    const ext = file.name.split(".").pop()?.toLowerCase()
    const allowedExtensions = ["pdf", "psd", "eps", "ai", "png", "jpg", "jpeg", "zip"]
    if (!ext || !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}` },
        { status: 422 }
      )
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "El archivo no puede superar 200 MB" },
      { status: 422 }
    )
  }

  // ─── Subir al storage ─────────────────────────────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer())
  const storageKey = generateFileKey(file.name)
  const storage = getStorageProvider()

  await storage.upload(storageKey, buffer, {
    contentType: file.type || "application/octet-stream",
    public: false,
  })

  return NextResponse.json({
    storageKey,
    originalFilename: file.name,
    fileFormat: detectFileFormat(file.type, file.name),
    mimeType: file.type,
    fileSizeBytes: file.size,
  })
}
