import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getPublishedDesigns } from "@/lib/db/queries/designs"
import { getCategories } from "@/lib/db/queries/categories"
import { getStorageProvider } from "@/lib/storage"
import { DesignGrid } from "@/components/public/design-grid"
import { CategoryBar } from "@/components/public/category-bar"
import { SearchBar } from "@/components/public/search-bar"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Catálogo",
}

const PAGE_SIZE = 12

interface PageProps {
  searchParams: Promise<{ categoria?: string; q?: string; pagina?: string }>
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const { categoria, q, pagina } = await searchParams
  const page = Math.max(1, parseInt(pagina ?? "1", 10))

  const [allDesigns, categories] = await Promise.all([
    getPublishedDesigns({ categorySlug: categoria, search: q }),
    getCategories(),
  ])

  const storage = getStorageProvider()
  const activeCategories = categories.filter((c) => c.isActive)

  const total = allDesigns.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const paginatedDesigns = allDesigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const designs = paginatedDesigns.map((d) => ({
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

  // Construir URL de paginación preservando filtros
  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (categoria) params.set("categoria", categoria)
    if (q) params.set("q", q)
    if (p > 1) params.set("pagina", String(p))
    const qs = params.toString()
    return `/catalogo${qs ? `?${qs}` : ""}`
  }

  const hasFilters = !!(categoria || q)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
        <p className="mt-1 text-muted-foreground">
          {total === 0
            ? "No se encontraron recursos"
            : `${total} recurso${total !== 1 ? "s" : ""}${hasFilters ? " encontrados" : ""}`}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-3">
        <Suspense fallback={<div className="h-9" />}>
          <SearchBar />
        </Suspense>
        <Suspense fallback={<div className="h-9" />}>
          <CategoryBar categories={activeCategories} />
        </Suspense>
      </div>

      {/* Grid */}
      <DesignGrid
        designs={designs}
        emptyMessage={
          hasFilters
            ? "No hay recursos que coincidan con tu búsqueda"
            : "Todavía no hay recursos publicados"
        }
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Paginación">
          <Link
            href={pageHref(page - 1)}
            aria-disabled={page <= 1}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border border-border text-sm transition-colors",
              page <= 1
                ? "pointer-events-none opacity-40"
                : "hover:border-primary/40 hover:text-primary"
            )}
          >
            <ChevronLeft className="size-4" />
          </Link>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                p === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/40 hover:text-primary"
              )}
            >
              {p}
            </Link>
          ))}

          <Link
            href={pageHref(page + 1)}
            aria-disabled={page >= totalPages}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border border-border text-sm transition-colors",
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : "hover:border-primary/40 hover:text-primary"
            )}
          >
            <ChevronRight className="size-4" />
          </Link>
        </nav>
      )}
    </div>
  )
}
