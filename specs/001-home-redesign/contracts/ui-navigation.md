# Contrato de UI y navegación

**Feature**: [spec.md](../spec.md) | **Date**: 2026-11-09

Este contrato fija lo que el rediseño **no puede cambiar**: las URLs, los parámetros y los destinos que ve una
persona. Cualquier diferencia contra esta tabla es una regresión (SC-004).

## 1. URLs públicas (FR-024)

| URL | Parámetros | Comportamiento que se conserva |
|-----|------------|--------------------------------|
| `/` | — | Portada |
| `/catalogo` | `q` (texto), `categoria` (slug), `pagina` (≥ 1) | Mismos resultados, mismo orden y 12 por página |
| `/recurso/<slug>` | — | Detalle; 404 si no está publicado |
| `/api/downloads/<fileId>` | — | Sin cambios (no se toca) |

## 2. `buildCatalogHref` (research R4)

Es una función pura con entrada `{ q?: string; categoria?: string; base?: URLSearchParams }` que devuelve un
string. Reglas:

1. `q` se recorta (`trim`). Si queda vacío, se omite.
2. `categoria` vacía se omite.
3. Si viene `base`, se conservan sus otros parámetros y **se elimina `pagina`**. Esto preserva el comportamiento
   actual del buscador del catálogo.
4. La codificación se hace con `URLSearchParams`. Los espacios se codifican como `+` (hoy el encabezado usa
   `encodeURIComponent`, que produce `%20`; el servidor decodifica las dos formas igual y el resultado es el mismo).
5. Si no queda ningún parámetro, el resultado es `/catalogo`, sin `?`.

| Entrada | Salida |
|---------|--------|
| `{ q: "poster" }` | `/catalogo?q=poster` |
| `{ q: "  poster  " }` | `/catalogo?q=poster` |
| `{ q: "" }` | `/catalogo` |
| `{ q: "día & noche" }` | `/catalogo?q=d%C3%ADa+%26+noche` |
| `{ categoria: "posters" }` | `/catalogo?categoria=posters` |
| `{ categoria: "posters", q: "azul" }` | `/catalogo?categoria=posters&q=azul` (el orden de los parámetros puede variar) |
| `{ q: "x", base: "categoria=posters&pagina=3" }` | `/catalogo?categoria=posters&q=x` |

## 3. Destinos de navegación

| Origen | Destino |
|--------|---------|
| Marca (encabezado y pie) | `/` |
| Encabezado → Inicio | `/` (se marca activo cuando `pathname === "/"`) |
| Encabezado → Catálogo | `/catalogo` (se marca activo cuando `pathname` empieza con `/catalogo`) |
| Búsqueda del encabezado | `buildCatalogHref({ q })` |
| Buscador principal de la portada | `buildCatalogHref({ q })` |
| Bloque principal → "Explorar recursos" | `/catalogo` |
| Bloque principal → "Ver categorías" | `#categorias` |
| Ítem de categoría en la portada | `/catalogo?categoria=<slug>` |
| Barra de categorías del catálogo → "Todos" | `buildCatalogHref({ q })` (conserva `q`, quita `categoria`) |
| Barra de categorías del catálogo → categoría | `buildCatalogHref({ categoria, q })` |
| Tarjeta de recurso (en todo el sitio) | `/recurso/<slug>` |
| Recientes → "Ver todos" | `/catalogo` |
| Pie → categoría | `/catalogo?categoria=<slug>` |
| Pie → "Todos los recursos" | `/catalogo` |
| Pie → "Novedades" | `/#novedades` (**cambio**: hoy es `/`; ver research R8) |

## 4. Accesibilidad (FR-019)

| Elemento | Nombre accesible |
|----------|------------------|
| Botón lupa del encabezado | "Buscar" |
| Botón para limpiar la búsqueda | "Limpiar búsqueda" (**hoy no tiene**) |
| Botón para cerrar la búsqueda del encabezado | "Cerrar búsqueda" |
| Botón de menú móvil | "Abrir menú" / "Cerrar menú", con `aria-expanded` |
| Campo de búsqueda principal | Etiqueta asociada, por ejemplo "Buscar recursos" (puede ser visualmente oculta) |
| Formulario de búsqueda principal | `role="search"` |
| Ícono de categoría | `aria-hidden="true"` |
| Imagen de tarjeta | `alt` = nombre del recurso |

## 5. Anclas de la portada

| id | Sección |
|----|---------|
| `categorias` | Navegación por categorías |
| `novedades` | Recursos recientes |
