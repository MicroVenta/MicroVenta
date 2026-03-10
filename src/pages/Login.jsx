import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../conexion'; // Asegúrate de tener exportada tu db como 'supabase' aquí
import '/style.css'; // Tu archivo CSS original

export default function Login() {
  const navigate = useNavigate();

  // Estados para Login
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [mensajeLogin, setMensajeLogin] = useState({ tipo: '', texto: '' });

  // Estados para Modales
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalRecuperarAbierto, setModalRecuperarAbierto] = useState(false);

  // Estados para Registro
  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [mensajeReg, setMensajeReg] = useState({ tipo: '', texto: '' });

  // Estados para Recuperar
  const [recCorreo, setRecCorreo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensajeRec, setMensajeRec] = useState({ tipo: '', texto: '' });

  // --- LÓGICA DE INICIO DE SESIÓN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setMensajeLogin({ tipo: '', texto: '' });

    if (!correo || !password) {
      setMensajeLogin({ tipo: 'error', texto: 'Por favor, completa todos los campos.' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('usuario')
        .select(`id_usuario, nombre_completo, correo, contrasena, id_rol, rol (id_rol, nombre_rol)`)
        .eq('correo', correo)
        .single();

      if (error || !data || data.contrasena !== password) {
        setMensajeLogin({ tipo: 'error', texto: 'Correo o contraseña incorrectos.' });
        return;
      }

      const sesionUsuario = {
        id_usuario: data.id_usuario,
        nombre_completo: data.nombre_completo,
        correo: data.correo,
        id_rol: data.id_rol,
        nombre_rol: data.rol?.nombre_rol ?? 'Sin rol'
      };

      if (recordarme) {
        localStorage.setItem('microventa_usuario', JSON.stringify(sesionUsuario));
      } else {
        sessionStorage.setItem('microventa_usuario', JSON.stringify(sesionUsuario));
      }

      setMensajeLogin({ tipo: 'success', texto: 'Inicio de sesión correcto.' });

      setTimeout(() => {
        if (sesionUsuario.nombre_rol === 'Administrador') {
          navigate('/admin');
        } else {
          navigate('/usuarios'); // O la ruta que decidas para 'index.html'
        }
      }, 900);
    } catch (err) {
      setMensajeLogin({ tipo: 'error', texto: 'No se pudo conectar con la base de datos.' });
    }
  };

  // --- LÓGICA DE REGISTRO ---
  const handleRegistro = async (e) => {
    e.preventDefault();
    setMensajeReg({ tipo: '', texto: '' });

    if (!regNombre || !regCorreo || !regPassword || !regPassword2) {
      setMensajeReg({ tipo: 'error', texto: 'Completa todos los campos.' });
      return;
    }

    if (regPassword !== regPassword2) {
      setMensajeReg({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
      return;
    }

    try {
      const { data: rolCliente } = await supabase.from('rol').select('id_rol').eq('nombre_rol', 'Cliente').single();
      const { data: usuarioExistente } = await supabase.from('usuario').select('id_usuario').eq('correo', regCorreo).maybeSingle();

      if (usuarioExistente) {
        setMensajeReg({ tipo: 'error', texto: 'Ese correo ya está registrado.' });
        return;
      }

      const { error: errorInsert } = await supabase.from('usuario').insert({
        nombre_completo: regNombre,
        correo: regCorreo,
        contrasena: regPassword,
        id_rol: rolCliente?.id_rol
      });

      if (errorInsert) throw errorInsert;

      setMensajeReg({ tipo: 'success', texto: 'Cuenta creada correctamente.' });
      setTimeout(() => {
        setModalRegistroAbierto(false);
        setCorreo(regCorreo);
        setPassword('');
      }, 1200);
    } catch (err) {
      setMensajeReg({ tipo: 'error', texto: 'Ocurrió un error al registrar.' });
    }
  };

  // --- LÓGICA DE RECUPERAR CONTRASEÑA ---
  const handleRecuperar = async (e) => {
    e.preventDefault();
    setMensajeRec({ tipo: '', texto: '' });

    if (nuevaPassword !== confirmarPassword) {
      setMensajeRec({ tipo: 'error', texto: 'Las contraseñas no coinciden.' });
      return;
    }

    const { data, error } = await supabase
      .from('usuario')
      .update({ contrasena: nuevaPassword })
      .eq('correo', recCorreo)
      .select();

    if (error || !data || data.length === 0) {
      setMensajeRec({ tipo: 'error', texto: 'No existe una cuenta con ese correo.' });
      return;
    }

    setMensajeRec({ tipo: 'success', texto: 'Contraseña actualizada correctamente.' });
    setTimeout(() => setModalRecuperarAbierto(false), 1500);
  };

  return (
    <div className="container">
      <section className="left-panel">
        <div className="brand">
          <div className="brand-main">
            <img src="/Logo_DM.png" alt="Logo Dulce Mordisco" className="logo-main" />
            <div className="brand-text">
              <h1>Dulce Mordisco</h1>
              <p>Postres, panadería y más</p>
            </div>
          </div>
        </div>
        <div className="welcome">
          <h3>Inicia sesión y descubre el sabor en cada Dulce Mordisco.</h3>
        </div>
        <div className="features">
          <div className="feature">🧁 Consulta el catálogo</div>
          <div className="feature">🥐 Haz tus pedidos</div>
          <div className="feature">📦 Checa tus pedidos</div>
        </div>
        <div className="microventa-logo">
          <img src="/MicroVentaTransparente_Horizontal.png" alt="MicroVenta" />
        </div>
      </section>

      <section className="right-panel">
        <div className="login-card">
          <h3>Iniciar sesión</h3>
          <p className="subtitle">Ingresa tus datos para acceder al sistema de Dulce Mordisco.</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="correo">Correo</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input type="email" id="correo" className="form-control" placeholder="Ingresa tu correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type="password" id="password" className="form-control" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox">
                <input type="checkbox" checked={recordarme} onChange={(e) => setRecordarme(e.target.checked)} />
                <span>Recordarme</span>
              </label>
              <button type="button" className="link" onClick={() => setModalRecuperarAbierto(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</button>
            </div>

            <button type="submit" className="btn-login">Entrar al sistema</button>

            {mensajeLogin.texto && <div className={`message ${mensajeLogin.tipo}`}>{mensajeLogin.texto}</div>}

            <div className="register-box">
              <p>¿No tienes cuenta? <button type="button" className="link" onClick={() => setModalRegistroAbierto(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Crear cuenta</button></p>
            </div>
            <div className="footer-note">
              <p>Sistema MicroVenta&copy; para Dulce Mordisco.</p>
            </div>
          </form>
        </div>
      </section>

      {modalRegistroAbierto && (
        <div className="modal">
          <div className="modal-backdrop" onClick={() => setModalRegistroAbierto(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear cuenta</h2>
              <button className="btn-icon" onClick={() => setModalRegistroAbierto(false)}>✕</button>
            </div>
            <form onSubmit={handleRegistro} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="regNombre">Nombre completo</label>
                  <input type="text" id="regNombre" className="form-control" value={regNombre} onChange={(e) => setRegNombre(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="regCorreo">Correo</label>
                  <input type="email" id="regCorreo" className="form-control" value={regCorreo} onChange={(e) => setRegCorreo(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="regPassword">Contraseña</label>
                  <input type="password" id="regPassword" className="form-control" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="regPassword2">Confirmar contraseña</label>
                  <input type="password" id="regPassword2" className="form-control" value={regPassword2} onChange={(e) => setRegPassword2(e.target.value)} required />
                </div>
              </div>
              {mensajeReg.texto && <div className={`message ${mensajeReg.tipo}`}>{mensajeReg.texto}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalRegistroAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalRecuperarAbierto && (
        <div className="modal">
          <div className="modal-backdrop" onClick={() => setModalRecuperarAbierto(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Recuperar contraseña</h2>
              <button className="btn-icon" onClick={() => setModalRecuperarAbierto(false)}>✕</button>
            </div>
            <form onSubmit={handleRecuperar} className="modal-form">
              <div className="form-group full-width">
                <label htmlFor="recCorreo">Correo registrado</label>
                <input type="email" id="recCorreo" className="form-control" value={recCorreo} onChange={(e) => setRecCorreo(e.target.value)} required />
              </div>
              <div className="form-group full-width">
                <label htmlFor="nuevaPassword">Nueva contraseña</label>
                <input type="password" id="nuevaPassword" className="form-control" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required />
              </div>
              <div className="form-group full-width">
                <label htmlFor="confirmarPassword">Confirmar contraseña</label>
                <input type="password" id="confirmarPassword" className="form-control" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} required />
              </div>
              {mensajeRec.texto && <div className={`message ${mensajeRec.tipo}`}>{mensajeRec.texto}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalRecuperarAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Actualizar contraseña</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}