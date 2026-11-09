import Link from "next/link"
import { Suspense } from "react"
import { cacheLife } from "next/cache"
import { getPublicCategories } from "@/lib/db/queries/categories"

/**
 * Lista de categorías del pie. Va en su propio <Suspense> para no bloquear el prerender del layout
 * público (aviso "Blocking Route" de Cache Components, research R3).
 * Excepción documentada (research R10): si la consulta falla, la columna no se muestra.
 */
async function FooterCategories() {
  const categories = await getPublicCategories().catch(() => [])
  const activeCategories = categories.slice(0, 6)
  if (activeCategories.length === 0) return null

  return (
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
  )
}

/** Año actual cacheado: evita el aviso "blocking-prerender-current-time" de Cache Components. */
async function CopyrightYear() {
  "use cache"
  cacheLife("days")
  return <>{new Date().getFullYear()}</>
}

export function Footer() {
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
          <Suspense fallback={null}>
            <FooterCategories />
          </Suspense>

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
                  href="/#novedades"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Novedades
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © <CopyrightYear /> Plantillarte. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
