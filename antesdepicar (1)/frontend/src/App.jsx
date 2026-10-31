// Componente principal: decide si mostrar el login o la app (responsable: Daniela)
import { useEffect, useState } from 'react';
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
  const [sesion, setSesion] = useState(null);
  const [comprobando, setComprobando] = useState(true);
  const [pagina, setPagina] = useState('analizador');

  useEffect(() => {
    obtenerSesion().then(setSesion).finally(() => setComprobando(false));
  }, []);

  if (comprobando) return null;
  if (!sesion) return <Login onEntrar={setSesion} />;

  function irA(nueva) {
    setPagina(nueva);
    window.scrollTo({ top: 0 });
  }

  async function salir() {
    try {
      await cerrarSesion(sesion);
    } catch (err) {
      // Si no se pudo revocar, no aparentamos que la sesión se cerró.
      window.alert(`No se pudo cerrar la sesión. ${err.message}`);
      return;
    }
    setSesion(null);
    setPagina('analizador');
  }

  const Pagina = PAGINAS[pagina];

  return (
    <>
      <Navbar pagina={pagina} onCambiar={irA} sesion={sesion} onSalir={salir} />
      <main className="contenedor">
        <Pagina irA={irA} sesion={sesion} />
      </main>
      <Footer />
    </>
  );
}
