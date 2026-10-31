"""Base de datos SQLite de AntesDePicar (responsable: Eduardo).

SQLite viene incluido en Python: no hay que instalar nada.
El archivo antesdepicar.db se crea solo la primera vez que se enciende el backend.
"""

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
from pathlib import Path

DB_PATH = os.getenv("DB_PATH", str(Path(__file__).parent / "antesdepicar.db"))


def conectar():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def crear_tablas():
    with conectar() as con:
        con.executescript(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                correo TEXT NOT NULL UNIQUE,
                contrasena_hash TEXT NOT NULL,
                sal TEXT NOT NULL,
                creado INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sesiones (
                token TEXT PRIMARY KEY,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                creado INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS analisis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                canal TEXT NOT NULL,
                nivel TEXT NOT NULL,
                titulo TEXT NOT NULL,
                mensaje TEXT NOT NULL,
                resultado TEXT NOT NULL,
                fecha INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS reportes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
                mensaje TEXT NOT NULL,
                fecha INTEGER NOT NULL
            );
            """
        )


def _ahora_ms() -> int:
    return int(time.time() * 1000)


# ---------- Contraseñas (nunca se guardan en texto plano) ----------

def _hash(contrasena: str, sal: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", contrasena.encode(), bytes.fromhex(sal), 200_000).hex()


# ---------- Usuarios y sesiones ----------

def crear_usuario(nombre: str, correo: str, contrasena: str) -> dict:
    sal = secrets.token_hex(16)
    try:
        with conectar() as con:
            cur = con.execute(
                "INSERT INTO usuarios (nombre, correo, contrasena_hash, sal, creado) VALUES (?, ?, ?, ?, ?)",
                (nombre, correo, _hash(contrasena, sal), sal, _ahora_ms()),
            )
            return {"id": cur.lastrowid, "nombre": nombre, "correo": correo}
    except sqlite3.IntegrityError:
        raise ValueError("Ya existe una cuenta con ese correo.")


def verificar_usuario(correo: str, contrasena: str):
    with conectar() as con:
        fila = con.execute("SELECT * FROM usuarios WHERE correo = ?", (correo,)).fetchone()
    if not fila or not hmac.compare_digest(fila["contrasena_hash"], _hash(contrasena, fila["sal"])):
        return None
    return {"id": fila["id"], "nombre": fila["nombre"], "correo": fila["correo"]}


def crear_sesion(usuario_id: int) -> str:
    token = secrets.token_urlsafe(32)
    with conectar() as con:
        con.execute("INSERT INTO sesiones (token, usuario_id, creado) VALUES (?, ?, ?)", (token, usuario_id, _ahora_ms()))
    return token


def usuario_por_token(token: str):
    if not token:
        return None
    with conectar() as con:
        fila = con.execute(
            "SELECT u.id, u.nombre, u.correo FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ?",
            (token,),
        ).fetchone()
    return dict(fila) if fila else None


def cerrar_sesion(token: str):
    with conectar() as con:
        con.execute("DELETE FROM sesiones WHERE token = ?", (token,))


# ---------- Historial de análisis ----------

def guardar_analisis(usuario_id, canal: str, resultado: dict) -> int:
    with conectar() as con:
        cur = con.execute(
            "INSERT INTO analisis (usuario_id, canal, nivel, titulo, mensaje, resultado, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                usuario_id,
                canal,
                resultado["nivel_riesgo"],
                resultado["tipo_posible"],
                resultado["mensaje"],
                json.dumps(resultado, ensure_ascii=False),
                _ahora_ms(),
            ),
        )
        return cur.lastrowid


def historial_de(usuario_id: int, limite: int = 200) -> list:
    with conectar() as con:
        filas = con.execute(
            "SELECT * FROM analisis WHERE usuario_id = ? ORDER BY fecha DESC LIMIT ?", (usuario_id, limite)
        ).fetchall()
    return [
        {
            "id": str(f["id"]),
            "fecha": f["fecha"],
            "canal": f["canal"],
            "nivel": f["nivel"],
            "titulo": f["titulo"],
            "mensaje": f["mensaje"],
            "resultado": json.loads(f["resultado"]),
        }
        for f in filas
    ]


def borrar_historial(usuario_id: int) -> int:
    with conectar() as con:
        return con.execute("DELETE FROM analisis WHERE usuario_id = ?", (usuario_id,)).rowcount


# ---------- Reportes comunitarios ----------

def guardar_reporte(usuario_id, mensaje: str) -> int:
    with conectar() as con:
        cur = con.execute(
            "INSERT INTO reportes (usuario_id, mensaje, fecha) VALUES (?, ?, ?)", (usuario_id, mensaje, _ahora_ms())
        )
        return cur.lastrowid


# ---------- Estadísticas ----------

def estadisticas() -> dict:
    with conectar() as con:
        analizados = con.execute("SELECT COUNT(*) FROM analisis").fetchone()[0]
        alto = con.execute("SELECT COUNT(*) FROM analisis WHERE nivel = 'alto'").fetchone()[0]
        reportes = con.execute("SELECT COUNT(*) FROM reportes").fetchone()[0]
        usuarios = con.execute("SELECT COUNT(*) FROM usuarios").fetchone()[0]
    return {"analizados": analizados, "riesgo_alto": alto, "reportes": reportes, "usuarios": usuarios}
