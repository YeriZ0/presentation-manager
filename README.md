# Armadillo PP in Web

Reproductor local de presentaciones creadas con HTML, CSS y JavaScript.

## Requisitos

- Node.js compatible con Vite 7
- npm
- Chrome o Edge actual

## Desarrollo

```powershell
npm install
npm run dev
```

La galeria visual de la plantilla Academica sobria se consulta manualmente en `http://localhost:5173/catalog/academic-sober/`.

## Verificacion

```powershell
npm run format:check
npm test
npm run lint
npm run build
```

Las pruebas E2E estan declaradas en `tests/e2e`. Para ejecutarlas manualmente:

```powershell
npx playwright install chromium
npm run test:e2e
```

## Presentaciones

Importa un ZIP que contenga `deck.json` en la raiz. Consulta `docs/presentation-format.md` y `examples/valid-basic` para conocer la estructura.

Las presentaciones creadas con la skill se guardan en `presentations/<slug>/` y sus paquetes en `presentations/packages/`. `examples/` queda reservado para referencias y pruebas.

Para validar y empaquetar una presentacion existente sin incluir `_working/`:

```powershell
npm run package:deck -- presentations/<slug> presentations/packages/<slug>.zip
```

El empaquetado requiere Chromium de Playwright para comprobar el contraste renderizado. Instálalo con `npx playwright install chromium`.

El núcleo de iconos Phosphor se consulta en `scripts/icon-catalog.json`. Usa `npm run vendor:icons -- presentations/<slug>` para copiar únicamente los iconos aprobados y generar su CSS configurable.

La skill portable para crear presentaciones se encuentra en `.agents/skills/create-web-deck`.

Phosphor Icons esta disponible localmente mediante `@phosphor-icons/core`. La skill copia a cada presentacion solamente los SVG confirmados por el usuario.
