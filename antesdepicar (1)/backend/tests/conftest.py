"""Las pruebas nunca usan la base real: DATABASE_URL se reemplaza antes de importar la aplicación."""

import os
import sys
from pathlib import Path

import pytest
from dotenv import load_dotenv

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))
load_dotenv(BACKEND / ".env")

URL_PRUEBAS = os.getenv("TEST_DATABASE_URL", "").strip()
os.environ["DATABASE_URL"] = URL_PRUEBAS
os.environ["COOKIE_SECURE"] = "false"


@pytest.fixture(scope="session")
def _migraciones():
    if not URL_PRUEBAS:
        pytest.skip("Sin TEST_DATABASE_URL: se omiten las pruebas con PostgreSQL.")
    from sqlalchemy.engine import make_url

    if "test" not in (make_url(URL_PRUEBAS).database or ""):
        pytest.exit("TEST_DATABASE_URL debe apuntar a una base con 'test' en el nombre.", returncode=2)

    from alembic import command
    from alembic.config import Config

    config = Config(str(BACKEND / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND / "migrations"))
    command.upgrade(config, "head")


@pytest.fixture
def bd_limpia(_migraciones):
    from sqlalchemy import text

    from database import abrir_sesion
    from services import limitador

    limitador.limpiar()
    with abrir_sesion() as bd:
        bd.execute(text("TRUNCATE usuarios, sesiones, analisis, senales, reportes CASCADE"))
        bd.commit()
