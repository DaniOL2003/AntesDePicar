"""Esquemas de entrada y salida de la API (responsable: Eduardo)."""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

Canal = Literal["whatsapp", "sms", "correo", "empleo", "otro"]

MIN_CARACTERES = 10
MAX_CARACTERES = 5000


class SolicitudAnalisis(BaseModel):
    mensaje: str = Field(..., description="Texto del mensaje sospechoso")
    canal: Canal = "otro"

    @field_validator("mensaje")
    @classmethod
    def validar_mensaje(cls, valor: str) -> str:
        valor = valor.strip()
        if len(valor) < MIN_CARACTERES:
            raise ValueError(f"El mensaje debe tener al menos {MIN_CARACTERES} caracteres.")
        if len(valor) > MAX_CARACTERES:
            raise ValueError(f"El mensaje no puede superar {MAX_CARACTERES} caracteres.")
        return valor


class SenalRiesgo(BaseModel):
    titulo: str
    explicacion: str
    evidencia: str
    verificada: bool
    inicio: Optional[int] = None
    fin: Optional[int] = None


class RespuestaAnalisis(BaseModel):
    nivel_riesgo: Literal["bajo", "medio", "alto"]
    tipo_posible: str
    resumen: str
    senales: List[SenalRiesgo]
    recomendaciones: List[str]
    modelo: str
    mensaje: str
    aviso: str = (
        "Este análisis es orientativo y fue generado por un modelo de IA de pesos abiertos. "
        "Puede equivocarse: verifica siempre por canales oficiales."
    )
