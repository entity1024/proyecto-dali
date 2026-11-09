# Data Model: Rediseño de la página principal

**Feature**: [spec.md](./spec.md) | **Date**: 2026-11-09

**Esquema de base de datos: SIN CAMBIOS.** No hay migraciones (FR-023). Este documento describe los
modelos de vista que la UI consume y la única consulta nueva.

## Entidades persistidas (solo lectura, sin cambios)

| Entidad | Campos que usa esta feature | Reglas |
|---------|-----------------------------|--------|
| `Category` | `id`, `name`, `slug`, `displayOrder`, `isActive` | Solo se muestran las que tienen `isActive = true`, ordenadas por `displayOrder` ascendente. `coverImageKey` **no** se usa (Q2). |
| `Design` | `slug`, `name`, `status`, `publishedAt`, `category` | Solo se muestran las que tienen `status = "published"`, ordenadas por `publishedAt` descendente. |
| `DesignImage` | `thumbnailKey`, `storageKey`, `isPrimary` | Se usa solo la imagen primaria; se muestra `thumbnailKey` y, si no existe, `storageKey`. |

## Consulta nueva

### `getPublicCategories()` (en `src/lib/db/queries/categories.ts`)

- **Filtro**: `isActive = true`.
- **Orden**: `displayOrder ASC`.
- **Selección**: `id`, `name`, `slug`, más un conteo de `designs` con `status = "published"`.
- **Consumidores**: la sección de categorías de la portada, el pie y la barra de categorías del catálogo.
- **No la consume**: el panel de administración, que sigue usando `getCategories()` sin cambios.
- **Invariante**: para toda categoría `c`, `publishedCount(c)` es igual al total que muestra
  `/catalogo?categoria=<c.slug>` (FR-011, escenario 2.6).

## Modelos de vista

### `CategoryNavItem`

| Campo | Tipo | Origen | Regla |
|-------|------|--------|-------|
| `id` | string | `Category.id` | Clave de la lista |
| `name` | string | `Category.name` | Si es largo, se corta con elipsis en una línea |
| `slug` | string | `Category.slug` | Se usa para armar el `href` y elegir el ícono |
| `publishedCount` | number | conteo filtrado | Texto: "1 recurso" o "N recursos". El 0 se muestra como "0 recursos" |

El ícono se elige en la UI con `slug → ícono` y `LayoutGrid` como respaldo ([research R2](./research.md)).

### `DesignCardData` (sin cambios de forma; se centraliza su construcción)

| Campo | Tipo | Regla |
|-------|------|-------|
| `slug` | string | Destino: `/recurso/<slug>` |
| `name` | string | Máximo 2 líneas con elipsis; también es el `alt` de la imagen |
| `categoryName` | string | Se muestra como etiqueta secundaria |
| `categorySlug` | string | Se conserva por compatibilidad con los props actuales |
| `thumbnailUrl` | string \| null | `null` → estado de respaldo con la misma proporción |

Lo construye `toDesignCardData()` en `src/lib/presenters/design-card.ts` ([research R6](./research.md)).

## Estados de cada sección (Principio V)

| Sección | Cargando | Vacío | Error |
|---------|----------|-------|-------|
| Categorías | Skeleton con la misma forma | Título + "Todavía no hay categorías disponibles" + enlace "Ver el catálogo" → `/catalogo` (escenario 2.4) | Título + "No pudimos cargar las categorías" + botón "Reintentar" (`retry()`) + enlace "Ver el catálogo". Nunca `error.message` (research R10) |
| Recientes | Skeleton de 8 tarjetas con la misma proporción | Título + "Todavía no hay recursos publicados" + enlace "Ver el catálogo" (escenario 3.6) | Título + "No pudimos cargar las novedades" + "Reintentar" + enlace "Ver el catálogo" |
| Pie (categorías) | — (dentro del layout) | No se muestra la columna (como hoy) | Igual que hoy: `.catch(() => [])` |
