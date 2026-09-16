# Movimiento

Este modulo define ritmo y apariencia. El protocolo de activacion pertenece a `create-web-deck`.

## Entrada

- Desplazamiento vertical: 16px a 24px
- Duracion: 450ms a 700ms
- Escalonamiento: 100ms a 160ms
- Opacidad inicial: 0
- Escala opcional para cierre: 0.98 a 1

## Restricciones

- Maximo una microanimacion continua por diapositiva
- Evitar rebotes amplios, giros y parallax
- No retrasar el primer contenido legible mas de 160ms
- Animar en el orden de lectura
- Revelar barras, puntos y nodos sin alterar sus valores ni escalas
- No animar el crecimiento de un pastel como si fuera una medicion temporal
- No ocultar contenido cuando se prefiera movimiento reducido
