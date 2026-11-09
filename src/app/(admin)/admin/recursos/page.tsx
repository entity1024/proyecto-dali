import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDesigns } from "@/lib/db/queries/designs"
import { getStorageProvider } from "@/lib/storage"
import { RecursosClient } from "./recursos-client"

export const metadata: Metadata = {
  title: "Recursos — Admin",
}

export default async function AdminRecursosPage() {
  const designs = await getDesigns()
  const storage = getStorageProvider()

  // Enriquecer con URLs de thumbnails para preview en tabla
  const rows = designs.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    status: d.status,
    category: d.category.name,
    categorySlug: d.category.slug,
    imagesCount: d._count.images,
    filesCount: d._count.files,
    downloadCount: d.downloadCount,
    publishedAt: d.publishedAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    thumbnailUrl: d.images[0]?.thumbnailKey
      ? storage.getPublicUrl(d.images[0].thumbnailKey)
      : d.images[0]?.storageKey
        ? storage.getPublicUrl(d.images[0].storageKey)
        : null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recursos</h1>
          <p className="text-sm text-muted-foreground">
            {designs.length} diseño{designs.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/recursos/nuevo">
            <Plus className="mr-2 size-4" />
            Nuevo recurso
          </Link>
        </Button>
      </div>

      <RecursosClient rows={rows} />
    </div>
  )
}
