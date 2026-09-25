---
name: create-web-deck
description: Crea presentaciones HTML, CSS y JavaScript listas para ZIP que siguen deck.json, las reglas de seguridad, activos y plantillas de Armadillo PP in Web. Úsala cuando el usuario solicite diapositivas compatibles con Armadillo PP in Web.
---

# Crear una presentación web

Crea una presentación completa de Armadillo PP in Web, valídala y empaquétala como ZIP. Pregunta únicamente por información que el usuario no haya proporcionado. Carga `.agents/skills/create-web-deck/references/creation-workflow.md` antes de recopilar información; ese archivo es la fuente normativa del flujo de preguntas, correcciones y reanudación.

La creación, validación y entrega no requiere Python. No solicites su instalación ni introduzcas scripts Python como dependencia. Usa las herramientas oficiales del proyecto basadas en Node.js.

## Modalidad de trabajo y plantilla

Al iniciar una presentación nueva, resuelve primero el nombre obligatorio de trabajo y la carpeta de fuentes según el flujo. El nombre de carpeta no exige un título visible definitivo. Después pregunta si se trabajará:

- A partir de un tema
- A partir de documentos fuente
- A partir de un esquema de diapositivas

Si se solicita continuar o revisar una presentación existente, seguir la rama de reanudación sin pedir otro nombre de trabajo ni crear otra carpeta. Resolver esa elección antes de preparar carpetas cuando la intención sea ambigua.

Después descubre los manifiestos `docs/templates/*/template.md`:

- Lee solo cada manifiesto para obtener ID, nombre visible y resumen
- Presenta cada plantilla por nombre y resumen
- Permite seleccionar una plantilla o solicitar una dirección visual personalizada
- Tras la confirmación, carga solo el manifiesto seleccionado y sus módulos `always`
- Resuelve cada ruta relativa a la carpeta de la plantilla
- Rechaza rutas absolutas, barras invertidas, segmentos de recorrido y rutas fuera de la plantilla
- Mantén en esta skill las reglas de formato, seguridad, activos y salida; las plantillas definen decisiones visuales
- Si no existe la carpeta de plantillas, continúa con una dirección visual personalizada

Usa el manifiesto progresivamente:

1. Lee `structureIndex` al preparar el esquema
2. Asigna un ID de estructura a cada diapositiva propuesta
3. Tras aprobar el esquema, carga solo las estructuras distintas utilizadas
4. Carga un módulo `conditional` solo cuando su tema esté presente
5. No escanees ni concatentes todos los Markdown de la plantilla

Carga el módulo de diagramas cuando una diapositiva tenga nodos, conectores, flujo dirigido o relaciones explícitas. Las unidades independientes de icono y descripción no son diagramas relacionales.

Usa solo fuentes autorizadas para el trabajo actual. No consultes ni copies otras presentaciones como referencia de contenido, diseño o implementación salvo indicación explícita. La detección de colisiones, los ejemplos técnicos y las atribuciones históricas no conceden esa autorización. Sigue el flujo para decidir si subtítulos y temáticas se proponen desde fuentes, conversación o redacción del usuario.

Aplica los fundamentos y estructuras antes de escribir HTML/CSS: prepara una composición base conforme y sin separadores decorativos. No generes bordes para eliminarlos después mediante validación. La revisión final permanece obligatoria como control de regresiones.

## Cuestionario

Sigue íntegramente `references/creation-workflow.md`. No repitas sus preguntas en esta skill ni vuelvas a preguntar datos ya aportados. Toda aprobación, selección o dato debe solicitarse con `question` o su equivalente cuando esté disponible.

Confirma los resúmenes mediante secciones breves e independientes, con una pregunta por sección, confirmación o ajustes escritos y conservación de lo ya aprobado. No presentes el esquema completo en un modal ni solicites una aprobación global al terminar. Los límites de tamaño y el registro de versiones están definidos en el flujo.

## Salida

Deriva del nombre de trabajo obligatorio un slug ASCII en minúsculas con guiones, independiente del título visible. Rechaza recorrido, rutas absolutas, barras invertidas, slug vacío, `packages` y nombres de dispositivo de Windows. Mantén la raíz fija en `presentations/`.

```text
presentations/
  packages/
    <slug>.zip
  <slug>/
    _working/
      sources/
      structure/
    deck.json
    assets/
    diagrams/
    slides/
    notes/
```

