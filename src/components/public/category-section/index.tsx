import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getCategories } from "@/lib/db/queries/categories"

const STAGGER_DELAYS = [0, 50, 100, 150, 200, 250, 300, 350]

export async function CategorySection() {
  const categories = await getCategories()
  const active = categories.filter((c) => c.isActive)

  if (active.length === 0) return null

  return (
    <section id="categorias" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="animate-fade-up delay-0 mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Categorías</h2>
            <p className="mt-1 text-muted-foreground">Explorá por tipo de recurso</p>
          </div>
          <Link
            href="/catalogo"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todo <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {active.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="animate-fade-up group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/40 hover:shadow-md"
              style={{ animationDelay: `${STAGGER_DELAYS[i] ?? i * 50}ms` }}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl transition-transform group-hover:scale-110">
                {getCategoryEmoji(cat.slug)}
              </div>
              <div>
                <p className="font-semibold text-sm">{cat.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cat._count.designs} recurso{cat._count.designs !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    calendarios: "📅",
    "tipografias-y-alfabetos": "🔤",
    "material-escolar": "📚",
    banners: "🖼️",
    posters: "🎨",
    invitaciones: "💌",
    "papeleria-digital": "📄",
    etiquetas: "🏷️",
    marcos: "🖼️",
    fondos: "🌄",
    patrones: "🔷",
    iconos: "✨",
  }
  return map[slug] ?? "📁"
}
