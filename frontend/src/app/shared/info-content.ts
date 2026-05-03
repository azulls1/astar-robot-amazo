import { ModalConfig } from './info-modal.types';

/* ═══════════════════════════════════════════════════════════════════════
   KPIs DEL ALGORITMO
   ═══════════════════════════════════════════════════════════════════════ */

export const KPI_H_INICIAL: ModalConfig = {
  eyebrow: 'Heurística',
  title: 'h(inicial) = 15',
  subtitle: 'Estimación admisible del coste restante desde el estado inicial',
  badge: { text: 'Manhattan', variant: 'info' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'Es la <strong>distancia de Manhattan</strong> sumada de cada inventario a su objetivo, más un ajuste por la posición del robot. Como el robot solo se mueve N/S/E/O y cada acción cuesta 1, esta suma es una <strong>cota inferior</strong> del coste real — por eso A* devuelve solución óptima.',
    },
    {
      kind: 'kv',
      title: 'Descomposición',
      rows: [
        { key: 'M1: (0,0) → (3,3)', value: '|0-3| + |0-3| = 6', mono: true },
        { key: 'M2: (2,0) → (3,2)', value: '|2-3| + |0-2| = 3', mono: true },
        { key: 'M3: (0,3) → (3,1)', value: '|0-3| + |3-1| = 5', mono: true },
        { key: 'Robot → M2 más cerca', value: 'max(0, 2-1) = 1', mono: true },
        { key: 'Total h(inicial)', value: '6 + 3 + 5 + 1 = 15', mono: true },
      ],
    },
    {
      kind: 'callout',
      variant: 'success',
      title: '¿Por qué es admisible?',
      html:
        'Cada componente ignora paredes y mecánica de carga/descarga, y suma cotas inferiores independientes. Resultado: <code class="tag">h(n) ≤ coste_real(n)</code> siempre.',
    },
  ],
  footnote: 'Cubre el <strong>criterio 2 (20%)</strong> de la rúbrica.',
};

export const KPI_ITERACIONES: ModalConfig = {
  eyebrow: 'A*',
  title: 'Iteraciones = 323',
  subtitle: 'Cantidad de nodos extraídos de la lista abierta y expandidos',
  badge: { text: 'criterio 3 · 20%', variant: 'info' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'En cada iteración A* hace tres cosas: (1) saca de la <strong>lista abierta</strong> el nodo con menor <code class="tag">f = g + h</code>, (2) lo agrega a la <strong>lista cerrada</strong>, y (3) genera sus sucesores. Si un sucesor mejora g respecto a un duplicado en cerrada, se reabre.',
    },
    {
      kind: 'kv',
      title: 'Política de desempate',
      rows: [
        { key: 'Por menor f', value: 'orden principal en la cola', mono: false },
        { key: 'Por menor h', value: 'preferimos cerca del objetivo', mono: false },
        { key: 'Por orden FIFO', value: 'desempate final estable', mono: false },
      ],
    },
    {
      kind: 'callout',
      variant: 'info',
      html:
        'La <strong>traza completa</strong> de las 323 iteraciones está en <code class="tag">salidas/traza_completa.txt</code> y se entrega como anexo de la memoria.',
    },
  ],
};

export const KPI_GENERADOS: ModalConfig = {
  eyebrow: 'A*',
  title: 'Nodos generados = 836',
  subtitle: 'Total de estados creados durante la búsqueda',
  badge: { text: 'memoria', variant: 'inactive' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'Por cada iteración A* genera entre 1 y ~6 sucesores (4 movimientos + cargar + descargar cuando aplican). No todos llegan a expandirse: muchos se descartan por estar en cerrada con mejor g, o por f peor que el actual.',
    },
    {
      kind: 'kv',
      rows: [
        { key: 'Iteraciones (expandidos)', value: '323', mono: true },
        { key: 'Generados totales', value: '836', mono: true },
        { key: 'Factor de ramificación medio', value: '836 / 323 ≈ 2.59', mono: true },
      ],
    },
    {
      kind: 'paragraph',
      html:
        'El factor de ramificación efectivo es bajo porque la heurística poda <strong>caminos no prometedores</strong> antes de expandirlos.',
    },
  ],
};

