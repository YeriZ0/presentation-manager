# Proceso secuencial

## Usar cuando

El contenido describe una secuencia, configuración o ciclo con orden obligatorio.

## Composición

- Distribuir de tres a cinco pasos en un `ol`
- Ordenar la progresión horizontalmente de izquierda a derecha
- Mantener todos los pasos sobre el mismo eje y con separaciones constantes
- Mantener en cada paso el orden título, icono y descripción
- Mostrar el número como metadato secundario, nunca como sustituto del título
- Conectar pasos consecutivos con el icono Phosphor `arrow-fat-right` detrás del contenido
- Centrar verticalmente la secuencia completa
- Animar en el mismo orden de la secuencia

## Marcadores

- Marcar el contenedor con `data-process`
- Marcar el `ol` o cada `li` de forma semántica
- Marcar cada paso con `data-process-step`
- Usar `data-step-number`, `data-step-title` y `data-step-description`
- Marcar la capa con `data-process-connectors`
- Marcar cada flecha `deck-icon--arrow-fat-right` con `data-process-arrow="arrow-fat-right"`
- Usar flechas de 32px a 48px, menores que los iconos de los pasos

## Límites

- Tres a cinco pasos
- Hasta cuatro palabras por título
- Hasta 24 palabras por descripción
- Una sola bifurcación cuando sea imprescindible

## Evitar

- Desniveles o inclinaciones diferentes entre pasos equivalentes
- Tarjetas desconectadas que oculten la secuencia
- Flechas grandes como decoración
- Numeración generada con CSS `content`
- Agregar una explicación lateral que compita con la secuencia
