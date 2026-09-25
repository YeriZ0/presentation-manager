# Flujo de creación guiada

Este documento es la única fuente normativa para las preguntas, decisiones y transiciones de la creación asistida. La skill conserva el contrato técnico de generación y debe cargar este archivo antes de recopilar información.

## Principios de interacción

- Usar la herramienta `question` o su equivalente en cada solicitud de información, selección o aprobación cuando esté disponible
- Agrupar en una sola llamada las preguntas independientes de una misma sección cuando la herramienta lo permita
- Para confirmar resúmenes, mostrar una sola sección breve por llamada y conservar su aprobación de forma independiente; no reunir todo el resumen en una pregunta
- Omitir preguntas ya resueltas por el usuario o por documentos leídos
- Ofrecer opciones para decisiones cerradas y respuesta libre para títulos, nombres y datos abiertos
- Incluir `Omitir`, `No aplica` o `No tengo ese recurso` cuando corresponda
- No pedir rutas, IDs técnicos ni nombres de bibliotecas que el agente pueda resolver
- No volver a confirmar respuestas inequívocas; confirmar solo conflictos, ambigüedades o aprobaciones requeridas
- Solicitar confirmación antes de reemplazar contenido existente
- Reservar el chat para contexto, avances, propuestas de esquema y entrega
- Indicar `Escriba en otro` en preguntas de texto libre cuando corresponda
- Colocar esa indicación en el enunciado, no como opción duplicada de la respuesta libre nativa de la herramienta
- No solicitar ni requerir Python para leer fuentes, generar, validar o empaquetar

Si la herramienta interactiva no está disponible, indicarlo una sola vez y continuar con solicitudes breves agrupadas por sección. No simular un modal. La navegación con flechas y la etiqueta efectiva del campo libre dependen de la interfaz interactiva disponible y no deben prometerse sin comprobarlas.

## Modalidades

Cuando el objetivo sea ambiguo, preguntar:

`¿Qué desea hacer?`

- Trabajar con una presentación: reproducir, importar, crear, revisar, validar o empaquetar
- Crear o mantener una plantilla: crearla, revisar sus reglas o ajustar una existente

Si la solicitud identifica claramente la actividad, entrar directamente en ella. Una petición de mantenimiento del reproductor u otro código no debe forzarse dentro del cuestionario de presentaciones.

## Presentaciones

Si no está claro si se creará una presentación o se continuará una existente, resolver esa elección antes de preparar carpetas. Para continuar, entrar directamente en reanudación; no pedir un nombre nuevo ni crear otra carpeta.

### 1. Nombre obligatorio de trabajo

Al entrar en una creación nueva, pedir primero el nombre de trabajo si no se proporcionó uno inequívoco:

`¿Qué nombre desea dar a este trabajo? Es obligatorio porque lo usaremos para crear la carpeta donde colocará fuentes, imágenes y esquemas iniciales. Puede ser provisional y no tiene que coincidir con el título visible de la presentación. Escriba en otro.`

No ofrecer `Omitir` ni `No aplica`, ni avanzar con un nombre vacío. Si el usuario ya dio un nombre, reutilizarlo y explicar su función sin repetir la pregunta. Para reanudar, usar la ubicación de la presentación seleccionada.

Derivar del nombre un slug ASCII en minúsculas con guiones, mostrar `presentations/<slug>/` y permitir corregirlo sin exigir términos técnicos. Rechazar rutas absolutas, barras invertidas, segmentos de recorrido, `packages`, nombres de dispositivo de Windows y valores vacíos después de normalizar.

Comprobar `presentations/<slug>/` y `presentations/packages/<slug>.zip`. Ante una colisión, preguntar si se desea reemplazar, crear una nueva versión o cancelar. Crear `_working/sources/` y `_working/structure/` solamente después de resolver la ubicación. Comunicar ambas rutas completas: `sources/` recibe documentos, imágenes y recursos fuente; `structure/` recibe guiones, estructuras y esquemas. Ambas quedan fuera del ZIP.

