"""Genera capturas del frontend para insertar en la memoria.

Requisitos previos:
- Backend corriendo en http://localhost:8000
- Frontend corriendo en http://localhost:4200
- Playwright instalado: python -m pip install playwright && python -m playwright install chromium

Uso:
    python scripts/generar_capturas.py

Genera PNGs en memoria/capturas/.
"""
from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


PROYECTO_DIR = Path(__file__).resolve().parents[1]
CAPTURAS_DIR = PROYECTO_DIR / "memoria" / "capturas"

VISTAS = [
    ("01_dashboard.png", "/dashboard", None),
    ("02_solver_inicial.png", "/solver", None),
    ("03_solver_resultado.png", "/solver", "ejecutar"),
    ("04_heuristica.png", "/heuristica", None),
    ("05_iteraciones.png", "/iteraciones", "wait_table"),
    ("06_entregables.png", "/entregables", None),
    ("07_como_funciona.png", "/como-funciona", None),
]


def main() -> int:
    CAPTURAS_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        for nombre, ruta, accion in VISTAS:
            page.goto(f"http://localhost:4200{ruta}", wait_until="networkidle")
            page.wait_for_selector("article, app-tablero, table, main", timeout=15000)
            if accion == "ejecutar":
                # Tras cargar /solver, click en "Ejecutar A*"
                page.click('button:has-text("Ejecutar")')
                page.wait_for_selector("table", timeout=15000)
                page.wait_for_timeout(800)
            elif accion == "wait_table":
                # /iteraciones lanza solve automáticamente
                page.wait_for_selector("table tbody tr", timeout=20000)
                page.wait_for_timeout(800)
            else:
                page.wait_for_timeout(500)
            page.screenshot(path=str(CAPTURAS_DIR / nombre), full_page=True)
            print(f"  capturada: {nombre}")

        browser.close()

    print(f"\nCapturas guardadas en: {CAPTURAS_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
