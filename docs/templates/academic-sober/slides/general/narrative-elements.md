# Explicación y elementos

## Usar cuando

Una idea requiere una explicación narrativa breve y una descomposición simultánea de dos a cuatro datos, requisitos o resultados concretos.

## Composición

- Dividir el cuerpo entre 40% de explicación y 60% de elementos visuales
- Mantener una descripción de hasta 70 palabras en la zona izquierda
- Distribuir los elementos en columnas abiertas con título, icono y descripción
- Mantener el mismo orden y alineación en todos los elementos
- Separar ambas zonas con espacio negativo, no con barras, líneas o contenedores
- Centrar verticalmente la composición completa

## Marcadores

- Marcar el contenedor con `data-narrative`
- Marcar la explicación con `data-narrative-copy`
- Marcar el grupo con `data-narrative-elements`
- Marcar cada `article` con `data-narrative-element`
- Usar `data-element-topic` y `data-element-description`
- Usar `.deck-icon` en todos los elementos o no usar iconos

## Iconos

- Asignar un icono que represente cada acción, dato o estado
- Mantener el mismo peso y tamaño entre elementos equivalentes
- Preferir 72px a 104px con peso `bold`

## Límites

- Dos a cuatro elementos
- Hasta cuatro palabras por título
- Hasta 24 palabras por elemento
- Un párrafo principal de hasta 70 palabras

## Evitar

- Barras o líneas entre elementos
- Convertir cada elemento en una tarjeta cerrada
- Repetir la explicación en los elementos de la derecha
- Usar iconos decorativos en el texto introductorio
