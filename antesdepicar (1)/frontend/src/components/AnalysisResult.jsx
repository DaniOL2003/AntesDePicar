// Resultado del análisis (responsable: Kelly)
import { LuShieldAlert, LuShieldCheck, LuTriangleAlert, LuRotateCcw } from 'react-icons/lu';
import RiskSignal from './RiskSignal.jsx';
import './AnalysisResult.css';

// Lenguaje prudente: describimos señales, no damos certezas.
const NIVELES = {
  bajo: { titulo: 'Pocas señales de riesgo', texto: 'No encontramos señales claras de estafa, pero mantente atento.', Icono: LuShieldCheck, paso: 1 },
  medio: { titulo: 'Señales de alerta', texto: 'Hay elementos sospechosos. Verifica antes de responder o pagar.', Icono: LuTriangleAlert, paso: 2 },
  alto: { titulo: 'Muchas señales de estafa', texto: 'Tiene rasgos típicos de fraude. No hagas clic ni compartas datos.', Icono: LuShieldAlert, paso: 3 },
};

// Python cuenta caracteres por "code point"; Array.from hace lo mismo en JS (importante con emojis).
function fragmentar(mensaje, senales) {
  const letras = Array.from(mensaje);
  const marcas = senales
    .map((s, i) => ({ ...s, numero: i + 1 }))
    .filter((s) => s.verificada && s.inicio != null && s.fin != null)
    .sort((a, b) => a.inicio - b.inicio);
  const fragmentos = [];
  let cursor = 0;
  for (const m of marcas) {
    if (m.inicio < cursor) continue;
    if (m.inicio > cursor) fragmentos.push({ texto: letras.slice(cursor, m.inicio).join('') });
    fragmentos.push({ texto: letras.slice(m.inicio, m.fin).join(''), numero: m.numero, titulo: m.titulo });
    cursor = m.fin;
  }
  if (cursor < letras.length) fragmentos.push({ texto: letras.slice(cursor).join('') });
  return fragmentos;
}

export default function AnalysisResult({ resultado, onNuevo }) {
  const nivel = NIVELES[resultado.nivel_riesgo] || NIVELES.medio;
  const fragmentos = fragmentar(resultado.mensaje, resultado.senales);
  const { Icono } = nivel;

  return (
    <section className={`resultado nivel-${resultado.nivel_riesgo}`} aria-live="polite">
      {resultado.demo && <p className="aviso-demo">⚠️ {resultado.aviso}</p>}

      <div className="card resultado-cabecera">
        <div className="resultado-veredicto">
          <span className="resultado-icono"><Icono /></span>
          <div>
            <h2>{nivel.titulo}</h2>
            <p className="muted">{resultado.tipo_posible}</p>
          </div>
          <div className="medidor" aria-label={`Nivel: ${nivel.titulo}`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className={`medidor-barra ${n <= nivel.paso ? 'activa' : ''}`} />
            ))}
          </div>
        </div>
        <p className="resultado-texto">{nivel.texto}</p>
        {resultado.resumen && <p className="resultado-resumen">{resultado.resumen}</p>}
      </div>

      <div className="resultado-columnas">
        <div className="card">
          <h3>Tu mensaje, con las frases sospechosas marcadas</h3>
          <p className="mensaje-resaltado">
            {fragmentos.map((f, i) =>
              f.numero ? (
                <mark key={i} title={f.titulo}>
                  {f.texto}
                  <sup>{f.numero}</sup>
                </mark>
              ) : (
                <span key={i}>{f.texto}</span>
              )
            )}
          </p>
        </div>

        <div className="card">
          <h3>Señales de riesgo ({resultado.senales.length})</h3>
          {resultado.senales.length === 0 ? (
            <p className="muted">No se detectaron señales de riesgo específicas.</p>
          ) : (
            <ol className="senales">
              {resultado.senales.map((s, i) => (
                <RiskSignal key={i} senal={s} numero={i + 1} />
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="card recomendaciones">
        <h3>Qué te recomendamos hacer</h3>
        <ul>
          {resultado.recomendaciones.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {!resultado.demo && (
        <p className="aviso-final">
          {resultado.aviso} <span className="modelo mono">Modelo: {resultado.modelo}</span>
        </p>
      )}

      <button type="button" className="btn btn-outline" style={{ justifySelf: 'center' }} onClick={onNuevo}>
        <LuRotateCcw /> Analizar otro mensaje
      </button>
    </section>
  );
}
