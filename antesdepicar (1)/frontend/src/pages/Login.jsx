// Pantalla de inicio de sesión y registro (responsable: Daniela)
import { useState } from 'react';
import { LuLock, LuMail, LuUser, LuShieldCheck, LuEye, LuBrainCircuit } from 'react-icons/lu';
import { Logo } from '../components/Navbar.jsx';
import { entrarComoInvitado, iniciarSesion, registrar } from '../services/auth.js';
import './Login.css';

export default function Login({ onEntrar }) {
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'registro'
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const esRegistro = modo === 'registro';

  function enviar(e) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(correo)) return setError('Escribe un correo válido.');
    if (contrasena.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (esRegistro && nombre.trim().length < 2) return setError('Escribe tu nombre.');
    try {
      const sesion = esRegistro
        ? registrar({ nombre, correo, contrasena })
        : iniciarSesion({ correo, contrasena });
      onEntrar(sesion);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login">
      <section className="login-marca">
        <Logo />
        <div>
          <span className="badge"><span className="punto" /> IA de pesos abiertos</span>
          <h1>
            Antes de hacer clic, <span className="lima">piensa y verifica.</span>
          </h1>
          <p className="muted">
            Analiza mensajes de WhatsApp, SMS, correos y ofertas de empleo. Te explicamos cada señal de riesgo y cómo
            verificar de forma segura.
          </p>
        </div>
        <ul className="login-ventajas">
          <li><LuBrainCircuit /> Análisis con IA abierta (Qwen) en nuestro propio servidor</li>
          <li><LuEye /> Frases sospechosas resaltadas y explicadas</li>
          <li><LuShieldCheck /> Directorio de canales oficiales para verificar</li>
        </ul>
      </section>

      <section className="login-formulario">
        <form className="card login-card" onSubmit={enviar} noValidate>
          <div>
            <h2>{esRegistro ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
            <p className="muted">
              {esRegistro ? 'Guarda tu historial de análisis.' : 'Inicia sesión para continuar.'}
            </p>
          </div>

          {esRegistro && (
            <label className="login-campo">
              <span>Nombre</span>
              <div className="con-icono">
                <LuUser />
                <input className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
              </div>
            </label>
          )}

          <label className="login-campo">
            <span>Correo electrónico</span>
            <div className="con-icono">
              <LuMail />
              <input className="campo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tucorreo@ejemplo.com" autoComplete="email" />
            </div>
          </label>

          <label className="login-campo">
            <span>Contraseña</span>
            <div className="con-icono">
              <LuLock />
              <input className="campo" type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete={esRegistro ? 'new-password' : 'current-password'} />
            </div>
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-lime btn-block">
            {esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>

          <div className="separador"><span>o</span></div>

          <button type="button" className="btn btn-outline btn-block" onClick={() => onEntrar(entrarComoInvitado())}>
            Continuar como invitado
          </button>

          <p className="login-cambio">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button type="button" onClick={() => { setModo(esRegistro ? 'entrar' : 'registro'); setError(''); }}>
              {esRegistro ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
