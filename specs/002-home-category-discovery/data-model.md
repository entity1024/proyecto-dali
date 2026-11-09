# Data Model: Portada orientada al descubrimiento por categorías

**Feature**: `002-home-category-discovery` · **Fecha**: 2026-11-09

> **Sin cambios de esquema.** Esta feature no modifica `prisma/schema.prisma`, no crea migraciones y no agrega
> consultas nuevas (FR-024, Principio IV). Este documento registra **qué datos existentes lee la portada** y de qué
> función salen, para que la implementación no invente campos.

## Entidades leídas

### Category → fila de categorías y columna del footer

Fuente: `getPublicCategories()` en `src/lib/db/queries/categories.ts` (sin cambios).

| Campo usado | Origen en el esquema | Uso en la portada |
|---|---|---|
| `id` | `Category.id` | `key` del elemento |
| `name` | `Category.name` | Texto visible (máximo 2 líneas) |
| `slug` | `Category.slug` (`@unique`) | Ícono (`CategoryIcon`) y enlace `/catalogo?categoria={slug}` |
| `_count.designs` | Conteo de `Design` con `status = "published"` | Dato secundario "N recurso(s)" |

Reglas que ya aplica la consulta: solo `isActive = true`, orden `displayOrder asc`.
Reglas de presentación: sin ícono mapeado → `LayoutGrid`; con conteo 0 → se muestra igual (edge case de la spec).

### Design → novedades

Fuente: `getPublishedDesigns({ take: 8 })` en `src/lib/db/queries/designs.ts`, más el presenter
`toDesignCardData()` en `src/lib/presenters/design-card.ts` (los dos sin cambios).

| Campo de `DesignCardData` | Origen | Uso |
|---|---|---|
| `slug` | `Design.slug` | Enlace `/recurso/{slug}` |
| `name` | `Design.name` | Título de la tarjeta y `alt` de la imagen |
| `categoryName` | `Design.category.name` | Línea secundaria |
| `categorySlug` | `Design.category.slug` | Disponible, sin uso visible nuevo |
| `thumbnailUrl` | `DesignImage` primaria: `thumbnailKey` → `storageKey` → `null` | Vista previa o reemplazo "Sin imagen" |

Reglas que ya aplica la consulta: solo `status = "published"`, orden `publishedAt desc`, límite 8 (Principio VIII).

## Datos evaluados y descartados

| Dato | Existe | Decisión |
|---|---|---|
| `Design.downloadCount` | Sí | No se usa: el usuario descartó "Más descargados" (spec, Clarifications 2026-11-09) |
| `Category.coverImageKey` | Sí | No se usa: la spec pide ícono más nombre |
| `Design.tags` | Sí | No se usa: la búsqueda conserva su alcance (nombre y descripción) |
| Colecciones / destacados | No | Descartado: no hay datos que lo respalden |

## Estados de UI por sección (Principio V)

| Sección | Carga | Vacío | Error |
|---|---|---|---|
| Categorías | `CategorySectionSkeleton` (forma de fila) | "Todavía no hay categorías disponibles" + "Ver el catálogo" | `SectionError` "No pudimos cargar las categorías" |
| Novedades | `RecentDesignsSkeleton` | "Todavía no hay recursos publicados" + "Ver el catálogo" | `SectionError` "No pudimos cargar las novedades" |
| Footer · categorías | `null` | La columna no se muestra | La columna no se muestra (excepción R10 de 001) |
