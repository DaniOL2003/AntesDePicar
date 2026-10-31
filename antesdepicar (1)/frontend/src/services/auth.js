// Sesión del usuario. Las cuentas viven en PostgreSQL y la sesión en una cookie HttpOnly del backend.
// El invitado no tiene cuenta: su modo dura solo mientras la pestaña esté abierta.
import { solicitud } from './api.js';
import { borrarHistorialInvitado } from './historial.js';

const CLAVE_INVITADO = 'adp_invitado';
const INVITADO = { nombre: 'Invitado', correo: null, invitado: true };

function hayInvitado() {
  try {
    return sessionStorage.getItem(CLAVE_INVITADO) === '1';
  } catch {
    return false;
  }
}

function salirDeInvitado() {
  try {
    sessionStorage.removeItem(CLAVE_INVITADO);
  } catch {
    // sin almacenamiento
  }
  borrarHistorialInvitado();
}

export async function obtenerSesion() {
  if (hayInvitado()) return INVITADO;
  try {
    return await solicitud('/api/auth/sesion');
  } catch {
    return null;
  }
}

export function registrar({ nombre, correo, contrasena, recordar }) {
  return solicitud('/api/auth/registro', { metodo: 'POST', cuerpo: { nombre, correo, contrasena, recordar } });
}

export function iniciarSesion({ correo, contrasena, recordar }) {
  return solicitud('/api/auth/login', { metodo: 'POST', cuerpo: { correo, contrasena, recordar } });
}

export function entrarComoInvitado() {
  try {
    sessionStorage.setItem(CLAVE_INVITADO, '1');
  } catch {
    // navegador sin almacenamiento: el modo invitado dura hasta recargar la página
  }
  return INVITADO;
}

export async function cerrarSesion(sesion) {
  if (sesion?.invitado) salirDeInvitado();
  else await solicitud('/api/auth/logout', { metodo: 'POST' });
}
