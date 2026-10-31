// Sesión del usuario (versión solo frontend).
// Por ahora todo se guarda en el navegador (localStorage).
// Cuando el backend esté listo, estas funciones llamarán a /api/login y /api/registro.

const CLAVE_SESION = 'adp_sesion';
const CLAVE_USUARIOS = 'adp_usuarios';

function leer(clave, porDefecto) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // navegador sin almacenamiento: la sesión dura mientras la pestaña esté abierta
  }
}

export function obtenerSesion() {
  return leer(CLAVE_SESION, null);
}

export function registrar({ nombre, correo, contrasena }) {
  const usuarios = leer(CLAVE_USUARIOS, {});
  const clave = correo.trim().toLowerCase();
  if (usuarios[clave]) throw new Error('Ya existe una cuenta con ese correo.');
  // Demo: en producción la contraseña NUNCA se guarda en el navegador; la valida el backend.
  usuarios[clave] = { nombre: nombre.trim(), correo: clave, contrasena };
  guardar(CLAVE_USUARIOS, usuarios);
  const sesion = { nombre: nombre.trim(), correo: clave };
  guardar(CLAVE_SESION, sesion);
  return sesion;
}

export function iniciarSesion({ correo, contrasena }) {
  const usuarios = leer(CLAVE_USUARIOS, {});
  const usuario = usuarios[correo.trim().toLowerCase()];
  if (!usuario || usuario.contrasena !== contrasena) {
    throw new Error('Correo o contraseña incorrectos.');
  }
  const sesion = { nombre: usuario.nombre, correo: usuario.correo };
  guardar(CLAVE_SESION, sesion);
  return sesion;
}

export function entrarComoInvitado() {
  const sesion = { nombre: 'Invitado', correo: null, invitado: true };
  guardar(CLAVE_SESION, sesion);
  return sesion;
}

export function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // sin almacenamiento
  }
}
