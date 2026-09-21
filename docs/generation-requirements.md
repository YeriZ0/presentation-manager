# Requisitos de generación de presentaciones

Este documento resume lo que se solicita al usuario y lo que debe producir el agente. Las reglas normativas son `AGENTS.md`, la skill `create-web-deck`, su [flujo de creación](../.agents/skills/create-web-deck/references/creation-workflow.md) y la plantilla seleccionada. No es necesario que el usuario conozca los atributos técnicos para responder.

## Información y aprobaciones

1. Un nombre de trabajo obligatorio para crear las carpetas de fuentes y esquemas. Puede diferir del título visible.
2. Una plantilla y un punto de partida: tema, documentos o esquema. La reanudación reutiliza el trabajo existente.
3. Los datos de identidad y alcance que no se hayan aportado ya. Los campos opcionales pueden omitirse.
4. Una decisión editorial: textos propuestos desde fuentes autorizadas, desde la conversación pertinente o definidos personalmente.
5. Aprobación de un esquema legible y de los recursos propuestos, incluidos los iconos recomendados. Otras presentaciones solo se consultan cuando el usuario lo autoriza expresamente para esa tarea.

Las decisiones se recogen con la herramienta de preguntas. Los resúmenes se revisan por secciones pequeñas, no en un modal con toda la presentación:

- Identidad y subtítulo, bloques temáticos del esquema, diseño y recursos se revisan por separado cuando necesitan aprobación.
- Cada sección del esquema contiene habitualmente dos diapositivas y como máximo tres; se reduce a una si el texto no cabe cómodamente. Se conservan números globales, títulos, descripciones breves y saltos de línea.
- Cada sección permite **Confirmar sección** o **escribir ajustes** en la respuesta libre nativa. Se confirma solo lo mostrado; los cambios se aplican y se vuelve a presentar únicamente esa sección.
- Las secciones ya aprobadas se conservan. Si un cambio afecta a otra, se reabre solo la parte dependiente.
- Al terminar se informa el progreso completo y se continúa; no aparece otra confirmación gigante con todo el resumen.

El flujo establece un presupuesto breve de texto y líneas y registra versiones y aprobaciones en `_working/creation-state.json`. El usuario no necesita modificar ese archivo ni cambiar el tamaño de su consola. Si el cliente no conserva los saltos, se muestra únicamente la sección actual como lista breve en el chat y una confirmación corta en el modal. `Escriba en otro` es una indicación en el enunciado, nunca una opción que duplique la respuesta libre nativa.

## Resultado esperado con academic-sober

### Iconos y unidades abiertas

- Pilares, comparaciones, elementos narrativos y pasos de procesos incluyen iconos semánticos por defecto, en orden tema → icono → descripción.
- En las cuatro estructuras, tema, icono y descripción se centran horizontalmente dentro de cada columna, tanto sus cajas como el texto. El centrado sigue siendo obligatorio si se acuerda omitir iconos. Se aplica desde el CSS inicial mediante los marcadores semánticos y se verifica sobre el resultado real.
- No basta con instalar una biblioteca o insertar un elemento vacío: el activo debe existir, estar cargado y ser visible.
- El usuario puede pedir una omisión. Si no existe un icono semántico adecuado, el agente debe consultar una adaptación y registrar la decisión; no puede omitir silenciosamente todos los iconos.
- Estas unidades nunca se encierran en tarjetas, bordes u otros recuadros, aunque se les atribuya una frontera semántica.
- Se conservan límites funcionales de diagramas, tablas y código según sus estructuras. Los conectores de procesos lineales están prohibidos: la numeración expresa el orden.

Fuente: [iconografía](templates/academic-sober/foundations/iconography.md), [jerarquía](templates/academic-sober/foundations/hierarchy.md) y las estructuras correspondientes.

### Código

- De una a dieciséis líneas, numeradas explícitamente; el rango anunciado coincide con el fragmento mostrado.
- Texto de 22–28px a `1920x1080`, comenzando con interlineado 1.35 y sin superar 1.55.
- Una fila visual por línea. El formateo del HTML no puede introducir espacios vacíos entre todas las líneas.
- El bloque, sus caracteres finales, la explicación y el contador de diapositiva permanecen visibles. Ocultar el desbordamiento no resuelve un exceso.
- Los números se escriben en HTML y se ocultan únicamente de las tecnologías de asistencia, no de la vista.

Fuente: [fundamentos de código](templates/academic-sober/foundations/code.md).

### Gráficas y diagramas

- Una dona usa una sola colección de datos para sectores, colores, leyenda, máximo central y alternativa textual.
- El máximo y su categoría están físicamente dentro del hueco, no solo en un elemento llamado «centro».
- Diámetro visible de 320–560px, etiquetas de al menos 24px y valor central de al menos 28px en el lienzo de autoría.
- Leyenda con filas legibles y campos separados; no dejar tamaños predeterminados del navegador ni estilos de clases que no existen en el HTML.
- SVG, centro, leyenda y fuente pertenecen a la misma figura. Una tabla destinada a lectura asistida debe estar visualmente oculta mediante CSS efectivo y seguir accesible.
- Los diagramas relacionales se rigen por su estructura de nodos, rutas y etiquetas; no se confunden con gráficos de porcentajes ni listas de pasos.

Fuente: [gráficas](templates/academic-sober/slides/graficas/chart.md) y [diagramas](templates/academic-sober/foundations/diagrams.md).

## Antes de generar y antes de entregar

El agente carga primero las restricciones y prepara una composición conforme; no genera elementos prohibidos para borrarlos después. Luego valida el HTML final y el resultado renderizado, con los recursos cargados y las animaciones activadas.

La validación debe detectar omisiones silenciosas de iconos, recuadros temáticos, código espaciado o recortado, numeración ausente, centros de dona desplazados y alternativas accesibles sin estilo. Si un control falla, corregir su causa sin reducir tipografías, ocultar contenido, saltarse validadores ni afirmar que una comprobación pendiente ya se realizó.

El empaquetador oficial utiliza Node.js, los validadores locales y Playwright con Chromium. Los cambios de instrucciones de un agente requieren una sesión que vuelva a cargarlas; en OpenCode, cerrar y reiniciar después de actualizar la skill o `AGENTS.md`.
