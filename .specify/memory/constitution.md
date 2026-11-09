<!--
Sync Impact Report
==================
Version change: (plantilla sin completar) → 1.0.0
Bump rationale: primera ratificación. Se reemplaza la plantilla vacía por una constitución completa.

Principios definidos (antes había 5 marcadores genéricos; ahora son 9 principios):
  [PRINCIPLE_1_NAME] → I. Arquitectura por Capas y Separación de Responsabilidades
  [PRINCIPLE_2_NAME] → II. Calidad, Legibilidad y Mantenibilidad
  [PRINCIPLE_3_NAME] → III. Seguridad y Protección de Datos
  [PRINCIPLE_4_NAME] → IV. Integridad de la Información y PostgreSQL
  [PRINCIPLE_5_NAME] → V. Experiencia de Usuario y Consistencia Visual
  (nuevo)            → VI. Diseño Responsive y Accesibilidad
  (nuevo)            → VII. Pruebas y Criterios de Aceptación
  (nuevo)            → VIII. Rendimiento y Optimización
  (nuevo)            → IX. Desarrollo Asistido por IA y Supervisión Humana

Secciones agregadas:
  [SECTION_2_NAME] → Stack Tecnológico y Línea Base del Proyecto (incluye la deuda técnica conocida)
  [SECTION_3_NAME] → Flujo de Desarrollo y Puertas de Calidad
  Governance       → completada (enmiendas, versionado, revisión de cumplimiento)

Secciones eliminadas: ninguna.

Templates (se leen en tiempo de ejecución; este comando NO los modifica):
  ✅ .specify/templates/plan-template.md: la sección "Constitution Check" debe evaluarse contra los
     principios I–IX y las puertas Q1–Q7 de este documento.
  ✅ .specify/templates/spec-template.md: los criterios de aceptación tienen que ser verificables (Principio VII).
  ✅ .specify/templates/tasks-template.md: las tareas tienen que incluir pasos de verificación (Principio VII).

TODOs pendientes:
  - TODO(ADR_DIR): todavía no existe docs/adr/. Se crea con el primer ADR que se escriba.
  - TODO(TEST_RUNNER): no hay framework de pruebas instalado. Para adoptarlo hace falta un ADR
    (Principio VII y regla de la Sección "Stack").
-->

# Constitución de Ingeniería de Plantillarte

Plantillarte es un catálogo público de plantillas y recursos de diseño descargables, con un panel
de administración privado. Está construido sobre Next.js (App Router), React, Prisma, PostgreSQL,
Auth.js (next-auth v5), Tailwind CSS v4 y shadcn/ui. Esta constitución define reglas
**verificables**. Cada principio dice cómo comprobar si se cumple o no.

Palabras normativas: **DEBE / NO DEBE** = obligatorio. **DEBERÍA** = esperado; si no se cumple,
hay que justificarlo por escrito en el plan o en el PR.

## Core Principles

### I. Arquitectura por Capas y Separación de Responsabilidades

El código se organiza en capas, cada una con una sola responsabilidad. Las dependencias van en un
solo sentido: `app/` → `lib/actions` → `lib/db/queries` → `lib/db/client`.

- **Acceso a datos**: solo `src/lib/db/queries/*` y `src/lib/auth/config.ts` PUEDEN importar
  `@/lib/db/client`. Las rutas de `src/app/api/**` y los componentes NO DEBEN usar `prisma` directo;
  DEBEN llamar a una función de `lib/db/queries`. (Hoy no se cumple: ver Deuda conocida D1.)
- **Mutaciones**: las escrituras que se disparan desde la UI DEBEN pasar por Server Actions en
  `src/lib/actions/*` (`"use server"`). Esas actions DEBEN, en este orden: (1) autorizar,
  (2) validar con Zod, (3) delegar en `lib/db/queries`, (4) llamar a `revalidatePath`/`revalidateTag`,
  (5) devolver `{ ok: true, ... } | { error: string }`. NO DEBEN lanzar excepciones hacia el cliente.
- **Route Handlers** (`src/app/api/**/route.ts`): se usan SOLO para lo que una Server Action no puede
  resolver: subida multipart, streaming de descargas, callbacks de Auth.js y servir archivos.
