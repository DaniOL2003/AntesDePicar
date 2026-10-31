"""Crea el usuario y las bases de PostgreSQL del proyecto y genera backend/.env.

Ejecutar desde la carpeta backend, con el entorno virtual activado:
    python scripts/preparar_bd.py

Pide la contraseña del administrador "postgres" sin mostrarla y no la guarda en ningún archivo.
La contraseña de la aplicación se genera al azar y solo queda en .env.
Se puede repetir sin riesgo: nunca borra bases, tablas ni datos.
"""

import getpass
import os
import re
import secrets
import sys
from pathlib import Path

import psycopg
from psycopg import sql

BACKEND = Path(__file__).resolve().parent.parent
ENV = BACKEND / ".env"
EJEMPLO = BACKEND / ".env.example"
ROL = "antesdepicar"
BASES = ("antesdepicar", "antesdepicar_test")
MARCADOR = "CAMBIA_ESTA_CONTRASENA"
HOST = os.getenv("PGHOST", "localhost")
PUERTO = os.getenv("PGPORT", "5432")


def contrasena_actual() -> str | None:
    """Reutiliza la contraseña de un .env existente, para no dejarlo desactualizado."""
    if not ENV.exists():
        return None
    coincidencia = re.search(rf"^DATABASE_URL=\S+://{ROL}:([^@\s]+)@", ENV.read_text(encoding="utf-8"), re.M)
    if coincidencia and coincidencia.group(1) != MARCADOR:
        return coincidencia.group(1)
    return None


def conectar(usuario: str, contrasena: str, base: str) -> psycopg.Connection:
    return psycopg.connect(
        host=HOST, port=PUERTO, user=usuario, password=contrasena, dbname=base, autocommit=True, connect_timeout=5
    )


def preparar_rol(admin: psycopg.Connection, contrasena: str) -> None:
    existe = admin.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (ROL,)).fetchone()
    orden = "ALTER ROLE {} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD {}"
    if not existe:
        orden = "CREATE ROLE {} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD {}"
    admin.execute(sql.SQL(orden).format(sql.Identifier(ROL), sql.Literal(contrasena)))
    print(f"Usuario {ROL}: {'actualizado' if existe else 'creado'} (sin privilegios de administrador).")


def preparar_base(admin: psycopg.Connection, contrasena_admin: str, base: str) -> None:
    fila = admin.execute(
        "SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname = %s", (base,)
    ).fetchone()
    if fila is None:
        admin.execute(
            sql.SQL("CREATE DATABASE {} OWNER {} ENCODING 'UTF8' TEMPLATE template0").format(
                sql.Identifier(base), sql.Identifier(ROL)
            )
        )
        print(f"Base {base}: creada.")
        return

    print(f"Base {base}: ya existía (propietario: {fila[0]}). No se modificó su contenido.")
    if fila[0] != ROL:
        # No se cambia el propietario: solo se da el acceso mínimo para migrar y usarla.
        with conectar("postgres", contrasena_admin, base) as conexion:
            conexion.execute(sql.SQL("GRANT CONNECT ON DATABASE {} TO {}").format(sql.Identifier(base), sql.Identifier(ROL)))
            conexion.execute(sql.SQL("GRANT USAGE, CREATE ON SCHEMA public TO {}").format(sql.Identifier(ROL)))
        print(f"Base {base}: se dio acceso al usuario {ROL}.")


def escribir_env(contrasena: str) -> None:
    contenido = ENV.read_text(encoding="utf-8") if ENV.exists() else EJEMPLO.read_text(encoding="utf-8")
    temporal = ENV.with_name(".env.tmp")
    temporal.write_text(contenido.replace(MARCADOR, contrasena), encoding="utf-8")
    temporal.replace(ENV)
    print(f"Archivo creado: {ENV}")


def verificar(contrasena: str) -> None:
    for base in BASES:
        with conectar(ROL, contrasena, base) as conexion:
            puede_crear = conexion.execute("SELECT has_schema_privilege(current_user, 'public', 'CREATE')").fetchone()[0]
        if not puede_crear:
            raise RuntimeError(f"{ROL} no puede crear tablas en {base}.")
    print(f"Conexión comprobada con el usuario {ROL} en: {', '.join(BASES)}.")


def main() -> int:
    if not EJEMPLO.exists():
        print(f"No encontré {EJEMPLO}.")
        return 1

    contrasena_admin = os.getenv("PGPASSWORD") or getpass.getpass("Contraseña del usuario postgres (no se muestra): ")
    if not contrasena_admin:
        print("No se escribió ninguna contraseña; no se hizo ningún cambio.")
        return 1

    contrasena = contrasena_actual() or secrets.token_hex(24)  # solo letras y números: segura dentro de una URL
    try:
        with conectar("postgres", contrasena_admin, "postgres") as admin:
            version = admin.execute("SHOW server_version").fetchone()[0]
            print(f"Conectado a PostgreSQL {version} en {HOST}:{PUERTO}.")
            preparar_rol(admin, contrasena)
            for base in BASES:
                preparar_base(admin, contrasena_admin, base)
        escribir_env(contrasena)
        verificar(contrasena)
    except psycopg.OperationalError as error:
        print(f"No se pudo completar la conexión ({type(error).__name__}). ¿Es correcta la contraseña de postgres?")
        print("Si ya existía un archivo .env, no se perdió.")
        return 1
    except (psycopg.Error, RuntimeError) as error:
        print(f"PostgreSQL rechazó la operación: {type(error).__name__}: {error}")
        return 1

    print("Listo. Siguiente paso: alembic upgrade head")
    return 0


if __name__ == "__main__":
    sys.exit(main())
