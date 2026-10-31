// Analizador de mensajes sospechosos (responsable: Daniela)
import { useRef, useState } from 'react';
import { LuSparkles, LuLock, LuLandmark, LuTruck, LuBriefcase, LuArrowRight } from 'react-icons/lu';
import AnalysisResult from '../components/AnalysisResult.jsx';
import { analizarMensaje, ErrorConexion } from '../services/api.js';
import { agregarAlHistorial } from '../services/historial.js';
import { EJEMPLOS, resultadoDeMuestra } from '../data/ejemplos.js';
import './Analizador.css';

const CANALES = [
  { valor: 'whatsapp', texto: 'WhatsApp' },
  { valor: 'sms', texto: 'SMS' },
  { valor: 'correo', texto: 'Correo' },
  { valor: 'empleo', texto: 'Oferta de empleo' },
  { valor: 'otro', texto: 'Otro' },
];
const MIN = 10;
const MAX = 5000;

const ESTAFAS_COMUNES = [
  { Icono: LuLandmark, titulo: 'Falsas Alertas Bancarias', riesgo: 'Alto riesgo', clase: 'badge-critico',
    texto: 'SMS o WhatsApp que avisan de cargos no reconocidos o cuentas bloqueadas, con enlaces a portales falsos que imitan a tu banco.' },
  { Icono: LuTruck, titulo: 'Retención de Paquetes', riesgo: 'Riesgo medio', clase: 'badge-moderado',
    texto: 'Mensajes que simulan ser de paqueterías y piden un pequeño pago para liberar un envío que nunca existió.' },
  { Icono: LuBriefcase, titulo: 'Falsas Ofertas de Empleo', riesgo: 'Alto riesgo', clase: 'badge-critico',
    texto: 'Trabajos “desde casa” con pagos altos por dar likes o calificar productos, que terminan pidiendo depósitos.' },
];

export default function Analizador({ irA }) {
  const [mensaje, setMensaje] = useState('');
  const [canal, setCanal] = useState('sms');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null); // { texto, sinConexion }
  const [resultado, setResultado] = useState(null);
  const refResultado = useRef(null);

  const largo = mensaje.trim().length;
  const valido = largo >= MIN && largo <= MAX;

  function mostrar(datos) {
    setResultado(datos);
    setTimeout(() => refResultado.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  async function analizar(e) {
    e?.preventDefault();
    if (!valido || cargando) return;
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const datos = await analizarMensaje(mensaje.trim(), canal);
      agregarAlHistorial(datos, canal);
      mostrar(datos);
    } catch (err) {
      setError({ texto: err.message, sinConexion: err instanceof ErrorConexion });
    } finally {
      setCargando(false);
    }
  }

  function nuevo() {
    setResultado(null);
    setMensaje('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="pagina">
      <section className="hero">
        <span className="badge"><LuSparkles /> Motor analizador con Inteligencia Artificial</span>
        <h1>Protección inteligente contra <br />estafas digitales</h1>
        <p>
          Pega cualquier mensaje, enlace o SMS sospechoso. Nuestro modelo de IA abierto detecta señales de phishing y
          fraude, y te explica cómo verificar de forma segura.
        </p>

        <form className="card analizador-caja" onSubmit={analizar}>
          <div className="chips" role="group" aria-label="Canal del mensaje">
            {CANALES.map((c) => (
              <button
                key={c.valor}
                type="button"
                className={`chip ${canal === c.valor ? 'activo' : ''}`}
                aria-pressed={canal === c.valor}
                onClick={() => setCanal(c.valor)}
                disabled={cargando}
              >
                {c.texto}
              </button>
            ))}
          </div>

          <textarea
            className="analizador-texto"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            maxLength={MAX}
            disabled={cargando}
            placeholder="Ej. Estimado cliente, su cuenta ha sido bloqueada temporalmente. Inicie sesión en https://banco-seguro-login.com para verificar sus datos…"
            aria-label="Mensaje sospechoso"
          />

          <div className="analizador-pie">
            <span className="muted pequeno">
              <LuLock /> Tus datos se analizan en nuestro servidor y nunca se almacenan.
              <span className={largo > 0 && !valido ? 'contador-error' : ''}> · {largo}/{MAX}</span>
            </span>
            <button type="submit" className="btn btn-lime" disabled={!valido || cargando}>
              {cargando ? <><span className="girador" /> Analizando…</> : <><LuSparkles /> Analizar mensaje con privacidad garantizada</>}
            </button>
          </div>

          <div className="ejemplos pequeno">
            <span className="muted">Probar con un ejemplo:</span>
            {EJEMPLOS.map((ej) => (
              <button key={ej.etiqueta} type="button" className="enlace" disabled={cargando}
                onClick={() => { setMensaje(ej.mensaje); setCanal(ej.canal); }}>
                {ej.etiqueta}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="card estado-error" role="alert">
            <strong>No pudimos analizar el mensaje.</strong>
            <span>{error.texto}</span>
            <div className="estado-acciones">
              <button type="button" className="btn btn-outline btn-sm" onClick={analizar}>Reintentar</button>
              {error.sinConexion && (
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setError(null); mostrar(resultadoDeMuestra(mensaje.trim() || EJEMPLOS[0].mensaje)); }}>
                  Ver un resultado de ejemplo
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <div ref={refResultado} className="ancla">{resultado && <AnalysisResult resultado={resultado} onNuevo={nuevo} />}</div>

      <section className="seccion">
        <div className="seccion-encabezado">
          <div>
            <span className="eyebrow">Vigilancia comunitaria</span>
            <h2>Estafas comunes bajo la lupa</h2>
          </div>
          <p className="muted">Conoce las modalidades de fraude más reportadas en México y aprende a identificarlas a tiempo.</p>
        </div>
        <div className="grid-3">
          {ESTAFAS_COMUNES.map(({ Icono, titulo, riesgo, clase, texto }) => (
            <article key={titulo} className="card estafa">
              <div className="estafa-cabecera">
                <span className="icono-caja"><Icono /></span>
                <span className={`badge ${clase}`}>{riesgo}</span>
              </div>
              <h3>{titulo}</h3>
              <p className="muted">{texto}</p>
              <button type="button" className="enlace estafa-enlace" onClick={() => irA('feed')}>
                Ver alertas relacionadas <LuArrowRight />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card impacto">
        <div>
          <span className="eyebrow">Tecnología abierta</span>
          <h2>Protección que respeta tu privacidad</h2>
          <p className="muted">Usamos un modelo de IA de pesos abiertos que corre en nuestro propio servidor. Tu mensaje no se comparte con terceros.</p>
        </div>
        <div className="impacto-cifras">
          <div><strong>100%</strong><span>Código abierto</span></div>
          <div><strong>0</strong><span>Datos a terceros</span></div>
          <div><strong>24/7</strong><span>Disponible</span></div>
        </div>
      </section>
    </div>
  );
}
