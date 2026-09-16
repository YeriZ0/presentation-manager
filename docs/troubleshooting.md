# Troubleshooting

## `deck.json must be at the ZIP root`

Compress the files inside the presentation folder, not the presentation folder itself.

## `Missing slide file`

Check that the path in `slides[].source` matches the ZIP path exactly, including case.

## An image is missing

Use a relative path from the slide HTML file. For example, from `slides/001/index.html`, an asset at `assets/photo.jpg` is `../../assets/photo.jpg`.

## An external font does not load

Declare its stylesheet and font hosts in `externalResources`, or copy the font into the ZIP.

## A network request fails

Network APIs are intentionally blocked in the first version. Move the data into the package before presenting.

## Flash negro al cambiar de diapositiva

El reproductor conserva el `iframe` ya pintado y funde la diapositiva nueva encima cuando esta emite `web-deck:ready`. El cambio usa `opacity` y `transform` para evitar exponer el fondo durante la carga. Si ves un parpadeo, verifica que la diapositiva espere `web-deck:activate`, que no se active tambien durante `DOMContentLoaded` dentro del reproductor y que respete `prefers-reduced-motion`.