Comprueba `presentations/<slug>/` y `presentations/packages/<slug>.zip` antes de crear o reemplazar. Pide confirmación para reemplazar, crear una nueva versión o cancelar. Comunica que `presentations/<slug>/_working/sources/` recibe fuentes y recursos, y que `presentations/<slug>/_working/structure/` recibe estructuras, guiones y esquemas. Ambas carpetas quedan fuera del ZIP. Las fuentes Mermaid aprobadas se promueven a `diagrams/` y sí se comparten. Usa `scripts/package-deck.mjs` para compilar, validar y empaquetar, incluyendo únicamente `deck.json`, `assets/`, `diagrams/`, `slides/` y `notes/`. Nunca incluyas `_working/` ni una carpeta contenedora del proyecto. Las entradas ZIP deben usar barras diagonales; en Windows no uses `Compress-Archive`.

## Estructura obligatoria de las diapositivas

Cada diapositiva nueva contiene:

```text
slides/001/index.html
slides/001/styles.css
slides/001/script.js
```

- Coloca todo texto visible y editable directamente en `index.html`, salvo el texto interno de un diagrama Mermaid, cuya fuente editable permanece en `diagrams/*.mmd`
- Enlaza CSS y JavaScript con rutas relativas; carga el script con `defer`
- No generes texto visible desde JavaScript ni desde `content` de CSS
- Limita JavaScript al comportamiento y activación de animaciones
- No crees botones de navegación, menús ni temporizadores dentro de las diapositivas
- Usa documentos HTML semánticos completos y viewport `1920x1080` salvo solicitud compatible distinta
- Respeta `prefers-reduced-motion`
- Usa `caption`, `thead`, `tbody` y encabezados con `scope` en tablas
- Usa SVG inline para gráficos sencillos y para la salida estática compilada de Mermaid
- Usa Chart.js o Apache ECharts solo como activos locales versionados cuando el esquema aprobado incluya gráficos; no uses CDN, D3 ni runtimes innecesarios
- Usa Mermaid únicamente como compilador de desarrollo: comparte la fuente `.mmd`, pero nunca copies, importes ni ejecutes Mermaid dentro de una diapositiva
- Mantén datos, etiquetas, unidades, periodos, fuentes y resumen textual en HTML
- Conserva una tabla semántica o alternativa textual cuando uses un runtime
- Trata el código mostrado como texto escapado e inerte; nunca lo evalúes ni lo importes

## Emojis

No uses caracteres emoji en textos, títulos, notas, `alt`, `title` ni etiquetas ARIA. No sustituyas iconos, diagramas o estados por emojis. El validador rechaza su presencia antes de crear el ZIP.

## Contraste y recursos

Todo texto visible debe ser legible contra su superficie. Exige 4.5:1 para texto normal, 3:1 para texto grande y 3:1 para iconos, bordes, marcas y gráficos relevantes. Usa `data-contrast-role="icon"` o `data-contrast-role="graphic"` para elementos no textuales relevantes. Usa `data-contrast-exempt="decorative"` solo para decoración real.

El empaquetador renderiza cada diapositiva y bloquea el ZIP si no puede verificar contraste o superficies. Prefiere superficies locales opacas y no coloques texto esencial sobre imágenes o efectos no verificables.

## Inmutabilidad de la plantilla

- Trata la plantilla seleccionada y sus archivos como solo lectura durante la creación
- Usa únicamente IDs del `structureIndex`
- No agregues estructuras, variantes, componentes, tokens ni reglas a la plantilla seleccionada
- Adapta, divide o simplifica contenido para una estructura existente
- Si ninguna estructura sirve, pregunta cómo adaptar el contenido; no amplíes la plantilla

## Ciclo de animación

Usa `web-deck:activate` como única fuente dentro de Armadillo PP in Web. La activación debe ser idempotente y nunca ocultar contenido ya visible. Usa `DOMContentLoaded` solo como respaldo independiente cuando `window.parent === window`, y registra primero el listener alojado.

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

## Iconos Phosphor

Usa Phosphor por defecto. La fuente local es `node_modules/@phosphor-icons/core/assets/` y `scripts/icon-catalog.json` contiene un catálogo curado. El usuario puede indicar un nombre Phosphor exacto, una descripción semántica o una URL oficial; no necesita colocar archivos manualmente.

1. Identifica objetos, acciones, estados o conceptos concretos
2. Asigna roles semánticos del catálogo cuando sea posible
3. Excluye categorías, leads y textos introductorios decorativos
4. En las unidades temáticas de `academic-sober`, incluye un icono semántico por defecto en cada par; omite el grupo únicamente según la decisión explícita documentada en iconografía
5. Propón nombres restantes y verifica que existan localmente
6. Presenta concepto, rol, nombre, peso y razón semántica
7. Solicita aprobación o cambios
8. Registra la selección en `_working/icons.json`
9. Ejecuta `npm run vendor:icons -- presentations/<slug>`
10. Referencia `assets/icons/icons.css` y clases o `data-icon` en el HTML

