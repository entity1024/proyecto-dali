import { prisma } from "@/lib/db/client"
import { z } from "zod"

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const imageItemSchema = z.object({
  id: z.string().optional(),
  storageKey: z.string(),
  thumbnailKey: z.string().optional(),
  altText: z.string().optional(),
  isPrimary: z.boolean(),
  displayOrder: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  originalFilename: z.string().optional(),
  url: z.string().optional(),
  thumbnailUrl: z.string().optional(),
})

export const fileItemSchema = z.object({
  id: z.string().optional(),
  storageKey: z.string(),
  originalFilename: z.string(),
  displayName: z.string().optional(),
  fileFormat: z.string().optional(),
  mimeType: z.string().optional(),
  fileSizeBytes: z.number().optional(),
  displayOrder: z.number(),
})

export const designFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "La categoría es requerida"),
  status: z.enum(["draft", "published", "archived"]),
  tags: z.array(z.string()),
  images: z.array(imageItemSchema),
  files: z.array(fileItemSchema),
})

export type DesignFormInput = z.infer<typeof designFormSchema>
export type ImageItem = z.infer<typeof imageItemSchema>
export type FileItem = z.infer<typeof fileItemSchema>

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getPublishedDesigns({ take, categorySlug, search }: { take?: number; categorySlug?: string; search?: string } = {}) {
  return prisma.design.findMany({
    where: {
      status: "published",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    include: {
      category: { select: { name: true, slug: true } },
      images: {
        where: { isPrimary: true },
        select: { thumbnailKey: true, storageKey: true },
        take: 1,
      },
    },
  })
}

export function getRelatedDesigns(categoryId: string, excludeSlug: string, take = 4) {
  return prisma.design.findMany({
    where: { status: "published", categoryId, NOT: { slug: excludeSlug } },
    orderBy: { publishedAt: "desc" },
    take,
    include: {
      category: { select: { name: true, slug: true } },
      images: {
        where: { isPrimary: true },
        select: { thumbnailKey: true, storageKey: true },
        take: 1,
      },
    },
  })
}

export function getDesigns() {
  return prisma.design.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { images: true, files: true } },
      images: {
        where: { isPrimary: true },
        select: { thumbnailKey: true, storageKey: true },
        take: 1,
      },
    },
  })
}

export function getDesignById(id: string) {
  return prisma.design.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      files: { orderBy: { displayOrder: "asc" } },
    },
  })
}

export function getDesignBySlug(slug: string) {
  return prisma.design.findUnique({
    where: { slug, status: "published" },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      files: { where: { isActive: true }, orderBy: { displayOrder: "asc" } },
    },
  })
}

export async function createDesign(data: DesignFormInput) {
  const existing = await prisma.design.findUnique({ where: { slug: data.slug } })
  if (existing) throw new Error("Ya existe un diseño con ese slug")

  return prisma.design.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      status: data.status,
      tags: data.tags ?? [],
      publishedAt: data.status === "published" ? new Date() : null,
      images: {
        create: (data.images ?? []).map((img, i) => ({
          storageKey: img.storageKey,
          thumbnailKey: img.thumbnailKey,
          altText: img.altText,
          isPrimary: i === 0 ? true : img.isPrimary,
          displayOrder: img.displayOrder,
          width: img.width,
          height: img.height,
        })),
      },
      files: {
        create: (data.files ?? []).map((f, i) => ({
          storageKey: f.storageKey,
          originalFilename: f.originalFilename,
          displayName: f.displayName,
          fileFormat: f.fileFormat,
          mimeType: f.mimeType,
          fileSizeBytes: f.fileSizeBytes ? BigInt(f.fileSizeBytes) : null,
          displayOrder: i,
        })),
      },
    },
  })
}

export async function updateDesign(id: string, data: DesignFormInput) {
  const existing = await prisma.design.findFirst({
    where: { slug: data.slug, NOT: { id } },
  })
  if (existing) throw new Error("Ya existe un diseño con ese slug")

  const current = await prisma.design.findUnique({
    where: { id },
    select: { status: true, publishedAt: true },
  })

  const wasPublished = current?.status === "published"
  const isNowPublished = data.status === "published"

  // IDs que deben quedar según el formulario
  const keepImageIds = (data.images ?? []).filter((i) => i.id).map((i) => i.id!)
  const keepFileIds = (data.files ?? []).filter((f) => f.id).map((f) => f.id!)

  return prisma.$transaction(async (tx) => {
    // Eliminar imágenes que ya no están
    await tx.designImage.deleteMany({
      where: { designId: id, id: { notIn: keepImageIds } },
    })

    // Eliminar archivos que ya no están
    await tx.designFile.deleteMany({
      where: { designId: id, id: { notIn: keepFileIds } },
    })

    // Actualizar imágenes existentes
    for (const img of (data.images ?? []).filter((i) => i.id)) {
      await tx.designImage.update({
        where: { id: img.id },
        data: {
          altText: img.altText,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
        },
      })
    }

    // Crear nuevas imágenes
    for (const img of (data.images ?? []).filter((i) => !i.id)) {
      await tx.designImage.create({
        data: {
          designId: id,
          storageKey: img.storageKey,
          thumbnailKey: img.thumbnailKey,
          altText: img.altText,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
          width: img.width,
          height: img.height,
        },
      })
    }

    // Actualizar archivos existentes
    for (const f of (data.files ?? []).filter((f) => f.id)) {
      await tx.designFile.update({
        where: { id: f.id },
        data: { displayName: f.displayName, displayOrder: f.displayOrder },
      })
    }

    // Crear nuevos archivos
    for (const f of (data.files ?? []).filter((f) => !f.id)) {
      await tx.designFile.create({
        data: {
          designId: id,
          storageKey: f.storageKey,
          originalFilename: f.originalFilename,
          displayName: f.displayName,
          fileFormat: f.fileFormat,
          mimeType: f.mimeType,
          fileSizeBytes: f.fileSizeBytes ? BigInt(f.fileSizeBytes) : null,
          displayOrder: f.displayOrder,
        },
      })
    }

    return tx.design.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        status: data.status,
        tags: data.tags ?? [],
        publishedAt: isNowPublished && !wasPublished ? new Date() : undefined,
      },
    })
  })
}

export async function deleteDesign(id: string) {
  return prisma.design.delete({ where: { id } })
}

export function toggleDesignStatus(id: string, status: "draft" | "published" | "archived") {
  return prisma.design.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "published" ? new Date() : undefined,
    },
  })
}

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

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
