# Instrucciones del proyecto

## Entrada del agente

Cuando una solicitud sea ambigua, usa una pregunta interactiva para ofrecer estas modalidades:

- Trabajar con una presentación: reproducir, importar, crear, revisar, validar o empaquetar
- Crear o mantener una plantilla: crear, revisar o ajustar reglas visuales

Si la solicitud identifica la actividad, entra directamente en ese flujo y no muestres un selector innecesario.

## Preguntas

- Usa `question` o el equivalente disponible para cada solicitud de información, selección o aprobación
- Agrupa datos independientes de una misma sección cuando la herramienta lo permita; para confirmar resúmenes, una sección breve por llamada
- Reutiliza información que el usuario ya proporcionó o que se extrajo de documentos
- Ofrece opciones para decisiones cerradas y respuesta libre para títulos y nombres
- Incluye `Omitir`, `No aplica` o `No tengo ese recurso` cuando corresponda
- No pidas IDs, rutas técnicas ni nombres internos que el agente pueda resolver
- Pide confirmación antes de reemplazar contenido existente
- En preguntas de texto libre, indica `Escriba en otro` cuando corresponda
- Esa indicación va en el enunciado: no agregues una opción de respuesta libre si la herramienta ya la proporciona
- Presenta esquemas con una diapositiva por bloque y saltos de línea explícitos; nunca como una enumeración dentro de un párrafo
- Divide los resúmenes en secciones pequeñas, cada una con confirmación propia y respuesta libre para ajustes; conserva las secciones aprobadas y no vuelvas a mostrar el resumen completo para una aprobación global
- Comunica las carpetas `presentations/<slug>/_working/sources/` y `presentations/<slug>/_working/structure/`, explicando que la primera contiene fuentes y recursos y la segunda estructuras, guiones y esquemas
- No solicites ni requieras Python para crear, validar o empaquetar presentaciones
- Al iniciar una creación, pide un nombre de trabajo obligatorio y explica que crea la carpeta de fuentes y recursos; puede ser distinto del título visible
- Permite delegar subtítulos y temáticas a partir de fuentes autorizadas o de la conversación pertinente, según el flujo

El flujo completo de creación, corrección y reanudación está en `.agents/skills/create-web-deck/references/creation-workflow.md`. Esa guía es la fuente normativa; no la dupliques aquí.

## Presentaciones

Usa `.agents/skills/create-web-deck/SKILL.md` para el contrato técnico de creación, validación, seguridad, recursos, plantillas y empaquetado. Las plantillas son de solo lectura durante la creación. El formato técnico está en `docs/presentation-format.md` y la autoría en `docs/authoring-guide.md`.

No consultes otras presentaciones como referencia de diseño, contenido o implementación salvo indicación explícita del usuario para la tarea actual. Comprobar colisiones no autoriza leer otros decks. Aplica las restricciones de la plantilla antes de escribir HTML/CSS; la validación final no sustituye una autoría conforme desde el inicio.

En `academic-sober`, incluir iconos semánticos por defecto en pilares, comparaciones, elementos narrativos y pasos de procesos. Una omisión requiere la decisión explícita descrita en `foundations/iconography.md`. Esas unidades son abiertas, sin tarjetas ni recuadros con bordes. El resumen para usuarios está en `docs/generation-requirements.md`.

En esas cuatro estructuras, centrar horizontalmente tema, icono y descripción en cada columna, tanto sus cajas como el texto, desde la primera autoría. Usar los marcadores `data-*` obligatorios como anclas de CSS y comprobar el resultado final; una clase de centrado ausente del HTML no aplica ningún estilo.

## Plantillas

Para crear o mantener una plantilla, usa `docs/template-authoring-guide.md` y `docs/templates/README.md`. No inicies el cuestionario de una presentación ni modifiques una plantilla silenciosamente para resolver el contenido de un deck.

## Idioma y código

La prosa dirigida al usuario debe estar en español correcto. Mantén ASCII en identificadores, rutas, comandos y comentarios de código. No uses emojis.
