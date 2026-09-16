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

La skill portable para crear presentaciones se encuentra en `.agents/skills/create-web-deck`.

Phosphor Icons esta disponible localmente mediante `@phosphor-icons/core`. La skill copia a cada presentacion solamente los SVG confirmados por el usuario.
