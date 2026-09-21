# Consistencia de la presentación

## Numeración

- Mostrar un contador en todas las diapositivas, incluidas portada y cierre
- Obtener posición y total del orden definitivo de `deck.json` durante la autoría; escribir el resultado como texto visible en HTML, sin depender de JavaScript
- Usar el formato `01 / 12`, con un espacio a cada lado de la barra y ceros iniciales en ambos números
- El ancho de ambos números es el mayor entre dos dígitos y la cantidad de dígitos del total; para cien diapositivas, usar `001 / 100`
- Mantener posición inferior derecha, tamaño, color y alineación constantes dentro de los márgenes seguros de `spacing.md`
- Actualizar todos los contadores si cambia el orden o la cantidad; no admitir saltos, duplicados ni omisiones
- Omitir el pie convencional no elimina el contador; reservarle espacio sin añadir líneas decorativas
- Marcar el texto del contador con `data-slide-counter`; comprobar su visibilidad frente al manifiesto, incluidos recortes por ancestros con desbordamiento oculto

## Identidad institucional

- Confirmar al inicio la institución, el recurso auténtico y su uso; mantener esa decisión durante todo el conjunto
- Con un recurso institucional confirmado y su uso habilitado, mostrar una sola marca en la esquina superior derecha de todas las cabeceras internas, con contexto y título a la izquierda
- Una omisión requiere una decisión expresa para el conjunto; si falta el activo, solicitarlo o confirmar la omisión antes de generar
- Reservar el ancho de la marca y su separación antes de distribuir el título, incluso cuando ocupe dos líneas
- Conservar proporción, tamaño óptico y márgenes; aplicar los tamaños de `sizing.md`
- Incorporar una segunda marca únicamente por solicitud explícita; no inferir co-branding de una referencia
- Utilizar el activo institucional auténtico; no sustituirlo por iconos ni extraerlo o redibujarlo desde un PDF
- Portada y cierre utilizan identidad central, según sus estructuras; no duplicar allí el logo de cabecera

## Comprobación del conjunto

Contrastar los contadores con el manifiesto y comprobar el orden de lectura de portada y cierre. En la revisión renderizada a `1920x1080`, verificar posición de marca y contador, ausencia de colisiones con títulos y contención de todos los recursos visibles, incluidos los que tengan `aria-hidden="true"`.
