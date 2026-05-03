import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { InfoModalComponent } from './shared/info-modal.component';

interface NavItem {
  ruta: string;
  etiqueta: string;
  icono: string;
}

interface NavGroup {
  titulo: string;
  items: NavItem[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, InfoModalComponent],
  template: `
    <!-- App Shell · patrón documentado en design-system/docs/07-layout.md -->
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar fijo izquierdo (oculto en mobile) -->
      <aside
        class="sidebar hidden lg:flex lg:flex-col"
        aria-label="Navegación principal"
      >
        <!-- Brand del producto -->
        <a
          routerLink="/dashboard"
          class="flex items-center gap-3 px-4 h-[60px] border-b border-fog/30"
        >
          <div
            class="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-forest shrink-0"
          >
            A*
          </div>
          <div class="leading-tight min-w-0">
            <p class="text-sm font-semibold text-forest truncate">
              A* Robot Amazon
            </p>
            <p class="text-[11px] text-moss truncate">
              A* + Manhattan · Actividad 1
            </p>
          </div>
        </a>

        <!-- Grupos de navegación -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          @for (grupo of grupos; track grupo.titulo) {
            <div>
              <p class="sidebar-section-title">{{ grupo.titulo }}</p>
              <div class="flex flex-col gap-0.5">
                @for (item of grupo.items; track item.ruta) {
                  <a
                    [routerLink]="item.ruta"
                    routerLinkActive="active"
                    class="sidebar-link"
                  >
                    <span
                      class="sidebar-link__icon"
                      [innerHTML]="item.icono"
                    ></span>
                    <span>{{ item.etiqueta }}</span>
                  </a>
                }
              </div>
            </div>
          }
        </nav>

        <!-- Pie del sidebar: identidad del equipo -->
        <div class="px-4 py-3.5 border-t border-fog/30">
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-md bg-evergreen text-white flex items-center justify-center text-[10px] font-bold shrink-0"
            >
              1073F
            </div>
            <div class="leading-tight min-w-0">
              <p class="text-[13px] font-semibold text-forest truncate">
                Equipo 1073F
              </p>
              <p class="text-[11px] text-moss truncate">
                Maestría · UNIR 2026
              </p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Columna de contenido a la derecha del sidebar -->
      <div class="flex-1 lg:ml-[240px] flex flex-col min-w-0">
        <!-- Navbar -->
        <header class="navbar px-4 lg:px-6">
          <div class="flex items-center justify-between min-h-[60px]">
            <!-- Mobile: brand visible solo en mobile (sidebar está oculto) -->
            <a
              routerLink="/dashboard"
              class="flex items-center gap-2 lg:hidden"
            >
              <div
                class="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-forest"
              >
                A*
              </div>
              <span class="text-sm font-semibold text-forest">
                A* Robot Amazon
              </span>
            </a>

            <!-- Desktop: contexto de la asignatura/actividad -->
            <div class="hidden lg:flex flex-col leading-tight">
              <span
                class="text-[10px] font-semibold uppercase tracking-wider text-pine"
              >
                Razonamiento y planificación automática
              </span>
              <span class="text-sm font-semibold text-forest mt-0.5">
                Actividad 1 · A\* + Distancia de Manhattan
              </span>
            </div>

            <!-- Acciones derecha -->
            <div class="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener"
                class="btn btn-icon"
                title="Repositorio"
                aria-label="Repositorio"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.9.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17a10.95 10.95 0 015.76 0c2.2-1.48 3.16-1.17 3.16-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.7 5.36-5.27 5.65.41.35.78 1.04.78 2.1 0 1.51-.01 2.73-.01 3.1 0 .3.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"
                  />
                </svg>
              </a>
              <a
                routerLink="/entregables"
                class="btn btn-secondary hidden sm:inline-flex"
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                  />
                </svg>
                Entregables
              </a>
            </div>
          </div>
        </header>

        <!-- Contenido de página -->
        <main class="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fadeIn">
          <div class="max-w-7xl mx-auto">
            <router-outlet />
          </div>
        </main>

        <!-- Footer (patrón del DS · 04-navigation.md, estilo Etiquetador) -->
        <footer class="app-footer">
          <p class="app-footer__main">
            A* Robot Amazon — Razonamiento y Planificación Automática — UNIR 2026
          </p>
          <p class="app-footer__credits">
            Desarrollado por Adonai Samael Hernandez Mata, Diego Alfonso Najera
            Ortiz, Mauricio Alberto Alvares Aspeitia, Cesar Ivan Martinez Perez
            — Maestría en Inteligencia Artificial
          </p>
        </footer>
      </div>

      <!-- Modal global de información enriquecida -->
      <app-info-modal />
    </div>
  `,
})
export class AppComponent {
  grupos: NavGroup[] = [
    {
      titulo: 'Principal',
      items: [
        {
          ruta: '/dashboard',
          etiqueta: 'Dashboard',
          icono: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/></svg>`,
        },
        {
          ruta: '/solver',
          etiqueta: 'Solver A*',
          icono: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/></svg>`,
        },
      ],
    },
    {
      titulo: 'Algoritmo',
      items: [
        {
          ruta: '/heuristica',
          etiqueta: 'Heurística',
          icono: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M3 12h18M3 18h12"/></svg>`,
        },
        {
          ruta: '/iteraciones',
          etiqueta: 'Iteraciones',
          icono: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v6h6M20 20v-6h-6M5 13a8 8 0 0014.5 4M19 11a8 8 0 00-14.5-4"/></svg>`,
        },
      ],
    },
    {
      titulo: 'Entrega',
      items: [
        {
          ruta: '/entregables',
          etiqueta: 'Entregables',
          icono: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4 8 4 8-4zM4 7v10l8 4M20 7v10l-8 4M12 11v10"/></svg>`,
        },
        {
          ruta: '/como-funciona',
          etiqueta: 'Cómo funciona',
          icono: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 110-20 10 10 0 010 20z"/></svg>`,
        },
      ],
    },
  ];
}
