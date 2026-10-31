// Historial de análisis.
// - Con cuenta: se guarda en la base de datos del backend (SQLite).
// - Como invitado: se guarda solo en este navegador (localStorage).
import { obtenerToken } from './auth.js';

const API_URL = import.meta.env.VITE_API_URL || '';
const CLAVE = 'adp_historial';

const EJEMPLOS_INICIALES = [
  {
    id: 'ej1', fecha: Date.now() - 12 * 60 * 1000, canal: 'whatsapp', nivel: 'alto',
    titulo: 'Phishing bancario', mensaje: 'URGENTE: Su cuenta bancaria ha sido suspendida. Verifique aquí: http://bbva-mx-verifica.xyz',
  },
  {
    id: 'ej2', fecha: Date.now() - 2 * 60 * 60 * 1000, canal: 'sms', nivel: 'bajo',
    titulo: 'Mensaje sin señales claras', mensaje: 'Hola, te comparto el comprobante de la transferencia por la compra de la bicicleta.',
  },
  {
    id: 'ej3', fecha: Date.now() - 26 * 60 * 60 * 1000, canal: 'sms', nivel: 'medio',
    titulo: 'Paquete retenido', mensaje: 'Su paquete está retenido en aduana. Pague $35 MXN de envío en el siguiente enlace para liberarlo.',
  },
];

export function usaBaseDeDatos() {
  return Boolean(obtenerToken());
}

function leerLocal() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (Array.isArray(guardado)) return guardado;
  } catch {
    // sin almacenamiento
  }
  return EJEMPLOS_INICIALES;
}

function escribirLocal(lista) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // sin almacenamiento
  }
}

async function llamar(metodo) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}/api/historial`, {
      method: metodo,
      headers: { Authorization: `Bearer ${obtenerToken()}` },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor para leer tu historial.');
  }
  const datos = await respuesta.json().catch(() => null);
  if (respuesta.status === 401) throw new Error('Tu sesión expiró. Cierra sesión y vuelve a entrar.');
  if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo leer el historial.');
  return datos;
}

export async function leerHistorial() {
  return usaBaseDeDatos() ? llamar('GET') : leerLocal();
}

// Solo para invitados: con cuenta, el backend ya lo guardó al analizar.
export function agregarAlHistorial(resultado, canal) {
  if (usaBaseDeDatos()) return;
  const nuevo = {
    id: String(Date.now()),
    fecha: Date.now(),
    canal,
    nivel: resultado.nivel_riesgo,
    titulo: resultado.tipo_posible,
    mensaje: resultado.mensaje,
    resultado,
  };
  escribirLocal([nuevo, ...leerLocal()].slice(0, 200));
}

export async function borrarHistorial() {
  if (usaBaseDeDatos()) await llamar('DELETE');
  else escribirLocal([]);
}

export function exportarHistorial(lista) {
  const blob = new Blob([JSON.stringify(lista, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'antesdepicar-historial.json';
  a.click();
  URL.revokeObjectURL(url);
}
