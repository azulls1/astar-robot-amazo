import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { InfoModalService } from '../../shared/info-modal.service';
import {
  KPI_COSTE,
  KPI_ITERACIONES,
  RUB_F,
  RUB_LISTAS,
  RUB_LOGICA,
  RUB_SECUENCIA,
} from '../../shared/info-content';
import { ModalConfig } from '../../shared/info-modal.types';

type EstadoApi = 'comprobando' | 'ok' | 'error';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="space-y-6">
      <!-- HERO grande -->
      <div
        class="card-hero animate-fadeInUp relative overflow-hidden"
        style="min-height: 28rem;"
      >
        <div class="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle mb-6">
            <span class="w-2 h-2 rounded-full bg-pine animate-pulse"></span>
            <span class="text-xs font-medium text-fog tracking-wider">
              RAZONAMIENTO Y PLANIFICACIÓN AUTOMÁTICA — UNIR 2026
            </span>
          </div>

          <h1
            class="font-display text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight"
          >
            A* Robot Amazon
          </h1>
          <h2 class="font-display text-xl sm:text-2xl text-fog/90 mb-5">
            Búsqueda heurística + Distancia de Manhattan
          </h2>

          <p class="text-sm sm:text-base text-fog/80 max-w-2xl mx-auto leading-relaxed">
            Robot autónomo que reorganiza tres inventarios en un almacén Amazon
            (matriz 4×4 con paredes) usando A* con heurística admisible. Solución
            óptima garantizada en <strong class="text-white">19 acciones</strong>.
          </p>

          <p class="text-xs text-fog/60 mt-3 max-w-xl mx-auto">
            Actividad de la asignatura "Razonamiento y planificación automática" —
            Maestría en Inteligencia Artificial — UNIR 2026
          </p>

          <div class="mt-8">
            <p class="font-display text-lg font-semibold text-white mb-2">Equipo 1073F</p>
            <p class="text-sm text-fog/80">
              Adonai Samael Hernandez Mata · Diego Alfonso Najera Ortiz · Mauricio
              Alberto Alvares Aspeitia · Cesar Ivan Martinez Perez
            </p>
          </div>
        </div>
      </div>

      <!-- API status banner -->
      <div
        class="alert animate-fadeInUp"
        [ngClass]="{
          'alert-success': estadoApi() === 'ok',
          'alert-warning': estadoApi() === 'comprobando',
          'alert-error': estadoApi() === 'error',
        }"
      >
        <div class="alert__icon">
          @if (estadoApi() === 'ok') {
            <span class="w-2.5 h-2.5 rounded-full bg-pine animate-pulse"></span>
          } @else if (estadoApi() === 'comprobando') {
            <span class="loading-dots"
              ><span></span><span></span><span></span
            ></span>
          } @else {
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
              />
            </svg>
          }
        </div>
        <div class="alert__content">
          @if (estadoApi() === 'ok') {
            <strong>API conectada y funcionando correctamente</strong> — backend en
            <code class="tag ml-1">{{ apiUrl }}</code>
          } @else if (estadoApi() === 'comprobando') {
            Comprobando conexión con el backend…
          } @else {
            <strong>Backend no responde.</strong> Verifica que el servicio esté
            corriendo en <code class="tag ml-1">{{ apiUrl }}</code>
          }
        </div>
      </div>

      <!-- KPIs principales (clickeables → modal con info enriquecida) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <button
          type="button"
          class="card-stat hover-lift animate-fadeInUp clickable text-left"
          aria-label="Ver detalle del estado del solver"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="card-stat__label">Estado</p>
            <span class="badge badge-active">Listo</span>
          </div>
          <p class="card-stat__value text-pine !text-xl">Operativo</p>
          <p class="card-stat__desc">Solver disponible</p>
        </button>

        <button
          type="button"
          (click)="abrir(KPI_COSTE, $event)"
          class="card-stat hover-lift animate-fadeInUp clickable text-left"
          aria-label="Ver detalle del coste óptimo"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="card-stat__label">Coste óptimo</p>
            <svg
              class="w-4 h-4 text-pine"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p class="card-stat__value gradient-text">19</p>
          <p class="card-stat__desc">acciones óptimas</p>
        </button>

        <button
          type="button"
          (click)="abrir(KPI_ITERACIONES, $event)"
          class="card-stat hover-lift animate-fadeInUp clickable text-left"
          aria-label="Ver detalle de iteraciones"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="card-stat__label">Iteraciones</p>
            <span class="text-pine font-mono text-xs">A*</span>
          </div>
          <p class="card-stat__value">323</p>
          <p class="card-stat__desc">nodos expandidos</p>
        </button>

        <div class="card-stat hover-lift animate-fadeInUp">
          <div class="flex items-center justify-between mb-2">
            <p class="card-stat__label">Tests</p>
            <span class="badge badge-active">100%</span>
          </div>
          <p class="card-stat__value">24/24</p>
          <p class="card-stat__desc">pasando</p>
        </div>
      </div>

      <!-- Atajos -->
      <div class="grid md:grid-cols-3 gap-4 stagger-children">
        <a routerLink="/solver" class="card-feature hover-lift animate-fadeInUp">
          <div class="card-feature__icon">
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 3l14 9-14 9V3z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-display font-semibold text-forest">Ejecutar A*</h3>
            <p class="text-sm text-evergreen mt-1">
              Corre el algoritmo en vivo y observa la traza paso a paso.
            </p>
          </div>
        </a>

        <a routerLink="/heuristica" class="card-feature hover-lift animate-fadeInUp">
          <div class="card-feature__icon">
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 19V6l4-2m0 0V5a3 3 0 00-3-3h-1m4 2h2a3 3 0 013 3v9M5 22h14"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-display font-semibold text-forest">Heurística</h3>
            <p class="text-sm text-evergreen mt-1">
              Distancia de Manhattan, admisibilidad y cálculo de h(inicial).
            </p>
          </div>
        </a>

        <a routerLink="/entregables" class="card-feature hover-lift animate-fadeInUp">
          <div class="card-feature__icon">
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20 7l-8-4-8 4 8 4 8-4zM4 7v10l8 4M20 7v10l-8 4"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-display font-semibold text-forest">Entregables</h3>
            <p class="text-sm text-evergreen mt-1">
              Memoria DOCX, trazas y código listos para subir al aula virtual.
            </p>
          </div>
        </a>
      </div>

      <!-- Resumen del problema -->
      <article class="card-section animate-fadeInUp">
        <h3 class="font-display text-lg font-semibold text-forest mb-1">
          ¿De qué va esta actividad?
        </h3>
        <p class="text-sm text-moss mb-5">
          Resumen ejecutivo del problema y la solución implementada.
        </p>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-display font-semibold text-sm text-evergreen mb-2">
              El problema
            </h4>
            <p class="text-sm text-evergreen">
              Un robot
              <span class="tag">R</span>
              en una matriz <strong class="text-forest">4×4</strong> con dos paredes
              <span class="tag">#</span> debe reorganizar 3 inventarios
              <span class="tag">M1</span>
              <span class="tag">M2</span>
              <span class="tag">M3</span>
              moviéndose en 4 direcciones (coste 1 por acción) y aplicando
              <em>cargar</em> / <em>descargar</em>. Hay que llegar al estado objetivo con
              el menor número de acciones posible.
            </p>
          </div>

          <div>
            <h4 class="font-display font-semibold text-sm text-evergreen mb-2">
              Nuestra solución
            </h4>
            <p class="text-sm text-evergreen">
              Implementación de
              <strong class="text-forest">A*</strong> con heurística de
              <strong class="text-forest">distancia de Manhattan</strong> (admisible).
              Cola de prioridad ordenada por
              <code class="tag">f = g + h</code> con desempate menor h → FIFO. Lista
              cerrada por mejor-g. Resultado: <strong class="text-forest">19
              acciones óptimas</strong> en 323 iteraciones.
            </p>
          </div>
        </div>
      </article>

      <!-- Rúbrica resumida -->
      <article class="card-section animate-fadeInUp">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-display text-lg font-semibold text-forest">
              Rúbrica de evaluación
            </h3>
            <p class="text-sm text-moss mt-0.5">
              4 criterios · 10 puntos totales · cada criterio con condiciones verificables
            </p>
          </div>
          <a routerLink="/como-funciona" class="btn btn-ghost">Ver detalle</a>
        </div>

        <div class="grid md:grid-cols-4 gap-3">
          @for (r of rubrica; track r.criterio) {
            <button
              type="button"
              (click)="abrir(r.modal, $event)"
              class="rounded-xl border border-fog/60 bg-white p-4 hover-lift transition-fast clickable text-left"
              [attr.aria-label]="'Ver detalle del criterio: ' + r.criterio"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="badge badge-active">{{ r.peso }}</span>
                <span class="text-xs text-moss font-mono">{{ r.puntos }} pts</span>
              </div>
              <p class="text-sm font-display font-semibold text-forest">
                {{ r.criterio }}
              </p>
            </button>
          }
        </div>
      </article>
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private modalSvc = inject(InfoModalService);
  estadoApi = signal<EstadoApi>('comprobando');
  apiUrl = '';

  // Re-exportados al template
  readonly KPI_COSTE = KPI_COSTE;
  readonly KPI_ITERACIONES = KPI_ITERACIONES;

  rubrica = [
    {
      criterio: 'Lógica del algoritmo A*',
      peso: '40%',
      puntos: 4,
      modal: RUB_LOGICA,
    },
    {
      criterio: 'Cálculo correcto de f(n)',
      peso: '20%',
      puntos: 2,
      modal: RUB_F,
    },
    {
      criterio: 'Listas abierta/cerrada',
      peso: '20%',
      puntos: 2,
      modal: RUB_LISTAS,
    },
    {
      criterio: 'Secuencia final correcta',
      peso: '20%',
      puntos: 2,
      modal: RUB_SECUENCIA,
    },
  ];

  abrir(cfg: ModalConfig, ev?: Event): void {
    this.modalSvc.open(cfg, ev?.currentTarget as HTMLElement);
  }

  ngOnInit(): void {
    this.apiUrl = (this.api as any)['base'] ?? 'http://localhost:8000';
    this.api.entrega().subscribe({
      next: () => this.estadoApi.set('ok'),
      error: () => this.estadoApi.set('error'),
    });
  }
}
