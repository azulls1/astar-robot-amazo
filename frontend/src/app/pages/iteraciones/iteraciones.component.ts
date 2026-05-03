import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService, EstadoDTO, SolveResponse } from '../../services/api.service';
import { InfoModalService } from '../../shared/info-modal.service';
import {
  KPI_COSTE,
  KPI_GENERADOS,
  KPI_H_INICIAL,
  KPI_ITERACIONES,
} from '../../shared/info-content';
import { ModalConfig } from '../../shared/info-modal.types';

@Component({
  selector: 'app-iteraciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <header class="flex items-start justify-between gap-4 flex-wrap animate-fadeInUp">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-pine mb-1">
            Algoritmo
          </p>
          <h1 class="font-display text-3xl font-bold text-forest">
            Iteraciones de A*
          </h1>
          <p class="text-sm text-evergreen mt-2 max-w-3xl">
            Cada iteración expande el nodo con menor f de la lista abierta. Aquí se
            muestran las primeras 30 con sus métricas y el tamaño de las listas
            abierta y cerrada — cubre el
            <strong class="text-forest">criterio 3 (20%)</strong> de la rúbrica.
          </p>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button (click)="resolver()" [disabled]="cargando()" class="btn btn-cta">
            @if (cargando()) {
              <span class="loading-dots"
                ><span></span><span></span><span></span
              ></span>
              Recalculando…
            } @else {
              <svg
                class="w-4 h-4"
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
              Recalcular
            }
          </button>
          @if (ultimaCorrida(); as t) {
            <p
              class="text-xs text-moss font-mono flex items-center gap-1.5"
              [class.text-pine]="recienActualizado()"
            >
              @if (recienActualizado()) {
                <span
                  class="inline-block w-1.5 h-1.5 rounded-full bg-pine animate-pulse"
                ></span>
                ¡actualizado!
              } @else {
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-moss/50"></span>
                última corrida: {{ t | date: 'HH:mm:ss' }}
              }
              · {{ duracionMs() }} ms
            </p>
          }
        </div>
      </header>

      @if (error()) {
        <div class="alert alert-error">
          <div class="alert__content">{{ error() }}</div>
        </div>
      }

      <!-- KPIs de la corrida (clickeables → modal) -->
      @if (resultado(); as r) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <button
            type="button"
            (click)="abrir(KPI_ITERACIONES, $event)"
            class="card-stat hover-lift animate-fadeInUp clickable text-left"
            aria-label="Ver detalle de iteraciones"
          >
            <p class="card-stat__label">Total iteraciones</p>
            <p class="card-stat__value">{{ r.iteraciones }}</p>
            <p class="card-stat__desc">nodos expandidos</p>
          </button>
          <button
            type="button"
            (click)="abrir(KPI_GENERADOS, $event)"
            class="card-stat hover-lift animate-fadeInUp clickable text-left"
            aria-label="Ver detalle de nodos generados"
          >
            <p class="card-stat__label">Generados</p>
            <p class="card-stat__value">{{ r.nodos_generados }}</p>
            <p class="card-stat__desc">nodos totales creados</p>
          </button>
          <button
            type="button"
            (click)="abrir(KPI_H_INICIAL, $event)"
            class="card-stat hover-lift animate-fadeInUp clickable text-left"
            aria-label="Ver detalle de h inicial"
          >
            <p class="card-stat__label">h(inicial)</p>
            <p class="card-stat__value">{{ r.h_inicial }}</p>
            <p class="card-stat__desc">primer f = 15</p>
          </button>
          <button
            type="button"
            (click)="abrir(KPI_COSTE, $event)"
            class="card-stat hover-glow animate-fadeInUp clickable text-left"
            aria-label="Ver detalle del coste óptimo"
          >
            <p class="card-stat__label">Coste óptimo g*</p>
            <p class="card-stat__value gradient-text">{{ r.coste_total }}</p>
            <p class="card-stat__desc">{{ r.secuencia.length }} acciones</p>
          </button>
        </div>

        <!-- Filtros -->
        <article class="card-section animate-fadeInUp">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 class="font-display text-lg font-semibold text-forest">
                Traza detallada
              </h2>
              <p class="text-sm text-moss mt-0.5">
                {{ r.iteraciones_detalle.length }} primeras iteraciones · click sobre el
                f para resaltar nodos con el mismo valor
              </p>
            </div>

            <div class="flex items-center gap-2">
              <label class="label !mb-0 !mr-2">Filtrar por f =</label>
              <select class="select" [value]="filtroF()" (change)="setFiltroF($event)">
                <option value="">todos</option>
                @for (f of valoresF(); track f) {
                  <option [value]="f">{{ f }}</option>
                }
              </select>
              <button class="btn btn-ghost" (click)="setFiltroF($event, true)">
                Limpiar
              </button>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="table table--compact">
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Estado expandido</th>
                  <th class="text-left">Carga</th>
                  <th class="text-right">g</th>
                  <th class="text-right">h</th>
                  <th class="text-right">f</th>
                  <th class="text-right">|abierta|</th>
                  <th class="text-right">|cerrada|</th>
                </tr>
              </thead>
              <tbody>
                @for (it of iteracionesFiltradas(); track it.n) {
                  <tr
                    class="clickable"
                    [class.bg-pine]="filtroF() && it.f === +filtroF()!"
                    (click)="abrirIteracion(it, $event)"
                    tabindex="0"
                    (keydown.enter)="abrirIteracion(it, $event)"
                  >
                    <td class="mono font-bold">{{ it.n }}</td>
                    <td class="mono text-evergreen">{{ resumirRobotInv(it.estado) }}</td>
                    <td>
                      @if (it.estado.cargando) {
                        <span class="badge badge-info">{{ it.estado.cargando }}</span>
                      } @else {
                        <span class="text-moss">—</span>
                      }
                    </td>
                    <td class="mono text-right">{{ it.g }}</td>
                    <td class="mono text-right">{{ it.h }}</td>
                    <td class="text-right">
                      <span class="tag font-bold text-forest">{{ it.f }}</span>
                    </td>
                    <td class="mono text-right text-moss">{{ it.abierta_size }}</td>
                    <td class="mono text-right text-moss">{{ it.cerrada_size }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <p class="text-xs text-moss mt-3">
            La traza completa de las {{ r.iteraciones }} iteraciones está en
            <code class="tag">salidas/traza_completa.txt</code> (anexo de la memoria).
          </p>
        </article>

        <!-- Distribución de f -->
        <article class="card-section animate-fadeInUp">
          <h2 class="font-display text-lg font-semibold text-forest mb-3">
            Distribución de f en las primeras iteraciones
          </h2>
          <p class="text-sm text-moss mb-4">
            Cuántas iteraciones expandieron nodos con cada valor de f. Idealmente A*
            agota un valor de f antes de pasar al siguiente — verás la f crecer de
            forma gradual.
          </p>

          <div class="space-y-2">
            @for (b of distribucionF(); track b.f) {
              <div class="flex items-center gap-3">
                <span class="tag w-12 text-center">f={{ b.f }}</span>
                <div class="progress flex-1">
                  <div
                    class="progress__bar"
                    [style.width.%]="(b.count / maxF()) * 100"
                  ></div>
                </div>
                <span class="font-mono text-sm text-evergreen w-8 text-right">
                  {{ b.count }}
                </span>
              </div>
            }
          </div>
        </article>
      } @else if (cargando()) {
        <div class="space-y-3">
          <div class="skeleton" style="height: 120px;"></div>
          <div class="skeleton" style="height: 400px;"></div>
        </div>
      }
    </section>
  `,
})
export class IteracionesComponent implements OnInit {
  private api = inject(ApiService);
  private modalSvc = inject(InfoModalService);

  resultado = signal<SolveResponse | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);
  filtroF = signal<string>('');
  ultimaCorrida = signal<Date | null>(null);
  duracionMs = signal<number>(0);
  recienActualizado = signal(false);

  // Re-exportados al template
  readonly KPI_ITERACIONES = KPI_ITERACIONES;
  readonly KPI_GENERADOS = KPI_GENERADOS;
  readonly KPI_H_INICIAL = KPI_H_INICIAL;
  readonly KPI_COSTE = KPI_COSTE;

  abrir(cfg: ModalConfig, ev?: Event): void {
    this.modalSvc.open(cfg, ev?.currentTarget as HTMLElement);
  }

  abrirIteracion(
    it: SolveResponse['iteraciones_detalle'][0],
    ev: Event,
  ): void {
    const e = it.estado;
    const carga = e.cargando ? `cargando ${e.cargando}` : 'sin carga';
    this.modalSvc.open(
      {
        eyebrow: `Iteración ${it.n}`,
        title: `Estado expandido en iteración ${it.n}`,
        subtitle: `f = ${it.f} = g(${it.g}) + h(${it.h})`,
        badge: { text: `f = ${it.f}`, variant: 'info' },
        sections: [
          {
            kind: 'kv',
            title: 'Estado',
            rows: [
              {
                key: 'Robot',
                value: `(${e.robot.fila}, ${e.robot.columna})`,
                mono: true,
              },
              { key: 'Carga', value: carga },
              {
                key: 'M1',
                value: `(${e.inventarios['M1'].fila}, ${e.inventarios['M1'].columna})`,
                mono: true,
              },
              {
                key: 'M2',
                value: `(${e.inventarios['M2'].fila}, ${e.inventarios['M2'].columna})`,
                mono: true,
              },
              {
                key: 'M3',
                value: `(${e.inventarios['M3'].fila}, ${e.inventarios['M3'].columna})`,
                mono: true,
              },
            ],
          },
          {
            kind: 'kv',
            title: 'Métricas',
            rows: [
              { key: 'g (coste real acumulado)', value: String(it.g), mono: true },
              { key: 'h (heurística)', value: String(it.h), mono: true },
              { key: 'f = g + h', value: String(it.f), mono: true },
              {
                key: '|abierta| antes de expandir',
                value: String(it.abierta_size),
                mono: true,
              },
              {
                key: '|cerrada| antes de expandir',
                value: String(it.cerrada_size),
                mono: true,
              },
            ],
          },
          {
            kind: 'callout',
            variant: 'info',
            html:
              'En esta iteración A* extrae este nodo de la lista abierta (porque tiene el menor f), lo agrega a cerrada, y genera sus sucesores aplicando las acciones disponibles.',
          },
        ],
      },
      ev.currentTarget as HTMLElement,
    );
  }

  iteracionesFiltradas = computed(() => {
    const r = this.resultado();
    if (!r) return [];
    const f = this.filtroF();
    if (!f) return r.iteraciones_detalle;
    return r.iteraciones_detalle.filter((it) => it.f === +f);
  });

  valoresF = computed(() => {
    const r = this.resultado();
    if (!r) return [];
    const set = new Set(r.iteraciones_detalle.map((it) => it.f));
    return [...set].sort((a, b) => a - b);
  });

  distribucionF = computed(() => {
    const r = this.resultado();
    if (!r) return [];
    const map = new Map<number, number>();
    for (const it of r.iteraciones_detalle) {
      map.set(it.f, (map.get(it.f) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([f, count]) => ({ f, count }))
      .sort((a, b) => a.f - b.f);
  });

  maxF = computed(() => {
    const d = this.distribucionF();
    return d.length ? Math.max(...d.map((b) => b.count)) : 1;
  });

  ngOnInit(): void {
    this.resolver();
  }

  setFiltroF(ev: Event | undefined, limpiar = false): void {
    if (limpiar) {
      this.filtroF.set('');
      return;
    }
    const v = (ev?.target as HTMLSelectElement)?.value ?? '';
    this.filtroF.set(v);
  }

  resolver(): void {
    this.cargando.set(true);
    this.error.set(null);
    const t0 = performance.now();
    this.api.resolver().subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.duracionMs.set(Math.round(performance.now() - t0));
        this.ultimaCorrida.set(new Date());
        this.cargando.set(false);
        this.recienActualizado.set(true);
        setTimeout(() => this.recienActualizado.set(false), 2500);
      },
      error: (e) => {
        this.error.set('Error al ejecutar A*: ' + (e?.message ?? 'desconocido'));
        this.cargando.set(false);
      },
    });
  }

  resumirRobotInv(e: EstadoDTO): string {
    const r = `R(${e.robot.fila},${e.robot.columna})`;
    const invs = ['M1', 'M2', 'M3']
      .map((k) => `${k}(${e.inventarios[k].fila},${e.inventarios[k].columna})`)
      .join(' ');
    return `${r} ${invs}`;
  }
}
