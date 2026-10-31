#  AntesDePicar — Smart protection against digital scams

> **Think before you click. Verify before you trust.**

AntesDePicar ("before you take the bait") is an **open-source** web app that uses **open-weight AI (Qwen 2.5, running locally with Ollama)** to help people spot possible scams in WhatsApp messages, SMS, emails and job offers.

It doesn't just say whether a message looks fraudulent: it **highlights the suspicious phrases inside the message, explains why they are risky, and recommends how to verify safely** before clicking, sharing personal data or paying.

Built for **Hacktoberfest Hack Day Oaxaca x Oaxacoders 2026** — *Best Open-Source AI Project* category.

---

## Why open-weight AI?

- **Privacy:** messages are analyzed on our own server with Ollama; nothing is sent to third-party APIs.
- **Transparency:** anyone can inspect the model, the prompt and the code.
- **Low cost:** runs with a small model (`qwen2.5:3b`) on a regular laptop.

**Qwen 2.5** is the core of the project: it reads the message, detects risk signals, quotes the exact evidence and generates recommendations. The backend also **verifies that every phrase quoted by the AI actually exists in the original message**, so made-up evidence is never shown as fact.

## Features

| Section | What it does |
|---|---|
| **User accounts** | Sign up and log in with accounts stored in a database (passwords hashed with PBKDF2), or continue as a guest. |
| **Message analyzer** | Paste a message, pick the channel, and the AI returns a risk level, highlighted suspicious phrases, an explanation of each signal and recommendations. |
| **Community alerts feed** | Common scam patterns in Mexico with their warning signs and tips; users can report suspicious messages. |
| **Official verification center** | Directory of official domains and phone numbers (CONDUSEF, PROFECO, Banxico, banks, couriers) plus a link checker that detects look-alike domains. |
| **History & privacy** | With an account, history is stored in the database; as a guest, only in the browser. Search, filters, export and delete. |

> The app interface is in Spanish, since it is designed for users in Mexico.

## Tech stack

- **Frontend:** React 18, Vite, react-icons
- **Backend:** Python, FastAPI, Pydantic, httpx
- **Database:** SQLite (built into Python, no extra installation)
- **AI:** Qwen 2.5 (open-weight model) running on Ollama

## Architecture

```
Browser (React + Vite)  ──POST /api/analizar──▶  FastAPI  ──▶  Ollama  ──▶  Qwen 2.5
       :5173                                       :8000         :11434
```

```
antesdepicar/
├── README.md
├── GUIA-EQUIPO.md              # Step-by-step setup guide for beginners (Spanish)
├── LICENSE
├── .gitignore
├── backend/
│   ├── main.py                 # API: routes, CORS and error handling
│   ├── schemas.py              # Input and output validation
│   ├── database.py             # SQLite database: users, sessions, history, reports
│   ├── prompts.py              # Instructions for Qwen and JSON schema
│   ├── services/ai_service.py  # Ollama connection + evidence verification
│   ├── tests/test_api.py       # Automated tests
│   ├── requirements.txt
│   └── COMO-EJECUTAR.md        # Backend setup guide (Windows, Spanish)
└── frontend/
    ├── public/                 # Logo and icon
    ├── src/
    │   ├── pages/              # Login, Analyzer, Feed, Verification, History
    │   ├── components/         # Navbar, Footer, AnalysisResult, RiskSignal
    │   ├── services/           # api.js, auth.js, historial.js
    │   ├── data/               # Examples, alerts and institutions
    │   └── styles/global.css
    ├── package.json
    └── COMO-EJECUTAR.md        # Frontend setup guide (Windows, Spanish)
```

## How to run it

Requirements: **Node.js 18+**, **Python 3.10+** and **Ollama**.

### 1. Download the AI model

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

Health check at http://localhost:8000/api/salud · API docs at http://localhost:8000/docs

### 3. Frontend (in another terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API

**`POST /api/analizar`**

```json
{ "mensaje": "BBVA: confirma tu NIP en http://bbva-mx-aclaraciones.xyz", "canal": "sms" }
```

Valid channels: `whatsapp`, `sms`, `correo` (email), `empleo` (job offer), `otro` (other). The message must be between 10 and 5000 characters.

Response (shortened):

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

Errors: `422` invalid message or channel · `503` Ollama is off or the model is not downloaded · `504` timeout · `502` invalid model response.

**`GET /api/salud`** — reports whether the API, Ollama and the model are available.

**Accounts and data (SQLite):**

| Route | What it does |
|---|---|
| `POST /api/registro` | Creates an account and returns a session token |
| `POST /api/login` | Logs in and returns a token |
| `POST /api/logout` | Ends the session |
| `GET /api/historial` | User history (requires `Authorization: Bearer <token>`) |
| `DELETE /api/historial` | Deletes the user's history |
| `POST /api/reportes` | Saves a community report |
| `GET /api/estadisticas` | Totals for analyses, high-risk results, reports and users |

If `POST /api/analizar` receives a token, the analysis is saved to that user's history.

## Prototype status

- Message analysis uses real AI (Qwen 2.5 via Ollama).
- Accounts, history and community reports are stored in a SQLite database (`backend/antesdepicar.db`, created automatically).
- The alerts in the Feed and their numbers are demo data.

## Team

| Member | Role |
|---|---|
| Fredy | AI backend: prompt, Qwen integration and evidence verification |
| Eduardo | Backend API and integration |
| Daniela | Main frontend and GitHub |
| Kelly | Results UI, alerts and demo |

## Disclaimer

AntesDePicar provides **guidance only**. The AI can make mistakes: always verify through official channels. If you have been a victim of fraud, contact your bank and CONDUSEF (Mexico's financial consumer protection agency).

## License

Distributed under the [MIT](LICENSE) license.
