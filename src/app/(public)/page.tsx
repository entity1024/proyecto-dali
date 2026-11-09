import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Hero } from "@/components/public/hero"
import { CategorySection } from "@/components/public/category-section"
import { DesignGrid } from "@/components/public/design-grid"
import { getPublishedDesigns } from "@/lib/db/queries/designs"
import { getStorageProvider } from "@/lib/storage"

export const metadata: Metadata = {
  title: "Plantillarte — Recursos Gráficos Digitales",
}

export default async function HomePage() {
  const rawDesigns = await getPublishedDesigns({ take: 8 })
  const storage = getStorageProvider()

  const designs = rawDesigns.map((d) => ({
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
    <>
      <Hero />

      <CategorySection />

      {/* Novedades */}
      {designs.length > 0 && (
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="animate-fade-up mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Novedades</h2>
                <p className="mt-1 text-muted-foreground">Los últimos recursos publicados</p>
              </div>
              <Link
                href="/catalogo"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver todos <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <DesignGrid designs={designs} stagger />
          </div>
        </section>
      )}
    </>
  )
}
