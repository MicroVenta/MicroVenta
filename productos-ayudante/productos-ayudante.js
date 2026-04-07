const nombreUsuario = document.getElementById('nombreUsuario');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

const productoForm = document.getElementById('productoForm');
const idProducto = document.getElementById('idProducto');
const nombreProducto = document.getElementById('nombreProducto');
const categoriaProducto = document.getElementById('categoriaProducto');
const precioProducto = document.getElementById('precioProducto');
const stockProducto = document.getElementById('stockProducto');
const stockMinimoProducto = document.getElementById('stockMinimoProducto');
const descripcionProducto = document.getElementById('descripcionProducto');
const imagenProducto = document.getElementById('imagenProducto');
const visibleProducto = document.getElementById('visibleProducto');
const mensajeFormulario = document.getElementById('mensajeFormulario');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
const btnGuardarProducto = document.getElementById('btnGuardarProducto');
const tituloFormulario = document.getElementById('tituloFormulario');
const subtituloFormulario = document.getElementById('subtituloFormulario');
const estadoSinSeleccion = document.getElementById('estadoSinSeleccion');
const contenedorFormularioEdicion = document.getElementById('contenedorFormularioEdicion');

const buscarProducto = document.getElementById('buscarProducto');
const filtroCategoria = document.getElementById('filtroCategoria');
const verOcultos = document.getElementById('verOcultos');

const totalProductos = document.getElementById('totalProductos');
const productosVisibles = document.getElementById('productosVisibles');
const productosOcultos = document.getElementById('productosOcultos');
const listaProductos = document.getElementById('listaProductos');
const resumenCatalogo = document.getElementById('resumenCatalogo');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let productosOriginales = [];
let categoriasOriginales = [];
let productoSeleccionadoId = null;

function normalizarRol(nombreRol) {
	return (nombreRol ?? '').toString().trim().toLowerCase();
}

function cerrarSesion() {
	sessionStorage.removeItem('microventa_usuario');
	localStorage.removeItem('microventa_usuario');
	window.location.href = '/login/login.html';
}

if (!usuarioGuardado) {
	window.location.href = '/login/login.html';
} else {
	try {
		usuario = JSON.parse(usuarioGuardado);
	} catch (error) {
		sessionStorage.removeItem('microventa_usuario');
		localStorage.removeItem('microventa_usuario');
		window.location.href = '/login/login.html';
	}
}

if (!usuario) {
	window.location.href = '/login/login.html';
}

if (normalizarRol(usuario.nombre_rol) !== 'ayudante') {
	window.location.href = '/login/login.html';
}

renderizarSidebar('productos-admin');

if (nombreUsuario) {
	nombreUsuario.textContent = usuario.nombre_completo || 'Ayudante';
}

if (btnCerrarSesion) {
	btnCerrarSesion.addEventListener('click', cerrarSesion);
}

function mostrarMensajeFormulario(tipo, texto) {
	mensajeFormulario.className = 'message';
	mensajeFormulario.textContent = '';

	if (tipo) {
		mensajeFormulario.classList.add(tipo);
		mensajeFormulario.textContent = texto;
	}
}

function limpiarMensajeFormulario() {
	mostrarMensajeFormulario('', '');
}

function mostrarFormularioEdicion() {
	estadoSinSeleccion.classList.add('hidden');
	contenedorFormularioEdicion.classList.remove('hidden');
}

function ocultarFormularioEdicion() {
	estadoSinSeleccion.classList.remove('hidden');
	contenedorFormularioEdicion.classList.add('hidden');
}

function limpiarFormulario() {
	productoForm.reset();
	idProducto.value = '';
	productoSeleccionadoId = null;
	visibleProducto.checked = true;
	tituloFormulario.textContent = 'Editar producto';
	subtituloFormulario.textContent = 'Selecciona un producto de la lista para modificarlo.';
	limpiarMensajeFormulario();
	ocultarFormularioEdicion();
	renderizarProductos(aplicarFiltrosInterno());
}

