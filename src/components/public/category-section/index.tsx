import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getPublicCategories } from "@/lib/db/queries/categories"
import { CategoryIcon } from "@/components/public/category-icon"

const STAGGER_DELAYS = [0, 50, 100, 150, 200, 250, 300, 350]

/** Layout compartido con el skeleton: fila con scroll interno en móvil, grilla desde `sm`. */
export const categoryListClass =
  "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6"
export const categoryItemClass =
  "w-28 shrink-0 snap-start sm:w-auto"

export async function CategorySection() {
  const categories = await getPublicCategories()

  return (
    <section id="categorias" className="scroll-mt-20 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="animate-fade-up delay-0 mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Categorías</h2>
            <p className="mt-1 text-muted-foreground">Explorá por tipo de recurso</p>
          </div>
          <Link
            href="/catalogo"
            className="flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todos <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">Todavía no hay categorías disponibles</p>
            <Link href="/catalogo" className="flex min-h-11 items-center text-sm font-medium text-primary hover:underline">
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <ul className={categoryListClass}>
            {categories.map((cat, i) => {
              const count = cat._count.designs
              return (
                <li key={cat.id} className={categoryItemClass}>
                  <Link
                    href={`/catalogo?categoria=${cat.slug}`}
                    className="animate-fade-up group flex h-full min-h-11 flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    style={{ animationDelay: `${STAGGER_DELAYS[i] ?? i * 50}ms` }}
                  >
                    <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 motion-reduce:transform-none">
                      <CategoryIcon slug={cat.slug} className="size-6" />
                    </span>
                    <span className="line-clamp-2 break-words text-sm font-semibold">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {count} recurso{count !== 1 ? "s" : ""}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
