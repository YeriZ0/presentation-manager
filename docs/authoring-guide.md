# Authoring guide

La autoría técnica descrita aquí no sustituye el flujo de creación guiada. Para crear una presentación mediante un agente, consulta `.agents/skills/create-web-deck/references/creation-workflow.md`; para crear o mantener una plantilla, consulta `docs/template-authoring-guide.md`.

Las presentaciones creadas en este proyecto se guardan en `presentations/<slug>/`. La carpeta `examples/` contiene solamente referencias y paquetes de prueba.

El slug se deriva de un nombre de trabajo obligatorio, explicado al usuario como nombre de la carpeta de recursos iniciales. No tiene que coincidir con el título visible: este puede definirse después de leer fuentes y queda en `deck.json.title`. Cambiar el título no renombra automáticamente la carpeta.

No consultar otras presentaciones como modelos de contenido, diseño o código salvo indicación explícita para el trabajo actual. Los ejemplos mínimos explican el formato, no autorizan imitar otros decks. El flujo permite proponer subtítulos y temáticas desde fuentes autorizadas o desde la conversación, o recogerlos del usuario.

Antes de escribir HTML/CSS, cargar las reglas aplicables y construir cabecera, cuerpo y pie directamente sin separadores decorativos. Revisar la base de un generador antes de propagarla; la auditoría final no sustituye esta preparación ni debe convertirse en una limpieza rutinaria de bordes.

## Estructura

```text
presentations/
  packages/
    class-notes.zip
  class-notes/
    _working/
      sources/
      structure/
    deck.json
    assets/
      icons/
        manifest.json
      logos/
      placeholders/
      licenses/
      ATTRIBUTIONS.md
    slides/
      001/
        index.html
        styles.css
        script.js
    notes/
      001.md
```

`_working/sources/` guarda documentos de referencia y `_working/structure/` guarda esquemas aportados por el usuario. Esta carpeta es de trabajo y nunca se incluye en el ZIP final.

Durante la creación, comunique ambas rutas al usuario: `presentations/<slug>/_working/sources/` recibe documentos, imágenes y recursos fuente; `presentations/<slug>/_working/structure/` recibe guiones, estructuras de diapositivas y esquemas. La creación, validación y empaquetado no requiere Python.

1. Crea una carpeta para cada diapositiva
2. Agrega `index.html`, `styles.css` y `script.js` en cada carpeta
3. Conserva todo el texto visible directamente en el HTML
4. Usa identificadores cortos, unicos y estables
5. Agrega las diapositivas a `deck.json` en orden de presentacion
6. Guarda las notas en archivos Markdown separados
7. Prueba todas las rutas desde la ubicacion del HTML
8. Valida recursos, atribuciones y licencias
9. Comprime el contenido de forma que `deck.json` quede en la raiz
10. Guarda el ZIP en `presentations/packages/`

Para empaquetar una carpeta ya creada, ejecuta `npm run package:deck -- presentations/<slug> presentations/packages/<slug>.zip`. El comando valida `deck.json`, incluye solamente `deck.json`, `assets/`, `slides/` y `notes/`, y rechaza runtimes de graficas no utilizados o faltantes. No uses scripts Python ni empaquetadores alternativos que omitan estas validaciones.

La skill no permite emojis en diapositivas, notas, titulos, textos alternativos ni etiquetas ARIA. El empaquetador tambien ejecuta una auditoria renderizada de contraste: 4.5:1 para texto normal, 3:1 para texto grande y elementos graficos relevantes. Un fallo bloquea la creacion del ZIP.

El reproductor usa `1920x1080` como viewport logico recomendado y escala la diapositiva con `contain`, sin recortar ni deformar el contenido.

## HTML minimo

```html
<!doctype html>
<html lang="es">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Introduccion</title>
        <link rel="stylesheet" href="./styles.css" />
        <script src="./script.js" defer></script>
    </head>
    <body>
        <main class="slide">
            <h1 class="reveal">Introduccion</h1>
        </main>
    </body>
</html>
```

## CSS minimo

