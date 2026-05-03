import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AccionDTO,
  ApiService,
  EstadoDTO,
  SolveResponse,
} from '../../services/api.service';
import { TableroComponent } from '../../components/tablero.component';
import { InfoModalService } from '../../shared/info-modal.service';
import {
  ACCION_CARGAR,
  ACCION_DESCARGAR,
  ACCION_MOVER,
  KPI_COSTE,
  KPI_GENERADOS,
  KPI_H_INICIAL,
  KPI_ITERACIONES,
  TABLERO_PARED,
  TABLERO_ROBOT,
  inventarioModal,
} from '../../shared/info-content';
import { ModalConfig } from '../../shared/info-modal.types';

@Component({
  selector: 'app-solver',
  standalone: true,
  imports: [CommonModule, TableroComponent],
  template: `
    <section class="space-y-8">
      <!-- HERO grande, centrado, igual al Dashboard -->
      <div
        class="card-hero animate-fadeInUp relative overflow-hidden"
        style="min-height: 22rem;"
      >
        <div class="relative z-10 px-6 py-12 sm:px-12 sm:py-14 text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle mb-6"
          >
            <span class="w-2 h-2 rounded-full bg-pine animate-pulse"></span>
            <span class="text-xs font-medium text-fog tracking-wider">
              SOLVER A* — CORRIDA EN VIVO
            </span>
          </div>

          <h1
            class="font-display text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight"
          >
            Ejecuta el algoritmo paso a paso
          </h1>
          <p
            class="text-sm sm:text-base text-fog/85 max-w-2xl mx-auto leading-relaxed"
          >
            Pulsa <strong class="text-white">Ejecutar A*</strong> para correr el
            algoritmo en el backend con el estado inicial del enunciado y
            visualizar la traza, las listas abierta/cerrada y la secuencia
            óptima de {{ resultado()?.secuencia?.length ?? 19 }} acciones.
          </p>

          <div class="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <button
              (click)="resolver()"
              [disabled]="cargando()"
              class="btn btn-cta btn-primary--on-dark"
            >
              @if (cargando()) {
                <span class="loading-dots"
                  ><span></span><span></span><span></span
                ></span>
                Ejecutando…
              } @else if (resultado()) {
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
                    d="M4 4v6h6M20 20v-6h-6M5 13a8 8 0 0014.5 4M19 11a8 8 0 00-14.5-4"
                  />
                </svg>
                Volver a ejecutar
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
                    d="M5 3l14 9-14 9V3z"
                  />
                </svg>
                Ejecutar A*
              }
            </button>
            @if (resultado()) {
              <span
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle text-xs text-fog/90"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full bg-pine animate-pulse"
                ></span>
                Solución calculada
              </span>
            }
          </div>
        </div>
      </div>

      @if (error()) {
        <div class="alert alert-error animate-fadeInUp">
          <div class="alert__icon">
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
          </div>
          <div class="alert__content">
            <div class="alert__title">No se pudo ejecutar A*</div>
            {{ error() }}
          </div>
        </div>
      }

      <!-- KPIs siempre visibles (dimmed antes de correr · clickeables) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <button
          type="button"
          (click)="abrir(KPI_H_INICIAL, $event)"
          class="card-stat hover-lift animate-fadeInUp clickable text-left"
          [class.opacity-60]="!resultado()"
          aria-label="Ver detalle de h inicial"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="card-stat__label">h(inicial)</p>
            <span class="text-pine font-mono text-xs">Manhattan</span>
          </div>
          <p class="card-stat__value">{{ resultado()?.h_inicial ?? 15 }}</p>
          <p class="card-stat__desc">
            {{ resultado() ? 'Calculado' : 'Esperado · admisible' }}
          </p>
        </button>

        <button
          type="button"
          (click)="abrir(KPI_ITERACIONES, $event)"
          class="card-stat hover-lift animate-fadeInUp clickable text-left"
          [class.opacity-60]="!resultado()"
          aria-label="Ver detalle de iteraciones"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="card-stat__label">Iteraciones</p>
            <span class="badge badge-info">A*</span>
          </div>
          <p class="card-stat__value">{{ resultado()?.iteraciones ?? 323 }}</p>
          <p class="card-stat__desc">
            {{ resultado() ? 'Nodos expandidos' : 'Esperado · referencia' }}
          </p>
        </button>

        <button
          type="button"
          (click)="abrir(KPI_GENERADOS, $event)"
          class="card-stat hover-lift animate-fadeInUp clickable text-left"
          [class.opacity-60]="!resultado()"
          aria-label="Ver detalle de nodos generados"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="card-stat__label">Generados</p>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <p class="card-stat__value">
            {{ resultado()?.nodos_generados ?? 836 }}
          </p>
          <p class="card-stat__desc">
            {{ resultado() ? 'Nodos creados' : 'Esperado · referencia' }}
          </p>
        </button>

        <button
          type="button"
          (click)="abrir(KPI_COSTE, $event)"
          class="card-stat hover-glow animate-fadeInUp clickable text-left"
          [class.opacity-60]="!resultado()"
          aria-label="Ver detalle del coste óptimo"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="card-stat__label">Coste óptimo g*</p>
            <span class="badge badge-active">Óptimo</span>
          </div>
          <p class="card-stat__value gradient-text">
            {{ resultado()?.coste_total ?? 19 }}
          </p>
          <p class="card-stat__desc">
            {{ resultado()?.secuencia?.length ?? 19 }} acciones
          </p>
        </button>
      </div>

      <!-- Tablero + Resumen estado inicial -->
      <article class="card-section animate-fadeInUp">
        <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 class="font-display text-lg font-semibold text-forest">
              Estado inicial y estado objetivo
            </h3>
            <p class="text-sm text-moss mt-0.5">
              Matriz 4×4 con paredes en (0,1) y (1,1) · A* debe transformar el
              estado inicial en el objetivo con el menor número de acciones
            </p>
          </div>
          <span class="tag">criterio 1 · 40%</span>
        </div>

        <!-- Dos tableros lado a lado: Inicial ↔ Objetivo -->
        <div class="grid lg:grid-cols-2 gap-6 mb-8">
          <!-- Estado inicial -->
          <div
            class="rounded-xl border border-fog/60 bg-white p-5 flex flex-col gap-4"
          >
            <div class="flex items-center justify-between">
              <h4
                class="font-display font-semibold text-sm uppercase tracking-wider text-pine"
              >
                Estado inicial
              </h4>
              <span class="badge badge-info">g = 0</span>
            </div>

            @if (estadoInicial()) {
              <div class="flex justify-center">
                <app-tablero
                  [estado]="estadoInicial()!"
                  [grande]="true"
                  [mostrarCoordenadas]="true"
                />
              </div>
              <ul class="text-xs text-evergreen space-y-1">
                <li class="flex justify-between">
                  <span>Robot</span>
                  <span class="mono">(2, 2)</span>
                </li>
                <li class="flex justify-between">
                  <span>M1 · M2 · M3</span>
                  <span class="mono">(0,0) · (2,0) · (0,3)</span>
                </li>
                <li class="flex justify-between">
                  <span>Paredes</span>
                  <span class="mono">(0,1) · (1,1)</span>
                </li>
              </ul>
            } @else if (error()) {
              <div class="empty-state">
                <div class="empty-state__title">Sin conexión al backend</div>
              </div>
            } @else {
              <div class="skeleton" style="height:20rem;"></div>
            }
          </div>

          <!-- Estado objetivo -->
          <div
            class="rounded-xl border-2 border-forest/30 bg-gradient-to-br from-pine/5 to-forest/5 p-5 flex flex-col gap-4"
          >
            <div class="flex items-center justify-between">
              <h4
                class="font-display font-semibold text-sm uppercase tracking-wider text-forest"
              >
                Estado objetivo
              </h4>
              <span class="badge badge-active">g* = 19</span>
            </div>

            <div class="flex justify-center">
              <app-tablero
                [estado]="estadoObjetivo"
                [grande]="true"
                [mostrarCoordenadas]="true"
                [mostrarRobot]="false"
              />
            </div>
            <ul class="text-xs text-evergreen space-y-1">
              <li class="flex justify-between">
                <span>M3 · M2 · M1 (fila 3)</span>
                <span class="mono font-bold text-forest">
                  (3,1) · (3,2) · (3,3)
                </span>
              </li>
              <li class="flex justify-between">
                <span>Robot</span>
                <span class="mono text-moss">cualquier celda libre</span>
              </li>
              <li class="flex justify-between">
                <span>Paredes</span>
                <span class="mono">(0,1) · (1,1)</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Leyenda del tablero (compartida) -->
        <div
          class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-6 px-1"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-5 h-5 rounded bg-forest text-white flex items-center justify-center font-mono font-bold text-[10px]"
              >R</span
            >
            <span class="text-evergreen">Robot</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="w-5 h-5 rounded bg-fog text-forest flex items-center justify-center font-mono font-bold text-[10px]"
              >M</span
            >
            <span class="text-evergreen">Inventario</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="w-5 h-5 rounded"
              style="background:repeating-linear-gradient(45deg,var(--forest-300),var(--forest-300) 3px,var(--forest-500) 3px,var(--forest-500) 6px);"
            ></span>
            <span class="text-evergreen">Pared</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="w-5 h-5 rounded border border-fog bg-white"
            ></span>
            <span class="text-evergreen">Libre</span>
          </div>
        </div>

        <!-- Resumen detallado: posiciones + acciones -->
        <div class="grid lg:grid-cols-2 gap-8 items-start">
          <!-- Col 1: Posiciones -->
          <div>
            <h4
              class="font-display font-semibold text-sm uppercase tracking-wider text-pine mb-2"
            >
              Posiciones
            </h4>
              <div class="table-wrapper">
                <table class="table table--compact">
                  <thead>
                    <tr>
                      <th>Elemento</th>
                      <th class="text-right">Inicio</th>
                      <th class="text-right">Objetivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      class="clickable"
                      (click)="abrir(TABLERO_ROBOT, $event)"
                      tabindex="0"
                      (keydown.enter)="abrir(TABLERO_ROBOT, $event)"
                    >
                      <td>
                        <span class="inline-flex items-center gap-2">
                          <span
                            class="w-5 h-5 rounded bg-forest text-white flex items-center justify-center font-mono font-bold text-[10px]"
                            >R</span
                          >
                          Robot
                        </span>
                      </td>
                      <td class="mono text-right">(2, 2)</td>
                      <td class="mono text-right text-moss">libre</td>
                    </tr>
                    @for (inv of inventarios; track inv.nombre) {
                      <tr
                        class="clickable"
                        (click)="abrirInventario(inv, $event)"
                        tabindex="0"
                        (keydown.enter)="abrirInventario(inv, $event)"
                      >
                        <td>
                          <span class="inline-flex items-center gap-2">
                            <span
                              class="w-5 h-5 rounded bg-fog text-forest flex items-center justify-center font-mono font-bold text-[10px]"
                              >{{ inv.nombre.replace('M', '') }}</span
                            >
                            {{ inv.nombre }}
                          </span>
                        </td>
                        <td class="mono text-right">{{ inv.desde }}</td>
                        <td class="mono text-right font-bold text-forest">
                          {{ inv.hasta }}
                        </td>
                      </tr>
                    }
                    <tr
                      class="clickable"
                      (click)="abrir(TABLERO_PARED, $event)"
                      tabindex="0"
                      (keydown.enter)="abrir(TABLERO_PARED, $event)"
                    >
                      <td>
                        <span class="inline-flex items-center gap-2">
                          <span
                            class="w-5 h-5 rounded"
                            style="background:repeating-linear-gradient(45deg,var(--forest-300),var(--forest-300) 3px,var(--forest-500) 3px,var(--forest-500) 6px);"
                          ></span>
                          Paredes
                        </span>
                      </td>
                      <td class="mono text-right" colspan="2">
                        (0, 1) y (1, 1)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4
                class="font-display font-semibold text-sm uppercase tracking-wider text-pine mb-2"
              >
                Acciones disponibles
              </h4>
              <div class="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  (click)="abrir(ACCION_MOVER, $event)"
                  class="clickable flex items-center gap-3 p-3 rounded-lg border border-fog/60 bg-white text-left w-full"
                  aria-label="Ver detalle de la acción mover"
                >
                  <span class="badge badge-inactive">mover</span>
                  <span class="text-sm text-evergreen flex-1">
                    Robot avanza una celda en N/S/E/O
                  </span>
                  <span class="text-xs text-moss font-mono">coste 1</span>
                </button>
                <button
                  type="button"
                  (click)="abrir(ACCION_CARGAR, $event)"
                  class="clickable flex items-center gap-3 p-3 rounded-lg border border-fog/60 bg-white text-left w-full"
                  aria-label="Ver detalle de la acción cargar"
                >
                  <span class="badge badge-info">cargar</span>
                  <span class="text-sm text-evergreen flex-1">
                    Toma un inventario adyacente
                  </span>
                  <span class="text-xs text-moss font-mono">coste 1</span>
                </button>
                <button
                  type="button"
                  (click)="abrir(ACCION_DESCARGAR, $event)"
                  class="clickable flex items-center gap-3 p-3 rounded-lg border border-fog/60 bg-white text-left w-full"
                  aria-label="Ver detalle de la acción descargar"
                >
                  <span class="badge badge-active">descargar</span>
                  <span class="text-sm text-evergreen flex-1">
                    Deja el inventario en la celda objetivo
                  </span>
                  <span class="text-xs text-moss font-mono">coste 1</span>
                </button>
              </div>
            </div>
        </div>
      </article>

      <!-- Resultado: alert + traza + secuencia -->
      @if (resultado(); as r) {
        <div class="alert alert-success animate-fadeInUp">
          <div class="alert__icon">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div class="alert__content">
            <div class="alert__title">Solución óptima encontrada</div>
            A* terminó con
            <strong>g* = {{ r.coste_total }}</strong> tras
            <strong>{{ r.iteraciones }} iteraciones</strong> y
            <strong>{{ r.nodos_generados }} nodos generados</strong>.
          </div>
        </div>

        <article class="card-section animate-fadeInUp">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 class="font-display text-lg font-semibold text-forest">
                Traza de las primeras
                {{ r.iteraciones_detalle.length }} iteraciones
              </h3>
              <p class="text-sm text-moss mt-0.5">
                Lista abierta y cerrada con g, h, f por nodo expandido
              </p>
            </div>
            <span class="tag">criterio 3 · 20%</span>
          </div>

          <div class="table-wrapper">
            <table class="table table--compact">
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Estado expandido</th>
                  <th class="text-right">g</th>
                  <th class="text-right">h</th>
                  <th class="text-right">f</th>
                  <th class="text-right">|abierta|</th>
                  <th class="text-right">|cerrada|</th>
                </tr>
              </thead>
              <tbody>
                @for (it of r.iteraciones_detalle; track it.n) {
                  <tr>
                    <td class="mono">{{ it.n }}</td>
                    <td class="mono">{{ resumirEstado(it.estado) }}</td>
                    <td class="mono text-right">{{ it.g }}</td>
                    <td class="mono text-right">{{ it.h }}</td>
                    <td class="mono text-right">
                      <span class="tag font-bold text-forest">{{ it.f }}</span>
                    </td>
                    <td class="mono text-right text-moss">
                      {{ it.abierta_size }}
                    </td>
                    <td class="mono text-right text-moss">
                      {{ it.cerrada_size }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <p class="text-xs text-moss mt-3">
            La traza completa de las {{ r.iteraciones }} iteraciones está en
            <code class="tag">salidas/traza_completa.txt</code> — disponible en
            la vista
            <strong class="text-forest">Entregables</strong>.
          </p>
        </article>

        <article class="card-section animate-fadeInUp">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 class="font-display text-lg font-semibold text-forest">
                Secuencia óptima de acciones
              </h3>
              <p class="text-sm text-moss mt-0.5">
                Notación del enunciado · {{ r.secuencia.length }} acciones ·
                coste {{ r.coste_total }}
              </p>
            </div>
            <span class="tag">criterio 4 · 20%</span>
          </div>

          <ol
            class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 stagger-children"
          >
            @for (a of r.secuencia; track a.paso) {
              <li class="flex items-center gap-3 animate-slideInLeft">
                <span
                  class="w-8 h-8 rounded-lg bg-fog/60 text-forest flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                >
                  {{ a.paso }}
                </span>
                <span class="badge" [ngClass]="badgeAccion(a.tipo)">{{
                  a.tipo
                }}</span>
                <span class="font-mono text-sm text-forest truncate">{{
                  a.descripcion
                }}</span>
              </li>
            }
          </ol>
        </article>
      } @else {
        <!-- Antes de correr: invitación + tip -->
        <article class="card-section animate-fadeInUp">
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white shrink-0"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-display text-lg font-semibold text-forest mb-1">
                ¿Listo para ver A* en acción?
              </h3>
              <p class="text-sm text-evergreen">
                Pulsa <strong class="text-forest">Ejecutar A*</strong> arriba
                para que el backend resuelva el problema en vivo. Verás
                aparecer las
                <strong>323 iteraciones</strong> con sus listas abierta /
                cerrada, los valores de
                <code class="tag">g</code>, <code class="tag">h</code>,
                <code class="tag">f</code>, y la
                <strong>secuencia óptima de 19 acciones</strong> que el robot
                debe ejecutar.
              </p>
            </div>
          </div>
        </article>
      }
    </section>
  `,
})
export class SolverComponent implements OnInit {
  private api = inject(ApiService);
  private modalSvc = inject(InfoModalService);

