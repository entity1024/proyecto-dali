# Feature Specification: Rediseño de la página principal de Plantillarte

**Feature Branch**: `001-home-redesign`

**Created**: 2026-11-09

**Status**: Approved — 2026-11-09 — entity1024 (tras `/speckit-analyze` y la remediación de D1–D3, C1, U1, U2 e I1)

**Input**: User description: "Rediseñar la interfaz de la página principal de Plantillarte para ofrecer una
experiencia moderna, visualmente atractiva y fácil de navegar, tomando como referencia los patrones de
experiencia de usuario de Airbnb (encabezado simple, buscador prominente, categorías visuales, catálogo en
tarjetas), conservando la identidad de marca, sin modificar base de datos, autenticación, reglas de negocio,
lógica de búsqueda ni panel administrativo."

## Clarifications

### Session 2026-11-09

- Q: ¿Hasta dónde llega el rediseño de los componentes compartidos? → A: Encabezado, pie y tarjetas nuevas en
  todo el sitio público (`/`, `/catalogo`, `/recurso/[slug]`). El bloque principal nuevo va solo en la portada.
- Q: ¿Cómo se representan visualmente las categorías? → A: Con íconos de la librería que ya usa el proyecto,
  asignados por categoría, más un ícono genérico de respaldo. Las imágenes de portada quedan fuera de alcance.
- Q: ¿El buscador principal incluye un selector de categoría? → A: No. Lleva solo campo de texto y botón; las
  categorías se muestran inmediatamente debajo, como navegación visual.
- Q: ¿Se corrige en esta feature el contador de categorías (C1)? → A: Sí. Se cuentan solo los recursos
  publicados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Buscar un recurso desde la portada (Priority: P1)

Una persona visitante llega a la página principal y, sin desplazarse, encuentra un buscador destacado. Escribe
lo que necesita (por ejemplo "calendario 2027") y llega al catálogo con los resultados de esa búsqueda.

**Why this priority**: Hoy la portada no tiene buscador visible. El único buscador del encabezado está oculto
detrás de un ícono de lupa. Buscar es la forma más directa de llegar a un recurso concreto y es el pedido
principal del requerimiento.

**Independent Test**: Se abre la portada en escritorio y en móvil, se escribe un término en el buscador
principal y se confirma que el catálogo muestra los mismos resultados que se obtienen hoy con ese término.

**Acceptance Scenarios**:

1. **Given** una persona en la portada con un ancho de pantalla de 360 px, 768 px o 1280 px, **When** carga la
   página, **Then** el buscador principal se ve completo en el primer pantallazo, sin desplazarse.
2. **Given** el buscador principal, **When** la persona escribe "poster" y confirma (con Enter o con el botón de
   buscar), **Then** llega a `/catalogo?q=poster` y ve exactamente los mismos resultados que devuelve hoy esa URL.
3. **Given** el buscador principal vacío, **When** la persona confirma la búsqueda, **Then** llega al catálogo
   completo sin filtros, igual que hoy.
4. **Given** un término con espacios al principio o al final, **When** se confirma, **Then** esos espacios se
   eliminan antes de buscar, igual que hoy.
5. **Given** una persona que usa solo el teclado, **When** recorre la portada con Tab, **Then** llega al buscador,
   puede escribir, confirmar con Enter y el foco se ve en todo momento.

---

### User Story 2 - Explorar por categoría con navegación visual (Priority: P1)

La persona no sabe exactamente qué buscar y quiere ver por tipo de recurso. Ve las categorías activas
representadas de forma visual (ícono o imagen, nombre y cantidad de recursos), elige una y llega al catálogo
filtrado por esa categoría.

**Why this priority**: Explorar por categoría es el segundo camino de descubrimiento y ya existe. El rediseño
cambia su presentación, no su comportamiento.

**Independent Test**: Se hace clic en cada categoría que muestra la portada y se verifica que lleva a
`/catalogo?categoria=<slug>` con los mismos resultados que hoy.

**Acceptance Scenarios**:

1. **Given** categorías activas en el sistema, **When** se carga la portada, **Then** se muestran todas las
   categorías activas (ni una más, ni una menos), en el orden de visualización definido desde la administración.
2. **Given** una categoría, **When** la persona la selecciona, **Then** llega a `/catalogo?categoria=<slug>`.
3. **Given** que hay categorías inactivas, **When** se carga la portada, **Then** esas categorías no aparecen.
4. **Given** que no hay ninguna categoría activa, **When** se carga la portada, **Then** la sección de categorías
   muestra un mensaje breve indicando que todavía no hay categorías y un enlace al catálogo (constitución,
   Principio V).
