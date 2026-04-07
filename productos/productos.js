const nombreCliente = document.getElementById('nombreCliente');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionSidebar = document.getElementById('btnCerrarSesionSidebar');
const buscarProducto = document.getElementById('buscarProducto');
const filtroCategoria = document.getElementById('filtroCategoria');
const listaProductos = document.getElementById('listaProductos');
const resumenCatalogo = document.getElementById('resumenCatalogo');

const carritoLista = document.getElementById('carritoLista');
const carritoCantidad = document.getElementById('carritoCantidad');
const carritoTotal = document.getElementById('carritoTotal');
const btnVaciarCarrito = document.getElementById('btnVaciarCarrito');
const btnRealizarPedido = document.getElementById('btnRealizarPedido');
const pedidoMensaje = document.getElementById('pedidoMensaje');

const usarDireccionPerfil = document.getElementById('usarDireccionPerfil');
const direccionPerfilInfo = document.getElementById('direccionPerfilInfo');
const telefonoInfo = document.getElementById('telefonoInfo');
const telefonoPedido = document.getElementById('telefonoPedido');
const lugarEntrega = document.getElementById('lugarEntrega');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let productosOriginales = [];
let categoriasOriginales = [];
let carrito = [];

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

if (
	rolUsuario !== 'cliente' &&
	rolUsuario !== 'repartidor' &&
	rolUsuario !== 'administrador'
) {
	window.location.href = '/login/login.html';
}

renderizarSidebar('productos');

if (nombreCliente) {
	nombreCliente.textContent = usuario.nombre_completo;
}

function guardarUsuarioEnStorage() {
	const usuarioSerializado = JSON.stringify(usuario);
	sessionStorage.setItem('microventa_usuario', usuarioSerializado);
	localStorage.setItem('microventa_usuario', usuarioSerializado);
}

async function refrescarUsuarioDesdeBD() {
	try {
		const { data, error } = await db
			.from('usuario')
			.select(`
				id_usuario,
				nombre_completo,
				correo,
				id_rol,
				telefono,
				direccion,
				nombreuser,
				Estado,
				rol (
					id_rol,
					nombre_rol
				)
			`)
			.eq('id_usuario', usuario.id_usuario)
			.single();

		if (error || !data) {
			console.error('No se pudo refrescar el usuario desde la BD:', error);
			return;
		}

		usuario = {
			...usuario,
			...data,
			nombre_rol: data.rol?.nombre_rol ?? usuario.nombre_rol
		};

		guardarUsuarioEnStorage();

		if (nombreCliente) {
			nombreCliente.textContent = usuario.nombre_completo ?? 'Usuario';
		}
	} catch (error) {
		console.error('Error general al refrescar usuario:', error);
	}
}

function cerrarSesion() {
	sessionStorage.removeItem('microventa_usuario');
	localStorage.removeItem('microventa_usuario');
	window.location.href = '/login/login.html';
}

if (btnCerrarSesion) {
	btnCerrarSesion.addEventListener('click', cerrarSesion);
}

if (btnCerrarSesionSidebar) {
	btnCerrarSesionSidebar.addEventListener('click', cerrarSesion);
}

function obtenerClaveCarrito() {
	return `microventa_carrito_${usuario.id_usuario}`;
}

function mostrarMensaje(tipo, texto) {
	if (!pedidoMensaje) {
		return;
	}

	pedidoMensaje.className = 'message';
	pedidoMensaje.textContent = '';

	if (tipo) {
		pedidoMensaje.classList.add(tipo);
		pedidoMensaje.textContent = texto;
	}
}

function limpiarMensaje() {
	if (!pedidoMensaje) {
		return;
	}

	pedidoMensaje.className = 'message';
	pedidoMensaje.textContent = '';
}

function obtenerImagenProducto(producto) {
	if (producto.imagen && producto.imagen.trim() !== '') {
		return producto.imagen;
	}

	return 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80';
}

function formatearMoneda(valor) {
	return `$${Number(valor).toFixed(2)}`;
}

function guardarCarrito() {
	localStorage.setItem(obtenerClaveCarrito(), JSON.stringify(carrito));
}

function cargarCarrito() {
	const carritoGuardado = localStorage.getItem(obtenerClaveCarrito());

	if (!carritoGuardado) {
		carrito = [];
		return;
	}

	try {
		carrito = JSON.parse(carritoGuardado) ?? [];
	} catch (error) {
		carrito = [];
		localStorage.removeItem(obtenerClaveCarrito());
	}
}