- **Almacenamiento de archivos**: todo acceso a archivos DEBE pasar por la interfaz `StorageProvider`
  (`src/lib/storage/index.ts`). Para agregar un proveedor se implementa esa interfaz. NO se agregan
  ramas `instanceof` nuevas fuera de `lib/storage`.
- **Componentes**: `src/components/ui/` contiene solo primitivas de shadcn/ui, sin lógica de negocio.
  `src/components/public/` y `src/components/admin/` contienen componentes de dominio, uno por
  carpeta con `index.tsx`. Las páginas (`page.tsx`) son Server Components por defecto. `"use client"`
  se usa solo en componentes hoja que necesitan estado, eventos o APIs del navegador.
- **Grupos de rutas**: `(public)` es el sitio público y `(admin)` es el panel. Ninguno DEBE importar
  componentes de dominio del otro.

**Cómo se verifica**: `rg "@/lib/db/client" src` solo devuelve archivos de `lib/db/queries/` y
`lib/auth/config.ts`. `rg '"use client"' src/app` no devuelve ningún `page.tsx` ni `layout.tsx`.

**Por qué**: si la regla de negocio vive en un solo lugar, se puede cambiar Prisma, el storage o la
UI sin romper las otras capas.

### II. Calidad, Legibilidad y Mantenibilidad

- TypeScript en modo `strict` (ya configurado en `tsconfig.json`). NO DEBE usarse `any` explícito,
  `@ts-ignore` ni `eslint-disable` sin un comentario en la misma línea que explique por qué.
- `npm run lint` y `npx tsc --noEmit` DEBEN terminar sin errores antes de cualquier merge.
- **Una sola fuente de verdad**: cada regla de negocio (esquemas Zod, MIME types permitidos, límites
  de tamaño, transiciones de `DesignStatus`, guard de autorización) DEBE definirse en un único
  módulo y reutilizarse desde ahí. Duplicarla es un defecto bloqueante en la revisión.
  (Hoy no se cumple: ver D2 y D3.)
- Los esquemas Zod viven en `src/lib/validations/*` y se reutilizan tanto en el cliente
  (react-hook-form + `@hookform/resolvers`) como en el servidor.
- No se commitea código muerto: módulos sin importar, exports sin uso, archivos stub.
- Nombres de código, rutas de archivo e identificadores: en inglés. Textos visibles al usuario y
  mensajes de error devueltos a la UI: en español. Los comentarios PUEDEN estar en español.
- Un cambio NO DEBE reescribir funcionalidad existente salvo que la especificación aprobada lo
  justifique explícitamente (bug, requisito nuevo o deuda registrada).

**Cómo se verifica**: lint y typecheck en verde; en la revisión se responde con evidencia a la
pregunta "¿esta regla ya existía en otro lugar?".

### III. Seguridad y Protección de Datos

- **Autorización (NO NEGOCIABLE)**: toda Server Action de `lib/actions/*` y todo handler bajo
  `src/app/api/admin/**` DEBE verificar sesión **y** `session.user.role === "admin"` mediante un
  único helper compartido (por ejemplo `requireAdmin()` en `src/lib/auth/`). El `proxy.ts`
  (matcher `/admin/:path*`) protege páginas, pero NO protege `/api/admin/**` ni las Server Actions:
  nunca DEBE considerarse la única barrera. (Hoy no se cumple: ver D4.)
- Respuestas: 401 sin sesión, 403 con sesión pero sin rol suficiente, 404 cuando el recurso no
  existe o no es público. Así no se revela si un recurso existe o no.
- **Validación de entrada**: todo dato externo (FormData, params, searchParams, cuerpo JSON) DEBE
  pasar por un esquema Zod antes de usarse. Las subidas DEBEN validar el MIME, la extensión y el
  tamaño contra las constantes únicas de `lib/storage/utils.ts`.
- **Descargas públicas**: solo se sirven archivos con `isActive = true` cuyo diseño esté en
  `status = "published"`. Las claves de storage NO DEBEN exponerse para archivos privados. En
  proveedores remotos, las URLs firmadas DEBEN durar 300 s o menos.
