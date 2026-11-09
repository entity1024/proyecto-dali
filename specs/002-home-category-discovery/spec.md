# Feature Specification: Portada orientada al descubrimiento por categorías (segunda iteración)

**Feature Branch**: `002-home-category-discovery`

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Segunda iteración: Rediseño UX de la página principal de Plantillarte — arquitectura visual basada en categorías horizontales y un catálogo de diseños visualmente atractivo (header, hero con buscador, categorías horizontales, novedades, secciones complementarias solo si hay datos, footer)."

## Contexto: punto de partida verificado

Esta iteración parte de la portada entregada en `001-home-redesign`. Se relevó el estado actual antes de escribir esta especificación:

- **Orden actual**: header → hero (etiqueta, título grande, subtítulo, buscador, dos enlaces secundarios) → categorías → novedades → bloque de beneficios ("Gratis", "Sin registro", "Listos para usar" + botón al catálogo) → footer.
- **Header**: marca "Plantillarte", enlaces "Inicio" y "Catálogo", menú móvil y **un buscador desplegable que también aparece en la portada**, duplicando el buscador del hero.
- **Acceso a cuenta**: el sitio público **no tiene** acceso a cuenta para visitantes. La única autenticación es la del panel de administración, que vive en su propia ruta y no se enlaza desde el sitio público.
- **Búsqueda existente**: lleva al catálogo con el término; encuentra recursos publicados cuyo **nombre o descripción** contienen el término, sin distinguir mayúsculas.
- **Categorías existentes**: solo las activas, en el orden definido por el administrador, cada una con nombre, identificador legible e ícono asignado (con ícono genérico de respaldo) y la cantidad de recursos publicados. Hoy se muestran en fila desplazable en móvil, pero **en grilla de varias filas** desde tableta.
- **Filtro por categoría existente**: el catálogo acepta una categoría como filtro y la combina con la búsqueda.
- **Novedades existentes**: hasta 8 recursos publicados, del más reciente al más antiguo según su fecha de publicación; cada tarjeta muestra vista previa, nombre y categoría, y lleva a la página del recurso.
- **Datos disponibles para secciones complementarias**: cada recurso tiene un **contador de descargas**. **No existe** ninguna entidad de "colección" ni marca de "destacado".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Buscar un diseño desde el primer vistazo (Priority: P1)

Una persona llega a la portada con una idea concreta ("calendario 2027", "invitación"). Identifica de inmediato un único buscador destacado, escribe el término y llega al catálogo con los resultados de esa búsqueda.

**Why this priority**: Es el camino más directo hacia un recurso y la interacción principal de la página. Si solo se entregara esto, la portada ya cumple su objetivo central.

**Independent Test**: Abrir la portada, verificar que hay un solo buscador visible, buscar un término que coincide con el nombre o la descripción de un recurso publicado y comprobar que el catálogo muestra ese recurso.

**Acceptance Scenarios**:

1. **Given** la portada cargada en cualquier tamaño de pantalla, **When** la persona la mira sin desplazarse, **Then** ve un único buscador y el título que comunica el propósito de Plantillarte.
2. **Given** el buscador del hero, **When** la persona escribe un término y confirma (botón o tecla Enter), **Then** llega al catálogo filtrado por ese término con el mismo resultado que da hoy la búsqueda existente.
3. **Given** el buscador vacío o con solo espacios, **When** la persona confirma, **Then** llega al catálogo completo sin filtro de búsqueda.
4. **Given** la portada, **When** se revisa el header, **Then** no aparece un segundo buscador; en el resto de las páginas públicas el buscador del header sigue disponible como hoy.

---

### User Story 2 - Descubrir por categoría (Priority: P1)

Una persona que todavía no sabe qué busca recorre las categorías como una fila horizontal de elementos con ícono y nombre, elige una y llega al catálogo filtrado por esa categoría.

**Why this priority**: Las categorías son la otra puerta de entrada principal al catálogo y el eje visual de esta iteración.

**Independent Test**: Con categorías activas cargadas, verificar que se muestran en una sola fila horizontal, con ícono y nombre, que en móvil se desplazan lateralmente sin romper la página, y que cada una lleva al catálogo filtrado por ella.

**Acceptance Scenarios**:

1. **Given** categorías activas en el sistema, **When** se carga la portada, **Then** se muestran todas, en el orden definido por el administrador, en una única fila horizontal, cada una con ícono y nombre.
2. **Given** una pantalla en la que las categorías no entran a lo ancho, **When** la persona desliza la fila (táctil, rueda o teclado), **Then** la fila se desplaza horizontalmente y la página no genera desplazamiento horizontal propio.
3. **Given** la fila de categorías, **When** la persona elige una, **Then** llega al catálogo filtrado por esa categoría.
4. **Given** que el administrador desactiva una categoría, **When** se vuelve a cargar la portada, **Then** esa categoría ya no aparece.
5. **Given** que no hay categorías activas, **When** se carga la portada, **Then** se muestra un mensaje de estado vacío con acceso al catálogo, sin categorías inventadas.