5. **Given** un móvil de 360 px y más categorías de las que entran a lo ancho, **When** se ve la sección, **Then**
   no hay desbordamiento horizontal de la página: o las categorías pasan a otra fila, o se desplazan dentro de su
   propio contenedor con un indicio visible de que hay más.
6. **Given** que cada categoría muestra un contador de recursos, **When** se compara con el catálogo filtrado por
   esa categoría, **Then** los números coinciden (ver FR-011 y la sección de conflictos).
7. **Given** la representación visual de cada categoría, **When** una categoría no tiene una representación
   específica, **Then** se muestra un ícono genérico de respaldo y nunca un espacio vacío o roto. La
   representación es siempre un ícono; no se usan emoji ni imágenes de portada.

---

### User Story 3 - Ver los recursos recientes en tarjetas modernas (Priority: P2)

La persona recorre la portada y ve una selección de los recursos publicados más recientes en tarjetas donde la
imagen de vista previa es protagonista, el título se lee bien y la categoría está clara. Al elegir una tarjeta
llega al detalle del recurso.

**Why this priority**: Las tarjetas son el punto de llegada de los dos caminos anteriores. Mejoran la
percepción de calidad, pero la portada ya funciona sin este cambio.

**Independent Test**: Se publica un recurso nuevo, se recarga la portada, se verifica que aparece primero entre
los recientes y que su tarjeta lleva a `/recurso/<slug>`.

**Acceptance Scenarios**:

1. **Given** recursos publicados, **When** se carga la portada, **Then** se muestran hasta 8, ordenados del más
   reciente al más antiguo, igual que hoy.
2. **Given** una tarjeta, **When** la persona la selecciona (con clic, toque o Enter), **Then** llega a
   `/recurso/<slug>` de ese recurso.
3. **Given** un recurso sin imagen de vista previa, **When** se muestra su tarjeta, **Then** aparece un estado de
   respaldo con la misma forma que las demás tarjetas, de modo que la grilla no se descuadra.
4. **Given** un título largo (más de 60 caracteres), **When** se muestra en la tarjeta, **Then** se corta con
   puntos suspensivos sin pasar de 2 líneas y sin romper el diseño.
5. **Given** cualquier ancho entre 360 px y 1920 px, **When** se ve la grilla, **Then** todas las tarjetas de una
   misma fila tienen el mismo ancho y la misma proporción de imagen, y la separación entre ellas es uniforme.
6. **Given** que no hay recursos publicados, **When** se carga la portada, **Then** la sección de recientes
   muestra un estado vacío con un mensaje y un enlace al catálogo. Nunca queda una grilla vacía.
7. **Given** la sección de recientes, **When** la persona quiere ver más, **Then** tiene un enlace visible
   "Ver todos" que lleva a `/catalogo`.

---

### User Story 4 - Navegar desde un encabezado simple y consistente (Priority: P2)

Desde cualquier página pública, la persona encuentra la marca Plantillarte, los accesos a Inicio y Catálogo y
una forma de buscar, con una distribución limpia. En móvil, los mismos accesos están disponibles a través de un
menú.

**Why this priority**: El encabezado es compartido por todo el sitio público. Modernizarlo da coherencia, pero
no habilita nada nuevo.

**Independent Test**: Se recorren `/`, `/catalogo` y `/recurso/<slug>` en los tres anchos de referencia y se
verifica que cada destino del encabezado funciona y que la página actual se distingue.

**Acceptance Scenarios**:

1. **Given** cualquier página pública, **When** se carga, **Then** el encabezado muestra la marca (que lleva a
   `/`), el acceso a Inicio, el acceso a Catálogo y un punto de entrada a la búsqueda.
2. **Given** que la persona está en `/` o en `/catalogo`, **When** mira el encabezado, **Then** el acceso
   correspondiente se distingue visualmente como página actual (como hoy).
3. **Given** un ancho menor a 640 px, **When** la persona abre el menú, **Then** ve Inicio y Catálogo. **When** elige
   uno, **Then** navega y el menú se cierra.
4. **Given** que la persona se desplaza hacia abajo, **When** avanza por la página, **Then** el encabezado sigue
   visible arriba (como hoy).
5. **Given** que la persona busca desde el encabezado en cualquier página, **When** confirma, **Then** llega a
   `/catalogo?q=<término>`, como hoy.
6. **Given** los botones del encabezado que solo tienen ícono (menú, buscar, cerrar), **When** se usa un lector de
   pantalla, **Then** cada uno se anuncia con un nombre accesible en español.

---