- **Datos personales**: las IPs NO DEBEN almacenarse en claro, solo como hash con sal (como hace hoy
  `DownloadLog.ipHash`). Las contraseñas se guardan solo con bcrypt. Ningún log DEBE contener
  contraseñas, tokens, hashes ni `DATABASE_URL`.
- **Secretos**: viven en `.env` / `.env.local` (ignorados por git). Toda variable nueva DEBE
  agregarse a `.env.example` con un valor de ejemplo y no el real.
- Los mensajes de error que llegan al cliente NO DEBEN incluir stack traces ni mensajes crudos de
  Prisma.

**Cómo se verifica**: cada endpoint o action nueva incluye en la spec un escenario "sin sesión → 401"
y otro "rol `user` → 403". Además, `rg "e.message" src/lib/actions` está en la lista de revisión.

### IV. Integridad de la Información y PostgreSQL

- `prisma/schema.prisma` es la fuente única del modelo. Todo cambio de esquema DEBE producir una
  migración versionada en `prisma/migrations/` con `npm run db:migrate`. `prisma db push` NO DEBE
  usarse en entornos compartidos. Una migración ya aplicada NO DEBE editarse.
- Convenciones obligatorias: IDs `String @id @default(uuid())`; columnas y tablas en snake_case con
  `@map`/`@@map`; `createdAt`/`updatedAt` en toda entidad mutable; `slug` con `@unique` donde
  exista; índices para toda columna usada en `where` u `orderBy` de consultas públicas.
- **Atomicidad**: toda operación que escriba en más de una tabla, o que combine un registro con un
  contador (por ejemplo `DownloadLog` + `Design.downloadCount`), DEBE ejecutarse en
  `prisma.$transaction`. (Hoy no se cumple: ver D5.)
- **Consistencia entre BD y storage**: al borrar, primero se confirma la operación en la base y
  después se eliminan los objetos del storage. Si eso falla, quedan archivos huérfanos en storage,
  que son recuperables; NO DEBEN quedar registros en la base que apunten a objetos inexistentes.
  (Hoy no se cumple: ver D6.)
- **Integridad referencial**: las relaciones con `ON DELETE RESTRICT` (por ejemplo
  `download_logs → designs`) son intencionales para preservar el historial. Una entidad con
  historial DEBERÍA archivarse (`status = "archived"` / `isActive = false`) en lugar de borrarse
  físicamente.
- Cambios destructivos de esquema (eliminar o renombrar columnas, cambiar tipos) DEBEN tener un plan
  de migración de datos y de rollback en el `plan.md` de la feature.
- `prisma/seed.ts` DEBE ser idempotente (usar `upsert`) y mantenerse compatible con el esquema vigente.

**Cómo se verifica**: `npx prisma migrate status` no muestra drift; en la revisión se buscan
operaciones de varias escrituras sin `$transaction`.

### V. Experiencia de Usuario y Consistencia Visual

- La UI DEBE construirse con las primitivas de `src/components/ui/` (shadcn/ui, estilo
  `radix-nova`, iconos `lucide-react`). Para agregar una primitiva se usa el CLI de shadcn y no se
  copian componentes de otras librerías.
- Colores, radios y tipografía DEBEN salir de los tokens de `src/app/globals.css` (paleta `blue-*`
  de marca y variables `--primary`, `--muted`, etc.). Los valores hex, rgb u oklch escritos a mano en
  componentes y los valores arbitrarios de Tailwind (`[#...]`, `[13px]`) están PROHIBIDOS salvo que
  se justifiquen.
- Todo flujo asíncrono DEBE mostrar los tres estados: carga (`loading.tsx` o skeleton), vacío
  (mensaje con una acción sugerida) y error (mensaje entendible y en español). El resultado de las
  mutaciones del admin se notifica con `sonner`.
- Las acciones destructivas del admin (eliminar diseño, categoría, archivo o imagen) DEBEN pedir
  confirmación con `AlertDialog`.
- Los textos visibles están en español, con tono y terminología uniformes ("recurso", "diseño",
  "categoría"; no se mezclan sinónimos para la misma entidad dentro de una misma vista).

