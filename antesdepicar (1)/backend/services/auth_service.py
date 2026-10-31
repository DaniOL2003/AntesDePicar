"""Cuentas y sesiones: contraseñas con Argon2id y sesiones revocables guardadas en PostgreSQL."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models import Sesion, Usuario

DURACION_RECORDAR = timedelta(days=30)
DURACION_NORMAL = timedelta(hours=12)

_hasher = PasswordHasher()
# Se verifica aunque el correo no exista, para no revelar por el tiempo de respuesta qué cuentas existen.
_HASH_FICTICIO = _hasher.hash(secrets.token_hex(16))


class CorreoRegistrado(Exception):
    """Ya existe una cuenta con ese correo."""


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def crear_usuario(bd: Session, nombre: str, correo: str, contrasena: str) -> Usuario:
    usuario = Usuario(nombre=nombre, correo=correo, contrasena_hash=_hasher.hash(contrasena))
    bd.add(usuario)
    try:
        bd.commit()
    except IntegrityError as exc:
        bd.rollback()
        raise CorreoRegistrado from exc
    return usuario


def autenticar(bd: Session, correo: str, contrasena: str) -> Usuario | None:
    usuario = bd.scalar(select(Usuario).where(Usuario.correo == correo))
    try:
        _hasher.verify(usuario.contrasena_hash if usuario else _HASH_FICTICIO, contrasena)
    except (VerificationError, InvalidHashError):
        return None
    if usuario is None:
        return None
    if _hasher.check_needs_rehash(usuario.contrasena_hash):
        usuario.contrasena_hash = _hasher.hash(contrasena)
        bd.commit()
    return usuario


def crear_sesion(bd: Session, usuario: Usuario, recordar: bool) -> str:
    """Crea la sesión y devuelve el token para la cookie. También limpia sus sesiones vencidas."""
    ahora = datetime.now(timezone.utc)
    bd.execute(delete(Sesion).where(Sesion.usuario_id == usuario.id, Sesion.expira_en <= ahora))
    token = secrets.token_urlsafe(32)
    duracion = DURACION_RECORDAR if recordar else DURACION_NORMAL
    bd.add(Sesion(usuario_id=usuario.id, token_hash=_hash_token(token), expira_en=ahora + duracion))
    bd.commit()
    return token


def usuario_por_token(bd: Session, token: str) -> Usuario | None:
    return bd.scalar(
        select(Usuario)
        .join(Sesion)
        .where(Sesion.token_hash == _hash_token(token), Sesion.expira_en > datetime.now(timezone.utc))
    )


def cerrar_sesion(bd: Session, token: str) -> None:
    bd.execute(delete(Sesion).where(Sesion.token_hash == _hash_token(token)))
    bd.commit()
