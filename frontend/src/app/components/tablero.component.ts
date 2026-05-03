import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EstadoDTO } from '../services/api.service';

@Component({
  selector: 'app-tablero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex flex-col">
      <!-- eje superior -->
      @if (mostrarCoordenadas) {
        <div class="coord-axis coord-axis--top">
          <span *ngFor="let c of columnas">c={{ c }}</span>
        </div>
      }

      <div class="flex">
        <!-- eje izquierdo -->
        @if (mostrarCoordenadas) {
          <div class="coord-axis coord-axis--left">
            <span *ngFor="let f of filas">f={{ f }}</span>
          </div>
        }

        <!-- tablero -->
        <div
          class="rounded-xl overflow-hidden shadow-forest border border-fog/60 bg-white"
        >
          <div *ngFor="let f of filas" class="flex">
            <div
              *ngFor="let c of columnas"
              class="celda"
              [class.celda--lg]="grande"
              [ngClass]="claseCelda(f, c)"
              [title]="tooltip(f, c)"
            >
              {{ contenido(f, c) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TableroComponent {
  @Input({ required: true }) estado!: EstadoDTO;
  @Input() grande = false;
  @Input() mostrarCoordenadas = false;
  @Input() mostrarRobot = true;

  filas = [0, 1, 2, 3];
  columnas = [0, 1, 2, 3];
  paredes: ReadonlyArray<[number, number]> = [
    [0, 1],
    [1, 1],
  ];

  esPared(f: number, c: number): boolean {
    return this.paredes.some(([pf, pc]) => pf === f && pc === c);
  }

  claseCelda(f: number, c: number): Record<string, boolean> {
    const conRobot =
      this.mostrarRobot &&
      this.estado.robot.fila === f &&
      this.estado.robot.columna === c;
    const conInv = Object.entries(this.estado.inventarios).some(
      ([nombre, pos]) =>
        pos.fila === f && pos.columna === c && this.estado.cargando !== nombre,
    );
    return {
      pared: this.esPared(f, c),
      'con-robot': conRobot,
      'con-inv': !conRobot && conInv,
    };
  }

  contenido(f: number, c: number): string {
    if (this.esPared(f, c)) return '';
    const partes: string[] = [];
    if (
      this.mostrarRobot &&
      this.estado.robot.fila === f &&
      this.estado.robot.columna === c
    ) {
      partes.push(this.estado.cargando ? `R+${this.estado.cargando}` : 'R');
    }
    for (const [nombre, pos] of Object.entries(this.estado.inventarios)) {
      if (pos.fila === f && pos.columna === c && this.estado.cargando !== nombre) {
        partes.push(nombre);
      }
    }
    return partes.join(' ');
  }

  tooltip(f: number, c: number): string {
    if (this.esPared(f, c)) return `Pared en (${f}, ${c})`;
    const cont = this.contenido(f, c);
    return cont ? `${cont} en (${f}, ${c})` : `Celda libre (${f}, ${c})`;
  }
}