**Cómo se verifica**: `rg "#[0-9a-fA-F]{3,6}\b|rgb\(|\[#" src/components src/app --glob "*.tsx"`
no devuelve resultados nuevos; la spec enumera los tres estados de cada vista nueva.

### VI. Diseño Responsive y Accesibilidad

- Mobile-first: toda vista DEBE funcionar sin scroll horizontal a 360 px, 768 px y 1280 px de ancho.
- Se apunta a **WCAG 2.2 nivel AA**: contraste mínimo 4.5:1 para texto normal (3:1 para texto
  grande y elementos de UI) en tema claro y oscuro.
- Todo lo interactivo DEBE poder usarse solo con teclado y mostrar un foco visible (`ring`). No se
  pone `onClick` en elementos que no son interactivos: se usa `<button>` o `<a>`.
- Toda imagen de contenido DEBE tener `alt` significativo (`DesignImage.altText` o, si no hay, el
  nombre del diseño). Las imágenes decorativas llevan `alt=""`.
- Los campos de formulario DEBEN tener un `<Label>` asociado, y los errores de validación se asocian
  al campo con `aria-describedby` / `aria-invalid`.
- Se mantiene `<html lang="es">`. Los botones que solo tienen un icono DEBEN llevar `aria-label`.

**Cómo se verifica**: auditoría de Lighthouse sobre las páginas afectadas con Accesibilidad ≥ 95,
recorrido manual con teclado documentado en la verificación de la tarea y revisión en los tres
anchos indicados.

### VII. Pruebas y Criterios de Aceptación

- **Sin spec aprobada no se implementa (NO NEGOCIABLE)**: toda funcionalidad nueva o cambio de
  comportamiento DEBE tener `spec.md` → `plan.md` → `tasks.md` en `specs/NNN-nombre/`, aprobados por
  una persona antes de escribir código. Quedan exentos solo los fixes triviales (typos, estilos sin
  cambio de comportamiento) y los fixes de seguridad urgentes, que se documentan a posteriori.
- Cada historia de usuario DEBE tener criterios de aceptación en formato Dado/Cuando/Entonces,
  observables y medibles. Frases como "funciona bien" o "es rápido" no sirven como criterio.
- **Definición de Terminado**: una tarea está terminada SOLO cuando (1) cada criterio de aceptación
  se verificó y se registró la evidencia (salida de comando, captura o pasos reproducibles), (2) las
  puertas Q1–Q7 pasan y (3) las funcionalidades existentes que tocó siguen funcionando.
- **Estado actual**: el proyecto no tiene framework de pruebas. Hasta que se adopte uno mediante un
  ADR, la verificación DEBE hacerse con lint, typecheck y escenarios manuales escritos en la spec
  (incluidos los escenarios de autorización del Principio III).
- **Una vez adoptado el framework de pruebas**: toda función nueva o modificada en
  `src/lib/{actions,db/queries,storage,validations}` DEBE tener pruebas automatizadas, y todo bug
  corregido DEBE traer una prueba que falle sin el fix.

**Cómo se verifica**: el PR enlaza la spec y contiene una sección "Verificación" con un ítem por
criterio de aceptación.

### VIII. Rendimiento y Optimización

- Se aprovecha el modelo de Next.js del proyecto (`cacheComponents` y `partialPrefetching` activos en
  `next.config.ts`): los datos públicos se obtienen en Server Components y cada mutación invalida
  exactamente las rutas o tags afectados. NO se agregan `fetch` del lado del cliente para datos que
  pueden renderizarse en el servidor.
- Las imágenes DEBEN usar `next/image` con `width`/`height` (o `fill` con `sizes`). En grillas y
  tarjetas se muestra `thumbnailKey` y nunca la imagen original.
- Los listados públicos DEBEN estar paginados o limitados (`take`). Ninguna consulta pública puede
  devolver filas sin límite. Se usa `select`/`include` mínimo; no se traen relaciones que la vista
  no usa.
- NO DEBE haber consultas N+1: no se ejecutan consultas dentro de bucles sobre resultados.
- Los archivos descargables DEBEN servirse por streaming o con redirect a una URL firmada, nunca
  cargados completos en memoria para la respuesta.