El nombre de trabajo y el slug organizan los archivos. El título visible puede resolverse después de leer fuentes y debe estar aprobado antes de generar `deck.json` y la portada. Cambiar el título no renombra la carpeta.

### 2. Punto de partida

Para una presentación nueva, preguntar:

`¿Cómo desea crear la presentación?`

- A partir de un tema
- A partir de documentos
- A partir de un esquema

No iniciar el cuestionario de creación para reproducir, validar o empaquetar una presentación ya existente.

### 3. Plantilla

Descubrir solo los manifiestos `docs/templates/*/template.md`. Mostrar nombre y resumen, pedir la selección y cargar únicamente el manifiesto seleccionado y sus módulos `always`. También puede elegirse una dirección visual personalizada sin convertirla en una plantilla reutilizable.

### 4. Material

En las ramas de documentos o esquema, indicar cómo aportar los archivos según las capacidades del entorno. Aceptar material ya presente, leerlo antes de preguntar datos que pueda contener y reutilizar los datos extraídos. Si hay discrepancias, preguntar únicamente por el dato conflictivo. No usar Python como solución de lectura o conversión.

Material ya presente significa fuentes asignadas a este trabajo o indicadas explícitamente por el usuario, no cualquier deck del repositorio. No abrir ni copiar otras presentaciones como referencia visual, temática o de implementación sin autorización para la tarea actual. La autorización debe distinguir contenido y diseño; no heredar permisos de conversaciones anteriores. La detección de colisiones y la reanudación de un deck no autorizan explorar otros como modelos. Las atribuciones históricas de una plantilla tampoco obligan a reabrir sus referencias.

Antes de completar textos editoriales, preguntar cómo desea definir subtítulos y temáticas, salvo decisión ya proporcionada:

- Que el agente los proponga desde las fuentes autorizadas
- Que el agente los proponga desde la conversación pertinente a este trabajo
- Definirlos personalmente

La decisión cubre el subtítulo de portada, los contextos opcionales y las propuestas temáticas del esquema. Permitir omitir subtítulos o contextos, pero no dejar sin resolver el tema principal. Si se delega, proponer también el título visible cuando falte y aprobar los textos en su sección correspondiente, según la revisión seccionada del esquema; no preguntar por cada texto de forma redundante. Si se eligen fuentes que aún no existen, pedirlas o consultar si se cambia de modo. No inventar estadísticas, estudios ni fuentes para respaldar textos propuestos. Conservar las reglas de brevedad y evitar categorías que repitan el título.

### 5. Identidad

Mantener este orden para los primeros datos faltantes:

1. Título visible: reutilizarlo o proponerlo según la decisión editorial, sin bloquear la recepción de fuentes
2. Integrantes o confirmación de presentación individual
3. Materia o confirmación de que no aplica

Después agrupar en una sección de identidad los datos independientes que falten: institución, facultad o carrera, docente o responsable, equipo y fecha. Pedir el subtítulo solo si el usuario eligió definirlo personalmente y no lo omitió. En grupos, recoger nombres completos en una pregunta de texto libre con la indicación `Escriba en otro` y permitir añadirlos si la herramienta lo requiere. No inventar datos de identidad.

### 6. Alcance y recursos

Agrupar en una sección de alcance únicamente lo que falte: tema, público, idioma, cantidad de diapositivas, preferencia de notas y disponibilidad de logos o imágenes. Si la cantidad no está definida, proponer una cantidad razonable antes de preguntar.

Si las temáticas se delegaron, proponerlas desde el origen elegido y aprobarlas por bloques del esquema; no volver a exigir que el usuario redacte el campo tema. Preguntar solo si falta información para acotar el objetivo.

Antes de solicitar un logo, revisar `public/logos/` y los recursos ya aportados. Para cada logo o imagen remota, preguntar si se descarga al paquete o se conserva la URL HTTPS. Registrar los hosts remotos en `externalResources`.

