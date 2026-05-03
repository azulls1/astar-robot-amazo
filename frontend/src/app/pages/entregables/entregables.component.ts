import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService, EntregableDTO } from '../../services/api.service';

@Component({
  selector: 'app-entregables',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-8">
      <header class="animate-fadeInUp">
        <h2 class="font-display text-3xl font-semibold text-forest">Entregables</h2>
        <p class="text-sm text-evergreen max-w-2xl mt-2">
          Todo lo que el profesor pide está aquí: memoria académica en formato Word,
          trazas de ejecución y código fuente. Descarga lo que necesites o el
          paquete completo listo para subir al aula virtual.
        </p>
      </header>

      <div class="alert alert-warning animate-fadeInUp">
        <div class="alert__icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div class="alert__content">
          <div class="alert__title">Checklist de entrega oficial</div>
          <ul class="list-disc pl-5 mt-1 space-y-0.5 text-sm">
            <li>Memoria en Word o Jupyter (Calibri 12, interlineado 1.5, máx. 10 páginas).</li>
            <li>Código fuente documentado, ejecutable, con la salida del programa.</li>
            <li>Secuencia de acciones final del robot en notación del enunciado.</li>
            <li>Listas abierta y cerrada por iteración con g, h, f.</li>
            <li>Portada con nombres del equipo, asignatura y referencias en APA.</li>
          </ul>
        </div>
      </div>

      @if (cargando()) {
        <div class="grid md:grid-cols-2 gap-4">
          <div class="skeleton" style="height:160px;"></div>
          <div class="skeleton" style="height:160px;"></div>
          <div class="skeleton" style="height:160px;"></div>
          <div class="skeleton" style="height:160px;"></div>
        </div>
      }

      @if (error()) {
        <div class="alert alert-error">
          <div class="alert__content">
            <div class="alert__title">Error</div>
            {{ error() }}
          </div>
        </div>
      }

      @if (items().length > 0) {
        <div class="grid md:grid-cols-2 gap-4 stagger-children">
          @for (e of items(); track e.id) {
            <article
              class="card hover-lift animate-fadeInUp flex flex-col gap-4"
              [class.opacity-60]="e.tamano_bytes === 0"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  [ngClass]="claseIcono(e)"
                >
                  {{ icono(e) }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-display font-semibold text-forest">{{ e.nombre }}</h3>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <code class="tag">{{ e.archivo }}</code>
                    <span class="text-xs text-moss">{{ formatTamano(e.tamano_bytes) }}</span>
                  </div>
                </div>
              </div>

              <p class="text-sm text-evergreen flex-1">{{ e.descripcion }}</p>

              @if (e.tamano_bytes > 0) {
                <a [href]="urlAbsoluta(e)" [download]="e.archivo" class="btn btn-primary w-full">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                    />
                  </svg>
                  Descargar
                </a>
              } @else {
                <button class="btn btn-secondary w-full" disabled>Pendiente de generar</button>
              }
            </article>
          }
        </div>
      }

      <article class="card-section glass animate-fadeInUp">
        <h4 class="font-display text-base font-semibold text-forest mb-3">
          Cómo regenerar los entregables
        </h4>
        <pre class="font-mono text-xs leading-relaxed text-evergreen whitespace-pre-wrap">
# Memoria DOCX desde la fuente Markdown
python scripts/generar_memoria_docx.py

# Trazas
python -m backend.app.solver.main &gt; salidas/traza_corrida_final.txt
python -m backend.app.solver.main --completa &gt; salidas/traza_completa.txt

# Capturas del frontend (requiere backend + frontend corriendo)
python scripts/generar_capturas.py

# ZIPs (código y paquete completo)
python scripts/empaquetar_entregables.py</pre>
      </article>
    </section>
  `,
})
export class EntregablesComponent implements OnInit {
  private api = inject(ApiService);

  items = signal<EntregableDTO[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.api.entregables().subscribe({
      next: (xs) => {
        this.items.set(xs);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de entregables.');
        this.cargando.set(false);
      },
    });
  }

  urlAbsoluta(e: EntregableDTO): string {
    return this.api.urlDescarga(e.id);
  }

  icono(e: EntregableDTO): string {
    if (e.archivo.endsWith('.docx')) return '📄';
    if (e.archivo.endsWith('.zip')) return '📦';
    if (e.archivo.endsWith('.txt')) return '📝';
    if (e.archivo.endsWith('.md')) return '📋';
    return '📁';
  }

  claseIcono(e: EntregableDTO): string {
    if (e.archivo.endsWith('.docx')) return 'bg-fog/60';
    if (e.archivo.endsWith('.zip')) return 'gradient-primary text-white';
    if (e.archivo.endsWith('.txt')) return 'bg-fog/40';
    return 'bg-fog/30';
  }

  formatTamano(bytes: number): string {
    if (bytes === 0) return 'pendiente';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
}
