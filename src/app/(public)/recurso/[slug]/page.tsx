import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Download, ChevronRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getDesignBySlug } from "@/lib/db/queries/designs"
import { getStorageProvider } from "@/lib/storage"
import { formatFileSize } from "@/lib/db/queries/designs"
import { RelatedDesigns } from "@/components/public/related-designs"
import { ImageGallery } from "./image-gallery"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const design = await getDesignBySlug(slug)
  if (!design) return { title: "Recurso no encontrado" }

  return {
    title: design.name,
    description: design.description ?? undefined,
    openGraph: {
      title: design.name,
      description: design.description ?? undefined,
    },
  }
}

const FORMAT_ICONS: Record<string, string> = {
  pdf: "📄",
  psd: "🎨",
  eps: "✏️",
  ai: "🖌️",
  png: "🖼️",
  jpg: "🖼️",
  zip: "📦",
}

export default async function RecursoPage({ params }: Props) {
  const { slug } = await params
  const design = await getDesignBySlug(slug)

  if (!design) notFound()

  const storage = getStorageProvider()

  const images = design.images.map((img) => ({
    url: storage.getPublicUrl(img.storageKey),
    thumbnailUrl: img.thumbnailKey ? storage.getPublicUrl(img.thumbnailKey) : storage.getPublicUrl(img.storageKey),
    altText: img.altText ?? design.name,
  }))

  const tags = design.tags as string[]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/catalogo" className="hover:text-foreground">Catálogo</Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/catalogo?categoria=${design.category.slug}`}
          className="hover:text-foreground"
        >
          {design.category.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground font-medium">{design.name}</span>
      </nav>

      {/* Layout principal */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Galería */}
        <ImageGallery images={images} name={design.name} />

        {/* Info + descargas */}
        <div className="flex flex-col gap-6">
          {/* Categoría */}
          <Badge variant="secondary" className="w-fit" asChild>
            <Link href={`/catalogo?categoria=${design.category.slug}`}>
              {design.category.name}
            </Link>
          </Badge>

          {/* Nombre */}
          <div>
            <h1 className="text-3xl font-bold leading-tight">{design.name}</h1>
            {design.downloadCount > 0 && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {design.downloadCount.toLocaleString("es-AR")} descarga{design.downloadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Descripción */}
          {design.description && (
            <p className="text-muted-foreground leading-relaxed">{design.description}</p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/catalogo?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border px-3 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Archivos descargables */}
          {design.files.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Archivos incluidos</h2>

              {design.files.length === 1 ? (
                // Un solo archivo — botón grande
                <Button size="lg" className="w-full" asChild>
                  <a href={`/api/downloads/${design.files[0].id}`}>
                    <Download className="mr-2 size-4" />
                    Descargar{" "}
                    {design.files[0].fileFormat?.toUpperCase() ?? "archivo"}
                    {design.files[0].fileSizeBytes
                      ? ` · ${formatFileSize(Number(design.files[0].fileSizeBytes))}`
                      : ""}
                  </a>
                </Button>
              ) : (
                // Múltiples archivos — lista
                <div className="divide-y divide-border rounded-lg border border-border">
                  {design.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3">
                      <span className="text-xl shrink-0">
                        {FORMAT_ICONS[file.fileFormat ?? ""] ?? <FileText className="size-5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {file.displayName || file.originalFilename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.fileFormat?.toUpperCase()}
                          {file.fileSizeBytes
                            ? ` · ${formatFileSize(Number(file.fileSizeBytes))}`
                            : ""}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/api/downloads/${file.id}`}>
                          <Download className="mr-1.5 size-3.5" />
                          Descargar
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {design.files.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Este recurso aún no tiene archivos disponibles para descargar.
            </p>
          )}
        </div>
      </div>

      {/* Recursos relacionados */}
      <div className="mt-16">
        <RelatedDesigns
          categoryId={design.categoryId}
          excludeSlug={design.slug}
          categoryName={design.category.name}
        />
      </div>
    </div>
  )
}
