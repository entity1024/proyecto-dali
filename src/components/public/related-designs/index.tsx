import { DesignGrid } from "@/components/public/design-grid"
import { getRelatedDesigns } from "@/lib/db/queries/designs"
import { getStorageProvider } from "@/lib/storage"

interface Props {
  categoryId: string
  excludeSlug: string
  categoryName: string
}

export async function RelatedDesigns({ categoryId, excludeSlug, categoryName }: Props) {
  const raw = await getRelatedDesigns(categoryId, excludeSlug)
  if (raw.length === 0) return null

  const storage = getStorageProvider()
  const designs = raw.map((d) => ({
    slug: d.slug,
    name: d.name,
    categoryName: d.category.name,
    categorySlug: d.category.slug,
    thumbnailUrl: d.images[0]?.thumbnailKey
      ? storage.getPublicUrl(d.images[0].thumbnailKey)
      : d.images[0]?.storageKey
        ? storage.getPublicUrl(d.images[0].storageKey)
        : null,
  }))

  return (
    <section className="border-t border-border pt-12">
      <h2 className="mb-6 text-xl font-bold">Más de {categoryName}</h2>
      <DesignGrid designs={designs} />
    </section>
  )
}
