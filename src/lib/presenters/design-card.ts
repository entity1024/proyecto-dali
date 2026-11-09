import type { StorageProvider } from "@/lib/storage"

// Módulo: Presenter — convierte un diseño de las consultas públicas en los datos de su tarjeta.
// Única fuente de verdad para la regla "miniatura → imagen original → sin imagen".

export type DesignCardData = {
  slug: string
  name: string
  categoryName: string
  categorySlug: string
  thumbnailUrl: string | null
}

type DesignForCard = {
  slug: string
  name: string
  category: { name: string; slug: string }
  images: { thumbnailKey: string | null; storageKey: string }[]
}

export function toDesignCardData(design: DesignForCard, storage: StorageProvider): DesignCardData {
  const image = design.images[0]
  const key = image?.thumbnailKey || image?.storageKey

  return {
    slug: design.slug,
    name: design.name,
    categoryName: design.category.name,
    categorySlug: design.category.slug,
    thumbnailUrl: key ? storage.getPublicUrl(key) : null,
  }
}
