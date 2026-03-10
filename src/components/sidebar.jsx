import { Link } from 'react-router-dom';
import '/usuarios.css';

export default function Sidebar({ paginaActual }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/Logo_DM.png" alt="Dulce Mordisco" className="sidebar-logo" />
        <div>
          <h2>Dulce Mordisco</h2>
          <p>MicroVenta</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <Link 
          to="/admin" 
          className={`menu-item ${paginaActual === 'admin' ? 'active' : ''}`}
        >
          🏠 Home
        </Link>
        
        <Link 
          to="/usuarios" 
          className={`menu-item ${paginaActual === 'usuarios' ? 'active' : ''}`}
        >
          👤 Usuarios
        </Link>
        
        <Link to="#" className="menu-item">🧁 Productos</Link>
        <Link to="#" className="menu-item">📦 Inventario</Link>
        <Link to="#" className="menu-item">🛒 Pedidos</Link>
        <Link to="#" className="menu-item">📊 Reportes</Link>
      </nav>
    </aside>
  );
}