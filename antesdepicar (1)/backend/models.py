"""Tablas de la base de datos. Cualquier cambio aquí necesita una migración de Alembic."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = (CheckConstraint("correo = lower(correo)", name="correo_minusculas"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(100))
    correo: Mapped[str] = mapped_column(String(254), unique=True)
    contrasena_hash: Mapped[str] = mapped_column(String(255))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sesiones: Mapped[list["Sesion"]] = relationship(back_populates="usuario", cascade="all, delete-orphan", passive_deletes=True)
    analisis: Mapped[list["Analisis"]] = relationship(back_populates="usuario", cascade="all, delete-orphan", passive_deletes=True)


class Sesion(Base):
    """Sesión iniciada. Solo se guarda el hash del token, nunca el token de la cookie."""

    __tablename__ = "sesiones"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expira_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

    usuario: Mapped[Usuario] = relationship(back_populates="sesiones")


class Analisis(Base):
    """Un mensaje analizado por la IA. Pertenece siempre a un usuario registrado."""

    __tablename__ = "analisis"
    __table_args__ = (
        CheckConstraint("canal IN ('whatsapp', 'sms', 'correo', 'empleo', 'otro')", name="canal_valido"),
        CheckConstraint("nivel_riesgo IN ('bajo', 'medio', 'alto')", name="nivel_riesgo_valido"),
        Index("ix_analisis_usuario_fecha", "usuario_id", "creado_en"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    mensaje: Mapped[str] = mapped_column(Text)
    canal: Mapped[str] = mapped_column(String(20))
    nivel_riesgo: Mapped[str] = mapped_column(String(10))
    tipo_posible: Mapped[str] = mapped_column(Text)
    resumen: Mapped[str] = mapped_column(Text)
    recomendaciones: Mapped[list[str]] = mapped_column(JSONB)
    modelo: Mapped[str] = mapped_column(String(100))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario: Mapped[Usuario] = relationship(back_populates="analisis")
    senales: Mapped[list["Senal"]] = relationship(
        back_populates="analisis", cascade="all, delete-orphan", passive_deletes=True, order_by="Senal.posicion"
    )


class Senal(Base):
    """Señal de riesgo detectada en un análisis."""

    __tablename__ = "senales"
    __table_args__ = (UniqueConstraint("analisis_id", "posicion", name="uq_senales_analisis_posicion"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analisis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("analisis.id", ondelete="CASCADE"))
    posicion: Mapped[int] = mapped_column(Integer)
    titulo: Mapped[str] = mapped_column(Text)
    explicacion: Mapped[str] = mapped_column(Text)
    evidencia: Mapped[str] = mapped_column(Text)
    verificada: Mapped[bool] = mapped_column(Boolean)
    inicio: Mapped[int | None] = mapped_column(Integer)
    fin: Mapped[int | None] = mapped_column(Integer)

    analisis: Mapped[Analisis] = relationship(back_populates="senales")


class Reporte(Base):
    """Reporte comunitario. Es anónimo: a propósito no tiene relación con usuarios."""

    __tablename__ = "reportes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    mensaje: Mapped[str] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
