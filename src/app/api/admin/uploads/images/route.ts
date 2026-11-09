import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { auth } from "@/lib/auth/config"
import { getStorageProvider } from "@/lib/storage"
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  generateImageKey,
  generateThumbnailKey,
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
  if (!ALLOWED_IMAGE_MIME_TYPES[file.type]) {
    return NextResponse.json(
      { error: `Tipo de archivo no permitido: ${file.type}` },
      { status: 422 }
    )
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "La imagen no puede superar 10 MB" },
      { status: 422 }
    )
  }

  // ─── Procesar con Sharp ───────────────────────────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer())

  const metadata = await sharp(buffer).metadata()
  const { width = 0, height = 0 } = metadata

  // Thumbnail 480×360 WebP (mantiene aspect ratio)
  const thumbnailBuffer = await sharp(buffer)
    .resize(480, 360, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer()

  // ─── Subir al storage ─────────────────────────────────────────────────────
  const storageKey = generateImageKey(file.name)
  const thumbnailKey = generateThumbnailKey(storageKey)
  const storage = getStorageProvider()

  await Promise.all([
    storage.upload(storageKey, buffer, { contentType: file.type, public: true }),
    storage.upload(thumbnailKey, thumbnailBuffer, { contentType: "image/webp", public: true }),
  ])

  return NextResponse.json({
    storageKey,
    thumbnailKey,
    url: storage.getPublicUrl(storageKey),
    thumbnailUrl: storage.getPublicUrl(thumbnailKey),
    width,
    height,
    originalFilename: file.name,
  })
}
