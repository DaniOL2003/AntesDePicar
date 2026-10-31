"""API de AntesDePicar (responsable: Eduardo).

Ejecutar desde la carpeta backend:
    uvicorn main:app --reload --port 8000
"""

import logging
import os
import uuid

from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, Request  # noqa: E402
from fastapi.concurrency import run_in_threadpool  # noqa: E402
from fastapi.exceptions import RequestValidationError  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402
from sqlalchemy.exc import SQLAlchemyError  # noqa: E402
from starlette.exceptions import HTTPException as StarletteHTTPException  # noqa: E402

from database import BaseDatosNoConfigurada, base_datos_disponible  # noqa: E402
from dependencias import id_usuario_opcional  # noqa: E402
from routers import auth, historial, reportes  # noqa: E402
from schemas import RespuestaAnalisis, SolicitudAnalisis  # noqa: E402
from services.ai_service import IAError, analizar_mensaje, estado_ollama  # noqa: E402
from services.historial_service import guardar_analisis  # noqa: E402

registro = logging.getLogger("antesdepicar")

app = FastAPI(
    title="AntesDePicar API",
    description="Análisis de posibles estafas digitales con IA de pesos abiertos (Qwen + Ollama).",
    version="1.0.0",
)

origenes = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origenes if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(auth.router)
app.include_router(historial.router)
app.include_router(reportes.router)


@app.exception_handler(RequestValidationError)
async def error_validacion(_: Request, exc: RequestValidationError):
    primero = exc.errors()[0] if exc.errors() else {}
    campo = list(primero.get("loc", []))[-1:]
    detalle = str(primero.get("msg", "Solicitud inválida")).replace("Value error, ", "")
    if campo == ["canal"]:
        detalle = "Canal no válido. Usa: whatsapp, sms, correo, empleo u otro."
    elif campo == ["correo"]:
        detalle = "Escribe un correo válido."
    return JSONResponse(status_code=422, content={"error": detalle})


@app.exception_handler(IAError)
async def error_ia(_: Request, exc: IAError):
    return JSONResponse(status_code=exc.codigo, content={"error": exc.mensaje})


@app.exception_handler(StarletteHTTPException)
async def error_http(_: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(SQLAlchemyError)
@app.exception_handler(BaseDatosNoConfigurada)
async def error_base_datos(_: Request, exc: Exception):
    # El detalle queda en el registro del servidor: podría incluir datos de la conexión.
    registro.error("Error de base de datos: %s", type(exc).__name__)
    return JSONResponse(status_code=503, content={"error": "La base de datos no está disponible. Intenta más tarde."})


@app.get("/api/salud")
async def salud():
    return {"api": True, "base_datos": await run_in_threadpool(base_datos_disponible), **(await estado_ollama())}


@app.post("/api/analizar", response_model=RespuestaAnalisis)
async def analizar(solicitud: SolicitudAnalisis, usuario_id: uuid.UUID | None = Depends(id_usuario_opcional)):
    resultado = await analizar_mensaje(solicitud.mensaje, solicitud.canal)
    respuesta = {**resultado, "mensaje": solicitud.mensaje}
    if usuario_id:
        try:
            respuesta["id"] = await run_in_threadpool(guardar_analisis, usuario_id, respuesta, solicitud.canal)
            respuesta["guardado"] = True
        except (SQLAlchemyError, BaseDatosNoConfigurada):
            # El usuario no debe perder su análisis por un fallo al guardarlo.
            registro.exception("No se pudo guardar el análisis")
    return respuesta
