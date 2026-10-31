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
| **Inicio de sesión** | Registro e inicio de sesión reales con PostgreSQL, o acceso como invitado sin cuenta. |
| **Analizador de mensajes** | Pega un mensaje, elige el canal y la IA devuelve nivel de riesgo, frases sospechosas resaltadas, explicación de cada señal y recomendaciones. |
| **Feed de alertas comunitarias** | Modalidades de fraude comunes en México con sus señales y consejos; permite enviar reportes anónimos, que se guardan en la base de datos. |
| **Centro de verificación oficial** | Directorio de dominios y teléfonos oficiales (CONDUSEF, PROFECO, Banxico, bancos, paqueterías) y un verificador que detecta enlaces que imitan a una institución. |
| **Historial y privacidad** | Historial privado de cada cuenta en PostgreSQL, con búsqueda, filtros, exportación y borrado. Como invitado se guarda solo en la pestaña. |

## Tecnologías

- **Frontend:** React 18, Vite, react-icons
- **Backend:** Python, FastAPI, Pydantic, httpx
- **Base de datos:** PostgreSQL, SQLAlchemy, psycopg, Alembic (migraciones), Argon2id (contraseñas)
- **IA:** Qwen 2.5 (modelo de pesos abiertos) ejecutado con Ollama

## Arquitectura

```
Navegador (React + Vite)  ──POST /api/analizar──▶  FastAPI  ──▶  Ollama  ──▶  Qwen 2.5
       :5173                                         :8000         :11434
                                                        │
                                                        └──▶  PostgreSQL :5432
```

```
antesdepicar/
├── README.md
├── GUIA-EQUIPO.md              # Instalación paso a paso para principiantes
├── LICENSE
├── .gitignore
├── backend/
│   ├── main.py                 # API: analizador, CORS y manejo de errores
│   ├── database.py, models.py  # Conexión con PostgreSQL y tablas
│   ├── dependencias.py         # Identificación del usuario por su cookie
│   ├── routers/                # Autenticación, historial y reportes
│   ├── migrations/             # Migraciones de Alembic
│   ├── scripts/preparar_bd.py  # Crea el usuario y las bases de datos
│   ├── .env.example            # Plantilla de configuración
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

Requisitos: **Node.js 18+**, **Python 3.10+**, **PostgreSQL 13+** y **Ollama**.

> 📘 **¿Primera vez o no tienes nada instalado?** Sigue la guía paso a paso: **[GUIA-EQUIPO.md](GUIA-EQUIPO.md)**.

### 1. Descargar el modelo de IA

```bash
ollama pull qwen2.5:3b
```

### 2. Backend

```bash
cd "antesdepicar (1)/backend"
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux
pip install -r requirements.txt
python scripts/preparar_bd.py   # solo la primera vez
alembic upgrade head
uvicorn main:app --reload --port 8000
```

Comprueba en http://localhost:8000/api/salud · Documentación de la API en http://localhost:8000/docs

### 3. Frontend (en otra terminal)

```bash
cd "antesdepicar (1)/frontend"
npm install
npm run dev
```

Abre http://localhost:5173

## Base de datos (PostgreSQL)

Requiere PostgreSQL 13 o superior. Desde `backend`, con el entorno virtual activado:

```bash
python scripts/preparar_bd.py   # pide la contraseña del usuario postgres de tu instalación
alembic upgrade head            # crea las tablas
```

`preparar_bd.py` crea el usuario `antesdepicar`, las bases `antesdepicar` y `antesdepicar_test`, y genera `backend/.env` con una contraseña aleatoria. Se puede repetir sin riesgo y no borra datos. Para hacerlo a mano, copia `backend/.env.example` como `backend/.env` y escribe tus credenciales.

| Tabla | Contenido |
|---|---|
| `usuarios` | Nombre, correo y hash Argon2id de la contraseña |
| `sesiones` | Hash del token de sesión y su vencimiento |
| `analisis` | Mensaje, canal, nivel de riesgo, resultado de la IA y fecha, por usuario |
| `senales` | Señales de cada análisis, con su evidencia y posición |
| `reportes` | Reportes comunitarios anónimos (sin relación con usuarios) |

Si cambias `backend/models.py`, crea una migración y revísala:

```bash
alembic revision --autogenerate -m "describe el cambio"
alembic upgrade head
```

Pruebas (usan solo la base `antesdepicar_test`, cuyas tablas se vacían):

```bash
python -m pytest
```

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

**`GET /api/salud`** — indica si la API, la base de datos, Ollama y el modelo están disponibles.

Con sesión iniciada, `POST /api/analizar` guarda el análisis y devuelve `guardado: true`. Un invitado puede analizar, pero no se guarda nada en la base de datos.

| Ruta | Sesión | Función |
|---|---|---|
| `POST /api/auth/registro` | No | Crea una cuenta e inicia sesión |
| `POST /api/auth/login` | No | Inicia sesión |
| `POST /api/auth/logout` | No | Revoca la sesión actual |
| `GET /api/auth/sesion` | Sí | Devuelve el usuario actual |
| `GET /api/historial` | Sí | Lista tus análisis (`limite`, `desplazamiento`) |
| `DELETE /api/historial/{id}` | Sí | Elimina uno de tus análisis |
| `DELETE /api/historial` | Sí | Elimina todo tu historial |
| `POST /api/reportes` | No | Guarda un reporte anónimo |

La sesión viaja en una cookie `HttpOnly` y `SameSite=Lax`. En producción, sirve el sitio por HTTPS y usa `COOKIE_SECURE=true`.

## Estado del prototipo

- El análisis de mensajes usa IA real (Qwen 2.5 vía Ollama).
- Usuarios, sesiones, historial y reportes se guardan en PostgreSQL.
- La recuperación de contraseña y el acceso con Google o SSO todavía no están implementados.
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
