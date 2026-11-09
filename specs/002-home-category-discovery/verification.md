# Verification: 002-home-category-discovery

**Fecha**: 2026-11-09 · **Rama**: `002-home-category-discovery`
**Entorno**: `next dev` de la persona en `http://localhost:3001` (Next.js 16.4.5, Turbopack), seed con 8 categorías activas y 21 recursos publicados.
**Herramienta**: Chromium headless (patchright) con scripts que miden el DOM (`getBoundingClientRect`), navegan y toman capturas.
**Nota de entorno**: `localhost:3000` es **otra aplicación** ("GesFact 2.4"), no Plantillarte.
**Ruido conocido**: los errores de WebSocket `/_next/hmr` (`ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`) son del navegador headless contra el HMR de desarrollo, no de la página.

## Línea base y resultado final · T002 / T016

Primera medición con `ValueProps` ya retirado (T010/T011 se hicieron antes; no afecta lo que se ve sin desplazarse).
"Después" = estado final del código.

| Viewport | Hero antes → después | Categorías (top+alto) antes → después | Filas de categorías | Top de Novedades antes → después | `role=search` | Scroll H de página |
|---|---|---|---|---|---|---|
| 1366×768 | 450 → **266** | 515+544 → **331+280** | 2 → **1** | 1059 → **611** | 2 → **1** | no |
| 1280×800 | 450 → 266 | 515+544 → 331+280 | 2 → 1 | 1059 → 611 | 2 → 1 | no |
| 1920×1080 | 450 → 266 | 515+544 → 331+280 | 2 → 1 | 1059 → 611 | 2 → 1 | no |
| 768×1024 | 510 → 342 | 575+544 → 407+280 | 2 → 1 (scroll) | 1119 → 687 | 2 → 1 | no |
| 375×667 | 366 → 290 | 431+340 → 355+268 | 1 → 1 (scroll) | 771 → 623 | 2 → 1 | no |
| 360×740 | 390 → 314 | 455+340 → 379+268 | 1 → 1 (scroll) | 795 → 647 | 2 → 1 | no |
| 320×640 | 442 → 314 | 507+364 → 379+268 | 1 → 1 (scroll) | 871 → 647 | 2 → 1 | no |

**Lighthouse (línea base)**: ⏳ no se pudo tomar. No hay Lighthouse en el entorno del agente y `PerformanceObserver`
en headless devolvió null. Si la persona quiere el "antes", puede correrlo sobre `001-home-redesign`.

## US1 · T005 ✅

| Criterio | Evidencia | Resultado |
|---|---|---|
| SC-002: un solo buscador en `/` | `document.querySelectorAll('[role=search]').length` = **1** en los 7 viewports; sin `header button[aria-label="Buscar"]` en `/` | ✅ |
| FR-004: lupa en el resto de las rutas | `/catalogo`: 1 botón · `/recurso/calendario-2025-minimalista`: 1 botón · búsqueda desde el header en `/catalogo` → `/catalogo?q=floral` | ✅ |
| FR-008: búsqueda con término | `"  Calendario  "` + Enter → `/catalogo?q=Calendario` (recortado) | ✅ |
| FR-008: búsqueda vacía | `"   "` + botón Buscar → `/catalogo` | ✅ |
| FR-009: teclado | Tab desde el campo → botón "Buscar" (`:focus-visible`) → primera categoría | ✅ |
| FR-007 y R3: hero compacto | 266 px en escritorio (presupuesto ~320) · 290–342 px en móvil y tableta · sin enlaces secundarios | ✅ |
| CLS del header en `/` | El HTML inicial de `/` no incluye el buscador (prerender con pathname resuelto, R1) | ✅ |

Ajuste respecto de `tasks.md` (permitido por la nota final): el primer intento dejó el hero en 338 px. Se
compactó: `sm:pt-10 sm:pb-6` (sin `md:`), etiqueta `mb-2`, subtítulo `max-w-3xl` (una línea en escritorio) y
buscador `mt-5 sm:mt-6`.

## US2 · T008 ✅

