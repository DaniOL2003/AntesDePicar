"""Configuración de Alembic. Usa la misma DATABASE_URL que la aplicación."""

from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

import models  # noqa: E402,F401  (registra las tablas en Base.metadata)
from database import Base, url_base_datos  # noqa: E402

if context.config.config_file_name:
    fileConfig(context.config.config_file_name, disable_existing_loggers=False)


def ejecutar_migraciones() -> None:
    motor = create_engine(url_base_datos())
    with motor.connect() as conexion:
        context.configure(connection=conexion, target_metadata=Base.metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()
    motor.dispose()


if context.is_offline_mode():
    raise SystemExit("Este proyecto solo ejecuta migraciones conectado a la base de datos.")

ejecutar_migraciones()
