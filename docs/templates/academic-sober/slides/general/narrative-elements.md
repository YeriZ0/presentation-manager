# Explicación y elementos

## Usar cuando

Una idea requiere una explicación narrativa breve y una descomposición simultánea de dos a cuatro datos, requisitos o resultados concretos.

## Composición

- Descontar el espacio entre zonas y repartir el ancho restante en proporción 40:60, según `../../foundations/spacing.md`; no sumar `40% + 60% + gap`
- Mantener una descripción de hasta 70 palabras en la zona izquierda
- Distribuir los elementos en una sola fila de columnas abiertas equivalentes; tres elementos requieren tres columnas a la derecha de la explicación
- Dentro de cada columna, apilar verticalmente tema → icono → descripción, centrados sobre un eje horizontal común
- Mantener bandas alineadas entre elementos y las separaciones de `../../foundations/spacing.md`; la explicación introductoria conserva su alineación independiente a la izquierda
- Separar ambas zonas con espacio negativo, no con barras, líneas o contenedores
- Centrar verticalmente la composición completa

## Marcadores

- Marcar el contenedor con `data-narrative`
- Marcar la explicación con `data-narrative-copy`
- Marcar el grupo con `data-narrative-elements`
- Marcar cada `article` con `data-narrative-element`
- Usar `data-element-topic` y `data-element-description`
- Incluir `.deck-icon` en cada elemento por defecto; una omisión sigue `../../foundations/iconography.md`

## Iconos

- Asignar un icono que represente cada acción, dato o estado
- Mantener el mismo peso y tamaño entre elementos equivalentes
- Preferir 72px a 104px con peso `bold`

## Límites

- Dos a cuatro elementos
- Hasta cuatro palabras por título
- Hasta 24 palabras por elemento
- Un párrafo principal de hasta 70 palabras

Los máximos no garantizan ajuste físico. Si el grupo no cabe, sintetizar o dividir; no convertirlo en filas, permitir desplazamiento ni reducir la tipografía por debajo de sus mínimos.

```text
Explicacion narrativa     Tema 1        Tema 2        Tema 3
                         Icono         Icono         Icono
                         Descripcion   Descripcion   Descripcion
```

## Evitar

- Barras o líneas entre elementos
- Convertir cada elemento en una tarjeta cerrada
- Repetir la explicación en los elementos de la derecha
- Usar iconos decorativos en el texto introductorio
