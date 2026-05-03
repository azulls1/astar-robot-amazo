"""Empaqueta los entregables académicos en ZIPs descargables.

Genera dos archivos en `entregables/`:
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


def main() -> int:
    print("Empaquetando entregables...")
    a = empaquetar_codigo()
    b = empaquetar_completo()
    print(f"  - {a}  ({a.stat().st_size / 1024:.1f} KB)")
    print(f"  - {b}  ({b.stat().st_size / 1024:.1f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
