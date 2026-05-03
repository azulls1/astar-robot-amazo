"""Convierte memoria/memoria.docx a memoria/memoria.pdf usando Microsoft Word.

Estrategia:
1. Intenta `docx2pdf` (usa Word COM en Windows / Office en macOS).
2. Como fallback intenta LibreOffice headless si está en el PATH.
3. Imprime conteo de páginas del PDF generado y avisa si supera el límite
   académico de 10 páginas (sin contar el anexo de código).

Uso:
    python scripts/generar_memoria_pdf.py
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


PROYECTO_DIR = Path(__file__).resolve().parents[1]
DOCX_PATH = PROYECTO_DIR / "memoria" / "memoria.docx"
PDF_PATH = PROYECTO_DIR / "memoria" / "memoria.pdf"

LIMITE_PAGINAS_SIN_ANEXO = 10


def _convertir_con_docx2pdf() -> bool:
    """Intenta la conversión con docx2pdf (Word COM)."""
    try:
        from docx2pdf import convert  # type: ignore
    except ImportError:
        return False
    try:
        convert(str(DOCX_PATH), str(PDF_PATH))
        return PDF_PATH.exists()
    except Exception as exc:  # noqa: BLE001
        print(f"  docx2pdf falló: {exc}", file=sys.stderr)
        return False


def _convertir_con_libreoffice() -> bool:
    """Fallback: LibreOffice headless si está disponible."""
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        return False
    try:
        subprocess.run(
            [
                soffice,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(PDF_PATH.parent),
                str(DOCX_PATH),
            ],
            check=True,
            capture_output=True,
            timeout=120,
        )
        return PDF_PATH.exists()
    except (subprocess.SubprocessError, OSError) as exc:
        print(f"  LibreOffice falló: {exc}", file=sys.stderr)
        return False


def _contar_paginas(pdf_path: Path) -> int | None:
    try:
        from pypdf import PdfReader
    except ImportError:
        return None
    try:
        reader = PdfReader(str(pdf_path))
        return len(reader.pages)
    except Exception:  # noqa: BLE001
        return None


def _pagina_inicio_anexo(pdf_path: Path) -> int | None:
    """Devuelve el número (1-indexed) de la primera página que contiene "Anexo A".

    El "cuerpo" de la memoria son todas las páginas anteriores a esa.
    """
    try:
        from pypdf import PdfReader
    except ImportError:
        return None
    try:
        reader = PdfReader(str(pdf_path))
        for idx, page in enumerate(reader.pages, start=1):
            texto = (page.extract_text() or "").lower()
            if "anexo a" in texto or "anexo b" in texto:
                return idx
        return None
    except Exception:  # noqa: BLE001
        return None


def main() -> int:
    if not DOCX_PATH.exists():
        print(f"No existe {DOCX_PATH}. Corre primero generar_memoria_docx.py", file=sys.stderr)
        return 1

    print("Convirtiendo memoria.docx -> memoria.pdf...")

    convertido = _convertir_con_docx2pdf()
    if not convertido:
        print("  docx2pdf no disponible o falló — intentando LibreOffice...")
        convertido = _convertir_con_libreoffice()

    if not convertido or not PDF_PATH.exists():
        print(
            "ERROR: no se pudo generar el PDF.\n"
            "Instala docx2pdf (`pip install docx2pdf`) — requiere Word —\n"
            "o instala LibreOffice (`soffice` en el PATH).",
            file=sys.stderr,
        )
        return 1

    tam_kb = PDF_PATH.stat().st_size / 1024
    print(f"Generado: {PDF_PATH}  ({tam_kb:.1f} KB)")

    paginas = _contar_paginas(PDF_PATH)
    if paginas is None:
        print(
            "  (No se pudo contar páginas — instala pypdf con `pip install pypdf` para verificar.)"
        )
        return 0

    print(f"  Paginas totales del PDF: {paginas}")

    inicio_anexo = _pagina_inicio_anexo(PDF_PATH)
    if inicio_anexo is None:
        print(
            "  AVISO: no se pudo detectar el inicio del Anexo. Verifica visualmente"
            " que el cuerpo (hasta el final de la seccion 11) tenga <= 10 paginas."
        )
        return 0

    paginas_cuerpo = inicio_anexo - 1
    print(f"  Anexo empieza en pagina {inicio_anexo} -> cuerpo: {paginas_cuerpo} paginas")
    if paginas_cuerpo <= LIMITE_PAGINAS_SIN_ANEXO:
        print(
            f"  OK: cuerpo dentro del limite ({paginas_cuerpo} <= {LIMITE_PAGINAS_SIN_ANEXO})."
        )
    else:
        excedido = paginas_cuerpo - LIMITE_PAGINAS_SIN_ANEXO
        print(
            f"  ALERTA: el cuerpo excede el limite por {excedido} paginas.\n"
            "  Reduce contenido en memoria.md (eliminar tablas largas, codigo extenso, capturas redundantes)\n"
            "  y vuelve a correr `generar_memoria_docx.py` y este script."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
