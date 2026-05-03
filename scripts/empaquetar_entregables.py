"""Empaqueta los entregables académicos en ZIPs descargables.

Genera tres archivos en `entregables/`:
    - entrega_simple.zip      .py del solver + tests + memoria.docx (entrega oficial)
    - codigo_fuente.zip       solo el código (solver, tests, wrapper, infra)
    - paquete_entrega.zip     todo lo que se sube al aula virtual

Ejecutar desde la raíz del proyecto:
    python scripts/empaquetar_entregables.py
"""
from __future__ import annotations

import sys
import zipfile
from pathlib import Path


PROYECTO_DIR = Path(__file__).resolve().parents[1]
ENTREGABLES_DIR = PROYECTO_DIR / "entregables"

EXCLUIR = {
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".venv",
    "venv",
    "node_modules",
    "dist",
    ".angular",
    ".cache",
    "entregables",
    "_local",
}


def _debe_excluir(ruta: Path) -> bool:
    partes = set(ruta.relative_to(PROYECTO_DIR).parts)
    return bool(partes & EXCLUIR)


def _añadir_directorio(zf: zipfile.ZipFile, raiz: Path, prefijo: str) -> None:
    for archivo in raiz.rglob("*"):
        if not archivo.is_file():
            continue
        if _debe_excluir(archivo):
            continue
        rel = archivo.relative_to(PROYECTO_DIR)
        zf.write(archivo, arcname=f"{prefijo}/{rel}")


def empaquetar_codigo() -> Path:
    salida = ENTREGABLES_DIR / "codigo_fuente.zip"
    salida.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(salida, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for sub in ("backend", "frontend", "infra", "scripts"):
            d = PROYECTO_DIR / sub
            if d.exists():
                _añadir_directorio(zf, d, "astar_robot_amazon")
        # Archivos sueltos en la raíz
        for nombre in ("README.md", ".env.example", ".gitignore"):
            f = PROYECTO_DIR / nombre
            if f.exists():
                zf.write(f, arcname=f"astar_robot_amazon/{nombre}")
    return salida


def empoquetar_capturas(zf: zipfile.ZipFile, prefijo: str) -> None:
    capturas = PROYECTO_DIR / "memoria" / "capturas"
    if capturas.exists():
        for f in sorted(capturas.glob("*.png")):
            zf.write(f, arcname=f"{prefijo}/memoria/capturas/{f.name}")


def empaquetar_completo() -> Path:
    salida = ENTREGABLES_DIR / "paquete_entrega.zip"
    salida.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(salida, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        # Memoria — DOCX (formato exigido), PDF (respaldo) y MD (fuente)
        for nombre in ("memoria.docx", "memoria.pdf", "memoria.md"):
            f = PROYECTO_DIR / "memoria" / nombre
            if f.exists():
                zf.write(f, arcname=f"entrega/memoria/{nombre}")
        empoquetar_capturas(zf, "entrega")
        # Trazas
        for nombre in ("traza_corrida_final.txt", "traza_completa.txt"):
            f = PROYECTO_DIR / "salidas" / nombre
            if f.exists():
                zf.write(f, arcname=f"entrega/salidas/{nombre}")
        # Código (subdirectorio dentro del paquete)
        for sub in ("backend", "frontend", "infra", "scripts"):
            d = PROYECTO_DIR / sub
            if d.exists():
                _añadir_directorio(zf, d, "entrega/codigo")
        # README
        for nombre in ("README.md", ".env.example"):
            f = PROYECTO_DIR / nombre
            if f.exists():
                zf.write(f, arcname=f"entrega/codigo/{nombre}")
    return salida


_WRAPPER_MAIN = '''"""Punto de entrada del solver A* (Robot Amazon).

Ejecutar desde este directorio:

    python main.py                    # corrida con traza compacta
    python main.py --completa         # 323 iteraciones detalladas

Ejecutar tests:
    python -m unittest discover -s tests
"""
from solver.main import main

if __name__ == "__main__":
    raise SystemExit(main())
'''


def empaquetar_simple() -> Path:
    """Entrega minimalista solicitada por el equipo: solo .py del solver,
    tests, memoria.docx, y un wrapper main.py para ejecución directa."""
    salida = ENTREGABLES_DIR / "entrega_simple.zip"
    salida.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(salida, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        solver_dir = PROYECTO_DIR / "backend" / "app" / "solver"
        for archivo in sorted(solver_dir.glob("*.py")):
            zf.write(archivo, arcname=f"codigo/solver/{archivo.name}")
        tests_dir = PROYECTO_DIR / "backend" / "tests"
        if tests_dir.exists():
            for archivo in sorted(tests_dir.rglob("*.py")):
                if "__pycache__" in archivo.parts:
                    continue
                rel = archivo.relative_to(tests_dir)
                # En el ZIP la estructura es codigo/solver/, no backend/app/solver/
                contenido = archivo.read_text(encoding="utf-8").replace(
                    "backend.app.solver", "solver"
                )
                zf.writestr(f"codigo/tests/{rel}", contenido)
        # Wrapper main.py en la raíz para ejecución directa con `python main.py`
        zf.writestr("codigo/main.py", _WRAPPER_MAIN)
        docx = PROYECTO_DIR / "memoria" / "memoria.docx"
        if docx.exists():
            zf.write(docx, arcname="memoria.docx")
    return salida


def main() -> int:
    print("Empaquetando entregables...")
    s = empaquetar_simple()
    a = empaquetar_codigo()
    b = empaquetar_completo()
    print(f"  - {s}  ({s.stat().st_size / 1024:.1f} KB)  [SIMPLE — entrega oficial]")
    print(f"  - {a}  ({a.stat().st_size / 1024:.1f} KB)")
    print(f"  - {b}  ({b.stat().st_size / 1024:.1f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
