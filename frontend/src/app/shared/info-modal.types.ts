/**
 * Tipos para el sistema de modales de información enriquecida.
 *
 * Una sección discriminada por `kind` permite que cada KPI / acción / criterio
 * defina su contenido como datos estructurados — el componente sabe cómo
 * renderizar cada tipo sin acoplarse al contenido específico.
 */

export type ModalSection =
  | { kind: 'paragraph'; html: string }
  | { kind: 'callout'; variant?: 'info' | 'success' | 'warning'; title?: string; html: string }
  | { kind: 'kv'; title?: string; rows: Array<{ key: string; value: string; mono?: boolean }> }
  | { kind: 'bullets'; title?: string; items: string[] }
  | { kind: 'formula'; expression: string; explanation?: string }
  | { kind: 'code'; language?: string; lines: string[] }
  | { kind: 'definition'; term: string; html: string };

export interface ModalBadge {
  text: string;
  variant?: 'active' | 'info' | 'warning' | 'inactive';
}

export interface ModalConfig {
  /** Pre-titulo en mayúsculas (eyebrow) */
  eyebrow?: string;
  /** Título principal del modal */
  title: string;
  /** Subtítulo breve debajo del título */
  subtitle?: string;
  /** Badge opcional al lado del título (peso/criterio/categoría) */
  badge?: ModalBadge;
  /** Secciones del cuerpo, en orden */
  sections: ModalSection[];
  /** Pie con nota o referencia (texto/HTML) */
  footnote?: string;
}