### User Story 5 - Recorrer la portada con una jerarquía clara (Priority: P3)

La persona recorre la portada de arriba abajo y encuentra las secciones en este orden: encabezado, bloque
principal con propuesta de valor y buscador, categorías, recursos recientes, contenido complementario y pie de
página.

**Why this priority**: Es el resultado de juntar las historias anteriores. Se verifica al final.

**Independent Test**: Se inspecciona la portada en los tres anchos y se compara el orden con el de FR-001.

**Acceptance Scenarios**:

1. **Given** la portada, **When** se recorre de arriba abajo, **Then** el orden de las secciones es el de FR-001
   en los tres anchos de referencia.
2. **Given** la portada actual, **When** se compara con la nueva, **Then** todo el contenido actual sigue
   presente o reubicado: título, propuesta de valor ("gratis, sin registro"), acceso al catálogo, categorías,
   novedades y pie con categorías y enlaces. Lo que se quite tiene que estar justificado en esta spec (ver FR-002).
3. **Given** el enlace "Ver categorías" del bloque principal y el enlace "Novedades" del pie, **When** se
   activan, **Then** llevan a la sección correspondiente de la portada.

---

### Edge Cases

- **Base de datos caída o lenta**: el pie de página ya tolera un error al cargar las categorías (no se muestran).
  La portada mantiene ese comportamiento y nunca muestra un error técnico en crudo.
- **Error al cargar una sección** (categorías o novedades): solo esa sección muestra un mensaje en español con un
  botón "Reintentar" y un enlace al catálogo. El resto de la portada sigue funcionando y nunca se muestra el
  mensaje técnico.
- **Parámetros inválidos en el catálogo** (por ejemplo, `pagina=abc` o `pagina=-3`): se muestra la página 1, sin
  error.
- **Muchas categorías** (por ejemplo, 30): la sección sigue siendo usable en móvil, sin desbordamiento
  horizontal de la página.
- **Nombre de categoría muy largo** (más de 30 caracteres): se ajusta o se corta sin superponerse a otros
  elementos.
- **Imagen de vista previa que no carga** (archivo eliminado del storage): la tarjeta muestra su estado de
  respaldo y mantiene la proporción.
- **Búsqueda con caracteres especiales** (`&`, `?`, `#`, acentos, emoji): el término llega al catálogo bien
  codificado y produce el mismo resultado que hoy.
- **Animaciones con "reducir movimiento" activado**: no se muestran animaciones de entrada (se mantiene el
  respeto actual por esa preferencia).
- **JavaScript deshabilitado o todavía sin cargar**: los enlaces a categorías, tarjetas y catálogo funcionan como
  enlaces normales.
- **Zoom del navegador al 200 %**: el contenido sigue siendo legible y usable, sin desbordamiento horizontal en
  1280 px.

## Requirements *(mandatory)*

### Functional Requirements

**Organización**

- **FR-001**: La portada DEBE presentar las secciones en este orden: (1) encabezado, (2) bloque principal con
  título, propuesta de valor y buscador principal, (3) navegación por categorías, (4) recursos recientes,
  (5) contenido complementario, (6) pie de página.
- **FR-002**: El "contenido complementario" (sección 5) DEBE armarse solo con contenido que ya existe: los
  mensajes de propuesta de valor actuales (recursos gratuitos, sin registro, listos para descargar) y una
  llamada a explorar el catálogo. NO DEBE agregar funcionalidades nuevas como testimonios, newsletter,
  favoritos o cuentas de usuario.

**Buscador**

- **FR-003**: El bloque principal DEBE incluir un buscador siempre visible, sin necesidad de abrirlo, que sea el
  elemento interactivo más destacado del primer pantallazo.
- **FR-004**: El buscador principal DEBE producir exactamente las mismas URLs que el sistema actual:
  `/catalogo?q=<término>` con el término recortado y codificado, o `/catalogo` si el término está vacío.
- **FR-005**: Los criterios de búsqueda NO DEBEN cambiar. Se busca por coincidencia en nombre o descripción, sin
  distinguir mayúsculas, solo entre recursos publicados, y con el filtro de categoría como criterio adicional
  opcional. El buscador principal tiene solo campo de texto y botón, sin selector de categoría. Para filtrar por
  categoría se usa la navegación por categorías que está justo debajo (FR-007).
- **FR-006**: La búsqueda del encabezado DEBE seguir disponible en todas las páginas públicas, con el mismo
  destino que hoy.

**Categorías**

- **FR-007**: La portada DEBE mostrar todas las categorías activas, ordenadas por su orden de visualización, cada
  una con su nombre, su cantidad de recursos y una representación visual.
