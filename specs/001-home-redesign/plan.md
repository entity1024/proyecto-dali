# Implementation Plan: Rediseño de la página principal de Plantillarte

**Branch**: `001-home-redesign` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-home-redesign/spec.md`

> ⚠️ El repositorio sigue en `main`. Antes de `/speckit-implement` hay que crear la rama `001-home-redesign`
> (constitución, Flujo de Desarrollo).

## Summary

Rediseñar la capa de presentación del sitio público con patrones de marketplace al estilo Airbnb: buscador
protagonista en la portada, navegación por categorías con íconos, tarjetas con la imagen como protagonista y un
encabezado minimalista. Se conserva la identidad azul de Plantillarte. El encabezado, el pie y las tarjetas
cambian en todo el sitio público (Q1); el bloque principal nuevo va solo en la portada.

El único cambio fuera de la presentación es una consulta pública nueva, `getPublicCategories()`, que cuenta solo
los recursos publicados (C1). El admin conserva la suya. No hay cambios de esquema, autenticación, criterios de
búsqueda ni panel de administración. Además, se unifican tres reglas que hoy están duplicadas y que la feature
igual tiene que tocar: la construcción de la URL del catálogo, la conversión a datos de tarjeta y el filtro de
categorías activas.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.3, Next.js 16.4.5 (App Router, `cacheComponents` y
`partialPrefetching` activos)

**Primary Dependencies**: Tailwind CSS 4.3 (tokens en `src/app/globals.css`), shadcn/ui (`radix-nova`),
lucide-react 1.70, Prisma 5.22. **Sin dependencias nuevas.**

**Storage**: PostgreSQL vía Prisma. Solo lectura en esta feature; sin migraciones.

**Testing**: no hay framework de pruebas (deuda D8). Se verifica con lint, `tsc --noEmit`, build, los
escenarios manuales de [quickstart.md](./quickstart.md) y Lighthouse.

**Target Platform**: navegadores modernos de escritorio, tablet y móvil (anchos de referencia 360, 768, 1280 y
1920 px).

**Project Type**: aplicación web full-stack con Next.js (proyecto único en `src/`).

**Performance Goals**: LCP ≤ 2.5 s y CLS ≤ 0.1 en móvil. Performance ≥ línea base − 10 (SC-007).

**Constraints**: no cambiar URLs ni resultados (contrato en [ui-navigation.md](./contracts/ui-navigation.md)),
WCAG 2.2 AA, sin colores escritos a mano, sin scroll horizontal y respeto de `prefers-reduced-motion`.

**Scale/Scope**: 3 rutas públicas afectadas (`/`, `/catalogo` y `/recurso/[slug]`), unos 10 componentes públicos
y 1 consulta nueva. Unas 12 categorías y 8 recursos recientes en la portada.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|-----------|-----------|--------|
| I. Capas | La consulta nueva va en `lib/db/queries`. Los componentes no importan `prisma`. Las páginas siguen siendo Server Components; `"use client"` solo en el buscador principal (hoja). Los Route Handlers y el storage no se tocan | ✅ |
| II. Calidad / no duplicar | Se **reducen** duplicaciones: URL del catálogo (3 → 1, R4), datos de tarjeta (3 → 1, R6), filtro `isActive` (3 → 1, R1). Sin `any` ni `eslint-disable` | ✅ |
| III. Seguridad | No hay endpoints ni actions nuevas. Se siguen mostrando solo recursos publicados y categorías activas. No se exponen datos nuevos | ✅ |
| IV. Integridad / PostgreSQL | Sin cambios de esquema ni escrituras. El conteo filtrado lo resuelve Prisma, sin SQL crudo | ✅ |
| V. UX y consistencia | Primitivas shadcn y tokens de marca; se eliminan los colores escritos a mano (R7). Los tres estados están definidos por sección ([data-model](./data-model.md)) | ✅ |
| VI. Responsive / a11y | Mobile-first, 44 px táctiles, nombres accesibles que hoy faltan ([contrato §4](./contracts/ui-navigation.md)), `lang="es"` intacto | ✅ |
| VII. Spec y aceptación | Spec aprobada y clarificada. Cada escenario tiene su paso en el quickstart. No se adopta un framework de pruebas (R9: requiere ADR) | ✅ |
| VIII. Rendimiento | `next/image` con `sizes` y miniaturas; streaming con `<Suspense>` (R3); `take: 8` en recientes; sin N+1 | ✅ (la paginación en memoria del catálogo queda registrada como fuera de alcance) |
| IX. IA y supervisión | Alcance acotado en `tasks.md`; antes de usar una API de Next se consultó `node_modules/next/dist/docs` (R3) | ✅ |
| Stack | Sin dependencias nuevas; Tailwind y lucide ya están instalados | ✅ |

**Resultado (antes de la Fase 0)**: PASA. **Resultado (después de la Fase 1)**: PASA. El diseño no agregó
violaciones; ver Complexity Tracking para el tamaño del PR.

## Project Structure

### Documentation (this feature)

```text
specs/001-home-redesign/
├── plan.md                  # Este archivo
├── research.md              # Fase 0: decisiones R1–R9
├── data-model.md            # Fase 1: modelos de vista y consulta nueva
├── quickstart.md            # Fase 1: guía de validación manual
├── contracts/
│   └── ui-navigation.md     # Fase 1: URLs, destinos, a11y y anclas que no pueden cambiar
├── checklists/
│   └── requirements.md      # Calidad de la spec
├── tasks.md                 # Fase 2 (/speckit-tasks)
└── verification.md          # Evidencia de verificación (se crea en T002 y se completa en cada fase)
```

### Source Code (repository root)

```text
src/
├── app/(public)/
│   ├── page.tsx                         # MODIFICAR: nuevo orden de secciones, cada una en <Suspense>
│   ├── catalogo/page.tsx                # MODIFICAR: getPublicCategories + toDesignCardData
│   └── recurso/[slug]/page.tsx          # SIN CAMBIOS (recibe las tarjetas nuevas vía RelatedDesigns)
├── components/public/
│   ├── header/index.tsx                 # MODIFICAR: diseño, a11y, tokens; usa buildCatalogHref
│   ├── hero/index.tsx                   # MODIFICAR: propuesta de valor + buscador principal
│   ├── hero-search/index.tsx            # NUEVO (cliente): campo de texto + botón (Q3)
│   ├── category-section/index.tsx       # MODIFICAR: íconos, contador publicado, sin emoji
│   ├── category-icon/index.tsx          # NUEVO: mapa slug → ícono + respaldo (R2)
│   ├── category-bar/index.tsx           # MODIFICAR: usa buildCatalogHref (sin cambio visual obligatorio)
│   ├── search-bar/index.tsx             # MODIFICAR: usa buildCatalogHref, tokens de foco, aria-label
│   ├── design-card/index.tsx            # MODIFICAR: nuevo diseño de tarjeta, tokens
│   ├── design-grid/index.tsx            # MODIFICAR: espaciado y columnas
│   ├── related-designs/index.tsx        # MODIFICAR: usa toDesignCardData
│   ├── value-props/index.tsx            # NUEVO: sección complementaria con contenido existente (FR-002)
│   ├── recent-designs/index.tsx         # NUEVO: sección "Novedades" como componente async para Suspense (R3)
│   ├── section-skeletons/index.tsx      # NUEVO: fallbacks de Suspense con la misma forma (R3)
│   ├── section-error/index.tsx          # NUEVO (cliente): error boundary por sección con catchError (R10)
│   └── footer/index.tsx                 # MODIFICAR: getPublicCategories, enlace /#novedades
├── lib/
│   ├── catalog-url.ts                   # NUEVO: buildCatalogHref (R4)
│   ├── presenters/design-card.ts        # NUEVO: toDesignCardData (R6)
│   ├── validations/catalog.ts           # NUEVO: esquema Zod de searchParams del catálogo (R11)
│   └── db/queries/categories.ts         # MODIFICAR: + getPublicCategories (getCategories intacta)
└── app/globals.css                      # MODIFICAR solo si hace falta un token o utilidad (p. ej. scroll-margin)

