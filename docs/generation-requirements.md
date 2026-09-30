# Requisitos de generación de presentaciones

Este documento resume lo que se solicita al usuario y lo que debe producir el agente. Las reglas normativas son `AGENTS.md`, la skill `create-web-deck`, su [flujo de creación](../.agents/skills/create-web-deck/references/creation-workflow.md) y la plantilla seleccionada. No es necesario que el usuario conozca los atributos técnicos para responder.

## Informacion y revision

1. Un nombre de trabajo obligatorio para crear las carpetas de fuentes y esquemas. Puede diferir del título visible.
2. Una plantilla y un punto de partida: tema, documentos o esquema. La reanudación reutiliza el trabajo existente.
3. Los datos de identidad y alcance que no se hayan aportado ya. Los campos opcionales pueden omitirse.
4. Una decisión editorial: textos propuestos desde fuentes autorizadas, desde la conversación pertinente o definidos personalmente.
5. Revision directa de `presentations/<slug>/_working/structure/slide-content.md`. Otras presentaciones solo se consultan cuando el usuario lo autoriza expresamente para esa tarea.

Las decisiones que faltan se recogen con la herramienta de preguntas. El contenido editorial no se confirma en modales: el agente crea `slide-content.md` y el usuario lo consulta y edita directamente.

- El archivo contiene una diapositiva por bloque, en su orden final, con nombre e ID de estructura, textos visibles, iconos, recursos y notas.
- Las tablas contienen encabezados y celdas; las graficas incluyen datos, unidad, periodo, fuente, conclusion y alternativa textual.
- Los diagramas relacionales incluyen tipo, direccion, pie y fuente Mermaid completa, junto con su ruta final bajo `diagrams/`.
- Las imagenes, logos, capturas e ilustraciones indican estado, ruta final bajo `assets/`, texto alternativo y pie visible.
- El usuario puede reordenar, agregar, eliminar o editar bloques directamente. Antes de generar, el agente relee el archivo y consulta solamente campos incompletos, conflictos, permisos o recursos pendientes.
- Al empaquetar, se incluye el contenido completo de `_working/structure/` bajo `structure/`, una copia de `slide-content.md` en la raíz y se excluye `_working/sources/`.
- Los esquemas originales aportados para iniciar el trabajo permanecen en `_working/sources/`; `structure/` se reserva para los materiales editoriales generados que se compartirán en el ZIP.

El formato completo se define en `.agents/skills/create-web-deck/references/slide-content-format.md`. `_working/creation-state.json` conserva solo estado operativo, como fuentes autorizadas, pendientes y la huella de la ultima lectura; no contiene una segunda copia editable del contenido.

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
- Los diagramas relacionales conservan una fuente Mermaid editable bajo `diagrams/` y un SVG estático inline compilado; no se confunden con gráficos de porcentajes ni listas de pasos.
- El ZIP comparte `.mmd`, configuración, versión y hash para permitir continuar la edición, pero nunca incluye ni ejecuta el runtime de Mermaid.

Fuente: [gráficas](templates/academic-sober/slides/graficas/chart.md) y [diagramas](templates/academic-sober/foundations/diagrams.md).

## Antes de generar y antes de entregar

El agente carga primero las restricciones y prepara una composición conforme; no genera elementos prohibidos para borrarlos después. Luego valida el HTML final y el resultado renderizado, con los recursos cargados y las animaciones activadas.

La validación debe detectar omisiones silenciosas de iconos, recuadros temáticos, código espaciado o recortado, numeración ausente, centros de dona desplazados y alternativas accesibles sin estilo. Si un control falla, corregir su causa sin reducir tipografías, ocultar contenido, saltarse validadores ni afirmar que una comprobación pendiente ya se realizó.

El empaquetador oficial utiliza Node.js y validadores locales. Los diagramas Mermaid requieren un navegador compatible ya instalado. Los cambios de instrucciones de un agente requieren una sesión que vuelva a cargarlas; en OpenCode, cerrar y reiniciar después de actualizar la skill o `AGENTS.md`.