function obtenerTelefonoCapturado() {
	return String(telefonoPedido?.value ?? '').trim();
}

function tieneTelefonoRegistrado() {
	return obtenerTelefonoCapturado() !== '';
}

function actualizarInfoTelefono() {
	const telefonoActual = String(usuario?.telefono ?? '').trim();

	if (!telefonoInfo) {
		return;
	}

	if (telefonoActual !== '') {
		telefonoInfo.textContent = `Teléfono registrado: ${telefonoActual}`;
		telefonoInfo.classList.remove('hidden');
	} else {
		telefonoInfo.textContent = 'No tienes un teléfono guardado en tu perfil. Debes capturarlo para poder hacer un pedido.';
		telefonoInfo.classList.remove('hidden');
	}

	if (telefonoPedido) {
		telefonoPedido.value = telefonoActual;
	}
}

function inicializarEntrega() {
	const direccionGuardada = (usuario?.direccion ?? '').trim();

	if (direccionGuardada !== '') {
		direccionPerfilInfo.textContent = `Dirección guardada: ${direccionGuardada}`;
		direccionPerfilInfo.classList.remove('hidden');
	} else {
		direccionPerfilInfo.textContent = 'No tienes una dirección guardada en tu perfil.';
		direccionPerfilInfo.classList.remove('hidden');
	}

	actualizarInfoTelefono();

	if (usarDireccionPerfil) {
		usarDireccionPerfil.checked = false;
	}

	if (lugarEntrega) {
		lugarEntrega.value = '';
		lugarEntrega.disabled = false;
	}
}

function actualizarEstadoLugarEntrega() {
	if (!usarDireccionPerfil || !lugarEntrega) {
		return;
	}

	const direccionGuardada = (usuario?.direccion ?? '').trim();
	const usarPerfil = usarDireccionPerfil.checked;

	if (usarPerfil) {
		if (direccionGuardada === '') {
			usarDireccionPerfil.checked = false;
			mostrarMensaje(
				'error',
				'No puedes usar la dirección del perfil porque no tienes una guardada.'
			);
			lugarEntrega.disabled = false;
			lugarEntrega.value = '';
			return;
		}

		lugarEntrega.value = direccionGuardada;
		lugarEntrega.disabled = true;
		limpiarMensaje();
		return;
	}

	lugarEntrega.disabled = false;
	lugarEntrega.value = '';
}

function cargarCategoriasEnFiltro(categorias) {
	if (!filtroCategoria) {
		return;
	}

	filtroCategoria.innerHTML = '<option value="">Todas</option>';

	categorias.forEach((categoria) => {
		const option = document.createElement('option');
		option.value = categoria.id_categoria;
		option.textContent = categoria.nombre_categoria;
		filtroCategoria.appendChild(option);
	});
}

function obtenerStockProducto(producto) {
	return Number(producto.stock_actual ?? 0);
}

function obtenerCantidadEnCarrito(idProducto) {
	const item = carrito.find((producto) => Number(producto.id_producto) === Number(idProducto));
	return item ? Number(item.cantidad) : 0;
}

function agregarAlCarrito(idProducto) {
	limpiarMensaje();

	const producto = productosOriginales.find(
		(item) => Number(item.id_producto) === Number(idProducto)
	);

	if (!producto) {
		mostrarMensaje('error', 'No se encontró el producto.');
		return;
	}

	const stockActual = obtenerStockProducto(producto);

	if (stockActual <= 0) {
		mostrarMensaje('error', 'Este producto no tiene existencias.');
		return;
	}

	const existente = carrito.find(
		(item) => Number(item.id_producto) === Number(idProducto)
	);

	if (existente) {
		if (existente.cantidad >= stockActual) {
			mostrarMensaje('error', 'No puedes agregar más de lo disponible en stock.');
			return;
		}

		existente.cantidad += 1;
		existente.stock_actual = stockActual;
	} else {
		carrito.push({
			id_producto: producto.id_producto,
			nombre_producto: producto.nombre_producto,
			precio_unitario: Number(producto.precio_unitario),
			imagen: producto.imagen ?? '',
			stock_actual: stockActual,
			cantidad: 1
		});
	}

	guardarCarrito();
	renderizarCarrito();
	renderizarProductos(aplicarFiltrosInterno());
}

function disminuirCantidad(idProducto) {
	const item = carrito.find((producto) => Number(producto.id_producto) === Number(idProducto));

	if (!item) {
		return;
	}

	item.cantidad -= 1;

	if (item.cantidad <= 0) {
		carrito = carrito.filter((producto) => Number(producto.id_producto) !== Number(idProducto));
	}

	guardarCarrito();
	renderizarCarrito();
	renderizarProductos(aplicarFiltrosInterno());
}

