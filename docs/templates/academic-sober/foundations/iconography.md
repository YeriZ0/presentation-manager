# Iconografía

Phosphor es la fuente predeterminada y ofrece un núcleo curado en `scripts/icon-catalog.json`. El usuario puede seleccionar otra biblioteca compatible o aportar archivos propios. Este módulo define el tratamiento visual, la procedencia y los roles semánticos de todos los iconos usados con la plantilla.

## Procedencia obligatoria

- Usar Phosphor por defecto
- Admitir Lucide, Tabler, Heroicons u otra biblioteca solo cuando el usuario la seleccione de forma explícita
- Usar de una biblioteca alternativa solamente activos SVG locales; no cargar componentes, webfonts, scripts, CDN ni APIs de iconos
- Admitir iconos personalizados solamente como archivos aportados por el usuario
- No generar, dibujar, trazar, aproximar, combinar ni redibujar iconos mediante IA
- No extraer un icono de una captura ni reconstruirlo a partir de una referencia visual
- Si no existe un activo aprobado con una relación semántica clara, omitir el icono o solicitarlo al usuario
- Registrar biblioteca, versión, URL de origen, licencia y rutas copiadas en `assets/ATTRIBUTIONS.md`
- Copiar la licencia aplicable a `assets/licenses/`
- Registrar bibliotecas alternativas e iconos del usuario en `assets/icons/manifest.json`

Los conectores, flechas, líneas de vida, ejes y formas funcionales de diagramas o gráficas no son iconos. Los logos y marcas se rigen por la política de integridad de marca de la skill y nunca se generan.

## Criterio semantico

- Usar un icono cuando represente un objeto, acción, estado o concepto identificable
- Omitirlo cuando solo repita un título o rellene espacio
- No usar iconos dentro de categorías, leads o textos introductorios
- No sustituir logos con iconos genéricos
- No usar letras encerradas como iconos
- No forzar un icono si no existe una relación semántica clara

## Consistencia

- Los elementos equivalentes usan todos iconos o ninguno
- Mantener una sola biblioteca y familia visual dentro de una diapositiva
- Usar el mismo tamaño y caja óptica para iconos pares
- Preferir trazo `bold` en pilares abiertos y `regular` en diagramas densos
- Mantener color monocromático salvo estados que necesiten diferenciación
- Definir `--icon-color` y `--icon-size` en el contenedor de la estructura
- Permitir sobreescrituras locales solamente cuando el icono conserve la jerarquía y el contraste
- Usar `duotone` solo cuando la opacidad secundaria conserve una relación visual legible
- En unidades temáticas, mantener el orden tema, icono y descripción

## Roles recomendados

Usar roles del catálogo en lugar de fijar rutas de SVG en la estructura:

```text
status-positive | check-circle | regular | confirmación o resultado correcto
status-warning | warning | regular | advertencia o condición de riesgo
data-trend | trend-up | regular | evolución o mejora
process-next | arrow-fat-right | bold | continuidad visible entre etapas
concept | lightbulb | regular | idea o hallazgo
```

Las estructuras pueden recomendar roles; la skill confirma el nombre exacto, la biblioteca y la licencia antes de copiar el activo seleccionado durante el empaquetado.

## Mapeo requerido

Antes de copiar activos, registrar:

```text
Concepto | Biblioteca o usuario | Nombre o archivo | Peso | Razón semántica
```

Verificar el archivo exacto antes de aprobarlo. Copiar solo los iconos utilizados. Un archivo personalizado debe existir antes de la generación y quedar registrado como aportado por el usuario, junto con su SHA-256, en `assets/icons/manifest.json`.

## Accesibilidad

- Usar `aria-hidden="true"` cuando un icono implementado con `span` repita el texto adyacente
- Proporcionar un nombre accesible cuando el icono aporte información no expresada por el texto
- Mantener al menos 3:1 de contraste para iconos necesarios para comprender el contenido
- No comunicar una diferencia solamente mediante forma o color
