# Proceso secuencial

## Usar cuando

El contenido describe una secuencia lineal con orden obligatorio y sin decisiones, responsables diferenciados ni retorno. Usar `system-diagram` con `workflow`, `sequence` o `lifecycle` cuando existan ramas, intercambios o estados.

## Composición

- Distribuir de tres a cinco pasos en un `ol`
- Ordenar la progresión horizontalmente de izquierda a derecha
- Mantener todos los pasos sobre el mismo eje y con separaciones constantes
- Mantener en cada paso el orden título, icono y descripción
- Centrar número, título, caja del icono y descripción dentro de cada `[data-process-step]`, incluido el texto, según `../../foundations/hierarchy.md`; avanzar de izquierda a derecha no significa alinear el contenido del paso a la izquierda
- Mostrar números consecutivos y únicos desde 1, con ceros iniciales opcionales, nunca como sustitutos del título
- La numeración expresa el orden; no agregar flechas, líneas ni capas de conectores entre pasos
- Cada paso incluye un icono semántico por defecto; una omisión requiere la decisión explícita de `../../foundations/iconography.md`
- Los pasos son unidades abiertas sin tarjetas ni recuadros con bordes
- Centrar verticalmente la secuencia completa
- Animar en el mismo orden de la secuencia

## Marcadores

- Marcar el contenedor con `data-process`
- Marcar el `ol` o cada `li` de forma semántica
- Marcar cada paso con `data-process-step`
- Usar `data-step-number`, `data-step-title` y `data-step-description`
- Escribir la numeración directamente en HTML visible y en orden de lectura
- No usar `data-process-connectors` ni `data-process-arrow` en nuevas autorías

## Límites

- Tres a cinco pasos
- Hasta cuatro palabras por título
- Hasta 24 palabras por descripción
- Sin bifurcaciones; cambiar a `workflow` cuando exista una decision real

## Evitar

- Desniveles o inclinaciones diferentes entre pasos equivalentes
- Tarjetas desconectadas que oculten la secuencia
- Flechas, SVG, líneas o iconos utilizados como separadores entre pasos
- Numeración generada con CSS `content`
- Agregar una explicación lateral que compita con la secuencia
