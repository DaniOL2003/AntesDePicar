"""Servicio de IA: envía mensajes a Qwen (pesos abiertos) vía Ollama (responsable: Fredy)."""

import json
import os
import re

import httpx

from prompts import ESQUEMA_RESPUESTA, SYSTEM_PROMPT, construir_mensaje_usuario

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "120"))

NIVELES_VALIDOS = {"bajo", "medio", "alto"}


class IAError(Exception):
    """Error controlado del servicio de IA."""

    def __init__(self, mensaje: str, codigo: int = 502):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.codigo = codigo


async def _llamar_ollama(mensaje: str, canal: str) -> dict:
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "format": ESQUEMA_RESPUESTA,
        "options": {"temperature": 0.1},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": construir_mensaje_usuario(mensaje, canal)},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as cliente:
            respuesta = await cliente.post(f"{OLLAMA_URL}/api/chat", json=payload)
    except httpx.ConnectError as exc:
        raise IAError(
            "No se pudo conectar con Ollama. Verifica que esté encendido (ollama serve).", 503
        ) from exc
    except httpx.TimeoutException as exc:
        raise IAError("El modelo tardó demasiado en responder. Intenta de nuevo.", 504) from exc

    if respuesta.status_code == 404:
        raise IAError(
            f"El modelo '{OLLAMA_MODEL}' no está descargado. Ejecuta: ollama pull {OLLAMA_MODEL}", 503
        )
    if respuesta.status_code != 200:
        raise IAError(f"Ollama respondió con error {respuesta.status_code}.", 502)

    contenido = respuesta.json().get("message", {}).get("content", "")
    return json.loads(contenido)


def _ubicar_evidencia(evidencia: str, mensaje: str):
    """Busca la evidencia dentro del mensaje original (ignora mayúsculas y espacios extra).

    Devuelve (inicio, fin, texto_exacto) o None si la frase no existe en el mensaje.
    """
    evidencia = evidencia.strip().strip("\"'“”«»").strip()
    palabras = evidencia.split()
    if not palabras:
        return None
    patron = r"\s+".join(re.escape(p) for p in palabras)
    encontrado = re.search(patron, mensaje, flags=re.IGNORECASE)
    if not encontrado:
        return None
    return encontrado.start(), encontrado.end(), encontrado.group(0)


def _normalizar(datos: dict, mensaje: str) -> dict:
    """Limpia la respuesta del modelo y verifica que cada evidencia exista en el mensaje."""
    nivel = str(datos.get("nivel_riesgo", "")).lower().strip()
    if nivel not in NIVELES_VALIDOS:
        nivel = "medio"

    senales = []
    for senal in datos.get("senales") or []:
        if not isinstance(senal, dict):
            continue
        titulo = str(senal.get("titulo", "")).strip()
        explicacion = str(senal.get("explicacion", "")).strip()
        evidencia = str(senal.get("evidencia", "")).strip()
        if not titulo:
            continue
        ubicacion = _ubicar_evidencia(evidencia, mensaje) if evidencia else None
        senales.append(
            {
                "titulo": titulo,
                "explicacion": explicacion,
                "evidencia": ubicacion[2] if ubicacion else evidencia,
                "verificada": ubicacion is not None,
                "inicio": ubicacion[0] if ubicacion else None,
                "fin": ubicacion[1] if ubicacion else None,
            }
        )

    recomendaciones = [str(r).strip() for r in datos.get("recomendaciones") or [] if str(r).strip()]
    if not recomendaciones:
        recomendaciones = [
            "Si tienes dudas, verifica directamente con la empresa o persona por un canal oficial."
        ]

    return {
        "nivel_riesgo": nivel,
        "tipo_posible": str(datos.get("tipo_posible", "")).strip() or "No determinado",
        "resumen": str(datos.get("resumen", "")).strip(),
        "senales": senales,
        "recomendaciones": recomendaciones,
        "modelo": OLLAMA_MODEL,
    }


async def analizar_mensaje(mensaje: str, canal: str) -> dict:
    """Analiza un mensaje con Qwen. Reintenta una vez si el JSON llega inválido."""
    ultimo_error = None
    for _ in range(2):
        try:
            datos = await _llamar_ollama(mensaje, canal)
            if isinstance(datos, dict):
                return _normalizar(datos, mensaje)
        except (json.JSONDecodeError, ValueError) as exc:
            ultimo_error = exc
    raise IAError("La IA devolvió una respuesta inválida. Intenta de nuevo.", 502) from ultimo_error


async def estado_ollama() -> dict:
    """Revisa si Ollama está activo y si el modelo está descargado."""
    try:
        async with httpx.AsyncClient(timeout=5) as cliente:
            r = await cliente.get(f"{OLLAMA_URL}/api/tags")
        modelos = [m.get("name", "") for m in r.json().get("models", [])]
        return {"ollama": True, "modelo": OLLAMA_MODEL, "modelo_disponible": OLLAMA_MODEL in modelos}
    except Exception:
        return {"ollama": False, "modelo": OLLAMA_MODEL, "modelo_disponible": False}
