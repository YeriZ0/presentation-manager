# Espaciado

## Escala

Usar esta escala como base:

```text
8, 16, 24, 32, 48, 64 y 96 px
```

Se permiten ajustes opticos de hasta 8px cuando una tipografia o un logo lo requieran.

## Margenes seguros

- Margen horizontal: 96px a 112px
- Margen superior: 72px a 88px
- Margen inferior: 40px a 72px segun el pie
- Cabecera interna: 120px a 152px de alto como base, incluido el contexto opcional; ampliarla si el título de dos líneas lo exige y descontar esa altura del cuerpo

## Proximidad

- Etiqueta y valor: 8px a 12px
- Tema e icono en una unidad tematica: 40px a 56px
- Icono y descripcion en una unidad tematica: 32px a 48px
- Titulo y descripcion sin icono: 12px a 20px
- Elementos del mismo concepto: 16px a 24px
- Grupos relacionados: 32px a 48px
- Zonas principales: 64px a 96px
- Columnas abiertas: 64px como minimo; preferir 96px con tres unidades y mas espacio con dos
- Grafica y titulo: 32px a 48px
- Grafica y fuente: 24px a 32px
- Celda de tabla: 16px a 24px horizontal y vertical
- Cajas de nodos: 80px de separacion minima
- Conector y nodo no relacionado: 32px de separacion minima
- Etiqueta de conector: 16px respecto de la linea y 32px respecto de un nodo

Un grupo debe reconocerse por cercania antes de necesitar borde o fondo.

## Distribucion vertical

- Centrar ópticamente el cuerpo completo dentro del espacio entre cabecera y pie
- Centrar como una unidad la tabla, gráfica, referencia, diagrama o fragmento de código; no apilarlo desde el borde superior
- Portada y cierre: centrar la pila completa dentro del lienzo disponible
- Evitar grandes franjas vacias sin intencion compositiva
- En diapositivas de diagrama, usar el espacio negativo para separar rutas y grupos; no llenarlo con explicaciones auxiliares

## Presupuesto del lienzo

- Descontar de 1080px los márgenes, cabecera real, metadatos externos al cuerpo, separaciones y pie con contador antes de asignar la altura del cuerpo
- Incluir en el cuerpo rellenos, bordes, leyendas, fuentes, anotaciones y todas las líneas visibles; no contar dos veces los elementos ya incluidos en otra zona
- Descontar de 1920px márgenes y separaciones antes de repartir columnas; en cabecera, reservar además ancho de marca y distancia al título
- Para narrativa, repartir el ancho restante en proporción `2fr 3fr`, con mínimos de cero, en vez de `40% + 60% + gap`; descontar también los huecos internos antes de repartir las columnas derivadas
- Mantener las columnas derivadas en una sola fila, sin envolverlas ni apilarlas para resolver el exceso
- Aplicar a pilares, comparaciones, elementos narrativos y procesos las distancias tema–icono e icono–descripción de Proximidad, salvo ajustes documentados por estructura; alinear bandas compartidas y centrar cajas y texto de cada pila horizontalmente según `hierarchy.md`
- Centrar el conjunto visible completo entre cabecera y contador, no solamente su primer hijo
- Si el presupuesto no alcanza, sintetizar, retirar detalle auxiliar o dividir; no ocultar contenido ni introducir desplazamiento

La separación se obtiene mediante espacio, según la prohibición global de `hierarchy.md`, sin barras en cabeceras, pies o anotaciones.
