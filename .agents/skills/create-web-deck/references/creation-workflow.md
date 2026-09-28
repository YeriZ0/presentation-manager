# Flujo de creación guiada

Este documento es la única fuente normativa para las preguntas, decisiones y transiciones de la creación asistida. La skill conserva el contrato técnico de generación y debe cargar este archivo antes de recopilar información.

## Principios de interacción

- Usar la herramienta `question` o su equivalente en cada solicitud de información, selección o aprobación cuando esté disponible
- Agrupar en una sola llamada las preguntas independientes de una misma sección cuando la herramienta lo permita
- Omitir preguntas ya resueltas por el usuario o por documentos leídos
- Ofrecer opciones para decisiones cerradas y respuesta libre para títulos, nombres y datos abiertos
- Incluir `Omitir`, `No aplica` o `No tengo ese recurso` cuando corresponda
- No pedir rutas, IDs técnicos ni nombres de bibliotecas que el agente pueda resolver
- No volver a confirmar respuestas inequívocas; confirmar solo conflictos, ambigüedades o aprobaciones requeridas
- Solicitar confirmación antes de reemplazar contenido existente
- Reservar el chat para contexto, avances, decisiones puntuales, conflictos y entrega
- Indicar `Escriba en otro` en preguntas de texto libre cuando corresponda
- Colocar esa indicación en el enunciado, no como opción duplicada de la respuesta libre nativa de la herramienta
- No solicitar ni requerir Python para leer fuentes, generar, validar o empaquetar

Si la herramienta interactiva no está disponible, indicarlo una sola vez y continuar con solicitudes breves agrupadas por sección. No simular un modal. La navegación con flechas y la etiqueta efectiva del campo libre dependen de la interfaz interactiva disponible y no deben prometerse sin comprobarlas.

El contenido editorial no se revisa en modales ni se confirma por bloques de chat. El agente lo escribe y actualiza en `presentations/<slug>/_working/structure/slide-content.md`; el usuario lo revisa y modifica directamente. Ese archivo es la fuente editorial unica y sigue el contrato de `slide-content-format.md`.

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

Comprobar `presentations/<slug>/` y `presentations/packages/<slug>.zip`. Ante una colisión, preguntar si se desea reemplazar, crear una nueva versión o cancelar. Crear `_working/sources/` y `_working/structure/` solamente después de resolver la ubicación. Comunicar ambas rutas completas: `sources/` recibe documentos, imágenes y recursos fuente; `structure/` recibe guiones, estructuras, esquemas y `slide-content.md`. Ambas quedan fuera del ZIP.

El nombre de trabajo y el slug organizan los archivos. El título visible puede resolverse después de leer fuentes y debe estar definido en `slide-content.md` antes de generar `deck.json` y la portada. Cambiar el título no renombra la carpeta.

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

La decisión cubre el subtítulo de portada, los contextos opcionales y las propuestas temáticas del archivo editorial. Permitir omitir subtítulos o contextos, pero no dejar sin resolver el tema principal. Si se delega, proponer también el título visible cuando falte y escribir los textos propuestos directamente en `slide-content.md`; no preguntar por cada texto de forma redundante. Si se eligen fuentes que aún no existen, pedirlas o consultar si se cambia de modo. No inventar estadísticas, estudios ni fuentes para respaldar textos propuestos. Conservar las reglas de brevedad y evitar categorías que repitan el título.

### 5. Identidad

Mantener este orden para los primeros datos faltantes:

1. Título visible: reutilizarlo o proponerlo según la decisión editorial, sin bloquear la recepción de fuentes
2. Integrantes o confirmación de presentación individual
3. Materia o confirmación de que no aplica

Después agrupar en una sección de identidad los datos independientes que falten: institución, facultad o carrera, docente o responsable, equipo y fecha. Pedir el subtítulo solo si el usuario eligió definirlo personalmente y no lo omitió. En grupos, recoger nombres completos en una pregunta de texto libre con la indicación `Escriba en otro` y permitir añadirlos si la herramienta lo requiere. No inventar datos de identidad.

### 6. Alcance y recursos

Agrupar en una sección de alcance únicamente lo que falte: tema, público, idioma, cantidad de diapositivas, preferencia de notas y disponibilidad de logos o imágenes. Si la cantidad no está definida, proponer una cantidad razonable antes de preguntar.

