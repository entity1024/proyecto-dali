# Quickstart: validación de la portada (002)

**Feature**: `002-home-category-discovery` · Guía para verificar la feature de punta a punta. No contiene código.

## Prerrequisitos

- PostgreSQL con migraciones aplicadas y seed cargado (`npm run db:seed` o el script equivalente de `package.json`),
  de modo que haya 8 categorías activas y diseños publicados en fechas escalonadas (`prisma/seed-designs.ts`).
- `npm run dev` levantado (`http://localhost:3000`).

## 1. Puertas automáticas (Q1–Q3)

| Paso | Comando | Esperado |
|---|---|---|
| Lint | `npm run lint` | 0 errores |
| Tipos | `npx tsc --noEmit` | 0 errores |
| Build | `npm run build` (lo corre la persona, ver research R8) | Exitoso, sin avisos "Blocking Route" en `/` |
| Capas | `rg "@/lib/db/client" src` | Solo `lib/db/queries/*` y `lib/auth/config.ts` (más la deuda D1 preexistente) |
| Colores | `rg "#[0-9a-fA-F]{3,6}\b\|rgb\(\|\[#" src/components src/app --glob "*.tsx"` | Sin resultados nuevos |
| Código muerto | `rg "ValueProps\|value-props" src` | Sin resultados |

## 2. Escenarios por historia

### US1: buscar (FR-004, FR-006 a FR-009, SC-002)
1. Abrir `/`: hay **un** buscador (el del hero) y el header no muestra lupa. → SC-002
2. Abrir `/catalogo` y `/recurso/{slug}`: el header **sí** muestra la lupa y funciona como antes.
3. En `/` buscar un término presente en el nombre o la descripción de un diseño publicado → `/catalogo?q=...` lo muestra.
4. Confirmar con el campo vacío o con espacios → `/catalogo` sin `q`.
5. Con teclado: Tab hasta el campo, escribir, Enter. Probar también el botón "Limpiar".

### US2: categorías (FR-010 a FR-014, SC-003)
1. En 1280 px: las 8 categorías están en **una** fila, en el orden de `displayOrder` del admin.
2. En 360 px: la fila se desliza lateralmente, el último elemento visible queda cortado y `document.documentElement.scrollWidth === innerWidth` (sin scroll horizontal de página).
3. Elegir cada categoría → `/catalogo?categoria={slug}` muestra sus recursos. → SC-003
4. Desactivar una categoría en `/admin/categorias` → desaparece de la fila al recargar `/`.
5. Tab por la fila: el foco se ve y la fila se desplaza sola hasta el elemento enfocado. → SC-007
6. Si hay datos de prueba: una categoría con nombre largo se corta a 2 líneas sin deformar la fila.

### US3: novedades (FR-015 a FR-018, SC-004)
1. Se ven hasta 8 tarjetas, de la publicada más recientemente a la más antigua (comparar con `/admin/recursos`).
2. Cada tarjeta abre su `/recurso/{slug}`. "Ver todo el catálogo" abre `/catalogo`.
3. Un diseño sin imagen muestra "Sin imagen" con la misma proporción que el resto.
4. Footer → "Novedades" lleva a `/#novedades`.

### Estados (FR-019)
- **Carga**: limitar la red en DevTools; los skeletons tienen la forma final y no hay salto al terminar de cargar.
- **Vacío**: con la base sin categorías activas o sin diseños publicados (entorno local), se ven los mensajes vacíos con "Ver el catálogo".
- **Error**: con la base detenida, cada sección muestra su mensaje y el hero y el buscador siguen usables.

## 3. Responsive y pliegue (FR-020, SC-001, SC-005, Q7)

| Ventana | Esperado |
|---|---|
| 1366 × 768 (escritorio) | Sin desplazarse se ven el buscador, la fila de categorías completa y el comienzo de "Novedades" |
| 375 × 667 (móvil) | Sin desplazarse se ven el buscador y la fila de categorías |
| 360 / 768 / 1280 / 1920 px y mínimo 320 px | Sin scroll horizontal de página ni texto desbordado |

Hero: medir con DevTools; el alto debe quedar en unos 320 px o menos en escritorio (research R3).

## 4. Lighthouse en `/` (móvil) · Principios VI y VIII

Accesibilidad ≥ 95 · Performance ≥ 85 · LCP ≤ 2.5 s · CLS ≤ 0.1. Registrar el antes y el después.

## 5. Regresión (SC-008)

`/catalogo` (búsqueda, filtro, paginación) · `/recurso/{slug}` (galería, descarga) · `/admin/login` → ingreso →
panel · menú móvil en `/`. Todo debe comportarse igual que antes del cambio.

Registrar la evidencia de cada punto en `verification.md` de esta feature (Principio VII, Q5).
