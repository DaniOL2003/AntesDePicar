// Directorio de canales oficiales.
// IMPORTANTE: antes de publicar, el equipo debe confirmar cada dominio y teléfono en el sitio oficial de la institución.
export const INSTITUCIONES = [
  { id: 'condusef', sigla: 'C', nombre: 'CONDUSEF', descripcion: 'Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros.', tipo: 'reguladores', dominio: 'condusef.gob.mx', telefono: '55 5340 0999', claves: ['condusef'] },
  { id: 'profeco', sigla: 'P', nombre: 'PROFECO', descripcion: 'Procuraduría Federal del Consumidor. Defensa de los derechos del consumidor.', tipo: 'reguladores', dominio: 'gob.mx', ruta: 'gob.mx/profeco', telefono: '55 5568 8722', claves: ['profeco'] },
  { id: 'banxico', sigla: 'B', nombre: 'BANXICO', descripcion: 'Banco de México. Banco central y regulador del sistema financiero.', tipo: 'reguladores', dominio: 'banxico.org.mx', telefono: '55 5237 2000', claves: ['banxico'] },
  { id: 'bbva', sigla: 'BB', nombre: 'BBVA México', descripcion: 'Institución de Banca Múltiple, Grupo Financiero BBVA México.', tipo: 'bancos', dominio: 'bbva.mx', telefono: '55 5226 2663', claves: ['bbva', 'bancomer'] },
  { id: 'banamex', sigla: 'BX', nombre: 'Banamex', descripcion: 'Banco Nacional de México, S.A.', tipo: 'bancos', dominio: 'banamex.com', telefono: '55 1226 2639', claves: ['banamex', 'citibanamex'] },
  { id: 'santander', sigla: 'ST', nombre: 'Santander México', descripcion: 'Banco Santander (México), S.A.', tipo: 'bancos', dominio: 'santander.com.mx', telefono: '55 5169 4300', claves: ['santander'] },
  { id: 'dhl', sigla: 'DHL', nombre: 'DHL Express', descripcion: 'Servicios de paquetería y logística internacional.', tipo: 'mensajeria', dominio: 'dhl.com', telefono: '800 765 6345', claves: ['dhl'] },
  { id: 'fedex', sigla: 'FX', nombre: 'FedEx México', descripcion: 'Soluciones de envío y logística global.', tipo: 'mensajeria', dominio: 'fedex.com', telefono: '800 900 1100', claves: ['fedex'] },
  { id: 'estafeta', sigla: 'ES', nombre: 'Estafeta', descripcion: 'Logística y mensajería mexicana.', tipo: 'mensajeria', dominio: 'estafeta.com', telefono: '800 378 2338', claves: ['estafeta'] },
];

export const TIPOS = [
  { id: 'todos', texto: 'Todos' },
  { id: 'reguladores', texto: 'Reguladores' },
  { id: 'bancos', texto: 'Bancos' },
  { id: 'mensajeria', texto: 'Mensajería' },
];

// Revisa si un enlace pertenece al dominio oficial de una institución.
export function verificarEnlace(texto, institucion) {
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(texto.trim()) ? texto.trim() : `https://${texto.trim()}`);
  } catch {
    return { estado: 'invalido', mensaje: 'Eso no parece un enlace válido.' };
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const oficial = host === institucion.dominio || host.endsWith(`.${institucion.dominio}`);
  const avisos = [];
  if (url.protocol === 'http:') avisos.push('El enlace usa http:// (sin candado). Los sitios oficiales usan https://.');
  if (url.username || url.password || texto.includes('@')) avisos.push('El enlace contiene “@”, un truco común para ocultar el sitio real.');

  if (oficial && (!institucion.ruta || `${host}${url.pathname}`.toLowerCase().startsWith(institucion.ruta))) {
    return { estado: 'oficial', host, mensaje: `El dominio ${host} coincide con el oficial de ${institucion.nombre}.`, avisos };
  }
  const imita = institucion.claves.some((c) => host.includes(c));
  return {
    estado: 'sospechoso',
    host,
    mensaje: imita
      ? `${host} usa el nombre de ${institucion.nombre}, pero NO es su dominio oficial (${institucion.ruta || institucion.dominio}). Es una señal típica de imitación.`
      : `${host} no coincide con el dominio oficial de ${institucion.nombre} (${institucion.ruta || institucion.dominio}).`,
    avisos,
  };
}
