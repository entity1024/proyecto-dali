# Research: Rediseño de la página principal

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-09

Las cuatro aclaraciones de la spec se resolvieron en la sesión del 2026-11-09. Este documento resuelve las
incógnitas técnicas que aparecen al contrastar la spec con el código.

---

## R1. Contador de recursos publicados por categoría (FR-011, C1)

**Decision**: agregar una consulta pública nueva, `getPublicCategories()`, en `src/lib/db/queries/categories.ts`.
Devuelve solo las categorías activas, ordenadas por `displayOrder`, con
`_count: { select: { designs: { where: { status: "published" } } } }`. La usan la portada, el pie y la barra de
categorías del catálogo. `getCategories()` queda como está.

**Rationale**: `getCategories()` también la consume el panel de administración
(`admin/categorias/page.tsx`, que muestra `_count.designs` en `categories-client.tsx:256`, y los formularios de
recursos). Cambiar su conteo modificaría el admin, y la spec lo prohíbe (FR-023). Prisma 5 admite conteos
filtrados de relaciones, así que no hacen falta cambios de esquema ni SQL crudo. Además, el filtro `isActive` pasa
de los componentes (que hoy hacen `.filter((c) => c.isActive)` en tres lugares) a la consulta: queda una sola
fuente de verdad (Principio II).

**Alternatives considered**:
- Agregar un parámetro `getCategories({ publishedOnly })`: mezcla dos responsabilidades (admin y público) en una
  sola función, y es fácil equivocarse al llamarla.
- Contar en memoria trayendo los diseños: genera consultas N+1 o transfiere datos de más (Principio VIII).

## R2. Ícono por categoría (FR-007, FR-009, Q2)

**Decision**: crear un módulo de presentación `src/components/public/category-icon/index.tsx` con un mapa
`slug → ícono de lucide-react` y el ícono `LayoutGrid` como respaldo. Mapa inicial, que replica la semántica de
los emoji actuales:

| slug | ícono |
|------|-------|
| calendarios | `Calendar` |
| tipografias-y-alfabetos | `Type` |
| material-escolar | `BookOpen` |
| banners | `Image` |
| posters | `Palette` |
| invitaciones | `Mail` |
| papeleria-digital | `FileText` |
| etiquetas | `Tag` |
| marcos | `Frame` |
| fondos | `Mountain` |
| patrones | `Shapes` |
| iconos | `Sparkles` |
| *(cualquier otro)* | `LayoutGrid` |

Verificado: los 13 íconos existen en la versión instalada, `lucide-react@1.70.0` (`dist/lucide-react.d.ts`). Los
íconos se marcan con `aria-hidden`, porque el nombre de la categoría ya está como texto.

**Rationale**: no agrega dependencias (lucide ya es la librería de íconos declarada en `components.json`), se
dibuja igual en todos los sistemas y hereda el color de la marca. El mapa por slug ya existía con los emoji, así que
no se introduce un acoplamiento nuevo.

**Alternatives considered**: usar el campo `coverImageKey`, que no se puede cargar desde el admin (descartado en
Q2), o guardar el nombre del ícono en la base, que exige un cambio de esquema prohibido por FR-023.

## R3. Lecturas de datos con Cache Components (FR-001, Principio VIII)

**Decision**: cada sección de la portada que lee datos (categorías y recientes) se renderiza como un Server
Component asíncrono propio, envuelto en `<Suspense>` con un skeleton que tiene la misma forma que el contenido
final. No se agrega `"use cache"`. Se mantiene la invalidación actual con `revalidatePath("/")` en las Server
Actions del admin.

