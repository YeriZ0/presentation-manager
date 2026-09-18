# Visualizacion de datos

## Principio

Elegir la forma por la pregunta que debe responder la audiencia, no por novedad visual. Una diapositiva de datos debe comunicar una conclusion principal y dejar el detalle verificable en etiquetas, unidades, fuente y una alternativa textual.

## Paleta

- Usar grafito para ejes, texto, lineas base y datos principales
- Usar tonos institucionales diferenciables para series secundarias; evitar grises sin contraste suficiente
- Reservar `[ACENTO]` para una sola conclusion, serie o punto de atencion, no para numeraciones
- Usar una escala de luminosidad para datos ordenados
- No usar color como unica diferencia entre series; sumar etiquetas, formas, patrones o posicion
- Mantener al menos 3:1 de contraste para objetos graficos relevantes y 4.5:1 para texto pequeno

## Estructura compartida

- Escribir un titulo que anticipe la conclusion, no solamente el nombre de la grafica
- Mostrar unidad, periodo y alcance en el subtitulo o pie
- Etiquetar directamente cuando haya hasta 4 series o categorias legibles
- Usar leyenda solo cuando las etiquetas directas provoquen cruces o saturacion
- Incluir fuente visible y una descripcion textual del hallazgo principal
- En una dona, generar segmentos, porcentajes, colores y leyenda desde la misma fuente de datos
- Mantener un único centro y radios constantes para todos los segmentos de una dona
- Crear graficas con SVG inline en el HTML; no depender de Canvas o renderizado de datos en JavaScript

## Escalas y marcas

- Barras y columnas deben iniciar en cero cuando codifican magnitud por longitud
- No usar ejes truncados, efectos 3D, sombras o gradientes para exagerar diferencias
- Las lineas representan evolucion ordenada; no unir categorias sin orden temporal o logico
- Usar lineas rectas por defecto; evitar suavizado que invente valores intermedios
- Mantener una cuadricula ligera y solo las marcas necesarias para orientarse
- Mostrar el valor exacto cuando la comparacion precisa sea parte del argumento

## Diagramas

Los diagramas relacionales no son graficas de datos. Cargar `foundations/diagrams.md` y seguir la estructura `system-diagram` cuando existan nodos y conectores. Usar `data-flow` para movimiento, transformacion o custodia de informacion; usar una grafica cuando la pregunta dependa de magnitudes, periodos o proporciones.

## Movimiento

- Animar la entrada de marcas en el orden de lectura
- No cambiar escalas, posiciones o valores durante la animacion
- No usar movimiento continuo para adornar datos estaticos
- Mostrar todo el contenido con `prefers-reduced-motion: reduce`
