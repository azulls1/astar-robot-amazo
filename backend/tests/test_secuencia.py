"""Test de simulación inversa: aplicar la secuencia devuelta por A* sobre el
estado inicial debe reproducir exactamente el estado objetivo. Es la prueba
clave del Criterio 4 de la rúbrica.
"""
from __future__ import annotations

import unittest

from backend.app.solver.acciones import TipoAccion, aplicar, sucesores
from backend.app.solver.astar import a_estrella
from backend.app.solver.estado import ESTADO_INICIAL, POS_OBJETIVO, es_objetivo


class TestSimulacionInversa(unittest.TestCase):
    def test_aplicar_secuencia_reproduce_objetivo(self) -> None:
        resultado = a_estrella(ESTADO_INICIAL, es_objetivo=es_objetivo, salida=None)
        self.assertTrue(resultado.encontrado)

        estado = ESTADO_INICIAL
        for accion in resultado.camino:
            # Verificar que la acción es legal en el estado actual.
            acciones_legales = {a for a, _ in sucesores(estado)}
            self.assertIn(
                accion,
                acciones_legales,
                msg=f"Acción ilegal: {accion} desde estado {estado}",
            )
            estado = aplicar(estado, accion)

        self.assertTrue(es_objetivo(estado), msg=f"No alcanza objetivo, terminó en {estado}")
        self.assertEqual(estado.inventarios, POS_OBJETIVO)
        self.assertIsNone(estado.cargando)

    def test_secuencia_en_notacion_del_enunciado(self) -> None:
        resultado = a_estrella(ESTADO_INICIAL, es_objetivo=es_objetivo, salida=None)
        for accion in resultado.camino:
            s = str(accion)
            self.assertTrue(s.startswith(("mover R ", "cargar R ", "descargar R ")))
            self.assertIn(" fila", s)
            self.assertIn(" columna", s)

    def test_distribucion_de_tipos(self) -> None:
        # Para 3 inventarios: exactamente 3 cargas y 3 descargas.
        resultado = a_estrella(ESTADO_INICIAL, es_objetivo=es_objetivo, salida=None)
        cargas = sum(1 for a in resultado.camino if a.tipo is TipoAccion.CARGAR)
        descargas = sum(1 for a in resultado.camino if a.tipo is TipoAccion.DESCARGAR)
        self.assertEqual(cargas, 3)
        self.assertEqual(descargas, 3)


if __name__ == "__main__":
    unittest.main()
