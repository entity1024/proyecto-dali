import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { getContentType } from "@/lib/storage/utils"

// Solo activo cuando STORAGE_PROVIDER=local
// Para S3/MinIO los archivos se sirven directamente desde el proveedor

// Solo se sirven públicamente las imágenes de previsualización.
// Los descargables (`downloads/`) pasan SIEMPRE por /api/downloads/[fileId],
// que valida que el diseño esté publicado y registra la descarga.
const PUBLIC_PREFIXES = ["previews", "thumbnails"]

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  if (process.env.STORAGE_PROVIDER !== "local" && process.env.STORAGE_PROVIDER) {
    return NextResponse.json({ error: "Not available" }, { status: 404 })
  }

  const { key } = await params

  // 404 (no 403) para no revelar qué existe fuera de las carpetas públicas
  if (!PUBLIC_PREFIXES.includes(key[0])) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const resolvedBase = path.resolve(process.env.STORAGE_LOCAL_PATH ?? "./storage")
  const resolved = path.resolve(resolvedBase, ...key)

  // Prevenir path traversal: el archivo tiene que quedar DENTRO de una carpeta pública.
  // Se compara con el separador final para que `storage-backup/` o `previews-x/`
  // no pasen el chequeo por compartir prefijo de texto.
  const allowed = PUBLIC_PREFIXES.some((prefix) =>
    resolved.startsWith(path.join(resolvedBase, prefix) + path.sep)
  )
  if (!allowed) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  try {
    const buffer = await fs.readFile(resolved)
    const ext = path.extname(resolved)
    const contentType = getContentType(ext)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
