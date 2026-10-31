// Alertas de ejemplo para el Feed. Los números de reportes son DATOS DE DEMOSTRACIÓN.
export const ALERTAS = [
  {
    id: 1, nivel: 'critico', canal: 'WhatsApp', categoria: 'banca',
    titulo: 'Falso soporte bancario: bloqueo de cuenta ficticio',
    descripcion: 'Mensajes que avisan de cargos no reconocidos y envían un enlace a un portal falso para robar usuario, contraseña y códigos.',
    reportes: 1420, hace: 'Hace 15 min',
    senales: ['Enlace con dominio distinto al oficial del banco', 'Te piden NIP, contraseña o código de verificación', 'Amenaza de bloqueo inmediato'],
    consejo: 'Tu banco nunca te pedirá datos por mensaje. Llama al número al reverso de tu tarjeta.',
  },
  {
    id: 2, nivel: 'alto', canal: 'SMS', categoria: 'paqueteria',
    titulo: 'Paquete retenido en aduana',
    descripcion: 'Avisos de un envío pendiente que solo se libera pagando un monto pequeño con tarjeta en un sitio que imita a una paquetería.',
    reportes: 880, hace: 'Hace 1 hora',
    senales: ['No esperabas ningún paquete', 'Cobro pequeño para “liberar” el envío', 'Enlace acortado o con dominio raro'],
    consejo: 'Rastrea tus envíos solo desde la página oficial de la paquetería, escribiendo la dirección tú mismo.',
  },
  {
    id: 3, nivel: 'moderado', canal: 'Correo', categoria: 'banca',
    titulo: 'Bono o apoyo de gobierno falso',
    descripcion: 'Correos que prometen apoyos económicos a cambio de registrar datos personales y bancarios en portales no oficiales.',
    reportes: 450, hace: 'Hace 3 horas',
    senales: ['El sitio no termina en .gob.mx', 'Piden datos de tarjeta para “depositar” el apoyo', 'Plazos muy cortos para registrarte'],
    consejo: 'Los programas oficiales se consultan en gob.mx. Nunca piden tu NIP ni el CVV de tu tarjeta.',
  },
  {
    id: 4, nivel: 'critico', canal: 'WhatsApp', categoria: 'empleo',
    titulo: 'Empleo falso: likes en YouTube y TikTok',
    descripcion: 'Ofertas de trabajo remoto con pagos altos por tareas sencillas que terminan pidiendo depósitos para “desbloquear” ganancias.',
    reportes: 2170, hace: 'Hace 5 horas',
    senales: ['Mucho dinero por muy poco trabajo', 'Contratación sin entrevista', 'Piden un depósito o “inversión” para continuar'],
    consejo: 'Un empleo real nunca te cobra por trabajar. Investiga la empresa en fuentes independientes.',
  },
  {
    id: 5, nivel: 'alto', canal: 'Llamada', categoria: 'banca',
    titulo: 'Extorsión telefónica: supuesto familiar secuestrado',
    descripcion: 'Llamadas o mensajes de números desconocidos que fingen una emergencia familiar y exigen transferencias urgentes.',
    reportes: 960, hace: 'Hace 6 horas',
    senales: ['Presión extrema y gritos para que no pienses', 'Te piden no colgar ni avisar a nadie', 'Exigen depósito en tienda o transferencia'],
    consejo: 'Cuelga y llama directamente a tu familiar. Puedes reportar al 089 (denuncia anónima).',
  },
  {
    id: 6, nivel: 'moderado', canal: 'Redes', categoria: 'empleo',
    titulo: 'Falsa inversión en criptomonedas',
    descripcion: 'Promociones en redes sociales que usan la imagen de celebridades para prometer ganancias garantizadas en plataformas falsas.',
    reportes: 600, hace: 'Hace 8 horas',
    senales: ['Ganancias “garantizadas” o muy altas', 'Usan fotos de famosos sin contexto', 'Te presionan para invertir más'],
    consejo: 'Ninguna inversión legítima garantiza ganancias. Consulta si la entidad está regulada en el sitio de CONDUSEF.',
  },
];

export const CATEGORIAS = [
  { id: 'todas', texto: 'Todas' },
  { id: 'banca', texto: 'Banca y finanzas' },
  { id: 'paqueteria', texto: 'Paquetería' },
  { id: 'empleo', texto: 'Empleo e inversión' },
];
