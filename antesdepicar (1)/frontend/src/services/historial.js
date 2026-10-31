// Historial de análisis guardado SOLO en este navegador (localStorage).
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
  {
    id: 'ej4', fecha: Date.now() - 3 * 24 * 60 * 60 * 1000, canal: 'whatsapp', nivel: 'bajo',
    titulo: 'Mensaje sin señales claras', mensaje: 'Nos vemos mañana a las 10:00 en la oficina para revisar el presupuesto.',
  },
];

export function leerHistorial() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (Array.isArray(guardado)) return guardado;
  } catch {
    // sin almacenamiento
  }
  return EJEMPLOS_INICIALES;
}

function escribir(lista) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // sin almacenamiento
  }
}

export function agregarAlHistorial(resultado, canal) {
  const lista = leerHistorial();
  const nuevo = {
    id: String(Date.now()),
    fecha: Date.now(),
    canal,
    nivel: resultado.nivel_riesgo,
    titulo: resultado.tipo_posible,
    mensaje: resultado.mensaje,
    resultado,
  };
  escribir([nuevo, ...lista].slice(0, 200));
}

export function borrarHistorial() {
  escribir([]);
}

export function exportarHistorial() {
  const blob = new Blob([JSON.stringify(leerHistorial(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'antesdepicar-historial.json';
  a.click();
  URL.revokeObjectURL(url);
}
