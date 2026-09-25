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
- Usar una superficie blanca con relleno al 95% y opacidad general al 100% detrás de cada etiqueta de relación para cubrir el trazo y priorizar el texto
- Usar contexto superior solo como texto color tinta en cursiva, nunca con barras o subrayados
- Mantener explicaciones extensas en notas o diapositivas posteriores
- Mostrar una leyenda interpretativa breve al pie del cuerpo del diagrama, por encima del pie institucional; usarla para explicar la relacion principal sin repetir el titulo
- En `sequence`, ajustar el SVG al contenido para que use el cuerpo disponible; en `hierarchy`, reservar margen vertical y comprobar que no exista desbordamiento inferior a `1920x1080`
- Eliminar el `max-width` intrinseco que Mermaid escribe en pixeles y encajar el SVG al cuerpo con ancho y alto al 100%, preservando su proporcion
- En `data-flow` de varias filas, declarar cada fila explicitamente con direccion izquierda a derecha. Si Mermaid pierde esa direccion al conectar filas, usar una relacion invisible `~~~` entre los grupos y numerar las filas desde su esquina superior izquierda para preservar una sola secuencia de lectura

## Tecnología

La skill `create-web-deck` define el contrato Mermaid, su compilación y empaquetado. Para esta estructura:

- Aplicar la configuración visual cerrada de la plantilla; no usar directivas, estilos ni temas dentro del `.mmd`
- Normalizar puntas de flecha con la referencia visual de `sequence` para conservar su tamaño legible en todos los tipos
- Verificar la geometría renderizada y su lectura visual a `1920x1080`

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
- Corregir manualmente el SVG en lugar de modificar y recompilar el `.mmd`
