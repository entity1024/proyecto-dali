# Verificación: 001-home-redesign

Evidencia por tarea, según la constitución (Principio VII, Definición de Terminado).

## Línea base (T002), tomada el 2026-11-09 sobre `main` sin cambios

Servidor de desarrollo en `http://localhost:3001`, con la base del seed.

| URL | HTTP | Total mostrado |
|-----|------|----------------|
| `/` | 200 | — |
| `/catalogo` | 200 | 21 recursos |
| `/catalogo?q=poster` | 200 | 3 recursos encontrados |
| `/catalogo?pagina=2` | 200 | 21 recursos (página 2) |
| `/catalogo?pagina=abc` | 200 | 21 recursos (hoy `page = NaN`; ver F19) |

### Categorías: contador actual vs. publicados vs. catálogo

| slug | activa | contador actual (todos los estados) | publicados | `/catalogo?categoria=` |
|------|--------|-------------------------------------|------------|------------------------|
| calendarios | sí | 6 | 6 | 6 |
| tipografias-y-alfabetos | sí | 3 | 3 | 3 |
| material-escolar | sí | 3 | 3 | 3 |
| banners | sí | 0 | 0 | 0 ("No se encontraron recursos") |
| posters | sí | 3 | 3 | 3 |
| invitaciones | sí | 3 | 3 | 3 |
| plantillas | sí | 2 | 2 | 2 |
| elementos-decorativos | sí | 1 | 1 | 1 |

**Observación**: el seed no tiene recursos en borrador ni archivados, así que el desfase C1 no se ve con estos
datos. Para validar F7 de punta a punta, una persona debe crear un recurso en **borrador** desde el admin y
confirmar que el contador de la portada no lo cuenta y el del admin sí (F17).

**Observación fuera de alcance**: el catálogo muestra "1 recurso encontrados" (concordancia gramatical). Es un
texto que ya existía; queda registrado y no se corrige en esta feature (FR-005 y FR-024 congelan el catálogo).

### Pendiente de una persona (no automatizable desde el agente)

- [ ] Lighthouse móvil en `/` y `/catalogo`: Performance, Accesibilidad, LCP y CLS (línea base para P1 y A4).
- [ ] Contadores de `/admin/categorias` (requiere sesión de administrador).

## Fase 2 (T014): Foundational

- `npx tsc --noEmit`: **OK**, sin errores.
- `eslint src/lib src/components/public src/app/(public)`: **0 errores** y 9 warnings, todos preexistentes en
  `src/lib/storage/*`, que está fuera de alcance. Había **1 error preexistente en `main`**
  (`search-bar/index.tsx`: `setState` sincrónico dentro de `useEffect`), y se corrigió con el patrón "ajustar
  estado durante el render" porque el archivo está en el alcance (T008/T032) y Q1 exige lint limpio.
- `buildCatalogHref` contra la tabla del contrato §2: **9/9 OK** (script ad hoc con `tsx`, fuera del repo).

| URL | Línea base | Después de F2 | Estado |
|-----|------------|---------------|--------|
| `/catalogo` | 21 recursos | 21 recursos, pág. 1 | ✅ |
| `/catalogo?q=poster` | 3 encontrados | 3 encontrados | ✅ F2 |
| `/catalogo?pagina=2` | 21, pág. 2 | 21, pág. 2 | ✅ F14 |
| `/catalogo?pagina=abc` | `NaN` | pág. 1 | ✅ F19 |
| `/catalogo?pagina=-3` | — | pág. 1 | ✅ F19 |
| `/catalogo?categoria=calendarios&q=` | 6 | 6 encontrados | ✅ |
| `/` enlaces de categoría | 8 | 8 | ✅ |
| `/recurso/calendario-2025-minimalista` | 200 | 200, 4 relacionados | ✅ F15 (parcial) |

**Pendiente de una persona**: F3–F5 en el navegador (envío real de los formularios), descarga de un archivo desde
el detalle (F15) y F17 (contadores del admin con sesión).

## Fases 3–8: evidencia automatizada (2026-11-09)

