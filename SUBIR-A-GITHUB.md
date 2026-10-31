# 🚀 Subir AntesDePicar a GitHub por primera vez

Esto lo hace **una sola persona** (quien administra el repositorio). Los demás siguen después `GUIA-EQUIPO.md`.

Necesitas tener **GitHub Desktop** instalado y con tu sesión iniciada (ver `GUIA-EQUIPO.md`, paso A5).

---

## Paso 1. Descomprimir el proyecto

1. Busca `antesdepicar.zip` en tu carpeta **Descargas**.
2. Clic derecho → **Extraer todo…**
3. En el cuadro de la ruta, cambia el final para que quede así:
   `C:\Users\TU_USUARIO\Documents\antesdepicar`
4. Da clic en **Extraer**.
5. Abre esa carpeta y confirma que **directamente adentro** se ven:
   `backend`, `frontend`, `README.md`, `GUIA-EQUIPO.md`, `LICENSE`.
   (Si en lugar de eso ves otra carpeta `antesdepicar` adentro, entra a ella: esa es la buena.)

> 💡 El archivo `.gitignore` puede no verse porque Windows oculta los archivos que empiezan con punto. Es normal. Para verlo: en el Explorador → **Ver → Mostrar → Elementos ocultos**.

## Paso 2. Agregar la carpeta en GitHub Desktop

1. Abre **GitHub Desktop**.
2. Arriba a la izquierda: **File → Add local repository…**
3. Da clic en **Choose…**, selecciona la carpeta `antesdepicar` del paso 1 → **Seleccionar carpeta**.
4. Aparece un aviso en letras pequeñas: *"This directory does not appear to be a Git repository"*.
   Da clic en el enlace azul **create a repository** dentro de ese aviso.

## Paso 3. Crear el repositorio

Llena así:

| Campo | Valor |
|---|---|
| Name | `antesdepicar` |
| Description | `Protección inteligente contra estafas digitales con IA de pesos abiertos` |
| Git ignore | **None** (ya tenemos el nuestro) |
| License | **None** (ya tenemos la nuestra) |

Da clic en **Create repository**.

## Paso 4. Revisar y guardar

1. A la izquierda verás la lista de archivos (unos 45).
   - ✅ Deben aparecer `backend/main.py`, `frontend/src/App.jsx`, `README.md`…
   - ❌ **No** deben aparecer `node_modules` ni `venv`.
2. Si la lista está vacía y el botón dice que ya hay un commit inicial, no pasa nada: ya se guardó, sigue al paso 5.
3. Si hay archivos en la lista: abajo a la izquierda, en **Summary**, escribe `Primera versión de AntesDePicar` y da clic en **Commit to main**.

## Paso 5. Publicar en GitHub

1. Arriba da clic en **Publish repository**.
2. ⚠️ **Quita la palomita de "Keep this code private"**. La categoría *Best Open-Source AI Project* necesita el código público.
3. Da clic en **Publish repository** y espera unos segundos.

## Paso 6. Comprobar y compartir

1. Menú **Repository → View on GitHub**. Se abre tu repositorio en el navegador.
2. Abajo debe verse el README con el título **🛡️ AntesDePicar**.
3. **Copia el enlace** de la barra del navegador (algo como `https://github.com/TU_USUARIO/antesdepicar`).
4. Compártelo:
   - Con tu equipo, para que sigan `GUIA-EQUIPO.md` (Parte B usa este enlace).
   - En el formulario de envío de MLH.

## Paso 7. Dar permiso a tus compañeros para subir cambios

1. En la página del repositorio en GitHub: **Settings** (arriba a la derecha) → **Collaborators** (menú izquierdo).
2. Da clic en **Add people**, escribe el usuario de GitHub de cada compañero y envía la invitación.
3. Cada compañero debe aceptar la invitación que le llega a su correo.

---

### ¿Ya existía un repositorio del equipo en GitHub?

En lugar de los pasos 2 a 5:

1. En GitHub Desktop: **File → Clone repository… → URL**, pega el enlace del repositorio existente → **Clone**.
2. Abre la carpeta clonada (**Repository → Show in Explorer**).
3. Copia **todo el contenido** de tu carpeta `antesdepicar` del paso 1 y pégalo dentro de la carpeta clonada. Si pregunta, elige **Reemplazar**.
4. Vuelve a GitHub Desktop → escribe el **Summary** → **Commit to main** → **Push origin**.