El peso predeterminado es `regular`; también se admiten `bold` y `duotone`. No uses letras en cajas ni fuerces iconos sin relación semántica. Nunca generes, dibujes, traces, combines, aproximes ni reconstruyas iconos. Los conectores, flechas, ejes y marcas funcionales no son iconos.

Carga iconografía cuando el esquema incluya pilares, comparaciones, elementos narrativos o procesos, antes de decidir sus recursos. La biblioteca predeterminada no sustituye la obligación de incluir los iconos de esas estructuras. Una omisión aprobada se marca en `body` con `data-icons="none"` y `data-icon-omission="user-request|no-semantic-match"`, eligiendo un solo valor; registrar también el motivo y la decisión en `_working/`.

El copiador admite nombres Phosphor locales seguros fuera del catálogo curado cuando la entrada de selección declara `approved: true`. Verificar su existencia y aprobación antes de copiar; nunca omitir silenciosamente un icono por un error del copiador.

Si Phosphor no está disponible, usa el repositorio oficial solo si existe acceso web; si no, marca el recurso como pendiente. Nunca uses CDN, webfont, script externo ni API de iconos en tiempo de ejecución.

Al usar Phosphor, copia la licencia MIT a `assets/licenses/phosphor-icons.txt`, registra fuente, versión y activos usados en `assets/ATTRIBUTIONS.md`, copia solo los SVG aprobados y configura `--icon-size` y `--icon-color`.

Las bibliotecas alternativas solo se usan después de selección explícita. Ofrece Phosphor, Lucide, Tabler Icons, Heroicons, Fluent UI System Icons, Bootstrap Icons, una fuente aportada por el usuario o ningún icono. Copia únicamente SVG estáticos locales, su licencia y atribuciones; registra cada activo en `assets/icons/manifest.json` con biblioteca, versión, licencia y URL HTTPS, y usa una biblioteca por diapositiva. Los iconos del usuario se guardan en `assets/icons/user/` con `source: "user"`, `providedByUser: true`, ruta empaquetada y SHA-256. Verifica que cada activo funcione sin runtime de biblioteca.

## Marcadores de plantilla

Cuando la plantilla los documente, coloca los marcadores directamente en el HTML. Para `academic-sober`:

```html
<body data-template="academic-sober" data-slide-structure="pillars"></body>
```

En pilares, comparaciones, elementos narrativos y procesos, centrar cajas y texto de tema, icono y descripción dentro de cada unidad; también cuando se omitan iconos explícitamente. Aplicar el bloque de CSS de `foundations/hierarchy.md` desde el inicio, usando los atributos semánticos como selectores. No confundir `.comparison-option` con `[data-comparison-option]` ni validar únicamente el centrado del icono.

En `pillars`, marca unidades con `data-thematic-unit`, `data-unit-topic` y `data-unit-description`, en orden tema, icono y descripción, salvo omisión explícita del grupo. No uses `data-thematic-unit` en comparaciones, procesos, elementos narrativos u otras estructuras. En toda diapositiva interna usa `data-slide-body` y `data-vertical-align="center"`; no uses marco salvo selección explícita; conserva contexto en oración, peso normal y cursiva; nunca uses `text-transform: uppercase`.

Comparaciones usan exactamente dos `data-comparison-option` y `data-comparison-connector`, sin barras, separadores ni tarjetas. Procesos usan una lista ordenada de tres a cinco `data-process-step` en un eje horizontal, con `data-step-number`, `data-step-title` y `data-step-description`. La numeración consecutiva desde 1 comunica el orden: no añadas flechas, líneas ni capas de conectores. Cada paso incluye un icono semántico por defecto; una omisión sigue la política explícita del grupo.

Elementos narrativos usan `data-narrative-copy`, `data-narrative-elements` y de dos a cuatro `data-narrative-element`, sin líneas separadoras. Donas usan el contrato completo de `slides/graficas/chart.md`: tipo obligatorio, tres a cinco sectores anulares `path` identificados, leyenda uno a uno, valores que suman 100 y centro con categoría y porcentaje máximos. Deriva geometría, colores y textos de una sola colección en la autoría; no uses un anillo de fondo ni el total genérico como centro. Código marca cada línea con `data-code-line`, una región contigua con `data-code-focus`, una anotación `data-code-note` y tokens `data-code-token`; diferencia palabras clave, funciones, variables, propiedades, cadenas, números, comentarios y puntuación, y mantiene los números de línea ocultos para tecnologías de asistencia.

