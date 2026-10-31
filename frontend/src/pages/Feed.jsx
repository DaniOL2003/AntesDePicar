// Feed de alertas comunitarias (responsable: Kelly)
import { useMemo, useState } from 'react';
import { LuSearch, LuMessageCircle, LuMail, LuSmartphone, LuPhone, LuGlobe, LuUsers, LuClock, LuArrowRight, LuShieldCheck, LuX, LuSend } from 'react-icons/lu';
import { ALERTAS, CATEGORIAS } from '../data/alertas.js';
import { enviarReporte } from '../services/api.js';
import './Feed.css';

const ICONO_CANAL = { WhatsApp: LuMessageCircle, SMS: LuSmartphone, Correo: LuMail, Llamada: LuPhone, Redes: LuGlobe };
const NIVEL = {
  critico: { texto: 'Crítico', clase: 'badge-critico' },
  alto: { texto: 'Alto', clase: 'badge-alto' },
  moderado: { texto: 'Moderado', clase: 'badge-moderado' },
};

function Modal({ children, onCerrar }) {
  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="card modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar"><LuX /></button>
        {children}
      </div>
    </div>
  );
}

export default function Feed({ irA }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [detalle, setDetalle] = useState(null);
  const [reportando, setReportando] = useState(false);
  const [reporte, setReporte] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorReporte, setErrorReporte] = useState('');

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ALERTAS.filter(
      (a) =>
        (categoria === 'todas' || a.categoria === categoria) &&
        (!q || `${a.titulo} ${a.descripcion} ${a.canal}`.toLowerCase().includes(q))
    );
  }, [busqueda, categoria]);

  async function mandarReporte(e) {
    e.preventDefault();
    setEnviando(true);
    setErrorReporte('');
    try {
      await enviarReporte(reporte.trim()); // se guarda en la base de datos
      setEnviado(true);
      setReporte('');
    } catch (err) {
      setErrorReporte(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina">
      <div className="encabezado-pagina">
        <div>
          <span className="badge"><span className="punto" /> Monitoreo activo · México</span>
          <h1>Feed de Alertas Comunitarias</h1>
          <p>Modalidades de fraude reportadas por la comunidad para prevenir estafas digitales en México.</p>
        </div>
        <div className="card cifra-destacada">
          <strong>{ALERTAS.length}</strong>
          <span>Alertas activas</span>
        </div>
      </div>

      <div className="card barra-filtros">
        <label className="buscador">
          <LuSearch />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por palabra clave, banco o canal…" />
        </label>
        <div className="chips">
          {CATEGORIAS.map((c) => (
            <button key={c.id} type="button" className={`chip ${categoria === c.id ? 'activo' : ''}`} onClick={() => setCategoria(c.id)}>
              {c.texto}
            </button>
          ))}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className="muted" style={{ textAlign: 'center' }}>No hay alertas que coincidan con tu búsqueda.</p>
      ) : (
        <div className="grid-3">
          {filtradas.map((a) => {
            const Icono = ICONO_CANAL[a.canal] || LuGlobe;
            return (
              <article key={a.id} className="card alerta">
                <div className="alerta-cabecera">
                  <span className={`badge ${NIVEL[a.nivel].clase}`}>{NIVEL[a.nivel].texto}</span>
                  <span className="alerta-canal"><Icono /> {a.canal}</span>
                </div>
                <h3>{a.titulo}</h3>
                <p className="muted alerta-texto">{a.descripcion}</p>
                <div className="alerta-meta">
                  <span><LuUsers /> {a.reportes.toLocaleString('es-MX')} reportes</span>
                  <span><LuClock /> {a.hace}</span>
                </div>
                <button type="button" className="btn btn-lime btn-block" onClick={() => setDetalle(a)}>
                  Ver desglose y señales <LuArrowRight />
                </button>
              </article>
            );
          })}
        </div>
      )}

      <p className="aviso-demo">Las alertas y cifras de reportes de esta sección son datos de demostración del prototipo.</p>

      <section className="card cta-reporte">
        <div>
          <span className="eyebrow"><LuShieldCheck /> Protege a la comunidad hoy</span>
          <h2>¿Recibiste un mensaje sospechoso? Repórtalo al instante.</h2>
          <p className="muted">Tu reporte anónimo ayuda a que más personas en México reconozcan el fraude a tiempo.</p>
        </div>
        <div className="cta-acciones">
          <button type="button" className="btn btn-lime" onClick={() => { setReportando(true); setEnviado(false); }}>Reportar estafa ahora</button>
          <button type="button" className="btn btn-outline" onClick={() => irA('analizador')}>Analizar un mensaje</button>
        </div>
      </section>

      {detalle && (
        <Modal onCerrar={() => setDetalle(null)}>
          <span className={`badge ${NIVEL[detalle.nivel].clase}`} style={{ justifySelf: 'start' }}>{NIVEL[detalle.nivel].texto} · {detalle.canal}</span>
          <h3>{detalle.titulo}</h3>
          <p className="muted">{detalle.descripcion}</p>
          <div>
            <strong className="pequeno-titulo">Señales para reconocerla</strong>
            <ul className="lista-senales">
              {detalle.senales.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <p className="consejo"><LuShieldCheck /> {detalle.consejo}</p>
          <button type="button" className="btn btn-lime" onClick={() => irA('analizador')}>Analizar un mensaje parecido</button>
        </Modal>
      )}

      {reportando && (
        <Modal onCerrar={() => setReportando(false)}>
          <h3>Reportar un mensaje sospechoso</h3>
          {enviado ? (
            <>
              <p className="consejo"><LuShieldCheck /> ¡Gracias! Tu reporte quedó guardado en nuestra base de datos. Recuerda no responder ni dar clic en el mensaje.</p>
              <button type="button" className="btn btn-outline" onClick={() => setReportando(false)}>Cerrar</button>
            </>
          ) : (
            <form onSubmit={mandarReporte} style={{ display: 'grid', gap: 12 }}>
              <p className="muted">Pega el mensaje. Borra antes tus datos personales (nombre, número de cuenta, etc.).</p>
              <textarea className="campo" rows={5} value={reporte} onChange={(e) => setReporte(e.target.value)} placeholder="Pega aquí el mensaje…" />
              {errorReporte && <p className="aviso-demo" role="alert">⚠️ {errorReporte}</p>}
              <button type="submit" className="btn btn-lime" disabled={reporte.trim().length < 10 || enviando}><LuSend /> {enviando ? 'Enviando…' : 'Enviar reporte'}</button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
