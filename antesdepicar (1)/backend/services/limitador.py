"""Límite de intentos en memoria, para frenar ataques de fuerza bruta y envíos masivos.

Se reinicia con el servidor y no se comparte entre procesos: es suficiente para un solo servidor.
"""

import threading
import time
from collections import defaultdict, deque

_intentos: defaultdict[str, deque[float]] = defaultdict(deque)
_candado = threading.Lock()


def excedido(clave: str, maximo: int, ventana: int) -> bool:
    limite = time.monotonic() - ventana
    with _candado:
        registros = _intentos[clave]
        while registros and registros[0] <= limite:
            registros.popleft()
        if not registros:
            del _intentos[clave]
            return False
        return len(registros) >= maximo


def anotar(clave: str) -> None:
    with _candado:
        _intentos[clave].append(time.monotonic())


def limpiar(clave: str | None = None) -> None:
    with _candado:
        if clave is None:
            _intentos.clear()
        else:
            _intentos.pop(clave, None)
