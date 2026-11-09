import Link from "next/link"
import { getPublicCategories } from "@/lib/db/queries/categories"
import { CategoryIcon } from "@/components/public/category-icon"

const STAGGER_DELAYS = [0, 50, 100, 150, 200, 250, 300, 350]

/**
 * Layout compartido con el skeleton: una sola fila con scroll propio en todos los anchos (002 FR-012).
 * Ancho fijo por elemento: si no entran todas, la última queda cortada y eso indica que hay más (research R2).
 */
export const categoryListClass =
  "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-1 scrollbar-hide sm:-mx-6 sm:scroll-px-6 sm:gap-3 sm:px-6"
export const categoryItemClass =
  "w-26 shrink-0 snap-start sm:w-28"

export async function CategorySection() {
  const categories = await getPublicCategories()

  return (
    <section id="categorias" className="scroll-mt-20 py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="animate-fade-up delay-0 mb-4">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Categorías</h2>
          <p className="mt-1 text-sm text-muted-foreground">Explorá por tipo de recurso</p>
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
                    className="animate-fade-up group flex h-full min-h-11 flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
                    style={{ animationDelay: `${STAGGER_DELAYS[i] ?? i * 50}ms` }}
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 motion-reduce:transform-none sm:size-14">
                      <CategoryIcon slug={cat.slug} className="size-5 sm:size-6" />
                    </span>
                    {/* min-h-10 = 2 líneas siempre: todos los elementos miden igual y el skeleton coincide (sin CLS). */}
                    <span className="line-clamp-2 min-h-10 break-words text-sm font-semibold">{cat.name}</span>
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