El código usa de una a dieciséis filas visibles, cada una con `data-code-number` escrito en HTML y `aria-hidden="true"`, y `data-code-content` para los tokens. El rango `data-code-start`/`data-code-end` del `pre` coincide con `data-code-range`. Usar 22–28px e interlineado inicial 1.35, sin saltos literales que dupliquen filas en `<pre>`. La nota y el contador de diapositiva deben caber completos. Las donas también se verifican por tamaño físico, centro dentro del hueco, leyenda legible y ocultación accesible efectiva; tener los marcadores no basta.

## Diagramas Mermaid

Usa Mermaid para todo diagrama relacional, sin depender de la plantilla visual seleccionada. La fuente editable aprobada vive bajo `diagrams/`, incluye `accTitle` y `accDescr`, y se comparte en el ZIP. Cada diapositiva declara un objeto `diagram` en `deck.json` con motor, version exacta, tipo, ruta y SHA-256; su HTML usa `figure[data-diagram][data-diagram-engine="mermaid"]`, tipo, direccion de lectura, `aria-labelledby`, `aria-describedby` y un unico destino `data-diagram-output`.

Mermaid es solo un compilador de desarrollo. El SVG completo, saneado y estatico se inserta inline con `data-diagram-static`; el ZIP contiene la fuente `.mmd` y `diagrams/config.json`, pero nunca el runtime, D3, CDN ni descubrimiento de topologia durante la reproduccion. No edites el SVG: modifica la fuente o la configuracion cerrada y recompila. Rechaza configuracion embebida, enlaces, eventos, HTML activo, estilos arbitrarios y referencias externas. Mantiene `viewBox`, `preserveAspectRatio="xMidYMid meet"`, titulo y descripcion accesibles, y elimina dimensiones o `max-width` intrinsecos de Mermaid antes de ajustar el SVG al area disponible.

Despues de modificar cualquier `.mmd` de una presentacion existente, ejecuta inmediatamente `npm run compile:diagrams -- presentations/<slug>`. Hazlo antes de validar o empaquetar, aun cuando el empaquetador vuelva a compilar en memoria. El comando actualiza el SVG inline y el hash; si falla, corrige la fuente Mermaid, no el SVG generado.

## Integridad de marca

Nunca inventes, aproximes, traces, redibujes ni simules logos. Usa un activo proporcionado o una fuente oficial verificable. No sustituyas una marca por un icono, no la recolorees, recortes, deformes ni reorganices contra sus reglas. Registra origen, licencia y guía de marca en `assets/ATTRIBUTIONS.md`. Si no se puede confirmar autenticidad o permiso, marca el logo como pendiente.

## Recursos visuales pendientes

Cuando falte una imagen, logo, captura, diagrama o ilustración reservada:

1. Copia `public/resources/image-broken.svg` sin modificar a `assets/placeholders/image-broken.svg`
2. Referéncialo explícitamente en el HTML
3. Añade `alt` descriptivo y una leyenda visible
4. Marca el contenedor con `data-resource-status="pending"`
5. Usa feedback visible que comience con `Recurso pendiente:`
6. Conserva el marcador hasta recibir el recurso final

Si no existe el marcador fuente, informa del problema y no inventes uno. No modifiques Armadillo PP in Web para inyectarlo.

## Manifiesto, seguridad y entrega

Usa `references/deck.schema.json` como contrato de `deck.json`, con el manifiesto en la raíz del paquete y las diapositivas en orden. Usa activos locales, no cargues scripts externos, no llames APIs, WebSockets ni servicios de red, no crees formularios, ventanas emergentes ni descargas, declara hosts de imágenes y fuentes HTTPS en `externalResources`, conserva notas en Markdown y usa rutas relativas con barras diagonales. Cuando uses Chart.js o ECharts, copia una sola versión exacta a `assets/vendor/<library>/`, registra versión, URL, licencia y ruta en `assets/ATTRIBUTIONS.md`, y omite todos los runtimes si no hay gráficos. Mermaid permanece como dependencia de desarrollo con versión exacta; el paquete contiene `.mmd`, `diagrams/config.json` y SVG estático, nunca el runtime. Verifica límites de plantilla en gráficos, tablas, diagramas y código sin sacrificar legibilidad, escalas honestas ni estructura semántica. Valida el HTML final después de cualquier transformación o inyección de iconos; ninguna transformación puede eliminar texto aprobado.

Las reglas completas de seguridad están en `references/security-rules.md`. Antes del ZIP sigue `references/validation-checklist.md`: verifica archivos declarados, IDs únicos, rutas seguras, licencias, manifiesto, contraste, límites de plantilla, iconos, recursos pendientes, notas, movimiento y exclusión de `_working/`.
