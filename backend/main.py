"""API de AntesDePicar (responsable: Eduardo).

Ejecutar desde la carpeta backend:
    uvicorn main:app --reload --port 8000
"""

import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Header, Request  # noqa: E402
from fastapi.exceptions import RequestValidationError  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

import database as db  # noqa: E402
from schemas import (  # noqa: E402
    RespuestaAnalisis,
    SolicitudAnalisis,
    SolicitudLogin,
    SolicitudRegistro,
    SolicitudReporte,
)
from services.ai_service import IAError, analizar_mensaje, estado_ollama  # noqa: E402

app = FastAPI(
    title="AntesDePicar API",
    description="Análisis de posibles estafas digitales con IA de pesos abiertos (Qwen + Ollama) y base de datos SQLite.",
    version="1.1.0",
)

origenes = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origenes if o.strip()],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

# Crea las tablas si no existen (el archivo antesdepicar.db aparece solo).
db.crear_tablas()


class NoAutorizado(Exception):
    pass


@app.exception_handler(RequestValidationError)
async def error_validacion(_: Request, exc: RequestValidationError):
    primero = exc.errors()[0] if exc.errors() else {}
    detalle = str(primero.get("msg", "Solicitud inválida")).replace("Value error, ", "")
    if list(primero.get("loc", []))[-1:] == ["canal"]:
        detalle = "Canal no válido. Usa: whatsapp, sms, correo, empleo u otro."
    return JSONResponse(status_code=422, content={"error": detalle})


@app.exception_handler(IAError)
async def error_ia(_: Request, exc: IAError):
    return JSONResponse(status_code=exc.codigo, content={"error": exc.mensaje})


@app.exception_handler(NoAutorizado)
async def error_auth(_: Request, __: NoAutorizado):
    return JSONResponse(status_code=401, content={"error": "Inicia sesión para continuar."})


def _token(authorization: Optional[str]) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return ""


def _usuario_opcional(authorization: Optional[str]):
    return db.usuario_por_token(_token(authorization))


def _usuario_requerido(authorization: Optional[str]):
    usuario = _usuario_opcional(authorization)
    if not usuario:
        raise NoAutorizado()
    return usuario


# ---------- Salud ----------

@app.get("/api/salud")
async def salud():
    return {"api": True, "base_de_datos": True, **(await estado_ollama())}


# ---------- Análisis con IA ----------

@app.post("/api/analizar", response_model=RespuestaAnalisis)
async def analizar(solicitud: SolicitudAnalisis, authorization: Optional[str] = Header(default=None)):
    resultado = await analizar_mensaje(solicitud.mensaje, solicitud.canal)
    respuesta = {**resultado, "mensaje": solicitud.mensaje}
    usuario = _usuario_opcional(authorization)
    # Los análisis de usuarios con cuenta se guardan en su historial.
    # Los de invitados se guardan sin dueño, solo para las estadísticas generales.
    db.guardar_analisis(usuario["id"] if usuario else None, solicitud.canal, respuesta)
    return respuesta


# ---------- Cuentas ----------

@app.post("/api/registro")
def registro(datos: SolicitudRegistro):
    try:
        usuario = db.crear_usuario(datos.nombre, datos.correo, datos.contrasena)
    except ValueError as exc:
        return JSONResponse(status_code=409, content={"error": str(exc)})
    return {"token": db.crear_sesion(usuario["id"]), "nombre": usuario["nombre"], "correo": usuario["correo"]}


@app.post("/api/login")
def login(datos: SolicitudLogin):
    usuario = db.verificar_usuario(datos.correo, datos.contrasena)
    if not usuario:
        return JSONResponse(status_code=401, content={"error": "Correo o contraseña incorrectos."})
    return {"token": db.crear_sesion(usuario["id"]), "nombre": usuario["nombre"], "correo": usuario["correo"]}


@app.post("/api/logout")
def logout(authorization: Optional[str] = Header(default=None)):
    db.cerrar_sesion(_token(authorization))
    return {"ok": True}


@app.get("/api/yo")
def yo(authorization: Optional[str] = Header(default=None)):
    usuario = _usuario_requerido(authorization)
    return {"nombre": usuario["nombre"], "correo": usuario["correo"]}


# ---------- Historial ----------

@app.get("/api/historial")
def ver_historial(authorization: Optional[str] = Header(default=None)):
    usuario = _usuario_requerido(authorization)
    return db.historial_de(usuario["id"])


@app.delete("/api/historial")
def borrar_historial(authorization: Optional[str] = Header(default=None)):
    usuario = _usuario_requerido(authorization)
    return {"borrados": db.borrar_historial(usuario["id"])}


# ---------- Reportes comunitarios ----------

@app.post("/api/reportes")
def crear_reporte(datos: SolicitudReporte, authorization: Optional[str] = Header(default=None)):
    usuario = _usuario_opcional(authorization)
    reporte_id = db.guardar_reporte(usuario["id"] if usuario else None, datos.mensaje)
    return {"id": reporte_id, "ok": True}


# ---------- Estadísticas ----------

@app.get("/api/estadisticas")
def ver_estadisticas():
    return db.estadisticas()
