// Módulo: URL del catálogo — única fuente de verdad para armar `/catalogo?...`
// Contrato: specs/001-home-redesign/contracts/ui-navigation.md §2

const CATALOG_PATH = "/catalogo"

interface CatalogHrefInput {
  /** Término de búsqueda. Se recorta; si queda vacío se omite. */
  q?: string | null
  /** Slug de categoría. Si está vacío se omite. */
  categoria?: string | null
  /** Parámetros actuales a conservar. Siempre se elimina `pagina`. */
  base?: URLSearchParams | string
}

export function buildCatalogHref({ q, categoria, base }: CatalogHrefInput = {}): string {
  const params = new URLSearchParams(base ? base.toString() : undefined)
  params.delete("pagina")

  const term = q?.trim() ?? ""
  if (term) params.set("q", term)
  else params.delete("q")

  if (categoria !== undefined) {
    if (categoria) params.set("categoria", categoria)
    else params.delete("categoria")
  }

  const qs = params.toString()
  return qs ? `${CATALOG_PATH}?${qs}` : CATALOG_PATH
}
