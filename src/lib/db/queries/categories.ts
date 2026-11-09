import { prisma } from "@/lib/db/client"
import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
})

export type CategoryInput = z.infer<typeof categorySchema>

export function getCategories() {
  return prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { designs: true } } },
  })
}

/**
 * Categorías para el sitio público: solo activas, con la cantidad de recursos **publicados**.
 * No reemplaza a `getCategories()`, que usa el panel admin y cuenta todos los estados.
 */
export function getPublicCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { designs: { where: { status: "published" } } } },
    },
  })
}

export type PublicCategory = Awaited<ReturnType<typeof getPublicCategories>>[number]

export function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } })
}

export async function createCategory(data: CategoryInput) {
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } })
  if (existing) throw new Error("Ya existe una categoría con ese slug")
  return prisma.category.create({ data })
}

export async function updateCategory(id: string, data: CategoryInput) {
  const existing = await prisma.category.findFirst({
    where: { slug: data.slug, NOT: { id } },
  })
  if (existing) throw new Error("Ya existe una categoría con ese slug")
  return prisma.category.update({ where: { id }, data })
}

export async function deleteCategory(id: string) {
  const count = await prisma.design.count({ where: { categoryId: id } })
  if (count > 0) {
    throw new Error(`No se puede eliminar: tiene ${count} diseño(s) asociado(s)`)
  }
  return prisma.category.delete({ where: { id } })
}

export function toggleCategoryActive(id: string, isActive: boolean) {
  return prisma.category.update({ where: { id }, data: { isActive } })
}

/** Genera un slug a partir del nombre */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
