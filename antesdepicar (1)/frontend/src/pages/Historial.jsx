// Historial y privacidad (responsable: Daniela)
import { useEffect, useMemo, useState } from 'react';
import { LuShieldCheck, LuShieldAlert, LuTriangleAlert, LuCircleCheck, LuDownload, LuTrash2, LuSearch, LuWifiOff, LuCpu, LuHardDrive, LuInfo, LuChevronDown, LuX } from 'react-icons/lu';
import { borrarHistorial, eliminarDelHistorial, exportarHistorial, leerHistorial } from '../services/historial.js';
import './Historial.css';

const NIVEL = {
  alto: { texto: 'Riesgo alto', clase: 'badge-critico', Icono: LuShieldAlert, color: 'var(--critico)' },
  medio: { texto: 'Sospechoso', clase: 'badge-moderado', Icono: LuTriangleAlert, color: 'var(--moderado)' },
  bajo: { texto: 'Sin señales', clase: '', Icono: LuCircleCheck, color: 'var(--lime)' },
};
const CANAL = { whatsapp: 'WhatsApp', sms: 'SMS', correo: 'Correo', empleo: 'Oferta de empleo', otro: 'Otro' };
const POR_PAGINA = 6;

function tiempoRelativo(fecha) {
  const min = Math.round((Date.now() - fecha) / 60000);
  if (min < 1) return 'Hace un momento';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'Ayer' : `Hace ${d} días`;
}

function Anillo({ porcentaje }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 180 180" className="anillo" role="img" aria-label={`${porcentaje}%`}>
      <circle cx="90" cy="90" r={r} className="anillo-fondo" />
      <circle cx="90" cy="90" r={r} className="anillo-valor" strokeDasharray={c} strokeDashoffset={c * (1 - porcentaje / 100)} />
      <text x="90" y="88" textAnchor="middle" className="anillo-numero">{porcentaje}%</text>
      <text x="90" y="112" textAnchor="middle" className="anillo-etiqueta">CON RIESGO</text>
    </svg>
  );
}

