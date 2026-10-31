"""Conexión con PostgreSQL. La URL se lee de la variable de entorno DATABASE_URL."""

import os
from collections.abc import Iterator

from sqlalchemy import MetaData, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class BaseDatosNoConfigurada(RuntimeError):
    """Falta la variable de entorno DATABASE_URL."""


class Base(DeclarativeBase):
    # Nombres de restricciones estables para que las migraciones sean predecibles.
    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
    )


_fabrica: sessionmaker[Session] | None = None


def url_base_datos() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        raise BaseDatosNoConfigurada("Falta DATABASE_URL en el archivo .env.")
    return url


def abrir_sesion() -> Session:
    """Abre una sesión de base de datos. El motor se crea la primera vez que se necesita."""
    global _fabrica
    if _fabrica is None:
        motor = create_engine(url_base_datos(), pool_pre_ping=True, connect_args={"connect_timeout": 5})
        _fabrica = sessionmaker(bind=motor, expire_on_commit=False)
    return _fabrica()


def obtener_bd() -> Iterator[Session]:
    """Dependencia de FastAPI: entrega una sesión y la cierra al terminar la solicitud."""
    with abrir_sesion() as bd:
        yield bd


def base_datos_disponible() -> bool:
    try:
        with abrir_sesion() as bd:
            bd.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
