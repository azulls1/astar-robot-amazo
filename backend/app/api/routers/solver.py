"""Endpoints del solver A*."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ...solver import (
    ESTADO_INICIAL,
    NOMBRES_INV,
    a_estrella,
    es_objetivo,
    heuristica,
)
from ...solver.acciones import TipoAccion
from ...solver.frontera import Frontera
from ...solver.heuristica import heuristica as h_func
from ...solver.nodo import Nodo
from ..schemas import (
    AccionDTO,
    EstadoDTO,
    IteracionDTO,
    PosicionDTO,
    SolveResponse,
)

router = APIRouter(prefix="/api/solver", tags=["solver"])


def _estado_a_dto(estado) -> EstadoDTO:
    cargando = NOMBRES_INV[estado.cargando] if estado.cargando is not None else None
    return EstadoDTO(
        robot=PosicionDTO(fila=estado.robot[0], columna=estado.robot[1]),
        cargando=cargando,
        inventarios={
            NOMBRES_INV[i]: PosicionDTO(fila=p[0], columna=p[1])
            for i, p in enumerate(estado.inventarios)
        },
    )


def _accion_a_dto(idx: int, accion) -> AccionDTO:
    f, c = accion.destino
    inv_nombre = NOMBRES_INV[accion.inventario] if accion.inventario is not None else None
    return AccionDTO(
        paso=idx,
        tipo=accion.tipo.value,
        inventario=inv_nombre,
        destino=PosicionDTO(fila=f, columna=c),
        descripcion=str(accion),
    )


@router.get("/inicial", response_model=EstadoDTO)
def estado_inicial() -> EstadoDTO:
    return _estado_a_dto(ESTADO_INICIAL)


@router.post("/solve", response_model=SolveResponse)
def resolver() -> SolveResponse:
    """Corre A* desde el estado inicial fijo del enunciado y devuelve traza
    estructurada para visualización en el frontend.
    """
    # Re-implementación ligera del bucle de A* para capturar iteraciones
    # estructuradas (el módulo solver imprime a stdout/file; aquí queremos
    # objetos JSON-serializables).
    from ...solver.acciones import sucesores
    from ...solver.nodo import reconstruir_camino

    nodo_inicial = Nodo(
        estado=ESTADO_INICIAL,
        padre=None,
        accion=None,
        g=0,
        h=h_func(ESTADO_INICIAL),
    )
    abierta = Frontera()
    abierta.push(nodo_inicial)
    cerrada: dict = {}
    iteraciones_detalle: list[IteracionDTO] = []
    nodos_generados = 1
    iteracion = 0
    objetivo_alcanzado = None

    while not abierta.vacia():
        iteracion += 1
        actual = abierta.pop()
        if actual.estado in cerrada and cerrada[actual.estado] <= actual.g:
            iteracion -= 1
            continue
        cerrada[actual.estado] = actual.g

        # Solo guardamos detalle de las primeras 30 (el resto se omite por
        # tamaño en la respuesta JSON).
        if iteracion <= 30:
            iteraciones_detalle.append(
                IteracionDTO(
                    n=iteracion,
                    estado=_estado_a_dto(actual.estado),
                    g=actual.g,
                    h=actual.h,
                    f=actual.f,
                    abierta_size=len(abierta),
                    cerrada_size=len(cerrada),
                )
            )

        if es_objetivo(actual.estado):
            objetivo_alcanzado = actual
            break

        for accion, estado_sucesor in sucesores(actual.estado):
            g2 = actual.g + 1
            if estado_sucesor in cerrada and cerrada[estado_sucesor] <= g2:
                continue
            h2 = h_func(estado_sucesor)
            sucesor = Nodo(estado_sucesor, actual, accion, g2, h2)
            abierta.push(sucesor)
            nodos_generados += 1

    if objetivo_alcanzado is None:
        raise HTTPException(status_code=500, detail="No se encontró solución")

    camino = reconstruir_camino(objetivo_alcanzado)
    return SolveResponse(
        encontrado=True,
        iteraciones=iteracion,
        nodos_generados=nodos_generados,
        coste_total=objetivo_alcanzado.g,
        h_inicial=heuristica(ESTADO_INICIAL),
        secuencia=[_accion_a_dto(i + 1, a) for i, a in enumerate(camino)],
        iteraciones_detalle=iteraciones_detalle,
    )