export default function Historial({ sesion }) {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    let vigente = true;
    leerHistorial(sesion)
      .then((datos) => { if (vigente) setLista(datos); })
      .catch((err) => { if (vigente) setError(err.message); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [sesion]);

  const conteo = useMemo(() => ({
    todos: lista.length,
    alto: lista.filter((i) => i.nivel === 'alto').length,
    medio: lista.filter((i) => i.nivel === 'medio').length,
    bajo: lista.filter((i) => i.nivel === 'bajo').length,
  }), [lista]);

  const porcentaje = lista.length ? Math.round(((conteo.alto + conteo.medio) / lista.length) * 100) : 0;

  const filtrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return lista.filter((i) => (filtro === 'todos' || i.nivel === filtro) && (!q || `${i.titulo} ${i.mensaje} ${CANAL[i.canal]}`.toLowerCase().includes(q)));
  }, [lista, busqueda, filtro]);

  async function borrar() {
    if (!window.confirm('¿Borrar todo tu historial? No se puede deshacer.')) return;
    setError('');
    try {
      await borrarHistorial(sesion);
      setLista([]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminar(item) {
    if (!window.confirm('¿Eliminar este análisis? No se puede deshacer.')) return;
    setError('');
    try {
      await eliminarDelHistorial(item.id, sesion);
      setLista((actual) => actual.filter((i) => i.id !== item.id));
      setDetalle(null);
    } catch (err) {
      setDetalle(null);
      setError(err.message);
    }
  }

  const FILTROS = [
    { id: 'todos', texto: `Todos (${conteo.todos})` },
    { id: 'alto', texto: `Riesgo alto (${conteo.alto})` },
    { id: 'medio', texto: `Sospechosos (${conteo.medio})` },
    { id: 'bajo', texto: `Sin señales (${conteo.bajo})` },
  ];

  return (
    <div className="pagina">
      <div className="card historial-encabezado">
        <div className="historial-titulo">
          <span className="icono-caja"><LuShieldCheck /></span>
          <div>
            <h1>Historial y Privacidad</h1>
            <span className="muted pequeno-txt">Sesión: <span className="chip-id mono">{sesion?.nombre || 'Invitado'}</span></span>
          </div>
        </div>
        <div className="historial-acciones">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => exportarHistorial(lista)} disabled={!lista.length}><LuDownload /> Exportar datos</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={borrar} disabled={!lista.length}><LuTrash2 /> Borrar historial</button>
        </div>
      </div>

      <div className="historial-grid">
        <aside className="historial-lateral">
          <div className="card resumen-anillo">
            <Anillo porcentaje={porcentaje} />
            <h3>Mensajes con señales de riesgo</h3>
            <p className="muted">De todo lo que has analizado, este porcentaje tenía señales de alerta o de estafa.</p>
          </div>

          <div className="mini-grid">
            <div className="card mini">
              <div className="mini-cabecera"><span className="muted">Envío a terceros</span><LuWifiOff /></div>
              <strong>0 Bytes</strong>
              <span className="muted">No se comparte con servicios externos</span>
            </div>
            <div className="card mini">
              <div className="mini-cabecera"><span className="muted">IA externa</span><LuCpu /></div>
              <strong>Desactivada</strong>
              <span className="muted">Modelo abierto en servidor propio</span>
            </div>
          </div>

          <div className="card fila-estado">
            <LuHardDrive />
            <div>
              <strong>{sesion?.invitado ? 'Modo invitado' : 'Base de datos privada'}</strong>
              <span className="muted">{sesion?.invitado ? 'Solo en esta pestaña; se borra al salir' : 'Solo tu cuenta puede verlo'}</span>
            </div>
            <span className="punto lima-punto" />
          </div>

          <div className="mini-grid">
            <div className="card total"><strong>{conteo.todos}</strong><span className="muted">Analizados</span></div>
            <div className="card total"><strong className="rojo">{conteo.alto}</strong><span className="muted">Riesgo alto</span></div>
          </div>

          <p className="nota-privacidad"><LuInfo /> Nota de privacidad: {sesion?.invitado ? 'como invitado, tu historial se guarda solo en esta pestaña.' : 'tu historial se guarda en nuestra base de datos, asociado a tu cuenta.'} Puedes exportarlo o borrarlo cuando quieras.</p>
        </aside>

        <section className="card historial-lista">
          <label className="buscador buscador-caja">
            <LuSearch />
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar en el historial por palabras clave, remitente o enlace…" />
          </label>
          <div className="chips">
            {FILTROS.map((f) => (
              <button key={f.id} type="button" className={`chip ${filtro === f.id ? 'activo' : ''}`} onClick={() => { setFiltro(f.id); setVisibles(POR_PAGINA); }}>{f.texto}</button>
            ))}
          </div>

          {error && <p className="aviso-demo" role="alert">{error}</p>}

          {cargando ? (
            <p className="muted vacio">Cargando tu historial…</p>
          ) : filtrada.length === 0 ? (
            <p className="muted vacio">{lista.length ? 'Nada coincide con tu búsqueda.' : 'Aún no has analizado mensajes. Tus análisis aparecerán aquí.'}</p>
          ) : (
            <ul className="items">
              {filtrada.slice(0, visibles).map((i) => {
                const n = NIVEL[i.nivel] || NIVEL.medio;
                return (
                  <li key={i.id} className="item">
                    <span className="item-icono" style={{ color: n.color }}><n.Icono /></span>
                    <div className="item-cuerpo">
                      <div className="item-titulo">
                        <strong>{i.titulo}</strong>
                        <span className={`badge ${n.clase}`}>{n.texto}</span>
                      </div>
                      <p className="item-mensaje">“{i.mensaje}”</p>
                      <span className="muted item-meta">{tiempoRelativo(i.fecha)} · {CANAL[i.canal] || i.canal}</span>
                    </div>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setDetalle(i)}>Detalles</button>
                  </li>
                );
              })}
            </ul>
          )}

          {filtrada.length > visibles && (
            <button type="button" className="enlace cargar-mas" onClick={() => setVisibles(visibles + POR_PAGINA)}>
              Cargar más registros <LuChevronDown />
            </button>
          )}
        </section>
      </div>

      {detalle && (
        <div className="modal-fondo" onClick={() => setDetalle(null)}>
          <div className="card modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-cerrar" onClick={() => setDetalle(null)} aria-label="Cerrar"><LuX /></button>
            <span className={`badge ${(NIVEL[detalle.nivel] || NIVEL.medio).clase}`} style={{ justifySelf: 'start' }}>{(NIVEL[detalle.nivel] || NIVEL.medio).texto}</span>
            <h3>{detalle.titulo}</h3>
            <p className="muted">{tiempoRelativo(detalle.fecha)} · {CANAL[detalle.canal] || detalle.canal}</p>
            <p className="detalle-mensaje">{detalle.mensaje}</p>
            {detalle.resultado.resumen && <p>{detalle.resultado.resumen}</p>}
            {detalle.resultado.senales?.length > 0 && (
              <ul className="detalle-lista">
                {detalle.resultado.senales.map((s, k) => <li key={k}><strong>{s.titulo}:</strong> {s.explicacion}</li>)}
              </ul>
            )}
            <button type="button" className="btn btn-danger btn-sm" onClick={() => eliminar(detalle)}><LuTrash2 /> Eliminar este análisis</button>
          </div>
        </div>
      )}
    </div>
  );
}
