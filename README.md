# astar_robot_amazon — A\* Robot Amazon (full-stack)

Sistema completo: solver A\* académico (lo evaluable por la rúbrica) + wrapper
full-stack (FastAPI + Celery + Redis + Angular 20 + Tailwind 4) + despliegue.

> **Requisitos y specs** → `../Requerimientos de la actividad/`
> **Credenciales** → `../_local/credenciales.env` (no entregable)

---

## Resultado

```
Solver A* — Robot Amazon  (matriz 4×4, 3 inventarios)
  Heurística: Distancia de Manhattan
  h(inicial) = 15      Iteraciones = 323      Nodos generados = 836
  Coste óptimo: 19      Tests pasando: 24/24
```

## Estructura

```
astar_robot_amazon/
├── backend/                          # Python 3.13
│   ├── app/
│   │   ├── solver/                   # ★ Núcleo evaluado (stdlib-only)
│   │   ├── api/routers/              #   /api/solver, /api/entregables, /api/info
│   │   ├── core/config.py            #   Settings (.env)
│   │   ├── tasks/solver_task.py      #   Celery task
│   │   ├── celery_app.py
│   │   └── main.py                   #   FastAPI app
│   ├── tests/                        # 24 tests unittest
│   └── requirements.txt
├── frontend/                         # Angular 20 + Tailwind 4
│   └── src/app/
│       ├── pages/solver/             # Vista 1: ejecuta A* en vivo
│       ├── pages/entregables/        # Vista 2: descargas para entregar
│       ├── pages/info/               # Vista 3: cómo funciona todo
│       └── services/api.service.ts
├── infra/                            # Docker Compose + Dockerfiles + nginx
├── scripts/
│   ├── empaquetar_entregables.py     # Genera entregables/*.zip
│   └── generar_memoria_docx.py       # Convierte memoria.md → memoria.docx
├── memoria/
│   ├── memoria.md                    # Fuente
│   └── memoria.docx                  # ★ Para entregar (Calibri 12, 1.5)
├── salidas/
│   ├── traza_corrida_final.txt       # Salida compacta del solver
│   └── traza_completa.txt            # Las 323 iteraciones detalladas
└── entregables/
    ├── codigo_fuente.zip
    └── paquete_entrega.zip           # Memoria + trazas + código (subir al aula)
```

## Cómo correr todo

### Solver A\* puro (lo único que la rúbrica evalúa)

```bash
python -m backend.app.solver.main                       # corrida con traza compacta
python -m backend.app.solver.main --completa            # traza completa de 323 iter
python -m backend.app.solver.main > salidas/traza_corrida_final.txt
python -m unittest discover -s backend/tests            # 24 tests
```

### Backend FastAPI

```bash
python -m pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

Endpoints:

| Método | Ruta                       | Qué hace |
|---|---|---|
| GET  | `/api/health`              | Health check |
| GET  | `/api/solver/inicial`      | Estado inicial del problema |
| POST | `/api/solver/solve`        | Corre A\* y devuelve traza estructurada + secuencia |
| GET  | `/api/entregables`         | Lista los archivos descargables |
| GET  | `/api/entregables/{id}/descarga` | Descarga el archivo |
| GET  | `/api/info/arquitectura`   | Capas del sistema y flujo |
| GET  | `/api/info/algoritmo`      | A\* + heurística |
| GET  | `/api/info/problema`       | Modelado del problema |
| GET  | `/api/info/entrega`        | Rúbrica + formato + resultado |

### Frontend Angular

```bash
cd frontend
npm install --legacy-peer-deps
npm start                                                # http://localhost:4200
```

Tres vistas:

1. **Solver** — botón "Ejecutar A\*", tablero, métricas, traza por iteración, secuencia óptima.
2. **Entregables** — tarjetas de descarga (DOCX, trazas, ZIPs) con tamaños y descripciones.
3. **Cómo funciona** — el problema, el algoritmo, la arquitectura, la rúbrica y el resultado.

### Todo a la vez con Docker

```bash
docker compose -f infra/docker-compose.yml up --build
# Frontend: http://localhost:4200    Backend: http://localhost:8000
```

### Regenerar entregables

```bash
python scripts/generar_memoria_docx.py            # memoria.md → memoria.docx
python scripts/empaquetar_entregables.py          # ZIPs en entregables/
```

## Stack

| Capa | Tecnología |
|---|---|
| Solver A\* | **Python 3.13 stdlib-only** (`heapq`, `dataclasses`, `enum`) |
| Backend | FastAPI 0.115 + Uvicorn + Pydantic 2 |
| Worker | Celery 5.4 + Redis 7 |
| Frontend | **Angular 20 standalone** + Tailwind 4 |
| Build/proxy | nginx (frontend) + uvicorn (backend) |
| DB / Auth | Supabase self-hosted (opcional) |
| Storage | MinIO S3 (opcional) |
| Despliegue | Docker Compose + VPS Contabo |

## Decisiones de modelado

- **Cargar/descargar son adyacentes** (consistente con "no pisar celdas con inventario").
- **Inventario cargado viaja con el robot** (su posición = posición del robot).
- **Robot solo lleva un inventario a la vez.**
- **Posición final del robot libre.**

Ver `memoria/memoria.md` §2 para el detalle.

## Specs (fuentes de verdad)

| Spec | Cubre |
|---|---|
| `00_resumen_actividad.md` | Qué pide el docente |
| `01_especificacion_problema.md` | Modelo formal del problema |
| `02_criterios_aceptacion.md` | Definition of Done de la rúbrica |
| `03_entregables.md` | Formato de la memoria |
| `04_plan_desarrollo.md` | Hoja de ruta |
| `05_stack_tecnologico.md` | Núcleo del solver (Python stdlib) |
| `07_arquitectura_aplicacion.md` | Backend/worker/frontend |
| `08_infraestructura_despliegue.md` | VPS, DNS, subdominios |

> Si algo del código no calza con una spec, **se actualiza la spec primero**.

## Para entregar

1. Abrir `memoria/memoria.docx` y rellenar la **portada** (nombres del equipo, fecha, universidad).
2. Verificar que `entregables/paquete_entrega.zip` contiene memoria + trazas + código.
3. Subir el paquete al aula virtual.
