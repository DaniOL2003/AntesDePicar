// Pantalla de inicio de sesión y registro (responsable: Daniela)
import { useState } from 'react';
import { LuLock, LuMail, LuUser, LuEye, LuEyeOff, LuDatabase, LuCpu } from 'react-icons/lu';
import { FaGoogle, FaGithub } from 'react-icons/fa6';
import { entrarComoInvitado, iniciarSesion, registrar } from '../services/auth.js';
import './Login.css';

function LogoAntesDePicar() {
  // Logo oficial del equipo: frontend/public/logo.png
  return <img className="login-logo login-logo-img" src="/logo.png" alt="AntesDePicar: piensa antes de hacer clic, verifica antes de confiar" />;
}

function Escudo() {
  return (
    <svg className="login-escudo" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <path d="M12 2 L20 5 V11 C20 16.5 16.6 20.2 12 22 C7.4 20.2 4 16.5 4 11 V5 Z" />
      <path d="M8.5 12 L11 14.5 L15.5 9.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Login({ onEntrar }) {
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'registro'
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);

  const esRegistro = modo === 'registro';

  async function enviar(e) {
    e.preventDefault();
    if (cargando) return;
    setError('');
    setAviso('');
    if (esRegistro && nombre.trim().length < 2) return setError('Escribe tu nombre.');
    if (!/^\S+@\S+\.\S+$/.test(correo)) return setError('Escribe un correo válido.');
    if (contrasena.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    setCargando(true);
    try {
      const sesion = esRegistro
        ? await registrar({ nombre, correo, contrasena }, recordar)
        : await iniciarSesion({ correo, contrasena }, recordar);
      onEntrar(sesion);
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  }

  function cambiarModo() {
    setModo(esRegistro ? 'entrar' : 'registro');
    setError('');
    setAviso('');
  }

  return (
    <div className="login">
      <div className="login-columna">
        <div className="login-barra">
          <span className="login-nodo"><span className="punto" /> ANTESDEPICAR</span>
          <span className="login-etiqueta"><LuCpu /> IA ABIERTA · QWEN 2.5</span>
        </div>

        <div className="login-marca">
          <LogoAntesDePicar />
          <span className="login-estado"><span className="punto" /> PROTECCIÓN ACTIVA</span>
          <p className="login-lema">Antes de hacer clic, <strong>piensa y verifica.</strong></p>
        </div>

        <form className="card login-card" onSubmit={enviar} noValidate>
          <div className="login-titulo">
            <div>
              <h1>{esRegistro ? 'Crea tu cuenta' : 'Bienvenido'}</h1>
              <p>{esRegistro ? 'Tu historial se guardará en nuestra base de datos.' : 'Inicia sesión para ver tu historial de análisis.'}</p>
            </div>
            <Escudo />
          </div>

          {esRegistro && (
            <label className="login-campo">
              <span className="login-etiqueta-campo">Nombre</span>
              <div className="con-icono">
                <LuUser />
                <input className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
              </div>
            </label>
          )}

          <label className="login-campo">
            <span className="login-etiqueta-campo">Correo electrónico</span>
            <div className="con-icono">
              <LuMail />
              <input className="campo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tucorreo@ejemplo.com" autoComplete="email" />
            </div>
          </label>

          <div className="login-campo">
            <div className="login-fila">
              <label htmlFor="contrasena" className="login-etiqueta-campo">Contraseña</label>
              {!esRegistro && (
                <button type="button" className="login-olvido" onClick={() => { setError(''); setAviso('La recuperación de contraseña estará disponible pronto. Por ahora puedes crear una cuenta nueva.'); }}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="con-icono">
              <LuLock />
              <input
                id="contrasena"
                className="campo"
                type={verContrasena ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={esRegistro ? 'new-password' : 'current-password'}
              />
              <button type="button" className="login-ver" onClick={() => setVerContrasena(!verContrasena)} aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {verContrasena ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>
          </div>

          <label className="login-recordar">
            <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
            Mantener la sesión iniciada en este dispositivo
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}
          {aviso && <p className="aviso-demo" role="status">{aviso}</p>}

          <button type="submit" className="btn btn-lime btn-block login-enviar" disabled={cargando}>
            {cargando ? 'Conectando…' : esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>

          <div className="separador"><span>O CONTINÚA CON</span></div>

          <div className="login-federado">
            <button type="button" className="btn login-opcion" disabled>
              <FaGoogle /> <span>Google<small>Próximamente</small></span>
            </button>
            <button type="button" className="btn login-opcion" disabled>
              <FaGithub /> <span>GitHub<small>Próximamente</small></span>
            </button>
          </div>

          <button type="button" className="btn btn-block login-opcion" onClick={() => onEntrar(entrarComoInvitado())}>
            Continuar como invitado
          </button>

          <p className="login-cambio">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button type="button" onClick={cambiarModo}>{esRegistro ? 'Inicia sesión' : 'Regístrate'}</button>
          </p>
        </form>

        <div className="card login-info">
          <span className="login-info-icono"><LuDatabase /></span>
          <div>
            <strong>Tus datos, en nuestro servidor</strong>
            <span>Qwen corre localmente con Ollama y tu historial se guarda en SQLite con contraseña cifrada.</span>
          </div>
          <span className="login-info-sello"><span className="punto" /> LOCAL</span>
        </div>

        <footer className="login-pie">
          <span>© 2026 AntesDePicar</span>
          <span aria-hidden="true">·</span>
          <span>Proyecto open source</span>
          <span aria-hidden="true">·</span>
          <span className="login-pie-acento">Hacktoberfest Hack Day Oaxaca</span>
        </footer>
      </div>
    </div>
  );
}
