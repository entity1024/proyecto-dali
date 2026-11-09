import { createHash } from "crypto"
import { createReadStream } from "fs"
import { stat } from "fs/promises"
import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/db/client"
import { getStorageProvider } from "@/lib/storage"
import { LocalStorageProvider } from "@/lib/storage/local"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params

  // 1. Buscar el archivo con su diseño
  const file = await prisma.designFile.findUnique({
    where: { id: fileId },
    include: {
      design: { select: { id: true, status: true } },
    },
  })

  if (!file || !file.isActive) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
  }

  if (file.design.status !== "published") {
    return NextResponse.json({ error: "Recurso no disponible" }, { status: 403 })
  }

  // 2. Hash del IP (privacidad — nunca almacenamos el IP raw)
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") ?? "unknown")
  const ipHash = createHash("sha256")
    .update(ip + (process.env.AUTH_SECRET ?? ""))
    .digest("hex")
    .slice(0, 64)

  // 3. Registrar descarga e incrementar contador — fire and forget
  void Promise.all([
    prisma.downloadLog.create({
      data: { designId: file.design.id, fileId: file.id, ipHash },
    }),
    prisma.design.update({
      where: { id: file.design.id },
      data: { downloadCount: { increment: 1 } },
    }),
  ]).catch(() => {
    // No bloquear la descarga si falla el log
  })

  const filename = encodeURIComponent(file.originalFilename)
  const contentType = file.mimeType ?? "application/octet-stream"
  const storage = getStorageProvider()

  // 4a. Storage local — streaming directo con Content-Disposition correcto
  if (storage instanceof LocalStorageProvider) {
    const localPath = storage.getLocalPath(file.storageKey)

    let fileSize: number | undefined
    try {
      const info = await stat(localPath)
      fileSize = info.size
    } catch {
      return NextResponse.json({ error: "Archivo no disponible en storage" }, { status: 404 })
    }

    const stream = createReadStream(localPath)
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk))
        stream.on("end", () => controller.close())
        stream.on("error", (err) => controller.error(err))
      },
    })

    return new Response(webStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        ...(fileSize ? { "Content-Length": String(fileSize) } : {}),
        "Cache-Control": "no-store",
      },
    })
  }

  // 4b. S3/MinIO — signed URL de corta duración (60 s) y redirect
  const signedUrl = await storage.getSignedUrl(file.storageKey, 60)
  return NextResponse.redirect(signedUrl)
}