Herramientas: servidor de desarrollo en `localhost:3001`, navegador headless (Chromium vía patchright),
`curl`, `npx tsc --noEmit` y `eslint`.

### Puertas automáticas

| Puerta | Resultado |
|--------|-----------|
| Q1 `eslint src/lib src/components/public src/app/(public)` | ✅ 0 errores (9 warnings preexistentes en `src/lib/storage`, fuera de alcance) |
| Q2 `npx tsc --noEmit` | ✅ sin errores |
| Q3 `npm run build` | ⏳ **la ejecuta una persona** (T042) |
| Overlay de Next: Blocking Route en `/` y `/catalogo` | ✅ 0 issues (se corrigieron 3 preexistentes del layout público; ver research R12) |
| Overlay en `/recurso/[slug]` | ⚠️ 1 issue preexistente en `recurso/[slug]/page.tsx` (fuera de alcance, R12) |
| Constitución `rg` colores y valores arbitrarios (T038) | ✅ sin resultados |
| `rg "@/lib/db/client"` en componentes y páginas públicas | ✅ sin resultados |
| Diff fuera de alcance (T039) | ✅ vacío |

### Responsive (A1) y buscador visible sin desplazarse (F1 / SC-001)

| Viewport | `/` scroll-x | `/catalogo` scroll-x | `/recurso/…` scroll-x | Borde inferior del buscador / alto del viewport |
|----------|--------------|----------------------|-----------------------|--------------------------------------------------|
| 360×640 | ✅ no | ✅ no | ✅ no | 375 / 640 ✅ |
| 768×1024 | ✅ no | ✅ no | ✅ no | 475 / 1024 ✅ |
| 1280×800 | ✅ no | ✅ no | ✅ no | 415 / 800 ✅ |
| 1920×1080 | ✅ no | ✅ no | ✅ no | 415 / 1080 ✅ |

Errores de consola en las 12 combinaciones: **0**.

### Escenarios funcionales

| # | Resultado |
|---|-----------|
| F2 | ✅ `"  poster  "` + Enter → `/catalogo?q=poster` (3 resultados, igual que la línea base) |
| F3 | ✅ vacío → `/catalogo` |
| F4 | ✅ `día & noche` → `/catalogo?q=d%C3%ADa+%26+noche` |
| F5 | ✅ búsqueda del encabezado desde `/recurso/…` → `/catalogo?q=calendario` |
| F6 | ✅ 8 categorías activas, en orden de visualización |
| F7 | ✅ los contadores de la portada coinciden 1:1 con el catálogo (6, 3, 3, 0, 3, 3, 2, 1). ⏳ Falta validar con un **borrador** (ver la observación de la línea base) |
| F8 | ✅ 8 enlaces `/catalogo?categoria=<slug>` |
| F9 | ✅ los slugs fuera del mapa usan `LayoutGrid` (y se mapearon los 2 reales, R12) |
| F11 | ✅ 20 de 21 recursos no tienen imagen en la base: se ve el respaldo "Sin imagen" con proporción 4:3 |
| F13 | ✅ "Ver categorías" → `#categorias` a 80 px del borde; pie "Novedades" → `/#novedades` a 80 px (encabezado de 64 px, no queda tapado) |
| F14 | ✅ catálogo: totales, paginación y `categoria` + `q` iguales a la línea base |
| F15 | ✅ detalle 200 con 4 relacionados y tarjeta nueva. ⏳ Falta la descarga real de un archivo (persona) |
| F16 | ✅ menú móvil: `aria-expanded`, Escape lo cierra, elegir "Catálogo" navega y lo cierra |
| F18 | ✅ con un error forzado en Novedades (`throw` temporal, ya revertido): solo esa sección muestra "No pudimos cargar las novedades", con Reintentar y Ver el catálogo; no aparece el mensaje técnico; el bloque principal, las categorías, la propuesta de valor y el pie siguen bien |
| F19 | ✅ `pagina=abc` y `pagina=-3` → página 1 |
| Imagen real | ✅ `pack-cliparts-florales`: optimizador 200, archivo 200, misma URL que en `main` |

