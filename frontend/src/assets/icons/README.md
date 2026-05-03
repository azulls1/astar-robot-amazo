# `assets/icons/`

SVGs reutilizables que NO son íconos de marca (esos van en `logos/`)
y que prefieres tener como archivo en lugar de inline en un componente.

## Cuándo poner un ícono aquí

- Es muy grande o muy reutilizado y embebido inline ensucia los templates.
- Es un ícono de un set externo (Lucide, Tabler, Heroicons) que copiaste.
- Lo usas como `background-image` desde CSS.

## Cuándo NO ponerlo aquí

- Si es un ícono pequeño y simple usado en un solo componente: déjalo
  inline como `<svg>...</svg>` dentro del template (más fácil de
  estilizar con `currentColor`, no genera petición HTTP, mejor caché
  del HTML).

## Acceso

```html
<img src="/assets/icons/play.svg" alt="" aria-hidden="true" class="w-4 h-4" />
```

```css
.btn--play::before {
  background-image: url("/assets/icons/play.svg");
}
```

## Convenciones

- Sin `width`/`height` en el SVG: se controlan con CSS.
- Usar `stroke="currentColor"` o `fill="currentColor"` para que el color
  herede de su contenedor.