function activarModoEdicion(producto) {
	productoSeleccionadoId = Number(producto.id_producto);
	idProducto.value = producto.id_producto;
	nombreProducto.value = producto.nombre_producto ?? '';
	categoriaProducto.value = producto.id_categoria ?? '';
	precioProducto.value = producto.precio_unitario ?? '';
	stockProducto.value = producto.stock_actual ?? 0;
	stockMinimoProducto.value = producto.stock_minimo ?? 5;
	descripcionProducto.value = producto.descripcion_producto ?? '';
	imagenProducto.value = producto.imagen ?? '';
	visibleProducto.checked = Boolean(producto.visible);

	tituloFormulario.textContent = `Editar producto #${producto.id_producto}`;
	subtituloFormulario.textContent = 'Modifica la información del producto seleccionado.';
	limpiarMensajeFormulario();
	mostrarFormularioEdicion();
	renderizarProductos(aplicarFiltrosInterno());

	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
}

function obtenerImagenProducto(producto) {
	if (producto.imagen && producto.imagen.trim() !== '') {
		return producto.imagen;
	}

	return 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80';
}

function cargarCategoriasEnSelect(categorias) {
	categoriaProducto.innerHTML = '<option value="">Selecciona una categoría</option>';
	filtroCategoria.innerHTML = '<option value="">Todas</option>';

	categorias.forEach((categoria) => {
		const optionForm = document.createElement('option');
		optionForm.value = categoria.id_categoria;
		optionForm.textContent = categoria.nombre_categoria;
		categoriaProducto.appendChild(optionForm);

		const optionFiltro = document.createElement('option');
		optionFiltro.value = categoria.id_categoria;
		optionFiltro.textContent = categoria.nombre_categoria;
		filtroCategoria.appendChild(optionFiltro);
	});
}

function actualizarContadores(productos) {
	const visibles = productos.filter((producto) => producto.visible === true).length;
	const ocultos = productos.filter((producto) => producto.visible === false).length;

	totalProductos.textContent = productos.length.toString();
	productosVisibles.textContent = visibles.toString();
	productosOcultos.textContent = ocultos.toString();
}

function obtenerClaseStock(producto) {
	const stockActual = Number(producto.stock_actual ?? 0);
	const stockMinimo = Number(producto.stock_minimo ?? 5);

	return stockActual <= stockMinimo ? 'status-stock-low' : 'status-stock-ok';
}

function obtenerTextoStock(producto) {
	const stockActual = Number(producto.stock_actual ?? 0);
	const stockMinimo = Number(producto.stock_minimo ?? 5);

	if (stockActual <= stockMinimo) {
		return 'Stock bajo';
	}

	return 'Stock normal';
}

function crearBotonesAccion(producto) {
	return `
		<div class="action-buttons">
			<button class="btn-mini btn-edit" data-action="edit" data-id="${producto.id_producto}">
				Editar
			</button>

			${
				producto.visible === true
					? `
						<button class="btn-mini btn-hide" data-action="toggle" data-visible="false" data-id="${producto.id_producto}">
							Ocultar
						</button>
					`
					: `
						<button class="btn-mini btn-show" data-action="toggle" data-visible="true" data-id="${producto.id_producto}">
							Mostrar
						</button>
					`
			}
		</div>
	`;
}