- Presupuesto en páginas públicas (Lighthouse, móvil): LCP ≤ 2.5 s, CLS ≤ 0.1, Performance ≥ 85.
  Si un cambio empeora alguna métrica más de 10 puntos o se sale del presupuesto, se justifica en el PR.

**Cómo se verifica**: Lighthouse antes y después en `/`, `/catalogo` y `/recurso/[slug]` cuando el
cambio las afecta. En desarrollo, el log de Prisma (`query`) se revisa en busca de consultas repetidas.

### IX. Desarrollo Asistido por IA y Supervisión Humana

- La IA ejecuta y la persona decide. Todo cambio generado o asistido por IA DEBE ser revisado y
  aprobado por una persona antes del merge. La IA NO DEBE hacer merge ni push a `main` por su cuenta.
- Los agentes DEBEN trabajar dentro del flujo Spec Kit (`/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`) y NO DEBEN implementar fuera de las tareas aprobadas ni
  ampliar el alcance sin pedir permiso.
- Next.js 16 tiene cambios incompatibles con versiones anteriores (por ejemplo `proxy.ts` en lugar
  de `middleware.ts`, o `params` como `Promise`). Antes de usar una API de Next, el agente DEBE
  consultar `node_modules/next/dist/docs/`, como indica `AGENTS.md`. Aplica lo mismo para las
  versiones instaladas de next-auth (beta), Prisma, Zod 4 y Tailwind 4.
- La IA NO DEBE agregar dependencias, cambiar el esquema de la base, modificar la autenticación ni
  borrar archivos sin aprobación explícita y previa.
- Las afirmaciones técnicas de la IA (que algo funciona o que una API existe) DEBEN respaldarse con
  evidencia: salida de comando, referencia a la documentación o a `archivo:línea`.
- Los commits siguen Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).

**Cómo se verifica**: todo PR tiene una persona aprobadora y enlaza las tareas que implementa; el
diff no contiene archivos fuera del alcance declarado en `tasks.md`.

## Stack Tecnológico y Línea Base del Proyecto

**Stack aprobado** (versiones según `package.json`): Next.js 16 (App Router) · React 19 ·
TypeScript 5 (strict) · Prisma 5 + PostgreSQL · Auth.js / next-auth v5 (Credentials + JWT) ·
bcryptjs · Zod 4 · react-hook-form · Tailwind CSS 4 · shadcn/ui (Radix) · lucide-react · sonner ·
next-themes · sharp · ESLint 9 (`eslint-config-next`) · npm.

**Reglas sobre el stack**:

- Toda dependencia nueva, o el reemplazo de una existente, DEBE justificarse con un ADR en
  `docs/adr/NNNN-titulo.md` (contexto, alternativas evaluadas, decisión y consecuencias) que
  explique por qué el stack actual no alcanza. Lo mismo aplica a cualquier decisión arquitectónica
  relevante.
- El gestor de paquetes es npm y `package-lock.json` DEBE commitearse. No se mezclan gestores.
- Las dependencias sin uso real DEBEN eliminarse. Hoy se sospecha que `cn` no se usa porque ya
  existe `src/lib/utils.ts`; hay que confirmarlo antes de quitarla.
- Los cambios deben mantener compatibilidad: no pueden romper URLs públicas existentes
  (`/`, `/catalogo`, `/recurso/[slug]`, `/api/downloads/[fileId]`), ni el formato de las claves de
  storage, ni los datos ya migrados.

**Deuda conocida al momento de ratificar** (cada ítem se resuelve con su propia spec; NO justifica
reescrituras oportunistas):

- **D1**: `src/app/api/admin/files/[fileId]`, `src/app/api/admin/images/[imageId]` y
  `src/app/api/downloads/[fileId]` importan `prisma` directo (viola el Principio I).
- **D2**: el esquema de diseño está duplicado: `designFormSchema` en `lib/db/queries/designs.ts` y
  `createDesignSchema` en `lib/validations/design.ts`, que además no se importa desde ningún lado.
