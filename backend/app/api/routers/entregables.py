"""Endpoints para listar y descargar entregables.

Los entregables son los artefactos que el profesor pide:
- Código fuente (ZIP)
- Memoria (DOCX)
- Trazas de ejecución (TXT)
- Paquete completo (ZIP con todo)
"""
from __future__ import annotations

import mimetypes
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ...core.config import settings
from ..schemas import EntregableDTO

router = APIRouter(prefix="/api/entregables", tags=["entregables"])


# id -> (nombre, descripcion, ruta relativa al proyecto)
_REGISTRO = {
    "memoria_docx": (
        "Memoria del proyecto (DOCX)",
        "Documento académico con análisis, modelado, heurística, A*, "
        "pruebas, dificultades y referencias APA. Calibri 12, interlineado 1.5.",
        Path("memoria") / "memoria.docx",
    ),
    "memoria_md": (
        "Memoria del proyecto (Markdown fuente)",
        "Versión Markdown editable de la memoria. Útil como referencia.",
        Path("memoria") / "memoria.md",
    ),
    "traza_compacta": (
        "Traza de A* — compacta",
        "Salida del solver con las primeras 10 iteraciones detalladas y "
        "el resto resumido. Anexo principal recomendado.",
        Path("salidas") / "traza_corrida_final.txt",
    ),
    "traza_completa": (
        "Traza de A* — completa",
        "Todas las 323 iteraciones con listas abierta y cerrada al detalle. "
        "Anexo opcional para auditoría exhaustiva.",
        Path("salidas") / "traza_completa.txt",
    ),
    "codigo_zip": (
        "Código fuente (ZIP)",
        "Solver A*, tests, scripts y el wrapper full-stack. Listo para "
        "ejecutar con python -m backend.app.solver.main",
        Path("entregables") / "codigo_fuente.zip",
    ),
    "paquete_completo": (
        "Paquete de entrega completo (ZIP)",
        "Memoria DOCX + trazas + código fuente + README. Lo que se sube al "
        "aula virtual.",
        Path("entregables") / "paquete_entrega.zip",
    ),
}


def _info_archivo(eid: str) -> EntregableDTO | None:
    if eid not in _REGISTRO:
        return None
    nombre, descripcion, rel = _REGISTRO[eid]
    ruta = settings.proyecto_dir / rel
    if not ruta.exists():
        return EntregableDTO(
            id=eid,
            nombre=nombre,
            descripcion=descripcion + "  [pendiente de generar]",
            archivo=rel.name,
            tamano_bytes=0,
            url_descarga=f"/api/entregables/{eid}/descarga",
            tipo_mime=mimetypes.guess_type(rel.name)[0] or "application/octet-stream",
        )
    return EntregableDTO(
        id=eid,
        nombre=nombre,
        descripcion=descripcion,
        archivo=rel.name,
        tamano_bytes=ruta.stat().st_size,
        url_descarga=f"/api/entregables/{eid}/descarga",
        tipo_mime=mimetypes.guess_type(rel.name)[0] or "application/octet-stream",
    )


@router.get("", response_model=list[EntregableDTO])
def listar() -> list[EntregableDTO]:
    return [_info_archivo(eid) for eid in _REGISTRO]


@router.get("/{eid}/descarga")
def descargar(eid: str):
    if eid not in _REGISTRO:
        raise HTTPException(status_code=404, detail="Entregable desconocido")
    _, _, rel = _REGISTRO[eid]
    ruta = settings.proyecto_dir / rel
    if not ruta.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Archivo no generado todavía: {rel.name}",
        )
    return FileResponse(
        path=str(ruta),
        filename=rel.name,
        media_type=mimetypes.guess_type(rel.name)[0] or "application/octet-stream",
    )
