# Grafica simple

## Usar cuando

La diapositiva debe mostrar comparacion, evolucion o composicion con pocos datos y una conclusion visible.

## Seleccion

- Barras horizontales: comparar categorias, especialmente con etiquetas largas
- Columnas: comparar pocos periodos ordenados o cantidades que parten de cero
- Lineas: mostrar evolucion temporal o una secuencia ordenada
- Dona: mostrar una sola composición que suma 100%, con tres a cinco segmentos y radios uniformes
- Preferir barras o columnas cuando la audiencia deba comparar diferencias pequenas entre partes

## Composicion

- Escribir un titulo conclusivo y mantener el grafico como evidencia
- Colocar etiquetas cerca de la marca que describen
- Mostrar escala, unidad, periodo y fuente
- Usar una serie principal y hasta dos series de contexto
- Usar SVG inline y una descripcion textual del hallazgo
- Generar segmentos y leyenda desde la misma fuente de datos
- Asociar cada segmento con su etiqueta, porcentaje y color mediante un identificador común

## Contrato de dona

- Declarar un único `figure[data-chart-type="donut"]` por slide, con `data-chart-cx`, `data-chart-cy`, `data-chart-inner-radius` y `data-chart-outer-radius` numéricos en unidades de su SVG
- Usar tres a cinco sectores anulares `path`; cada uno lleva un ID ASCII único en `data-chart-segment`, `data-value` positivo y `data-label` con su categoría
- Calcular ángulos acumulados desde una sola colección de datos; la suma debe ser 100 y el conjunto debe cubrir 360 grados sin huecos ni solapamientos
- Usar el mismo centro y radios; generar los trazados en autoría con `scripts/lib/donut-geometry.mjs` o una construcción equivalente verificable
- No usar círculos con `stroke-dasharray`, anillos de fondo, separaciones entre sectores ni otras formas SVG que se lean como categorías adicionales
- Los sectores usan relleno opaco, sin trazo, filtros, máscaras ni recorte; los textos y la leyenda permanecen en HTML
- Cada entrada `data-chart-legend="<id>"` contiene `data-chart-label`, `data-chart-value` (porcentaje visible) y `data-chart-swatch` (muestra de color)
- Exigir correspondencia uno a uno de IDs, etiquetas, porcentajes y colores entre sectores y leyenda; no marcar solo el contenedor de toda la leyenda
- El centro HTML `data-chart-center` muestra el máximo de la serie y su categoría, no el total genérico `100%`
- Dentro del centro, usar un `data-chart-center-item="<id>"` por categoría máxima, con `data-chart-label` y `data-chart-value`; marcar exactamente los sectores máximos con `data-chart-highlight`
- Si hay empate, mostrar todas las categorías máximas y un texto visible `Empate` marcado con `data-chart-tie`; no elegir arbitrariamente una ganadora
- El centro y el énfasis se derivan de los datos, nunca de textos o porcentajes fijos independientes

## Distribución y CSS de dona

- Mantener SVG, centro, leyenda y fuente dentro del mismo `figure`; agrupar SVG y centro en un contenedor relativo, separado de la leyenda
- Superponer el centro HTML sobre el centro geométrico del SVG. Centrarlo en ambos ejes y mantener su texto completamente dentro del hueco, sin depender de su posición normal en el documento
- Usar el diámetro exterior visible, no el tamaño del `viewBox`, para dimensionar la gráfica: entre 320px y 560px en el lienzo `1920x1080`
- Etiquetas y porcentajes de leyenda: 24px a 28px; porcentaje principal central: 28px a 40px como mínimo de jerarquía, pudiendo ampliarse si cabe; categoría central: al menos 24px
- Mostrar cada entrada de leyenda en una fila con muestra, categoría y porcentaje, con separación mínima de 12px entre campos y 12px entre filas
- Estilizar mediante los marcadores del contrato o clases realmente presentes en el HTML; no dejar CSS para una tabla si la leyenda está construida con elementos de bloque
- Una alternativa textual que se declare `sr-only` o `visually-hidden` debe tener el CSS accesible de ocultación visual (1px, posición absoluta, recorte y sin `display: none` ni `aria-hidden`). Si se quiere visible, presentarla como contenido diseñado, con tamaños legibles, no como una tabla adicional sin estilo
- Mantener unidad, periodo y fuente legibles y reservar el pie. No añadir tablas duplicadas para ocupar espacio ni dejar textos con el tamaño predeterminado del navegador

Un máximo individual es distinto de una suma destacada en el subtítulo: para 40/35/15/10, el centro es la categoría de 40 %, no 75 % ni 100 %. Si no hay tres categorías significativas, elegir una estructura más adecuada en lugar de rellenar una dona.

La validación exige el tipo cuando aparecen marcadores de dona y comprueba el dibujo renderizado además de los valores declarados. Cuatro categorías deben producir cuatro sectores y cuatro muestras, sin un quinto tono de fondo visible.

## Limites

- Siete categorias en barras o columnas
- Dos series en lineas; tres solo si las etiquetas permanecen directas
- Diez puntos por serie en una diapositiva de lectura rapida
- Cinco segmentos de dona como máximo

## Evitar

- Ejes truncados en barras o columnas
- Doble eje, 3D, gradientes, sombras o animaciones que alteren la lectura
- Graficas sin fuente, unidad o alcance
- Varias gráficas circulares para comparar grupos
