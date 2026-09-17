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

- Limitar el fragmento a 12-16 lineas visibles
- Mantener aproximadamente 80 caracteres por linea
- No reducir el codigo por debajo de 22px en un lienzo de 1920x1080
- No envolver lineas automaticamente; recortar el ejemplo o dividirlo
- Mantener contraste suficiente entre fondo, texto y sintaxis

## Sintaxis

- Usar color de sintaxis solo como apoyo, nunca como única señal
- Diferenciar variables, funciones, propiedades, palabras clave, cadenas, números, comentarios y puntuación
- Combinar el tono con peso o cursiva para palabras clave, funciones y valores destacados
- Mantener cada color de sintaxis en al menos 4.5:1 contra la superficie del código
- Asociar la región enfocada con su anotación mediante `aria-describedby`
- Escapar siempre `<`, `>`, `&` y comillas cuando el codigo se escriba en HTML
- No ejecutar, importar ni evaluar el fragmento mostrado
- Para diffs, marcar agregado, eliminado y contexto con texto o signos ademas del color
