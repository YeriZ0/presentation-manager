# Plantillas visuales

Cada subcarpeta directa representa una plantilla seleccionable por la skill `create-web-deck`. La skill descubre solamente archivos `docs/templates/*/template.md` y usa cada uno como manifiesto.

Una plantilla define apariencia y composicion. El formato `web-deck`, la seguridad, la estructura de salida, los recursos y el empaquetado pertenecen a la skill.

## Estructura requerida

```text
docs/templates/<id>/
  template.md
  foundations/
    palette-and-type.md
    sizing.md
    spacing.md
    hierarchy.md
    iconography.md
    content-density.md
    motion.md
  structures/
    index.md
    cover.md
    closing.md
    <other-structures>.md
```

`template.md` debe incluir un bloque YAML con estos campos:

```yaml
id: stable-kebab-case-id
name: Visible name
summary: Short selector description
viewport: 1920x1080
structureIndex: structures/index.md
always:
  - foundations/palette-and-type.md
  - foundations/sizing.md
  - foundations/spacing.md
  - foundations/hierarchy.md
conditional:
  icons: foundations/iconography.md
  density: foundations/content-density.md
  motion: foundations/motion.md
```

Las rutas son relativas a la carpeta de la plantilla y deben usar barras diagonales.

## Responsabilidades

- `template.md`: identidad, resumen, audiencia, preguntas adicionales y mapa de dependencias
- `palette-and-type.md`: colores, contraste, superficies y familias tipograficas
- `sizing.md`: escala tipografica, iconos, logos, bordes y medidas del viewport
- `spacing.md`: escala espacial, margenes, proximidad y distribucion vertical
- `hierarchy.md`: orden de lectura, niveles visuales y reglas de enfasis
- `iconography.md`: criterio semantico, consistencia y pesos recomendados
- `content-density.md`: limites para texto, listas, tablas, pasos y referencias
- `motion.md`: ritmo visual especifico de la plantilla
- `structures/index.md`: catalogo corto para elegir una composicion
- `structures/*.md`: reglas completas de una sola composicion

## Carga selectiva

1. Descubrir y leer solo los manifiestos para construir el selector.
2. Cargar los modulos `always` despues de seleccionar la plantilla.
3. Leer el indice de estructuras al preparar el esquema de diapositivas.
4. Leer solamente la estructura asignada a cada diapositiva.
5. Leer un modulo `conditional` solo cuando la presentacion lo necesite.

Una estructura debe indicar cuando usarla, cuando evitarla, limites propios, activos esperados y ajustes permitidos. No debe repetir los fundamentos compartidos.

## Reglas

- Usar un ID ASCII estable en kebab-case
- No incluir instituciones, equipos, docentes o proyectos como valores predeterminados
- No fijar logos ni URLs de recursos
- No duplicar reglas globales de manifiesto, seguridad, activos o empaquetado
- No recomendar scripts externos, APIs, CDN o controles de navegacion internos
- No definir marcadores para recursos pendientes
- No imponer una biblioteca de iconos; usar la biblioteca global y definir solamente roles y tratamiento visual
- Mantener `1920x1080` como viewport recomendado salvo necesidad confirmada
- Indicar limites concretos para prevenir desbordamientos
- Definir el comportamiento con movimiento reducido
- Mantener cada archivo enfocado en una sola responsabilidad

## Descubrimiento

Agregar una carpeta valida con `template.md` es suficiente para mostrar una plantilla en el selector. La ruta `/catalog/academic-sober/` es solamente una referencia visual manual y no participa en el descubrimiento, generacion ni empaquetado de diapositivas.
