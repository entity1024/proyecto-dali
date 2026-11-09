---

description: "Task list for 001-home-redesign"
---

# Tasks: Rediseño de la página principal de Plantillarte

**Input**: Design documents from `/specs/001-home-redesign/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/ui-navigation.md](./contracts/ui-navigation.md),
[quickstart.md](./quickstart.md)

**Tests**: la spec no pide pruebas automatizadas y el proyecto no tiene framework de pruebas (research R9). En su
lugar, cada fase cierra con una tarea **Verificar** que ejecuta los escenarios del quickstart y registra la
evidencia en `specs/001-home-redesign/verification.md` (constitución, Principio VII).

**Organization**: las tareas se agrupan por historia de usuario para que cada una se pueda implementar y
verificar de forma independiente.

**Revisión**: v2 (2026-11-09). Incorpora la remediación de `/speckit-analyze`: D2 (tres estados por sección), D3 (sin
valores arbitrarios), C1 (validación de `searchParams`), U1 (categorías en móvil), U2 (input de búsqueda), F1, A1 y
A2. Se renumeró: hay 43 tareas.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (toca otro archivo y no depende de tareas incompletas)
- **[Story]**: historia de usuario de la spec (US1–US5)

## Reglas para quien implemente (humano o agente)

- **NO tocar**: `src/app/(admin)/**`, `src/app/api/**`, `src/lib/actions/**`, `src/lib/auth/**`, `src/lib/storage/**`,
  `prisma/**`, `src/components/admin/**`, `src/components/ui/**`. Tampoco `getCategories()` en
  `src/lib/db/queries/categories.ts`.
- **Sin dependencias nuevas.** Íconos solo de `lucide-react`; estilos solo con clases de Tailwind y tokens de
  `src/app/globals.css` (`primary`, `muted`, `ring`, `background`, `foreground`, `border`, `card`, paleta `blue-*`).
  Están **prohibidos** los colores hex, rgb u oklch escritos a mano, `bg-white` y los valores arbitrarios de
  Tailwind (`[#…]`, `[4/3]`, `[13px]`). Hay que usar las utilidades nativas de Tailwind 4 (por ejemplo `aspect-4/3`).
- Antes de usar una API de Next.js, consultar `node_modules/next/dist/docs/` (AGENTS.md). Con `cacheComponents`
  activo, toda lectura de la base en la portada va dentro de `<Suspense>` (research R3). No agregar `"use cache"`.
- Toda sección de la portada que lee datos tiene **tres estados**: carga (skeleton), vacío (mensaje + enlace al
  catálogo) y error (mensaje + "Reintentar" + enlace). Ver [data-model.md](./data-model.md) y research R10.
  Nunca se muestra `error.message`.
- Textos visibles en español. Identificadores en inglés.
- **El agente no ejecuta `npm run build`** (regla del usuario). La puerta Q3 la corre una persona en T042.

---

## Phase 1: Setup

**Purpose**: rama de trabajo y línea base para detectar regresiones.

- [X] T001 Crear la rama `001-home-redesign` desde `main` (`git switch -c 001-home-redesign`). Confirmar con `git branch --show-current`; no se toca ningún archivo del repositorio
- [X] T002 Crear `specs/001-home-redesign/verification.md` y registrar en la sección "Línea base" lo que pide [quickstart.md §0](./quickstart.md): Lighthouse móvil de `/` y `/catalogo` (Performance, Accesibilidad, LCP, CLS), los totales de `/catalogo?q=poster`, `/catalogo?categoria=<slug>` y `/catalogo?pagina=2`, y los contadores actuales de `/admin/categorias`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: unificar las reglas duplicadas (research R1, R4 y R6), validar la entrada del catálogo (R11) y migrar
los consumidores actuales, **sin cambio visual**. Así, cualquier regresión de comportamiento aparece acá y no se
mezcla con el rediseño.

**⚠️ CRITICAL**: ninguna historia empieza hasta cerrar esta fase.

- [X] T003 [P] Crear `src/lib/catalog-url.ts` con la función pura `buildCatalogHref({ q, categoria, base }: { q?: string; categoria?: string; base?: URLSearchParams | string }): string`, siguiendo las reglas 1–5 y la tabla de [contracts/ui-navigation.md §2](./contracts/ui-navigation.md): recortar `q`, omitir los vacíos, eliminar `pagina` cuando viene `base`, codificar con `URLSearchParams` y devolver `/catalogo` sin `?` si no queda ningún parámetro
- [X] T004 [P] Crear `src/lib/presenters/design-card.ts`. Exportar el tipo `DesignCardData` (`slug`, `name`, `categoryName`, `categorySlug`, `thumbnailUrl: string | null`) y la función `toDesignCardData(design, storage)`, que replica la lógica actual de `src/app/(public)/page.tsx` líneas 18–28: usar `images[0].thumbnailKey`, si no existe `images[0].storageKey`, y si no hay ninguno `null`, siempre con `storage.getPublicUrl`. El parámetro `design` se tipa con lo que devuelven `getPublishedDesigns` y `getRelatedDesigns`
- [X] T005 [P] Agregar `getPublicCategories()` en `src/lib/db/queries/categories.ts` **sin modificar `getCategories()`**: `prisma.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" }, select: { id, name, slug, _count: { select: { designs: { where: { status: "published" } } } } } })`. Ver [data-model.md](./data-model.md), "Consulta nueva"
- [X] T006 [P] Crear `src/lib/validations/catalog.ts` con `catalogSearchParamsSchema` en Zod: `q: z.string().optional()`, `categoria: z.string().optional()` y `pagina: z.coerce.number().int().min(1).catch(1)`. Exportar el tipo inferido (research R11). Antes, revisar en `node_modules/zod` que `.catch()` y `z.coerce` existan en Zod 4
- [X] T007 Migrar `handleSubmit` de `SearchBox` en `src/components/public/header/index.tsx` a `router.push(buildCatalogHref({ q: value }))`. Sin cambios visuales (depende de T003)
- [X] T008 [P] Migrar `handleSubmit` y `handleClear` de `src/components/public/search-bar/index.tsx` a `buildCatalogHref({ q, base: searchParams })`. Debe seguir conservando `categoria` y eliminando `pagina` (depende de T003)
- [X] T009 [P] Reemplazar `buildHref` en `src/components/public/category-bar/index.tsx` por `buildCatalogHref({ categoria: slug, q })`. "Todos" sigue conservando `q` (depende de T003)
- [X] T010 [P] Reemplazar el mapeo manual de diseños en `src/app/(public)/page.tsx` por `rawDesigns.map((d) => toDesignCardData(d, storage))` (depende de T004)
- [X] T011 [P] En `src/app/(public)/catalogo/page.tsx`: (1) parsear `await searchParams` con `catalogSearchParamsSchema.parse(...)` y eliminar el `parseInt` manual; (2) usar `toDesignCardData` para el mapeo; (3) reemplazar `getCategories()` + `.filter((c) => c.isActive)` por `getPublicCategories()` y pasar a `CategoryBar` las categorías con la forma `{ id, name, slug }`. La paginación y los textos no cambian (depende de T004, T005 y T006)
- [X] T012 [P] Usar `toDesignCardData` en `src/components/public/related-designs/index.tsx` (depende de T004)
- [X] T013 [P] En `src/components/public/footer/index.tsx`, reemplazar `getCategories()` + filtro por `getPublicCategories()`. Conservar `.catch(() => [])` y `.slice(0, 6)` (depende de T005; research R10, excepción del pie)
- [X] T014 Verificar la Fase 2: `npm run lint` y `npx tsc --noEmit` sin errores; quickstart F2–F5, F14, F15, F17 y F19 iguales a la línea base de T002, o con el resultado esperado en F19. Registrar en `specs/001-home-redesign/verification.md`

**Checkpoint**: el comportamiento es idéntico (salvo la página inválida, que ahora cae en la 1) y las tres duplicaciones quedaron eliminadas. Se puede entregar como el PR 1.

---

## Phase 3: User Story 1 - Buscar un recurso desde la portada (Priority: P1) 🎯 MVP

**Goal**: buscador siempre visible y protagonista en el bloque principal, que genera las mismas URLs que hoy.

**Independent Test**: en `/`, a 360, 768 y 1280 px, el buscador se ve sin desplazarse y "poster" lleva a
`/catalogo?q=poster` con los mismos resultados que en la línea base.

- [X] T015 [US1] Crear el componente cliente `src/components/public/hero-search/index.tsx` (`"use client"`). Debe ser un `<form role="search">` con un `<label>` visualmente oculto (`sr-only`) "Buscar recursos" asociado a un `<input type="text" enterKeyHint="search" autoComplete="off">` (**no** `type="search"`, para evitar la cruz nativa duplicada), placeholder "¿Qué recurso buscás?", un botón para limpiar con `aria-label="Limpiar búsqueda"` (visible solo cuando hay texto) y un botón submit con texto visible "Buscar" e ícono `Search` con `aria-hidden`. Al enviar: `router.push(buildCatalogHref({ q: value }))`. La altura mínima del control es 48 px (`min-h-12`) y la de cada botón, 44 px (`size-11` o `min-h-11`). Forma de píldora (`rounded-full`), con `border`, `shadow-md`, y foco con `focus-within:ring-3 focus-within:ring-ring/30`. No usar `useSearchParams`: el valor inicial es vacío, así que no necesita `<Suspense>`
- [X] T016 [US1] Rediseñar `src/components/public/hero/index.tsx`. Conservar el texto actual (subtítulo "Recursos gráficos gratuitos", título "Diseños listos para descargar y usar", párrafo de propuesta de valor) y los dos CTA ("Explorar recursos" → `/catalogo`, "Ver categorías" → `#categorias`). Insertar `<HeroSearch />` entre el párrafo y los CTA, ancho `w-full max-w-2xl mx-auto`. Bajar el padding vertical (por ejemplo `py-12 sm:py-16 md:py-20`) y el tamaño del título en móvil (`text-3xl sm:text-5xl md:text-6xl`) para que el buscador quede completo en el primer pantallazo a 360 × 640 px con el encabezado. Los CTA pasan a estilo secundario: el buscador es el elemento más destacado (FR-003). Mantener `animate-fade-up` y usar solo tokens
- [ ] T017 [US1] Verificar US1: quickstart F1, F2, F3 y F4, y A2 limitado al buscador (Tab hasta el campo, escribir, Enter). Para SC-002, pedirle a una persona que no conozca el sitio que busque "calendario" desde `/`, cronometrar y contar las interacciones (objetivo: ≤ 2 interacciones y < 10 s). Registrar capturas a 360, 768 y 1280 px y el tiempo en `specs/001-home-redesign/verification.md`

**Checkpoint**: MVP entregable. La portada ya tiene buscador protagonista, aunque el resto todavía no tenga el rediseño.

---

## Phase 4: User Story 2 - Explorar por categoría con navegación visual (Priority: P1)

**Goal**: las categorías activas se muestran con ícono, nombre y contador de **publicados**, llevan al catálogo
filtrado y tienen los tres estados (carga, vacío y error).

**Independent Test**: cada categoría de `/` lleva a `/catalogo?categoria=<slug>` y su contador coincide con el
total del catálogo (F7). Además, si la base falla, solo esta sección muestra el error (F18).

- [X] T018 [P] [US2] Crear `src/components/public/category-icon/index.tsx` exportando `CategoryIcon({ slug, className })`, con el mapa `slug → ícono` de [research.md R2](./research.md) (`Calendar`, `Type`, `BookOpen`, `Image`, `Palette`, `Mail`, `FileText`, `Tag`, `Frame`, `Mountain`, `Shapes`, `Sparkles`) y `LayoutGrid` como respaldo. Siempre con `aria-hidden="true"`. Es un Server Component, sin `"use client"`
- [X] T019 [P] [US2] Crear el componente cliente `src/components/public/section-error/index.tsx` (`"use client"`) con `catchError` de `next/error` (research R10; leer antes `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/catchError.md`). Recibe como props `{ title: string; message: string }` y usa `ErrorInfo.retry`. El fallback es una `<section>` con el `<h2>` del título, un `<p>` con el mensaje, un `Button` "Reintentar" que llama a `retry()` y un enlace "Ver el catálogo" → `/catalogo`. **No** muestra `error.message`. Usa solo tokens y botones de al menos 44 px. Exportar por defecto el componente que devuelve `catchError`
- [X] T020 [US2] Rediseñar `src/components/public/category-section/index.tsx`: usar `getPublicCategories()` (eliminar `.filter(isActive)`), contador `_count.designs` con el texto "1 recurso" / "N recursos" y `<CategoryIcon>` dentro de un círculo `bg-primary/10 text-primary`; **eliminar la función `getCategoryEmoji`**. La sección lleva `id="categorias"` y `scroll-mt-20`, con título "Categorías", subtítulo "Explorá por tipo de recurso" y el enlace **"Ver todos"** → `/catalogo`. **Layout (U1)**: por debajo de 640 px, una fila con scroll horizontal dentro de su propio contenedor (`flex gap-3 overflow-x-auto snap-x snap-mandatory`, cada ítem con `shrink-0 snap-start` y un ancho que deje el último visible a medias como indicio), sin scroll horizontal de la página; desde `sm` en adelante, grilla `sm:grid sm:grid-cols-4 lg:grid-cols-6 sm:gap-4`. Cada ítem es un `Link` a `/catalogo?categoria=<slug>`, de al menos 44 × 44 px, con `focus-visible:ring-3 focus-visible:ring-ring/50`. El nombre se corta con `line-clamp-2` y lleva `break-words`. **Estado vacío**: si no hay categorías, se renderiza la sección con su título, el mensaje "Todavía no hay categorías disponibles" y el enlace "Ver el catálogo" → `/catalogo` ([data-model.md](./data-model.md))
- [X] T021 [US2] Agregar `CategorySectionSkeleton` en el archivo nuevo `src/components/public/section-skeletons/index.tsx`. Mismo layout que T020 (fila en móvil y grilla desde `sm`), 12 ítems con `bg-muted animate-pulse` y `motion-reduce:animate-none`, con `aria-hidden`
- [X] T022 [US2] En `src/app/(public)/page.tsx`, envolver la sección así: `<SectionError title="Categorías" message="No pudimos cargar las categorías"><Suspense fallback={<CategorySectionSkeleton />}><CategorySection /></Suspense></SectionError>` (research R3 y R10)
- [ ] T023 [US2] Verificar US2: quickstart F6, F7, F8 y F9; F18 y F20 limitados a la sección de categorías; y A1 limitado a esa sección a 360 px (fila con scroll interno, sin scroll de página). Registrar en `specs/001-home-redesign/verification.md` la tabla "categoría | contador en la portada | total del catálogo"

**Checkpoint**: US1 y US2 funcionan en conjunto; los dos caminos de descubrimiento están listos.

---

## Phase 5: User Story 3 - Ver los recursos recientes en tarjetas modernas (Priority: P2)

**Goal**: tarjetas con la imagen como protagonista y jerarquía clara, iguales en portada, catálogo y relacionados,
con la sección de novedades en sus tres estados.

**Independent Test**: un recurso recién publicado aparece primero en `/`, su tarjeta lleva a `/recurso/<slug>`, y
las tarjetas del catálogo y de los relacionados tienen el mismo diseño.

- [X] T024 [US3] Rediseñar `src/components/public/design-card/index.tsx` sin cambiar sus props (`DesignCardData` + `animationDelay?`). La tarjeta es un único `Link` a `/recurso/<slug>`. La imagen va con **`aspect-4/3`** (utilidad nativa, no `aspect-[4/3]`), `rounded-xl`, `overflow-hidden` y `bg-muted`; usa `next/image` con `fill`, el `sizes` actual, `alt={name}` y `group-hover:scale-105 motion-reduce:transform-none`. Se quita el borde de la tarjeta y el overlay azul con `bg-white`; el hover queda como zoom suave de la imagen más subrayado del título. Debajo de la imagen: título `font-semibold line-clamp-2` y categoría en `text-sm text-muted-foreground` (en lugar del `Badge`). Foco con `focus-visible:ring-3 focus-visible:ring-ring/50` y `rounded-xl`. Si no hay miniatura, mostrar el ícono `ImageOff` con `aria-hidden` y el texto "Sin imagen", manteniendo la misma proporción
- [X] T025 [P] [US3] Ajustar la grilla en `src/components/public/design-grid/index.tsx`: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, con `gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10`. El estado vacío y los props no cambian
- [X] T026 [US3] Crear el Server Component asíncrono `src/components/public/recent-designs/index.tsx`, que mueve la sección "Novedades" desde `src/app/(public)/page.tsx`: `getPublishedDesigns({ take: 8 })` + `toDesignCardData`, `<section id="novedades" className="scroll-mt-20 …">`, título "Novedades", subtítulo "Los últimos recursos publicados" y "Ver todos" → `/catalogo`, con `<DesignGrid designs stagger />`. **Estado vacío**: si no hay diseños, se renderiza la sección con su título, el mensaje "Todavía no hay recursos publicados" y el enlace "Ver el catálogo" → `/catalogo`, nunca una grilla vacía (escenario 3.6)
- [X] T027 [US3] Agregar `RecentDesignsSkeleton` en `src/components/public/section-skeletons/index.tsx`: 8 tarjetas con **`aspect-4/3`**, dos líneas de texto y la misma grilla que T025, con `motion-reduce:animate-none` y `aria-hidden`
- [X] T028 [US3] En `src/app/(public)/page.tsx`, reemplazar el bloque "Novedades" en línea por `<SectionError title="Novedades" message="No pudimos cargar las novedades"><Suspense fallback={<RecentDesignsSkeleton />}><RecentDesigns /></Suspense></SectionError>` y quitar los imports que dejen de usarse (`getPublishedDesigns`, `getStorageProvider`, `toDesignCardData`, `DesignGrid`, `ArrowRight`, `Link`)
- [ ] T029 [US3] Verificar US3: quickstart F10, F11, F12 y F15; F18 y F20 limitados a Novedades; y que las tarjetas de `/catalogo` y `/recurso/<slug>` usen el diseño nuevo. Registrar en `specs/001-home-redesign/verification.md`

**Checkpoint**: tarjetas consistentes en todo el sitio público.

---

## Phase 6: User Story 4 - Navegar desde un encabezado simple y consistente (Priority: P2)

**Goal**: encabezado minimalista con los mismos destinos, accesible y sin colores escritos a mano.

**Independent Test**: en `/`, `/catalogo` y `/recurso/<slug>`, a los tres anchos, cada destino del encabezado funciona,
la página actual se distingue y el menú móvil abre y cierra.

- [X] T030 [US4] Rediseñar `Header` en `src/components/public/header/index.tsx`: altura `h-16`, `sticky top-0 z-40`, fondo `bg-background/95 backdrop-blur` y borde inferior sutil. A la izquierda la marca "Plantillarte" (`text-primary font-bold`) → `/`, al lado la navegación Inicio/Catálogo con el indicador de activo actual (FR-015) y a la derecha la búsqueda y el botón de menú. Reemplazar `shadow-[0_0_0_3px_oklch(...)]` por `ring-3 ring-ring/30` (research R7). En `SearchBox`: input con `aria-label="Buscar recursos"` y botón de limpiar con `aria-label="Limpiar búsqueda"`. En anchos menores a 768 px, los botones (lupa, cerrar, menú) miden al menos 44 × 44 px (`size-11`)
- [X] T031 [US4] En el mismo archivo `src/components/public/header/index.tsx`: el botón de menú lleva `aria-expanded={mobileOpen}`, `aria-controls="mobile-menu"` y `aria-label` que alterna entre "Abrir menú" y "Cerrar menú", con el ícono `X` cuando está abierto. `MobileMenu` lleva `id="mobile-menu"` y se cierra al elegir un enlace (como hoy) y con la tecla Escape. Los enlaces del menú tienen altura mínima de 44 px
- [X] T032 [P] [US4] En `src/components/public/search-bar/index.tsx` (buscador del catálogo): reemplazar `shadow-[0_0_0_3px_oklch(...)]` por `ring-3 ring-ring/30` y agregar `aria-label="Limpiar búsqueda"` al botón de limpiar y `aria-label="Buscar recursos"` al input
- [X] T033 [US4] Verificar US4: quickstart F5, F16 y A3, y el indicador de activo en `/` y `/catalogo`. Registrar en `specs/001-home-redesign/verification.md`

**Checkpoint**: navegación consistente en todo el sitio público.

---

## Phase 7: User Story 5 - Recorrer la portada con una jerarquía clara (Priority: P3)

**Goal**: orden final de secciones (FR-001), sección complementaria hecha con contenido existente (FR-002) y anclas que funcionan.

**Independent Test**: en `/`, a los tres anchos, el orden es encabezado → bloque principal con buscador → categorías →
novedades → propuesta de valor → pie, y los enlaces "Ver categorías" y "Novedades" del pie llegan a su sección.

- [X] T034 [P] [US5] Crear `src/components/public/value-props/index.tsx` (Server Component, sin datos) con **solo el contenido que ya existe** en el bloque principal y el pie: tres ítems con ícono `lucide` (`aria-hidden`): "Gratis" (recursos gráficos gratuitos), "Sin registro" (descargá sin crear una cuenta) y "Listos para usar" (calendarios, tipografías, posters, invitaciones y plantillas editables). Cierra con un CTA "Explorar el catálogo" → `/catalogo`. La grilla es `grid-cols-1 sm:grid-cols-3`, solo con tokens. No agregar testimonios, newsletter ni métricas (FR-002)
- [X] T035 [US5] Componer el orden final en `src/app/(public)/page.tsx`: `<Hero />` → `<SectionError…><Suspense…><CategorySection /></Suspense></SectionError>` → `<SectionError…><Suspense…><RecentDesigns /></Suspense></SectionError>` → `<ValueProps />`. Conservar `metadata`. Alternar fondos de sección con tokens (`bg-background` / `bg-muted/30`) para marcar la jerarquía
- [X] T036 [P] [US5] En `src/components/public/footer/index.tsx`, cambiar el `href` de "Novedades" de `/` a `/#novedades` ([contrato §3](./contracts/ui-navigation.md)). Ajustar el espaciado para que sea coherente con el encabezado nuevo, sin cambiar el contenido (FR-016) y solo con tokens
- [X] T037 [US5] Verificar US5: quickstart F13, y los escenarios 5.1 (orden a los tres anchos) y 5.2 (todo el contenido de la línea base sigue presente: subtítulo, título, propuesta "gratis, sin registro", CTA, categorías, novedades y pie). Registrar en `specs/001-home-redesign/verification.md`

**Checkpoint**: todas las historias completas.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T038 [P] Correr los chequeos de constitución de [quickstart.md §5](./quickstart.md): `rg "#[0-9a-fA-F]{3,6}\b|rgb\(|oklch\(|\[#|bg-white|\b[a-z-]+-\[[0-9]" src/components/public "src/app/(public)" --glob "*.tsx"` y `rg "@/lib/db/client" src/components "src/app/(public)"`. Los dos deben salir sin resultados. Corregir lo que aparezca en el archivo indicado
- [X] T039 [P] Confirmar que no se tocó nada fuera de alcance: `git diff --stat main -- "src/app/(admin)" src/app/api src/lib/actions src/lib/auth src/lib/storage prisma src/components/admin src/components/ui` debe salir vacío
- [ ] T040 Responsive y accesibilidad en `/`, `/catalogo` y `/recurso/<slug>`: quickstart A1 (360, 768, 1280 y 1920 px), A2, A4 (≥ 95), A5, A6 y A7. Sumar una **revisión manual del contraste AA** en los estados hover y foco del buscador principal, de las tarjetas y de los ítems de categoría, porque Lighthouse no los evalúa (FR-020). Corregir los hallazgos en el componente correspondiente de `src/components/public/` y registrar en `specs/001-home-redesign/verification.md`
- [ ] T041 Rendimiento: quickstart P1 y P2 comparados con la línea base de T002 (LCP ≤ 2.5 s, CLS ≤ 0.1, Performance ≥ base − 10). Registrar en `specs/001-home-redesign/verification.md`
- [ ] T042 Puertas Q1–Q3 (**las ejecuta una persona**): `npm run lint`, `npx tsc --noEmit` y `npm run build`, sin errores y sin el aviso blocking-route en `/`. Pegar la salida en `specs/001-home-redesign/verification.md`
- [ ] T043 Completar `specs/001-home-redesign/verification.md` con una fila por cada FR-001…FR-024 y SC-001…SC-008, con su estado y evidencia (Definición de Terminado, Principio VII). Pendiente para después del merge: medir SC-008 con 3 personas

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (F1)**: sin dependencias. T002 necesita la base de datos con seed.
- **Foundational (F2)**: depende de F1. **Bloquea todas las historias.**
- **US1 (F3)** y **US2 (F4)**: dependen solo de F2 y no dependen entre sí.
- **US3 (F5)**: depende de F2 y de T019 (`SectionError`, creado en US2). T028 toca `page.tsx`, igual que T022: hay que hacerlas en orden.
- **US4 (F6)**: depende de F2 (T007). Es independiente del resto.
- **US5 (F7)**: depende de US2 (T020, por `#categorias`) y de US3 (T026, por `#novedades`).
- **Polish (F8)**: depende de todas las historias que se vayan a entregar.

### Archivos compartidos (no paralelizar entre sí)

- `src/app/(public)/page.tsx`: T010 → T022 → T028 → T035
- `src/components/public/header/index.tsx`: T007 → T030 → T031
- `src/components/public/search-bar/index.tsx`: T008 → T032
- `src/components/public/footer/index.tsx`: T013 → T036
- `src/components/public/section-skeletons/index.tsx`: T021 → T027
- `src/components/public/section-error/index.tsx`: lo crea T019 y lo consumen T022 y T028

### Parallel Opportunities

```text
# Fase 2, tras T003–T006 (que son paralelas entre sí):
T008 search-bar | T009 category-bar | T010 page.tsx | T011 catalogo | T012 related | T013 footer
(T007 header también puede ir en paralelo: toca otro archivo)

# Después de la Fase 2, en paralelo por historia:
US1: T015 → T016      US2: T018 | T019 → T020 → T021 → T022      US4: T030 → T031 (+ T032 en paralelo)

# Dentro de US3:
T024 design-card | T025 design-grid

# Polish:
T038 | T039
```

---

## Implementation Strategy

### MVP First

1. F1 Setup → F2 Foundational (PR 1, sin cambio visual).
2. F3 US1, el buscador protagonista (PR 2). **STOP & VALIDATE** con T017. Ya da valor por sí solo.

### Incremental Delivery (alineado con plan, Complexity Tracking)

| PR | Fases | Valor |
|----|-------|-------|
| 1 | F1 + F2 | Duplicaciones eliminadas, contador correcto y catálogo con entrada validada |
| 2 | F3 + F4 | Los dos caminos de descubrimiento en la portada, con sus tres estados |
| 3 | F5 | Tarjetas nuevas en todo el sitio |
| 4 | F6 + F7 + F8 | Encabezado, jerarquía final y verificación completa |

Cada PR termina con su tarea **Verificar** en verde antes de pasar a revisión.
