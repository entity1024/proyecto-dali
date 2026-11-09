# Contrato UI: navegación de la portada

**Feature**: `002-home-category-discovery` · **Fecha**: 2026-11-09
**Base**: [`specs/001-home-redesign/contracts/ui-navigation.md`](../../001-home-redesign/contracts/ui-navigation.md), que sigue vigente.
Este documento lista solo lo que la portada expone y lo que cambia.

## 1. Rutas y formato de URL: SIN CAMBIOS

| Interacción | Destino | Cómo se arma |
|---|---|---|
| Buscar desde el hero | `/catalogo?q={término recortado}` o `/catalogo` si el término queda vacío | `buildCatalogHref({ q })` (`src/lib/catalog-url.ts`) |
| Elegir una categoría | `/catalogo?categoria={slug}` | Mismo formato que hoy usan la portada y el footer |
| Elegir una tarjeta de novedades | `/recurso/{slug}` | `DesignCard` (sin cambios) |
| "Ver todo el catálogo" (novedades) | `/catalogo` | Enlace fijo |
| Footer → "Novedades" | `/#novedades` | Se conserva el `id="novedades"` de la sección |

No se agregan parámetros ni rutas. `/catalogo` sigue aceptando `q`, `categoria` y `pagina` como hoy.

## 2. Anclas de la portada

| `id` | Sección | Estado |
|---|---|---|
| `categorias` | Fila de categorías | Se conserva (la usaba el enlace "Ver categorías" del hero, que se elimina; queda para enlaces externos ya compartidos) |
| `novedades` | Novedades | Se conserva (la usa el footer) |

## 3. Header según la ruta

| Ruta | Buscador del header | Enlaces "Inicio" / "Catálogo" | Menú móvil |
|---|---|---|---|
| `/` | **No se renderiza** (cambio) | Sí, "Inicio" marcado como activo | Sí |
| `/catalogo`, `/recurso/[slug]` y resto de `(public)` | Sí, sin cambios | Sí | Sí |

## 4. Orden de la portada (FR-001)

```text
<Header/>                       (layout, sin buscador en "/")
<main>
  <Hero/>                       h1 + HeroSearch (role="search")
  <CategorySection/>            #categorias, h2 "Categorías", fila única con scroll propio
  <RecentDesigns/>              #novedades, h2 "Novedades", grilla de hasta 8 tarjetas + "Ver todo el catálogo"
</main>
<Footer/>                       (layout, sin cambios)
```

Jerarquía de encabezados: un solo `h1` (hero) y un `h2` por sección. Hay un único elemento `role="search"` en `/`.

## 5. Accesibilidad de la fila de categorías

- Es una lista (`<ul>`/`<li>`) de enlaces (`<a>`). El orden de tabulación sigue el orden de `displayOrder`.
- El foco visible es el `ring` actual. El área de cada enlace mide al menos 44 × 44 px.
- El ícono es decorativo (`aria-hidden`). El nombre accesible del enlace es el nombre de la categoría más el conteo.
- El contenedor con scroll no atrapa el foco ni intercepta flechas o rueda más allá del comportamiento nativo.
