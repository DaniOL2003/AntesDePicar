// Barra de navegación (responsable: Daniela)
import { useState } from 'react';
import { LuShieldCheck, LuLogOut } from 'react-icons/lu';
import './Navbar.css';

const PESTANAS = [
  { id: 'analizador', texto: 'Analizador de Mensajes' },
  { id: 'feed', texto: 'Feed de Alertas Comunitarias' },
  { id: 'verificacion', texto: 'Centro de Verificación' },
  { id: 'historial', texto: 'Historial y Privacidad' },
];

export function Logo() {
  return (
    <div className="logo">
      <LuShieldCheck className="logo-icono" />
      <span>AntesDePicar</span>
    </div>
  );
}

export default function Navbar({ pagina, onCambiar, sesion, onSalir }) {
  const [menu, setMenu] = useState(false);
  const inicial = (sesion?.nombre || 'U').charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <div className="contenedor navbar-fila">
        <button type="button" className="logo-boton" onClick={() => onCambiar('analizador')}>
          <Logo />
        </button>

        <nav className="pestanas" aria-label="Secciones">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pestana ${pagina === p.id ? 'activa' : ''}`}
              aria-current={pagina === p.id ? 'page' : undefined}
              onClick={() => onCambiar(p.id)}
            >
              {p.texto}
            </button>
          ))}
        </nav>

        <div className="navbar-derecha">
          <span className="proteccion">
            <span className="punto" /> Protección Activa
          </span>
          <div className="usuario">
            <button type="button" className="avatar" onClick={() => setMenu(!menu)} aria-label="Menú de usuario">
              {inicial}
            </button>
            {menu && (
              <div className="menu-usuario card" onMouseLeave={() => setMenu(false)}>
                <strong>{sesion?.nombre}</strong>
                {sesion?.correo && <span className="muted">{sesion.correo}</span>}
                <button type="button" className="btn btn-outline btn-sm" onClick={onSalir}>
                  <LuLogOut /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