| Criterio | Evidencia | Resultado |
|---|---|---|
| FR-010: categorías reales, en orden | 8 enlaces en el orden de `displayOrder`: calendarios, tipografias-y-alfabetos, material-escolar, banners, posters, invitaciones, plantillas, elementos-decorativos | ✅ |
| FR-012: una fila en todos los anchos | `catRows = 1` en los 7 viewports; con desborde en ≤ 768 px; sin scroll H de página | ✅ |
| FR-011 y SC-003: navegación | Clic en la primera → `/catalogo?categoria=calendarios`; los 8 `href` siguen el formato `/catalogo?categoria={slug}` | ✅ |
| FR-013: área ≥ 44×44 | Lado mínimo de los enlaces: 112 px | ✅ |
| FR-013 y SC-007: teclado | En 360 px, al enfocar la última la fila se desplaza (`scrollLeft` 496) y queda completa dentro; anillo `ring-inset` visible (captura `cat-focus-360.png`) | ✅ |
| Señal de "hay más" (R2) | Píxeles visibles del elemento siguiente: 320 px → 80 · 360 px → 8 · 375 px → 23 | ✅ |
| Nombres legibles | Con `w-26` ningún nombre queda cortado en 320/360/375 px (con `w-24` se cortaba "Tipografías y…") | ✅ |
| FR-019: carga sin CLS | Skeleton con estilos y red limitada por CDP: **280 = 280** (1366 px) y **268 = 268** (375 px), y lo mismo en encabezado y elemento | ✅ |
| FR-014: sin barra lateral | No existe | ✅ |
| Escenario 4 (desactivar categoría) | ⏳ No se ejecutó: requiere mutar datos del admin. La consulta `getPublicCategories` (filtro `isActive`) no cambió | ⚠️ Pendiente (persona) |

Ajustes respecto de `tasks.md`: (1) el nombre usa `min-h-10` (siempre 2 líneas) y el skeleton reserva lo mismo,
porque si no había 24 px de CLS; (2) el elemento mide `w-26` en móvil en lugar de `w-24`, para legibilidad;
(3) la sección queda en `py-6` en todos los anchos (sin `sm:py-8`) para cuidar el pliegue.

## US3 · T013 ⚠️ parcial

| Criterio | Evidencia | Resultado |
|---|---|---|
| FR-001: orden | Hijos de `<main>`: hero → `#categorias` → `#novedades`; nada después de novedades; 1 `h1` | ✅ |
| FR-002: sin bloque de beneficios | `grep ValueProps\|value-props src` sin resultados; carpeta eliminada con aprobación | ✅ |
| FR-015 y SC-004: 8 recientes en orden | 8 tarjetas (`calendario-2025-minimalista`, `-floral`, `-acuarela`, ...). Orden por `publishedAt desc` sin cambios en la consulta | ✅ (consulta sin cambios) |
| FR-017: tarjetas | `href="/recurso/{slug}"` en las 8 | ✅ |
| FR-018: "Ver todo el catálogo" | `href="/catalogo"` | ✅ |
| Footer → Novedades | `href="/#novedades"`, el ancla existe | ✅ |
| Estados vacío y error | ⏳ No se ejecutaron (requieren vaciar o detener la base). Código de esos estados sin cambios | ⚠️ Pendiente (persona) |

## Accesibilidad y movimiento · T017 ✅

- Tab: campo → "Buscar" → Calendarios → Tipografías y Alfabetos → ... Todos con `:focus-visible` y el anillo visible en la captura (`tab-focus-1366.png`).
- `prefers-reduced-motion: reduce` emulado: `.animate-fade-up` queda con `animation-name: none` y `opacity: 1`.

## SC-001 · pliegue

| Ventana (útil) | Buscador (bottom) | Fila de categorías (bottom) | Novedades: banda / h2 | Resultado |
|---|---|---|---|---|
| 1366 × 657 (1366×768 con la barra del navegador) | 307 | 587 | 611 / 627–659 | ✅ buscador, categorías y título "Novedades" legible completo (la caja de línea termina 2 px abajo; el texto se lee entero, captura `B-1366.png`) |
| 1366 × 768 (viewport completo) | — | — | 611 / 627–659 | ✅ |
| 375 × 667 | 331 | 599 | 623 / 639–667 | ✅ buscador y categorías · el título de Novedades queda justo en el borde |

