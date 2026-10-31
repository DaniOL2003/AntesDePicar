"""Historial de análisis del usuario que inició sesión."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import obtener_bd
from dependencias import requerir_usuario
from models import Usuario
from schemas import RespuestaHistorial
from services import historial_service

router = APIRouter(prefix="/api/historial", tags=["historial"])


@router.get("", response_model=RespuestaHistorial)
def listar(
    limite: int = Query(200, ge=1, le=200),
    desplazamiento: int = Query(0, ge=0),
    usuario: Usuario = Depends(requerir_usuario),
    bd: Session = Depends(obtener_bd),
):
    return historial_service.listar_analisis(bd, usuario.id, limite, desplazamiento)


@router.delete("/{analisis_id}", status_code=204)
def eliminar(analisis_id: uuid.UUID, usuario: Usuario = Depends(requerir_usuario), bd: Session = Depends(obtener_bd)):
    # Un análisis ajeno responde igual que uno inexistente, para no revelar que existe.
    if not historial_service.eliminar_analisis(bd, usuario.id, analisis_id):
        raise HTTPException(status_code=404, detail="Ese análisis ya no existe.")


@router.delete("", status_code=204)
def eliminar_todo(usuario: Usuario = Depends(requerir_usuario), bd: Session = Depends(obtener_bd)):
    historial_service.eliminar_todos(bd, usuario.id)
