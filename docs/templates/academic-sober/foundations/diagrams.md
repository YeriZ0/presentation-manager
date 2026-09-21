# Diagramas

## Principio

Un diagrama explica relaciones que no se entienden mediante unidades independientes. Debe responder una sola pregunta, ofrecer una ruta de lectura dominante y ocupar todo el cuerpo disponible de la diapositiva. La categoría, el título, la identidad y un pie breve pueden permanecer fuera de esa zona.

Los detalles que el expositor puede explicar oralmente pertenecen a las notas o a una diapositiva posterior. No agregar una columna narrativa, una lista ni un párrafo paralelo al diagrama.

Elegir primero la pregunta y después el tipo. No convertir toda colección de conceptos en una red de nodos.

## Selección

| Tipo               | Pregunta principal                            | Casos tecnicos                       | Casos generales                         |
| ------------------ | --------------------------------------------- | ------------------------------------ | --------------------------------------- |
| `architecture`     | ¿Qué partes existen y cómo se conectan?       | Servicios, infraestructura, módulos  | Ecosistemas, actores institucionales    |
| `workflow`         | ¿Quién actúa, decide y continúa?              | CI/CD, aprobaciones, runbooks        | Trámites, revisiones, protocolos        |
| `sequence`         | ¿Quién interactúa con quién y en qué orden?   | Solicitudes API, autenticación       | Atención, entrevista, coordinación      |
| `data-flow`        | ¿Qué información se mueve o transforma?       | ETL, eventos, linaje                 | Documentos, evidencia, formularios      |
| `lifecycle`        | ¿En qué estados puede estar y qué los cambia? | Tareas, despliegues, sesiones        | Publicaciones, proyectos, solicitudes   |
| `hierarchy`        | ¿Qué depende o forma parte de qué?            | Paquetes, módulos, permisos          | Organigramas, taxonomías, objetivos     |
| `relationship-map` | ¿Qué elementos rodean un centro real?         | Integraciones, dependencias directas | Factores, partes interesadas, conceptos |

- Usar `pillars` para conceptos paralelos sin relaciones explícitas
- Usar `process` para secuencias lineales obligatorias de tres a cinco pasos
- Usar `system-diagram` con un tipo para componentes, intercambios, ramas, estados o jerarquías
- Usar `mixed-content` solo para un recurso visual ilustrativo simple que necesite contexto adyacente
- Usar `chart` para magnitudes, tendencias o composiciones cuantitativas
- Dividir el contenido cuando una sola dirección de lectura no pueda explicar todas las relaciones

## Contrato común

- Declarar `data-diagram-type` con uno de los tipos documentados
- Declarar `data-reading-direction="left-to-right"`, `top-to-bottom` o `radial`
- Mantener todo texto visible y editable en HTML
- Usar un SVG inline, situado detrás de los nodos, solamente para conectores y geometría funcional
- Asignar un identificador ASCII único a cada `data-diagram-node`
- Marcar cada ruta con `data-diagram-edge`, `data-from` y `data-to`
- Etiquetar cada ruta en HTML y asociarla mediante `data-diagram-label` y `data-for-edge`
- Conservar una descripción textual equivalente mediante `aria-describedby`
- No inventar relaciones, responsables, secuencias, estados ni causalidad que la fuente no sostenga

## Nodos

- Usar de tres a siete nodos; `workflow` requiere de cuatro a siete y `sequence` admite de dos a seis participantes
- Mantener un título de una a cuatro palabras por nodo
- Permitir una descripción opcional de hasta diez palabras y dos líneas
- Mantener formas y dimensiones equivalentes para nodos del mismo tipo
- Limitar el diagrama a dos familias de formas y tres niveles visuales
- Reservar el color de acento para un nodo, una ruta o una conclusión
- Centrar el conjunto cuando sus nodos no necesiten ocupar todo el ancho o alto disponible
- Usar una mención breve en color tinta y cursiva cuando un nodo necesite contexto superior; no subrayarla ni prolongarla con una barra
- Usar iconos solo cuando identifiquen tipos de componente; no usarlos como decoración
- Preferir etiquetas directas a leyendas que obliguen a decodificar la composición