**Ajuste posterior (opción B, elegida por la persona)**:
- Novedades: `py-10 sm:py-12` → `pt-4 pb-10 sm:pb-12`, igual en su skeleton.
- Encabezado de Novedades igual al de Categorías: `h2` `text-xl sm:text-2xl` y subtítulo `text-sm`. Skeleton `h-7 sm:h-8`.
- CLS detectado y corregido: en 375 px "Ver todo el catálogo" empujaba el subtítulo a 2 líneas (72 px reales contra 52 del skeleton). Ahora el enlace dice "Ver todo" en móvil y "Ver todo el catálogo" desde `sm` (`aria-label` fijo "Ver todo el catálogo"), y el subtítulo usa `truncate` (no llega a cortarse).
- Skeleton contra contenido de Novedades (encabezado / inicio de la grilla), con estilos y red limitada: 1366 → 56/104 = 56/104 · 768 → 56/104 = 56/104 · 375 → 52/92 = 52/92 · 320 → 52/92 = 52/92 ✅. Esto además corrige una diferencia que venía de 001 (encabezado real de 64 contra 56 del skeleton).
- `eslint` en los archivos tocados y `tsc --noEmit`: OK.
| 375 × 667 | 331 | 599 | 623 / 663 | ✅ buscador y categorías completos |

## Puertas Q1–Q7

| Puerta | Evidencia | Estado |
|---|---|---|
| Q1 lint | `npm run lint`: 0 errores, 11 advertencias **anteriores** (`src/lib/storage/*`). `eslint` sobre los 6 archivos tocados: exit 0, sin advertencias | ✅ |
| Q2 typecheck | `npx tsc --noEmit`: exit 0 | ✅ |
| Q3 build | ⏳ Lo corre la persona (research R8) | ⏳ |
| Q4 esquema | Sin cambios en `prisma/` | N/A |
| Q5 evidencia | Este documento | ✅ (salvo los pendientes marcados) |
| Q6 401/403 | Sin endpoints ni actions nuevos | N/A |
| Q7 UI | 320/360/375/768/1280/1366/1920 ✅ · teclado ✅ · **Lighthouse ⏳ (persona)** | ⏳ |

Chequeos de quickstart §1 (T015), hechos con `grep` porque en este shell `rg` es un alias que no devuelve salida:
- Colores escritos a mano en `src/components` y `src/app`: sin resultados ✅
- Valores arbitrarios en los archivos tocados: solo `supports-[backdrop-filter]` (variante que ya existía en el header) ✅
- Código muerto `ValueProps`: sin resultados ✅
- `"use client"` en `page.tsx` o `layout.tsx`: sin resultados ✅
- `@/lib/db/client`: solo `lib/db/queries/*`, `lib/auth/config.ts` y las 3 rutas de la deuda D1 que ya existía ✅

## Regresión · T020 ✅ (con una observación)

| Flujo | Evidencia | Resultado |
|---|---|---|
| `/catalogo` | 12 tarjetas · `?pagina=2` → 9 tarjetas · filtro `?categoria=posters` con píldora activa | ✅ |
| `/recurso/{slug}` | `h1` "Calendario 2025 Minimalista" | ✅ |
| Descarga | `/recurso/pack-cliparts-florales` → `/api/downloads/db63b380-…` → **200** `application/pdf`. ⚠️ Esto sumó 1 al `downloadCount` y agregó 1 `DownloadLog` en la base de desarrollo | ✅ |
| `/admin/login` | 200, 2 campos | ✅ |
| `/admin` sin sesión | Redirige a `http://localhost:3000/admin/login?callbackUrl=%2Fadmin`, o sea **al puerto 3000** (otra app). Configuración de Auth.js **anterior** a esta feature (la URL base de auth apunta a :3000), fuera de alcance | ⚠️ Observación |
| Menú móvil en `/` | Abre con "Inicio" y "Catálogo" | ✅ |

## Checklist de principios (T021)

- [x] I. Capas: secciones como Server Components; solo `header` (que ya era cliente) usa `usePathname`
- [x] II. Calidad: sin duplicación (clases compartidas con el skeleton) y sin código muerto
- [x] III. Seguridad: sin superficie nueva
- [x] IV. Datos: sin cambios de esquema ni de consultas
- [x] V. UX: solo tokens; tres estados conservados
- [x] VI. Responsive y a11y: 320 a 1920 px sin scroll H; teclado; 44 px; movimiento reducido
- [x] VII. Evidencia registrada (con pendientes explícitos)
- [ ] VIII. Rendimiento: falta Lighthouse (persona)
- [x] IX. Borrado aprobado; doc de Next consultada; sin commits ni push del agente

## Pendientes para la persona

1. **T018** Lighthouse móvil en `/`: Accesibilidad ≥ 95, Performance ≥ 85, LCP ≤ 2.5 s, CLS ≤ 0.1.
2. **T019** `npm run build`, sin avisos "Blocking Route" en `/`.
3. US2, escenario 4: desactivar una categoría en el admin y confirmar que desaparece de `/`.
4. US3: estados vacío y error (base vacía o detenida).