---

### User Story 3 - Ver lo último que se agregó (Priority: P2)

Una persona que vuelve a Plantillarte quiere ver qué hay de nuevo. Encuentra la sección de novedades, con las vistas previas como protagonistas, y puede abrir un recurso o ir al catálogo completo.

**Why this priority**: Da protagonismo visual a los diseños y alimenta las visitas recurrentes, pero depende de que la búsqueda y las categorías ya estén resueltas.

**Independent Test**: Con recursos publicados en distintas fechas, verificar que la sección los muestra del más reciente al más antiguo, con tarjetas uniformes, y que cada tarjeta y el enlace "ver todo" navegan como hoy.

**Acceptance Scenarios**:

1. **Given** recursos publicados, **When** se carga la portada, **Then** la sección de novedades muestra hasta 8 de ellos, del publicado más recientemente al más antiguo.
2. **Given** una tarjeta de novedades, **When** la persona la elige, **Then** llega a la página de ese recurso, igual que hoy.
3. **Given** la sección de novedades con contenido, **When** la persona elige la acción para ver el catálogo completo, **Then** llega al catálogo sin filtros.
4. **Given** un recurso sin imagen, **When** aparece en la sección, **Then** su tarjeta muestra un reemplazo visual neutro y conserva el mismo tamaño que las demás.
5. **Given** que no hay recursos publicados, **When** se carga la portada, **Then** la sección muestra un estado vacío con acceso al catálogo, sin contenido ficticio.

---

### Edge Cases

- **Nombres de categoría largos**: el nombre se corta a dos líneas como máximo, sin desbordar el elemento ni deformar la fila.
- **Pocas categorías** (por ejemplo, 1 a 3): la fila no deja huecos desproporcionados ni se estira de forma artificial.
- **Muchas categorías** (más de las que entran en escritorio): la fila se desplaza horizontalmente también en escritorio y existe una señal visual de que hay más contenido.
- **Categoría sin ícono asignado**: muestra el ícono genérico de respaldo existente.
- **Categoría activa sin recursos publicados**: se muestra igual (con su cantidad en cero) y lleva al catálogo, que muestra su propio estado vacío.
- **Fallo al cargar categorías o novedades**: cada sección muestra su propio mensaje de error; el resto de la portada (hero, buscador, footer) sigue funcionando.
- **Carga lenta**: cada sección con datos muestra un marcador de carga con la misma forma que el contenido final, sin saltos de diseño al terminar de cargar.
- **Término de búsqueda con caracteres especiales o acentos**: se envía tal cual a la búsqueda existente, que define los resultados.
- **Recurso re-publicado**: su posición en novedades sigue la fecha de publicación que registra hoy el sistema.
- **Movimiento reducido**: si la persona pidió reducir el movimiento en su sistema, las animaciones de entrada y de interacción no se ejecutan.

## Requirements *(mandatory)*

### Functional Requirements

**Estructura y orden**

- **FR-001**: La portada MUST presentar sus secciones en este orden: header, hero con buscador, categorías horizontales, novedades y footer. No se agregan secciones complementarias en esta iteración.
- **FR-002**: La portada MUST NOT incluir secciones sin datos que las respalden ni secciones con fines solo decorativos. El bloque de beneficios actual ("Gratis", "Sin registro", "Listos para usar") se retira de la portada, porque repite mensajes del hero y del footer; su enlace al catálogo queda cubierto por el de novedades.

**Header**

- **FR-003**: El header MUST conservar la marca Plantillarte, los enlaces "Inicio" y "Catálogo", el menú móvil y la indicación de página activa.
- **FR-004**: En la portada, el header MUST NOT mostrar su buscador. En el resto de las páginas públicas el buscador del header MUST seguir funcionando como hoy.
- **FR-005**: El header MUST NOT incorporar accesos a cuenta que hoy no existen en el sitio público.

**Hero con buscador**

- **FR-006**: El hero MUST contener un título breve que comunique el propósito de Plantillarte y un buscador destacado como elemento principal de interacción.
- **FR-007**: El hero MUST eliminar los elementos que no aportan a la búsqueda ni al descubrimiento y que ya están cubiertos por otras secciones (los enlaces secundarios "Explorar recursos" y "Ver categorías").
- **FR-008**: Al confirmar una búsqueda, el sistema MUST llevar a la persona al catálogo con el término, usando la búsqueda existente (coincidencias en nombre o descripción). Un término vacío lleva al catálogo sin filtro.
- **FR-009**: El buscador MUST tener una etiqueta accesible, permitir limpiar el texto y poder usarse solo con teclado.

**Categorías horizontales**

