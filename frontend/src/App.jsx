// Componente principal: decide si mostrar el login o la app (responsable: Daniela)
import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Login from './pages/Login.jsx';
import Analizador from './pages/Analizador.jsx';
import Feed from './pages/Feed.jsx';
import Verificacion from './pages/Verificacion.jsx';
import Historial from './pages/Historial.jsx';
import { cerrarSesion, obtenerSesion } from './services/auth.js';

const PAGINAS = {
  analizador: Analizador,
  feed: Feed,
  verificacion: Verificacion,
  historial: Historial,
};

export default function App() {
  // Sesiones de la versión anterior (sin token) piden iniciar sesión de nuevo.
  const [sesion, setSesion] = useState(() => {
    const s = obtenerSesion();
    return s && (s.token || s.invitado) ? s : null;
  });
  const [pagina, setPagina] = useState('analizador');

  if (!sesion) return <Login onEntrar={setSesion} />;

  function irA(nueva) {
    setPagina(nueva);
    window.scrollTo({ top: 0 });
  }

  function salir() {
    cerrarSesion(); // avisa al backend en segundo plano
    setSesion(null);
    setPagina('analizador');
  }

  const Pagina = PAGINAS[pagina];

  return (
    <>
      <Navbar pagina={pagina} onCambiar={irA} sesion={sesion} onSalir={salir} />
      <main className="contenedor">
        <Pagina irA={irA} />
      </main>
      <Footer />
    </>
  );
}
