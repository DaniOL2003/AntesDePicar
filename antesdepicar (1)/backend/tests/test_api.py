"""Pruebas de la API con Ollama simulado. Ejecutar desde backend: python -m pytest"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import services.ai_service as ai  # noqa: E402
from main import app  # noqa: E402

cliente = TestClient(app)

MENSAJE = "Estimado cliente, su cuenta BBVA fue BLOQUEADA. Ingrese HOY a http://bbva-mx-seguro.xyz y confirme su NIP."


def simular_ollama(monkeypatch, contenido):
    async def falso(mensaje, canal):
        return json.loads(contenido) if isinstance(contenido, str) else contenido

    monkeypatch.setattr(ai, "_llamar_ollama", falso)


def test_analisis_valido_y_evidencias(monkeypatch):
    simular_ollama(monkeypatch, {
        "nivel_riesgo": "alto",
        "tipo_posible": "Suplantación bancaria (phishing)",
        "resumen": "Parece un intento de robar datos bancarios.",
        "senales": [
            {"titulo": "Enlace sospechoso", "explicacion": "No es dominio oficial.", "evidencia": "http://bbva-mx-seguro.xyz"},
            {"titulo": "Pide NIP", "explicacion": "Los bancos no piden NIP.", "evidencia": "confirme   su nip"},
            {"titulo": "Inventada", "explicacion": "x", "evidencia": "gane un iPhone"},
        ],
        "recomendaciones": ["No abras el enlace."],
    })
    r = cliente.post("/api/analizar", json={"mensaje": MENSAJE, "canal": "sms"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["nivel_riesgo"] == "alto"
    s = d["senales"]
    assert s[0]["verificada"] and MENSAJE[s[0]["inicio"]:s[0]["fin"]] == "http://bbva-mx-seguro.xyz"
    assert s[1]["verificada"] and s[1]["evidencia"] == "confirme su NIP"
    assert s[2]["verificada"] is False and s[2]["inicio"] is None


def test_mensaje_corto():
    r = cliente.post("/api/analizar", json={"mensaje": "hola", "canal": "sms"})
    assert r.status_code == 422
    assert "al menos" in r.json()["error"]


def test_canal_invalido():
    r = cliente.post("/api/analizar", json={"mensaje": MENSAJE, "canal": "fax"})
    assert r.status_code == 422
    assert "Canal" in r.json()["error"]


def test_ollama_apagado(monkeypatch):
    monkeypatch.setattr(ai, "OLLAMA_URL", "http://127.0.0.1:1")
    r = cliente.post("/api/analizar", json={"mensaje": MENSAJE, "canal": "sms"})
    assert r.status_code == 503
    assert "Ollama" in r.json()["error"]


def test_json_invalido(monkeypatch):
    async def falso(mensaje, canal):
        raise json.JSONDecodeError("x", "", 0)

    monkeypatch.setattr(ai, "_llamar_ollama", falso)
    r = cliente.post("/api/analizar", json={"mensaje": MENSAJE, "canal": "sms"})
    assert r.status_code == 502
