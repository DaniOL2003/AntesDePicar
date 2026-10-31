// Sesión del usuario (responsable: Daniela)
// Las cuentas se guardan en la base de datos del backend (SQLite).
// En el navegador solo guardamos el token de sesión.

const API_URL = import.meta.env.VITE_API_URL || '';
const CLAVE_SESION = 'adp_sesion';

// recordar = true  → la sesión sobrevive aunque cierres el navegador (localStorage)
// recordar = false → la sesión termina al cerrar la pestaña (sessionStorage)
function guardarSesion(sesion, recordar = true) {
  try {
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_SESION);
    (recordar ? localStorage : sessionStorage).setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // navegador sin almacenamiento: la sesión dura mientras la pestaña esté abierta
  }
  return sesion;
}

export function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION) || sessionStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}

export function obtenerToken() {
  return obtenerSesion()?.token || null;
}

async function pedir(ruta, datos) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }
  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    // sin JSON
  }
  if (!respuesta.ok) {
    if (!cuerpo) throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
    throw new Error(cuerpo.error || `Error del servidor (${respuesta.status}).`);
  }
  return cuerpo;
}

export async function registrar({ nombre, correo, contrasena }, recordar = true) {
  const datos = await pedir('/api/registro', { nombre, correo, contrasena });
  return guardarSesion({ nombre: datos.nombre, correo: datos.correo, token: datos.token }, recordar);
}

export async function iniciarSesion({ correo, contrasena }, recordar = true) {
  const datos = await pedir('/api/login', { correo, contrasena });
  return guardarSesion({ nombre: datos.nombre, correo: datos.correo, token: datos.token }, recordar);
}

export function entrarComoInvitado() {
  return guardarSesion({ nombre: 'Invitado', correo: null, invitado: true });
}

export async function cerrarSesion() {
  const token = obtenerToken();
  try {
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // sin almacenamiento
  }
  if (token) {
    try {
      await fetch(`${API_URL}/api/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // si el backend está apagado, igual cerramos la sesión en el navegador
    }
  }
}