## Dirección de lectura

- Preferir izquierda a derecha para arquitectura, workflow y flujo de datos
- Usar arriba abajo para secuencia y jerarquía
- Usar izquierda a derecha o radial para ciclos de vida según exista una ruta principal o un retorno dominante
- Usar radial solamente para un ciclo cerrado o un centro real
- No mezclar direcciones principales en la misma diapositiva

## Conectores

- Usar rutas rectas u ortogonales de forma consistente
- Evitar cruces y limitar cada ruta ortogonal a dos dobleces
- Conectar el perímetro de los nodos, no atravesar su contenido
- Usar trazos de 3px a 4px y terminaciones consistentes
- Declarar explícitamente unidades, geometría y estilo de las puntas según el contrato geométrico siguiente; comprobar su tamaño visual real
- Mantener al menos 80px entre cajas de nodos
- Mantener 32px de separación entre una ruta y cualquier nodo no relacionado
- Mantener longitudes equivalentes solo entre conectores con una función y jerarquía realmente equivalentes; no igualar arbitrariamente ramas principales, excepciones o retornos
- Escalonar nodos cuando una retícula horizontal produzca recorridos extensos o deje poco espacio para las etiquetas
- Usar flechas solo para dirección, dependencia o transferencia
- Usar líneas sin flecha para asociaciones no dirigidas
- Limitar las etiquetas de relación a tres palabras, salvo mensajes o eventos técnicos que deban conservar su nombre exacto
- Colocar cada etiqueta fuera del trazo y del segmento terminal; nunca cubrir la punta ni tocar un nodo
- Usar en cada etiqueta el mismo color de su conector
- Diferenciar relaciones mediante etiqueta, patrón o terminación, no solo mediante color
- Mantener una ruta principal claramente más legible que las ramas secundarias

## Contrato geométrico

- Definir una única geometría de autoría para cajas HTML, rutas SVG y etiquetas; el `viewBox` corresponde al tamaño real del área del diagrama, no a un tamaño fijo ajeno a esa área
- Si se combinan porcentajes y coordenadas absolutas, documentar y aplicar su conversión al mismo sistema; no escalar únicamente conectores mientras los nodos conservan otras dimensiones
- Calcular anclajes sobre el perímetro real de cada forma, incluidos rombos; la ruta sale y entra por los lados elegidos con dirección coherente, sin huecos ni cruces por el contenido
- Medir separación entre cajas y reservar antes el espacio de título, marca, leyenda y contador según `spacing.md`
- Aplicar trazo y `marker-end` a `[data-diagram-edge]`, nunca indiscriminadamente a todos los `path`; las formas de `<defs>` tienen relleno y trazo propios sin heredar marcadores
- Usar, como punto inicial, `markerUnits="userSpaceOnUse"`, `viewBox="0 0 7.2 7.2"`, `markerWidth="7.2"`, `markerHeight="7.2"`, `refX="7.2"`, `refY="3.6"` y `orient="auto"`, con la punta en `(7.2, 3.6)`, relleno del color del conector y `stroke="none"`
- Ajustar ese punto inicial según escala y contraste renderizados; `markerWidth` no garantiza por sí solo el tamaño visible, y `strokeWidth` multiplica las unidades por el grosor del trazo si se elige ese modo
- Asignar una posición independiente a cada etiqueta y comprobar colisiones frente a otras etiquetas, rutas, puntas y nodos
- Evitar tramos compartidos ambiguos; mostrar una unión explícita solo si representa una convergencia sustentada por el contenido, preservando la dirección y el significado de cada relación
- Comprobar conectores y marcadores con sus estilos CSS efectivos, además de los atributos SVG; la inspección estática no sustituye la revisión renderizada y visual a `1920x1080`

## Reglas por tipo

### Arquitectura

- Usar de tres a siete componentes y hasta dos límites semánticos
- Organizar una espina principal con ramas cortas
- Marcar límites de confianza, propiedad o despliegue solo cuando sean hechos conocidos

### Workflow

- Usar de cuatro a siete nodos y una o dos decisiones
- Marcar cada decisión con `data-diagram-decision`
- Mantener el camino principal monótono y llevar excepciones fuera de su corredor
- Usar carriles solo cuando representen responsables o fases reales

