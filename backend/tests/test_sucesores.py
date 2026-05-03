"""Tests del generador de sucesores."""
from __future__ import annotations

import unittest

from backend.app.solver.acciones import (
    Accion,
    TipoAccion,
    aplicar,
    sucesores,
)
from backend.app.solver.estado import ESTADO_INICIAL, Estado, PAREDES


class TestSucesoresEstadoInicial(unittest.TestCase):
    def test_no_hay_movimientos_a_pared(self) -> None:
        for accion, _ in sucesores(ESTADO_INICIAL):
            if accion.tipo is TipoAccion.MOVER:
                self.assertNotIn(accion.destino, PAREDES)

    def test_no_hay_movimientos_fuera_del_tablero(self) -> None:
        for accion, _ in sucesores(ESTADO_INICIAL):
            if accion.tipo is TipoAccion.MOVER:
                f, c = accion.destino
                self.assertTrue(0 <= f < 4)
                self.assertTrue(0 <= c < 4)

    def test_no_pisa_inventarios(self) -> None:
        # El robot está en (2,2). Inventarios en (0,0), (2,0), (0,3): ninguno
        # adyacente, así que no debería poder moverse a celdas de inventario.
        destinos_mover = {
            a.destino for a, _ in sucesores(ESTADO_INICIAL) if a.tipo is TipoAccion.MOVER
        }
        for pos_inv in ESTADO_INICIAL.inventarios:
            self.assertNotIn(pos_inv, destinos_mover)

    def test_robot_libre_no_puede_descargar(self) -> None:
        # ESTADO_INICIAL.cargando is None → ninguna acción DESCARGAR.
        for a, _ in sucesores(ESTADO_INICIAL):
            self.assertIsNot(a.tipo, TipoAccion.DESCARGAR)

    def test_genera_los_4_movimientos_cuando_no_hay_obstaculos(self) -> None:
        # R(2,2), vecinos: (1,2) libre, (3,2) libre, (2,1) libre, (2,3) libre.
        movs = [a for a, _ in sucesores(ESTADO_INICIAL) if a.tipo is TipoAccion.MOVER]
        self.assertEqual(len(movs), 4)


class TestCarga(unittest.TestCase):
    def test_no_puede_cargar_segundo_inventario(self) -> None:
        # Construyo manualmente: robot en (2,1) cargando M2, otro inventario (M1) en (2,2)
        s = Estado(
            robot=(2, 1),
            cargando=1,  # M2
            inventarios=((2, 2), (2, 1), (0, 3)),  # M1 en (2,2), M2 viaja con robot
        )
        # No debería haber acciones CARGAR.
        for a, _ in sucesores(s):
            self.assertIsNot(a.tipo, TipoAccion.CARGAR)

    def test_carga_es_adyacente(self) -> None:
        # Robot en (1,0), M1 en (0,0) → adyacente, debe poder cargar.
        s = Estado(
            robot=(1, 0),
            cargando=None,
            inventarios=((0, 0), (3, 2), (3, 1)),
        )
        cargas = [a for a, _ in sucesores(s) if a.tipo is TipoAccion.CARGAR]
        self.assertEqual(len(cargas), 1)
        self.assertEqual(cargas[0].inventario, 0)
        self.assertEqual(cargas[0].destino, (0, 0))


class TestAplicar(unittest.TestCase):
    def test_aplicar_mover(self) -> None:
        a = Accion(TipoAccion.MOVER, destino=(2, 1))
        s2 = aplicar(ESTADO_INICIAL, a)
        self.assertEqual(s2.robot, (2, 1))
        self.assertIsNone(s2.cargando)
        self.assertEqual(s2.inventarios, ESTADO_INICIAL.inventarios)

    def test_aplicar_cargar(self) -> None:
        # Robot adyacente a M2 en (2,0).
        s = Estado(robot=(2, 1), cargando=None, inventarios=((0, 0), (2, 0), (0, 3)))
        a = Accion(TipoAccion.CARGAR, destino=(2, 0), inventario=1)
        s2 = aplicar(s, a)
        self.assertEqual(s2.cargando, 1)
        # M2 ahora viaja con el robot.
        self.assertEqual(s2.inventarios[1], (2, 1))

    def test_aplicar_descargar(self) -> None:
        s = Estado(robot=(2, 2), cargando=1, inventarios=((0, 0), (2, 2), (0, 3)))
        a = Accion(TipoAccion.DESCARGAR, destino=(3, 2), inventario=1)
        s2 = aplicar(s, a)
        self.assertIsNone(s2.cargando)
        self.assertEqual(s2.inventarios[1], (3, 2))


if __name__ == "__main__":
    unittest.main()
