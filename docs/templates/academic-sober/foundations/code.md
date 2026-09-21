# Fragmentos de codigo

## Proposito

Mostrar solamente el codigo necesario para explicar una decision, un flujo o una diferencia. El codigo es evidencia visual, no un editor ni una demostracion ejecutable.

## Composicion

- Usar un bloque abierto o una superficie de grafito mate, sin sombra pesada
- Mostrar lenguaje y archivo como metadatos breves
- Mantener una sola columna de codigo por defecto
- Usar una anotacion lateral solo para explicar una linea o grupo de lineas
- Resaltar una region por vez; atenuar el contexto sin ocultarlo

## Legibilidad

- Limitar el fragmento a 16 líneas visibles como máximo; permitir fragmentos más breves sin añadir relleno
- Usar 80 caracteres por línea solo como referencia superior aproximada; el ancho efectivo, la fuente, la numeración, los rellenos y la anotación pueden exigir menos
- No reducir el codigo por debajo de 22px en un lienzo de 1920x1080
- No envolver líneas automáticamente; sintetizar el ejemplo en la autoría o dividirlo, sin recortar caracteres en la vista
- Mantener contraste suficiente entre fondo, texto y sintaxis

## Ajuste del bloque

- Cada `data-code-line` corresponde a una sola fila visual, incluidas las líneas vacías intencionales
- En `<pre>`, evitar saltos literales adicionales entre elementos de línea en bloque, márgenes o rellenos que creen filas accidentales
- Usar `white-space: normal` en el contenedor de filas y `white-space: pre` en `data-code-content`, con una columna fija para números; así los saltos de formato del HTML no crean filas vacías
- Comenzar con interlineado `1.35` según `sizing.md`; calcular altura completa con metadatos, rellenos y anotación
- No usar desplazamiento ni `overflow: hidden` como solución al exceso; comprobar también caracteres finales y la última línea
- El foco conserva altura y alineación de las demás líneas; usar contraste o peso, sin barras laterales ni separadores según `hierarchy.md`
- Sintetizar, retirar detalles auxiliares o dividir antes de exceder el presupuesto de `spacing.md`

## Numeración y marcado

Cada fila `data-code-line` contiene un `data-code-number` con el número escrito en HTML y `aria-hidden="true"`, y un `data-code-content` con los tokens. La numeración es consecutiva y puede empezar en la línea real del archivo fuente. Declarar en `pre` `data-code-start` y `data-code-end`; deben coincidir con las filas visibles y el rango anunciado en un metadato `data-code-range`, por ejemplo `Líneas 18–29`. No usar contadores CSS ni números generados durante la reproducción.

El código puede tener de una a dieciséis líneas, sin mínimo de relleno. El interlineado y la distancia física entre filas deben corresponder a `1.35–1.55`, comenzando por `1.35`. No insertar filas espaciadoras para separar todas las líneas. Las líneas vacías intencionales se marcan y numeran como cualquier otra.

La numeración de código no sustituye al contador de diapositiva: reservar espacio para ambos, la anotación y el pie. Revisar su visibilidad y los caracteres finales, no solo la existencia de sus elementos en HTML.

## Sintaxis

- Usar color de sintaxis solo como apoyo, nunca como única señal
- Diferenciar variables, funciones, propiedades, palabras clave, cadenas, números, comentarios y puntuación
- Combinar el tono con peso o cursiva para palabras clave, funciones y valores destacados
- Mantener cada color de sintaxis en al menos 4.5:1 contra la superficie del código
- Asociar la región enfocada con su anotación mediante `aria-describedby`
- Escapar siempre `<`, `>`, `&` y comillas cuando el codigo se escriba en HTML
- No ejecutar, importar ni evaluar el fragmento mostrado
- Para diffs, marcar agregado, eliminado y contexto con texto o signos ademas del color
