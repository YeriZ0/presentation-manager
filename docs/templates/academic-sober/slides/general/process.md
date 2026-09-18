# Proceso secuencial

## Usar cuando

El contenido describe una secuencia lineal con orden obligatorio y sin decisiones, responsables diferenciados ni retorno. Usar `system-diagram` con `workflow`, `sequence` o `lifecycle` cuando existan ramas, intercambios o estados.

## Composición

- Distribuir de tres a cinco pasos en un `ol`
- Ordenar la progresión horizontalmente de izquierda a derecha
- Mantener todos los pasos sobre el mismo eje y con separaciones constantes
- Mantener en cada paso el orden título, icono y descripción
- Mostrar el número como metadato secundario, nunca como sustituto del título
- Conectar pasos consecutivos con el icono Phosphor `arrow-fat-right` por defecto o con una flecha equivalente de la biblioteca seleccionada por el usuario
- Centrar verticalmente la secuencia completa
- Animar en el mismo orden de la secuencia

## Marcadores

- Marcar el contenedor con `data-process`
- Marcar el `ol` o cada `li` de forma semántica
- Marcar cada paso con `data-process-step`
- Usar `data-step-number`, `data-step-title` y `data-step-description`
- Marcar la capa con `data-process-connectors`
- Marcar cada flecha con `data-process-arrow` y el nombre exacto del activo aprobado
- Cuando la clase use un rol semántico distinto del activo, declarar también `data-icon` con el nombre exacto que registra `icons.css`
- Usar el mismo activo, biblioteca, peso y tamaño entre todos los pasos
- Usar flechas de 32px a 48px, menores que los iconos de los pasos

## Límites

- Tres a cinco pasos
- Hasta cuatro palabras por título
- Hasta 24 palabras por descripción
- Sin bifurcaciones; cambiar a `workflow` cuando exista una decision real

## Evitar

- Desniveles o inclinaciones diferentes entre pasos equivalentes
- Tarjetas desconectadas que oculten la secuencia
- Flechas grandes como decoración
- Numeración generada con CSS `content`
- Agregar una explicación lateral que compita con la secuencia
