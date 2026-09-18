# Comparación

## Usar cuando

La audiencia debe contrastar dos opciones, modelos o criterios equivalentes.

## Composición

- Usar exactamente dos unidades abiertas y equivalentes
- Mantener en cada unidad el orden título, icono y descripción
- Colocar un texto breve entre ambas unidades, por ejemplo `Frente a`, para declarar la comparación
- Mantener anchos, tamaños de icono, alineación y densidad equivalentes
- Usar tabla para tres o más opciones con criterios compartidos
- Para valores exactos, seguir `../graficas/table.md`; para tendencias o magnitudes, seguir `../graficas/chart.md`
- Centrar verticalmente la comparación como una sola composición

## Marcadores

- Marcar el contenedor con `data-comparison`
- Marcar cada `article` con `data-comparison-option`
- Usar `data-unit-topic` y `data-unit-description` en cada opción
- Marcar el texto central con `data-comparison-connector`
- Usar `.deck-icon` en ambas opciones o no usar iconos

## Límites

- Dos opciones
- Hasta cuatro palabras por título
- Hasta 24 palabras por descripción
- Un texto comparativo central de hasta tres palabras

## Evitar

- Barras, separadores o tarjetas para identificar las opciones
- Etiquetas redundantes como `Alternativa A` y `Alternativa B`
- Colores sin significado
- Iconos distintos en peso o tamaño para elementos equivalentes
