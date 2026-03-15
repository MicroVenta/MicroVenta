const nombreUsuario = document.getElementById('nombreUsuario');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

const productoForm = document.getElementById('productoForm');
const idProducto = document.getElementById('idProducto');
const nombreProducto = document.getElementById('nombreProducto');
const categoriaProducto = document.getElementById('categoriaProducto');
const precioProducto = document.getElementById('precioProducto');
const stockProducto = document.getElementById('stockProducto');
const descripcionProducto = document.getElementById('descripcionProducto');
const imagenProducto = document.getElementById('imagenProducto');
const visibleProducto = document.getElementById('visibleProducto');
const mensajeFormulario = document.getElementById('mensajeFormulario');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
const btnGuardarProducto = document.getElementById('btnGuardarProducto');
const tituloFormulario = document.getElementById('tituloFormulario');
const subtituloFormulario = document.getElementById('subtituloFormulario');

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
const btnCerrarSesionSidebar = document.getElementById('btnCerrarSesionSidebar');

let usuario = null;
let productosOriginales = [];
let categoriasOriginales = [];
let modoEdicion = false;

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

const rolUsuario = (usuario.nombre_rol ?? '').trim().toLowerCase();

if (rolUsuario !== 'administrador' && rolUsuario !== 'ayudante') {
	window.location.href = '/login/login.html';
}

if (nombreUsuario) {
	nombreUsuario.textContent = usuario.nombre_completo;
}

if (btnCerrarSesion) {
	btnCerrarSesion.addEventListener('click', cerrarSesion);
}

if (btnCerrarSesionSidebar) {
	btnCerrarSesionSidebar.addEventListener('click', cerrarSesion);
}

function mostrarMensajeFormulario(tipo, texto) {
	mensajeFormulario.className = 'message';
	mensajeFormulario.textContent = '';

	if (tipo) {
		mensajeFormulario.classList.add(tipo);
		mensajeFormulario.textContent = texto;
	}
}

function limpiarFormulario() {
	productoForm.reset();
	idProducto.value = '';
	visibleProducto.checked = true;
	modoEdicion = false;
	btnCancelarEdicion.classList.add('hidden');
	btnGuardarProducto.textContent = 'Guardar producto';
	tituloFormulario.textContent = 'Agregar producto';
	subtituloFormulario.textContent = 'Completa la información del nuevo producto.';
	mostrarMensajeFormulario('', '');
}

