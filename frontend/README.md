# Frontend — A\* Robot Amazon

Angular 20 standalone + Tailwind 4. Tres vistas:

| Ruta | Vista | Qué hace |
|---|---|---|
| `/solver` | Solver | Pulsa **Ejecutar A\***, muestra tablero, métricas, traza por iteración y secuencia óptima de 19 acciones. |
| `/entregables` | Entregables | Tarjetas de descarga (memoria DOCX, trazas, ZIPs) con tamaños y descripciones. |
| `/como-funciona` | Cómo funciona | Problema, modelado, heurística, A\*, arquitectura del sistema y rúbrica. |

## Desarrollo

```bash
npm install --legacy-peer-deps
npm start                                            # http://localhost:4200
```

El frontend espera un backend FastAPI corriendo en `http://localhost:8000`. Si lo
mueves, edita `src/environments/environment.ts`.

## Build de producción

```bash
npm run build
# Output: dist/astar-frontend/
```

En producción usa `src/environments/environment.prod.ts` que apunta a
`https://astar-api.iagentek.com.mx`.

## Estructura

```
src/
├── app/
│   ├── app.component.ts          # layout (header, nav, footer)
│   ├── app.config.ts             # providers (router, http)
│   ├── app.routes.ts             # routing con lazy loading
│   ├── components/
│   │   └── tablero.component.ts  # grid 4x4 con paredes, robot e inventarios
│   ├── pages/
│   │   ├── solver/
│   │   ├── entregables/
│   │   └── info/
│   └── services/
│       └── api.service.ts        # cliente HTTP del backend
├── environments/                 # dev / prod
├── index.html
├── main.ts
└── styles.css                    # @import "tailwindcss" + utilidades
```

## Tailwind 4

Config vía PostCSS (`.postcssrc.json`) — no necesita `tailwind.config.js`.
Tailwind 4 usa el plugin `@tailwindcss/postcss` y descubre clases por
defecto desde el árbol de fuentes.