Antes de los detalles visuales, preguntar:

`¿Desea usar el diseño recomendado de la plantilla o personalizarlo?`

Con el diseño recomendado, aplicar los valores documentados y preguntar solo decisiones necesarias. Con personalización, agrupar las opciones independientes permitidas, como acento, tipografía, fondo y densidad.

### 7. Esquema

Leer `structureIndex` y preparar el esquema numerado completo en el estado de trabajo. Mostrarlo y aprobarlo mediante secciones pequeñas, nunca como una pregunta que contenga todas las diapositivas.

#### División del resumen

- Separar identidad y subtítulo, bloques temáticos del esquema, decisiones visuales y recursos. No volver a pedir la confirmación de datos inequívocos que ya fueron aprobados
- En el esquema, usar dos diapositivas por sección como valor habitual y tres como máximo. Si un bloque temático es mayor, dividirlo en partes sin perder la numeración global
- En identidad, diseño o recursos, mostrar hasta tres decisiones relacionadas por sección. Las propuestas de iconos se agrupan por el mismo bloque de diapositivas y se subdividen si exceden el presupuesto
- Cada pregunta tiene como objetivo no superar 600 caracteres y diez líneas explícitas, incluidos el resumen y la indicación de respuesta. Contar también el ajuste de líneas por ancho: si los textos largos ocupan más espacio, usar una sola diapositiva o decisión por sección
- Mantener encabezados y descripciones de opciones breves. Indicar sección, tema y rango, por ejemplo `Sección 3/9 · Constitución · diapositivas 5–6`
- No abreviar nombres propios ni quitar contenido necesario solo para cumplir el presupuesto. Dividir la sección antes de exigir desplazamiento, cambiar el tamaño de la consola o reducir la letra
- Una sección es una pregunta independiente y se envía en una llamada propia. No concatenar las secciones en un único campo ni enviar todo el resumen de dieciséis diapositivas para una aprobación global

Los límites son un presupuesto conservador, no una garantía sobre la altura del cliente. Ante una terminal estrecha, reducir el bloque. Si el modal no conserva el formato, mostrar solo la sección actual como lista breve en el chat y dejar una pregunta corta de confirmación en el modal; no trasladar de nuevo el resumen completo a otro lugar.

#### Formato de cada sección

Formatear una diapositiva por bloque: número y título en una línea, descripción breve en la siguiente y una línea en blanco entre bloques. Enviar saltos reales, no una enumeración corrida ni secuencias escapadas visibles. Usar nombres comprensibles; los IDs como `cover` o `pillars` son internos.

Ejemplo de contenido de una pregunta:

```text
Sección 2/5 · Fundamentos · diapositivas 2–3

2. Conceptos principales
Definición y alcance del tema.

3. Aplicación práctica
Relación con el caso estudiado.

Confirme esta sección o escriba los ajustes para ella.
```

Cada sección ofrece dos vías:

1. **Confirmar sección:** opción cerrada que aprueba únicamente la versión mostrada de esa sección
2. **Escribir ajustes:** respuesta libre nativa de la herramienta, donde el usuario indica directamente qué cambiar en esa sección

Cuando la herramienta agrega automáticamente el campo libre, incluir solo `Confirmar sección` en las opciones cerradas y explicar en el enunciado que la respuesta libre sirve para escribir ajustes. No duplicarla con una opción cerrada llamada `Escriba en otro`, `Modificar` o `Escribir ajustes`. Si el cliente no admite escritura libre junto a opciones, ofrecer `Confirmar sección` y una acción `Escribir ajustes`; esta última abre una pregunta de texto libre referida solo a la sección actual. No prometer una etiqueta específica del campo nativo.

#### Confirmación y corrección local

