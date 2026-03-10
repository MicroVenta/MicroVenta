import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Table, Container, Spinner, Alert } from 'react-bootstrap';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]); // Estado para guardar la lista
  const [loading, setLoading] = useState(true); // Estado para mostrar que está cargando
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategorias();
  }, []); // Se ejecuta una sola vez al cargar la página

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      // Hacemos la consulta a Supabase
      const { data, error } = await supabase
        .from('categoria') // Nombre de tu tabla en Supabase
        .select('*');      // Traer todas las columnas

      if (error) throw error;
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="m-5" />;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <Container className="mt-4">
      <h2>Categorias de Micro Venta</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id_categoria}>
              <td>{categoria.id_categoria}</td>
              <td>{categoria.nombre_categoria}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Categorias;