**Rationale**: según `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` ("Streaming uncached
data" y "Prerendering"), con `cacheComponents: true` una lectura sin caché fuera de `<Suspense>` dispara el aviso
**blocking-route**. Con `<Suspense>`, la parte estática (encabezado, bloque principal y buscador) sale en el
primer HTML y los datos llegan después por streaming. Eso favorece SC-001 (buscador visible de inmediato) y SC-007
(LCP y CLS), y además cubre el estado de carga que exige el Principio V. Agregar `"use cache"` cambiaría la forma en
que se invalidan los datos cuando el admin publica algo: es una decisión de caché que no le corresponde a esta
feature.

**Alternatives considered**: `"use cache"` con `cacheLife` (descartado por lo anterior, y conviene evaluarlo en una
spec de rendimiento propia), o mantener las lecturas bloqueantes como están hoy (descartado porque retrasa el
buscador).

## R4. Construcción de la URL de búsqueda (FR-004, Principio II)

**Decision**: extraer una función pura, `buildCatalogHref({ q, categoria })`, a `src/lib/catalog-url.ts`. La usan el
buscador del encabezado, el buscador principal nuevo y la barra de categorías. Recorta el término, omite los
parámetros vacíos y codifica con `URLSearchParams`.

**Rationale**: hoy la URL `/catalogo?...` se arma a mano en tres componentes (`header`, `search-bar` y
`category-bar`). Agregar un buscador más sin extraer la función llevaría a cuatro copias de la misma regla. Las
salidas tienen que ser idénticas a las actuales; el contrato está en [contracts/ui-navigation.md](./contracts/ui-navigation.md).

**Alternatives considered**: copiar la lógica en el componente nuevo, que viola el Principio II.

**Nota de compatibilidad**: el `SearchBar` del catálogo conserva los parámetros existentes y borra `pagina`. Ese
comportamiento se mantiene: el helper acepta los parámetros actuales como entrada.

## R5. Convivencia de los dos buscadores en la portada (C3, FR-006)

**Decision**: el encabezado mantiene su buscador compacto (la lupa que se despliega) en todas las páginas,
incluida la portada. En la portada, el protagonismo lo tiene el buscador principal, por tamaño, posición y
contraste. No se oculta ni se transforma la búsqueda del encabezado según el scroll.

**Rationale**: es la opción más simple que cumple FR-006 (búsqueda disponible en todas las páginas) sin agregar un
`IntersectionObserver` ni estados de scroll. La regla de la URL es una sola (R4), así que tener dos puntos de
entrada no duplica lógica.

**Alternatives considered**: ocultar la lupa del encabezado mientras el buscador principal está a la vista, al
estilo Airbnb. Suma complejidad de cliente y riesgo de CLS. Puede evaluarse como mejora posterior.

## R6. Datos de la tarjeta y miniatura (FR-012, FR-013)

**Decision**: extraer la conversión "diseño de la consulta → datos de tarjeta" (slug, nombre, categoría y URL de la
miniatura con respaldo a la imagen original) a una función `toDesignCardData()` en
`src/lib/presenters/design-card.ts`. La usan la portada, el catálogo y `RelatedDesigns`.

**Rationale**: esa conversión está copiada en tres archivos (`(public)/page.tsx`, `catalogo/page.tsx` y
`related-designs`), y esta feature igual va a tocar los tres, porque cambian las tarjetas en todo el sitio (Q1).
Unificarla ahora cuesta poco y cumple el Principio II. No cambia el comportamiento: se sigue priorizando
`thumbnailKey` sobre `storageKey`, y si no hay ninguno el valor es `null`.

**Alternatives considered**: dejar las tres copias, que sigue violando el Principio II justo en archivos que se
están modificando.

## R7. Colores escritos a mano (C4, Principio V)

**Decision**: reemplazar `shadow-[0_0_0_3px_oklch(...)]` en `header` y `search-bar` por `ring-3 ring-ring/20` (o
el equivalente con los tokens `--ring`/`--primary`), y `bg-white` en el overlay de `design-card` por
`bg-background`.

**Rationale**: la constitución prohíbe los colores escritos a mano. Los tokens ya existen en `globals.css`.

## R8. Anclas internas (C5, escenario 5.3)

**Decision**: las secciones de la portada llevan los ids `#categorias` (como hoy) y `#novedades` (nuevo). El enlace
"Novedades" del pie cambia de `/` a `/#novedades`. El botón "Ver categorías" del bloque principal sigue apuntando a
`#categorias`. Las secciones con ancla llevan `scroll-margin-top` igual a la altura del encabezado fijo, para que el
título no quede tapado.

## R9. Verificación sin framework de pruebas (Principio VII, D8)

**Decision**: no se adopta un framework de pruebas en esta feature. La verificación se hace con lint, `tsc
--noEmit`, build, los escenarios manuales de [quickstart.md](./quickstart.md) y Lighthouse.

**Rationale**: adoptar un framework requiere un ADR propio (constitución, sección Stack). Mezclarlo con un rediseño
visual agranda el PR y diluye la revisión.

## R10. Estado de error por sección (Principio V, hallazgo D2 de `/speckit-analyze`)

**Decision**: crear un componente cliente `src/components/public/section-error/index.tsx` hecho con `catchError` de
`next/error`. Recibe como props `{ title, message }` y usa `ErrorInfo.retry()`. Cada sección de la portada que lee
datos se envuelve así: `<SectionError …><Suspense fallback={<Skeleton/>}><Section/></Suspense></SectionError>`. El
fallback muestra el título de la sección, el mensaje en español, el botón "Reintentar" y un enlace "Ver el
catálogo". **Nunca** muestra `error.message` (Principio III).

**Rationale**: según `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/catchError.md`, `catchError`
crea un error boundary por componente, se integra con `notFound()` y `redirect()` sin atraparlos y limpia el estado
al navegar. Así, una falla de la base afecta solo a su sección y no a toda la portada.

**Alternatives considered**: `error.js` por ruta, que hace caer la portada completa ante cualquier falla;
`try/catch` dentro del Server Component, que no ofrece reintento y mezcla presentación con manejo de errores; ocultar
la sección, que contradice el Principio V (opción b del análisis, descartada).

**Excepción**: el pie mantiene su `.catch(() => [])` actual (FR-016), porque es una lista secundaria de enlaces y
no una sección de contenido.

## R11. Validación de `searchParams` del catálogo (Principio III, hallazgo C1)

**Decision**: crear un esquema Zod en `src/lib/validations/catalog.ts`: `q` y `categoria` como strings
opcionales, y `pagina` convertida a entero ≥ 1, con 1 cuando el valor es inválido (`.catch(1)`). Lo usa
`catalogo/page.tsx` antes de consultar.

**Rationale**: la constitución exige validar todo dato externo. Hoy `pagina=abc` produce `NaN`. Los valores
válidos dan exactamente el mismo resultado que antes, así que FR-005 y FR-024 se mantienen.

## R12. Ajustes descubiertos durante `/speckit-implement` (2026-11-09)

1. **Íconos para slugs reales**: la base tiene `plantillas` y `elementos-decorativos`, que no estaban en el mapa de
   R2. Se agregaron `LayoutTemplate` y `Flower2`, verificados en `lucide-react@1.70.0`.
2. **Blocking Route en el layout público** (el overlay de Next lo mostraba en todas las rutas públicas; ya pasaba en
   `main`):
   - `Footer` hacía `await` de la base fuera de `<Suspense>`. La lista se movió a `FooterCategories` dentro de
     `<Suspense fallback={null}>`.
   - `new Date().getFullYear()` del copyright pasó a `CopyrightYear` con `"use cache"` + `cacheLife("days")`. **No
     contradice R3**: R3 descarta `"use cache"` para datos que el admin invalida al publicar; el año no es un dato
     del admin.
   - `Header` llamaba a `usePathname()` fuera de `<Suspense>` (afecta a las rutas dinámicas). La navegación con marca
     de activo pasó a `DesktopNav` dentro de `<Suspense>`, con un fallback de los mismos enlaces sin marca (sin CLS).
     `MobileMenu` también quedó dentro de `<Suspense>`.
3. **Error de lint en `main`**: `search-bar` llamaba a `setState` de forma sincrónica dentro de `useEffect` (regla
   `react-hooks`). Se reemplazó por el patrón "ajustar estado durante el render" de React. Hacía falta para la puerta
   Q1.
4. **`scrollbar-hide` no existía**: `category-bar` usaba esa clase pero nunca se había definido. Se agregó como
   `@utility` de Tailwind 4 en `globals.css`; también la usa la fila de categorías en móvil (U1).
5. **Valores arbitrarios preexistentes**: `aspect-[4/3]` en `catalogo/loading.tsx` y en `recurso/[slug]/image-gallery.tsx`
   se reemplazaron por `aspect-4/3` (T038). `loading.tsx` además se alineó con la tarjeta nueva para evitar CLS.
   `image-gallery.tsx` figuraba como "sin cambios" en el plan; el cambio es solo esa clase equivalente.
6. **Placeholder del buscador principal**: "¿Qué recurso buscás?" se cortaba a 360 px. Pasó a "Buscá un recurso".

## Hallazgos fuera de alcance (registrados, no se tocan)

- **Blocking Route en `/recurso/[slug]/page.tsx`**: la página de detalle lee la base fuera de `<Suspense>`. Ya pasaba
  en `main`, y el plan declara ese archivo sin cambios. Se resuelve en una spec propia.
- **Admin, `next/image`**: `src/components/admin/image-uploader` falla con `hostname "localhost" is not configured`
  (log de desarrollo). Es del panel admin, que está fuera de alcance.

- **Paginación en memoria**: `catalogo/page.tsx` trae todos los diseños publicados y los corta en memoria. Viola el
  Principio VIII (consultas públicas sin límite). Se resuelve con una spec propia, porque cambia la consulta de
  búsqueda, y la spec congela esos criterios (FR-005).
- **Modo oscuro**: `next-themes` está instalado pero no hay un `ThemeProvider`. Queda fuera de alcance según la spec.