- **FR-008**: Cada categoría DEBE llevar a `/catalogo?categoria=<slug>`. Las rutas y parámetros de categoría NO
  DEBEN cambiar.
- **FR-009**: Toda categoría sin representación visual específica DEBE mostrar una representación genérica de
  respaldo.
- **FR-010**: La barra de categorías del catálogo (con "Todos" y la conservación del término buscado al cambiar
  de categoría) DEBE seguir funcionando igual.
- **FR-011**: La cantidad de recursos que se muestra por categoría DEBE ser la cantidad de recursos publicados
  de esa categoría, es decir, el mismo número que ve la persona en el catálogo filtrado (ver el conflicto C1).

**Catálogo y tarjetas**

- **FR-012**: Las tarjetas DEBEN mostrar en este orden de jerarquía: imagen de vista previa (protagonista),
  título (hasta 2 líneas) y categoría. Toda la tarjeta DEBE ser un único destino navegable hacia `/recurso/<slug>`.
- **FR-013**: El mismo diseño de tarjeta DEBE usarse en todos los lugares donde hoy aparecen tarjetas de
  recursos (portada, catálogo y recursos relacionados en el detalle), para que haya consistencia visual.
- **FR-014**: La portada DEBE seguir mostrando hasta 8 recursos recientes y un acceso "Ver todos" al catálogo.

**Encabezado y pie**

- **FR-015**: El encabezado DEBE conservar todos sus destinos actuales (marca → `/`, Inicio, Catálogo, búsqueda)
  y el indicador de página actual, tanto en escritorio como en el menú móvil.
- **FR-016**: El pie DEBE conservar su contenido actual: marca y descripción, hasta 6 categorías activas,
  enlaces "Todos los recursos" y "Novedades", y aviso de derechos con el año actual.

**Responsive, accesibilidad y consistencia**

- **FR-017**: Ninguna página pública afectada DEBE tener scroll horizontal en anchos de 360 px, 768 px, 1280 px
  y 1920 px.
- **FR-018**: Los elementos táctiles (enlaces de categoría, tarjetas, botones del encabezado y del buscador)
  DEBEN medir al menos 44 × 44 px en anchos menores a 768 px.
- **FR-019**: Todo elemento interactivo DEBE poder usarse con teclado, con foco visible. Todo botón que solo tiene
  ícono DEBE tener un nombre accesible en español. Toda imagen de vista previa DEBE tener texto alternativo con
  el nombre del recurso.
- **FR-020**: El texto y los elementos de interfaz DEBEN cumplir un contraste de nivel AA (4.5:1 para texto
  normal y 3:1 para texto grande y componentes).
- **FR-021**: Los colores, la tipografía y los radios DEBEN salir del sistema visual de la marca (paleta azul de
  Plantillarte). El rediseño NO DEBE adoptar la paleta, la tipografía, el logotipo ni elementos de marca de
  Airbnb.
- **FR-022**: Las animaciones DEBEN desactivarse cuando la persona tiene activada la preferencia de reducir
  movimiento.

**Conservación del sistema**

- **FR-023**: El rediseño NO DEBE cambiar los datos almacenados, la autenticación, los criterios de búsqueda, las
  reglas de publicación (solo se ven recursos publicados) ni el panel de administración.
- **FR-024**: Las URLs públicas existentes (`/`, `/catalogo` con `q`, `categoria` y `pagina`, `/recurso/<slug>`)
  y sus resultados DEBEN mantenerse.

### Key Entities *(datos que se muestran, sin cambios en su estructura)*

- **Categoría**: nombre, identificador en URL (slug), orden de visualización, estado activo/inactivo, cantidad de
  recursos asociados. Tiene un campo de imagen de portada que hoy no se usa en ninguna pantalla ni se puede cargar
  desde la administración.
- **Recurso (diseño)**: nombre, slug, categoría, estado (borrador, publicado o archivado), fecha de publicación e
  imagen principal con su miniatura.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En los tres anchos de referencia (360, 768 y 1280 px), el buscador principal se ve completo sin
  desplazarse en el 100 % de las cargas de la portada.
- **SC-002**: Una persona que entra por primera vez puede llegar a los resultados de una búsqueda desde la portada
  en 2 interacciones como máximo (escribir y confirmar) y en menos de 10 segundos.
- **SC-003**: Una persona puede llegar a un catálogo filtrado por categoría con 1 sola interacción desde la
  portada.
- **SC-004**: El 100 % de los recorridos de regresión listados (buscar desde la portada, buscar desde el
  encabezado, filtrar por categoría desde la portada y desde el catálogo, paginar, abrir el detalle desde una
  tarjeta, descargar desde el detalle y navegar desde el pie) producen el mismo destino y los mismos resultados
  que antes del rediseño.
