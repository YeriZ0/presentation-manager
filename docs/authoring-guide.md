# Authoring guide

Las presentaciones creadas en este proyecto se guardan en `presentations/<slug>/`. La carpeta `examples/` contiene solamente referencias y paquetes de prueba.

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

Para empaquetar una carpeta ya creada, ejecuta `npm run package:deck -- presentations/<slug> presentations/packages/<slug>.zip`. El comando valida `deck.json`, incluye solamente `deck.json`, `assets/`, `slides/` y `notes/`, y rechaza runtimes de graficas no utilizados o faltantes.

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

Los procesos usan un `ol` horizontal de tres a cinco pasos sobre el mismo eje, marcadores `data-process-step`, `data-step-number`, `data-step-title` y `data-step-description`, además de una capa `data-process-connectors` con copias pequeñas y alineadas de una misma flecha aprobada. Phosphor `arrow-fat-right` es el valor predeterminado; una biblioteca elegida por el usuario puede aportar un equivalente. Cada flecha declara el nombre exacto mediante `data-process-arrow`. Las explicaciones narrativas usan `data-narrative-copy` y de dos a cuatro `article` con `data-narrative-element`.

Las donas declaran `data-chart-type="donut"`; cada segmento usa `data-chart-segment` y `data-value`, y su entrada equivalente usa `data-chart-legend`. Los valores deben sumar 100 y la geometría se deriva de la misma fuente de datos que la leyenda.

Los fragmentos de código marcan cada línea con `data-code-line`, una región contigua con `data-code-focus`, su explicación con `data-code-note` y cada token con `data-code-token`. Las palabras clave, funciones, propiedades, cadenas, números, comentarios y puntuación deben diferenciarse con contraste suficiente y señales adicionales al color.

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
