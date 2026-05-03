"""Tests de la heurística de Manhattan."""
from __future__ import annotations

import unittest

from backend.app.solver.estado import ESTADO_INICIAL, Estado, POS_OBJETIVO
from backend.app.solver.heuristica import heuristica, manhattan


class TestManhattan(unittest.TestCase):
    def test_distancia_cero_sobre_si_misma(self) -> None:
        self.assertEqual(manhattan((1, 1), (1, 1)), 0)

    def test_distancia_simetrica(self) -> None:
        self.assertEqual(manhattan((0, 0), (3, 3)), manhattan((3, 3), (0, 0)))

    def test_valores_conocidos(self) -> None:
        self.assertEqual(manhattan((0, 0), (3, 3)), 6)
        self.assertEqual(manhattan((2, 0), (3, 2)), 3)
        self.assertEqual(manhattan((0, 3), (3, 1)), 5)


class TestHeuristicaEstadoInicial(unittest.TestCase):
    """h(inicial) = suma manhattan(Mi, obj_Mi) + (manhattan(R, M_más_cercano) - 1).

    Cálculo manual:
        M1: (0,0)->(3,3) = 6
        M2: (2,0)->(3,2) = 3
        M3: (0,3)->(3,1) = 5
        Suma = 14
        Robot (2,2), pendientes todos. Más cercano: M2 en (2,0), distancia 2.
        Ajuste = max(0, 2-1) = 1
        Total = 15
    """

    def test_h_inicial_es_quince(self) -> None:
        self.assertEqual(heuristica(ESTADO_INICIAL), 15)


class TestHeuristicaCasos(unittest.TestCase):
    def test_estado_objetivo_da_cero(self) -> None:
        objetivo = Estado(
            robot=(0, 0),
            cargando=None,
            inventarios=POS_OBJETIVO,
        )
        self.assertEqual(heuristica(objetivo), 0)

    def test_admisible_robot_lejos_de_inventario(self) -> None:
        # Estado donde el robot está en una esquina y todos los inventarios
        # ya están en su objetivo: h debe ser 0.
        s = Estado(robot=(0, 0), cargando=None, inventarios=POS_OBJETIVO)
        self.assertEqual(heuristica(s), 0)

    def test_admisibilidad_no_negativa(self) -> None:
        self.assertGreaterEqual(heuristica(ESTADO_INICIAL), 0)


if __name__ == "__main__":
    unittest.main()