- Una confirmación aprueba solo el contenido mostrado, nunca las secciones aún no revisadas
- Una respuesta libre con cambios deja esa sección pendiente; aplicar los ajustes y mostrar únicamente su versión actualizada para confirmarla
- Si el cambio es ambiguo, preguntar dentro de esa misma sección; no obligar a describir otra vez toda la presentación
- Conservar las secciones aprobadas y avanzar a la siguiente. Mostrar progreso breve, por ejemplo `3 de 9 secciones confirmadas`, sin repetir sus contenidos
- Si una corrección afecta otras secciones, explicar cuáles y reabrir solo las dependientes. Reordenar o añadir diapositivas exige actualizar rangos y número de secciones, no perder aprobaciones de contenido que sigue intacto
- Registrar versiones y aprobaciones según `Registro local`; una aprobación de una versión anterior no valida cambios posteriores
- Cuando todas las secciones vigentes estén confirmadas, comunicar que el esquema quedó aprobado y continuar. No solicitar otra confirmación global con el resumen completo

Tras la aprobación de las secciones del esquema, cargar solo las estructuras distintas utilizadas y los módulos condicionales necesarios. No generar hasta resolver los ajustes pendientes del contenido correspondiente.

### 8. Contenido e iconos

Recopilar solo el contenido faltante. Proponer iconos por concepto con su razón semántica, solicitar aprobación o cambios por secciones breves y registrar la selección en `_working/icons.json`. Reutilizar aprobaciones si los iconos ya se incluyeron en las secciones revisadas del esquema; no repetirlas. Confirmar biblioteca alternativa o archivos del usuario cuando corresponda. Resolver recursos pendientes conforme a la skill y recoger notas si fueron solicitadas.

Para `academic-sober`, incluir iconos semánticos por defecto en pilares, comparaciones, elementos narrativos y pasos de procesos. Evaluar su pertinencia y cargar iconografía por el tipo de estructura, no únicamente después de decidir que ya habrá iconos. El usuario no tiene que pedirlos: presentar la selección recomendada con la propuesta y resolver su aprobación sin preguntas por cada activo. El diseño recomendado no significa ausencia de iconos.

Solo omitir el grupo por solicitud explícita o por falta justificada de una correspondencia semántica después de buscar candidatos y consultar la adaptación. Registrar la decisión y el motivo en el estado de trabajo. Declarar en el `body` `data-icons="none"` y `data-icon-omission="user-request"` o `"no-semantic-match"`; sin esos marcadores se exige un icono por unidad. No quitar todos los iconos porque falta uno ni interpretar falta de aprobación como rechazo. Un fallo al copiar activos debe resolverse, no ocultarse suprimiendo iconos.

Después de preparar recursos, comprobar que cada icono aprobado esté en el HTML y sea visible con su imagen o máscara cargada. Tener una biblioteca instalada o un `span` vacío no prueba que el icono aparezca.

### 9. Generación y entrega

Antes de escribir el primer HTML/CSS, resolver los módulos `always` y los condicionales necesarios y preparar una lista interna breve de restricciones aplicables. Diseñar la base de cabecera, cuerpo y pie con separación por espacio y sin barras decorativas. No copiar CSS de otro deck para limpiarlo después. Si se usa un generador de autoría, revisar su composición base antes de propagarla a las slides; no establecer una fase rutinaria de eliminación de bordes. Reutilizar dentro del trabajo las reglas ya cargadas, sin releer toda la plantilla por slide ni añadir una aprobación del usuario.

Generar con las decisiones aprobadas. Para diagramas relacionales, escribir la fuente aprobada en `diagrams/`, declarar sus metadatos en `deck.json` y compilar el SVG estático con Mermaid antes de validar. Compartir el `.mmd`, pero no el runtime. Validar formato, seguridad, recursos, plantilla y empaquetado con las herramientas oficiales basadas en Node.js, y entregar rutas breves. Si surge una decisión de contenido aprobada que deba cambiar, preguntar solo por ese cambio. Distinguir verificaciones realizadas de comprobaciones pendientes. No requerir Python en ninguna etapa.

La auditoría final detecta regresiones y problemas renderizados, no sustituye la aplicación inicial de las reglas. Corregir el origen concreto de un fallo sin regenerar contenido no afectado.

