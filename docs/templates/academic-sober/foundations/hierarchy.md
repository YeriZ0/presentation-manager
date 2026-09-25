# Jerarquia visual

## Orden de lectura

1. Contexto breve en cursiva, cuando sea necesario
2. Titulo principal
3. Conceptos, diagrama o evidencia principal
4. Descripcion o detalle
5. Pie e identidad secundaria

Portada y cierre usan una pila central sin cabecera interna. La portada mantiene logo → institución → temática → ficha académica → estudiantes. El cierre mantiene logo → institución → mensaje final → estudiantes. La identidad precede a los estudiantes, que constituyen el último grupo de la pila. Consultar las estructuras correspondientes para los campos opcionales y `deck-consistency.md` para marca y contador.

El contexto superior no es un rótulo editorial ni una ceja en mayúsculas. Usar peso normal, cursiva y formato de oración. Omitirlo cuando no añada información al título.

No aplicar `text-transform: uppercase` a ningún texto de la plantilla. Títulos, pies, metadatos, categorías y encabezados conservan su escritura natural.

## Niveles

- Limitar cada diapositiva a tres niveles tipograficos principales
- Mantener una sola zona dominante
- Resaltar una conclusion, no cada elemento
- Usar peso, escala y espacio antes que color adicional
- Mantener el titulo en dos lineas como maximo
- Cuando el cuerpo sea un diagrama, no agregar una segunda zona narrativa que compita con el
- En unidades equivalentes, mantener siempre el orden título, icono y descripción
- En pilares, comparaciones, elementos narrativos y pasos de procesos, centrar tema, caja del icono y descripción sobre un eje horizontal común por columna; alinear las bandas equivalentes entre columnas. En procesos, centrar también el número del paso

## Centrado horizontal de unidades abiertas

Esta regla se aplica desde la primera composición a las cuatro estructuras anteriores, incluidos los grupos con omisión explícita de iconos. El centrado vertical del cuerpo y la progresión horizontal de columnas no sustituyen el centrado interno de cada unidad.

- Centrar tanto las cajas de tema, icono y descripción como el texto dentro de las cajas. Un párrafo de ancho limitado alineado al borde izquierdo no cumple aunque su texto use `text-align: center`
- Conservar `text-align: center` en tema y descripción aunque inicialmente ocupen una sola línea, para que los cambios de contenido no alteren la regla
- Usar los marcadores semánticos obligatorios como anclas de CSS. `[data-comparison-option]` selecciona un atributo; `.comparison-option` solo selecciona una clase. Tener el atributo no asigna automáticamente esa clase
- Si se utilizan clases auxiliares, comprobar que existan en el HTML final y que sus reglas no sobrescriban el centrado. No considerar suficiente que el CSS contenga una declaración de centrado que no seleccione ningún elemento
- Mantener esta alineación después de insertar iconos o transformar el HTML; verificar tema, icono y descripción, no únicamente la caja del icono

Base de alineación para la autoría:

```css
[data-thematic-unit],
[data-comparison-option],
[data-narrative-element],
[data-process-step] {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
```

Este bloque fija la alineación; tamaños, márgenes y separaciones siguen `sizing.md`, `spacing.md` y la estructura seleccionada. No aplicar esta regla a todo el `body`: cabeceras, explicación narrativa, tablas, código y fuentes conservan sus alineaciones propias. La tolerancia óptica de `spacing.md` se mide en píxeles del lienzo de autoría, no del visor escalado.

## Texto introductorio

El lead es opcional. Debe aportar contexto nuevo y no repetir el titulo ni resumir los elementos inmediatamente inferiores.

- No colocar iconos decorativos dentro del lead
- No encerrar el lead en una tarjeta por defecto
- Omitirlo cuando titulo y contenido ya explican la idea
- Limitarlo a dos lineas

## Contenedores

- Usar columnas abiertas para conceptos paralelos
- Pilares, comparaciones, elementos narrativos y pasos nunca se convierten en tarjetas, ni siquiera declarando una frontera semántica
- No usar barras o líneas para sustituir la jerarquía entre título, icono y descripción
- Evitar una superficie que encierre todo el cuerpo
- No repetir la misma cuadricula de tarjetas en diapositivas consecutivas
- Variar entre columnas, tablas, flujos, diagramas y composiciones mixtas
- Mantener las unidades temáticas abiertas y sus agrupaciones separadas por espacio, sin recuadros ni superficies de tarjeta

## Prohibición de separadores decorativos

No utilizar barras, líneas divisorias ni subrayados decorativos para separar, encabezar o destacar contenido en ninguna estructura. Organizar mediante espacio, alineación y jerarquía tipográfica.

Aplicar esta restricción al diseñar la primera composición y su CSS base, antes de escribir las slides. No generar separadores para retirarlos después. La verificación final detecta regresiones; no sustituye la autoría preventiva.

- Aplicar a cabeceras, pies, unidades, explicaciones, anotaciones y focos de código
- Incluir bordes parciales, `<hr>`, pseudoelementos, fondos, sombras y SVG que cumplan esa función decorativa
- No admitir excepciones por preferencia estética o composición
- Las conexiones de diagramas, ejes y marcas de datos representan información y no son separadores decorativos
- Los contornos de fronteras semánticas reales y el marco solicitado explícitamente se rigen por sus reglas; no justifican barras para adornar párrafos o dividir bloques

Los nodos del SVG Mermaid marcado con `data-diagram-static`, las celdas de tablas y las superficies de código pueden usar límites funcionales según su estructura. Para otra frontera real, marcar el contenedor con `data-boundary="semantic"` y documentar su significado; requiere un contorno cerrado, no una barra lateral. Un marco se declara en el elemento que lo dibuja con `data-frame="graphite"` o `data-frame="accent"`, solo cuando fue solicitado. `border: none` y un pseudoelemento que no dibuja ni añade contenido no son decoración visible.

La excepción de frontera funcional no se aplica a las unidades abiertas citadas ni a recuadros que las envuelvan. No simular su borde con `outline`, sombras, pseudoelementos o fondos. El permiso de un bloque de código o nodo no se hereda a un pilar que lo contenga.
