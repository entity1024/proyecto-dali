import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getPublishedDesigns } from "@/lib/db/queries/designs"
import { getStorageProvider } from "@/lib/storage"
import { toDesignCardData } from "@/lib/presenters/design-card"
import { DesignGrid } from "@/components/public/design-grid"

const RECENT_LIMIT = 8

export async function RecentDesigns() {
  const raw = await getPublishedDesigns({ take: RECENT_LIMIT })
  const storage = getStorageProvider()
  const designs = raw.map((d) => toDesignCardData(d, storage))

  return (
    <section id="novedades" className="scroll-mt-20 bg-muted/30 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="animate-fade-up mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Novedades</h2>
            <p className="mt-1 text-muted-foreground">Los últimos recursos publicados</p>
          </div>
          {designs.length > 0 && (
            <Link
              href="/catalogo"
              className="flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {designs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">Todavía no hay recursos publicados</p>
            <Link href="/catalogo" className="flex min-h-11 items-center text-sm font-medium text-primary hover:underline">
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <DesignGrid designs={designs} stagger />
        )}
      </div>
    </section>
  )
}
