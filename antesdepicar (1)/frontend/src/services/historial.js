// Historial de análisis.
// Con cuenta: vive en PostgreSQL y cada usuario solo ve el suyo.
// Invitado: solo en esta pestaña (sessionStorage) y se borra al salir.
import { solicitud } from './api.js';

const CLAVE_INVITADO = 'adp_historial_invitado';
const MAXIMO = 200;

function leerInvitado() {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE_INVITADO));
    if (Array.isArray(guardado)) return guardado;
  } catch {
    // sin almacenamiento
  }
  return [];
}

function escribirInvitado(lista) {
  try {
    sessionStorage.setItem(CLAVE_INVITADO, JSON.stringify(lista));
  } catch {
    // sin almacenamiento
  }
}

export async function leerHistorial(sesion) {
  if (sesion?.invitado) return leerInvitado();
  const { elementos } = await solicitud(`/api/historial?limite=${MAXIMO}`);
  return elementos.map((elemento) => ({ ...elemento, fecha: Date.parse(elemento.fecha) }));
}

export function agregarAlHistorialInvitado(resultado, canal) {
  const nuevo = {
    id: String(Date.now()),
    fecha: Date.now(),
    canal,
    nivel: resultado.nivel_riesgo,
    titulo: resultado.tipo_posible,
    mensaje: resultado.mensaje,
    resultado,
  };
  escribirInvitado([nuevo, ...leerInvitado()].slice(0, MAXIMO));
}

export async function eliminarDelHistorial(id, sesion) {
  if (sesion?.invitado) escribirInvitado(leerInvitado().filter((item) => item.id !== id));
  else await solicitud(`/api/historial/${id}`, { metodo: 'DELETE' });
}

export async function borrarHistorial(sesion) {
  if (sesion?.invitado) borrarHistorialInvitado();
  else await solicitud('/api/historial', { metodo: 'DELETE' });
}

export function borrarHistorialInvitado() {
  try {
    sessionStorage.removeItem(CLAVE_INVITADO);
  } catch {
    // sin almacenamiento
  }
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