Si las temáticas se delegaron, proponerlas desde el origen elegido y escribirlas en el archivo editorial; no volver a exigir que el usuario redacte el campo tema. Preguntar solo si falta información para acotar el objetivo.

Antes de solicitar un logo, revisar `public/logos/` y los recursos ya aportados. Para cada logo o imagen remota, preguntar si se descarga al paquete o se conserva la URL HTTPS. Registrar los hosts remotos en `externalResources`.

Antes de los detalles visuales, preguntar:

`¿Desea usar el diseño recomendado de la plantilla o personalizarlo?`

Con el diseño recomendado, aplicar los valores documentados y preguntar solo decisiones necesarias. Con personalización, agrupar las opciones independientes permitidas, como acento, tipografía, fondo y densidad.

### 7. Contenido editorial

Leer `structureIndex` y crear `presentations/<slug>/_working/structure/slide-content.md` con el formato de `slide-content-format.md`. El archivo debe contener la presentacion completa, con una diapositiva ordenada por bloque. No presentar el esquema completo ni partes de este para que el usuario las confirme en el chat.

Escribir en cada bloque el nombre visible y el ID de estructura, todos los textos visibles, la identidad aplicable, las listas, tablas, datos de graficas, codigo, notas, iconos, pies, recursos y rutas locales. Para diagramas relacionales, incluir la fuente Mermaid completa y su ruta final. Las rutas de recursos indican el destino empaquetado bajo `assets/`; cuando exista, anotar tambien su origen bajo `_working/sources/`.

Comunicar la ruta del archivo y solicitar mediante `question` que el usuario lo revise y edite directamente. La pregunta solo debe ofrecer continuar cuando el contenido este listo o solicitar ayuda puntual; no debe copiar el contenido editorial al chat ni pedir una confirmacion por diapositiva. Si el usuario edita el archivo, releerlo por completo. Si comunica cambios por chat, aplicar solo los cambios indicados al archivo, conservar el resto y volver a comunicar su ruta.

Antes de generar, validar que el archivo sigue el formato, no contiene campos vacios ni marcadores pendientes, usa estructuras permitidas, tiene numeracion unica y declara todos los recursos e iconos exigidos. Preguntar solo por conflictos, contenido incompleto, una omision sin motivo, permisos, biblioteca alternativa o un reemplazo de contenido existente. No generar hasta resolverlos.

Tras validar el archivo, cargar solo las estructuras distintas declaradas y los modulos condicionales necesarios.

### 8. Recursos e iconos

Recopilar solo los recursos faltantes. Declarar cada icono por concepto, rol, nombre, peso y razon semantica dentro de la diapositiva correspondiente de `slide-content.md`. Derivar `_working/icons.json` desde esas declaraciones para el copiador; no usarlo como una segunda fuente editable. Confirmar una biblioteca alternativa o archivos del usuario cuando corresponda. Resolver recursos pendientes conforme a la skill y escribir las notas solicitadas en el bloque editorial.

Para `academic-sober`, incluir iconos semanticos por defecto en pilares, comparaciones, elementos narrativos y pasos de procesos. Evaluar su pertinencia y cargar iconografia por el tipo de estructura, no unicamente despues de decidir que ya habra iconos. El diseno recomendado no significa ausencia de iconos.

Solo omitir el grupo por solicitud explicita o por falta justificada de una correspondencia semantica despues de buscar candidatos y consultar la adaptacion. Registrar el motivo en `slide-content.md`. Declarar en el `body` `data-icons="none"` y `data-icon-omission="user-request"` o `"no-semantic-match"`; sin esos marcadores se exige un icono por unidad. No quitar todos los iconos porque falta uno. Un fallo al copiar activos debe resolverse, no ocultarse suprimiendo iconos.

Despues de preparar recursos, comprobar que cada icono declarado este en el HTML y sea visible con su imagen o mascara cargada. Tener una biblioteca instalada o un `span` vacio no prueba que el icono aparezca.

### 9. Generación y entrega