function aumentarCantidad(idProducto) {
	const item = carrito.find((producto) => Number(producto.id_producto) === Number(idProducto));
	const producto = productosOriginales.find((p) => Number(p.id_producto) === Number(idProducto));

	if (!item || !producto) {
		return;
	}

	const stockActual = obtenerStockProducto(producto);

	if (item.cantidad >= stockActual) {
		mostrarMensaje('error', 'No puedes agregar más de lo disponible en stock.');
		return;
	}

	item.cantidad += 1;
	item.stock_actual = stockActual;

	guardarCarrito();
	renderizarCarrito();
	renderizarProductos(aplicarFiltrosInterno());
}

function eliminarDelCarrito(idProducto) {
	carrito = carrito.filter((producto) => Number(producto.id_producto) !== Number(idProducto));
	guardarCarrito();
	renderizarCarrito();
	renderizarProductos(aplicarFiltrosInterno());
}

function vaciarCarrito() {
	carrito = [];
	guardarCarrito();
	renderizarCarrito();
	renderizarProductos(aplicarFiltrosInterno());
	limpiarMensaje();
}

function renderizarCarrito() {
	if (!carritoLista) {
		return;
	}

	if (!carrito || carrito.length === 0) {
		carritoLista.innerHTML = `
			<div class="empty-cart">Tu carrito está vacío.</div>
		`;

		if (carritoCantidad) {
			carritoCantidad.textContent = '0';
		}

		if (carritoTotal) {
			carritoTotal.textContent = '$0.00';
		}

		return;
	}

	carritoLista.innerHTML = carrito.map((item) => {
		const subtotal = Number(item.precio_unitario) * Number(item.cantidad);

		return `
			<article class="cart-item">
				<div class="cart-item-top">
					<div>
						<h4>${item.nombre_producto}</h4>
						<div class="cart-item-price">${formatearMoneda(item.precio_unitario)} c/u</div>
					</div>

					<div class="cart-item-price">${formatearMoneda(subtotal)}</div>
				</div>

				<div class="cart-item-controls">
					<div class="qty-controls">
						<button class="qty-btn" data-action="minus" data-id="${item.id_producto}">−</button>
						<span class="qty-value">${item.cantidad}</span>
						<button class="qty-btn" data-action="plus" data-id="${item.id_producto}">+</button>
					</div>

					<button class="remove-btn" data-action="remove" data-id="${item.id_producto}">
						Quitar
					</button>
				</div>
			</article>
		`;
	}).join('');

	const cantidadTotal = carrito.reduce((total, item) => total + Number(item.cantidad), 0);
	const total = carrito.reduce(
		(acumulado, item) => acumulado + (Number(item.precio_unitario) * Number(item.cantidad)),
		0
	);

	if (carritoCantidad) {
		carritoCantidad.textContent = cantidadTotal.toString();
	}

	if (carritoTotal) {
		carritoTotal.textContent = formatearMoneda(total);
	}

	const botonesCarrito = carritoLista.querySelectorAll('[data-action]');

	botonesCarrito.forEach((boton) => {
		boton.addEventListener('click', () => {
			const accion = boton.getAttribute('data-action');
			const idProducto = Number(boton.getAttribute('data-id'));

			if (accion === 'minus') {
				disminuirCantidad(idProducto);
			} else if (accion === 'plus') {
				aumentarCantidad(idProducto);
			} else if (accion === 'remove') {
				eliminarDelCarrito(idProducto);
			}
		});
	});
}

