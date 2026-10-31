// Conexión con el backend (responsable: Daniela)
// En desarrollo, Vite redirige /api a http://localhost:8000 (ver vite.config.js).
const API_URL = import.meta.env.VITE_API_URL || '';

export class ErrorConexion extends Error {}
export class ErrorSesion extends Error {}

// La sesión viaja en una cookie HttpOnly: JavaScript no puede leerla, por eso se usa credentials.
export async function solicitud(ruta, { metodo = 'GET', cuerpo } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      credentials: 'include',
      headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorConexion('No se pudo conectar con el servidor de análisis. ¿Está encendido el backend?');
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    // la respuesta no trae JSON
  }

  // Sin cuerpo = el backend no está encendido o el proxy no lo encontró
  if ((respuesta.status === 404 || respuesta.status >= 500) && !datos) {
    throw new ErrorConexion('El servidor de análisis todavía no está conectado.');
  }
  if (respuesta.status === 401) {
    throw new ErrorSesion(datos?.error || 'Tu sesión expiró. Inicia sesión de nuevo.');
  }
  if (!respuesta.ok) {
    throw new Error(datos?.error || `Error del servidor (${respuesta.status}).`);
  }
  return datos;
}

export function analizarMensaje(mensaje, canal) {
  return solicitud('/api/analizar', { metodo: 'POST', cuerpo: { mensaje, canal } });
}

export function enviarReporte(mensaje) {
  return solicitud('/api/reportes', { metodo: 'POST', cuerpo: { mensaje } });
}
