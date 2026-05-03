"""Tests del bucle principal de A*."""
from __future__ import annotations

import unittest

from backend.app.solver.astar import a_estrella
from backend.app.solver.estado import ESTADO_INICIAL, Estado, POS_OBJETIVO, es_objetivo


class TestAEstrella(unittest.TestCase):
    def test_caso_trivial_estado_ya_es_objetivo(self) -> None:
        objetivo = Estado(robot=(0, 0), cargando=None, inventarios=POS_OBJETIVO)
        resultado = a_estrella(objetivo, es_objetivo=es_objetivo, salida=None)
        self.assertTrue(resultado.encontrado)
        self.assertEqual(resultado.camino, [])
        self.assertEqual(resultado.nodo_objetivo.g, 0)

    def test_problema_completo_encuentra_solucion(self) -> None:
        resultado = a_estrella(ESTADO_INICIAL, es_objetivo=es_objetivo, salida=None)
        self.assertTrue(resultado.encontrado)
        self.assertGreater(len(resultado.camino), 0)

    def test_optimalidad_g_igual_a_longitud_secuencia(self) -> None:
        # Con coste 1 por acción, g(objetivo) debe igualar el largo de la
        # secuencia. Verificación obligatoria de A* con heurística admisible.
        resultado = a_estrella(ESTADO_INICIAL, es_objetivo=es_objetivo, salida=None)
        self.assertTrue(resultado.encontrado)
        self.assertEqual(resultado.nodo_objetivo.g, len(resultado.camino))

    def test_solucion_optima_es_19(self) -> None:
        # Resultado conocido para esta configuración del problema.
        resultado = a_estrella(ESTADO_INICIAL, es_objetivo=es_objetivo, salida=None)
        self.assertEqual(resultado.nodo_objetivo.g, 19)


if __name__ == "__main__":
    unittest.main()