- **D3**: los MIME types y los límites están duplicados entre `lib/validations/file.ts`,
  `lib/storage/utils.ts` y una lista de extensiones escrita a mano en
  `api/admin/uploads/files/route.ts`.
- **D4**: `requireAdmin()` está duplicado en `lib/actions/designs.ts` y `lib/actions/categories.ts`,
  y solo valida la sesión, no `role === "admin"` (viola el Principio III).
- **D5**: el registro de la descarga y el incremento de `downloadCount` se ejecutan en `Promise.all`
  sin transacción (viola el Principio IV).
- **D6**: `deleteDesignAction` borra los archivos del storage antes de borrar en la base. Si el diseño
  tiene registros en `download_logs`, la FK `ON DELETE RESTRICT` hace fallar el borrado en la base
  después de haber eliminado los archivos (viola el Principio IV).
- **D7**: el proveedor S3/MinIO no está implementado (`getStorageProvider` lanza un error).
- **D8**: no hay framework de pruebas (Principio VII).

## Flujo de Desarrollo y Puertas de Calidad

**Flujo**: `/speckit-specify` → (`/speckit-clarify`) → `/speckit-plan` → `/speckit-tasks` →
(`/speckit-analyze`) → `/speckit-implement` → verificación → PR → revisión humana → merge.

- Se trabaja en ramas `NNN-nombre-feature` (numeración secuencial de Spec Kit). Nunca directo en `main`.
- Se prefieren cambios pequeños: un PR DEBERÍA implementar una sola historia de usuario y DEBERÍA
  quedar por debajo de unas 400 líneas modificadas (sin contar migraciones generadas ni lockfiles).
  Si se supera, se justifica en el PR.
- Antes de diseñar, el `plan.md` DEBE completar el "Constitution Check" contra los principios I–IX.
  Toda violación se registra en "Complexity Tracking" con su justificación.

**Puertas de calidad (todas obligatorias antes del merge)**:

- **Q1**: `npm run lint` sin errores.
- **Q2**: `npx tsc --noEmit` sin errores.
- **Q3**: `npm run build` exitoso.
- **Q4**: si se tocó el esquema, hay migración commiteada y `npx prisma migrate status` está limpio.
- **Q5**: cada criterio de aceptación tiene evidencia registrada (Principio VII).
- **Q6**: endpoints y actions nuevas tienen verificados los escenarios 401/403 (Principio III).
- **Q7**: si hubo cambios de UI, se revisaron 360/768/1280 px, se hizo el recorrido con teclado y
  se corrió Lighthouse (Principios VI y VIII).

## Governance

- Esta constitución tiene prioridad sobre cualquier otra práctica, guía o preferencia del proyecto.
  Ante un conflicto, gana la constitución, y el conflicto se resuelve con una enmienda.
- **Enmiendas**: se proponen con un PR que modifica `.specify/memory/constitution.md` (con
  `/speckit-constitution`), explica el motivo, actualiza el Sync Impact Report e indica cómo migrar
  el código afectado. Requieren la aprobación de la persona responsable técnica del proyecto.
- **Versionado** (SemVer):
  - MAJOR: se elimina un principio o se redefine de forma incompatible.
  - MINOR: se agrega un principio o sección, o se amplía de forma material.
  - PATCH: aclaraciones o cambios de redacción sin efecto normativo.
- **Revisión de cumplimiento**: todo PR DEBE incluir un checklist de los principios afectados y de
  las puertas Q1–Q7. `/speckit-analyze` DEBE ejecutarse antes de `/speckit-implement` en features
  que toquen autorización, esquema de base o storage.
- **Excepciones**: se documentan en el `plan.md` de la feature (Complexity Tracking) con su
  justificación y fecha de revisión. Una excepción no documentada es una violación.
- La deuda listada en "Línea Base" se revisa en cada enmienda MINOR o MAJOR: los ítems resueltos se
  eliminan y los nuevos se agregan.
- Guía operativa para agentes: `AGENTS.md` y la documentación de `node_modules/next/dist/docs/`.

**Version**: 1.0.0 | **Ratified**: 2026-11-09 | **Last Amended**: 2026-11-09
