import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importación de tus futuras páginas
// (Asegúrate de crear estos archivos en la carpeta /pages)
import Login from './pages/Login';
import Catalogo from './pages/Catalogo'; 
import Registro from './pages/Registro';
import Categorias from './pages/Categorias';
import Usuarios from './pages/Usuarios';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial: Redirige al Login por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rutas de Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        
        {/* Ruta del Catálogo (Micro Venta) */}
        <Route path="/catalogo" element={<Catalogo />} />
        
        {/* Ruta de categorías*/}
        <Route path="/Categorias" element={<Categorias />} />

        {/* Ruta del Panel de Usuarios (Micro Venta) */}
        <Route path="/Usuarios" element={<Usuarios />} />

        {/* Ruta del Administrador */}
        <Route path="/administrador" element={<Administrador />} />

        {/* Ruta para manejar errores 404 */}
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
        
      </Routes>
    </Router>
  );
}

export default App;