Antes de escribir el primer HTML/CSS, resolver los módulos `always` y los condicionales necesarios y preparar una lista interna breve de restricciones aplicables. Diseñar la base de cabecera, cuerpo y pie con separación por espacio y sin barras decorativas. No copiar CSS de otro deck para limpiarlo después. Si se usa un generador de autoría, revisar su composición base antes de propagarla a las slides; no establecer una fase rutinaria de eliminación de bordes. Reutilizar dentro del trabajo las reglas ya cargadas, sin releer toda la plantilla por slide ni añadir una aprobación del usuario.

Generar desde la version validada de `slide-content.md`. Para diagramas relacionales, escribir la fuente declarada en `diagrams/`, declarar sus metadatos en `deck.json` y compilar el SVG estático con Mermaid antes de validar. Compartir el `.mmd`, pero no el runtime. Validar formato, seguridad, recursos, plantilla y empaquetado con las herramientas oficiales basadas en Node.js, y entregar rutas breves. Si surge un cambio de contenido, actualizar el archivo editorial y validar solo las dependencias afectadas. Distinguir verificaciones realizadas de comprobaciones pendientes. No requerir Python en ninguna etapa.

La auditoría final detecta regresiones y problemas renderizados, no sustituye la aplicación inicial de las reglas. Corregir el origen concreto de un fallo sin regenerar contenido no afectado.

En `academic-sober`, la base de unidades abiertas centra tema, icono y descripción, tanto cajas como texto, en pilares, comparaciones, narrativa y procesos. Anclar el CSS a sus marcadores `data-*` obligatorios. Revisar que cualquier clase auxiliar exista en el HTML final; insertar iconos o modificar el marcado no puede desconectar los selectores de alineación. El centrado vertical del cuerpo no demuestra el centrado horizontal de cada columna.

## Correcciones y reanudación

El usuario puede cambiar un dato en cualquier momento. Actualizar el campo correspondiente en `slide-content.md`, volver a leerlo y revisar solo las dependencias afectadas. Cambiar la cantidad, orden o estructura de diapositivas exige validar el archivo editorial completo; cambiar el docente no exige volver a elegir plantilla. No renombrar automáticamente una carpeta existente porque cambió el título visible.

Al revisar una presentacion existente, usar su `slide-content.md` como estado editorial vigente. Si falta, reconstruirlo desde los artefactos del deck y comunicar que se creo para futuras revisiones. No exigir que el usuario vuelva a aprobar la creacion historica.

Cuando un ajuste modifique una fuente Mermaid `.mmd`, ejecutar inmediatamente `npm run compile:diagrams -- presentations/<slug>` antes de validar o empaquetar. Si la compilación falla, corregir la fuente Mermaid o su configuración cerrada; nunca editar el SVG estático.

Para reanudar:

1. Identificar la presentación existente; si hay varias, pedir selección
2. Leer sus datos y `structure/slide-content.md`
3. Preguntar qué desea continuar o modificar
4. Reutilizar datos válidos y preguntar solo por faltantes o afectados
5. Aplicar las reglas de colisión antes de sobrescribir artefactos

## Registro local

Registrar solo estado operativo no editorial en `_working/creation-state.json`. El contenido y la estructura de las diapositivas viven exclusivamente en `structure/slide-content.md`. Usar esta estructura minima:

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
  "slideContentPath": "_working/structure/slide-content.md",
  "slideContentHash": null,
  "pending": []
}
```

Las claves son ASCII y el archivo queda fuera del ZIP. Es un apoyo para reanudar, no una fuente adicional de reglas visuales. Antes de reutilizarlo, comprobar que los artefactos referenciados sigan existiendo.

`editorialMode` usa `sources`, `conversation` o `manual`. `authorizedReferences` registra cada referencia y el alcance autorizado (`content`, `design` o ambos). Los nombres de trabajo son datos internos de autoría: `deck.json.title` sigue conteniendo el título visible, sin agregar campos al formato. Al reanudar un registro antiguo, recuperar la carpeta existente y preguntar solo por decisiones que sigan faltando; no inferir autorización para nuevas referencias.

`slideContentHash` registra los bytes de la ultima lectura validada para detectar cambios antes de generar o reanudar. `pending` contiene solo faltantes operativos que no pueden escribirse o resolverse en el archivo editorial, como permisos de una fuente externa o un recurso que aun no fue aportado. No duplicar en este estado textos, orden, estructuras, iconos ni recursos declarados en `slide-content.md`.
