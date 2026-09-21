# Guía de autoría de plantillas

Esta guía se aplica al trabajo de crear o mantener una plantilla visual reutilizable. No forma parte del cuestionario para crear una presentación.

## Recorrido

1. Definir el objetivo, la audiencia y el alcance visual
2. Revisar si una plantilla existente puede representar el caso
3. Separar reglas globales, fundamentos, estructuras y módulos condicionales
4. Revisar referencias, licencias, catálogo y activos permitidos
5. Definir el manifiesto `template.md` y sus rutas relativas seguras
6. Documentar cada estructura en `slides/index.md` y sus archivos específicos
7. Definir límites concretos, criterios de aceptación y comportamiento con movimiento reducido
8. Identificar dependencias con validadores, catálogo y skill
9. Revisar referencias cruzadas y contradicciones
10. Verificar una muestra renderizada a `1920x1080`

## Contrato de estructura

La plantilla debe respetar `docs/templates/README.md`. El manifiesto contiene identidad, resumen, viewport, índice y módulos `always` y `conditional`. Las reglas de formato, seguridad, activos y empaquetado pertenecen a `create-web-deck`, no a la plantilla.

Una estructura debe indicar cuándo usarla, cuándo evitarla, sus límites, activos esperados y ajustes permitidos. Debe usar un ID existente del índice y no crear variantes que oculten una nueva estructura.

## Mantenimiento

- No incluir instituciones, equipos, docentes o proyectos como valores predeterminados
- No fijar logos ni URLs como si fueran parte de la plantilla
- No duplicar reglas globales de seguridad, formato o empaquetado
- Mantener una fuente principal por regla y usar remisiones para evitar contradicciones
- Registrar referencias de terceros en `ATTRIBUTIONS.md` y sus licencias en `licenses/`
- Actualizar criterios de aceptación, catálogo y validadores cuando una regla cambie

## Aprobación

La revisión debe identificar reglas nuevas, contradicciones eliminadas, dependencias pendientes y evidencia renderizada. Si el cambio solo resuelve una presentación concreta, debe realizarse en el deck y no en la plantilla.
