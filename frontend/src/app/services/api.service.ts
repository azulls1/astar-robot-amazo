import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PosicionDTO {
  fila: number;
  columna: number;
}

export interface EstadoDTO {
  robot: PosicionDTO;
  cargando: string | null;
  inventarios: { [k: string]: PosicionDTO };
}

export interface AccionDTO {
  paso: number;
  tipo: 'mover' | 'cargar' | 'descargar';
  inventario: string | null;
  destino: PosicionDTO;
  descripcion: string;
}

export interface IteracionDTO {
  n: number;
  estado: EstadoDTO;
  g: number;
  h: number;
  f: number;
  abierta_size: number;
  cerrada_size: number;
}

export interface SolveResponse {
  encontrado: boolean;
  iteraciones: number;
  nodos_generados: number;
  coste_total: number;
  h_inicial: number;
  secuencia: AccionDTO[];
  iteraciones_detalle: IteracionDTO[];
}

export interface EntregableDTO {
  id: string;
  nombre: string;
  descripcion: string;
  archivo: string;
  tamano_bytes: number;
  url_descarga: string;
  tipo_mime: string;
}

export interface ArquitecturaDTO {
  titulo: string;
  descripcion: string;
  capas: Array<{
    nombre: string;
    tecnologia: string;
    responsabilidad: string;
    ubicacion: string;
  }>;
  flujo: string[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  estadoInicial(): Observable<EstadoDTO> {
    return this.http.get<EstadoDTO>(`${this.base}/api/solver/inicial`);
  }

  resolver(): Observable<SolveResponse> {
    return this.http.post<SolveResponse>(`${this.base}/api/solver/solve`, {});
  }

  entregables(): Observable<EntregableDTO[]> {
    return this.http.get<EntregableDTO[]>(`${this.base}/api/entregables`);
  }

  urlDescarga(eid: string): string {
    return `${this.base}/api/entregables/${eid}/descarga`;
  }

  arquitectura(): Observable<ArquitecturaDTO> {
    return this.http.get<ArquitecturaDTO>(`${this.base}/api/info/arquitectura`);
  }

  algoritmo(): Observable<any> {
    return this.http.get<any>(`${this.base}/api/info/algoritmo`);
  }

  problema(): Observable<any> {
    return this.http.get<any>(`${this.base}/api/info/problema`);
  }

  entrega(): Observable<any> {
    return this.http.get<any>(`${this.base}/api/info/entrega`);
  }
}
