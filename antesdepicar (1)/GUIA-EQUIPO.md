# 📘 Guía del equipo — AntesDePicar desde cero (Windows)

Esta guía es para quien **no tiene nada instalado**. Síguela en orden y no te saltes pasos.

⏱️ Tiempo aproximado: 30–40 minutos (la mayor parte es esperar descargas).

**Índice**

- Parte A — Instalar programas (una sola vez)
- Parte B — Descargar el proyecto desde GitHub (una sola vez)
- Parte C — Preparar el backend (una sola vez)
- Parte D — Preparar el frontend (una sola vez)
- Parte E — Encender la app (cada vez que la uses)
- Parte F — Subir tus cambios a GitHub
- Parte G — Problemas comunes

---

## Parte A — Instalar programas (una sola vez)

Instala estos 6 programas. Después de instalarlos todos, **reinicia la computadora**.

### A1. Visual Studio Code (el editor)

1. Entra a **https://code.visualstudio.com**
2. Da clic en el botón azul **Download for Windows**.
3. Abre el instalador → acepta → **Siguiente** en todo.
4. En la pantalla de "Tareas adicionales" marca **"Agregar a PATH"** (normalmente ya viene marcada).

### A2. Node.js (para el frontend)

1. Entra a **https://nodejs.org**
2. Descarga la versión que dice **LTS**.
3. Abre el instalador → **Next** en todo, sin cambiar nada → **Install**.

### A3. Python (para el backend)

1. Entra a **https://www.python.org/downloads/**
2. Da clic en el botón amarillo **Download Python 3.x.x**.
3. Abre el instalador.
4. ⚠️ **MUY IMPORTANTE:** en la primera pantalla, abajo, marca la casilla
   **☑ Add python.exe to PATH**. Si no la marcas, nada del backend funcionará.
5. Da clic en **Install Now**.

### A4. Ollama (corre la inteligencia artificial)

1. Entra a **https://ollama.com/download**
2. Elige **Windows** → **Download for Windows**.
3. Abre `OllamaSetup.exe` → **Install**.
4. Al terminar aparece una **llamita** junto al reloj (abajo a la derecha). Eso significa que Ollama está encendido.

### A5. GitHub Desktop (para bajar y subir el proyecto)