export const KPI_COSTE: ModalConfig = {
  eyebrow: 'Resultado',
  title: 'Coste óptimo g* = 19',
  subtitle: 'Mínimo número de acciones para llegar al estado objetivo',
  badge: { text: 'criterio 4 · 20%', variant: 'active' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'A* devuelve la <strong>solución óptima garantizada</strong> porque la heurística es admisible. Cualquier secuencia válida tiene al menos 19 acciones; nuestra solución alcanza ese mínimo.',
    },
    {
      kind: 'kv',
      title: 'Composición de las 19 acciones',
      rows: [
        { key: 'Movimientos (N/S/E/O)', value: '13 acciones', mono: false },
        { key: 'Cargar', value: '3 acciones (uno por inventario)', mono: false },
        { key: 'Descargar', value: '3 acciones (uno por objetivo)', mono: false },
      ],
    },
    {
      kind: 'callout',
      variant: 'success',
      html:
        'Como <code class="tag">g(inicial) = 0</code> y <code class="tag">h(inicial) = 15</code>, sabemos que <code class="tag">f(meta) = g* = 19 ≥ 15</code>, consistente con la admisibilidad.',
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   ACCIONES DEL ROBOT
   ═══════════════════════════════════════════════════════════════════════ */

export const ACCION_MOVER: ModalConfig = {
  eyebrow: 'Acción primitiva',
  title: 'mover(dirección)',
  subtitle: 'El robot avanza una celda en dirección N/S/E/O',
  badge: { text: 'coste 1', variant: 'inactive' },
  sections: [
    {
      kind: 'kv',
      title: 'Precondiciones',
      rows: [
        { key: 'Celda destino dentro del 4×4', value: 'sí' },
        { key: 'Celda destino no es pared', value: 'sí' },
        { key: 'Celda destino no contiene inventario', value: 'sí (excepto si lo carga)' },
      ],
    },
    {
      kind: 'kv',
      title: 'Efectos',
      rows: [
        { key: 'Posición del robot', value: 'fila/columna ±1' },
        { key: 'Si lleva inventario', value: 'el inventario se mueve con él' },
        { key: 'Coste g', value: '+1' },
      ],
    },
    {
      kind: 'paragraph',
      html:
        'En la traza del solver aparece como <code class="tag">mover_norte</code>, <code class="tag">mover_sur</code>, <code class="tag">mover_este</code> o <code class="tag">mover_oeste</code>.',
    },
  ],
};

export const ACCION_CARGAR: ModalConfig = {
  eyebrow: 'Acción primitiva',
  title: 'cargar(Mi)',
  subtitle: 'El robot toma un inventario adyacente',
  badge: { text: 'coste 1', variant: 'info' },
  sections: [
    {
      kind: 'kv',
      title: 'Precondiciones',
      rows: [
        { key: 'Robot no está cargando otro inventario', value: 'sí' },
        { key: 'Inventario Mi en celda adyacente (Manhattan = 1)', value: 'sí' },
      ],
    },
    {
      kind: 'kv',
      title: 'Efectos',
      rows: [
        { key: 'Robot.cargando', value: 'pasa a "Mi"' },
        { key: 'Posición de Mi', value: 'pasa a la del robot' },
        { key: 'Coste g', value: '+1' },
      ],
    },
    {
      kind: 'callout',
      variant: 'info',
      html:
        'Modelado: <strong>cargar es una acción explícita con coste 1</strong>, no es gratis — esto evita que A* encuentre soluciones "tramposas" que carguen y descarguen sin coste real.',
    },
  ],
};

export const ACCION_DESCARGAR: ModalConfig = {
  eyebrow: 'Acción primitiva',
  title: 'descargar()',
  subtitle: 'El robot deja el inventario que carga',
  badge: { text: 'coste 1', variant: 'active' },
  sections: [
    {
      kind: 'kv',
      title: 'Precondiciones',
      rows: [
        { key: 'Robot está cargando un inventario', value: 'sí' },
        { key: 'Celda actual o adyacente está libre', value: 'sí' },
      ],
    },
    {
      kind: 'kv',
      title: 'Efectos',
      rows: [
        { key: 'Robot.cargando', value: 'pasa a null' },
        { key: 'Posición del inventario', value: 'queda en la celda de descarga' },
        { key: 'Coste g', value: '+1' },
      ],
    },
    {
      kind: 'paragraph',
      html:
        'En la solución óptima descargamos exactamente en la celda objetivo del inventario — descargar antes obligaría a cargarlo de nuevo más adelante (coste extra).',
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   ELEMENTOS DEL TABLERO
   ═══════════════════════════════════════════════════════════════════════ */

export const TABLERO_ROBOT: ModalConfig = {
  eyebrow: 'Elemento del tablero',
  title: 'Robot R',
  subtitle: 'El agente que ejecuta acciones',
  badge: { text: 'agente', variant: 'active' },
  sections: [
    {
      kind: 'kv',
      title: 'Estado',
      rows: [
        { key: 'Posición inicial', value: '(2, 2)', mono: true },
        { key: 'Posición final', value: 'libre · cualquier celda', mono: false },
        { key: 'Capacidad', value: '1 inventario a la vez', mono: false },
      ],
    },
    {
      kind: 'paragraph',
      html:
        'El robot puede ejecutar 6 acciones: 4 movimientos cardinales + cargar + descargar. Cuando lleva un inventario, este viaja con él y la celda donde estaba el inventario queda libre.',
    },
  ],
};

export const TABLERO_PARED: ModalConfig = {
  eyebrow: 'Elemento del tablero',
  title: 'Paredes #',
  subtitle: 'Celdas obstáculo en (0,1) y (1,1)',
  badge: { text: 'obstáculo', variant: 'warning' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'Las paredes son celdas <strong>infranqueables</strong>: el robot no puede entrar y los inventarios no pueden ser depositados ahí. La heurística de Manhattan ignora las paredes (sigue siendo cota inferior porque rodearlas solo añade coste).',
    },
    {
      kind: 'kv',
      title: 'Posiciones',
      rows: [
        { key: 'Pared 1', value: '(0, 1)', mono: true },
        { key: 'Pared 2', value: '(1, 1)', mono: true },
      ],
    },
  ],
};

export function inventarioModal(
  nombre: 'M1' | 'M2' | 'M3',
  desde: string,
  hasta: string,
  manhattan: number,
): ModalConfig {
  return {
    eyebrow: 'Inventario',
    title: nombre,
    subtitle: `${desde} → ${hasta}`,
    badge: { text: `h += ${manhattan}`, variant: 'info' },
    sections: [
      {
        kind: 'kv',
        title: 'Posiciones',
        rows: [
          { key: 'Posición inicial', value: desde, mono: true },
          { key: 'Posición objetivo', value: hasta, mono: true },
          { key: 'Manhattan', value: `${manhattan} pasos`, mono: false },
        ],
      },
      {
        kind: 'paragraph',
        html: `Para mover ${nombre} desde su origen al objetivo, el robot debe (1) llegar adyacente al inventario, (2) ejecutar <code class="tag">cargar(${nombre})</code>, (3) caminar hasta la celda objetivo, (4) ejecutar <code class="tag">descargar()</code>. Manhattan ignora las paredes — por eso es solo cota inferior.`,
      },
    ],
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   FUNCIÓN f(n) — g, h, f
   ═══════════════════════════════════════════════════════════════════════ */

export const F_DE_G: ModalConfig = {
  eyebrow: 'A*',
  title: 'g(n) — coste real acumulado',
  subtitle: 'Número de acciones desde el estado inicial hasta n',
  sections: [
    {
      kind: 'paragraph',
      html:
        'Es la suma de costes de las acciones tomadas para llegar al nodo <code class="tag">n</code>. Como <strong>cada acción cuesta 1</strong>, equivale al número de acciones realizadas. Es información <em>conocida</em>, no estimada.',
    },
    {
      kind: 'formula',
      expression: 'g(n) = g(padre) + 1',
    },
    {
      kind: 'kv',
      rows: [
        { key: 'Estado inicial', value: 'g = 0' },
        { key: 'Cualquier sucesor', value: 'g(padre) + 1' },
        { key: 'En la solución óptima', value: 'g* = 19' },
      ],
    },
  ],
};

export const F_DE_H: ModalConfig = {
  eyebrow: 'A*',
  title: 'h(n) — heurística admisible',
  subtitle: 'Estimación del coste restante hasta el objetivo',
  badge: { text: 'admisible', variant: 'active' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'Suma de Manhattan de cada inventario a su objetivo + ajuste por la posición del robot al inventario más cercano. Nunca sobreestima — por eso A* es óptimo.',
    },
    {
      kind: 'formula',
      expression:
        'h(n) = Σ manhattan(M<sub>i</sub>, obj<sub>i</sub>) + ajuste(robot)',
    },
    {
      kind: 'callout',
      variant: 'success',
      title: 'Propiedades',
      html:
        'Admisible (h ≤ coste real), eficiente (O(1) por nodo) y consistente con la métrica del problema.',
    },
  ],
};

export const F_DE_F: ModalConfig = {
  eyebrow: 'A*',
  title: 'f(n) — función de evaluación',
  subtitle: 'Lo que ordena la lista abierta',
  badge: { text: 'criterio 2 · 20%', variant: 'info' },
  sections: [
    {
      kind: 'formula',
      expression: 'f(n) = g(n) + h(n)',
      explanation: 'coste hasta n + estimación de lo que falta',
    },
    {
      kind: 'paragraph',
      html:
        'Es la <strong>llave de prioridad</strong> en la cola abierta. A* siempre expande el nodo con menor f. En cada iteración se imprime f junto a g y h para que la rúbrica pueda verificarse.',
    },
    {
      kind: 'kv',
      title: 'Verificación con el estado inicial',
      rows: [
        { key: 'g(inicial)', value: '0', mono: true },
        { key: 'h(inicial)', value: '15', mono: true },
        { key: 'f(inicial)', value: '0 + 15 = 15', mono: true },
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   PROPIEDADES DE LA HEURÍSTICA
   ═══════════════════════════════════════════════════════════════════════ */

export const PROP_ADMISIBLE: ModalConfig = {
  eyebrow: 'Propiedad',
  title: 'Admisible',
  subtitle: 'Nunca sobreestima el coste real',
  badge: { text: 'óptimo garantizado', variant: 'active' },
  sections: [
    {
      kind: 'definition',
      term: 'Definición formal',
      html:
        'Una heurística <code class="tag">h</code> es <strong>admisible</strong> si <code class="tag">h(n) ≤ h*(n)</code> para todo nodo <code class="tag">n</code>, donde <code class="tag">h*(n)</code> es el coste real óptimo desde n al objetivo.',
    },
    {
      kind: 'paragraph',
      html:
        'Si <code class="tag">h</code> es admisible, A* devuelve solución óptima cuando termina. Esta es la propiedad más importante para que la rúbrica acepte el algoritmo como correcto.',
    },
    {
      kind: 'bullets',
      title: 'Por qué la nuestra es admisible',
      items: [
        'Manhattan cuenta solo pasos cardinales — el robot tiene que dar al menos esos pasos.',
        'Ignoramos paredes — rodearlas solo puede añadir coste, nunca quitarlo.',
        'Ignoramos la mecánica cargar/descargar — añadirlas solo aumenta el coste real.',
        'Sumamos cotas inferiores independientes — la suma sigue siendo cota inferior.',
      ],
    },
  ],
};

export const PROP_EFICIENTE: ModalConfig = {
  eyebrow: 'Propiedad',
  title: 'Eficiente',
  subtitle: 'O(1) por nodo',
  sections: [
    {
      kind: 'paragraph',
      html:
        'El cálculo de h(n) consiste en 3 sumas de Manhattan + 1 mínimo entre 3 valores. Es <strong>tiempo constante</strong> independiente del tamaño del problema, y no requiere precomputación ni memoria adicional.',
    },
    {
      kind: 'code',
      lines: [
        'def h(estado):',
        '    total = sum(manhattan(inv, obj) for inv, obj in pares)',
        '    if estado.cargando is None:',
        '        total += min(manhattan(robot, inv) for inv in libres)',
        '    return total',
      ],
    },
  ],
};

export const PROP_DETERMINISTA: ModalConfig = {
  eyebrow: 'Propiedad',
  title: 'Determinista',
  subtitle: 'Misma entrada → misma salida',
  sections: [
    {
      kind: 'paragraph',
      html:
        'Manhattan es una función pura: <code class="tag">|f₁−f₂| + |c₁−c₂|</code> sin estado, sin aleatoriedad, sin dependencias externas. Para un mismo estado siempre devuelve el mismo h, y la cola abierta usa orden estable — por lo tanto las trazas de A* son <strong>reproducibles</strong> entre corridas.',
    },
    {
      kind: 'callout',
      variant: 'info',
      html:
        'Esto es importante para la rúbrica: el profesor puede correr el código y obtener exactamente las mismas 323 iteraciones que aparecen en la memoria.',
    },
  ],
};

export const PROP_COMPOSITIVA: ModalConfig = {
  eyebrow: 'Propiedad',
  title: 'Compositiva',
  subtitle: 'Suma de cotas inferiores independientes',
  sections: [
    {
      kind: 'paragraph',
      html:
        'Cada inventario aporta su propia Manhattan; el robot aporta su acercamiento al inventario más cercano. Como cada subproblema es <strong>independiente</strong> del resto y cada componente es cota inferior, su <strong>suma</strong> sigue siendo cota inferior del coste total.',
    },
    {
      kind: 'paragraph',
      html:
        'Esta propiedad permite que la heurística sea más informativa que el "máximo entre componentes" sin sacrificar admisibilidad.',
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   RÚBRICA — 4 CRITERIOS
   ═══════════════════════════════════════════════════════════════════════ */

export const RUB_LOGICA: ModalConfig = {
  eyebrow: 'Rúbrica · criterio 1',
  title: 'Lógica del algoritmo A*',
  subtitle: 'Implementación correcta del algoritmo',
  badge: { text: '40% · 4 pts', variant: 'active' },
  sections: [
    {
      kind: 'bullets',
      title: 'Qué exige el criterio',
      items: [
        'Lista abierta con orden por f = g + h.',
        'Lista cerrada con mejor-g por estado.',
        'Generación correcta de sucesores con sus precondiciones y efectos.',
        'Reapertura desde cerrada cuando se descubre un mejor g.',
        'Terminación cuando se expande un estado objetivo.',
      ],
    },
    {
      kind: 'callout',
      variant: 'success',
      title: 'Evidencia',
      html:
        'Implementación en <code class="tag">backend/app/solver/</code> (stdlib-only) con 24/24 tests unittest pasando.',
    },
  ],
};

export const RUB_F: ModalConfig = {
  eyebrow: 'Rúbrica · criterio 2',
  title: 'Cálculo correcto de f(n)',
  subtitle: 'g, h y f por cada estado expandido',
  badge: { text: '20% · 2 pts', variant: 'info' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'En cada iteración la traza imprime <code class="tag">g</code>, <code class="tag">h</code> y <code class="tag">f = g + h</code> del nodo expandido. h(inicial) = 15 verificable a mano (ver vista <strong>Heurística</strong>).',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'Verificación',
      html:
        'La vista <strong>Heurística</strong> incluye una tabla con la descomposición de h(inicial) componente por componente.',
    },
  ],
};

export const RUB_LISTAS: ModalConfig = {
  eyebrow: 'Rúbrica · criterio 3',
  title: 'Listas abierta y cerrada por iteración',
  subtitle: 'Tamaños y contenido a lo largo de la búsqueda',
  badge: { text: '20% · 2 pts', variant: 'info' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'La traza incluye, en cada iteración, <code class="tag">|abierta|</code> y <code class="tag">|cerrada|</code>. La traza completa con los estados de ambas listas se anexa en <code class="tag">salidas/traza_completa.txt</code>.',
    },
    {
      kind: 'callout',
      variant: 'info',
      html:
        'La vista <strong>Iteraciones</strong> permite filtrar por valor de f y muestra la distribución — útil para validar la progresión.',
    },
  ],
};

export const RUB_SECUENCIA: ModalConfig = {
  eyebrow: 'Rúbrica · criterio 4',
  title: 'Secuencia final correcta',
  subtitle: '19 acciones óptimas en notación del enunciado',
  badge: { text: '20% · 2 pts', variant: 'active' },
  sections: [
    {
      kind: 'paragraph',
      html:
        'La secuencia óptima encontrada por A* tiene exactamente <strong>19 acciones</strong>: 13 movimientos + 3 cargar + 3 descargar. Se imprime numerada y con tipo de acción.',
    },
    {
      kind: 'kv',
      rows: [
        { key: 'Total acciones', value: '19' },
        { key: 'Coste óptimo g*', value: '19 (cada acción cuesta 1)', mono: false },
        { key: 'Tipos', value: 'mover · cargar · descargar' },
      ],
    },
  ],
};
