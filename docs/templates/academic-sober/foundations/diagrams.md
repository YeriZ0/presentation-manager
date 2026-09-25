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

## Integración

La skill `create-web-deck` define el contrato Mermaid común: estructura, manifiesto, seguridad, compilación, SVG estático y empaquetado. Esta fundación define solamente la composición y lectura visual de `academic-sober`.

- Mostrar la descripción textual equivalente como leyenda interpretativa visible al pie del cuerpo del diagrama, por encima del pie institucional; no duplicar el título de la diapositiva
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
- Dejar que Mermaid calcule rutas y puntas con la configuración cerrada de la plantilla; comprobar su tamaño visual real
- Mantener al menos 80px entre cajas de nodos
- Mantener 32px de separación entre una ruta y cualquier nodo no relacionado
- Mantener longitudes equivalentes solo entre conectores con una función y jerarquía realmente equivalentes; no igualar arbitrariamente ramas principales, excepciones o retornos
- Escalonar nodos cuando una retícula horizontal produzca recorridos extensos o deje poco espacio para las etiquetas
- Usar flechas solo para dirección, dependencia o transferencia
- Usar líneas sin flecha para asociaciones no dirigidas
- Limitar las etiquetas de relación a tres palabras, salvo mensajes o eventos técnicos que deban conservar su nombre exacto
- Colocar cada etiqueta fuera del trazo y del segmento terminal; nunca cubrir la punta ni tocar un nodo
- Usar en cada etiqueta el mismo color de su conector
- Usar una superficie blanca con opacidad de relleno de 95% y opacidad general de 100% detrás de cada etiqueta de relación para cubrir visualmente el trazo y priorizar su legibilidad
- Diferenciar relaciones mediante etiqueta, patrón o terminación, no solo mediante color
- Mantener una ruta principal claramente más legible que las ramas secundarias
- Normalizar las puntas de todos los conectores con la geometría de referencia de `sequence`, que conserva su visibilidad a escala de diapositiva

## Aplicación visual

- Aplicar colores, tipografía, espaciado, trazos y curvas desde la configuración cerrada de `academic-sober`
- Ajustar el `viewBox` al contenido renderizado antes de insertarlo: `sequence` ocupa el cuerpo disponible sin reducirse por espacio residual y `hierarchy` reserva margen vertical suficiente para no desbordarse en `1920x1080`
- El SVG estatico ocupa el ancho y alto del cuerpo de diagrama con `width: 100%`, `height: 100%` y `max-width: none`
- Comprobar el resultado visual a `1920x1080`; corregir colisiones, densidad o recorridos modificando la fuente o dividiendo el contenido

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
- Cuando la cadena no quepa con texto legible en una sola fila, declarar filas explicitas mediante grupos Mermaid con direccion interna de izquierda a derecha; no esperar un ajuste automatico del motor
- Mermaid no conserva una fila horizontal interna cuando el ultimo nodo se conecta directamente con un nodo de otra fila. En ese caso, no dibujar un conector entre filas: usar una relacion invisible `~~~` entre los grupos para fijar el orden vertical y numerar cada fila en su esquina superior izquierda (`01`, `02`, ...) para establecer una sola secuencia de lectura
- Mantener las etapas ordenadas de izquierda a derecha dentro de cada fila y continuar la numeracion en la fila siguiente; no invertir ni reiniciar el flujo
- Usar como maximo tres o cuatro etapas por fila y reservar la numeracion para la continuidad semantica cuando Mermaid no pueda dibujar el retorno entre filas

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
    data-diagram-engine="mermaid"
    data-diagram-type="architecture"
    data-reading-direction="left-to-right"
    aria-labelledby="diagram-title"
    aria-describedby="diagram-description"
>
    <div data-diagram-output></div>
    <figcaption id="diagram-description" class="diagram-caption">
        La entrada se valida antes de producir el resultado.
    </figcaption>
</figure>
```

El compilador reemplaza el contenido de `data-diagram-output` por el SVG estático, actualiza el hash y conserva el `.mmd` en el paquete. Los diagramas existentes conservan compatibilidad, pero toda diapositiva nueva debe usar el contrato Mermaid tipado.

## Accesibilidad

- Mantener al menos 3:1 de contraste en nodos, conectores y terminaciones esenciales
- Mantener 4.5:1 para texto normal y 3:1 para texto grande
- Proporcionar una descripción textual equivalente de componentes, dirección y relaciones
- Mantener título y descripción accesibles en Mermaid y una descripción HTML equivalente asociada a la figura
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
