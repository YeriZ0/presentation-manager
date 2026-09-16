# Pilares o atributos

## Usar cuando

Existen de dos a cuatro conceptos paralelos con importancia equivalente y sin relaciones explicitas entre ellos.

## Composicion

- Usar columnas abiertas sin superficie por defecto
- Centrar el conjunto verticalmente cuando el contenido sea breve
- Mantener una secuencia consistente: tema, icono y descripcion
- Separar columnas con espacio o divisores finos
- Alinear titulos y descripciones en una linea base comun
- Omitir el lead por defecto; admitirlo solo cuando agregue contexto nuevo y no supere dos lineas

## Iconos

- Asignar un icono semantico diferente a cada concepto
- Usar iconos en todos los pilares o en ninguno
- Preferir 96px a 128px con peso visual `bold`
- No repetir el icono del lead porque el lead no debe contener iconos

## Limites

- Dos a cuatro pilares
- Tema de una a cuatro palabras
- Una descripcion de 12 a 24 palabras por pilar y cuatro lineas como maximo
- Un solo nivel de subtitulo dentro de cada columna

## Marcado

- Declarar `data-template="academic-sober"` y `data-slide-structure="pillars"` en `body`
- Marcar cada unidad con `data-thematic-unit`
- Marcar tema y descripcion con `data-unit-topic` y `data-unit-description`
- Usar `.deck-icon` dentro de todas las unidades o en ninguna

## Tarjetas

Usarlas solo si cada pilar representa un estado, accion o unidad que necesita una frontera explicita. La presencia de tres conceptos no justifica por si sola una tarjeta.