# NO SE TOCA: src/app/(admin)/**, src/app/api/**, src/lib/actions/**, src/lib/auth/**,
#             src/lib/storage/**, prisma/**, src/components/admin/**, src/components/ui/**
```

**Structure Decision**: se mantiene la estructura existente del proyecto: un componente de dominio por carpeta
en `src/components/public/<nombre>/index.tsx` y la lógica pura en `src/lib`. Los dos módulos nuevos de `lib`
(`catalog-url.ts` y `presenters/`) existen para eliminar duplicaciones (Principio II), no para agregar una capa
nueva.

## Orden de implementación sugerido

Cada paso se puede verificar de forma independiente y sigue las historias de la spec:

1. **Base compartida** (sin cambio visual): `buildCatalogHref`, `toDesignCardData` y `getPublicCategories`, y
   migrar a ellos los consumidores actuales. Verificación: F2–F5, F7, F14 y F17 dan lo mismo que la línea base,
   salvo F7, que ahora coincide.
2. **US1** (buscador principal en el bloque principal) → F1–F4.
3. **US2** (categorías con íconos) → F6–F9.
4. **US3** (tarjetas y grilla en todo el sitio) → F10–F12 y F15.
5. **US4** (encabezado) → F5, F16 y A3.
6. **US5** (orden, sección complementaria, anclas y skeletons) → F13, A1–A7, P1 y P2.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Cambiar las tarjetas afecta el catálogo y el detalle | Escenarios F14 y F15 en el quickstart; Q1 lo aceptó explícitamente |
| `URLSearchParams` codifica los espacios como `+` en lugar de `%20` | El resultado de búsqueda es el mismo (contrato §2.4); se verifica en F2–F4 |
| Los skeletons pueden causar CLS si no tienen la misma forma | Mismo aspect-ratio y la misma grilla que el contenido final; se mide en P1 |
| Las categorías con 0 publicados ahora muestran "0 recursos" | Es el comportamiento correcto según FR-011. Ocultarlas sería un cambio de regla y queda fuera de alcance |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| El PR probablemente supere las ~400 líneas que recomienda la constitución (Flujo de Desarrollo) | El rediseño toca unos 15 archivos públicos | **Mitigación**: entregar en PRs separados siguiendo el orden de implementación (1 base, 2–3, 4, 5–6). Si se entrega en un solo PR, justificarlo ahí |
