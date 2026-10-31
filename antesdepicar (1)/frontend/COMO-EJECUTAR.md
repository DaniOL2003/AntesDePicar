# Cómo ejecutar el frontend de AntesDePicar (desde cero)

Solo necesitas **Visual Studio Code** y **Node.js**.

## 1. Instalar Node.js (una sola vez)

1. Entra a https://nodejs.org
2. Descarga la versión que dice **LTS** (el botón verde).
3. Abre el instalador y da **Siguiente** en todo, sin cambiar nada.
4. **Cierra Visual Studio Code por completo** y vuelve a abrirlo (si no, no reconocerá Node).

## 2. Abrir el proyecto

1. Descomprime el `.zip` (clic derecho → *Extraer todo*).
2. En VS Code: **Archivo → Abrir carpeta…** y elige la carpeta `frontend`.
3. Abre la terminal: **Terminal → Nueva terminal** (aparece abajo).

## 3. Comprobar que Node está instalado

Escribe en la terminal y presiona Enter:

```
node -v
```

Debe salir algo como `v22.x.x`. Si dice "no se reconoce", reinicia la computadora.

## 4. Instalar dependencias (una sola vez, tarda 1–2 minutos)

```
npm install
```

> **Si sale un error rojo que dice "la ejecución de scripts está deshabilitada"** (pasa en Windows):
> en la terminal, junto al símbolo `+` arriba a la derecha, da clic en la flechita `˅` y elige
> **Command Prompt**. Vuelve a escribir `npm install` en esa nueva terminal.

## 5. Encender la página

```
npm run dev
```

Aparecerá un enlace `http://localhost:5173`. Mantén presionada la tecla **Ctrl** y dale clic.
La terminal debe quedarse abierta mientras uses la página. Para apagarla: **Ctrl + C**.

## ¿Qué funciona ya?

- **Login y registro** (por ahora se guardan solo en el navegador), o "Continuar como invitado".
- **Las 4 secciones** con su diseño: Analizador, Feed de alertas, Centro de verificación e Historial.
- El **verificador de enlaces** del Centro de Verificación funciona sin backend.
- El **Analizador** necesita el backend. Mientras no esté conectado, te mostrará un aviso y el botón
  **"Ver un resultado de ejemplo"** para ver cómo se verán los resultados.

## ¿Quién edita qué?

| Persona | Archivos |
|---|---|
| Daniela | `src/App.jsx`, `src/pages/Login.*`, `src/pages/Analizador.*`, `src/pages/Historial.*`, `src/components/Navbar.*`, `src/services/` |
| Kelly | `src/components/AnalysisResult.*`, `src/components/RiskSignal.jsx`, `src/pages/Feed.*`, `src/pages/Verificacion.*`, `src/data/` |

Colores y estilos compartidos: `src/styles/global.css`.

> Antes de presentar, confirmen en los sitios oficiales los teléfonos de `src/data/instituciones.js`.