En `academic-sober`, la base de unidades abiertas centra tema, icono y descripción, tanto cajas como texto, en pilares, comparaciones, narrativa y procesos. Anclar el CSS a sus marcadores `data-*` obligatorios. Revisar que cualquier clase auxiliar exista en el HTML final; insertar iconos o modificar el marcado no puede desconectar los selectores de alineación. El centrado vertical del cuerpo no demuestra el centrado horizontal de cada columna.

## Correcciones y reanudación

El usuario puede cambiar un dato en cualquier momento. Identificar el campo, pedir su nuevo valor y revisar solo las decisiones dependientes. Cambiar la cantidad de diapositivas exige revisar el esquema; cambiar el docente no exige volver a elegir plantilla. No renombrar automáticamente una carpeta existente porque cambió el título visible.

En las revisiones por secciones, conservar lo aprobado y reabrir únicamente las secciones afectadas. Al revisar una presentación existente, dividir en secciones el alcance solicitado, sin exigir reaprobar toda su creación histórica.

Cuando un ajuste modifique una fuente Mermaid `.mmd`, ejecutar inmediatamente `npm run compile:diagrams -- presentations/<slug>` antes de validar o empaquetar. Si la compilación falla, corregir la fuente Mermaid o su configuración cerrada; nunca editar el SVG estático.

Para reanudar:

1. Identificar la presentación existente; si hay varias, pedir selección
2. Leer sus datos y estado de trabajo
3. Preguntar qué desea continuar o modificar
4. Reutilizar datos válidos y preguntar solo por faltantes o afectados
5. Aplicar las reglas de colisión antes de sobrescribir artefactos

## Registro local

Registrar el progreso de las revisiones por secciones en `_working/creation-state.json` para poder corregir o reanudar sin reconstruir un resumen gigante. Usar esta estructura mínima:

```json
{
  "stage": "identity",
  "projectName": null,
  "slug": null,
  "presentationTitle": null,
  "editorialMode": null,
  "authorizedReferences": [],
  "provided": {},
  "omitted": [],
  "sources": [],
  "template": null,
  "preferences": {},
  "outline": null,
  "reviewSections": [],
  "approvedDecisions": [],
  "pending": []
}
```

Las claves son ASCII y el archivo queda fuera del ZIP. Es un apoyo para reanudar, no una fuente adicional de reglas visuales. Antes de reutilizarlo, comprobar que los artefactos referenciados sigan existiendo.

`editorialMode` usa `sources`, `conversation` o `manual`. `authorizedReferences` registra cada referencia y el alcance autorizado (`content`, `design` o ambos). Los nombres de trabajo son datos internos de autoría: `deck.json.title` sigue conteniendo el título visible, sin agregar campos al formato. Al reanudar un registro antiguo, recuperar la carpeta existente y preguntar solo por decisiones que sigan faltando; no inferir autorización para nuevas referencias.

Cada entrada de `reviewSections` contiene un ID interno estable, tema, alcance, referencias a los elementos revisados y estado. Por ejemplo:

```json
{
  "id": "outline-basics",
  "title": "Fundamentos",
  "scope": "outline",
  "itemIds": ["definition", "application"],
  "revision": 1,
  "status": "pending",
  "approvedRevision": null
}
```

`scope` distingue `identity`, `outline`, `design` e `icons`. `status` puede ser `pending`, `needs-changes` o `approved`. Al confirmar, guardar `approvedRevision` igual a `revision`. Al editar contenido, incrementar `revision`, borrar `approvedRevision` y solicitar confirmación de esa sección; aprobar únicamente cuando ambas revisiones coincidan. Si una dependencia cambia, poner la sección afectada en `pending`. Conservar IDs estables al renumerar diapositivas; actualizar la presentación de sus rangos sin invalidar automáticamente el contenido no modificado. No inferir aprobaciones que no estén registradas o proporcionadas inequívocamente por el usuario.
