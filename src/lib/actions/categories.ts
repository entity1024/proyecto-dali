"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth/config"
import {
  categorySchema,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  type CategoryInput,
} from "@/lib/db/queries/categories"

function requireAdmin() {
  return auth().then((session) => {
    if (!session?.user) throw new Error("No autorizado")
  })
}

export async function createCategoryAction(data: CategoryInput) {
  await requireAdmin()
  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    await createCategory(parsed.data)
    revalidatePath("/admin/categorias")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear categoría" }
  }
}

export async function updateCategoryAction(id: string, data: CategoryInput) {
  await requireAdmin()
  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    await updateCategory(id, parsed.data)
    revalidatePath("/admin/categorias")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar categoría" }
  }
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin()
  try {
    await deleteCategory(id)
    revalidatePath("/admin/categorias")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al eliminar categoría" }
  }
}

export async function toggleCategoryAction(id: string, isActive: boolean) {
  await requireAdmin()
  try {
    await toggleCategoryActive(id, isActive)
    revalidatePath("/admin/categorias")
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar categoría" }
  }
}