- **FR-010**: La sección de categorías MUST mostrar todas las categorías activas, obtenidas de los datos reales, en el orden definido por el administrador.
- **FR-011**: Cada categoría MUST mostrarse como un elemento visual con su ícono y su nombre, y MUST llevar al catálogo filtrado por esa categoría.
- **FR-012**: Las categorías MUST disponerse en una única fila horizontal en todos los tamaños de pantalla. Cuando no entren a lo ancho, la fila MUST desplazarse horizontalmente dentro de sí misma, sin generar desplazamiento horizontal en la página.
- **FR-013**: La fila de categorías MUST poder recorrerse con teclado y cada elemento MUST tener un área de toque de al menos 44 × 44 px.
- **FR-014**: La portada MUST NOT usar una barra lateral permanente.

**Novedades**

- **FR-015**: La sección de novedades MUST mostrar hasta 8 recursos publicados reales, ordenados del más reciente al más antiguo por fecha de publicación.
- **FR-016**: Cada tarjeta MUST dar protagonismo a la vista previa y mostrar el nombre y la categoría del recurso; todas las tarjetas MUST tener la misma proporción de imagen.
- **FR-017**: Cada tarjeta MUST conservar su navegación actual hacia la página del recurso.
- **FR-018**: La sección MUST incluir una acción visible para ir al catálogo completo.

**Estados, accesibilidad y consistencia**

- **FR-019**: Cada sección con datos MUST tener estados propios de carga, vacío y error, sin afectar al resto de la portada.
- **FR-020**: La portada MUST adaptarse a móvil, tableta y escritorio sin desplazamiento horizontal de página, con tarjetas legibles en móvil.
- **FR-021**: Tipografía, espaciados, bordes, colores e íconos MUST ser consistentes entre secciones y con el resto del sitio público.
- **FR-022**: Las animaciones MUST respetar la preferencia de movimiento reducido.

**Footer y límites**

- **FR-023**: El footer MUST conservar sus enlaces e información actuales (marca y descripción, enlaces a categorías, "Todos los recursos", "Novedades", aviso de derechos) y mantener la consistencia visual con la portada.
- **FR-024**: Este cambio MUST NOT modificar el modelo de datos, el esquema de la base de datos, la autenticación, las rutas existentes ni el formato de los enlaces al catálogo, y MUST NOT agregar dependencias nuevas.

### Key Entities *(datos existentes, sin cambios)*

- **Categoría**: agrupa recursos. Atributos que usa la portada: nombre, identificador legible, estado activo, orden definido por el administrador y cantidad de recursos publicados.
- **Recurso (diseño)**: lo que se descarga. Atributos que usa la portada: nombre, identificador legible, categoría, estado de publicación, fecha de publicación, imagen principal (con su miniatura) y contador de descargas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una pantalla de escritorio de 1366 × 768 y en una de móvil de 375 × 667, el buscador y la fila de categorías se ven completos sin desplazarse, y en escritorio también se ve el comienzo de la sección de novedades.
- **SC-002**: En la portada hay exactamente 1 buscador visible en todos los tamaños de pantalla.
- **SC-003**: El 100 % de las categorías activas aparece en la portada y el 100 % lleva al catálogo filtrado por la categoría correcta.
- **SC-004**: El 100 % de las novedades son recursos publicados reales, en orden de publicación descendente, y el 100 % de sus tarjetas abre la página del recurso correcto.
- **SC-005**: Entre 320 px y 1920 px de ancho, la página no genera desplazamiento horizontal y ningún texto se desborda de su contenedor.
- **SC-006**: Una persona llega a un recurso en 3 interacciones o menos desde la portada, ya sea buscando (escribir, confirmar, elegir) o por categoría (elegir categoría, elegir recurso).
- **SC-007**: Se puede completar la búsqueda y la navegación por categorías solo con teclado, con el foco siempre visible.
- **SC-008**: No hay regresiones: el panel de administración, su acceso, el catálogo, la búsqueda, el filtro por categoría, la página de recurso y las descargas funcionan igual que antes del cambio.

## Assumptions

- La búsqueda conserva su alcance actual (nombre y descripción). Ampliarla a etiquetas u otros campos queda fuera de esta iteración.
- "Fecha de incorporación" se interpreta como la fecha de publicación que ya registra el sistema, que es la que usa hoy la sección de novedades.
- El límite de 8 novedades se mantiene, porque completa dos filas en escritorio y no alarga la página.
- Los íconos de categoría siguen la asignación existente con su respaldo genérico; no se agregan imágenes de portada por categoría en esta iteración.
- La cantidad de recursos publicados por categoría se sigue mostrando como dato secundario si entra sin recargar el elemento; no es obligatoria.
- El catálogo, la página de recurso y el panel de administración no forman parte del alcance, salvo lo necesario para no generar regresiones.
- "Colecciones destacadas" queda descartada: el sistema no tiene datos que la respalden.
- "Más descargados" queda fuera de esta iteración (decisión del usuario, 2026-11-09). Aunque el contador de descargas existe, se prioriza una portada enfocada sin consultas nuevas; se puede retomar en una iteración futura.

## Clarifications

### Session 2026-11-09

- Q: ¿Se incorpora una sección "Más descargados" basada en el contador de descargas existente? → A: No, se deja para otra iteración.
- El header no tiene accesos de cuenta para visitantes y esta iteración no los crea.
