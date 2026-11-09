# Research: Portada orientada al descubrimiento por categorías

**Feature**: `002-home-category-discovery` · **Fecha**: 2026-11-09 · **Spec**: [spec.md](./spec.md)

No quedaron `NEEDS CLARIFICATION` en el Technical Context. Cada decisión se tomó leyendo el código actual
(punto de partida: la portada de `001-home-redesign`) y la documentación instalada de Next.js 16.

---

## R1. Ocultar el buscador del header solo en la portada (FR-004, SC-002)

**Decision**: `SearchBox` (en `src/components/public/header/index.tsx`) lee `usePathname()` y devuelve `null`
cuando la ruta es `/`. Ya está dentro de un `<Suspense>` con un fallback del mismo tamaño, así que no hace falta
otro límite.

**Rationale**: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md` (sección
"Cache Components") dice que en **rutas estáticas** el pathname se resuelve durante el prerender. `/` es estática,
así que el HTML inicial de la portada ya sale **sin** el buscador: no hay placeholder que desaparezca después ni
salto de layout (CLS). En las rutas dinámicas (`/recurso/[slug]`, `/catalogo` con `searchParams`) el componente se
suspende y muestra el fallback actual, igual que hoy. El aviso de "hydration mismatch con rewrites" no aplica:
`src/proxy.ts` solo cubre `/admin/:path*`.

**Alternatives considered**:
- *Pasarle una prop `hideSearch` al `Header` desde la página*: imposible, porque el `Header` vive en
  `(public)/layout.tsx` y los layouts no reciben el pathname ni las props de la página.
- *Mover el `Header` a cada página*: duplica el layout y rompe la preservación de estado entre navegaciones.
- *Ocultarlo con CSS según un atributo de la página*: frágil y deja un formulario oculto en el árbol accesible.

## R2. Fila única de categorías en todos los tamaños (FR-010 a FR-013)

**Decision**: `CategorySection` sigue siendo un Server Component. La lista pasa a ser **una sola fila** con
desplazamiento horizontal propio en todos los anchos (`flex` + `overflow-x-auto` + `snap-x` + `scrollbar-hide`).
Se elimina el cambio a grilla desde `sm`. Cada elemento tiene un ancho fijo (ícono arriba y nombre debajo), de modo
que, cuando no entran todos, el último visible queda cortado y eso indica que hay más contenido.

**Rationale**:
- El "último elemento cortado" (peek) indica el desborde **sin JavaScript**, así que el componente no tiene que
  pasar a cliente (Principio I: `"use client"` solo en hojas que lo necesitan; Principio VIII: datos en el servidor).
- La navegación con teclado es nativa: cada categoría es un `<a>` y, al recibir el foco, el navegador desplaza la
  fila hasta mostrarlo (FR-013, SC-007).
- Con las 8 categorías del seed y un ancho de elemento de unos 112–128 px, en escritorio (contenedor `max-w-6xl`)
  entran todas en una fila; en móvil se desplazan. El caso de "muchas categorías" (edge case) queda cubierto por la
  misma regla.
- Se conservan el ícono por categoría (`CategoryIcon`, con `LayoutGrid` de respaldo) y la cantidad de recursos
  publicados como dato secundario.

**Alternatives considered**:
- *Reutilizar `CategoryBar` (píldoras con flechas, la del catálogo)*: es cliente, no tiene íconos y su estado
  "activo" depende de los `searchParams` del catálogo. En la portada no hay categoría activa.
- *Flechas o degradado en los bordes con detección de desborde*: obliga a pasar a cliente
  (`ResizeObserver`/`scroll`) solo por una señal visual que el corte del último elemento ya da.
- *Degradado fijo con CSS (`mask-image`)*: se vería aunque no haya desborde y taparía la última categoría cuando
  entran todas.

## R3. Hero compacto (FR-006, FR-007, SC-001)

**Decision**: se mantienen la etiqueta corta, el título, una línea de subtítulo y `HeroSearch` sin cambios de
comportamiento. Se **quitan** los dos enlaces secundarios ("Explorar recursos" y "Ver categorías") y se reducen los
espaciados verticales y la escala tipográfica del título (máximo `text-5xl` en escritorio, `text-3xl` en móvil).
Presupuesto de alto: el hero no supera unos 320 px en escritorio ni unos 300 px en móvil (se mide en la
verificación, ver quickstart).

**Rationale**: con un header de 64 px y una ventana útil de unos 650 px en 1366 × 768, hero (≤ 320 px) más fila de
categorías (≤ 200 px) dejan visible el comienzo de novedades (SC-001). "Ver categorías" apuntaba a un ancla que
ahora queda justo debajo y "Explorar recursos" repite el "Ver todos" de novedades, el enlace "Catálogo" del header
y el del footer.

**Alternatives considered**: *eliminar también la etiqueta o el subtítulo*: se descartó porque comunican el
propósito ("gratis, sin registro") que antes repetía el bloque de beneficios, que ahora se elimina (R5).

## R4. Novedades: sin cambios de datos (FR-015 a FR-018)

**Decision**: `RecentDesigns` sigue usando `getPublishedDesigns({ take: 8 })`, que ya ordena por
`publishedAt desc`, y `DesignGrid`/`DesignCard` tal como están. Solo se ajustan el espaciado de la sección y el
texto del enlace al catálogo, para que se lea como acción ("Ver todo el catálogo").

**Rationale**: la consulta y la tarjeta ya cumplen con la spec (vista previa protagonista con `aspect-4/3`,
nombre, categoría, enlace a `/recurso/[slug]`, reemplazo "Sin imagen" del mismo tamaño). Principio II: no se
reescribe lo que funciona.

**Riesgo detectado (sin acción en esta feature)**: en PostgreSQL `ORDER BY ... DESC` pone los `NULL` primero. Hoy
no puede haber un diseño `published` con `publishedAt` nulo: `createDesign`, `updateDesign` y `toggleDesignStatus`
lo setean al publicar (`src/lib/db/queries/designs.ts:144,261,276`). Si en el futuro se publicara por otro camino,
ese diseño aparecería primero. Queda registrado y no se toca la consulta (FR-024).

## R5. Retirar el bloque de beneficios (FR-002)

**Decision**: se quita `<ValueProps />` de `(public)/page.tsx` y se elimina `src/components/public/value-props/`,
que no se usa en ningún otro lugar (`rg "ValueProps" src` solo devuelve `page.tsx`).

**Rationale**: Principio II prohíbe dejar código muerto. Su contenido ("Gratis", "Sin registro", tipos de recurso)
ya aparece en la etiqueta y el subtítulo del hero y en la descripción del footer.

**Gate**: el Principio IX exige aprobación explícita para **borrar archivos**. La aprobación de `tasks.md` cubre
este borrado. Si no se aprueba, la alternativa es dejar de importarlo y borrarlo en otra iteración (y registrarlo
como deuda).

## R6. Estados de carga, vacío y error (FR-019, Principio V)

**Decision**: se conservan `SectionError` y los `<Suspense>` por sección. `CategorySectionSkeleton` se actualiza
para que tenga la misma forma que la fila nueva, compartiendo las clases exportadas de `category-section`
(patrón de 001) y con el mismo espaciado vertical de la sección real, para no generar CLS.

**Rationale**: ya existe el patrón "clases compartidas entre la sección y su skeleton"; solo cambia la forma.

## R7. Movimiento reducido y consistencia (FR-021, FR-022)

**Decision**: se reutilizan `animate-fade-up` y los retardos escalonados actuales (ya desactivados con
`prefers-reduced-motion` en `globals.css`) y `motion-reduce:transform-none` en el hover de los íconos. No se agregan
tokens ni colores nuevos: todo sale de `--primary`, `--muted`, etc. (Principio V).

## R8. Verificación sin framework de pruebas (Principio VII, D8)

**Decision**: la verificación es manual, guiada por `quickstart.md`: lint (Q1), typecheck (Q2), build (Q3), revisión
en 360/768/1280 px y en las ventanas de SC-001, recorrido con teclado y Lighthouse en `/` (Q7), y una regresión de
`/catalogo`, `/recurso/[slug]`, descargas y `/admin/login`.

**Nota de proceso**: la regla global del usuario dice "no compilar después de cambios". La puerta Q3 de la
constitución exige `npm run build` antes del merge. Se resuelve así: el build lo corre la persona en la etapa de
verificación, no el agente después de cada cambio.