function renderizarProductos(productos) {
	if (!productos || productos.length === 0) {
		listaProductos.innerHTML = `
			<div class="empty-state">
				No se encontraron productos con los filtros seleccionados.
			</div>
		`;
		return;
	}

	listaProductos.innerHTML = productos.map((producto) => {
		const nombreCategoria = producto.categoria?.nombre_categoria ?? 'Sin categoría';
		const stockActual = Number(producto.stock_actual ?? 0);
		const stockMinimo = Number(producto.stock_minimo ?? 5);
		const visible = producto.visible === true;
		const seleccionado = Number(productoSeleccionadoId) === Number(producto.id_producto);

		return `
			<article class="product-card ${visible ? '' : 'hidden-product'} ${seleccionado ? 'selected' : ''}">
				<img
					src="${obtenerImagenProducto(producto)}"
					alt="${producto.nombre_producto}"
					class="product-image"
				>

				<div class="product-body">
					<div class="product-top">
						<h4>${producto.nombre_producto}</h4>
					</div>

					<div class="product-category">${nombreCategoria}</div>

					<p class="product-description">
						${producto.descripcion_producto && producto.descripcion_producto.trim() !== ''
							? producto.descripcion_producto
							: 'Producto disponible en Dulce Mordisco.'}
					</p>

					<div class="product-meta">
						<div class="meta-box">
							<strong>Precio</strong>
							<span>$${Number(producto.precio_unitario).toFixed(2)}</span>
						</div>

						<div class="meta-box">
							<strong>Stock actual</strong>
							<span>${stockActual}</span>
						</div>

						<div class="meta-box">
							<strong>Stock bajo</strong>
							<span>${stockMinimo}</span>
						</div>

						<div class="meta-box">
							<strong>Estado stock</strong>
							<span>${obtenerTextoStock(producto)}</span>
						</div>
					</div>

					<div class="product-footer">
						<div class="status-badge ${visible ? 'status-visible' : 'status-hidden'}">
							${visible ? 'Visible' : 'Oculto'}
						</div>

						<div class="status-badge ${obtenerClaseStock(producto)}">
							${obtenerTextoStock(producto)}
						</div>

						${crearBotonesAccion(producto)}
					</div>
				</div>
			</article>
		`;
	}).join('');

	const botones = document.querySelectorAll('.btn-mini');

	botones.forEach((boton) => {
		boton.addEventListener('click', async () => {
			const accion = boton.getAttribute('data-action');
			const productoId = boton.getAttribute('data-id');

			if (accion === 'edit') {
				const producto = productosOriginales.find(
					(item) => String(item.id_producto) === String(productoId)
				);

				if (producto) {
					activarModoEdicion(producto);
				}
			}

			if (accion === 'toggle') {
				const nuevoVisible = boton.getAttribute('data-visible') === 'true';
				await cambiarVisibilidadProducto(productoId, nuevoVisible);
			}
		});
	});
}

function aplicarFiltrosInterno() {
	let productosFiltrados = [...productosOriginales];

	const textoBusqueda = buscarProducto.value.trim().toLowerCase();
	const categoriaSeleccionada = filtroCategoria.value;
	const mostrarOcultos = verOcultos.checked;

	if (!mostrarOcultos) {
		productosFiltrados = productosFiltrados.filter((producto) => producto.visible === true);
	}

	if (textoBusqueda !== '') {
		productosFiltrados = productosFiltrados.filter((producto) => {
			const nombre = (producto.nombre_producto ?? '').toLowerCase();
			const descripcion = (producto.descripcion_producto ?? '').toLowerCase();
			const categoria = (producto.categoria?.nombre_categoria ?? '').toLowerCase();

			return (
				nombre.includes(textoBusqueda) ||
				descripcion.includes(textoBusqueda) ||
				categoria.includes(textoBusqueda)
			);
		});
	}

	if (categoriaSeleccionada !== '') {
		productosFiltrados = productosFiltrados.filter(
			(producto) => String(producto.id_categoria) === categoriaSeleccionada
		);
	}

	resumenCatalogo.textContent = `${productosFiltrados.length} producto(s) encontrado(s).`;

	return productosFiltrados;
}

function aplicarFiltros() {
	renderizarProductos(aplicarFiltrosInterno());
}

async function cargarCategorias() {
	try {
		const { data, error } = await db
			.from('categoria')
			.select('id_categoria, nombre_categoria')
			.order('nombre_categoria', { ascending: true });

		if (error) {
			console.error('Error al cargar categorías:', error);
			return;
		}

		categoriasOriginales = data ?? [];
		cargarCategoriasEnSelect(categoriasOriginales);
	} catch (error) {
		console.error('Error general al cargar categorías:', error);
	}
}

async function cargarProductos() {
	try {
		const { data, error } = await db
			.from('producto')
			.select(`
				id_producto,
				nombre_producto,
				precio_unitario,
				id_categoria,
				descripcion_producto,
				imagen,
				visible,
				stock_actual,
				stock_minimo,
				categoria (
					id_categoria,
					nombre_categoria
				)
			`)
			.order('id_producto', { ascending: true });

		if (error) {
			console.error('Error al cargar productos:', error);
			listaProductos.innerHTML = `
				<div class="empty-state">
					No se pudieron cargar los productos.
				</div>
			`;
			return;
		}

		productosOriginales = data ?? [];
		actualizarContadores(productosOriginales);

		if (productoSeleccionadoId !== null) {
			const productoActualizado = productosOriginales.find(
				(producto) => Number(producto.id_producto) === Number(productoSeleccionadoId)
			);

			if (productoActualizado) {
				activarModoEdicion(productoActualizado);
			} else {
				limpiarFormulario();
			}
		}

		aplicarFiltros();
	} catch (error) {
		console.error('Error general al cargar productos:', error);
		listaProductos.innerHTML = `
			<div class="empty-state">
				Ocurrió un error al consultar la información.
			</div>
		`;
	}
}

