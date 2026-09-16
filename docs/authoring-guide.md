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

## Iconos

Phosphor Icons es la fuente predeterminada de la skill. El catalogo local se instala mediante `@phosphor-icons/core`. Cada presentacion copia solamente los SVG que utiliza a `assets/icons/phosphor/`; las diapositivas nunca dependen de `node_modules` durante la reproduccion.

## Logos

No inventes ni simules logos. Usa un archivo proporcionado por el usuario o un recurso exacto de una fuente oficial verificable. Conserva sus proporciones y registra origen, licencia y reglas de marca en `assets/ATTRIBUTIONS.md`.

## Recursos pendientes

Cuando una diapositiva reserve un recurso visual que aun no exista, copia `public/resources/image-broken.svg` a `assets/placeholders/image-broken.svg` e incluye el marcador directamente en el HTML con texto alternativo y una etiqueta descriptiva. Armadillo PP in Web no inyecta este marcador durante la reproduccion.

## Notas

Las notas son archivos Markdown y permanecen fuera del iframe de la diapositiva.
