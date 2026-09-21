# Pilares o atributos

## Usar cuando

Existen de dos a cuatro conceptos paralelos con importancia equivalente y sin relaciones explicitas entre ellos.

## Composicion

- Usar columnas abiertas sin tarjetas, superficies de tarjeta ni recuadros con bordes
- Centrar el conjunto verticalmente cuando el contenido sea breve
- Mantener una secuencia consistente: tema, icono y descripcion
- Separar columnas únicamente con espacio según `../../foundations/hierarchy.md`
- Centrar horizontalmente tema, caja del icono y descripción dentro de cada columna
- Alinear entre columnas las bandas de tema, icono y descripción, con separaciones de `../../foundations/spacing.md`
- Omitir el lead por defecto; admitirlo solo cuando agregue contexto nuevo y no supere dos lineas

## Iconos

- Asignar un icono semantico diferente a cada concepto
- Incluir un icono por pilar por defecto; omitirlos únicamente mediante la decisión explícita de `../../foundations/iconography.md`
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
- Usar `.deck-icon` dentro de cada unidad salvo omisión explícita del grupo

## Tarjetas

No usar tarjetas ni recuadros con bordes en pilares, aunque se describan estados o acciones. No declarar `data-boundary="semantic"` para eludir esta restricción; separar con espacio. Si el contenido requiere fronteras relacionales reales, seleccionar una estructura apropiada antes de generar.