function activarModoEdicion(producto) {
	modoEdicion = true;
	idProducto.value = producto.id_producto;
	nombreProducto.value = producto.nombre_producto ?? '';
	categoriaProducto.value = producto.id_categoria ?? '';
	precioProducto.value = producto.precio_unitario ?? '';
	stockProducto.value = producto.inventario?.[0]?.stock_actual ?? 0;
	descripcionProducto.value = producto.descripcion_producto ?? '';
	imagenProducto.value = producto.imagen ?? '';
	visibleProducto.checked = Boolean(producto.visible);

	btnCancelarEdicion.classList.remove('hidden');
	btnGuardarProducto.textContent = 'Actualizar producto';
	tituloFormulario.textContent = 'Editar producto';
	subtituloFormulario.textContent = 'Modifica la información del producto seleccionado.';
	mostrarMensajeFormulario('', '');

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
		const stockActual = producto.inventario?.[0]?.stock_actual ?? 0;
		const visible = producto.visible === true;

		return `
			<article class="product-card ${visible ? '' : 'hidden-product'}">
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
							<strong>Stock</strong>
							<span>${stockActual}</span>
						</div>
					</div>

					<div class="product-footer">
						<div class="status-badge ${visible ? 'status-visible' : 'status-hidden'}">
							${visible ? 'Visible' : 'Oculto'}
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
				categoria (
					id_categoria,
					nombre_categoria
				),
				inventario (
					id_inventario,
					stock_actual
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

async function crearProducto(datosProducto, stockInicial) {
	const { data: productoCreado, error: errorProducto } = await db
		.from('producto')
		.insert(datosProducto)
		.select('id_producto')
		.single();

	if (errorProducto || !productoCreado) {
		console.error('Error al crear producto:', errorProducto);
		throw new Error('No se pudo crear el producto.');
	}

	const { error: errorInventario } = await db
		.from('inventario')
		.insert({
			id_producto: productoCreado.id_producto,
			stock_actual: stockInicial,
			stock_minimo: 5
		});

	if (errorInventario) {
		console.error('Error al crear inventario:', errorInventario);
		throw new Error('El producto se creó, pero no se pudo registrar el inventario.');
	}
}

async function actualizarProducto(datosProducto, stockActual) {
	const productoIdActual = idProducto.value;

	const { error: errorProducto } = await db
		.from('producto')
		.update(datosProducto)
		.eq('id_producto', productoIdActual);

	if (errorProducto) {
		console.error('Error al actualizar producto:', errorProducto);
		throw new Error('No se pudo actualizar el producto.');
	}

	const productoActual = productosOriginales.find(
		(item) => String(item.id_producto) === String(productoIdActual)
	);

	const inventarioId = productoActual?.inventario?.[0]?.id_inventario;

	if (inventarioId) {
		const { error: errorInventario } = await db
			.from('inventario')
			.update({
				stock_actual: stockActual,
				ultima_actualizacion: new Date().toISOString()
			})
			.eq('id_inventario', inventarioId);

		if (errorInventario) {
			console.error('Error al actualizar inventario:', errorInventario);
			throw new Error('El producto se actualizó, pero no se pudo actualizar el inventario.');
		}
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

		if (index !== -1) {
			productosOriginales[index].visible = visible;
		}

		actualizarContadores(productosOriginales);
		aplicarFiltros();

	} catch (error) {
		console.error('Error general al cambiar visibilidad:', error);
		alert('Ocurrió un error al actualizar el producto.');
	}
}

productoForm.addEventListener('submit', async (e) => {
	e.preventDefault();

	mostrarMensajeFormulario('', '');

	const nombre = nombreProducto.value.trim();
	const categoria = categoriaProducto.value;
	const precio = Number(precioProducto.value);
	const stock = Number(stockProducto.value);
	const descripcion = descripcionProducto.value.trim();
	const imagen = imagenProducto.value.trim();
	const visible = visibleProducto.checked;

	if (!nombre || !categoria || Number.isNaN(precio) || precio < 0 || Number.isNaN(stock) || stock < 0) {
		mostrarMensajeFormulario('error', 'Completa correctamente los campos obligatorios.');
		return;
	}

	const datosProducto = {
		nombre_producto: nombre,
		precio_unitario: precio,
		id_categoria: Number(categoria),
		descripcion_producto: descripcion,
		imagen: imagen,
		visible: visible
	};

	btnGuardarProducto.disabled = true;
	btnGuardarProducto.textContent = modoEdicion ? 'Actualizando...' : 'Guardando...';

	try {
		if (modoEdicion) {
			await actualizarProducto(datosProducto, stock);
			await cargarProductos();
			limpiarFormulario();
			mostrarMensajeFormulario('success', 'Producto actualizado correctamente.');
		} else {
			await crearProducto(datosProducto, stock);
			await cargarProductos();
			limpiarFormulario();
			mostrarMensajeFormulario('success', 'Producto creado correctamente.');
		}
	} catch (error) {
		console.error('Error al guardar producto:', error);
		mostrarMensajeFormulario('error', error.message || 'No se pudo guardar el producto.');
	} finally {
		btnGuardarProducto.disabled = false;
		btnGuardarProducto.textContent = 'Guardar producto';
	}
});

btnCancelarEdicion.addEventListener('click', () => {
	limpiarFormulario();
});

buscarProducto.addEventListener('input', aplicarFiltros);
filtroCategoria.addEventListener('change', aplicarFiltros);
verOcultos.addEventListener('change', aplicarFiltros);

cargarCategorias();
cargarProductos();