### Accesibilidad

| # | Resultado |
|---|-----------|
| A2 | ✅ orden de Tab: marca → Inicio → Catálogo → Buscar (encabezado) → campo principal → Buscar → Explorar recursos → Ver categorías → Ver todos. El input oculto del encabezado no recibe foco |
| A3 | ✅ nombres accesibles: "Buscar", "Buscar recursos", "Limpiar búsqueda", "Cerrar búsqueda", "Abrir menú"/"Cerrar menú"; `aria-current="page"` en el enlace activo |
| A7 | ✅ a 360 px ningún elemento interactivo del encabezado ni de `main` mide menos de 44 × 44 px |

### Pendiente de una persona

- [ ] **T017** SC-002: prueba cronometrada con una persona (≤ 2 interacciones y < 10 s).
- [ ] **T023 / T029** F20: estados vacíos con una base sin categorías activas o sin recursos publicados. F10:
      publicar un recurso desde el admin y verlo primero. F7 con un borrador.
- [ ] **T040** A4: Lighthouse Accesibilidad ≥ 95; contraste manual en hover y foco; A5 (reducir movimiento); A6
      (zoom 200 %).
- [ ] **T041** P1/P2: Lighthouse móvil contra la línea base.
- [ ] **T042** `npm run lint`, `npx tsc --noEmit` y `npm run build`.
- [ ] F15 descarga real; F17 contadores del admin con sesión.

## Matriz de requisitos (T043; borrador, se cierra al completar los pendientes)

| Req | Estado | Evidencia |
|-----|--------|-----------|
| FR-001 orden | ✅ | `page.tsx`: Hero → Categorías → Novedades → Propuesta de valor; pie en el layout |
| FR-002 sin funcionalidades nuevas | ✅ | `value-props` solo usa textos existentes |
| FR-003 buscador protagonista | ✅ | F1 |
| FR-004 mismas URLs | ✅ | F2–F4, contrato 9/9 |
| FR-005 criterios intactos | ✅ | `getPublishedDesigns` sin cambios; totales iguales |
| FR-006 búsqueda en el encabezado | ✅ | F5 |
| FR-007 categorías con ícono | ✅ | F6 |
| FR-008 rutas de categoría | ✅ | F8 |
| FR-009 respaldo | ✅ | F9 |
| FR-010 barra del catálogo | ✅ | F14 |
| FR-011 contador de publicados | ✅ / ⏳ | F7 (falta el caso con borrador) |
| FR-012 jerarquía de la tarjeta | ✅ | captura `novedades-1280` |
| FR-013 tarjeta única | ✅ | portada, catálogo y relacionados usan `DesignCard` |
| FR-014 8 recientes + Ver todos | ✅ | 8 tarjetas |
| FR-015 destinos del encabezado | ✅ | F16, A3 |
| FR-016 contenido del pie | ✅ | marca, 6 categorías, enlaces y © año |
| FR-017 sin scroll horizontal | ✅ | A1 (12/12) |
| FR-018 44 px | ✅ | A7 |
| FR-019 teclado y nombres | ✅ | A2, A3 |
| FR-020 contraste AA | ⏳ | T040 |
| FR-021 identidad propia | ✅ | solo tokens de marca (T038) |
| FR-022 reducir movimiento | ✅ / ⏳ | `motion-reduce:*` + regla global; A5 pendiente |
| FR-023 sin cambios fuera de alcance | ✅ | T039 |
| FR-024 URLs públicas | ✅ | F14, F19 |
| SC-001 | ✅ | F1 |
| SC-002 | ⏳ | T017 |
| SC-003 | ✅ | 1 clic → catálogo filtrado (F8) |
| SC-004 | ✅ / ⏳ | regresiones OK; faltan la descarga y el admin |
| SC-005 | ✅ | A1 |
| SC-006 | ⏳ | Lighthouse (T040) |
| SC-007 | ⏳ | Lighthouse (T041) |
| SC-008 | — | después del merge |
