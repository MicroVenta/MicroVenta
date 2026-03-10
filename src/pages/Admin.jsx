import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import '/usuarios.css';
import '/admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const [nombreAdmin, setNombreAdmin] = useState('Cargando...');

  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem('microventa_usuario') || localStorage.getItem('microventa_usuario');
    
    if (!usuarioGuardado) {
      navigate('/login');
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    if (usuario.nombre_rol !== 'Administrador') {
      navigate('/login');
      return;
    }

    setNombreAdmin(usuario.nombre_completo);
  }, [navigate]);

  const handleCerrarSesion = () => {
    sessionStorage.removeItem('microventa_usuario');
    localStorage.removeItem('microventa_usuario');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <Sidebar paginaActual="admin" />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Panel de administración</h1>
            <p>Gestiona el sistema MicroVenta de Dulce Mordisco.</p>
          </div>
          <div className="topbar-actions">
            <span className="admin-user">{nombreAdmin}</span>
            <button onClick={handleCerrarSesion} className="btn btn-secondary">Cerrar sesión</button>
          </div>
        </header>

        <section className="hero-banner">
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-badge">
                <img src="/grafico/MicroVentaTransparente_Horizontal.png" alt="MicroVenta" />
              </div>
              <h2>Gestiona Dulce Mordisco de forma sencilla y organizada.</h2>
              <p>Accede rápidamente a los módulos principales del sistema para administrar usuarios, productos, inventario, pedidos y reportes desde un solo lugar.</p>
            </div>
          </div>
        </section>

        <section className="card modules-card">
          <div className="section-header">
            <div>
              <h2>Módulos del sistema</h2>
              <p>Selecciona el área que deseas administrar.</p>
            </div>
          </div>

          <div className="modules-grid">
            <Link to="/usuarios" className="module-card">
              <div className="module-icon">👤</div>
              <h4>Usuarios</h4>
              <p>Consulta, registra, edita y elimina usuarios del sistema.</p>
            </Link>

            <div className="module-card" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
              <div className="module-icon">🧁</div>
              <h4>Productos</h4>
              <p>Administra el catálogo de productos de Dulce Mordisco.</p>
            </div>

            <div className="module-card" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
              <div className="module-icon">📦</div>
              <h4>Inventario</h4>
              <p>Controla stock, existencias y movimientos de productos.</p>
            </div>

            <div className="module-card" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
              <div className="module-icon">🛒</div>
              <h4>Pedidos</h4>
              <p>Supervisa pedidos, estatus y seguimiento de entregas.</p>
            </div>

            <div className="module-card" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
              <div className="module-icon">📊</div>
              <h4>Reportes</h4>
              <p>Consulta información general y desempeño del negocio.</p>
            </div>

            <Link to="/usuarios" className="module-card module-card-highlight">
              <div className="module-icon">⚡</div>
              <h4>Acceso rápido</h4>
              <p>Ir directamente al catálogo de usuarios.</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}