async function actualizarProducto(datosProducto, stockActual, stockMinimo) {
	const productoIdActual = idProducto.value;

	const { error } = await db
		.from('producto')
		.update({
			...datosProducto,
			stock_actual: stockActual,
			stock_minimo: stockMinimo
		})
		.eq('id_producto', productoIdActual);

	if (error) {
		console.error('Error al actualizar producto:', error);
		throw new Error('No se pudo actualizar el producto.');
	}
}

async function cambiarVisibilidadProducto(productoId, visible) {
	try {
		const { error } = await db
			.from('producto')
			.update({ visible: visible })
			.eq('id_producto', productoId);

		if (error) {
			console.error('Error al cambiar visibilidad:', error);
			alert('No se pudo actualizar la visibilidad del producto.');
			return;
		}

		const index = productosOriginales.findIndex(
			(item) => String(item.id_producto) === String(productoId)
		);

		if (index >= 0) {
			productosOriginales[index].visible = visible;
		}

		actualizarContadores(productosOriginales);
		aplicarFiltros();

		if (Number(productoSeleccionadoId) === Number(productoId)) {
			visibleProducto.checked = visible;
		}
	} catch (error) {
		console.error('Error general al cambiar visibilidad:', error);
		alert('Ocurrió un error al cambiar la visibilidad del producto.');
	}
}

function obtenerDatosFormulario() {
	const nombre = nombreProducto.value.trim();
	const categoria = categoriaProducto.value;
	const precio = Number(precioProducto.value);
	const stockActual = Number(stockProducto.value);
	const stockMinimo = Number(stockMinimoProducto.value);
	const descripcion = descripcionProducto.value.trim();
	const imagen = imagenProducto.value.trim();
	const visible = visibleProducto.checked;

	if (!idProducto.value) {
		throw new Error('Primero selecciona un producto para editar.');
	}

	if (nombre === '') {
		throw new Error('El nombre del producto es obligatorio.');
	}

	if (categoria === '') {
		throw new Error('Debes seleccionar una categoría.');
	}

	if (Number.isNaN(precio) || precio < 0) {
		throw new Error('El precio debe ser un número válido mayor o igual a 0.');
	}

	if (!Number.isInteger(stockActual) || stockActual < 0) {
		throw new Error('El stock actual debe ser un número entero válido.');
	}

	if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
		throw new Error('El stock bajo debe ser un número entero válido.');
	}

	return {
		datosProducto: {
			nombre_producto: nombre,
			id_categoria: Number(categoria),
			precio_unitario: precio,
			descripcion_producto: descripcion,
			imagen: imagen,
			visible: visible
		},
		stockActual,
		stockMinimo
	};
}

if (productoForm) {
	productoForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		try {
			const { datosProducto, stockActual, stockMinimo } = obtenerDatosFormulario();

			btnGuardarProducto.disabled = true;
			btnGuardarProducto.textContent = 'Actualizando...';

			await actualizarProducto(datosProducto, stockActual, stockMinimo);

			mostrarMensajeFormulario('success', 'Producto actualizado correctamente.');
			await cargarProductos();
		} catch (error) {
			mostrarMensajeFormulario('error', error.message || 'No se pudo actualizar el producto.');
		} finally {
			btnGuardarProducto.disabled = false;
			btnGuardarProducto.textContent = 'Actualizar producto';
		}
	});
}

if (btnCancelarEdicion) {
	btnCancelarEdicion.addEventListener('click', limpiarFormulario);
}

if (buscarProducto) {
	buscarProducto.addEventListener('input', aplicarFiltros);
}

if (filtroCategoria) {
	filtroCategoria.addEventListener('change', aplicarFiltros);
}

if (verOcultos) {
	verOcultos.addEventListener('change', aplicarFiltros);
}

ocultarFormularioEdicion();
cargarCategorias();
cargarProductos();