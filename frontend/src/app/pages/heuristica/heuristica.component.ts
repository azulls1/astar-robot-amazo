import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { InfoModalService } from '../../shared/info-modal.service';
import {
  F_DE_F,
  F_DE_G,
  F_DE_H,
  PROP_ADMISIBLE,
  PROP_COMPOSITIVA,
  PROP_DETERMINISTA,
  PROP_EFICIENTE,
  inventarioModal,
} from '../../shared/info-content';
import { ModalConfig } from '../../shared/info-modal.types';

interface CalculoComponente {
  nombre: string;
  desde: string;
  hasta: string;
  formula: string;
  valor: number;
}

@Component({
  selector: 'app-heuristica',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <!-- Header -->
      <header class="animate-fadeInUp">
        <p class="text-xs font-semibold uppercase tracking-wider text-pine mb-1">
          Algoritmo
        </p>
        <h1 class="font-display text-3xl font-bold text-forest">
          Heurística — Distancia de Manhattan
        </h1>
        <p class="text-sm text-evergreen mt-2 max-w-3xl">
          La función h(n) estima el coste restante desde un estado n hasta el objetivo.
          Para que A\\* sea óptimo, h debe ser <strong class="text-forest">admisible</strong>:
          nunca sobreestimar el coste real.
        </p>
      </header>

      <!-- Fórmula central -->
      <article class="card-hero animate-fadeInUp">
        <div class="px-6 py-10 sm:px-12 sm:py-14 text-center">
          <p
            class="font-mono text-xl sm:text-3xl text-white tracking-wider mb-4"
          >
            h(n) = Σ manhattan(M<sub>i</sub>, obj<sub>i</sub>) + ajuste
          </p>
          <p class="text-sm text-fog/80 max-w-2xl mx-auto">
            Suma de la distancia de Manhattan de cada inventario a su posición objetivo,
            más un ajuste por la distancia del robot al inventario más cercano cuando
            está libre.
          </p>
        </div>
      </article>

      <!-- Definición Manhattan -->
      <article class="card-section animate-fadeInUp">
        <h2 class="font-display text-xl font-semibold text-forest mb-3">
          Distancia de Manhattan
        </h2>
        <p class="text-sm text-evergreen mb-5">
          Para dos celdas
          <span class="tag">(f₁, c₁)</span> y <span class="tag">(f₂, c₂)</span>:
        </p>

        <div
          class="rounded-xl gradient-primary text-white p-5 font-mono text-center text-lg shadow-forest"
        >
          manhattan( (f₁,c₁), (f₂,c₂) ) = |f₁ - f₂| + |c₁ - c₂|
        </div>

        <div class="mt-5 grid md:grid-cols-2 gap-4">
          <div class="alert alert-info">
            <div class="alert__content">
              <div class="alert__title">¿Por qué Manhattan?</div>
              <p>
                El robot solo se mueve en 4 direcciones cardinales. Manhattan cuenta
                exactamente los pasos cardinales necesarios ignorando obstáculos —
                por eso es una <strong>cota inferior</strong> del coste real.
              </p>
            </div>
          </div>
          <div class="alert alert-success">
            <div class="alert__content">
              <div class="alert__title">Admisibilidad garantizada</div>
              <p>
                Como h ignora paredes, ignora la mecánica de carga/descarga (cada
                acción suma 1 al coste real) y no fuerza un orden de inventarios,
                siempre tenemos
                <code class="tag">h(n) ≤ coste_real(n)</code>. A\\* devuelve solución óptima.
              </p>
            </div>
          </div>
        </div>
      </article>

      <!-- Cálculo de h(inicial) -->
      <article class="card-section animate-fadeInUp">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display text-xl font-semibold text-forest">
              Cálculo de h(inicial) paso a paso
            </h2>
            <p class="text-sm text-moss mt-0.5">
              Verificación a mano del valor inicial usado por A*
            </p>
          </div>
          <span class="badge badge-info">Criterio 2 · 20%</span>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Componente</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Fórmula</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              @for (c of componentes; track c.nombre) {
                <tr
                  class="clickable"
                  (click)="abrirComponente(c, $event)"
                  tabindex="0"
                  (keydown.enter)="abrirComponente(c, $event)"
                >
                  <td>
                    <span class="tag">{{ c.nombre }}</span>
                  </td>
                  <td class="mono">{{ c.desde }}</td>
                  <td class="mono">{{ c.hasta }}</td>
                  <td class="mono text-evergreen">{{ c.formula }}</td>
                  <td class="text-right mono font-bold text-forest">
                    {{ c.valor }}
                  </td>
                </tr>
              }
              <tr>
                <td colspan="4" class="text-right font-semibold text-evergreen">
                  Total h(inicial) =
                </td>
                <td class="text-right">
                  <span class="badge badge-active text-base px-3">15</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-evergreen mt-4">
          Como <code class="tag">g(inicial) = 0</code>, entonces
          <code class="tag">f(inicial) = 0 + 15 = 15</code>. Este valor coincide con
          la salida del programa y con el primer
          <code class="tag">f</code> del nodo expandido en la traza.
        </p>
      </article>

      <!-- Función f(n) -->
      <article class="card-section animate-fadeInUp">
        <h2 class="font-display text-xl font-semibold text-forest mb-4">
          Función de evaluación f(n)
        </h2>

        <div class="grid md:grid-cols-3 gap-4">
          <button
            type="button"
            (click)="abrir(F_DE_G, $event)"
            class="card-stat clickable text-left"
            aria-label="Ver detalle de g(n)"
          >
            <p class="card-stat__label">g(n)</p>
            <p class="card-stat__value text-2xl">coste real</p>
            <p class="card-stat__desc">
              Acciones desde el inicio (cada acción suma 1)
            </p>
          </button>
          <button
            type="button"
            (click)="abrir(F_DE_H, $event)"
            class="card-stat clickable text-left"
            aria-label="Ver detalle de h(n)"
          >
            <p class="card-stat__label">h(n)</p>
            <p class="card-stat__value text-2xl">estimación</p>
            <p class="card-stat__desc">Manhattan + ajuste (admisible)</p>
          </button>
          <button
            type="button"
            (click)="abrir(F_DE_F, $event)"
            class="card-stat hover-glow clickable text-left"
            aria-label="Ver detalle de f(n)"
          >
            <p class="card-stat__label">f(n)</p>
            <p class="card-stat__value text-2xl gradient-text">g + h</p>
            <p class="card-stat__desc">Lo que ordena la lista abierta</p>
          </button>
        </div>
      </article>

      <!-- Propiedades -->
      <article class="card-section animate-fadeInUp">
        <h2 class="font-display text-xl font-semibold text-forest mb-4">
          Propiedades de la heurística
        </h2>

        <div class="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            (click)="abrir(PROP_ADMISIBLE, $event)"
            class="card-feature clickable text-left"
            aria-label="Ver detalle de propiedad: admisible"
          >
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-forest">Admisible</h3>
              <p class="text-sm text-evergreen mt-1">
                Nunca sobreestima. Garantiza optimalidad de A*.
              </p>
            </div>
          </button>

          <button
            type="button"
            (click)="abrir(PROP_EFICIENTE, $event)"
            class="card-feature clickable text-left"
            aria-label="Ver detalle de propiedad: eficiente"
          >
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-forest">Eficiente</h3>
              <p class="text-sm text-evergreen mt-1">
                Cálculo O(1) por nodo: solo 3 sumas de Manhattan + 1 mínimo.
              </p>
            </div>
          </button>

          <button
            type="button"
            (click)="abrir(PROP_DETERMINISTA, $event)"
            class="card-feature clickable text-left"
            aria-label="Ver detalle de propiedad: determinista"
          >
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-forest">
                Determinista
              </h3>
              <p class="text-sm text-evergreen mt-1">
                Misma entrada → mismo h(n). Reproducible entre corridas.
              </p>
            </div>
          </button>

          <button
            type="button"
            (click)="abrir(PROP_COMPOSITIVA, $event)"
            class="card-feature clickable text-left"
            aria-label="Ver detalle de propiedad: compositiva"
          >
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-forest">
                Compositiva
              </h3>
              <p class="text-sm text-evergreen mt-1">
                Suma de cotas inferiores independientes — sigue siendo cota
                inferior.
              </p>
            </div>
          </button>
        </div>
      </article>
    </section>
  `,
})
export class HeuristicaComponent {
  private modalSvc = inject(InfoModalService);

  // Re-exportados al template
  readonly F_DE_G = F_DE_G;
  readonly F_DE_H = F_DE_H;
  readonly F_DE_F = F_DE_F;
  readonly PROP_ADMISIBLE = PROP_ADMISIBLE;
  readonly PROP_EFICIENTE = PROP_EFICIENTE;
  readonly PROP_DETERMINISTA = PROP_DETERMINISTA;
  readonly PROP_COMPOSITIVA = PROP_COMPOSITIVA;

  abrir(cfg: ModalConfig, ev?: Event): void {
    this.modalSvc.open(cfg, ev?.currentTarget as HTMLElement);
  }

  abrirComponente(c: CalculoComponente, ev: Event): void {
    if (c.nombre.startsWith('M')) {
      this.modalSvc.open(
        inventarioModal(
          c.nombre as 'M1' | 'M2' | 'M3',
          c.desde,
          c.hasta,
          c.valor,
        ),
        ev.currentTarget as HTMLElement,
      );
      return;
    }
    // Robot→Mi: explicación específica del término de ajuste
    this.modalSvc.open(
      {
        eyebrow: 'Componente de h(inicial)',
        title: c.nombre,
        subtitle: 'Ajuste por la posición del robot al inventario más cercano',
        badge: { text: `aporta ${c.valor}`, variant: 'info' },
        sections: [
          {
            kind: 'paragraph',
            html:
              'Cuando el robot no carga ningún inventario, gastamos al menos 1 paso para llegar adyacente al inventario más cercano antes de poder cargarlo. Por eso sumamos <code class="tag">' +
              c.formula +
              '</code> al h.',
          },
          {
            kind: 'callout',
            variant: 'info',
            html:
              'Restamos 1 (max(0, …)) porque cargar requiere estar adyacente, no en la misma celda.',
          },
        ],
      },
      ev.currentTarget as HTMLElement,
    );
  }

  componentes: CalculoComponente[] = [
    {
      nombre: 'M1',
      desde: '(0, 0)',
      hasta: '(3, 3)',
      formula: '|0-3| + |0-3| = 3 + 3',
      valor: 6,
    },
    {
      nombre: 'M2',
      desde: '(2, 0)',
      hasta: '(3, 2)',
      formula: '|2-3| + |0-2| = 1 + 2',
      valor: 3,
    },
    {
      nombre: 'M3',
      desde: '(0, 3)',
      hasta: '(3, 1)',
      formula: '|0-3| + |3-1| = 3 + 2',
      valor: 5,
    },
    {
      nombre: 'Robot→M2',
      desde: '(2, 2)',
      hasta: '(2, 0)',
      formula: 'max(0, 2 - 1)',
      valor: 1,
    },
  ];
}
