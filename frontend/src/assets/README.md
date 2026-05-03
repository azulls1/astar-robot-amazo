# `src/assets/` — Recursos estáticos del frontend

Estos archivos se sirven en `/assets/...` cuando el frontend corre.
Configurado en `angular.json` (sección `architect.build.options.assets`).

## Estructura

```
assets/
├── images/        Fotos, capturas, ilustraciones, diagramas
├── logos/         Logos del producto, equipo, universidad, partners
└── icons/         SVG custom (preferimos íconos inline en componentes;
                    esta carpeta es para SVGs reutilizables o íconos
                    de marca que no son del set de Heroicons/Lucide)
```

## Cómo usarlos

Desde HTML:

```html
<img src="/assets/logos/forest-logo.svg" alt="Forest" />
<img src="/assets/images/tablero-inicial.png" alt="Estado inicial" />
```

Desde CSS:

```css
background-image: url("/assets/images/textura.png");
```

## Convenciones de nombrado

- Minúsculas, kebab-case: `team-1073f-logo.svg`, `tablero-objetivo.png`
- Sufijo de tamaño cuando hay variantes: `logo-32.png`, `logo-128.png`
- SVG preferido sobre PNG/JPG cuando aplique (escala mejor, ocupa menos)
- Comprimir PNG con `pngcrush` o similar antes de hacer commit
