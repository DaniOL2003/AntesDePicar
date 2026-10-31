// Centro de verificación oficial (responsable: Kelly)
import { useMemo, useState } from 'react';
import { LuSearch, LuBadgeCheck, LuShieldCheck, LuShieldAlert, LuLink, LuLock, LuSmartphone, LuX, LuCircleCheck } from 'react-icons/lu';
import { INSTITUCIONES, TIPOS, verificarEnlace } from '../data/instituciones.js';
import './Verificacion.css';

const GUIA = [
  { Icono: LuLink, titulo: '1. Análisis de URL y extensiones', texto: 'Los bancos y dependencias oficiales mexicanas operan en dominios como .gob.mx, .com.mx o .mx. Desconfía de extensiones genéricas como .xyz, .top o combinaciones raras.', pie: 'Regla de oro: revisa el final del dominio' },
  { Icono: LuLock, titulo: '2. Certificados y candado', texto: 'Casi todos los sitios falsos ya tienen candado (https). El candado solo indica conexión cifrada; lo importante es que el nombre del sitio sea el oficial.', pie: 'Valida la identidad, no solo el candado' },
  { Icono: LuSmartphone, titulo: '3. Canales de acceso directo', texto: 'Nunca entres a tu banco desde enlaces en SMS, WhatsApp o correos. Usa la app oficial o escribe la dirección tú mismo.', pie: 'Evita el phishing por SMS' },
];

export default function Verificacion() {
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [seleccion, setSeleccion] = useState(null);
  const [enlace, setEnlace] = useState('');
  const [resultado, setResultado] = useState(null);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return INSTITUCIONES.filter(
      (i) => (tipo === 'todos' || i.tipo === tipo) && (!q || `${i.nombre} ${i.descripcion} ${i.dominio}`.toLowerCase().includes(q))
    );
  }, [busqueda, tipo]);

  function abrir(inst) {
    setSeleccion(inst);
    setEnlace('');
    setResultado(null);
  }

  function verificar(e) {
    e.preventDefault();
    if (enlace.trim()) setResultado(verificarEnlace(enlace, seleccion));
  }

  return (
    <div className="pagina">
      <div className="encabezado-pagina">
        <div>
          <span className="badge"><LuBadgeCheck /> Repositorio oficial</span>
          <h1>Centro de Verificación Oficial</h1>
          <p>Consulta y valida los dominios y teléfonos oficiales de instituciones financieras, gubernamentales y de mensajería.</p>
        </div>
        <div className="card cifras-verif">
          <div><strong>100%</strong><span>Fuentes oficiales</span></div>
          <div><strong>{INSTITUCIONES.length}</strong><span>Instituciones</span></div>
          <div><strong>24/7</strong><span>Consulta</span></div>
        </div>
      </div>

      <div className="card barra-filtros">
        <label className="buscador">
          <LuSearch />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por institución, banco, dominio o teléfono…" />
        </label>
        <div className="chips">
          {TIPOS.map((t) => (
            <button key={t.id} type="button" className={`chip ${tipo === t.id ? 'activo' : ''}`} onClick={() => setTipo(t.id)}>{t.texto}</button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        {filtradas.map((i) => (
          <article key={i.id} className="card institucion">
            <div className="institucion-cabecera">
              <span className="sigla">{i.sigla}</span>
              <span className="badge"><LuCircleCheck /> Oficial</span>
            </div>
            <div>
              <h3>{i.nombre}</h3>
              <p className="muted institucion-desc">{i.descripcion}</p>
            </div>
            <dl className="datos">
              <div><dt>Dominio</dt><dd className="mono">{i.ruta || i.dominio}</dd></div>
              <div><dt>Teléfono</dt><dd className="mono">{i.telefono}</dd></div>
            </dl>
            <button type="button" className="btn btn-lime btn-block" onClick={() => abrir(i)}>
              <LuShieldCheck /> Verificar URL
            </button>
          </article>
        ))}
      </div>
      {filtradas.length === 0 && <p className="muted" style={{ textAlign: 'center' }}>No encontramos esa institución.</p>}

      <section className="seccion-guia">
        <span className="eyebrow">Educación preventiva</span>
        <h2>Guía de seguridad: cómo distinguir sitios falsos de portales legítimos</h2>
        <p className="muted">Los estafadores usan versiones casi idénticas de las direcciones oficiales (typosquatting). Aprende a identificarlas.</p>
        <div className="grid-3">
          {GUIA.map(({ Icono, titulo, texto, pie }) => (
            <article key={titulo} className="card guia">
              <span className="icono-caja"><Icono /></span>
              <h3>{titulo}</h3>
              <p className="muted">{texto}</p>
              <span className="guia-pie"><LuShieldCheck /> {pie}</span>
            </article>
          ))}
        </div>
      </section>

      {seleccion && (
        <div className="modal-fondo" onClick={() => setSeleccion(null)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={verificar} role="dialog" aria-modal="true">
            <button type="button" className="modal-cerrar" onClick={() => setSeleccion(null)} aria-label="Cerrar"><LuX /></button>
            <h3>Verificar un enlace de {seleccion.nombre}</h3>
            <p className="muted">Pega el enlace que recibiste. Lo comparamos con el dominio oficial <span className="mono lima-texto">{seleccion.ruta || seleccion.dominio}</span>. No abrimos el enlace.</p>
            <input className="campo mono" value={enlace} onChange={(e) => { setEnlace(e.target.value); setResultado(null); }} placeholder={`https://…`} autoFocus />
            <button type="submit" className="btn btn-lime" disabled={!enlace.trim()}>Comprobar</button>
            {resultado && (
              <div className={`veredicto veredicto-${resultado.estado}`}>
                {resultado.estado === 'oficial' ? <LuShieldCheck /> : <LuShieldAlert />}
                <div>
                  <strong>{resultado.estado === 'oficial' ? 'Dominio oficial' : resultado.estado === 'invalido' ? 'Enlace inválido' : 'No es el dominio oficial'}</strong>
                  <p>{resultado.mensaje}</p>
                  {resultado.avisos?.map((a) => <p key={a} className="veredicto-aviso">⚠️ {a}</p>)}
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
