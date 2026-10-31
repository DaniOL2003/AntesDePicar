// Pie de página
export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 24 }}>
      <div
        className="contenedor"
        style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '20px', fontSize: '0.82rem', color: 'var(--muted)' }}
      >
        <span>© 2026 AntesDePicar · Inteligencia contra estafas digitales · Proyecto open source</span>
        <span style={{ display: 'flex', gap: 20 }}>
          <span>Privacidad</span>
          <span>Términos</span>
          <span>Contacto</span>
        </span>
      </div>
    </footer>
  );
}
