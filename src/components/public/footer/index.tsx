import Link from "next/link"
import { getCategories } from "@/lib/db/queries/categories"

export async function Footer() {
  const categories = await getCategories().catch(() => [])
  const activeCategories = categories.filter((c) => c.isActive).slice(0, 6)

  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Marca */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <span className="text-lg font-bold text-primary">Plantillarte</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Recursos gráficos digitales gratuitos: calendarios, tipografías, posters,
              invitaciones y plantillas editables.
            </p>
          </div>

          {/* Categorías */}
          {activeCategories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Categorías
              </h3>
              <ul className="space-y-2">
                {activeCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/catalogo?categoria=${cat.slug}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Explorar
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/catalogo"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Todos los recursos
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Novedades
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Plantillarte. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
