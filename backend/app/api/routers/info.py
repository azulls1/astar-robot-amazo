"""Endpoints de información del sistema (vista 'Cómo funciona')."""
from __future__ import annotations

from fastapi import APIRouter

from ..schemas import ArquitecturaDTO

router = APIRouter(prefix="/api/info", tags=["info"])


@router.get("/arquitectura", response_model=ArquitecturaDTO)
def arquitectura() -> ArquitecturaDTO:
    return ArquitecturaDTO(
        titulo="Arquitectura del sistema",
        descripcion=(
            "El proyecto separa el solver A* (núcleo evaluado por la rúbrica, "
            "stdlib-only) del wrapper full-stack que lo expone como aplicación "
            "web."
        ),
        capas=[
            {
                "nombre": "Solver A*",
                "tecnologia": "Python 3.13 (stdlib)",
                "responsabilidad": (
                    "Algoritmo A* con heurística de Manhattan. Estructuras: "
                    "Estado, Accion, Nodo, Frontera (heap), Cerrada (dict). "
                    "Se ejecuta sin dependencias externas."
                ),
                "ubicacion": "backend/app/solver/",
            },
            {
                "nombre": "Backend API",
                "tecnologia": "FastAPI + Uvicorn + Pydantic",
                "responsabilidad": (
                    "Expone el solver vía HTTP, sirve descargas de "
                    "entregables y devuelve la traza estructurada para que el "
                    "frontend la visualice."
                ),
                "ubicacion": "backend/app/api/",
            },
            {
                "nombre": "Worker asíncrono",
                "tecnologia": "Celery 5 + Redis 7",
                "responsabilidad": (
                    "Ejecuta el solver en segundo plano para corridas largas o "
                    "experimentos. En esta entrega el solver es rápido (<1s), "
                    "el worker queda preparado para escenarios futuros."
                ),
                "ubicacion": "backend/app/tasks/",
            },
            {
                "nombre": "Frontend",
                "tecnologia": "Angular 20 + Tailwind 4",
                "responsabilidad": (
                    "Tres vistas: ejecutar el solver y visualizar la traza, "
                    "descargar entregables, y explicar cómo funciona todo."
                ),
                "ubicacion": "frontend/",
            },
            {
                "nombre": "Persistencia (opcional)",
                "tecnologia": "Supabase (Postgres) + MinIO (S3)",
                "responsabilidad": (
                    "Self-hosted en VPS. Diseñado para guardar corridas e "
                    "imagenes generadas; no es requisito para correr la "
                    "actividad académica."
                ),
                "ubicacion": "iagentek.com.mx",
            },
            {
                "nombre": "Despliegue",
                "tecnologia": "Docker Compose + Contabo VPS + Caddy/Nginx",
                "responsabilidad": (
                    "Subdominios astar.iagentek.com.mx (frontend) y "
                    "astar-api.iagentek.com.mx (backend) con TLS automático."
                ),
                "ubicacion": "infra/",
            },
        ],
        flujo=[
            "El usuario abre el frontend (Angular) en astar.iagentek.com.mx.",
            "Pulsa 'Ejecutar A*'. El frontend hace POST /api/solver/solve al backend.",
            "FastAPI invoca el solver A* con el estado inicial fijo del enunciado.",
            "El solver expande nodos, mantiene listas abierta y cerrada, calcula f=g+h.",
            "Al alcanzar el objetivo, reconstruye el camino y devuelve traza + secuencia.",
            "El frontend renderiza la traza por iteración y la secuencia de 19 acciones.",
            "Desde la vista 'Entregables', el usuario descarga la memoria DOCX y los archivos para entregar.",
        ],
    )


@router.get("/algoritmo")
def algoritmo() -> dict:
    return {
        "nombre": "A* (A-star)",
        "heuristica": "Distancia de Manhattan",
        "definicion_f": "f(n) = g(n) + h(n)",
        "definicion_g": "Número de acciones desde el estado inicial. Coste 1 por acción.",
        "definicion_h": (
            "Suma de la distancia de Manhattan de cada inventario a su posición "
            "objetivo. Si el robot está libre y aún hay inventarios pendientes, "
            "se suma max(0, manhattan(robot, inventario_más_cercano) - 1)."
        ),
        "admisibilidad": (
            "h ignora paredes, mecánica de carga/descarga y orden de inventarios; "
            "todas son sub-estimaciones, así que h <= coste_real. Garantiza optimalidad."
        ),
        "desempate": "Menor f → menor h → FIFO (orden de inserción).",
        "lista_abierta": "Cola de prioridad (heap binario) ordenada por (f, h, contador).",
        "lista_cerrada": "Diccionario estado -> mejor g conocido.",
        "complejidad": "O(b^d) en el peor caso; con buena h es muchísimo menor.",
    }


@router.get("/problema")
def problema() -> dict:
    return {
        "titulo": "Robot Amazon — reorganización de inventarios",
        "tablero": "Matriz 4x4 con paredes (#) en (0,1) y (1,1).",
        "robot_inicial": {"fila": 2, "columna": 2},
        "inventarios": {
            "M1": {"inicial": {"fila": 0, "columna": 0}, "objetivo": {"fila": 3, "columna": 3}},
            "M2": {"inicial": {"fila": 2, "columna": 0}, "objetivo": {"fila": 3, "columna": 2}},
            "M3": {"inicial": {"fila": 0, "columna": 3}, "objetivo": {"fila": 3, "columna": 1}},
        },
        "acciones": [
            "mover R fila{f} columna{c}",
            "cargar R M{i} fila{f} columna{c}",
            "descargar R M{i} fila{f} columna{c}",
        ],
        "decisiones_modelado": [
            "Cargar y descargar son adyacentes (no se pisa la celda del inventario).",
            "El inventario cargado viaja con el robot (su posición = posición del robot).",
            "El robot solo puede llevar un inventario a la vez.",
            "La posición final del robot no está restringida por el enunciado.",
        ],
    }


@router.get("/entrega")
def entrega() -> dict:
    return {
        "asignatura": "Razonamiento y planificación automática",
        "actividad": "Resolución de un problema mediante búsqueda heurística (A*)",
        "rubrica": [
            {"criterio": "Lógica del algoritmo A*", "peso": "40%", "puntos": 4},
            {"criterio": "Cálculo correcto de f(n)", "peso": "20%", "puntos": 2},
            {"criterio": "Listas abierta/cerrada por iteración", "peso": "20%", "puntos": 2},
            {"criterio": "Secuencia de acciones final correcta", "peso": "20%", "puntos": 2},
        ],
        "formato_memoria": {
            "fuente": "Calibri 12",
            "interlineado": 1.5,
            "extension_max": "10 paginas (sin contar codigo)",
            "secciones_obligatorias": [
                "Portada",
                "Desarrollo de la actividad (analisis, decisiones, pruebas, plan)",
                "Dificultades encontradas",
                "Referencias bibliograficas (APA)",
            ],
        },
        "resultado": {
            "iteraciones": 323,
            "nodos_generados": 836,
            "coste_optimo": 19,
            "h_inicial": 15,
            "tests_pasando": 24,
        },
    }