function renderizarProductos(productos) {
	if (!listaProductos) {
		return;
	}

	if (!productos || productos.length === 0) {
		listaProductos.innerHTML = `
			<div class="empty-state">
				No se encontraron productos disponibles.
			</div>
		`;
		return;
	}

	listaProductos.innerHTML = productos.map((producto) => {
		const nombreCategoria = producto.categoria?.nombre_categoria ?? 'Sin categoría';
		const stockActual = obtenerStockProducto(producto);
		const cantidadEnCarrito = obtenerCantidadEnCarrito(producto.id_producto);
		const disponibleParaAgregar = stockActual - cantidadEnCarrito;
		const descripcion =
			producto.descripcion_producto && producto.descripcion_producto.trim() !== ''
				? producto.descripcion_producto
				: 'Producto disponible en Dulce Mordisco.';

		return `
			<article class="product-card">
				<img
					src="${obtenerImagenProducto(producto)}"
					alt="${producto.nombre_producto}"
					class="product-image"
				>

				<div class="product-body">
					<h3 class="product-title">${producto.nombre_producto}</h3>
					<div class="product-category">${nombreCategoria}</div>

					<p class="product-description">${descripcion}</p>

					<div class="product-meta">
						<div class="meta-box">
							<strong>Precio</strong>
							<span>${formatearMoneda(producto.precio_unitario)}</span>
						</div>

						<div class="meta-box">
							<strong>Stock</strong>
							<span>${stockActual}</span>
						</div>
					</div>

					<div class="product-footer">
						<div class="stock-badge ${stockActual > 0 ? 'stock-ok' : 'stock-low'}">
							${stockActual > 0 ? 'Disponible' : 'Agotado'}
						</div>

						<button
							class="btn-add"
							data-id="${producto.id_producto}"
							${disponibleParaAgregar <= 0 ? 'disabled' : ''}
						>
							${stockActual <= 0 ? 'Sin stock' : 'Agregar'}
						</button>
					</div>
				</div>
			</article>
		`;
	}).join('');

	const botonesAgregar = listaProductos.querySelectorAll('.btn-add');

	botonesAgregar.forEach((boton) => {
		boton.addEventListener('click', () => {
			const idProducto = Number(boton.getAttribute('data-id'));
			agregarAlCarrito(idProducto);
		});
	});
}

function aplicarFiltrosInterno() {
	let productosFiltrados = [...productosOriginales];

	const textoBusqueda = buscarProducto ? buscarProducto.value.trim().toLowerCase() : '';
	const categoriaSeleccionada = filtroCategoria ? filtroCategoria.value : '';

	productosFiltrados = productosFiltrados.filter(
		(producto) => producto.visible === true
	);

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

	if (resumenCatalogo) {
		resumenCatalogo.textContent = `${productosFiltrados.length} producto(s) encontrado(s).`;
	}

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
		cargarCategoriasEnFiltro(categoriasOriginales);
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
			.eq('visible', true)
			.order('id_producto', { ascending: true });

		if (error) {
			console.error('Error al cargar productos:', error);

			if (listaProductos) {
				listaProductos.innerHTML = `
					<div class="empty-state">
						No se pudieron cargar los productos.
					</div>
				`;
			}

			return;
		}

		productosOriginales = data ?? [];
		aplicarFiltros();
	} catch (error) {
		console.error('Error general al cargar productos:', error);

		if (listaProductos) {
			listaProductos.innerHTML = `
				<div class="empty-state">
					Ocurrió un error al consultar la información.
				</div>
			`;
		}
	}
}

async function obtenerEstatusPendiente() {
	const { data, error } = await db
		.from('estatuspedido')
		.select('id_estatus, descripcion')
		.ilike('descripcion', 'Pendiente')
		.single();

	if (error || !data) {
		throw new Error('No se encontró el estatus Pendiente.');
	}

	return data.id_estatus;
}

async function actualizarStockProducto(item) {
	const producto = productosOriginales.find(
		(productoActual) => Number(productoActual.id_producto) === Number(item.id_producto)
	);

	if (!producto) {
		throw new Error(`No se encontró el producto ${item.nombre_producto}.`);
	}

	const stockActual = Number(producto.stock_actual ?? 0);

	if (item.cantidad > stockActual) {
		throw new Error(`No hay suficiente stock para ${item.nombre_producto}.`);
	}

	const nuevoStock = stockActual - Number(item.cantidad);

	const { error } = await db
		.from('producto')
		.update({
			stock_actual: nuevoStock
		})
		.eq('id_producto', producto.id_producto);

	if (error) {
		throw new Error(`No se pudo actualizar el stock de ${item.nombre_producto}.`);
	}

	producto.stock_actual = nuevoStock;
}

async function guardarTelefonoSiCambio() {
	const telefonoNuevo = obtenerTelefonoCapturado();

	if (telefonoNuevo === '') {
		mostrarMensaje(
			'error',
			'Debes registrar un número de teléfono antes de realizar un pedido.'
		);
		telefonoPedido?.focus();
		return false;
	}

	if (telefonoNuevo === String(usuario?.telefono ?? '').trim()) {
		return true;
	}

	const { error } = await db
		.from('usuario')
		.update({
			telefono: telefonoNuevo
		})
		.eq('id_usuario', usuario.id_usuario);

	if (error) {
		console.error('Error al actualizar teléfono:', error);
		mostrarMensaje('error', 'No se pudo guardar el teléfono de contacto.');
		return false;
	}

	usuario.telefono = telefonoNuevo;
	guardarUsuarioEnStorage();
	actualizarInfoTelefono();

	return true;
}

