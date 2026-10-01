# Armadillo PP in Web

Reproductor local de presentaciones creadas con HTML, CSS y JavaScript.

## Requisitos

- Node.js compatible con Vite 7
- npm
- Chrome o Edge actual

## Desarrollo

```powershell
npm install
npm run dev
```

La galeria visual de la plantilla Academica sobria se consulta manualmente en `http://localhost:5173/catalog/academic-sober/`.

El servidor de desarrollo integra Vite y Socket.IO. `/presenter` importa y prepara una presentación, `/presenter/live` la reproduce y `/controller` permite emparejar un controlador mediante un código temporal. La raíz elige el acceso inicial según las dimensiones de la ventana.

Para probar el control, abra dos navegadores con distintos tamaños, genere el código desde «Conectar control móvil» en el escritorio e introdúzcalo en el controlador. Consulte [Control móvil](docs/remote-control.md) para las pruebas, reconexión, red local y despliegue en VPS. El móvil recibe notas y estado; el ZIP permanece en el escritorio.

## Verificacion

```powershell
npm run format:check
npm test
npm run lint
npm run build
```

Las presentaciones se pueden exportar a `.pptx` desde la pantalla previa o desde el menú del reproductor. El conversor local de `dom-to-pptx` se prepara automáticamente en `npm run dev` y `npm run build`. La exportación necesita que el navegador tenga disponibles los recursos externos declarados; los ZIP autocontenidos pueden exportarse sin conexión. Consulta [Exportación PPTX](docs/pptx-export.md) para el alcance y las limitaciones.

## Presentaciones

Importa un ZIP que contenga `deck.json` en la raiz. Consulta `docs/presentation-format.md` y `examples/valid-basic` para conocer únicamente la estructura técnica del formato.

Las presentaciones creadas con la skill se guardan en `presentations/<slug>/` y sus paquetes en `presentations/packages/`. `examples/` queda reservado para referencias y pruebas.

La presencia de un archivo en `examples/` o `presentations/` no autoriza utilizarlo como modelo de una nueva presentación. El agente solo consulta otros decks como referencia cuando el usuario lo indica expresamente para la tarea actual.

Para validar y empaquetar una presentación existente:

```powershell
npm run package:deck -- presentations/<slug> presentations/packages/<slug>.zip
```

El empaquetador exige `presentations/<slug>/_working/structure/slide-content.md`, incluye todos los archivos de esa carpeta bajo `structure/` y copia `slide-content.md` en la raíz del ZIP. `_working/sources/` queda fuera del paquete. Los diagramas relacionales se escriben como fuentes Mermaid bajo `diagrams/` y se compilan a SVG estático con `npm run compile:diagrams -- presentations/<slug>`. Las fuentes `.mmd` se incluyen en el ZIP para continuar la edición en otro dispositivo; el runtime de Mermaid no se empaqueta ni se ejecuta en las diapositivas.

El catálogo `academic-sober` usa el mismo compilador. `npm run dev` y `npm run build` generan primero sus siete SVG desde `catalog/academic-sober/diagrams/`. Para regenerarlos sin iniciar Vite, usa `npm run compile:catalog-diagrams`.

La compilacion de diagramas usa Chromium de Playwright si ya esta disponible, Google Chrome o Microsoft Edge. Si no hay un navegador compatible, instala Chrome o Edge.

El núcleo de iconos Phosphor se consulta en `scripts/icon-catalog.json`. Usa `npm run vendor:icons -- presentations/<slug>` para copiar únicamente los iconos declarados en el contenido editorial y generar su CSS configurable.

La skill portable para crear presentaciones se encuentra en `.agents/skills/create-web-deck`.

## Trabajo con agentes

Consulte [Requisitos de generación](docs/generation-requirements.md) para conocer los datos que se solicitan y los resultados esperados de iconos, composiciones, código y gráficas.

El punto de entrada para agentes compatibles es `AGENTS.md`. Cuando la solicitud sea ambigua, ofrece estas modalidades:

- Trabajar con una presentación: reproducir, importar, crear, revisar, validar o empaquetar
- Crear o mantener una plantilla: crear, revisar o ajustar sus reglas visuales

El cuestionario de creación agrupa solo preguntas independientes pendientes y tiene su fuente normativa en `.agents/skills/create-web-deck/references/creation-workflow.md`. Las preguntas de texto libre indican `Escriba en otro` cuando corresponde. Para aportar material, use `presentations/<slug>/_working/sources/` para fuentes, recursos y esquemas originales, y `presentations/<slug>/_working/structure/` para estructuras y materiales editoriales generados, incluido `slide-content.md`; `sources/` queda fuera del ZIP, mientras que los archivos de `structure/` se incluyen bajo `structure/` y el contenido editorial se copia también a la raíz. Para mantener plantillas, consulta `docs/template-authoring-guide.md`; no se modifica una plantilla durante la creación de un deck.

Al iniciar una creación se solicita un nombre de trabajo obligatorio para preparar esas carpetas; puede ser provisional y distinto del título visible. El usuario puede pedir que el agente proponga subtítulos y temáticas desde las fuentes autorizadas o desde la conversación, o definirlos personalmente. Las restricciones visuales se aplican desde la primera composición, antes de la validación final.

El agente genera `presentations/<slug>/_working/structure/slide-content.md` como fuente editorial directa. El archivo presenta una diapositiva por bloque, su estructura, textos, iconos, recursos locales, datos de tablas y graficas, notas y fuentes Mermaid cuando corresponda. El usuario lo edita directamente y el agente lo relee antes de generar el deck.

La creación, validación y empaquetado de presentaciones no requiere Python. Use las herramientas oficiales del proyecto basadas en Node.js y el empaquetador `scripts/package-deck.mjs`.

Phosphor Icons esta disponible localmente mediante `@phosphor-icons/core`. La skill copia a cada presentacion solamente los SVG confirmados por el usuario.