  estadoInicial = signal<EstadoDTO | null>(null);
  resultado = signal<SolveResponse | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Re-exportados al template
  readonly KPI_H_INICIAL = KPI_H_INICIAL;
  readonly KPI_ITERACIONES = KPI_ITERACIONES;
  readonly KPI_GENERADOS = KPI_GENERADOS;
  readonly KPI_COSTE = KPI_COSTE;
  readonly TABLERO_ROBOT = TABLERO_ROBOT;
  readonly TABLERO_PARED = TABLERO_PARED;
  readonly ACCION_MOVER = ACCION_MOVER;
  readonly ACCION_CARGAR = ACCION_CARGAR;
  readonly ACCION_DESCARGAR = ACCION_DESCARGAR;

  inventarios: Array<{
    nombre: 'M1' | 'M2' | 'M3';
    desde: string;
    hasta: string;
    manhattan: number;
  }> = [
    { nombre: 'M1', desde: '(0, 0)', hasta: '(3, 3)', manhattan: 6 },
    { nombre: 'M2', desde: '(2, 0)', hasta: '(3, 2)', manhattan: 3 },
    { nombre: 'M3', desde: '(0, 3)', hasta: '(3, 1)', manhattan: 5 },
  ];

  // Estado objetivo del enunciado: M3@(3,1), M2@(3,2), M1@(3,3).
  // El robot puede terminar en cualquier celda libre — su posición no se renderiza
  // (mostrarRobot=false en el tablero) para no inducir a pensar que es obligatoria.
  readonly estadoObjetivo: EstadoDTO = {
    robot: { fila: 3, columna: 0 },
    cargando: null,
    inventarios: {
      M1: { fila: 3, columna: 3 },
      M2: { fila: 3, columna: 2 },
      M3: { fila: 3, columna: 1 },
    },
  };

