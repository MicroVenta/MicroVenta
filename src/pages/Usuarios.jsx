import { useState, useEffect } from 'react';
import { supabase } from '../conexion';
import Sidebar from '../components/sidebar';
import '/usuarios.css';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estados del Formulario Nuevo Usuario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [idRol, setIdRol] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    const { data, error } = await supabase
      .from('usuario')
      .select('*, rol(nombre_rol)');
    if (!error && data) setUsuarios(data);
  };

  const cargarRoles = async () => {
    const { data } = await supabase.from('rol').select('*');
    if (data) setRoles(data);
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('usuario').insert([
      { nombre_completo: nombre, correo, contrasena, id_rol: idRol }
    ]);
    
    if (!error) {
      setModalAbierto(false);
      cargarUsuarios(); // Recargar la tabla
      // Limpiar formulario
      setNombre(''); setCorreo(''); setContrasena(''); setIdRol('');
    } else {
      alert("Error al guardar usuario");
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="dashboard">
      <Sidebar paginaActual="usuarios" />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Catálogo de usuarios</h1>
            <p>Administra los registros de la tabla Usuario.</p>
          </div>
          <div className="topbar-actions">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar usuario..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => setModalAbierto(true)}>
              + Nuevo usuario
            </button>
          </div>
        </header>

        <section className="card table-card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((user) => (
                  <tr key={user.id_usuario}>
                    <td>{user.nombre_completo}</td>
                    <td>{user.correo}</td>
                    <td><span className="badge-role">{user.rol?.nombre_rol}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn-edit">Editar</button>
                        <button className="btn-delete">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay usuarios para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {modalAbierto && (
        <div className="modal">
          <div className="modal-backdrop" onClick={() => setModalAbierto(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nuevo usuario</h2>
              <button className="btn-icon" onClick={() => setModalAbierto(false)}>✕</button>
            </div>

            <form onSubmit={handleGuardarUsuario} className="modal-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="nombre_completo">Nombre completo</label>
                  <input type="text" id="nombre_completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="correo_nuevo">Correo</label>
                  <input type="email" id="correo_nuevo" value={correo} onChange={e => setCorreo(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="contrasena_nueva">Contraseña</label>
                  <input type="password" id="contrasena_nueva" value={contrasena} onChange={e => setContrasena(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="id_rol">Rol</label>
                  <select id="id_rol" value={idRol} onChange={e => setIdRol(e.target.value)} required>
                    <option value="">Selecciona un rol</option>
                    {roles.map(rol => (
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre_rol}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}