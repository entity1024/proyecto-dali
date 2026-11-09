import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDesignById } from "@/lib/db/queries/designs"
import { getCategories } from "@/lib/db/queries/categories"
import { getStorageProvider } from "@/lib/storage"
import { DesignForm } from "@/components/admin/design-form"

export const metadata: Metadata = {
  title: "Editar Recurso — Admin",
}

export default async function EditarRecursoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [design, categories] = await Promise.all([
    getDesignById(id),
    getCategories(),
  ])

  if (!design) notFound()

  const storage = getStorageProvider()

  // Enriquecer imágenes con URLs públicas para previsualización
  const images = design.images.map((img) => ({
    id: img.id,
    storageKey: img.storageKey,
    thumbnailKey: img.thumbnailKey ?? undefined,
    altText: img.altText ?? undefined,
    isPrimary: img.isPrimary,
    displayOrder: img.displayOrder,
    width: img.width ?? undefined,
    height: img.height ?? undefined,
    url: storage.getPublicUrl(img.storageKey),
    thumbnailUrl: img.thumbnailKey ? storage.getPublicUrl(img.thumbnailKey) : undefined,
  }))

  const files = design.files.map((f) => ({
    id: f.id,
    storageKey: f.storageKey,
    originalFilename: f.originalFilename,
    displayName: f.displayName ?? undefined,
    fileFormat: f.fileFormat ?? undefined,
    mimeType: f.mimeType ?? undefined,
    fileSizeBytes: f.fileSizeBytes ? Number(f.fileSizeBytes) : undefined,
    displayOrder: f.displayOrder,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/recursos">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar recurso</h1>
          <p className="text-sm text-muted-foreground">{design.name}</p>
        </div>
      </div>

      <DesignForm
        designId={design.id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultValues={{
          name: design.name,
          slug: design.slug,
          description: design.description ?? undefined,
          categoryId: design.categoryId,
          status: design.status as "draft" | "published" | "archived",
          tags: design.tags as string[],
          images,
          files,
        }}
      />
    </div>
  )
}
