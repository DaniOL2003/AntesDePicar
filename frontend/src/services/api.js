// Conexión con el backend (responsable: Daniela)
// En desarrollo, Vite redirige /api a http://localhost:8000 (ver vite.config.js).
import { obtenerToken } from './auth.js';

const API_URL = import.meta.env.VITE_API_URL || '';

export class ErrorConexion extends Error {}

export async function analizarMensaje(mensaje, canal) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}/api/analizar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si el usuario inició sesión, el backend guarda el análisis en su historial.
        ...(obtenerToken() ? { Authorization: `Bearer ${obtenerToken()}` } : {}),
      },
      body: JSON.stringify({ mensaje, canal }),
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

  // 404 o error sin cuerpo = el backend no existe todavía o el proxy no lo encontró
  if (respuesta.status === 404 || (respuesta.status >= 500 && !datos)) {
    throw new ErrorConexion('El servidor de análisis todavía no está conectado.');
  }
  if (!respuesta.ok) {
    throw new Error(datos?.error || `Error del servidor (${respuesta.status}).`);
  }
  return datos;
}

// Enviar un reporte comunitario a la base de datos.
export async function enviarReporte(mensaje) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}/api/reportes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(obtenerToken() ? { Authorization: `Bearer ${obtenerToken()}` } : {}),
      },
      body: JSON.stringify({ mensaje }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo enviar el reporte.');
  return datos;
}

// Estadísticas generales guardadas en la base de datos.
export async function obtenerEstadisticas() {
  try {
    const respuesta = await fetch(`${API_URL}/api/estadisticas`);
    if (!respuesta.ok) return null;
    return await respuesta.json();
  } catch {
    return null;
  }
}
