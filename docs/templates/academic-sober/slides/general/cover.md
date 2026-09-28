# Portada institucional

## Usar cuando

La diapositiva presenta el proyecto, la identidad académica y sus integrantes.

## Composición

- Omitir cabecera interna y pie convencional; conservar el contador de `../../foundations/deck-consistency.md`
- Colocar el logo confirmado como ancla superior centrada
- Construir una sola pila centrada debajo del logo
- Mostrar facultad o carrera inmediatamente después del logo cuando esté confirmada; en su ausencia, mostrar la institución
- Mostrar la institución después de la facultad o carrera, cuando ambas estén confirmadas, y antes de la temática
- Mostrar título y subtítulo antes de la ficha académica
- Agrupar materia y docente en líneas contiguas, con jerarquía equivalente o inmediatamente descendente; no anteponer etiquetas aisladas como `Docente:`
- Para trabajos individuales y equipos de hasta tres integrantes, mostrar los nombres completos en lista vertical al final de la portada
- Para equipos de más de tres integrantes, omitir los nombres de la portada y reservar la lista completa para el cierre
- Mostrar equipo, grupo, cohorte o fecha solo cuando estén confirmados. Tratar estas etiquetas como metadatos secundarios, salvo que el encargo establezca otra jerarquía
- Incluir la fecha, si está confirmada, dentro de la ficha académica y antes de los integrantes cuando estos correspondan a la portada
- Desplazar el centro optico ligeramente hacia abajo

## Texto y nombres

- Omitir la categoría cuando repita el título, la materia o el tema ya visible
- El título visible no tiene que coincidir con el nombre de la carpeta de trabajo
- Proponer subtítulo y contexto solo desde la procedencia elegida en el flujo; la delegación no obliga a incluir texto redundante
- Ajustar la escala del título según el número de palabras definido en `../../foundations/sizing.md`
- Sintetizar el subtítulo antes de reducir los datos académicos
- Conservar los nombres completos y su ortografía proporcionada
- Colocar un integrante por línea, sin separarlos con comas
- No comprimir, recortar ni reducir una lista de más de tres integrantes para conservarla en portada: moverla al cierre

## Marcado

- Marcar el logo institucional con `data-brand-logo`
- Marcar facultad o carrera, materia y docente con `data-cover-faculty`, `data-cover-course` y `data-cover-teacher` cuando existan
- Marcar cada integrante de portada con `data-cover-participant`
- Marcar grupo, cohorte, fecha u otra referencia secundaria con `data-cover-secondary`

## Espaciado específico

- Logo a institución: 32px a 48px
- Institución a temática: 48px a 72px
- Categoría a título: 16px a 24px
- Título a subtítulo: 20px a 32px
- Subtítulo a ficha: 48px a 64px
- Entre grupos de ficha: 24px a 40px

## Recursos

Se permiten hasta dos ilustraciones laterales cuando representen el tema con precisión. No usar iconos genéricos alrededor del título.

## Evitar

- Ficha academica en cuatro tarjetas horizontales
- Logo pequeño aislado en una esquina
- Logo con ancho y alto forzados que alteren su relación de aspecto
- Icono decorativo entre logo y título
- Bloques con alineaciones diferentes
- Materia repetida en categoría y ficha académica
- Integrantes abreviados o agrupados en un solo párrafo