- **SC-005**: Ninguna página pública afectada presenta scroll horizontal en 360, 768, 1280 y 1920 px.
- **SC-006**: La auditoría automatizada de accesibilidad de la portada y del catálogo obtiene 95 o más, sin
  errores de contraste ni de nombres accesibles.
- **SC-007**: La portada y el catálogo cumplen en móvil: el contenido principal termina de verse en 2.5 segundos
  o menos, el desplazamiento visual de la página al cargar no supera 0.1, y la puntuación de rendimiento de la
  portada no baja más de 10 puntos respecto de la versión actual.
- **SC-008**: En una revisión con al menos 3 personas, cada una identifica el buscador y las categorías como
  caminos de exploración en menos de 5 segundos al ver la portada.

## Assumptions

- **Estado actual observado** (línea base para comparar regresiones):
  - La portada hoy tiene, en orden: encabezado fijo arriba, bloque principal (subtítulo "Recursos gráficos
    gratuitos", título, texto de propuesta de valor, botones "Explorar recursos" y "Ver categorías"), una grilla
    de categorías con emoji, nombre y contador, la sección "Novedades" con 8 recursos y "Ver todos", y el pie.
  - El único buscador accesible desde la portada está en el encabezado y aparece recién al tocar la lupa. El
    buscador siempre visible existe solo en el catálogo.
  - La búsqueda tiene un único criterio de texto (nombre o descripción). El único "filtro" adicional es la
    categoría. No hay otros filtros: ni formato, ni orden, ni etiquetas.
  - Las categorías se representan con emoji asignados según su slug. Las que no están en esa lista muestran un
    ícono genérico de carpeta.
  - La misma tarjeta de recurso se usa en la portada, en el catálogo y en los recursos relacionados.
  - El modo oscuro no está habilitado en el sitio, aunque el sistema visual define sus colores.
- **Alcance**: aunque el pedido habla de la "página principal", el encabezado, el pie y las tarjetas son
  compartidos. El rediseño de esos elementos se aplica a todo el sitio público (confirmado en Clarifications), y
  los recorridos de regresión cubren también el catálogo y el detalle.
- El modo oscuro queda fuera de alcance: no se habilita, aunque el diseño no debe impedir hacerlo más adelante.
- Airbnb se toma como referencia de patrones (buscador protagonista, categorías con íconos, tarjetas con imagen
  dominante, encabezado minimalista) y no de identidad visual.
- La cantidad de recientes en la portada (8) y el tamaño de página del catálogo (12) se mantienen.
- No se agregan dependencias nuevas. Se reutiliza el sistema de estilos y la librería de íconos que ya tiene el
  proyecto.

### Conflictos y riesgos detectados con el comportamiento actual

- **C1 – El contador de categorías no coincide con el catálogo**: hoy el número que muestra cada categoría cuenta
  todos sus recursos, incluidos borradores y archivados, mientras que el catálogo muestra solo los publicados.
  FR-011 exige que coincidan. Corregirlo cambia la consulta de datos, no la base de datos, y es la única
  modificación fuera de la presentación que pide esta spec. **Aprobado** (Clarifications 2026-11-09).
- **C2 – Representación visual de categorías**: la base de datos ya tiene un campo de imagen de portada por
  categoría, pero no está en uso y la administración no permite cargarla. Usar imágenes reales requeriría
  modificar el panel de administración, que está fuera de alcance según el requerimiento. **Resuelto**: se
  usan íconos; las imágenes de portada quedan para una spec futura.
- **C3 – Dos buscadores en la portada**: si el buscador del encabezado y el principal están visibles al mismo
  tiempo, se duplica el punto de entrada. Se espera que el plan defina cómo conviven (por ejemplo, que el del
  encabezado gane protagonismo solo cuando el principal sale de la vista) sin que se pierda la búsqueda en las
  demás páginas.
- **C4 – Colores escritos a mano**: los componentes actuales del buscador y de las tarjetas usan colores fijos
  fuera del sistema visual (sombra de foco y fondo blanco del overlay). La constitución los prohíbe (Principio V),
  así que el rediseño debe reemplazarlos por colores del sistema.
- **C5 – Destinos de enlaces internos**: el pie lleva "Novedades" a `/` (la parte superior de la portada) y el
  bloque principal lleva "Ver categorías" a la sección de categorías. Si las secciones cambian de lugar, esos
  enlaces deben seguir llevando a la sección correcta (escenario 5.3).
