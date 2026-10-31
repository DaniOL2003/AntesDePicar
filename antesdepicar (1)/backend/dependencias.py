"""Dependencias compartidas por las rutas: identificar al usuario a partir de la cookie."""

import logging
import uuid

from fastapi import Depends, HTTPException, Request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import BaseDatosNoConfigurada, abrir_sesion, obtener_bd
from models import Usuario
from services.auth_service import usuario_por_token

COOKIE_SESION = "adp_sesion"

registro = logging.getLogger("antesdepicar")


def requerir_usuario(request: Request, bd: Session = Depends(obtener_bd)) -> Usuario:
    """Protege una ruta: responde 401 si no hay una sesión válida."""
    token = request.cookies.get(COOKIE_SESION)
    usuario = usuario_por_token(bd, token) if token else None
    if usuario is None:
        raise HTTPException(status_code=401, detail="Tu sesión expiró. Inicia sesión de nuevo.")
    return usuario


def id_usuario_opcional(request: Request) -> uuid.UUID | None:
    """Para el analizador: identifica al usuario si lo hay.

    Un invitado no toca la base de datos, y si esta falla el análisis sigue funcionando sin guardarse.
    """
    token = request.cookies.get(COOKIE_SESION)
    if not token:
        return None
    try:
        with abrir_sesion() as bd:
            usuario = usuario_por_token(bd, token)
            return usuario.id if usuario else None
    except (SQLAlchemyError, BaseDatosNoConfigurada):
        registro.exception("No se pudo validar la sesión")
        return None
