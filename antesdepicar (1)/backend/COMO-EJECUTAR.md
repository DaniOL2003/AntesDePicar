# Cómo ejecutar el backend de AntesDePicar en Windows (desde cero)

El backend tiene 2 partes:
- **Ollama + Qwen**: el modelo de IA de pesos abiertos que analiza los mensajes.
- **API en Python (FastAPI)**: recibe el mensaje del frontend, se lo pasa a Qwen y devuelve el resultado.

Al final tendrás **3 terminales abiertas** al mismo tiempo: Ollama (corre solo), backend y frontend.

---

## Paso 1. Instalar Python (una sola vez)

1. Entra a https://www.python.org/downloads/ y da clic en el botón amarillo **Download Python**.
2. Abre el instalador.
3. ⚠️ **MUY IMPORTANTE:** abajo, marca la casilla **"Add python.exe to PATH"** antes de continuar.
4. Da clic en **Install Now** y espera a que termine.
5. **Cierra VS Code por completo** y vuelve a abrirlo.

## Paso 2. Instalar Ollama y descargar Qwen (una sola vez)

1. Entra a https://ollama.com/download y descarga la versión para **Windows**.
2. Instálalo con "Install". Ollama se queda corriendo solo (aparece una llamita en la barra junto al reloj).
3. Abre una terminal (en VS Code: **Terminal → Nueva terminal**, tipo **Command Prompt**) y escribe:

```
ollama pull qwen2.5:3b
```

Descarga unos 2 GB. Espera a que diga `success`.

4. Pruébalo (opcional):

```
ollama run qwen2.5:3b "Hola, responde en una frase"
```

Si contesta, la IA funciona. Escribe `/bye` si se queda esperando.

> Si tu computadora tiene 16 GB de RAM o más, puedes usar `qwen2.5:7b` (más preciso, ~5 GB). Ver el final de esta guía.

## Paso 3. Abrir el backend en VS Code

1. Descomprime el zip del backend (clic derecho → *Extraer todo*).
2. En VS Code: **Archivo → Abrir carpeta…** y elige la carpeta donde están `main.py` y `requirements.txt`.
3. Abre **Terminal → Nueva terminal** y asegúrate de que sea **Command Prompt** (flechita `˅` junto al `+`).

## Paso 4. Preparar Python (una sola vez)

Escribe estos comandos uno por uno, presionando Enter después de cada uno:

```
python --version
```

Debe salir algo como `Python 3.13.x`. Si dice "no se reconoce", repite el Paso 1 marcando la casilla de PATH.

```
python -m venv venv
venv\Scripts\activate
```

Ahora tu terminal empieza con `(venv)`. Eso es correcto.

```
pip install -r requirements.txt
```

Tarda 1–2 minutos.

## Paso 5. Encender el backend

```
uvicorn main:app --reload --port 8000
```

Debe aparecer `Uvicorn running on http://127.0.0.1:8000`. **Deja esta terminal abierta.**

Compruébalo abriendo en tu navegador: http://localhost:8000/api/salud

Debe decir algo como:

```
{"api":true,"ollama":true,"modelo":"qwen2.5:3b","modelo_disponible":true}
```

- `"ollama": false` → abre la app de Ollama desde el menú Inicio.
- `"modelo_disponible": false` → falta el Paso 2 (`ollama pull qwen2.5:3b`).

También puedes probar la API en http://localhost:8000/docs → `POST /api/analizar` → *Try it out*.

## Paso 6. Conectar con el frontend

En **otra** ventana de VS Code (o en otra terminal), con la carpeta `frontend`:

```
npm run dev
```

Abre http://localhost:5173, pega un mensaje y da clic en **Analizar**. El primer análisis puede tardar 20–40 segundos (Qwen se está cargando); los siguientes son más rápidos.

---

## Las siguientes veces (ya instalado todo)

Terminal del backend:

```
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Terminal del frontend:

```
npm run dev
```

## Problemas comunes

| Mensaje | Solución |
|---|---|
| `'python' no se reconoce` | Reinstala Python marcando **Add python.exe to PATH** y reinicia VS Code. |
| `'uvicorn' no se reconoce` | Te faltó `venv\Scripts\activate` (la terminal debe empezar con `(venv)`). |
| `No module named ...` | Activa el venv y vuelve a correr `pip install -r requirements.txt`. |
| En la página: "No se pudo conectar con Ollama" | Abre la app de Ollama desde el menú Inicio. |
| En la página: "El modelo ... no está descargado" | `ollama pull qwen2.5:3b` |
| En la página: "tardó demasiado" | Vuelve a intentar; la primera vez Qwen tarda en cargar. |
| `address already in use` / puerto 8000 ocupado | Ya hay un backend abierto en otra terminal. Ciérralo con Ctrl + C. |

## Cambiar a un modelo más preciso (opcional)

1. `ollama pull qwen2.5:7b`
2. En la carpeta del backend, copia `.env.example` y renombra la copia a `.env`.
3. En `.env` cambia la línea a `OLLAMA_MODEL=qwen2.5:7b`.
4. Apaga el backend (Ctrl + C) y vuelve a encenderlo.

## ¿Quién edita qué?

| Persona | Archivos |
|---|---|
| Fredy (IA) | `prompts.py` (instrucciones para Qwen), `services/ai_service.py` |
| Eduardo (API) | `main.py`, `schemas.py`, `requirements.txt` |

Para mejorar la detección, lo más útil es ajustar el prompt en `prompts.py` y probar con los ejemplos del frontend.
