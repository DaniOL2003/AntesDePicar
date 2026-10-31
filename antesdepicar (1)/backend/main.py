"""API de AntesDePicar (responsable: Eduardo).

Ejecutar desde la carpeta backend:
    uvicorn main:app --reload --port 8000
"""

import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request  # noqa: E402
from fastapi.exceptions import RequestValidationError  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from schemas import RespuestaAnalisis, SolicitudAnalisis  # noqa: E402
from services.ai_service import IAError, analizar_mensaje, estado_ollama  # noqa: E402

app = FastAPI(
    title="AntesDePicar API",
    description="Análisis de posibles estafas digitales con IA de pesos abiertos (Qwen + Ollama).",
    version="1.0.0",
)

origenes = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origenes if o.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


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


@app.get("/api/salud")
async def salud():
    return {"api": True, **(await estado_ollama())}


@app.post("/api/analizar", response_model=RespuestaAnalisis)
async def analizar(solicitud: SolicitudAnalisis):
    resultado = await analizar_mensaje(solicitud.mensaje, solicitud.canal)
    return {**resultado, "mensaje": solicitud.mensaje}
