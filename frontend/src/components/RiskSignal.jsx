// Tarjeta de una señal de riesgo (responsable: Kelly)
export default function RiskSignal({ senal, numero }) {
  return (
    <li className="senal">
      <span className="senal-numero" aria-hidden="true">{numero}</span>
      <div>
        <h4>{senal.titulo}</h4>
        <p>{senal.explicacion}</p>
        {senal.evidencia &&
          (senal.verificada ? (
            <blockquote className="senal-evidencia">“{senal.evidencia}”</blockquote>
          ) : (
            <p className="senal-no-verificada">
              La IA citó «{senal.evidencia}», pero esa frase no aparece tal cual en el mensaje. Tómala con cautela.
            </p>
          ))}
      </div>
    </li>
  );
}
