# Iconografía

Phosphor es la fuente predeterminada y ofrece un núcleo curado en `scripts/icon-catalog.json`. El usuario puede seleccionar otra biblioteca compatible o aportar archivos propios. Este módulo define el tratamiento visual, la procedencia y los roles semánticos de todos los iconos usados con la plantilla.

## Procedencia obligatoria

- Usar Phosphor por defecto
- Admitir Lucide, Tabler, Heroicons u otra biblioteca solo cuando el usuario la seleccione de forma explícita
- Usar de una biblioteca alternativa solamente activos SVG locales; no cargar componentes, webfonts, scripts, CDN ni APIs de iconos
- Admitir iconos personalizados solamente como archivos aportados por el usuario
- No generar, dibujar, trazar, aproximar, combinar ni redibujar iconos mediante IA
- No extraer un icono de una captura ni reconstruirlo a partir de una referencia visual
- Si no existe un candidato con una relación semántica clara, consultar cómo adaptar la unidad o confirmar una omisión justificada; no omitir silenciosamente el grupo
- Registrar biblioteca, versión, URL de origen, licencia y rutas copiadas en `assets/ATTRIBUTIONS.md`
- Copiar la licencia aplicable a `assets/licenses/`
- Registrar bibliotecas alternativas e iconos del usuario en `assets/icons/manifest.json`

Los conectores, flechas, líneas de vida, ejes y formas funcionales de diagramas o gráficas no son iconos. Los logos y marcas se rigen por la política de integridad de marca de la skill y nunca se generan.

## Criterio semantico

- Usar un icono cuando represente un objeto, acción, estado o concepto identificable
- Un icono puede reforzar el reconocimiento del concepto del título; no necesita aportar un dato diferente. Omitir únicamente decoración sin relación semántica, no todo apoyo visual que tenga texto equivalente
- No usar iconos dentro de categorías, leads o textos introductorios
- No sustituir logos con iconos genéricos
- No usar letras encerradas como iconos
- No forzar un icono si no existe una relación semántica clara

## Consistencia

- En pilares, comparaciones, elementos narrativos y pasos de procesos, incluir un icono semántico por unidad de forma predeterminada
- Omitir el grupo solo por decisión explícita según la política siguiente; la alternativa «ninguno» no es una elección automática del generador
- Mantener una sola biblioteca y familia visual dentro de una diapositiva
- Usar el mismo tamaño y caja óptica para iconos pares
- Preferir trazo `bold` en pilares abiertos y `regular` en diagramas densos
- Mantener color monocromático salvo estados que necesiten diferenciación
- Definir `--icon-color` y `--icon-size` en el contenedor de la estructura
- Permitir sobreescrituras locales solamente cuando el icono conserve la jerarquía y el contraste
- Usar `duotone` solo cuando la opacidad secundaria conserve una relación visual legible
- En unidades temáticas, mantener el orden tema, icono y descripción
- En pilares, comparaciones, elementos narrativos y procesos, centrar la caja del icono respecto de su columna, tema y descripción según `hierarchy.md`; centrar la máscara o el dibujo dentro de una caja alineada a la izquierda no cumple esta regla
- Aplicar los rangos por estructura de `sizing.md` y las separaciones de `spacing.md`; mantener bandas equivalentes y ajustes ópticos coherentes entre pares

## Omisión explícita

La falta de una petición de iconos no es una omisión autorizada. Proponer recursos aunque se haya elegido el diseño recomendado y registrar su aprobación con la propuesta de contenido.

Si el usuario solicita no usarlos, o no existe correspondencia semántica después de revisar candidatos y acordar una adaptación, omitirlos en todo el grupo equivalente. Declarar en `body` `data-icons="none"` junto con `data-icon-omission="user-request"` o `data-icon-omission="no-semantic-match"`. Registrar el motivo y la decisión en `_working/`; los atributos permiten verificar la declaración, no demuestran por sí solos consentimiento.

Sin esos marcadores, el validador exige exactamente un `.deck-icon` en cada unidad. Una excepción para un concepto debe resolverse antes de generar; no elimina automáticamente los iconos de sus pares. No usar esta excepción para ocultar fallos de descarga, copia o estilo.

Portada, cierre, código, tablas y gráficas no requieren iconos decorativos. Los diagramas mantienen sus criterios específicos. La numeración del proceso sustituye conectores, no los iconos de los pasos.

## Roles recomendados

Usar roles del catálogo en lugar de fijar rutas de SVG en la estructura:

```text
status-positive | check-circle | regular | confirmación o resultado correcto
status-warning | warning | regular | advertencia o condición de riesgo
data-trend | trend-up | regular | evolución o mejora
concept | lightbulb | regular | idea o hallazgo
```

Las estructuras pueden recomendar roles; la skill confirma el nombre exacto, la biblioteca y la licencia antes de copiar el activo seleccionado durante el empaquetado.

Los procesos lineales comunican continuidad mediante números, no mediante un rol de flecha. No seleccionar ni copiar activos para conectores de `process`; los iconos de los pasos representan su contenido, no el paso al siguiente elemento.

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
