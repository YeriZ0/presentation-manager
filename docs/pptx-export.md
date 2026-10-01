# Exportación a PowerPoint

## Uso

Una presentación importada muestra «Exportar a PowerPoint» en la pantalla previa y en el menú del reproductor. Se genera un solo `.pptx` con todas las diapositivas del manifiesto, en orden y a partir del estado final renderizado. La descarga sucede en el navegador; los archivos del ZIP no se envían a un servidor.

`npm run dev` y `npm run build` preparan automáticamente el bundle y la licencia MIT de `dom-to-pptx` en `public/generated/pptx/`. El runtime se construye desde la versión exacta registrada en `package-lock.json`, su SHA-256 y procedencia se guardan en `manifest.json`, y el directorio generado está excluido de Git.

## Contenido y límites

- Texto, listas, formas CSS y tablas se reconstruyen como objetos PowerPoint cuando los admite `dom-to-pptx`
- Los SVG se mantienen como vectores; pueden convertirse en formas desde PowerPoint, pero no se promete edición nodo a nodo
- Los iconos mostrados mediante máscaras CSS se convierten en PNG transparentes a triple resolución, conservando la silueta y el color. Se editan como imágenes, no como formas vectoriales
- Canvas, incluidos gráficos de Chart.js y ECharts, se exportan como imágenes
- Las notas Markdown del deck se incorporan como notas del presentador
- Las fuentes locales declaradas con `@font-face` y recursos de fuente `data:` compatibles se incrustan en el archivo
- Se captura una composición estática final; el JavaScript interactivo no se exporta
- Las animaciones finitas se completan en el frame temporal; las infinitas se congelan
- CSS avanzado, pseudo-elementos no textuales, recortes, fuentes externas/ausentes, contenido externo y métricas tipográficas pueden diferir
- El motor crea todo el PPTX en memoria y no ofrece codificación por streaming

Para datos asíncronos que aparecen después de activar una diapositiva, el deck puede escuchar `web-deck:export-prepare` y registrar el trabajo asíncrono con `event.detail.waitUntil(promise)`. Consulta el [contrato de autoría](authoring-guide.md#preparacion-opcional-para-exportar-a-powerpoint).

Los hosts externos siguen sujetos a la política del deck, CORS y disponibilidad de red. Se recomienda que el ZIP incluya imágenes, fuentes y demás recursos para obtener una exportación reproducible sin conexión.

## Arquitectura y seguridad

`PptxExportProvider` crea una sesión compartida por la pantalla previa y el reproductor. El servicio coordina un renderer secuencial, un encoder y un downloader independientes. El estado observable mantiene solamente fase y progreso, no DOM, archivos binarios ni URLs temporales.

El renderer crea un filesystem temporal y frames fuente con `sandbox="allow-scripts"`. El puente de captura devuelve HTML con estilos calculados y cajas medidas respecto de la raíz, elimina scripts y atributos activos, convierte canvas y máscaras de iconos origin-clean en imágenes y conserva texto/SVG. Las notas se leen en el padre.

La reconstrucción fija las coordenadas medidas para no volver a distribuir los elementos con Flexbox o Grid. Mantiene el centrado del texto y de los textos centrados mediante Flexbox, resta los bordes del contenedor al posicionar hijos y normaliza las referencias locales de SVG, incluidos gradientes y clips. Las transformaciones complejas y los cambios de métricas entre fuentes de navegador y de Office todavía requieren comparación visual.

Un frame dedicado recibe los snapshots reconstruidos y carga el bundle local en un contexto con CSP restrictiva. `dom-to-pptx` ejecuta `exportToPptx` una sola vez para el deck completo. Los bytes regresan al padre para descargar; al cancelar la codificación se destruye el frame. En todos los casos se revocan URLs y se eliminan frames temporales.

El runtime se prepara desde `scripts/vendor-pptx-runtime.mjs`. Para prepararlo explícitamente después de una instalación:

```powershell
npm run vendor:pptx
```

## Pruebas

Las pruebas unitarias existentes cubren contratos, estado, coordinación y descarga:

```powershell
npm test
```

Para comprobar visualmente una exportación, importa un ZIP y prueba «Exportar a PowerPoint» desde la pantalla previa y desde el menú del reproductor. Abre el resultado en PowerPoint y compara posiciones, alineación, iconos y notas con la presentación HTML.

La primera versión no incorpora configuración ni pruebas E2E con Playwright. Consulta el [plan](../plans/pptx-export.md) para el registro de implementación.
