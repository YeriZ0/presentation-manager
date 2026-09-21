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

## Verificacion

```powershell
npm run format:check
npm test
npm run lint
npm run build
```

Las pruebas E2E estan declaradas en `tests/e2e`. Para ejecutarlas manualmente:

```powershell
npx playwright install chromium
npm run test:e2e
```

## Presentaciones

Importa un ZIP que contenga `deck.json` en la raiz. Consulta `docs/presentation-format.md` y `examples/valid-basic` para conocer únicamente la estructura técnica del formato.

Las presentaciones creadas con la skill se guardan en `presentations/<slug>/` y sus paquetes en `presentations/packages/`. `examples/` queda reservado para referencias y pruebas.

La presencia de un archivo en `examples/` o `presentations/` no autoriza utilizarlo como modelo de una nueva presentación. El agente solo consulta otros decks como referencia cuando el usuario lo indica expresamente para la tarea actual.

Para validar y empaquetar una presentacion existente sin incluir `_working/`:

```powershell
npm run package:deck -- presentations/<slug> presentations/packages/<slug>.zip
```

El empaquetado requiere Chromium de Playwright para comprobar el contraste renderizado. Instálalo con `npx playwright install chromium`.

El núcleo de iconos Phosphor se consulta en `scripts/icon-catalog.json`. Usa `npm run vendor:icons -- presentations/<slug>` para copiar únicamente los iconos aprobados y generar su CSS configurable.

La skill portable para crear presentaciones se encuentra en `.agents/skills/create-web-deck`.

## Trabajo con agentes

Consulte [Requisitos de generación](docs/generation-requirements.md) para conocer los datos que se solicitan y los resultados esperados de iconos, composiciones, código y gráficas.

El punto de entrada para agentes compatibles es `AGENTS.md`. Cuando la solicitud sea ambigua, ofrece estas modalidades:

- Trabajar con una presentación: reproducir, importar, crear, revisar, validar o empaquetar
- Crear o mantener una plantilla: crear, revisar o ajustar sus reglas visuales

El cuestionario de creación agrupa preguntas independientes por secciones y tiene su fuente normativa en `.agents/skills/create-web-deck/references/creation-workflow.md`. Las preguntas de texto libre indican `Escriba en otro` cuando corresponde. Para aportar material, use `presentations/<slug>/_working/sources/` para fuentes y recursos, y `presentations/<slug>/_working/structure/` para estructuras, guiones y esquemas; ninguna carpeta se incluye en el ZIP. Para mantener plantillas, consulta `docs/template-authoring-guide.md`; no se modifica una plantilla durante la creación de un deck.

Al iniciar una creación se solicita un nombre de trabajo obligatorio para preparar esas carpetas; puede ser provisional y distinto del título visible. El usuario puede pedir que el agente proponga subtítulos y temáticas desde las fuentes autorizadas o desde la conversación, o definirlos personalmente. Las restricciones visuales se aplican desde la primera composición, antes de la validación final.

Los resúmenes se confirman por secciones breves: normalmente dos diapositivas por sección, con confirmación propia y respuesta libre para ajustes. El agente conserva las secciones aprobadas, vuelve a mostrar solo las modificadas y continúa al finalizar, sin otra confirmación global que repita toda la presentación.

La creación, validación y empaquetado de presentaciones no requiere Python. Use las herramientas oficiales del proyecto basadas en Node.js y el empaquetador `scripts/package-deck.mjs`.

Phosphor Icons esta disponible localmente mediante `@phosphor-icons/core`. La skill copia a cada presentacion solamente los SVG confirmados por el usuario.
