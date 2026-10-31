# 🛡️ AntesDePicar — Protección inteligente contra estafas digitales

> **Antes de hacer clic, piensa y verifica.**

AntesDePicar es una aplicación web **open source** que usa **inteligencia artificial de pesos abiertos (Qwen 2.5, ejecutado localmente con Ollama)** para ayudar a las personas a identificar posibles estafas en mensajes de WhatsApp, SMS, correos electrónicos y ofertas de empleo.

No solo dice si un mensaje parece fraudulento: **resalta las frases sospechosas dentro del mensaje, explica por qué lo son y recomienda cómo verificar de forma segura**, antes de hacer clic, compartir datos o pagar.

Proyecto creado para el **Hacktoberfest Hack Day Oaxaca x Oaxacoders 2026** — categoría *Best Open-Source AI Project*.

---

## ¿Por qué IA de pesos abiertos?

- **Privacidad:** el mensaje se analiza en nuestro propio servidor con Ollama; no se envía a APIs de terceros.
- **Transparencia:** cualquiera puede revisar el modelo, el prompt y el código.
- **Bajo costo:** funciona con un modelo pequeño (`qwen2.5:3b`) en una laptop normal.

El modelo **Qwen 2.5** es el núcleo del proyecto: lee el mensaje, detecta señales de riesgo, cita la evidencia textual y genera recomendaciones. Además, el backend **verifica que cada frase citada por la IA exista realmente en el mensaje**, para no mostrar evidencias inventadas.

## Funcionalidades

| Sección | Qué hace |
|---|---|
| **Inicio de sesión** | Registro, inicio de sesión o acceso como invitado. |
| **Analizador de mensajes** | Pega un mensaje, elige el canal y la IA devuelve nivel de riesgo, frases sospechosas resaltadas, explicación de cada señal y recomendaciones. |
| **Feed de alertas comunitarias** | Modalidades de fraude comunes en México con sus señales y consejos; permite reportar mensajes. |
| **Centro de verificación oficial** | Directorio de dominios y teléfonos oficiales (CONDUSEF, PROFECO, Banxico, bancos, paqueterías) y un verificador que detecta enlaces que imitan a una institución. |
| **Historial y privacidad** | Historial de análisis guardado solo en el navegador, con búsqueda, filtros, exportación y borrado. |

## Tecnologías

- **Frontend:** React 18, Vite, react-icons
- **Backend:** Python, FastAPI, Pydantic, httpx
- **IA:** Qwen 2.5 (modelo de pesos abiertos) ejecutado con Ollama

## Arquitectura

```
Navegador (React + Vite)  ──POST /api/analizar──▶  FastAPI  ──▶  Ollama  ──▶  Qwen 2.5
       :5173                                         :8000         :11434
```

```
antesdepicar/
├── README.md
├── GUIA-EQUIPO.md              # Instalación paso a paso para principiantes
├── LICENSE
├── .gitignore
├── backend/
│   ├── main.py                 # API: rutas, CORS y manejo de errores
│   ├── schemas.py              # Validación de entrada y salida
│   ├── prompts.py              # Instrucciones para Qwen y esquema JSON
│   ├── services/ai_service.py  # Conexión con Ollama + verificación de evidencias
│   ├── tests/test_api.py       # Pruebas automáticas
│   ├── requirements.txt
│   └── COMO-EJECUTAR.md        # Guía paso a paso del backend (Windows)
└── frontend/
    ├── src/
    │   ├── pages/              # Login, Analizador, Feed, Verificacion, Historial
    │   ├── components/         # Navbar, Footer, AnalysisResult, RiskSignal
    │   ├── services/           # api.js, auth.js, historial.js
    │   ├── data/               # Ejemplos, alertas e instituciones
    │   └── styles/global.css
    ├── package.json
    └── COMO-EJECUTAR.md        # Guía paso a paso del frontend (Windows)
```

## Cómo ejecutarlo

Requisitos: **Node.js 18+**, **Python 3.10+** y **Ollama**.

> 📘 **¿Primera vez o no tienes nada instalado?** Sigue la guía paso a paso: **[GUIA-EQUIPO.md](GUIA-EQUIPO.md)**.

### 1. Descargar el modelo de IA

```bash
ollama pull qwen2.5:3b
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Comprueba en http://localhost:8000/api/salud · Documentación de la API en http://localhost:8000/docs

### 3. Frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

## API

**`POST /api/analizar`**

```json
{ "mensaje": "BBVA: confirma tu NIP en http://bbva-mx-aclaraciones.xyz", "canal": "sms" }
```

Canales válidos: `whatsapp`, `sms`, `correo`, `empleo`, `otro`. El mensaje debe tener entre 10 y 5000 caracteres.

Respuesta (resumida):

```json
{
  "nivel_riesgo": "alto",
  "tipo_posible": "Suplantación bancaria (phishing)",
  "resumen": "El mensaje parece imitar a un banco para robar tu NIP.",
  "senales": [
    {
      "titulo": "Pide tu NIP",
      "explicacion": "Ningún banco pide tu NIP por mensaje.",
      "evidencia": "confirma tu NIP",
      "verificada": true,
      "inicio": 6,
      "fin": 21
    }
  ],
  "recomendaciones": ["No abras el enlace.", "Llama al número al reverso de tu tarjeta."],
  "modelo": "qwen2.5:3b"
}
```

Errores: `422` mensaje o canal inválido · `503` Ollama apagado o modelo no descargado · `504` tiempo agotado · `502` respuesta inválida del modelo.

**`GET /api/salud`** — indica si la API, Ollama y el modelo están disponibles.

## Estado del prototipo

- El análisis de mensajes usa IA real (Qwen 2.5 vía Ollama).
- El inicio de sesión y el historial se guardan por ahora solo en el navegador (localStorage).
- Las alertas del Feed y sus cifras son datos de demostración.

## Equipo

| Integrante | Rol |
|---|---|
| Fredy | Backend de IA: prompt, conexión con Qwen y verificación de evidencias |
| Eduardo | Backend API e integración |
| Daniela | Frontend principal y GitHub |
| Kelly | Frontend de resultados, alertas y demo |

## Aviso

AntesDePicar ofrece un análisis **orientativo**. La IA puede equivocarse: verifica siempre por canales oficiales. Si fuiste víctima de fraude, contacta a tu banco y a la CONDUSEF.

## Licencia

Distribuido bajo la licencia [MIT](LICENSE).
