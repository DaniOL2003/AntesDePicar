"""Pruebas contra PostgreSQL real. La IA siempre va simulada: aquí no se prueba Ollama."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import inspect, select, text, update
from sqlalchemy.exc import IntegrityError

import services.ai_service as ai
from database import abrir_sesion
from main import app
from models import Analisis, Reporte, Senal, Sesion, Usuario

pytestmark = pytest.mark.usefixtures("bd_limpia")

CONTRASENA = "contrasena-segura-1"
MENSAJE = "BBVA: confirma tu NIP en http://bbva-mx-seguro.xyz hoy mismo."
RESPUESTA_IA = {
    "nivel_riesgo": "alto",
    "tipo_posible": "Phishing bancario",
    "resumen": "Parece un intento de robo.",
    "senales": [
        {"titulo": "Pide NIP", "explicacion": "Los bancos no lo piden.", "evidencia": "confirma tu NIP"},
        {"titulo": "Inventada", "explicacion": "x", "evidencia": "gane un iPhone"},
    ],
    "recomendaciones": ["No abras el enlace."],
}


@pytest.fixture(autouse=True)
def ia_simulada(monkeypatch):
    async def falso(mensaje, canal):
        return RESPUESTA_IA

    monkeypatch.setattr(ai, "_llamar_ollama", falso)


def cliente_nuevo() -> TestClient:
    return TestClient(app)


def registrar(correo="ana@ejemplo.com", contrasena=CONTRASENA, nombre="Ana", recordar=True) -> TestClient:
    cliente = cliente_nuevo()
    r = cliente.post("/api/auth/registro", json={"nombre": nombre, "correo": correo, "contrasena": contrasena, "recordar": recordar})
    assert r.status_code == 201, r.text
    return cliente


def analizar(cliente, mensaje=MENSAJE):
    r = cliente.post("/api/analizar", json={"mensaje": mensaje, "canal": "sms"})
    assert r.status_code == 200, r.text
    return r.json()


def test_conexion_y_tablas_de_la_migracion():
    with abrir_sesion() as bd:
        assert "PostgreSQL" in bd.scalar(text("SELECT version()"))
        tablas = set(inspect(bd.connection()).get_table_names())
    assert {"usuarios", "sesiones", "analisis", "senales", "reportes", "alembic_version"} == tablas


def test_crear_y_consultar_registro():
    with abrir_sesion() as bd:
        bd.add(Reporte(mensaje="Mensaje sospechoso de prueba"))
        bd.commit()
        assert bd.scalar(select(Reporte.mensaje)) == "Mensaje sospechoso de prueba"


def test_salud_reporta_base_de_datos():
    assert cliente_nuevo().get("/api/salud").json()["base_datos"] is True


def test_registro_devuelve_solo_datos_publicos():
    cliente = cliente_nuevo()
    r = cliente.post("/api/auth/registro", json={"nombre": " Ana ", "correo": "ANA@Ejemplo.com", "contrasena": CONTRASENA})
    assert r.status_code == 201
    assert r.json() == {"nombre": "Ana", "correo": "ana@ejemplo.com"}


def test_correo_duplicado_sin_importar_mayusculas():
    registrar()
    r = cliente_nuevo().post("/api/auth/registro", json={"nombre": "Otra", "correo": "ANA@ejemplo.com", "contrasena": CONTRASENA})
    assert r.status_code == 409


@pytest.mark.parametrize(
    "datos, fragmento",
    [
        ({"nombre": "Ana", "correo": "malo", "contrasena": CONTRASENA}, "correo"),
        ({"nombre": "Ana", "correo": "a@ejemplo.com", "contrasena": "corta"}, "8 caracteres"),
        ({"nombre": "A", "correo": "a@ejemplo.com", "contrasena": CONTRASENA}, "nombre"),
        ({"nombre": "Ana", "correo": "a@ejemplo.com", "contrasena": "x" * 129}, ""),
    ],
)
def test_registro_valida_datos(datos, fragmento):
    r = cliente_nuevo().post("/api/auth/registro", json=datos)
    assert r.status_code == 422
    assert fragmento in r.json()["error"]


def test_contrasena_guardada_con_argon2id():
    registrar()
    with abrir_sesion() as bd:
        guardado = bd.scalar(select(Usuario.contrasena_hash))
    assert guardado.startswith("$argon2id$")
    assert CONTRASENA not in guardado


def test_token_de_sesion_no_se_guarda_en_claro():
    cliente = registrar()
    token = cliente.cookies.get("adp_sesion")
    with abrir_sesion() as bd:
        guardado = bd.scalar(select(Sesion.token_hash))
    assert token and guardado != token and len(guardado) == 64


def test_cookie_httponly_y_samesite():
    cliente = cliente_nuevo()
    r = cliente.post("/api/auth/registro", json={"nombre": "Ana", "correo": "a@ejemplo.com", "contrasena": CONTRASENA})
    cookie = r.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=lax" in cookie and "max-age=" in cookie


def test_sin_recordar_la_cookie_es_de_sesion_y_dura_menos():
    cliente = cliente_nuevo()
    r = cliente.post("/api/auth/registro", json={"nombre": "Ana", "correo": "a@ejemplo.com", "contrasena": CONTRASENA, "recordar": False})
    assert "max-age" not in r.headers["set-cookie"].lower()
    with abrir_sesion() as bd:
        expira = bd.scalar(select(Sesion.expira_en))
    assert expira < datetime.now(timezone.utc) + timedelta(hours=13)


def test_login_correcto_e_incorrecto():
    registrar()
    cliente = cliente_nuevo()
    assert cliente.post("/api/auth/login", json={"correo": "ana@ejemplo.com", "contrasena": "equivocada1"}).status_code == 401
    assert cliente.post("/api/auth/login", json={"correo": "nadie@ejemplo.com", "contrasena": CONTRASENA}).status_code == 401
    r = cliente.post("/api/auth/login", json={"correo": "ANA@ejemplo.com", "contrasena": CONTRASENA})
    assert r.status_code == 200 and r.json()["correo"] == "ana@ejemplo.com"
    assert cliente.get("/api/auth/sesion").json()["nombre"] == "Ana"


def test_limite_de_intentos_de_login():
    registrar()
    cliente = cliente_nuevo()
    malo = {"correo": "ana@ejemplo.com", "contrasena": "equivocada1"}
    for _ in range(10):
        assert cliente.post("/api/auth/login", json=malo).status_code == 401
    assert cliente.post("/api/auth/login", json=malo).status_code == 429


def test_logout_revoca_la_sesion_en_el_servidor():
    cliente = registrar()
    token = cliente.cookies.get("adp_sesion")
    assert cliente.post("/api/auth/logout").status_code == 204
    robado = cliente_nuevo()
    robado.cookies.set("adp_sesion", token, path="/api")
    assert robado.get("/api/auth/sesion").status_code == 401
    with abrir_sesion() as bd:
        assert bd.scalar(select(Sesion)) is None


def test_sesion_vencida_no_sirve():
    cliente = registrar()
    with abrir_sesion() as bd:
        bd.execute(update(Sesion).values(expira_en=datetime.now(timezone.utc) - timedelta(minutes=1)))
        bd.commit()
    assert cliente.get("/api/auth/sesion").status_code == 401


@pytest.mark.parametrize(
    "metodo, ruta",
    [
        ("get", "/api/auth/sesion"),
        ("get", "/api/historial"),
        ("delete", "/api/historial"),
        ("delete", f"/api/historial/{uuid.uuid4()}"),
    ],
)
def test_rutas_protegidas_exigen_sesion(metodo, ruta):
    assert getattr(cliente_nuevo(), metodo)(ruta).status_code == 401


def test_analisis_con_sesion_se_guarda_completo():
    cliente = registrar()
    resultado = analizar(cliente)
    assert resultado["guardado"] is True and resultado["id"]

    historial = cliente.get("/api/historial").json()
    assert historial["total"] == 1
    elemento = historial["elementos"][0]
    assert elemento["id"] == resultado["id"]
    assert elemento["nivel"] == "alto" and elemento["canal"] == "sms" and elemento["mensaje"] == MENSAJE
    assert datetime.fromisoformat(elemento["fecha"]).tzinfo is not None

    senales = elemento["resultado"]["senales"]
    assert [s["titulo"] for s in senales] == ["Pide NIP", "Inventada"]
    assert senales[0]["verificada"] is True and MENSAJE[senales[0]["inicio"]:senales[0]["fin"]] == "confirma tu NIP"
    assert senales[1]["verificada"] is False and senales[1]["inicio"] is None
    assert elemento["resultado"]["recomendaciones"] == ["No abras el enlace."]


def test_invitado_analiza_sin_guardar_nada():
    resultado = analizar(cliente_nuevo())
    assert resultado["guardado"] is False and resultado["id"] is None
    assert resultado["nivel_riesgo"] == "alto"
    with abrir_sesion() as bd:
        assert bd.scalar(select(Analisis)) is None


def test_cookie_invalida_analiza_sin_guardar():
    cliente = cliente_nuevo()
    cliente.cookies.set("adp_sesion", "token-falso", path="/api")
    assert analizar(cliente)["guardado"] is False


def test_separacion_entre_usuarios():
    ana = registrar("ana@ejemplo.com", nombre="Ana")
    beto = registrar("beto@ejemplo.com", nombre="Beto")
    id_ana = analizar(ana, "Mensaje privado de Ana para la prueba")["id"]
    analizar(beto, "Mensaje privado de Beto para la prueba")

    mensajes_beto = [e["mensaje"] for e in beto.get("/api/historial").json()["elementos"]]
    assert mensajes_beto == ["Mensaje privado de Beto para la prueba"]

    assert beto.delete(f"/api/historial/{id_ana}").status_code == 404
    assert beto.delete("/api/historial").status_code == 204
    assert ana.get("/api/historial").json()["total"] == 1
    assert beto.get("/api/historial").json()["total"] == 0


def test_eliminar_un_analisis_borra_sus_senales():
    cliente = registrar()
    primero = analizar(cliente, "Primer mensaje para eliminar")["id"]
    analizar(cliente, "Segundo mensaje que se conserva")
    assert cliente.delete(f"/api/historial/{primero}").status_code == 204
    assert cliente.delete(f"/api/historial/{primero}").status_code == 404
    elementos = cliente.get("/api/historial").json()["elementos"]
    assert [e["mensaje"] for e in elementos] == ["Segundo mensaje que se conserva"]
    with abrir_sesion() as bd:
        assert len(bd.scalars(select(Senal)).all()) == 2


def test_eliminar_todo_el_historial():
    cliente = registrar()
    analizar(cliente)
    analizar(cliente)
    assert cliente.delete("/api/historial").status_code == 204
    assert cliente.get("/api/historial").json() == {"total": 0, "elementos": []}
    with abrir_sesion() as bd:
        assert bd.scalar(select(Senal)) is None


def test_historial_ordenado_y_paginado():
    cliente = registrar()
    for i in range(3):
        analizar(cliente, f"Mensaje numero {i} del historial")
    r = cliente.get("/api/historial", params={"limite": 2, "desplazamiento": 1}).json()
    assert r["total"] == 3
    assert [e["mensaje"] for e in r["elementos"]] == ["Mensaje numero 1 del historial", "Mensaje numero 0 del historial"]
    assert cliente.get("/api/historial", params={"limite": 999}).status_code == 422


def test_reporte_anonimo():
    r = cliente_nuevo().post("/api/reportes", json={"mensaje": "Me llegó este mensaje sospechoso"})
    assert r.status_code == 201
    columnas = {c.name for c in Reporte.__table__.columns}
    assert columnas == {"id", "mensaje", "creado_en"}
    assert cliente_nuevo().post("/api/reportes", json={"mensaje": "corto"}).status_code == 422


def test_restricciones_de_la_base():
    with abrir_sesion() as bd:
        bd.add(Usuario(nombre="X", correo="MAYUSCULAS@ejemplo.com", contrasena_hash="x"))
        with pytest.raises(IntegrityError):
            bd.commit()


def test_borrar_usuario_borra_en_cascada():
    cliente = registrar()
    analizar(cliente)
    with abrir_sesion() as bd:
        bd.execute(text("DELETE FROM usuarios"))
        bd.commit()
        assert bd.scalar(select(Analisis)) is None
        assert bd.scalar(select(Senal)) is None
        assert bd.scalar(select(Sesion)) is None
