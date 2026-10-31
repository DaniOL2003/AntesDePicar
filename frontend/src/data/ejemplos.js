// Mensajes de ejemplo para la demo (ficticios).
export const EJEMPLOS = [
  {
    etiqueta: 'SMS del "banco"',
    canal: 'sms',
    mensaje:
      'BBVA: Detectamos un cargo no reconocido por $8,450.00. Si no fuiste tu, ingresa HOY a http://bbva-mx-aclaraciones.xyz y confirma tu NIP para cancelarlo. De lo contrario tu cuenta sera bloqueada.',
  },
  {
    etiqueta: 'WhatsApp de "familiar"',
    canal: 'whatsapp',
    mensaje:
      'Hola ma, soy yo, cambié de número porque se me cayó el cel. Guarda este nuevo. Oye necesito un favor urgente, tengo que pagar algo hoy y mi app del banco no sirve, ¿me puedes transferir $3,500? Te lo regreso mañana, no le digas a mi papá porfa.',
  },
  {
    etiqueta: 'Oferta de empleo',
    canal: 'empleo',
    mensaje:
      '¡FELICIDADES! Fuiste seleccionado para trabajar desde casa. Gana $2,000 diarios solo dando likes a videos de YouTube. No necesitas experiencia ni entrevista. Para activar tu cuenta paga una cuota de inscripción de $499 en OXXO. Cupos limitados, responde YA.',
  },
  {
    etiqueta: 'Mensaje normal',
    canal: 'whatsapp',
    mensaje:
      'Hola Eduardo, te recuerdo que la reunión del equipo es mañana a las 10 en la biblioteca. Lleva tu laptop para revisar el proyecto. ¡Nos vemos!',
  },
];

// Resultado de muestra para ver el diseño mientras el backend no está conectado.
// Corresponde al primer ejemplo (SMS del "banco"). NO es un análisis real.
export function resultadoDeMuestra(mensaje) {
  const buscar = (frase) => {
    const i = mensaje.toLowerCase().indexOf(frase.toLowerCase());
    return i >= 0
      ? { verificada: true, inicio: Array.from(mensaje.slice(0, i)).length, fin: Array.from(mensaje.slice(0, i + frase.length)).length, evidencia: mensaje.slice(i, i + frase.length) }
      : { verificada: false, inicio: null, fin: null, evidencia: frase };
  };
  return {
    demo: true,
    nivel_riesgo: 'alto',
    tipo_posible: 'Suplantación bancaria (phishing)',
    resumen: 'El mensaje parece imitar a un banco para que entres a un enlace falso y entregues tu NIP.',
    senales: [
      { titulo: 'Enlace que no es del banco', explicacion: 'El dominio oficial de BBVA México es bbva.mx; este enlace usa otro dominio.', ...buscar('http://bbva-mx-aclaraciones.xyz') },
      { titulo: 'Pide tu NIP', explicacion: 'Ningún banco te pide tu NIP por mensaje o enlace.', ...buscar('confirma tu NIP') },
      { titulo: 'Urgencia y amenaza', explicacion: 'Presionan para que actúes rápido sin pensar.', ...buscar('tu cuenta sera bloqueada') },
    ],
    recomendaciones: [
      'No abras el enlace ni respondas el mensaje.',
      'Llama a tu banco al número que aparece al reverso de tu tarjeta.',
      'Revisa tus movimientos directamente en la app oficial.',
      'Bloquea y reporta el número.',
    ],
    modelo: 'ejemplo (sin IA)',
    mensaje,
    aviso: 'Este es un resultado de ejemplo para mostrar el diseño. No es un análisis real.',
  };
}