```css
* {
    box-sizing: border-box;
}

html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
}

body {
    overflow: hidden;
}

.slide {
    display: grid;
    width: 1920px;
    height: 1080px;
    place-items: center;
    background: #ffffff;
    color: #111827;
    font: 4rem sans-serif;
}

.reveal {
    opacity: 0;
    transform: translateY(20px);
}

.is-active .reveal {
    animation: reveal 600ms ease-out forwards;
}

@keyframes reveal {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .reveal {
        opacity: 1;
        transform: none;
    }

    .is-active .reveal {
        animation: none;
    }
}
```

## JavaScript minimo

```js
const root = document.documentElement;
let activated = false;

function activate() {
    if (activated) return;
    activated = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.classList.add('is-active');
        return;
    }

    requestAnimationFrame(() => root.classList.add('is-active'));
}

window.addEventListener('web-deck:activate', activate, { once: true });

if (window.parent === window) {
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', activate, { once: true });
    } else {
        activate();
    }
}
```

Dentro del reproductor, `web-deck:activate` es la unica fuente de activacion. El respaldo con `DOMContentLoaded` se utiliza solamente al abrir el HTML de forma independiente. Esta regla es global y no depende de la plantilla visual.

## Runtimes locales de graficas

Las diapositivas pueden usar Chart.js o Apache ECharts sin depender de React. El runtime debe copiarse dentro del paquete solo cuando el deck incluya graficas:

```bash
node scripts/vendor-chart-runtime.mjs echarts presentations/<slug>/assets/vendor
```

Usa `chartjs` en lugar de `echarts` cuando corresponda. El comando copia el archivo minificado y su licencia a `assets/vendor/<library>/`. Registra la version, URL de origen, licencia y ruta en `assets/ATTRIBUTIONS.md`. No uses CDN ni incluyas runtimes en decks sin graficas.

Los datos, etiquetas, unidades, periodos, fuentes y alternativas textuales permanecen en el HTML. El runtime solo transforma esos datos en la representacion visual.

## Iconos

Phosphor Icons es la fuente predeterminada de la skill. `scripts/icon-catalog.json` contiene un nucleo curado de iconos generales por roles semanticos. Registra las selecciones aprobadas en `_working/icons.json` y ejecuta:

```powershell
npm run vendor:icons -- presentations/<slug>
```

El comando genera `assets/icons/icons.css`, copia solamente los SVG usados, incluye la licencia MIT y actualiza `assets/ATTRIBUTIONS.md`. Las diapositivas nunca dependen de `node_modules` durante la reproduccion.

Los iconos usan `currentColor` por defecto y permiten configurar el tamano y color en la plantilla o en cada elemento:

```html
<link rel="stylesheet" href="../../assets/icons/icons.css" />
<span
    class="deck-icon deck-icon--check"
    data-contrast-role="icon"
    aria-hidden="true"
></span>
```

```css
.slide {
    --icon-color: #1f2937;
    --icon-size: 56px;
}

.slide .deck-icon--check {
    --icon-color: #166534;
}
```

Una biblioteca alternativa usa un ID ASCII en `assets/icons/<library>/`, conserva su licencia en `assets/licenses/<library>.txt` y registra cada activo en `assets/icons/manifest.json`. Los archivos aportados por el usuario se guardan en `assets/icons/user/`:

```json
{
    "icons": [
        {
            "path": "assets/icons/lucide/check.svg",
            "source": "library",
            "library": "lucide",
            "version": "0.468.0",
            "license": "ISC",
            "sourceUrl": "https://lucide.dev"
        },
        {
            "path": "assets/icons/user/custom.svg",
            "source": "user",
            "providedByUser": true,
            "sha256": "<64 caracteres hexadecimales>"
        }
    ]
}
```

La procedencia declarada no sustituye los permisos o licencias aplicables. La skill no genera ni reconstruye iconos personalizados.

## Estructuras semanticas de academic-sober

Las diapositivas creadas con `academic-sober` declaran la plantilla y la estructura en `body`. Estos marcadores permiten aplicar limites de densidad y accesibilidad durante el empaquetado:

