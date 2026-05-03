import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { InfoModalService } from './info-modal.service';

/**
 * Modal global de información enriquecida — patrón documentado en
 * design-system/docs/10-modals.md (overlay + scaleIn + ARIA + focus trap).
 *
 * Renderiza el config provisto por InfoModalService con secciones tipadas:
 * paragraph / callout / kv / bullets / formula / code / definition.
 */
@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modal.config(); as cfg) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
        style="background: rgba(4, 32, 44, 0.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);"
        (click)="cerrarSiOverlay($event)"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'info-modal-title'"
      >
        <div
          #panel
          class="bg-white rounded-2xl shadow-forest-lg w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col animate-scaleIn"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <header
            class="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-fog/40"
          >
            <div class="min-w-0 flex-1">
              @if (cfg.eyebrow) {
                <p
                  class="text-[11px] font-semibold uppercase tracking-wider text-pine mb-1"
                >
                  {{ cfg.eyebrow }}
                </p>
              }
              <div class="flex items-center gap-2.5 flex-wrap">
                <h2
                  id="info-modal-title"
                  class="font-display text-lg font-semibold text-forest"
                >
                  {{ cfg.title }}
                </h2>
                @if (cfg.badge) {
                  <span class="badge" [ngClass]="badgeClass(cfg.badge.variant)">
                    {{ cfg.badge.text }}
                  </span>
                }
              </div>
              @if (cfg.subtitle) {
                <p class="text-sm text-evergreen mt-1">{{ cfg.subtitle }}</p>
              }
            </div>
            <button
              type="button"
              (click)="modal.close()"
              class="btn btn-icon shrink-0"
              aria-label="Cerrar"
              title="Cerrar (Esc)"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          <!-- Body -->
          <div class="px-6 py-5 overflow-y-auto flex-1 space-y-5">
            @for (s of cfg.sections; track $index) {
              @switch (s.kind) {
                @case ('paragraph') {
                  <p
                    class="text-sm text-evergreen leading-relaxed"
                    [innerHTML]="s.html"
                  ></p>
                }

                @case ('callout') {
                  <div
                    class="alert"
                    [ngClass]="{
                      'alert-info': (s.variant ?? 'info') === 'info',
                      'alert-success': s.variant === 'success',
                      'alert-warning': s.variant === 'warning',
                    }"
                  >
                    <div class="alert__content">
                      @if (s.title) {
                        <div class="alert__title">{{ s.title }}</div>
                      }
                      <div [innerHTML]="s.html"></div>
                    </div>
                  </div>
                }

                @case ('kv') {
                  <div>
                    @if (s.title) {
                      <h4
                        class="font-display font-semibold text-sm uppercase tracking-wider text-pine mb-2"
                      >
                        {{ s.title }}
                      </h4>
                    }
                    <div class="table-wrapper">
                      <table class="table table--compact">
                        <tbody>
                          @for (row of s.rows; track row.key) {
                            <tr>
                              <td class="text-evergreen w-1/3">{{ row.key }}</td>
                              <td
                                [class.mono]="row.mono"
                                class="text-forest font-medium"
                              >
                                {{ row.value }}
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                }

                @case ('bullets') {
                  <div>
                    @if (s.title) {
                      <h4
                        class="font-display font-semibold text-sm uppercase tracking-wider text-pine mb-2"
                      >
                        {{ s.title }}
                      </h4>
                    }
                    <ul
                      class="space-y-1.5 text-sm text-evergreen list-disc pl-5"
                    >
                      @for (item of s.items; track $index) {
                        <li [innerHTML]="item"></li>
                      }
                    </ul>
                  </div>
                }

                @case ('formula') {
                  <div>
                    <div
                      class="rounded-xl gradient-primary text-white px-5 py-4 font-mono text-center text-base shadow-forest"
                      [innerHTML]="s.expression"
                    ></div>
                    @if (s.explanation) {
                      <p
                        class="text-xs text-moss text-center mt-2 italic"
                        [innerHTML]="s.explanation"
                      ></p>
                    }
                  </div>
                }

                @case ('code') {
                  <pre
                    class="font-mono text-xs leading-relaxed text-evergreen bg-fog/30 rounded-lg p-4 overflow-x-auto"
                  ><code>{{ s.lines.join('\n') }}</code></pre>
                }

                @case ('definition') {
                  <div class="border-l-2 border-pine pl-4">
                    <p
                      class="font-display font-semibold text-forest text-sm mb-1"
                    >
                      {{ s.term }}
                    </p>
                    <p
                      class="text-sm text-evergreen leading-relaxed"
                      [innerHTML]="s.html"
                    ></p>
                  </div>
                }
              }
            }
          </div>

          <!-- Footer -->
          @if (cfg.footnote) {
            <footer
              class="px-6 py-3 border-t border-fog/40 text-xs text-moss"
              [innerHTML]="cfg.footnote"
            ></footer>
          }
        </div>
      </div>
    }
  `,
})
export class InfoModalComponent implements AfterViewInit {
  readonly modal = inject(InfoModalService);

  @ViewChild('panel') panelRef?: ElementRef<HTMLElement>;

  constructor() {
    // Cuando se abre el modal, dar foco al primer elemento focuseable
    effect(() => {
      if (this.modal.config()) {
        // microtask para permitir que el DOM se renderice
        queueMicrotask(() => this.darFocoInicial());
      }
    });
  }

  ngAfterViewInit(): void {
    /* viewchild listo */
  }

  cerrarSiOverlay(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) {
      this.modal.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modal.config()) this.modal.close();
  }

  @HostListener('document:keydown.tab', ['$event'])
  onTab(ev: Event): void {
    if (!this.modal.config() || !this.panelRef) return;
    const kev = ev as KeyboardEvent;
    const root = this.panelRef.nativeElement;
    const focusables = root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (kev.shiftKey && active === first) {
      kev.preventDefault();
      last.focus();
    } else if (!kev.shiftKey && active === last) {
      kev.preventDefault();
      first.focus();
    }
  }

  badgeClass(variant?: string): string {
    return {
      active: 'badge-active',
      info: 'badge-info',
      warning: 'badge-warning',
      inactive: 'badge-inactive',
    }[variant ?? 'info'] ?? 'badge-info';
  }

  private darFocoInicial(): void {
    const root = this.panelRef?.nativeElement;
    if (!root) return;
    const btn = root.querySelector<HTMLElement>('button[aria-label="Cerrar"]');
    btn?.focus();
  }
}