### Secuencia

- Usar de dos a seis participantes y de tres a diez mensajes
- Marcar participantes con `data-diagram-participant`
- Marcar rutas de mensajes con `data-diagram-message`
- Ordenar los mensajes de arriba abajo y diferenciar llamadas, retornos y mensajes asíncronos con texto o patrón

### Flujo de datos

- Usar de tres a siete nodos distribuidos en tres a cinco etapas
- Marcar cada etapa con `data-diagram-stage`
- Mostrar el nombre de etapa como texto color tinta en cursiva, sin subrayado, separador ni barra inferior
- Etiquetar todas las rutas con el dato, documento o resultado que circula
- Distinguir transformaciones, almacenes y consumidores por nombre, no solo por forma

### Ciclo de vida

- Usar de tres a siete estados y etiquetar transiciones con eventos
- Marcar estados con `data-diagram-state`
- Mostrar explícitamente estados terminales y ciclos de recuperación reales
- No llamar ciclo a una secuencia que no regresa ni ofrece transiciones alternativas

### Jerarquía

- Usar de tres a siete nodos y un solo `data-diagram-root`
- Organizar niveles horizontales de arriba abajo
- Mantener cada nodo, excepto la raíz, con un solo padre visible

### Mapa relacional

- Usar de tres a siete nodos y un solo `data-diagram-center`
- Conectar cada elemento primario con el centro
- Evitar relaciones laterales que conviertan el mapa en una red sin dirección

## Marcado

```html
<h1 id="diagram-title">La validación produce resultados trazables</h1>
<figure
    data-diagram
    data-diagram-type="architecture"
    data-reading-direction="left-to-right"
    aria-labelledby="diagram-title"
    aria-describedby="diagram-description"
>
    <svg data-diagram-connectors aria-hidden="true">
        <path
            data-diagram-edge="prepare"
            data-from="input"
            data-to="process"
        ></path>
        <path
            data-diagram-edge="validation"
            data-from="process"
            data-to="result"
        ></path>
    </svg>
    <article data-diagram-node="input">Entrada</article>
    <article data-diagram-node="process">Validación</article>
    <article data-diagram-node="result">Resultado</article>
    <span data-diagram-label data-for-edge="prepare">Prepara</span>
    <span data-diagram-label data-for-edge="validation">Valida</span>
    <figcaption id="diagram-description" class="visually-hidden">
        La entrada se valida antes de producir el resultado.
    </figcaption>
</figure>
```

Los diagramas existentes sin `data-diagram-type` ni identificadores conservan compatibilidad como diagramas generales. Toda diapositiva nueva debe usar el contrato tipado.

## Accesibilidad

- Mantener al menos 3:1 de contraste en nodos, conectores y terminaciones esenciales
- Mantener 4.5:1 para texto normal y 3:1 para texto grande
- Proporcionar una descripción textual equivalente de componentes, dirección y relaciones
- Marcar el SVG de conectores como decorativo cuando la descripción textual ya comunique sus relaciones
- No depender solo del color, la posición o la forma para identificar una relación
- Mantener el orden DOM coherente con la lectura principal

## Movimiento

- Revelar nodos y relaciones en el orden de lectura
- Mantener toda animación finita y sin cambiar la topología
- No usar movimiento para simular tráfico, actividad o causalidad no demostrada

## Evitar

- Diagramas relacionales reducidos para dejar espacio a una explicación lateral
- Nodos que funcionan como párrafos
- Formas distintas sin significado distinto
- Flechas grandes usadas como decoración
- Etiquetas superpuestas al trazo, la punta de flecha o el perímetro de un nodo
- Nodos estirados hasta los bordes cuando una composición centrada reduce los recorridos
- Rótulos superiores acompañados por barras o subrayados decorativos
- Conectores diagonales mezclados con rutas ortogonales
- Leyendas que obliguen a decodificar más de dos tipos de relación
- Redes densas sin una ruta principal
- Rutas calculadas en tiempo de ejecución cuando una geometría explícita y estable sea suficiente
