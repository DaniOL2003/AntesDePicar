"""Historial de análisis. Toda consulta se filtra por usuario para no mezclar información."""

import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session, selectinload

from database import abrir_sesion
from models import Analisis, Senal


def guardar_analisis(usuario_id: uuid.UUID, resultado: dict, canal: str) -> uuid.UUID:
    analisis = Analisis(
        usuario_id=usuario_id,
        mensaje=resultado["mensaje"],
        canal=canal,
        nivel_riesgo=resultado["nivel_riesgo"],
        tipo_posible=resultado["tipo_posible"],
        resumen=resultado["resumen"],
        recomendaciones=resultado["recomendaciones"],
        modelo=resultado["modelo"],
        senales=[Senal(posicion=i, **senal) for i, senal in enumerate(resultado["senales"])],
    )
    # Sesión propia y breve: así no se ocupa una conexión mientras la IA responde.
    with abrir_sesion() as bd:
        bd.add(analisis)
        bd.commit()
        return analisis.id


def listar_analisis(bd: Session, usuario_id: uuid.UUID, limite: int, desplazamiento: int) -> dict:
    total = bd.scalar(select(func.count()).select_from(Analisis).where(Analisis.usuario_id == usuario_id))
    registros = bd.scalars(
        select(Analisis)
        .where(Analisis.usuario_id == usuario_id)
        .options(selectinload(Analisis.senales))
        .order_by(Analisis.creado_en.desc())
        .limit(limite)
        .offset(desplazamiento)
    ).all()
    return {"total": total, "elementos": [_a_elemento(a) for a in registros]}


def eliminar_analisis(bd: Session, usuario_id: uuid.UUID, analisis_id: uuid.UUID) -> bool:
    resultado = bd.execute(delete(Analisis).where(Analisis.id == analisis_id, Analisis.usuario_id == usuario_id))
    bd.commit()
    return resultado.rowcount > 0


def eliminar_todos(bd: Session, usuario_id: uuid.UUID) -> int:
    resultado = bd.execute(delete(Analisis).where(Analisis.usuario_id == usuario_id))
    bd.commit()
    return resultado.rowcount


def _a_elemento(a: Analisis) -> dict:
    return {
        "id": a.id,
        "fecha": a.creado_en,
        "canal": a.canal,
        "nivel": a.nivel_riesgo,
        "titulo": a.tipo_posible,
        "mensaje": a.mensaje,
        "resultado": {
            "nivel_riesgo": a.nivel_riesgo,
            "tipo_posible": a.tipo_posible,
            "resumen": a.resumen,
            "senales": a.senales,
            "recomendaciones": a.recomendaciones,
            "modelo": a.modelo,
            "mensaje": a.mensaje,
        },
    }
