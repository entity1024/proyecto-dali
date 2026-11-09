# Implementation Plan: Portada orientada al descubrimiento por categorías

**Branch**: `002-home-category-discovery` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-home-category-discovery/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Segunda iteración de la portada. Se reordena en **header → hero → categorías horizontales → novedades → footer**
y se eliminan las redundancias. El cambio es **solo de presentación**, en `src/app/(public)/page.tsx` y en
componentes de `src/components/public/`:

1. El buscador del header se oculta en `/` leyendo `usePathname()`, que en rutas estáticas se resuelve en el
   prerender, así que no genera CLS (research R1).
2. El hero se compacta: sin los enlaces secundarios y con menos espaciado y escala tipográfica (R3).
3. Las categorías pasan a una fila única con scroll propio en todos los anchos. Sigue siendo un Server Component y
   la señal de "hay más" es el último elemento cortado, sin JS (R2).
4. Novedades queda igual en datos, con ajustes menores de espaciado y del texto del enlace (R4).
5. Se retira el bloque de beneficios (`ValueProps`) (R5).

No se tocan el esquema, las consultas, las rutas, la autenticación ni las dependencias.

## Technical Context

**Language/Version**: TypeScript 5 (strict) · React 19 · Next.js 16 (App Router, `cacheComponents` activo)

**Primary Dependencies**: Tailwind CSS 4 · shadcn/ui (Radix) · lucide-react. Sin dependencias nuevas.

**Storage**: PostgreSQL vía Prisma 5. Solo lectura con consultas existentes (`getPublicCategories`, `getPublishedDesigns`). Sin cambios de esquema.

**Testing**: no hay framework de pruebas (deuda D8). Verificación con lint, typecheck, build y los escenarios manuales de [quickstart.md](./quickstart.md).

**Target Platform**: navegadores modernos en escritorio, tableta y móvil (de 320 a 1920 px).

**Project Type**: aplicación web monolítica Next.js (sitio público y panel admin en grupos de rutas).

**Performance Goals**: Lighthouse móvil en `/`: Performance ≥ 85, LCP ≤ 2.5 s, CLS ≤ 0.1, Accesibilidad ≥ 95.

**Constraints**: sin scroll horizontal de página; buscador y categorías visibles sin desplazarse en 1366 × 768 y 375 × 667; hero de unos 320 px de alto o menos en escritorio; `prefers-reduced-motion` respetado; solo tokens de `globals.css`.

**Scale/Scope**: 1 página (`/`) y 6 archivos de componentes. 8 categorías activas y hasta 8 novedades. Por debajo de unas 400 líneas modificadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Puerta | Evaluación | Estado |
|---|---|---|
| **I. Capas** | Las páginas y secciones siguen siendo Server Components. Solo `header` (que ya es cliente) suma `usePathname`. No se importa `prisma` en componentes. `(public)` no importa nada de `(admin)`. | ✅ |
| **II. Calidad** | No se duplican reglas: se reutilizan `buildCatalogHref`, `toDesignCardData`, `CategoryIcon` y las clases compartidas entre sección y skeleton. Se elimina el código muerto (`value-props`). Textos en español e identificadores en inglés. | ✅ |
| **III. Seguridad** | No hay endpoints, actions ni cambios de autenticación nuevos. No aplica el escenario 401/403. | ✅ N/A |
| **IV. Integridad / PostgreSQL** | Sin cambios de esquema ni migraciones. Riesgo de `NULL` en `publishedAt` documentado (R4), sin acción. | ✅ |
| **V. UX y consistencia** | Primitivas e íconos existentes, sin colores escritos a mano. Tres estados por sección conservados (R6, data-model). Terminología "recurso" / "categoría". | ✅ |
| **VI. Responsive y a11y** | Fila con scroll propio sin scroll de página, áreas de toque de 44 px, teclado nativo, un `h1` y un `role="search"`. Se verifica en 360/768/1280 px. | ✅ |
| **VII. Pruebas y aceptación** | Criterios Dado/Cuando/Entonces en la spec. Evidencia en `verification.md` según quickstart. | ✅ |
| **VIII. Rendimiento** | Datos en el servidor con `<Suspense>`, `take: 8`, `next/image` con `sizes` y miniatura. Sin `fetch` en el cliente ni JS nuevo para la fila. | ✅ |
| **IX. IA y supervisión** | Doc de `usePathname` consultada en `node_modules/next/dist/docs` (R1). **Borrar `value-props/`** requiere aprobación explícita: se pide en `tasks.md` (R5). | ⚠️ Requiere aprobación |
| **Q1–Q3** | Lint y typecheck los corre el agente. El build lo corre la persona (R8). | Pendiente de implementación |
| **Q4 / Q6** | No aplican (sin esquema ni endpoints). | N/A |
| **Q5 / Q7** | Evidencia y revisión responsive, de teclado y Lighthouse según quickstart. | Pendiente de implementación |

**Resultado antes de Phase 0**: PASA. No hay violaciones. Solo queda la aprobación de borrado del Principio IX.
**Re-chequeo después de Phase 1**: PASA. El diseño (contracts, data-model) no agrega capas, datos ni dependencias.

## Project Structure

### Documentation (this feature)

```text
specs/002-home-category-discovery/
├── plan.md              # Este archivo
├── research.md          # Phase 0: decisiones R1–R8
├── data-model.md        # Phase 1: datos existentes que lee la portada (sin cambios de esquema)
├── quickstart.md        # Phase 1: guía de validación
├── contracts/
│   └── ui-navigation.md # Phase 1: rutas, anclas, header según ruta y orden de secciones
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks, todavía no se creó)
```

### Source Code (repository root)

```text
src/
├── app/(public)/
│   └── page.tsx                         # MODIFICA: quita <ValueProps/>; orden hero → categorías → novedades
└── components/public/
    ├── header/index.tsx                 # MODIFICA: SearchBox devuelve null en "/" (R1)
    ├── hero/index.tsx                   # MODIFICA: compacto, sin enlaces secundarios (R3)
    ├── category-section/index.tsx       # MODIFICA: fila única con scroll propio en todos los anchos (R2)
    ├── section-skeletons/index.tsx      # MODIFICA: skeleton de categorías con la forma nueva (R6)
    ├── recent-designs/index.tsx         # MODIFICA: espaciado y texto "Ver todo el catálogo" (R4)
    └── value-props/                     # ELIMINA (requiere aprobación, R5)

# Sin cambios: hero-search, design-card, design-grid, category-icon, footer, section-error,
# category-bar, search-bar, src/lib/**, prisma/**, src/app/api/**, src/app/(admin)/**
```

**Structure Decision**: proyecto Next.js único. Todos los cambios quedan en la capa de presentación pública
(`src/app/(public)` y `src/components/public`). Sugerencia de corte en PRs según la constitución (una historia por
PR): US1 (header y hero) · US2 (categorías y skeleton) · US3 (novedades, retiro de `ValueProps`). Como son chicos,
se pueden unir en un solo PR si se justifica.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
