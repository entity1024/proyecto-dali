---

description: "Task list for 002-home-category-discovery"
---

# Tasks: Portada orientada al descubrimiento por categorías

**Input**: Design documents from `/specs/002-home-category-discovery/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-navigation.md](./contracts/ui-navigation.md), [quickstart.md](./quickstart.md)

**Tests**: la spec no pide pruebas automatizadas y el proyecto no tiene framework (deuda D8). La verificación es
manual, con los escenarios de `quickstart.md`. Cada historia termina con una tarea de verificación que deja evidencia en
`verification.md` (Principio VII, puerta Q5).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Rutas relativas a la raíz del repo (proyecto Next.js único).

## Reglas para quien implementa (leer antes de empezar)

- **Solo presentación**: NO tocar `src/lib/**`, `prisma/**`, `src/app/api/**`, `src/app/(admin)/**`, `package.json` ni rutas (FR-024).
- Solo tokens de `globals.css` y clases estándar de Tailwind. Nada de `[#...]`, `[13px]` ni colores escritos a mano (Principio V).
- Textos visibles en español rioplatense neutro, como los actuales ("Buscá", "Explorá").
- No correr `npm run build` después de cada cambio: el build lo corre la persona en T019 (research R8).
- Antes de usar una API de Next, consultar `node_modules/next/dist/docs/` (AGENTS.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: dejar registrada la línea base antes de tocar código.

- [x] T001 Crear `specs/002-home-category-discovery/verification.md` con una sección por historia (US1, US2, US3), una de "Puertas Q1–Q7" y una de "Regresión". Cada criterio (FR-xxx / SC-xxx que cita `quickstart.md`) va como ítem pendiente.
- [ ] T002 Registrar la línea base en `specs/002-home-category-discovery/verification.md`: Lighthouse móvil de `/` (Performance, Accesibilidad, LCP, CLS) y alto actual del hero medido con DevTools en 1366 × 768, con `npm run dev` y el seed cargado.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: no aplica. La feature no agrega infraestructura, datos ni utilidades compartidas: las tres historias
modifican archivos distintos y reutilizan lo que ya existe (`buildCatalogHref`, `toDesignCardData`, `CategoryIcon`,
`SectionError`, `scrollbar-hide`, `animate-fade-up`).

**Checkpoint**: se puede empezar cualquier historia apenas termina la Phase 1.

---

## Phase 3: User Story 1 - Buscar un diseño desde el primer vistazo (Priority: P1) 🎯 MVP

**Goal**: en `/` hay un único buscador destacado (el del hero), dentro de un hero compacto.

**Independent Test**: abrir `/` y confirmar que no hay lupa en el header; buscar un término y llegar a `/catalogo?q=...`; en `/catalogo` la lupa del header sigue funcionando (quickstart §2 US1).

### Implementation for User Story 1

- [x] T003 [P] [US1] En `src/components/public/header/index.tsx`, dentro de `SearchBox`, agregar `const pathname = usePathname()` (ya está importado) junto a los demás hooks y `if (pathname === "/") return null` **después de todos los hooks** (los `useState`, `useRef` y los dos `useEffect`) y antes del `return` del JSX, para respetar las reglas de hooks. No cambiar el `<Suspense>` ni su fallback en `Header`. Agregar un comentario de una línea: "En la portada el buscador es el del hero (FR-004). `/` es estática, así que el pathname se resuelve en el prerender y no hay CLS (research R1)."
- [x] T004 [P] [US1] En `src/components/public/hero/index.tsx`: (a) eliminar el `<div>` con los dos `Button` ("Explorar recursos" y "Ver categorías") y los imports que quedan sin uso (`Link`, `ArrowRight`, `Button`); (b) cambiar el padding del `<section>` a `pt-8 pb-6 sm:pt-12 sm:pb-8 md:pt-14 md:pb-10`; (c) cambiar el `h1` a `text-3xl sm:text-4xl md:text-5xl` (se mantienen `font-extrabold tracking-tight text-balance`); (d) cambiar el subtítulo a `mt-3 sm:mt-4` y el contenedor del buscador a `mt-6 sm:mt-8`. Mantener la etiqueta "Recursos gráficos gratuitos", el texto del título y subtítulo, `HeroSearch` sin cambios y las clases `animate-fade-up` y `delay-*`.
- [x] T005 [US1] Verificar US1 según quickstart §2 US1 (pasos 1 a 5) y registrar la evidencia en `specs/002-home-category-discovery/verification.md`: hay 1 `role="search"` en `/` (DevTools → `document.querySelectorAll('[role=search]').length === 1`), la lupa está en `/catalogo` y `/recurso/{slug}`, se busca con y sin término, se usa con teclado y el alto del hero es de unos 320 px o menos en 1366 × 768. Cubre FR-004, FR-006 a FR-009 y SC-002.

**Checkpoint**: US1 es entregable por sí sola (MVP).

---

## Phase 4: User Story 2 - Descubrir por categoría (Priority: P1)

**Goal**: las categorías activas se muestran en una única fila horizontal, con ícono y nombre, en todos los anchos.

**Independent Test**: en 1280 px las 8 categorías están en una fila; en 360 px la fila se desliza sin scroll de página; cada categoría lleva a `/catalogo?categoria={slug}` (quickstart §2 US2).

### Implementation for User Story 2

- [x] T006 [US2] En `src/components/public/category-section/index.tsx`:
  (a) reemplazar `categoryListClass` por `"-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-1 scrollbar-hide sm:-mx-6 sm:scroll-px-6 sm:gap-3 sm:px-6"`, que da una fila en todos los anchos: se quitan `sm:grid`, `sm:grid-cols-*`, `lg:grid-cols-*` y `sm:overflow-visible`;
  (b) reemplazar `categoryItemClass` por `"w-24 shrink-0 snap-start sm:w-28"` (ancho fijo: el último elemento queda cortado si no entran todos, research R2);
  (c) cambiar el padding del `<section>` a `py-6 sm:py-8` (se mantienen `id="categorias"` y `scroll-mt-20`) y el margen del encabezado a `mb-4 sm:mb-5`;
  (d) `h2` "Categorías" en `text-xl font-bold tracking-tight sm:text-2xl`; el subtítulo "Explorá por tipo de recurso" pasa a `text-sm text-muted-foreground`;
  (e) eliminar el enlace "Ver todos" del encabezado y el import de `ArrowRight` (el catálogo ya está en el header, en novedades y en el footer; queda un `<div>` simple con `h2` y subtítulo);
  (f) en cada `<Link>`: reemplazar `focus-visible:ring-3 focus-visible:ring-ring/50` por `focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50` (el `overflow-x-auto` recorta el anillo exterior); mantener `min-h-11`, `p-3` y el hover;
  (g) el círculo del ícono pasa a `size-12 sm:size-14` (ícono `size-5 sm:size-6`); mantener el nombre en `line-clamp-2 break-words text-sm font-semibold` y el conteo "N recurso(s)" en `text-xs text-muted-foreground`.
  No cambiar la consulta (`getPublicCategories`), el `href` (`/catalogo?categoria=${cat.slug}`), `CategoryIcon`, el estado vacío ni el stagger.
- [x] T007 [P] [US2] En `src/components/public/section-skeletons/index.tsx`, `CategorySectionSkeleton`: padding `py-6 sm:py-8`, encabezado con `mb-4 sm:mb-5` y barras `h-7 w-32` y `h-4 w-48` (un componente local o props en `SectionHeaderSkeleton`, sin cambiar el de novedades), 8 elementos en lugar de 12 y círculo `size-12 sm:size-14`. Seguir usando `categoryListClass` y `categoryItemClass` importados. El objetivo es que no haya CLS al terminar de cargar (research R6).
- [x] T008 [US2] Verificar US2 según quickstart §2 US2 (pasos 1 a 6) y registrar evidencia en `specs/002-home-category-discovery/verification.md`: una fila en 1280 px; en 360 px `document.documentElement.scrollWidth === window.innerWidth`; las 8 categorías navegan bien; la desactivada desaparece; el foco con Tab se ve completo (anillo no recortado) y la fila se desplaza sola; sin salto entre skeleton y contenido (red limitada). Cubre FR-010 a FR-014 y SC-003.

**Checkpoint**: US1 y US2 funcionan cada una por su cuenta.

---

## Phase 5: User Story 3 - Ver lo último que se agregó (Priority: P2)

**Goal**: novedades queda como cierre del contenido, con un enlace claro al catálogo, y la portada termina en el footer (sin bloque de beneficios).

**Independent Test**: se ven hasta 8 tarjetas en orden de publicación descendente; las tarjetas y "Ver todo el catálogo" navegan bien; no hay sección entre novedades y footer (quickstart §2 US3).

### Implementation for User Story 3

- [x] T009 [P] [US3] En `src/components/public/recent-designs/index.tsx`: padding del `<section>` a `py-10 sm:py-12` (se mantienen `id="novedades"`, `scroll-mt-20` y `bg-muted/30`) y texto del enlace "Ver todos" a "Ver todo el catálogo" (mismo `href="/catalogo"`, `min-h-11` y `ArrowRight`). No cambiar `RECENT_LIMIT`, la consulta, `DesignGrid`, el estado vacío ni la condición `designs.length > 0` del enlace.
- [x] T010 [P] [US3] En `src/app/(public)/page.tsx`: quitar `import { ValueProps } ...` y `<ValueProps />`. Actualizar el comentario a "Orden de secciones: 002 FR-001 (hero → categorías → novedades). Cada sección con datos tiene carga, vacío y error propios." No cambiar `metadata`, `SectionError` ni los `<Suspense>`.
- [x] T011 [US3] ✅ **Aprobado por la persona el 2026-11-09 (Principio IX)**. Hecho: `rg` sin referencias fuera de la propia carpeta, eliminada con `git rm`. Después de T010, confirmar con `rg "ValueProps|value-props" src` que no queda ninguna referencia y eliminar la carpeta `src/components/public/value-props/`. Si no se aprueba: dejar la carpeta y registrarla como deuda en `verification.md`.
- [x] T012 [US3] En `src/components/public/section-skeletons/index.tsx` (después de T007, porque es el mismo archivo), `RecentDesignsSkeleton`: padding a `py-10 sm:py-12` para igualar T009. No cambiar el resto.
- [ ] T013 [US3] Verificar US3 según quickstart §2 US3 (pasos 1 a 4) y los estados de quickstart §2 "Estados", y registrar evidencia en `specs/002-home-category-discovery/verification.md`: orden contra `/admin/recursos`, navegación de tarjetas y enlace, "Sin imagen" con la misma proporción, footer → `/#novedades`, y estados de carga, vacío y error por sección. Cubre FR-001, FR-002, FR-015 a FR-019 y SC-004.

**Checkpoint**: las tres historias funcionan y la portada tiene el orden final de FR-001.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: puertas de calidad y verificación transversal (Q1 a Q7).

- [x] T014 Correr `npm run lint` (Q1) y `npx tsc --noEmit` (Q2). Corregir solo los errores que introdujo esta feature y registrar la salida en `specs/002-home-category-discovery/verification.md`.
- [x] T015 [P] Correr los chequeos de quickstart §1 (capas, colores escritos a mano, código muerto) y registrar los resultados en `specs/002-home-category-discovery/verification.md`.
- [x] T016 [P] Revisión responsive según quickstart §3: 1366 × 768 y 375 × 667 (SC-001), y 320, 360, 768, 1280 y 1920 px sin scroll horizontal ni texto desbordado (SC-005, FR-020). Registrar capturas o mediciones en `specs/002-home-category-discovery/verification.md`.
- [x] T017 [P] Recorrido completo con teclado en `/` (header → buscador → categorías → tarjetas → footer), con foco visible siempre, y prueba con `prefers-reduced-motion: reduce` emulado en DevTools (SC-007, FR-022). Registrarlo en `specs/002-home-category-discovery/verification.md`.
- [ ] T018 Lighthouse móvil en `/` después del cambio (quickstart §4): Accesibilidad ≥ 95, Performance ≥ 85, LCP ≤ 2.5 s, CLS ≤ 0.1. Comparar con la línea base de T002 y justificar cualquier caída de más de 10 puntos en `specs/002-home-category-discovery/verification.md`.
- [ ] T019 **La persona** corre `npm run build` (Q3) y confirma que no aparecen avisos "Blocking Route" en `/`. Registrarlo en `specs/002-home-category-discovery/verification.md`.
- [x] T020 Regresión según quickstart §5: `/catalogo` (búsqueda, filtro, paginación), `/recurso/{slug}` (galería, descarga), `/admin/login` → panel y menú móvil en `/` (SC-008). Registrarla en `specs/002-home-category-discovery/verification.md`.
- [x] T021 Completar `specs/002-home-category-discovery/verification.md` con el checklist de principios I a IX y de las puertas Q1 a Q7 para el PR, y marcar las tareas completadas en este `tasks.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: arranca de inmediato. T002 necesita T001.
- **Foundational (Phase 2)**: vacía.
- **US1, US2 y US3 (Phases 3 a 5)**: dependen solo de la Phase 1 y son independientes entre sí, salvo una dependencia de archivo: **T012 va después de T007** (`section-skeletons`).
- **Polish (Phase 6)**: después de las historias que se vayan a entregar. T018 necesita T002. T021 va al final.

### User Story Dependencies

- **US1**: ninguna. Toca `header` y `hero`.
- **US2**: ninguna. Toca `category-section` y `section-skeletons`.
- **US3**: ninguna funcional. Comparte `section-skeletons` con US2 (T012 después de T007).

### Within Each User Story

- Las tareas de implementación van antes que la de verificación (T005, T008, T013).
- T011 (borrado) va después de T010 y de la aprobación.

### Parallel Opportunities

- T003 ∥ T004 (archivos distintos).
- T006 ∥ T007 (archivos distintos; el skeleton importa las clases nuevas, conviene revisar T007 después de T006).
- T009 ∥ T010.
- Entre historias: T003, T004, T006, T009 y T010 pueden ir juntas.
- Polish: T015 ∥ T016 ∥ T017.

---

## Parallel Example: User Story 1

```text
Task: "T003 [US1] Ocultar SearchBox en '/' en src/components/public/header/index.tsx"
Task: "T004 [US1] Compactar el hero en src/components/public/hero/index.tsx"
→ luego T005 (verificación)
```

## Parallel Example: User Story 2

```text
Task: "T006 [US2] Fila única en src/components/public/category-section/index.tsx"
Task: "T007 [US2] Skeleton de fila en src/components/public/section-skeletons/index.tsx"
→ luego T008 (verificación)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (T001, T002): línea base.
2. Phase 3 (T003 a T005): un solo buscador y hero compacto.
3. **STOP and VALIDATE**: con esto ya se resuelve la redundancia más visible y el problema del pliegue.

### Incremental Delivery

1. US1, después US2 (categorías en fila) y después US3 (novedades y retiro de `ValueProps`).
2. La constitución sugiere un PR por historia. Como el total está muy por debajo de 400 líneas, se puede unir en un
   solo PR si se justifica en la descripción.
3. Phase 6 una vez, antes del PR final.

---

## Notes

- Total: 21 tareas (Setup 2 · US1 3 · US2 3 · US3 5 · Polish 8).
- [P] = archivos distintos y sin dependencias pendientes.
- Hacer commit por historia con Conventional Commits, por ejemplo `feat(home): ...` o `refactor(home): ...`.
- Las clases de Tailwind indicadas son el objetivo de diseño. Si la verificación (T005, T008 o T016) muestra que no se cumple el presupuesto de alto o el pliegue (SC-001), ajustar el espaciado dentro de la misma escala y registrar el cambio en `verification.md`.