```html
<body data-template="academic-sober" data-slide-structure="pillars"></body>
```

Una composicion tematica contiene de dos a cuatro unidades y mantiene el orden tema, icono y descripcion:

En pilares, comparaciones, elementos narrativos y procesos, el CSS inicial debe centrar las cajas de esos elementos y su texto dentro de cada unidad. Usar los marcadores obligatorios como selectores según `docs/templates/academic-sober/foundations/hierarchy.md`: `[data-comparison-option]` no equivale a `.comparison-option`. Comprobar el marcado final después de cualquier transformación. El cuerpo centrado verticalmente no demuestra esta alineación horizontal y una omisión de iconos no exime al texto de centrado.

```html
<section class="thematic-units">
    <article data-thematic-unit>
        <h2 data-unit-topic>Trazabilidad</h2>
        <span
            class="deck-icon deck-icon--data-trend"
            data-contrast-role="icon"
            aria-hidden="true"
        ></span>
        <p data-unit-description>
            Registra el origen y el alcance de cada resultado.
        </p>
    </article>
</section>
```

Toda composición interna se centra verticalmente y no usa marco salvo que se haya seleccionado de forma explícita:

```html
<body
    data-template="academic-sober"
    data-slide-structure="comparison"
    data-frame="none"
>
    <main data-slide-body data-vertical-align="center">
        <section data-comparison>
            <article data-comparison-option>
                <h2 data-unit-topic>Control local</h2>
                <span
                    class="deck-icon deck-icon--shield-check"
                    aria-hidden="true"
                ></span>
                <p data-unit-description>
                    Conserva la operación dentro del equipo.
                </p>
            </article>
            <span data-comparison-connector>Frente a</span>
            <article data-comparison-option>
                <h2 data-unit-topic>Modelo híbrido</h2>
                <span
                    class="deck-icon deck-icon--share"
                    aria-hidden="true"
                ></span>
                <p data-unit-description>
                    Combina control interno con capacidad de escala.
                </p>
            </article>
        </section>
    </main>
</body>
```

Los procesos usan un `ol` horizontal de tres a cinco pasos sobre el mismo eje, con `data-process-step`, `data-step-number`, `data-step-title` y `data-step-description`. Numerar consecutivamente desde 1 en HTML visible, con ceros iniciales opcionales. La numeración basta para expresar continuidad: no incluir flechas, líneas ni capas de conectores. Incluir iconos semánticos por defecto en pasos, pilares, comparaciones y elementos narrativos; una omisión sigue `docs/templates/academic-sober/foundations/iconography.md` y queda declarada en `body` con `data-icons="none"` y un motivo permitido. Las explicaciones narrativas usan `data-narrative-copy` y de dos a cuatro `article` con `data-narrative-element`.

Las donas siguen el contrato completo de `docs/templates/academic-sober/slides/graficas/chart.md`. Cada sector anular es un `path` con ID, valor y etiqueta; cada entrada de leyenda tiene el mismo ID, etiqueta, porcentaje y color. El centro muestra el máximo y su categoría, incluidos los empates, nunca el total genérico. Derivar todos esos elementos y su geometría durante la autoría de una sola colección. `scripts/lib/donut-geometry.mjs` ofrece `createDonutGeometry`, función local sin dependencias externas, para calcular sectores acumulados y máximos; no es un runtime que deba copiarse a las slides.

Los fragmentos de código marcan cada línea con `data-code-line`, una región contigua con `data-code-focus`, su explicación con `data-code-note` y cada token con `data-code-token`. Las palabras clave, funciones, propiedades, cadenas, números, comentarios y puntuación deben diferenciarse con contraste suficiente y señales adicionales al color.

Cada línea contiene `data-code-number` con `aria-hidden="true"` y `data-code-content`. El `pre` declara `data-code-start` y `data-code-end`, coherentes con el metadato `data-code-range`. Usar una fila por línea, de una a dieciséis, con fuente de 22–28px e interlineado inicial de 1.35. El contenedor de filas usa `white-space: normal` y el contenido de cada línea `white-space: pre`, evitando filas accidentales entre elementos de bloque. Mantener números, nota y contador de diapositiva visibles dentro del lienzo.

