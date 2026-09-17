# Iconografia

La biblioteca global usa Phosphor y ofrece un nucleo curado en `scripts/icon-catalog.json`. Este modulo define solamente el tratamiento visual de los iconos y sus roles semanticos.

## Criterio semantico

- Usar un icono cuando represente un objeto, accion, estado o concepto identificable
- Omitirlo cuando solo repita un titulo o rellene espacio
- No usar iconos dentro de categorias, leads o textos introductorios
- No sustituir logos con iconos genericos
- No usar letras encerradas como iconos
- No forzar un icono si no existe una relacion semantica clara

## Consistencia

- Los elementos equivalentes usan todos iconos o ninguno
- Mantener una sola biblioteca y peso dentro de una diapositiva
- Usar el mismo tamano y caja optica para iconos pares
- Preferir trazo `bold` en pilares abiertos y `regular` en diagramas densos
- Mantener color monocromatico salvo estados que necesiten diferenciacion
- Definir `--icon-color` y `--icon-size` en el contenedor de la estructura
- Permitir sobreescrituras locales solamente cuando el icono conserve la jerarquia y el contraste
- Usar `duotone` solo cuando la opacidad secundaria conserve una relacion visual legible
- En unidades tematicas, mantener el orden tema, icono y descripcion

## Roles recomendados

Usar roles del catalogo en lugar de fijar rutas de SVG en la estructura:

```text
status-positive | check-circle | regular | confirmacion o resultado correcto
status-warning | warning | regular | advertencia o condicion de riesgo
data-trend | trend-up | regular | evolucion o mejora
process-next | arrow-fat-right | bold | continuidad visible entre etapas
concept | lightbulb | regular | idea o hallazgo
```

Las estructuras pueden recomendar roles; la skill confirma el nombre exacto y copia el activo seleccionado durante el empaquetado.

## Mapeo requerido

Antes de copiar activos, registrar:

```text
Concepto | Nombre del icono | Peso | Razon semantica
```

Verificar el archivo exacto antes de aprobarlo. Copiar solo los iconos utilizados.

## Accesibilidad

- Usar `aria-hidden="true"` cuando un icono implementado con `span` repita el texto adyacente
- Proporcionar un nombre accesible cuando el icono aporte informacion no expresada por el texto
- Mantener al menos 3:1 de contraste para iconos necesarios para comprender el contenido
- No comunicar una diferencia solamente mediante forma o color
