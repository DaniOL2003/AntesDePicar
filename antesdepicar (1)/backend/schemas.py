"""Esquemas de entrada y salida de la API (responsable: Eduardo)."""

from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

Canal = Literal["whatsapp", "sms", "correo", "empleo", "otro"]

MIN_CARACTERES = 10
MAX_CARACTERES = 5000
MIN_CONTRASENA = 8
MAX_CONTRASENA = 128


def _validar_texto_mensaje(valor: str) -> str:
    valor = valor.strip()
    if len(valor) < MIN_CARACTERES:
        raise ValueError(f"El mensaje debe tener al menos {MIN_CARACTERES} caracteres.")
    if len(valor) > MAX_CARACTERES:
        raise ValueError(f"El mensaje no puede superar {MAX_CARACTERES} caracteres.")
    return valor


class SolicitudAnalisis(BaseModel):
    mensaje: str = Field(..., description="Texto del mensaje sospechoso")
    canal: Canal = "otro"

    @field_validator("mensaje")
    @classmethod
    def validar_mensaje(cls, valor: str) -> str:
        return _validar_texto_mensaje(valor)


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
    id: Optional[UUID] = None
    guardado: bool = False


class SolicitudLogin(BaseModel):
    correo: EmailStr
    contrasena: str = Field(..., max_length=MAX_CONTRASENA)
    recordar: bool = True

    @field_validator("correo")
    @classmethod
    def normalizar_correo(cls, valor: str) -> str:
        return valor.strip().lower()


class SolicitudRegistro(SolicitudLogin):
    nombre: str

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor: str) -> str:
        valor = valor.strip()
        if not 2 <= len(valor) <= 100:
            raise ValueError("Escribe tu nombre (entre 2 y 100 caracteres).")
        return valor

    @field_validator("contrasena")
    @classmethod
    def validar_contrasena(cls, valor: str) -> str:
        if len(valor) < MIN_CONTRASENA:
            raise ValueError(f"La contraseña debe tener al menos {MIN_CONTRASENA} caracteres.")
        return valor


class UsuarioPublico(BaseModel):
    """Datos del usuario que se pueden devolver. Nunca incluye el hash de la contraseña."""

    nombre: str
    correo: str


class ResultadoGuardado(BaseModel):
    nivel_riesgo: str
    tipo_posible: str
    resumen: str
    senales: List[SenalRiesgo]
    recomendaciones: List[str]
    modelo: str
    mensaje: str


class ElementoHistorial(BaseModel):
    id: UUID
    fecha: datetime
    canal: str
    nivel: str
    titulo: str
    mensaje: str
    resultado: ResultadoGuardado


class RespuestaHistorial(BaseModel):
    total: int
    elementos: List[ElementoHistorial]


class SolicitudReporte(BaseModel):
    mensaje: str

    @field_validator("mensaje")
    @classmethod
    def validar_mensaje(cls, valor: str) -> str:
        return _validar_texto_mensaje(valor)
