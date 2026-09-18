# Diagrama relacional

## Usar cuando

La diapositiva explica arquitectura, workflow, secuencia, flujo de datos, ciclo de vida, jerarquía o relaciones alrededor de un centro.

## Selección

Elegir un único `data-diagram-type` según la pregunta:

- `architecture`: partes, límites y conexiones
- `workflow`: acciones, responsables y decisiones
- `sequence`: participantes y mensajes ordenados en el tiempo
- `data-flow`: información, transformaciones, almacenes y consumidores
- `lifecycle`: estados y eventos de transición
- `hierarchy`: raíz, niveles y relaciones padre-hijo
- `relationship-map`: centro real y elementos relacionados

Seguir la matriz y las reglas completas de `../../foundations/diagrams.md`.

## Composición

- Reservar todo el cuerpo de la diapositiva al diagrama
- Mantener una ruta principal o un centro claramente identificable
- Separar la leyenda del área del diagrama cuando sea imprescindible
- Mantener formas geométricas simples y dos familias como máximo
- Usar líneas de conexión discretas y consistentes
- Definir el tipo y la dirección de lectura antes de ubicar los nodos
- Centrar composiciones pequeñas y escalonar nodos cuando así se acorten y homogenicen los conectores
- Mantener etiquetas fuera de los trazos y puntas, con el mismo color que la relación asociada
- Usar contexto superior solo como texto color tinta en cursiva, nunca con barras o subrayados
- Mantener explicaciones extensas en notas o diapositivas posteriores

## Tecnología

- Mantener nodos, etiquetas y descripciones en HTML
- Dibujar conectores mediante SVG inline incluido en el HTML
- Usar CSS para la composición y JavaScript local solo para activación o movimiento finito
- No cargar motores de diagramación, scripts externos, CDN ni APIs
- No depender de JavaScript para generar texto visible o descubrir la topología

## Iconos

Los iconos son opcionales. Preferir peso `regular` para conservar legibilidad en diagramas densos. Cada icono debe identificar un tipo de componente y proceder de Phosphor, de una biblioteca seleccionada por el usuario o de un archivo aportado por el usuario. Nunca generar un icono para completar el diagrama.

## Límites

- Tres a siete nodos; `workflow` requiere de cuatro a siete y `sequence` admite de dos a seis participantes
- Hasta dos lineas de texto por nodo
- Una leyenda breve con dos convenciones como máximo
- Una ruta principal y solamente las ramas necesarias para responder la pregunta

## Evitar

- Texto pequeno dentro de figuras complejas
- Cruces de conectores innecesarios
- Sombras o volumen que sugieran significado inexistente
- Usar color como única forma de diferenciar tipos de relación
- Párrafos, listas o columnas explicativas al lado del diagrama
- Incluir relaciones inferidas solamente por proximidad, nombre o decoración
