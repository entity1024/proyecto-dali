"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/config"
import { getStorageProvider } from "@/lib/storage"
import {
  designFormSchema,
  createDesign,
  updateDesign,
  deleteDesign,
  toggleDesignStatus,
  getDesignById,
  type DesignFormInput,
} from "@/lib/db/queries/designs"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error("No autorizado")
}

export async function createDesignAction(data: DesignFormInput) {
  await requireAdmin()
  const parsed = designFormSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const design = await createDesign(parsed.data)
    revalidatePath("/admin/recursos")
    revalidatePath("/")
    return { ok: true, id: design.id }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear el diseño" }
  }
}

export async function updateDesignAction(id: string, data: DesignFormInput) {
  await requireAdmin()
  const parsed = designFormSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    await updateDesign(id, parsed.data)
    revalidatePath("/admin/recursos")
    revalidatePath(`/recurso/${parsed.data.slug}`)
    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar el diseño" }
  }
}

export async function deleteDesignAction(id: string) {
  await requireAdmin()
  const storage = getStorageProvider()

  try {
    const design = await getDesignById(id)
    if (!design) return { error: "Diseño no encontrado" }

    // Eliminar archivos del storage
    const deleteOps = [
      ...design.images.flatMap((img) =>
        [img.storageKey, img.thumbnailKey].filter(Boolean).map((k) => storage.delete(k!))
      ),
      ...design.files.map((f) => storage.delete(f.storageKey)),
    ]
    await Promise.allSettled(deleteOps)

    await deleteDesign(id)
    revalidatePath("/admin/recursos")
    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al eliminar el diseño" }
  }
}

export async function toggleDesignStatusAction(
  id: string,
  status: "draft" | "published" | "archived"
) {
  await requireAdmin()
  try {
    await toggleDesignStatus(id, status)
    revalidatePath("/admin/recursos")
    revalidatePath("/")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al cambiar el estado" }
  }
}