function validarLugarEntrega() {
	const lugar = lugarEntrega?.value.trim() ?? '';

	if (lugar === '') {
		mostrarMensaje('error', 'Debes indicar el lugar de entrega.');
		if (!lugarEntrega?.disabled) {
			lugarEntrega?.focus();
		}
		return null;
	}

	return lugar;
}

async function realizarPedido() {
	limpiarMensaje();

	if (!carrito || carrito.length === 0) {
		mostrarMensaje('error', 'Agrega productos antes de realizar el pedido.');
		return;
	}

	const telefonoValido = await guardarTelefonoSiCambio();

	if (!telefonoValido || !tieneTelefonoRegistrado()) {
		return;
	}

	const lugarEntregaFinal = validarLugarEntrega();

	if (!lugarEntregaFinal) {
		return;
	}

	btnRealizarPedido.disabled = true;
	btnRealizarPedido.textContent = 'Procesando...';

	try {
		for (const item of carrito) {
			const producto = productosOriginales.find(
				(productoActual) => Number(productoActual.id_producto) === Number(item.id_producto)
			);

			if (!producto) {
				throw new Error(`No se encontró el producto ${item.nombre_producto}.`);
			}

			const stockActual = obtenerStockProducto(producto);

			if (item.cantidad > stockActual) {
				throw new Error(`No hay stock suficiente para ${item.nombre_producto}.`);
			}
		}

		const total = carrito.reduce(
			(acumulado, item) => acumulado + (Number(item.precio_unitario) * Number(item.cantidad)),
			0
		);

		const idEstatusPendiente = await obtenerEstatusPendiente();

		const { data: pedidoData, error: pedidoError } = await db
			.from('pedido')
			.insert({
				id_cliente: usuario.id_usuario,
				total_pagar: total,
				id_estatus: idEstatusPendiente,
				lugar_entrega: lugarEntregaFinal
			})
			.select('id_pedido')
			.single();

		if (pedidoError || !pedidoData) {
			throw new Error('No se pudo crear el pedido.');
		}

		const detalles = carrito.map((item) => ({
			id_pedido: pedidoData.id_pedido,
			id_producto: item.id_producto,
			cantidad: item.cantidad,
			subtotal: Number(item.precio_unitario) * Number(item.cantidad)
		}));

		const { error: detalleError } = await db
			.from('detallepedido')
			.insert(detalles);

		if (detalleError) {
			throw new Error('No se pudieron guardar los detalles del pedido.');
		}

		const { error: historialError } = await db
			.from('historialestatus')
			.insert({
				id_pedido: pedidoData.id_pedido,
				id_estatus: idEstatusPendiente
			});

		if (historialError) {
			throw new Error('No se pudo registrar el historial inicial del pedido.');
		}

		for (const item of carrito) {
			await actualizarStockProducto(item);
		}

		carrito = [];
		guardarCarrito();
		renderizarCarrito();
		aplicarFiltros();

		if (usarDireccionPerfil) {
			usarDireccionPerfil.checked = false;
		}

		if (lugarEntrega) {
			lugarEntrega.disabled = false;
			lugarEntrega.value = '';
		}

		mostrarMensaje(
			'success',
			`Pedido realizado correctamente. Tu número de pedido es #${pedidoData.id_pedido}.`
		);
	} catch (error) {
		console.error('Error al realizar pedido:', error);
		mostrarMensaje('error', error.message || 'No se pudo realizar el pedido.');
	} finally {
		btnRealizarPedido.disabled = false;
		btnRealizarPedido.textContent = 'Realizar pedido';
	}
}

if (buscarProducto) {
	buscarProducto.addEventListener('input', aplicarFiltros);
}

if (filtroCategoria) {
	filtroCategoria.addEventListener('change', aplicarFiltros);
}

if (btnVaciarCarrito) {
	btnVaciarCarrito.addEventListener('click', vaciarCarrito);
}

if (btnRealizarPedido) {
	btnRealizarPedido.addEventListener('click', realizarPedido);
}

if (usarDireccionPerfil) {
	usarDireccionPerfil.addEventListener('change', actualizarEstadoLugarEntrega);
}

(async function init() {
	cargarCarrito();
	renderizarCarrito();
	await refrescarUsuarioDesdeBD();
	inicializarEntrega();
	cargarCategorias();
	cargarProductos();
})();