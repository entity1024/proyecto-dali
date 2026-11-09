import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getStorageProvider } from "@/lib/storage"
import { prisma } from "@/lib/db/client"

// DELETE /api/admin/files/[fileId]
// Elimina un DesignFile de la BD y su archivo del storage
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { fileId } = await params
  const storage = getStorageProvider()

  const file = await prisma.designFile.findUnique({ where: { id: fileId } })
  if (!file) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
  }

  await storage.delete(file.storageKey)
  await prisma.designFile.delete({ where: { id: fileId } })

  return NextResponse.json({ ok: true })
}
