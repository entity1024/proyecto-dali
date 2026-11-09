# Quickstart: validación del rediseño de la portada

**Feature**: [spec.md](./spec.md) | **Contratos**: [ui-navigation.md](./contracts/ui-navigation.md)

Esta guía sirve para verificar que la feature funciona. El proyecto no tiene framework de pruebas (research R9),
así que cada escenario se ejecuta a mano y su evidencia se registra en el PR (Principio VII, puerta Q5).

## Prerrequisitos

- PostgreSQL disponible y `DATABASE_URL` configurada en `.env.local`.
- Datos de ejemplo cargados: `npm run db:migrate` y `npm run db:seed`.
- Al menos una categoría activa con un recurso en borrador **y** uno publicado, para probar C1.
- Al menos una categoría inactiva y un recurso publicado sin imagen.

## 0. Línea base (ANTES de implementar)

Correr esto en `main` para tener contra qué comparar:

1. Lighthouse móvil en `/` y `/catalogo`: anotar Performance, Accesibilidad, LCP y CLS.
2. Anotar los resultados de `/catalogo?q=poster`, `/catalogo?categoria=<slug>` y `/catalogo?pagina=2`.

## 1. Puertas automáticas

```bash
npm run lint          # Q1
npx tsc --noEmit      # Q2
npm run build         # Q3: no debe aparecer el aviso blocking-route en "/"
```

Q4 no aplica, porque no hay migraciones. Confirmar con `git diff --stat prisma/`, que no debe mostrar cambios.

## 2. Escenarios funcionales

| # | Paso | Resultado esperado | Cubre |
|---|------|--------------------|-------|
| F1 | Abrir `/` a 360, 768 y 1280 px | El buscador principal se ve completo sin desplazarse | US1.1, SC-001 |
| F2 | Buscar "poster" desde el buscador principal | URL `/catalogo?q=poster`; resultados iguales a la línea base | US1.2, FR-004 |
| F3 | Buscar vacío y buscar "  poster  " | `/catalogo` y `/catalogo?q=poster` | US1.3, US1.4 |
| F4 | Buscar `día & noche` | El término llega bien codificado, sin error | Edge cases |
| F5 | Buscar desde el encabezado en `/`, `/catalogo` y `/recurso/<slug>` | Destino `/catalogo?q=…` | US4.5, FR-006 |
| F6 | Contar las categorías de la portada | Son exactamente las activas, en orden; las inactivas no aparecen | US2.1, US2.3 |
| F7 | Para cada categoría, comparar su contador con el total de `/catalogo?categoria=<slug>` | Iguales (el borrador no se cuenta) | US2.6, FR-011 |
| F8 | Clic en una categoría | `/catalogo?categoria=<slug>` | US2.2 |
| F9 | Categoría con slug fuera del mapa | Se muestra el ícono de respaldo | US2.7, FR-009 |
| F10 | Recientes: publicar un recurso desde el admin y recargar `/` | Aparece primero; hay como máximo 8 | US3.1 |
| F11 | Recurso sin imagen | Estado de respaldo con la misma proporción | US3.3 |
| F12 | Título de más de 60 caracteres | 2 líneas con elipsis | US3.4 |
| F13 | "Ver categorías", "Ver todos" y "Novedades" del pie | Llevan a `#categorias`, `/catalogo` y `/#novedades`; el título no queda tapado por el encabezado | US5.3, R8 |
| F14 | Catálogo: barra de categorías ("Todos" conserva `q`), paginación | Igual que la línea base | FR-010, SC-004 |
| F15 | Detalle: recursos relacionados y descarga de un archivo | Tarjetas nuevas; la descarga funciona igual | FR-013, SC-004 |
| F16 | Menú móvil (< 640 px): abrir, elegir "Catálogo" | Navega y el menú se cierra | US4.3 |
| F17 | Ingresar al panel `/admin/categorias` | Los contadores del admin **no cambiaron** (siguen contando todos los estados) | FR-023, R1 |
| F18 | Con `npm run dev` corriendo, detener PostgreSQL y recargar `/`; después levantarlo y tocar "Reintentar" | Solo las secciones Categorías y Novedades muestran "No pudimos cargar…", con "Reintentar" y "Ver el catálogo"; el bloque principal y el buscador siguen funcionando; al reintentar se recuperan. Nunca aparece un mensaje técnico | Edge cases, R10 |
| F19 | Abrir `/catalogo?pagina=abc`, `/catalogo?pagina=-3` y `/catalogo?pagina=2` | Los dos primeros muestran la página 1 sin error; el tercero es igual a la línea base | R11, FR-024 |
| F20 | Con una base sin categorías activas, o sin recursos publicados, abrir `/` | La sección correspondiente muestra su estado vacío con un enlace al catálogo | US2.4, US3.6 |

## 3. Responsive y accesibilidad (puerta Q7)

| # | Verificación | Esperado |
|---|--------------|----------|
| A1 | `/`, `/catalogo` y `/recurso/<slug>` a 360, 768, 1280 y 1920 px | Sin scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`) |
| A2 | Recorrer `/` solo con Tab, Shift+Tab y Enter | Todo se puede alcanzar, con foco visible y en orden lógico |
| A3 | Lector de pantalla sobre los botones del encabezado y el buscador | Nombres de la tabla 4 del contrato |
| A4 | Lighthouse Accesibilidad en `/` y `/catalogo` | ≥ 95 |
| A5 | Activar "reducir movimiento" en el sistema operativo | Sin animaciones de entrada |
| A6 | Zoom 200 % a 1280 px | Legible, sin scroll horizontal |
| A7 | Inspeccionar el tamaño táctil de categorías, tarjetas y botones a 360 px | ≥ 44 × 44 px |

## 4. Rendimiento

| # | Verificación | Esperado |
|---|--------------|----------|
| P1 | Lighthouse móvil en `/` | LCP ≤ 2.5 s, CLS ≤ 0.1, Performance ≥ (línea base − 10) |
| P2 | En el log de Prisma en desarrollo, cargar `/` | Una consulta de categorías y una de recientes por sección, sin repeticiones por ítem |

## 5. Revisión de constitución

```bash
rg "#[0-9a-fA-F]{3,6}\b|rgb\(|oklch\(|\[#|bg-white|\b[a-z-]+-\[[0-9]" src/components/public src/app/\(public\) --glob "*.tsx"
# Esperado: sin resultados (colores escritos a mano y valores arbitrarios de Tailwind, Principio V)
rg "@/lib/db/client" src/components src/app/\(public\)
# Esperado: sin resultados
```
