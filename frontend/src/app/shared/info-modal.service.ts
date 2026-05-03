import { Injectable, signal } from '@angular/core';
import { ModalConfig } from './info-modal.types';

/**
 * Servicio único para abrir el modal global desde cualquier componente.
 * Se inyecta como `providedIn: 'root'` y mantiene un signal con la config
 * actual o null cuando no hay modal abierto.
 */
@Injectable({ providedIn: 'root' })
export class InfoModalService {
  /** Config del modal actual; null cuando está cerrado */
  readonly config = signal<ModalConfig | null>(null);

  /** Elemento que abrió el modal — se le devuelve el foco al cerrar */
  private trigger: HTMLElement | null = null;

  /** Abre el modal con la configuración indicada */
  open(config: ModalConfig, trigger?: HTMLElement | null): void {
    this.trigger = trigger ?? (document.activeElement as HTMLElement | null);
    this.config.set(config);
    document.body.style.overflow = 'hidden';
  }

  /** Cierra el modal y devuelve el foco al trigger */
  close(): void {
    this.config.set(null);
    document.body.style.overflow = '';
    if (this.trigger && typeof this.trigger.focus === 'function') {
      this.trigger.focus();
    }
    this.trigger = null;
  }
}
