import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getStorageProvider } from "@/lib/storage"
import { prisma } from "@/lib/db/client"

// DELETE /api/admin/images/[imageId]
// Elimina un DesignImage de la BD y sus archivos del storage (original + thumbnail)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { imageId } = await params
  const storage = getStorageProvider()

  const image = await prisma.designImage.findUnique({ where: { id: imageId } })
  if (!image) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
  }

  await Promise.all([
    storage.delete(image.storageKey),
    image.thumbnailKey ? storage.delete(image.thumbnailKey) : Promise.resolve(),
  ])

  await prisma.designImage.delete({ where: { id: imageId } })

  return NextResponse.json({ ok: true })
}
