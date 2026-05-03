import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService, ArquitecturaDTO } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-10">
      <header class="animate-fadeInUp">
        <h2 class="font-display text-3xl font-semibold text-forest">
          Cómo funciona todo
        </h2>
        <p class="text-sm text-evergreen max-w-3xl mt-2">
          Explicación del problema, del algoritmo A* y de la arquitectura del sistema
          completo. La información viene del backend (endpoint
          <code class="tag">/api/info</code>), así que esta página siempre refleja el
          estado real del proyecto.
        </p>
      </header>

      <!-- 1. Problema -->
      @if (problema()) {
        <article class="card-section animate-fadeInUp">
          <div class="flex items-center gap-3 mb-4">
            <span
              class="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center text-sm font-bold"
            >
              1
            </span>
            <h3 class="font-display text-xl font-semibold text-forest">El problema</h3>
          </div>

          <p class="text-base mb-2 text-evergreen">{{ problema().titulo }}</p>
          <p class="text-sm text-moss mb-6">{{ problema().tablero }}</p>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-display font-semibold text-sm text-evergreen mb-2">
                Posiciones
              </h4>
              <div class="table-wrapper">
                <table class="table table--compact">
                  <thead>
                    <tr>
                      <th>Inventario</th>
                      <th>Inicial</th>
                      <th>Objetivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (k of ['M1', 'M2', 'M3']; track k) {
                      <tr>
                        <td>
                          <span class="tag">{{ k }}</span>
                        </td>
                        <td class="mono">
                          ({{ problema().inventarios[k].inicial.fila }},{{
                            problema().inventarios[k].inicial.columna
                          }})
                        </td>
                        <td class="mono">
                          ({{ problema().inventarios[k].objetivo.fila }},{{
                            problema().inventarios[k].objetivo.columna
                          }})
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <p class="text-sm mt-3 text-evergreen">
                Robot inicial:
                <span class="tag"
                  >({{ problema().robot_inicial.fila }},{{
                    problema().robot_inicial.columna
                  }})</span
                >
              </p>
            </div>

            <div>
              <h4 class="font-display font-semibold text-sm text-evergreen mb-2">
                Decisiones de modelado
              </h4>
              <ul class="space-y-2 text-sm">
                @for (d of problema().decisiones_modelado; track d) {
                  <li class="flex gap-2">
                    <svg
                      class="w-5 h-5 text-pine flex-shrink-0 mt-0.5"
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
                    <span class="text-evergreen">{{ d }}</span>
                  </li>
                }
              </ul>
            </div>
          </div>

          <h4 class="font-display font-semibold text-sm text-evergreen mt-6 mb-2">
            Notación de las acciones
          </h4>
          <pre class="font-mono text-sm bg-fog/30 rounded-lg p-3 text-evergreen border border-fog/60">
@for (a of problema().acciones; track a) {{{ a }}
}</pre>
        </article>
      }

      <!-- 2. Algoritmo -->
      @if (algoritmo()) {
        <article class="card-section animate-fadeInUp">
          <div class="flex items-center gap-3 mb-4">
            <span
              class="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center text-sm font-bold"
            >
              2
            </span>
            <h3 class="font-display text-xl font-semibold text-forest">El algoritmo</h3>
          </div>

          <div class="grid md:grid-cols-2 gap-6 text-sm">
            <div class="space-y-3">
              <p>
                <span class="text-moss">Algoritmo:</span>
                <strong class="text-forest">{{ algoritmo().nombre }}</strong>
              </p>
              <p>
                <span class="text-moss">Heurística:</span>
                <span class="badge badge-info">{{ algoritmo().heuristica }}</span>
              </p>
              <p>
                <span class="text-moss">Lista abierta:</span>
                {{ algoritmo().lista_abierta }}
              </p>
              <p>
                <span class="text-moss">Lista cerrada:</span>
                {{ algoritmo().lista_cerrada }}
              </p>
              <p>
                <span class="text-moss">Desempate:</span>
                {{ algoritmo().desempate }}
              </p>
            </div>
            <div class="space-y-3">
              <div
                class="rounded-xl gradient-primary text-white p-5 font-mono text-lg text-center shadow-forest"
              >
                {{ algoritmo().definicion_f }}
              </div>
              <p class="text-evergreen">
                <strong class="text-forest">g(n):</strong> {{ algoritmo().definicion_g }}
              </p>
              <p class="text-evergreen">
                <strong class="text-forest">h(n):</strong> {{ algoritmo().definicion_h }}
              </p>
              <div class="alert alert-success">
                <div class="alert__content">
                  <div class="alert__title">Admisibilidad</div>
                  {{ algoritmo().admisibilidad }}
                </div>
              </div>
            </div>
          </div>
        </article>
      }

      <!-- 3. Arquitectura -->
      @if (arquitectura()) {
        <article class="card-section animate-fadeInUp">
          <div class="flex items-center gap-3 mb-4">
            <span
              class="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center text-sm font-bold"
            >
              3
            </span>
            <h3 class="font-display text-xl font-semibold text-forest">
              {{ arquitectura()!.titulo }}
            </h3>
          </div>
          <p class="text-sm text-evergreen mb-6 max-w-3xl">
            {{ arquitectura()!.descripcion }}
          </p>

          <h4 class="font-display font-semibold text-sm text-evergreen mb-3">
            Capas del sistema
          </h4>
          <div class="grid md:grid-cols-2 gap-4 mb-6 stagger-children">
            @for (c of arquitectura()!.capas; track c.nombre) {
              <div class="card-feature animate-fadeInUp">
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
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline justify-between gap-2 flex-wrap">
                    <h5 class="font-display font-semibold text-evergreen">{{ c.nombre }}</h5>
                    <span class="tag">{{ c.tecnologia }}</span>
                  </div>
                  <p class="text-sm text-evergreen mt-1.5">{{ c.responsabilidad }}</p>
                  <p class="text-xs text-moss mt-1 font-mono">{{ c.ubicacion }}</p>
                </div>
              </div>
            }
          </div>

          <h4 class="font-display font-semibold text-sm text-evergreen mb-3">
            Flujo de una corrida
          </h4>
          <ol class="space-y-2 stagger-children">
            @for (paso of arquitectura()!.flujo; track paso; let i = $index) {
              <li class="flex gap-3 animate-slideInLeft">
                <span
                  class="w-6 h-6 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  {{ i + 1 }}
                </span>
                <span class="text-sm text-evergreen">{{ paso }}</span>
              </li>
            }
          </ol>
        </article>
      }

      <!-- 4. Entrega y rúbrica -->
      @if (entrega()) {
        <article class="card-section animate-fadeInUp">
          <div class="flex items-center gap-3 mb-4">
            <span
              class="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center text-sm font-bold"
            >
              4
            </span>
            <h3 class="font-display text-xl font-semibold text-forest">
              Entrega y rúbrica
            </h3>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <p class="text-sm">
                <span class="text-moss">Asignatura:</span>
                {{ entrega().asignatura }}
              </p>
              <p class="text-sm mt-1">
                <span class="text-moss">Actividad:</span>
                {{ entrega().actividad }}
              </p>

              <h4 class="font-display font-semibold text-sm text-evergreen mt-5 mb-2">
                Rúbrica
              </h4>
              <div class="table-wrapper">
                <table class="table table--compact">
                  <thead>
                    <tr>
                      <th>Criterio</th>
                      <th class="text-right">Peso</th>
                      <th class="text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (r of entrega().rubrica; track r.criterio) {
                      <tr>
                        <td>{{ r.criterio }}</td>
                        <td class="text-right mono">{{ r.peso }}</td>
                        <td class="text-right">
                          <span class="badge badge-active">{{ r.puntos }}</span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 class="font-display font-semibold text-sm text-evergreen mb-3">
                Resultado actual
              </h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="card-stat">
                  <div class="card-stat__label">h(inicial)</div>
                  <div class="card-stat__value">15</div>
                </div>
                <div class="card-stat">
                  <div class="card-stat__label">Iteraciones</div>
                  <div class="card-stat__value">{{ entrega().resultado.iteraciones }}</div>
                </div>
                <div class="card-stat">
                  <div class="card-stat__label">Coste óptimo</div>
                  <div class="card-stat__value gradient-text">
                    {{ entrega().resultado.coste_optimo }}
                  </div>
                </div>
                <div class="card-stat">
                  <div class="card-stat__label">Tests</div>
                  <div class="card-stat__value">
                    {{ entrega().resultado.tests_pasando }}/24
                  </div>
                </div>
              </div>

              <h4 class="font-display font-semibold text-sm text-evergreen mt-5 mb-2">
                Formato de la memoria
              </h4>
              <p class="text-sm text-evergreen">
                <strong class="text-forest">{{ entrega().formato_memoria.fuente }}</strong>,
                interlineado
                <strong class="text-forest">{{
                  entrega().formato_memoria.interlineado
                }}</strong>,
                {{ entrega().formato_memoria.extension_max }}.
              </p>
              <ul class="mt-2 space-y-1 text-sm">
                @for (s of entrega().formato_memoria.secciones_obligatorias; track s) {
                  <li class="flex gap-2 text-evergreen">
                    <span class="text-pine">•</span>
                    {{ s }}
                  </li>
                }
              </ul>
            </div>
          </div>
        </article>
      }

      @if (error()) {
        <div class="alert alert-error">
          <div class="alert__content">
            <div class="alert__title">Error</div>
            {{ error() }}
          </div>
        </div>
      }
    </section>
  `,
})
export class InfoComponent implements OnInit {
  private api = inject(ApiService);

  arquitectura = signal<ArquitecturaDTO | null>(null);
  algoritmo = signal<any>(null);
  problema = signal<any>(null);
  entrega = signal<any>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    forkJoin({
      arq: this.api.arquitectura(),
      alg: this.api.algoritmo(),
      prob: this.api.problema(),
      ent: this.api.entrega(),
    }).subscribe({
      next: ({ arq, alg, prob, ent }) => {
        this.arquitectura.set(arq);
        this.algoritmo.set(alg);
        this.problema.set(prob);
        this.entrega.set(ent);
      },
      error: () =>
        this.error.set(
          'No se pudo cargar la información del backend. ¿Está corriendo en el puerto 8000?',
        ),
    });
  }
}
