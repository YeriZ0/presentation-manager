# Diagramas

## Principio

Un diagrama explica una relacion, flujo o arquitectura que no se entiende mediante unidades tematicas independientes. Debe comunicar una sola idea y ocupar todo el cuerpo disponible de la diapositiva. La categoria, el titulo, la identidad y un pie breve pueden permanecer fuera de esa zona.

Los detalles que el expositor puede explicar oralmente pertenecen a las notas o a una diapositiva posterior. No agregar una columna narrativa, una lista ni un parrafo paralelo al diagrama.

## Tipos

- Usar `pillars` para conceptos paralelos sin relaciones explicitas
- Usar `process` para secuencias obligatorias de tres a cinco pasos
- Usar `system-diagram` para componentes, capas, dependencias o intercambios
- Usar `mixed-content` solo para un recurso visual ilustrativo simple que necesite contexto adyacente
- Dividir el contenido cuando una sola direccion de lectura no pueda explicar todas las relaciones

## Nodos

- Usar de tres a seis nodos en un diagrama de sistema
- Mantener un titulo de una a cuatro palabras por nodo
- Permitir una descripcion opcional de hasta diez palabras y dos lineas
- Mantener formas y dimensiones equivalentes para nodos del mismo tipo
- Limitar el diagrama a dos familias de formas y tres niveles visuales
- Reservar el color de acento para un nodo, una ruta o una conclusion
- Usar iconos solo cuando identifiquen tipos de componente; no usarlos como decoracion

## Direccion de lectura

- Declarar `data-reading-direction="left-to-right"`, `top-to-bottom` o `radial`
- Preferir izquierda a derecha para procesos, dependencias y transferencias
- Preferir arriba abajo para capas o jerarquias
- Usar una composicion radial solo cuando exista un centro real
- No mezclar direcciones principales en la misma diapositiva

## Conectores

- Dibujar conectores en un SVG inline situado detras de los nodos
- Usar rutas rectas u ortogonales de forma consistente
- Evitar cruces y limitar cada ruta a dos dobleces
- Conectar el perimetro de los nodos, no atravesar su contenido
- Usar trazos de 3px a 4px y terminaciones consistentes
- Mantener al menos 80px entre cajas de nodos
- Mantener 32px de separacion entre una ruta y cualquier nodo no relacionado
- Usar flechas solo para direccion, dependencia o transferencia
- Usar lineas sin flecha para asociaciones no dirigidas
- Limitar las etiquetas de relacion a tres palabras
- Diferenciar relaciones mediante etiqueta, patron o terminacion, no solo mediante color

## Marcado

Las diapositivas generadas con esta plantilla declaran su estructura en el elemento `body`:

```html
<body data-template="academic-sober" data-slide-structure="system-diagram">
```

Un diagrama relacional usa estos marcadores:

```html
<h1 id="diagram-title">La validacion produce resultados trazables</h1>
<figure
    data-diagram
    data-reading-direction="left-to-right"
    aria-labelledby="diagram-title"
    aria-describedby="diagram-description"
>
    <svg data-diagram-connectors aria-hidden="true"></svg>
    <div data-diagram-node>...</div>
    <figcaption id="diagram-description" class="visually-hidden">
        Descripcion de los componentes y sus relaciones
    </figcaption>
</figure>
```

Los textos de los nodos permanecen en HTML. El SVG contiene solamente conectores y formas que no necesiten editarse como texto.

## Accesibilidad

- Mantener al menos 3:1 de contraste en nodos, conectores y terminaciones esenciales
- Mantener 4.5:1 para texto normal y 3:1 para texto grande
- Proporcionar una descripcion textual equivalente de componentes, direccion y relaciones
- Marcar el SVG de conectores como decorativo cuando la descripcion textual ya comunique sus relaciones
- No depender solo del color, la posicion o la forma para identificar una relacion

## Evitar

- Diagramas relacionales reducidos para dejar espacio a una explicacion lateral
- Nodos que funcionan como parrafos
- Formas distintas sin significado distinto
- Flechas grandes usadas como decoracion
- Conectores diagonales mezclados con rutas ortogonales
- Leyendas que obliguen a decodificar mas de dos tipos de relacion