  abrir(cfg: ModalConfig, ev?: Event): void {
    this.modalSvc.open(cfg, ev?.currentTarget as HTMLElement);
  }

  abrirInventario(
    inv: { nombre: 'M1' | 'M2' | 'M3'; desde: string; hasta: string; manhattan: number },
    ev: Event,
  ): void {
    this.modalSvc.open(
      inventarioModal(inv.nombre, inv.desde, inv.hasta, inv.manhattan),
      ev.currentTarget as HTMLElement,
    );
  }

  ngOnInit(): void {
    this.api.estadoInicial().subscribe({
      next: (s) => this.estadoInicial.set(s),
      error: () => this.error.set('No se pudo conectar al backend.'),
    });
  }

  resolver(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.api.resolver().subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set('Error al ejecutar A*: ' + (e?.message ?? 'desconocido'));
        this.cargando.set(false);
      },
    });
  }

  resumirEstado(e: EstadoDTO): string {
    const r = `R(${e.robot.fila},${e.robot.columna})`;
    const carga = e.cargando ? `+${e.cargando}` : '';
    const invs = ['M1', 'M2', 'M3']
      .map((k) => `${k}(${e.inventarios[k].fila},${e.inventarios[k].columna})`)
      .join(' ');
    return `${r}${carga}  ${invs}`;
  }

  badgeAccion(tipo: AccionDTO['tipo']): string {
    return {
      mover: 'badge-inactive',
      cargar: 'badge-info',
      descargar: 'badge-active',
    }[tipo];
  }
}
