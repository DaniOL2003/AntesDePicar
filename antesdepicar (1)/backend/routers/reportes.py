"""Reportes comunitarios anónimos: no se guarda quién los envió."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import obtener_bd
from models import Reporte
from schemas import SolicitudReporte
from services import limitador

router = APIRouter(prefix="/api/reportes", tags=["reportes"])

MAX_REPORTES = 20
VENTANA_REPORTES = 60 * 60


@router.post("", status_code=201)
def crear(datos: SolicitudReporte, request: Request, bd: Session = Depends(obtener_bd)):
    # La IP solo se conserva un rato en memoria para el límite; nunca llega a la base de datos.
    clave = f"reporte:{request.client.host if request.client else 'desconocida'}"
    if limitador.excedido(clave, MAX_REPORTES, VENTANA_REPORTES):
        raise HTTPException(status_code=429, detail="Demasiados reportes. Intenta más tarde.")
    limitador.anotar(clave)
    bd.add(Reporte(mensaje=datos.mensaje))
    bd.commit()
    return {"registrado": True}