1. Entra a **https://desktop.github.com**
2. Da clic en **Download for Windows** e instálalo.
3. Al abrirse, da clic en **Sign in to GitHub.com** e inicia sesión con tu cuenta de GitHub
   (si no tienes cuenta, créala gratis en https://github.com/signup).
4. En "Configure Git" deja tu nombre y correo → **Finish**.

### A6. PostgreSQL (la base de datos)

1. Entra a **https://www.postgresql.org/download/windows/** y descarga el instalador.
2. Instálalo con las opciones normales. **Anota la contraseña del usuario `postgres`** y deja el puerto **5432**.

### ✅ Reinicia la computadora

Esto hace que Windows reconozca todos los programas nuevos.

---

## Parte B — Descargar el proyecto desde GitHub (una sola vez)

1. Abre **GitHub Desktop**.
2. Arriba a la izquierda: **File → Clone repository…**
3. Elige la pestaña **URL**.
4. En el primer cuadro pega el enlace del repositorio que te compartió el equipo, por ejemplo:
   `https://github.com/USUARIO/antesdepicar`
5. En **Local path** deja la ruta que aparece (normalmente `C:\Users\TU_USUARIO\Documents\GitHub\antesdepicar`).
   📝 **Anota esa ruta**, la usarás después.
6. Da clic en **Clone** y espera.
7. Cuando termine, da clic en el botón **Open in Visual Studio Code**
   (o en el menú **Repository → Open in Visual Studio Code**).

En VS Code, a la izquierda, debes ver la carpeta `antesdepicar (1)`; dentro están `backend` y `frontend`.

---

## Parte C — Preparar el backend (una sola vez)

### C1. Descargar el modelo de IA Qwen

1. En VS Code, arriba: **Terminal → New Terminal** (Terminal → Nueva terminal).
   Se abre un panel abajo.
2. ⚠️ Cambia el tipo de terminal a **Command Prompt**: en el panel de la terminal, a la derecha,
   junto al botón **+**, da clic en la flechita **˅** y elige **Command Prompt**.
   (Así evitas el error "la ejecución de scripts está deshabilitada").
3. Escribe y presiona Enter:

```
ollama pull qwen2.5:3b
```

Descarga unos 2 GB. Espera a que diga **success**. Mientras tanto puedes seguir con C2 en otra terminal (botón **+**, tipo Command Prompt).

### C2. Instalar las librerías de Python

En una terminal **Command Prompt** escribe estos comandos **uno por uno**, presionando Enter después de cada uno:

```
cd "antesdepicar (1)\backend"
```

```
python --version
```

Debe salir algo como `Python 3.13.x`. Si dice "no se reconoce", vuelve al paso A3 y marca la casilla de PATH.

```
python -m venv venv
```

(Crea un espacio aislado para las librerías. Tarda unos segundos y no muestra nada; es normal.)

```
venv\Scripts\activate
```

Ahora la línea de la terminal empieza con **(venv)**. Eso es correcto.

```
pip install -r requirements.txt
```

Espera a que diga **Successfully installed …**

### C3. Crear la base de datos

Con `(venv)` activado y dentro de `backend`:

```
python scripts/preparar_bd.py
```

Escribe la contraseña de `postgres` cuando la pida (no se ve al escribir). El script crea las bases y el archivo `.env`, que **nunca** se sube a GitHub. Después crea las tablas:

```
alembic upgrade head
```

Repite `alembic upgrade head` cuando alguien del equipo agregue una migración.

---

## Parte D — Preparar el frontend (una sola vez)

1. Abre **otra** terminal: botón **+** del panel de terminal (tipo **Command Prompt**).
2. Escribe uno por uno:

```
cd "antesdepicar (1)\frontend"
```

```
npm install
```

Espera 1–2 minutos hasta que vuelva a aparecer la línea para escribir.

---

## Parte E — Encender la app (cada vez que la uses)

Necesitas **2 terminales abiertas al mismo tiempo**. Ninguna se debe cerrar mientras usas la app.

Primero, revisa que la **llamita de Ollama** esté junto al reloj. Si no está, abre **Ollama** desde el menú Inicio.

### Terminal 1 — Backend

```
cd "antesdepicar (1)\backend"
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Debe aparecer `Uvicorn running on http://127.0.0.1:8000`.

### Terminal 2 — Frontend

```
cd "antesdepicar (1)\frontend"
npm run dev
```

Aparece `http://localhost:5173`. Mantén presionada **Ctrl** y da clic en el enlace.

> 💡 Si la terminal ya está dentro de `backend` o `frontend` (la ruta lo dice antes del `>`), **no** vuelvas a escribir `cd …`. Para regresar a la carpeta principal escribe `cd ..`

### Comprobar que todo funciona

1. En el navegador abre **http://localhost:8000/api/salud**. Debe decir:
   `"base_datos":true`, `"ollama":true` y `"modelo_disponible":true`
2. En **http://localhost:5173** entra como invitado.
3. Da clic en el ejemplo **SMS del "banco"** → **Analizar**.
4. La primera vez tarda 20–40 segundos. Luego verás el resultado con las frases resaltadas.

### Apagar la app

En cada terminal presiona **Ctrl + C**.

---

## Parte F — Subir tus cambios a GitHub

Cada quien edita **solo sus archivos** (ver la tabla al final) para no chocar.

### Antes de empezar a trabajar: bajar lo último

1. Abre **GitHub Desktop**.
2. Da clic en **Fetch origin** (arriba). Si cambia a **Pull origin**, dale clic.

### Cuando termines un cambio: subirlo

1. Guarda tus archivos en VS Code (**Ctrl + S**).
2. Abre **GitHub Desktop**. A la izquierda verás los archivos que cambiaste.
3. Abajo a la izquierda, en **Summary**, describe el cambio. Por ejemplo: `Mejoro el prompt de estafas bancarias`.
4. Da clic en **Commit to main**.
5. Arriba da clic en **Push origin**.

> ⚠️ Si GitHub Desktop dice que hay cambios nuevos en GitHub, primero da **Pull origin** y después **Push origin**.

### Quién edita qué

| Persona | Archivos |
|---|---|
| **Fredy** (IA) | `backend/prompts.py`, `backend/services/ai_service.py` |
| **Eduardo** (API) | `backend/main.py`, `backend/schemas.py`, `backend/requirements.txt` |
| **Daniela** (frontend y GitHub) | `frontend/src/App.jsx`, `frontend/src/pages/Login.*`, `Analizador.*`, `Historial.*`, `frontend/src/components/Navbar.*`, `frontend/src/services/` |
| **Kelly** (resultados y demo) | `frontend/src/components/AnalysisResult.*`, `RiskSignal.jsx`, `frontend/src/pages/Feed.*`, `Verificacion.*`, `frontend/src/data/` |

---

## Parte G — Problemas comunes

| Lo que aparece | Qué hacer |
|---|---|
| `"python" no se reconoce…` | Reinstala Python marcando **Add python.exe to PATH**, reinicia la computadora. |
| `"ollama" no se reconoce…` | Instala Ollama (A4) y reinicia VS Code por completo. |
| `"npm" no se reconoce…` | Instala Node.js (A2) y reinicia la computadora. |
| `la ejecución de scripts está deshabilitada` | Cambia la terminal a **Command Prompt** (flechita ˅ junto al +). |
| `"base_datos":false` o *La base de datos no está disponible* | Revisa que el servicio de PostgreSQL esté encendido, que exista `backend/.env` y ejecuta `alembic upgrade head`. |
| `Could not read package.json` | No estás en `frontend`. Escribe `cd "antesdepicar (1)\frontend"`. |
| `No such file … requirements.txt` | No estás en `backend`. Escribe `cd "antesdepicar (1)\backend"`. |
| `"uvicorn" no se reconoce…` | Te faltó `venv\Scripts\activate` (la línea debe empezar con `(venv)`). |
| `Microsoft Visual C++ 14.0 or greater is required` | Revisa que `backend/requirements.txt` diga `uvicorn>=0.29` (sin `[standard]`) y repite `pip install -r requirements.txt`. |
| En la página: *No se pudo conectar con el servidor* | La Terminal 1 (backend) no está encendida. |
| En la página: *No se pudo conectar con Ollama* | Abre la app **Ollama** desde el menú Inicio. |
| En la página: *El modelo … no está descargado* | `ollama pull qwen2.5:3b` |
| En la página: *tardó demasiado* | Intenta de nuevo; la primera vez Qwen tarda en cargar. |
| `address already in use` | Ya hay otra terminal con el backend o frontend encendido. Ciérrala con Ctrl + C. |
| `"GET / HTTP/1.1" 404 Not Found` en el backend | Es normal. El backend solo responde en direcciones que empiezan con `/api`. |
