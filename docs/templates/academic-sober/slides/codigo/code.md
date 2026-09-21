# Fragmento de codigo

## Usar cuando

Una decision tecnica, una transformacion o una diferencia de implementacion se entiende mejor viendo pocas lineas reales.

## Composicion

- Colocar el codigo despues del titulo y antes de la explicacion
- Mostrar lenguaje, archivo y rango de lineas como metadatos
- Resaltar una region y describirla con una anotacion breve
- Diferenciar tipos de token con una paleta accesible adecuada a la plantilla
- Asociar la región resaltada con la anotación mediante ARIA
- Admitir una anotación lateral breve según `../../foundations/code.md`; reservar una segunda columna de código solo para un antes y después corto
- Descontar metadatos, rellenos, anotación, cabecera y contador antes de dimensionar el bloque según `../../foundations/spacing.md`
- Mantener una fila visual por `data-code-line` y un foco sin barras decorativas según `../../foundations/code.md`
- Incluir número visible `data-code-number` y tokens en `data-code-content` por fila; declarar el rango real en `pre` con `data-code-start` y `data-code-end`

## Limites

- De una a dieciséis líneas visibles, sin mínimo de relleno
- Longitud de línea limitada por el ancho efectivo; ochenta caracteres son una referencia aproximada, no una garantía de ajuste
- Una anotacion principal por bloque
- Una sola diferencia conceptual por diapositiva

## Evitar

- Mostrar archivos completos o bloques que requieran desplazamiento
- Ocultar líneas o caracteres desbordados, o introducir filas vacías accidentales dentro de `<pre>`
- Usar el fragmento como editor interactivo
- Ejecutar el codigo mostrado
- Usar colores de sintaxis sin etiquetas, contraste o contexto
