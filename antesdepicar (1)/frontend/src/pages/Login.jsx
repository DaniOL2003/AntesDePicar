// Pantalla de inicio de sesión y registro (responsable: Daniela)
import { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import {
  LuArrowRight, LuAtSign, LuBrainCircuit, LuEye, LuEyeOff, LuLock,
  LuMonitorCheck, LuShield, LuShieldCheck, LuUser,
} from 'react-icons/lu';
import logo from '../assets/logo-antesdepicar.png';
import { entrarComoInvitado, iniciarSesion, registrar } from '../services/auth.js';
import './Login.css';

export default function Login({ onEntrar }) {
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'registro'
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const esRegistro = modo === 'registro';

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(correo)) return setError('Escribe un correo válido.');
    if (!contrasena) return setError('Escribe tu contraseña.');
    if (esRegistro && contrasena.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (esRegistro && nombre.trim().length < 2) return setError('Escribe tu nombre.');
    setEnviando(true);
    try {
      const sesion = await (esRegistro
        ? registrar({ nombre, correo, contrasena, recordar })
        : iniciarSesion({ correo, contrasena, recordar }));
      onEntrar(sesion);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <div className="login-columna">
        <header className="login-barra">
          <span className="login-nodo"><span className="punto" /> AntesDePicar // AUTH-NODE</span>
          <span className="login-etiqueta"><LuLock /> PROTOTIPO</span>
        </header>

        <div className="login-marca">
          <img className="login-logo" src={logo} alt="AntesDePicar" width="138" height="138" />
          <span className="login-estado"><span className="punto" /> ANÁLISIS ANTI-PHISHING CON IA ABIERTA</span>
          <p className="login-lema"><strong>Piensa antes de hacer clic.</strong> Verifica antes de confiar.</p>
        </div>

        <form className="card login-card" onSubmit={enviar} noValidate>
          <div className="login-titulo">
            <div>
              <h1>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
              <p>
                {esRegistro
                  ? 'Regístrate para acceder a tu panel de protección y análisis de mensajes.'
                  : 'Accede a tu panel de protección y análisis de mensajes.'}
              </p>
            </div>
            <LuShieldCheck className="login-escudo" aria-hidden="true" />
          </div>

          {esRegistro && (
            <div className="login-campo">
              <label className="login-etiqueta-campo" htmlFor="login-nombre">Nombre</label>
              <div className="con-icono">
                <LuUser />
                <input id="login-nombre" className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
              </div>
            </div>
          )}

          <div className="login-campo">
            <div className="login-fila">
              <label className="login-etiqueta-campo" htmlFor="login-correo">Correo corporativo o personal</label>
              <span className="login-etiqueta">REQUERIDO</span>
            </div>
            <div className="con-icono">
              <LuAtSign />
              <input id="login-correo" className="campo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="ejemplo@empresa.com" autoComplete="email" />
            </div>
          </div>

          <div className="login-campo">
            <div className="login-fila">
              <label className="login-etiqueta-campo" htmlFor="login-contrasena">Contraseña</label>
              {!esRegistro && (
                <button type="button" className="login-olvido" onClick={() => setError('La recuperación de contraseña todavía no está disponible en este prototipo.')}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="con-icono">
              <LuLock />
              <input id="login-contrasena" className="campo" type={verContrasena ? 'text' : 'password'} value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder={esRegistro ? 'Mínimo 8 caracteres' : 'Tu contraseña'} autoComplete={esRegistro ? 'new-password' : 'current-password'} />
              <button type="button" className="login-ver" onClick={() => setVerContrasena(!verContrasena)} aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={verContrasena}>
                {verContrasena ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>
          </div>

          <div className="login-fila">
            <label className="login-recordar">
              <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
              Mantener sesión iniciada
            </label>
            <span className="login-etiqueta"><LuShield /> Hasta 30 días</span>
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-lime btn-block login-enviar" disabled={enviando}>
            {esRegistro ? 'Crear cuenta' : 'Iniciar sesión'} <LuArrowRight />
          </button>

          <div className="separador"><span>O CONTINÚA SIN CUENTA</span></div>

          <button type="button" className="btn btn-outline btn-block login-opcion" onClick={() => onEntrar(entrarComoInvitado())}>
            Continuar como invitado
          </button>

          <div className="login-federado">
            <button type="button" className="btn btn-outline login-opcion" disabled title="Próximamente">
              <FaGoogle /> <span>Google Workspace<small>Próximamente</small></span>
            </button>
            <button type="button" className="btn btn-outline login-opcion" disabled title="Próximamente">
              <LuMonitorCheck /> <span>SSO Corporativo<small>Próximamente</small></span>
            </button>
          </div>

          <p className="login-cambio">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿Aún no proteges tu organización?'}{' '}
            <button type="button" onClick={() => { setModo(esRegistro ? 'entrar' : 'registro'); setError(''); }}>
              {esRegistro ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </form>

        <section className="card login-info">
          <span className="login-info-icono"><LuBrainCircuit /></span>
          <div>
            <strong>Análisis con IA abierta</strong>
            <span>Señales de riesgo resaltadas y explicadas</span>
          </div>
          <span className="login-info-sello"><span className="punto" /> OPEN SOURCE</span>
        </section>

        <footer className="login-pie">
          <span>ID: AD-GATEWAY-09</span>
          <span aria-hidden="true">•</span>
          <span className="login-pie-acento">PROYECTO OPEN SOURCE · LICENCIA MIT</span>
        </footer>
      </div>
    </div>
  );
}
