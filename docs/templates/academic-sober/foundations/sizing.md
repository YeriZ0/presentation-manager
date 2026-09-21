# Tamaños

## Viewport

- Lienzo fijo: `1920x1080`
- Proporcion: `16:9`
- Sin marco por defecto
- Marco opcional: 8px a 12px, solo cuando se seleccione explícitamente

Fijar ancho y alto de autoría, no solamente `min-height`. Incluir rellenos y bordes en las dimensiones, por ejemplo mediante `box-sizing: border-box`. El documento no puede crecer ni ofrecer desplazamiento para contenido esencial. `overflow: hidden` no demuestra ajuste: ningún texto, icono o recurso visible puede quedar recortado. El escalado del visor debe conservar la composición fija.

## Escala tipografica

- Título de portada de hasta 4 palabras: 84px a 96px
- Título de portada de 5 a 8 palabras: 64px a 76px
- Título de portada de más de 8 palabras: 52px a 64px
- Titulo interno: 62px a 76px
- Subtitulo de portada: 32px a 40px
- Titulo de concepto: 30px a 40px
- Texto principal: 28px a 34px
- Metadatos: 22px a 26px
- Contexto superior y pie: 20px a 26px

No reducir contenido principal por debajo de 24px. Sintetizar o dividir antes de disminuir la escala. Ajustar los títulos de portada por cantidad de palabras antes de reducir otros bloques.

## Recursos visuales

- Logo protagonista: maximo 520px de ancho y 180px de alto
- Logo de cabecera: 80px a 112px de alto
- Icono protagonista: 96px a 144px
- Icono de unidad tematica: 96px a 128px
- Icono de elemento narrativo: 72px a 104px
- Icono de paso de proceso: 72px a 104px
- Icono auxiliar: 32px a 56px
- Icono dentro de un nodo: 48px a 64px
- Conector principal: 3px a 4px
- Borde fino: 1px a 2px
- Radio de superficie: 12px a 18px
- Etiqueta de eje o grafica: 24px a 28px
- Valor destacado en grafica: 28px a 40px
- Celda de tabla: 24px a 30px con 16px a 24px de relleno vertical
- Codigo: 22px a 28px con interlineado de 1.35 a 1.55

Los elementos equivalentes deben compartir dimensiones y alineacion optica.

Para código, comenzar con interlineado `1.35`; aumentarlo dentro del rango solo si el bloque completo cabe. El código tiene un mínimo específico de 22px; el texto principal conserva su mínimo de 24px. No usar el tamaño de icono auxiliar como valor predeterminado de pilares o elementos narrativos. El logo de cabecera conserva su proporción y ocupa el espacio superior derecho reservado según `deck-consistency.md`.

El borde fino corresponde a límites semánticos internos. No debe convertirse en un contorno predeterminado de la diapositiva.
