"""Rutas de registro, inicio y cierre de sesión."""

import os

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from database import obtener_bd
from dependencias import COOKIE_SESION, requerir_usuario
from models import Usuario
from schemas import SolicitudLogin, SolicitudRegistro, UsuarioPublico
from services import auth_service, limitador

router = APIRouter(prefix="/api/auth", tags=["autenticación"])

MAX_FALLOS_LOGIN = 10
MAX_REGISTROS = 20
VENTANA_LOGIN = 15 * 60
VENTANA_REGISTRO = 60 * 60
RUTA_COOKIE = "/api"


def _ip(request: Request) -> str:
    return request.client.host if request.client else "desconocida"


def _cookie_segura() -> bool:
    return os.getenv("COOKIE_SECURE", "false").strip().lower() == "true"


def _poner_cookie(respuesta: Response, token: str, recordar: bool) -> None:
    respuesta.set_cookie(
        COOKIE_SESION,
        token,
        # Sin max_age, el navegador la borra al cerrarse.
        max_age=int(auth_service.DURACION_RECORDAR.total_seconds()) if recordar else None,
        httponly=True,
        samesite="lax",
        secure=_cookie_segura(),
        path=RUTA_COOKIE,
    )


@router.post("/registro", response_model=UsuarioPublico, status_code=201)
def registrar(datos: SolicitudRegistro, request: Request, respuesta: Response, bd: Session = Depends(obtener_bd)):
    clave = f"registro:{_ip(request)}"
    if limitador.excedido(clave, MAX_REGISTROS, VENTANA_REGISTRO):
        raise HTTPException(status_code=429, detail="Demasiados registros. Intenta más tarde.")
    limitador.anotar(clave)
    try:
        usuario = auth_service.crear_usuario(bd, datos.nombre, datos.correo, datos.contrasena)
    except auth_service.CorreoRegistrado as exc:
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo.") from exc
    _poner_cookie(respuesta, auth_service.crear_sesion(bd, usuario, datos.recordar), datos.recordar)
    return usuario


@router.post("/login", response_model=UsuarioPublico)
def iniciar_sesion(datos: SolicitudLogin, request: Request, respuesta: Response, bd: Session = Depends(obtener_bd)):
    clave = f"login:{_ip(request)}:{datos.correo}"
    if limitador.excedido(clave, MAX_FALLOS_LOGIN, VENTANA_LOGIN):
        raise HTTPException(status_code=429, detail="Demasiados intentos. Espera unos minutos.")
    usuario = auth_service.autenticar(bd, datos.correo, datos.contrasena)
    if usuario is None:
        limitador.anotar(clave)
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")
    limitador.limpiar(clave)
    _poner_cookie(respuesta, auth_service.crear_sesion(bd, usuario, datos.recordar), datos.recordar)
    return usuario


@router.post("/logout", status_code=204)
def cerrar_sesion(request: Request, respuesta: Response, bd: Session = Depends(obtener_bd)):
    token = request.cookies.get(COOKIE_SESION)
    if token:
        auth_service.cerrar_sesion(bd, token)
    respuesta.delete_cookie(COOKIE_SESION, path=RUTA_COOKIE, httponly=True, samesite="lax", secure=_cookie_segura())


@router.get("/sesion", response_model=UsuarioPublico)
def sesion_actual(usuario: Usuario = Depends(requerir_usuario)):
    return usuario