En donas, mantener figura, leyenda y centro en un mismo `figure`, con una caja relativa para SVG y texto central. Aplicar CSS a los elementos reales, preferiblemente mediante sus marcadores. Verificar que el centro quepa dentro del hueco, la leyenda tenga campos separados y la alternativa `sr-only` tenga ocultación visual accesible efectiva. La guía resumida para usuarios es `docs/generation-requirements.md`.

Una diapositiva con relaciones reserva todo el cuerpo al diagrama. Mantiene nodos, etiquetas y descripciones en HTML, y usa SVG solamente para conectores y geometría funcional. Las variantes autorizadas son `architecture`, `workflow`, `sequence`, `data-flow`, `lifecycle`, `hierarchy` y `relationship-map`:

```html
<body data-template="academic-sober" data-slide-structure="system-diagram">
    <h1 id="diagram-title">La validación produce resultados trazables</h1>
    <figure
        data-slide-body
        data-vertical-align="center"
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
                data-to="validation"
            ></path>
            <path
                data-diagram-edge="publish"
                data-from="validation"
                data-to="result"
            ></path>
        </svg>
        <article data-diagram-node="input">Entrada</article>
        <article data-diagram-node="validation">Validación</article>
        <article data-diagram-node="result">Resultado</article>
        <span data-diagram-label data-for-edge="prepare">Prepara</span>
        <span data-diagram-label data-for-edge="publish">Publica</span>
        <figcaption id="diagram-description" class="visually-hidden">
            La entrada pasa por validación antes de producir el resultado.
        </figcaption>
    </figure>
</body>
```

Usa `process` para tres a cinco pasos lineales sin decisiones. Usa `system-diagram` para ramas, participantes, datos, estados, jerarquías o relaciones radiales. Usa `chart` cuando la pregunta dependa de magnitudes y `mixed-content` cuando el recurso visual no tenga relaciones complejas.

Los diagramas admiten de tres a siete nodos; `workflow` requiere al menos cuatro y `sequence` admite de dos a seis participantes y de tres a diez mensajes. Cada relación nueva declara un ID, origen y destino. Los diagramas heredados sin tipo conservan compatibilidad, pero todo contenido nuevo debe declarar `data-diagram-type`.

Centra el conjunto cuando use pocos nodos y escalona los elementos cuando una fila produzca conectores extensos. Las relaciones equivalentes mantienen longitudes uniformes, puntas compactas y etiquetas del mismo color que el trazo, siempre separadas de la línea, la punta y los nodos. Una mención superior opcional usa texto color tinta en cursiva, sin subrayado ni barra decorativa.

Phosphor es la fuente de iconos predeterminada. El usuario puede seleccionar otra biblioteca si sus activos se copian como SVG locales, su licencia es compatible y no necesita scripts, CDN, webfonts ni componentes durante la reproducción. Los iconos alternativos y los aportados por el usuario se registran en `assets/icons/manifest.json`; estos últimos incluyen su SHA-256. La skill nunca genera, redibuja ni aproxima iconos.

## Logos

No inventes ni simules logos. Usa un archivo proporcionado por el usuario o un recurso exacto de una fuente oficial verificable. Conserva sus proporciones y registra origen, licencia y reglas de marca en `assets/ATTRIBUTIONS.md`.

## Recursos pendientes

Cuando una diapositiva reserve un recurso visual que aun no exista, copia `public/resources/image-broken.svg` a `assets/placeholders/image-broken.svg` e incluye el marcador directamente en el HTML con texto alternativo y una etiqueta descriptiva. Armadillo PP in Web no inyecta este marcador durante la reproduccion.

El contenedor debe incluir `data-resource-status="pending"` y un feedback visible que comience con `Recurso pendiente:`. No ocultes ni sustituyas el marcador hasta disponer del recurso final.

## Notas

Las notas son archivos Markdown y permanecen fuera del iframe de la diapositiva.
