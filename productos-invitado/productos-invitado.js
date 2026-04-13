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

const nombreInvitado = document.getElementById('nombreInvitado');
const correoPedido = document.getElementById('correoPedido');
const telefonoPedido = document.getElementById('telefonoPedido');
const tipoEntregaPedido = document.getElementById('tipoEntregaPedido');
const lugarEntrega = document.getElementById('lugarEntrega');
const comentarioPedido = document.getElementById('comentarioPedido');

const cartCard = document.getElementById('cartCard');
const btnIrCarritoMovil = document.getElementById('btnIrCarritoMovil');
const mobileCartCount = document.getElementById('mobileCartCount');

const modalConfirmacion = document.getElementById('modalConfirmacion');
const btnCerrarModal = document.getElementById('btnCerrarModal');

const modalRegistro = document.getElementById('modalRegistro');
const btnAbrirRegistro = document.getElementById('btnAbrirRegistro');
const btnAbrirRegistroSecundario = document.getElementById('btnAbrirRegistroSecundario');
const btnCerrarRegistro = document.getElementById('btnCerrarRegistro');
const btnCancelarRegistro = document.getElementById('btnCancelarRegistro');
const formRegistroModal = document.getElementById('formRegistroModal');
const registroMensaje = document.getElementById('registroMensaje');
const btnRegistrarModal = document.getElementById('btnRegistrarModal');

const registroNombreCompleto = document.getElementById('registroNombreCompleto');
const registroCorreo = document.getElementById('registroCorreo');
const registroContrasena = document.getElementById('registroContrasena');
const registroConfirmarContrasena = document.getElementById('registroConfirmarContrasena');

let productosOriginales = [];
let categoriasOriginales = [];
let carrito = [];

function obtenerClaveCarrito() {
	return 'microventa_carrito_invitado';
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

function mostrarMensajeRegistro(tipo, texto) {
	if (!registroMensaje) {
		return;
	}

	registroMensaje.className = 'message';
	registroMensaje.textContent = '';

	if (tipo) {
		registroMensaje.classList.add(tipo);
		registroMensaje.textContent = texto;
	}
}

function limpiarMensajeRegistro() {
	if (!registroMensaje) {
		return;
	}

	registroMensaje.className = 'message';
	registroMensaje.textContent = '';
}

function mostrarModalConfirmacion() {
	modalConfirmacion?.classList.remove('hidden');
}

function cerrarModalConfirmacion() {
	modalConfirmacion?.classList.add('hidden');
}

function abrirModalRegistro() {
	limpiarMensajeRegistro();

	const nombreActual = String(nombreInvitado?.value ?? '').trim();
	const correoActual = String(correoPedido?.value ?? '').trim();

	if (nombreActual !== '') {
		registroNombreCompleto.value = nombreActual;
	}

	if (correoActual !== '') {
		registroCorreo.value = correoActual;
	}

	modalRegistro?.classList.remove('hidden');
}

function cerrarModalRegistro() {
	modalRegistro?.classList.add('hidden');
}

function obtenerImagenProducto(producto) {
	if (producto.imagen && producto.imagen.trim() !== '') {
		return producto.imagen;
	}

	return 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80';
}

function formatearMoneda(valor) {
	return `$${Number(valor ?? 0).toFixed(2)}`;
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

function esVistaMovilCarrito() {
	return window.matchMedia('(max-width: 900px), (max-height: 500px)').matches;
}

function obtenerCantidadTotalCarrito() {
	return carrito.reduce((total, item) => total + Number(item.cantidad ?? 0), 0);
}

function resaltarCarrito() {
	if (!cartCard) {
		return;
	}

	cartCard.classList.remove('cart-highlight');
	void cartCard.offsetWidth;
	cartCard.classList.add('cart-highlight');

	window.clearTimeout(resaltarCarrito._timer);
	resaltarCarrito._timer = window.setTimeout(() => {
		cartCard.classList.remove('cart-highlight');
	}, 1400);
}

function resaltarBotonCarritoMovil() {
	if (!btnIrCarritoMovil || btnIrCarritoMovil.classList.contains('hidden')) {
		return;
	}

	btnIrCarritoMovil.classList.remove('mobile-cart-button-highlight');
	void btnIrCarritoMovil.offsetWidth;
	btnIrCarritoMovil.classList.add('mobile-cart-button-highlight');

	window.clearTimeout(resaltarBotonCarritoMovil._timer);
	resaltarBotonCarritoMovil._timer = window.setTimeout(() => {
		btnIrCarritoMovil.classList.remove('mobile-cart-button-highlight');
	}, 700);
}

function enfocarCarrito() {
	if (!cartCard) {
		return;
	}

	cartCard.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	});

	window.setTimeout(() => {
		cartCard.focus({ preventScroll: true });
		resaltarCarrito();
	}, 350);
}

function actualizarBotonCarritoMovil() {
	if (!btnIrCarritoMovil || !mobileCartCount) {
		return;
	}

	const cantidadTotal = obtenerCantidadTotalCarrito();
	mobileCartCount.textContent = cantidadTotal.toString();

	if (esVistaMovilCarrito() && cantidadTotal > 0) {
		btnIrCarritoMovil.classList.remove('hidden');
	} else {
		btnIrCarritoMovil.classList.add('hidden');
	}
}

function obtenerStockProducto(producto) {
	return Number(producto.stock_actual ?? 0);
}

function obtenerCantidadEnCarrito(idProducto) {
	const item = carrito.find((producto) => Number(producto.id_producto) === Number(idProducto));
	return item ? Number(item.cantidad) : 0;
}

function recalcularEstadoItemCarrito(item, producto) {
	const stockActual = Math.max(0, obtenerStockProducto(producto));
	const cantidad = Math.max(0, Number(item.cantidad ?? 0));

	item.stock_actual = stockActual;
	item.cantidad_stock = Math.min(cantidad, stockActual);
	item.cantidad_personalizada = Math.max(0, cantidad - stockActual);
	item.es_personalizado = item.cantidad_personalizada > 0 || stockActual <= 0;

	return item;
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

	const existente = carrito.find(
		(item) => Number(item.id_producto) === Number(idProducto)
	);

	if (existente) {
		existente.cantidad += 1;
		recalcularEstadoItemCarrito(existente, producto);
	} else {
		const nuevoItem = {
			id_producto: producto.id_producto,
			nombre_producto: producto.nombre_producto,
			precio_unitario: Number(producto.precio_unitario),
			imagen: producto.imagen ?? '',
			cantidad: 1,
			stock_actual: obtenerStockProducto(producto),
			cantidad_stock: 0,
			cantidad_personalizada: 0,
			es_personalizado: false
		};

		recalcularEstadoItemCarrito(nuevoItem, producto);
		carrito.push(nuevoItem);
	}

	guardarCarrito();
	renderizarCarrito();
	renderizarProductos(aplicarFiltrosInterno());

	if (esVistaMovilCarrito()) {
		resaltarBotonCarritoMovil();
	} else {
		resaltarCarrito();
	}
}

function disminuirCantidad(idProducto) {
	const item = carrito.find((producto) => Number(producto.id_producto) === Number(idProducto));
	const producto = productosOriginales.find((p) => Number(p.id_producto) === Number(idProducto));

	if (!item) {
		return;
	}

	item.cantidad -= 1;

	if (item.cantidad <= 0) {
		carrito = carrito.filter(
			(productoCarrito) => Number(productoCarrito.id_producto) !== Number(idProducto)
		);
	} else if (producto) {
		recalcularEstadoItemCarrito(item, producto);
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

	item.cantidad += 1;
	recalcularEstadoItemCarrito(item, producto);

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

		carritoCantidad.textContent = '0';
		carritoTotal.textContent = '$0.00';
		actualizarBotonCarritoMovil();
		return;
	}

	carritoLista.innerHTML = carrito.map((item) => {
		const subtotal = Number(item.precio_unitario) * Number(item.cantidad);
		const tienePartePersonalizada = Number(item.cantidad_personalizada ?? 0) > 0;
		const soloPersonalizado =
			Number(item.stock_actual ?? 0) <= 0 && Number(item.cantidad ?? 0) > 0;

		let notaItem = '';

		if (soloPersonalizado) {
			notaItem = `
				<div class="cart-item-note personalizado">
					Este producto se registrará completamente como pedido personalizado.
				</div>
			`;
		} else if (tienePartePersonalizada) {
			notaItem = `
				<div class="cart-item-note personalizado">
					${item.cantidad_stock} unidad(es) salen de stock y
					${item.cantidad_personalizada} unidad(es) se prepararán como pedido personalizado.
				</div>
			`;
		} else {
			notaItem = `
				<div class="cart-item-note stock">
					Este producto se cubrirá con stock disponible.
				</div>
			`;
		}

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

				${notaItem}
			</article>
		`;
	}).join('');

	const cantidadTotal = carrito.reduce((total, item) => total + Number(item.cantidad), 0);
	const total = carrito.reduce(
		(acumulado, item) => acumulado + (Number(item.precio_unitario) * Number(item.cantidad)),
		0
	);

	carritoCantidad.textContent = cantidadTotal.toString();
	carritoTotal.textContent = formatearMoneda(total);
	actualizarBotonCarritoMovil();

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
		const descripcion =
			producto.descripcion_producto && producto.descripcion_producto.trim() !== ''
				? producto.descripcion_producto
				: 'Producto disponible en Dulce Mordisco.';

		let claseStock = 'stock-ok';
		let textoStock = 'Disponible';
		let textoBoton = 'Agregar';

		if (stockActual <= 0) {
			claseStock = 'stock-low';
			textoStock = 'Agotado / personalizado';
			textoBoton = 'Pedir personalizado';
		} else if (cantidadEnCarrito >= stockActual) {
			claseStock = 'stock-low';
			textoStock = 'Stock cubierto / personalizado';
			textoBoton = 'Agregar más';
		}

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
						<div class="stock-badge ${claseStock}">
							${textoStock}
						</div>

						<button class="btn-add" data-id="${producto.id_producto}">
							${textoBoton}
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

	productosFiltrados = productosFiltrados.filter((producto) => producto.visible === true);

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
		filtroCategoria.innerHTML = '<option value="">Todas</option>';

		categoriasOriginales.forEach((categoria) => {
			const option = document.createElement('option');
			option.value = categoria.id_categoria;
			option.textContent = categoria.nombre_categoria;
			filtroCategoria.appendChild(option);
		});
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
			listaProductos.innerHTML = `
				<div class="empty-state">
					No se pudieron cargar los productos.
				</div>
			`;
			return;
		}

		productosOriginales = data ?? [];

		carrito = carrito.map((item) => {
			const productoActual = productosOriginales.find(
				(producto) => Number(producto.id_producto) === Number(item.id_producto)
			);

			if (!productoActual) {
				return item;
			}

			return recalcularEstadoItemCarrito(item, productoActual);
		});

		guardarCarrito();
		renderizarCarrito();
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

function esCorreoValido(correo) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function esPedidoParaRecoger() {
	return tipoEntregaPedido?.value === 'recoger';
}

function actualizarEstadoLugarEntrega() {
	if (!lugarEntrega) {
		return;
	}

	if (esPedidoParaRecoger()) {
		lugarEntrega.value = '';
		lugarEntrega.disabled = true;
		lugarEntrega.placeholder = 'No se necesita direccion porque pasaras por el pedido a la tienda.';
		limpiarMensaje();
		return;
	}

	lugarEntrega.disabled = false;
	lugarEntrega.placeholder = 'Escribe tu direccion completa de entrega';
}

function validarFormularioInvitado() {
	const nombre = String(nombreInvitado?.value ?? '').trim();
	const correo = String(correoPedido?.value ?? '').trim();
	const telefono = String(telefonoPedido?.value ?? '').trim();
	const direccion = String(lugarEntrega?.value ?? '').trim();
	const paraRecoger = esPedidoParaRecoger();

	if (nombre === '') {
		mostrarMensaje('error', 'Debes escribir tu nombre.');
		nombreInvitado?.focus();
		return null;
	}

	if (correo === '') {
		mostrarMensaje('error', 'Debes escribir tu correo electrónico.');
		correoPedido?.focus();
		return null;
	}

	if (!esCorreoValido(correo)) {
		mostrarMensaje('error', 'Debes escribir un correo electrónico válido.');
		correoPedido?.focus();
		return null;
	}

	if (telefono === '') {
		mostrarMensaje('error', 'Debes escribir tu número de teléfono.');
		telefonoPedido?.focus();
		return null;
	}

	if (!paraRecoger && direccion === '') {
		mostrarMensaje('error', 'Debes escribir la dirección de entrega.');
		lugarEntrega?.focus();
		return null;
	}

	return {
		nombre,
		correo,
		telefono,
		direccion: paraRecoger ? 'Recoger en tienda' : direccion,
		tipoEntrega: paraRecoger ? 'recoger' : 'domicilio'
	};
}

function pedidoTienePersonalizacion() {
	return carrito.some((item) => Boolean(item.es_personalizado));
}

function obtenerComentarioPedido() {
	const comentario = String(comentarioPedido?.value ?? '').trim();
	return comentario === '' ? null : comentario;
}

async function realizarPedidoInvitado() {
	limpiarMensaje();

	if (!carrito || carrito.length === 0) {
		mostrarMensaje('error', 'Agrega productos antes de realizar el pedido.');
		return;
	}

	const datosInvitado = validarFormularioInvitado();

	if (!datosInvitado) {
		return;
	}

	btnRealizarPedido.disabled = true;
	btnRealizarPedido.textContent = 'Procesando...';

	try {
		const total = carrito.reduce(
			(acumulado, item) => acumulado + (Number(item.precio_unitario) * Number(item.cantidad)),
			0
		);

		const detallesPedido = carrito.map((item) => ({
			id_producto: Number(item.id_producto),
			cantidad: Number(item.cantidad),
			subtotal: Number(item.precio_unitario) * Number(item.cantidad)
		}));

		const huboPersonalizacion = pedidoTienePersonalizacion();

		const { data: idPedido, error } = await db.rpc('procesar_pedido_invitado', {
			p_nombre_invitado: datosInvitado.nombre,
			p_correo_contacto: datosInvitado.correo,
			p_telefono_contacto: datosInvitado.telefono,
			p_direccion_contacto: datosInvitado.direccion,
			p_total: Number(total),
			p_lugar_entrega: datosInvitado.direccion,
			p_tipo_entrega: datosInvitado.tipoEntrega,
			p_comentario_pedido: obtenerComentarioPedido(),
			p_detalles: detallesPedido
		});

		if (error || !idPedido) {
			console.error('Error al procesar pedido invitado:', error);
			throw new Error('No se pudo crear el pedido como invitado.');
		}

		carrito = [];
		guardarCarrito();
		renderizarCarrito();
		await cargarProductos();

		nombreInvitado.value = '';
		correoPedido.value = '';
		telefonoPedido.value = '';
		if (tipoEntregaPedido) {
			tipoEntregaPedido.value = 'domicilio';
		}
		lugarEntrega.value = '';
		if (comentarioPedido) {
			comentarioPedido.value = '';
		}
		actualizarEstadoLugarEntrega();

		if (huboPersonalizacion) {
			mostrarMensaje(
				'success',
				`Pedido realizado correctamente. Tu número de pedido es #${idPedido}. Se registró como pedido personalizado porque uno o más productos requieren preparación adicional.`
			);
		} else {
			mostrarMensaje(
				'success',
				`Pedido realizado correctamente. Tu número de pedido es #${idPedido}.`
			);
		}

		mostrarModalConfirmacion();
	} catch (error) {
		console.error('Error al realizar pedido invitado:', error);
		mostrarMensaje('error', error.message || 'No se pudo realizar el pedido.');
	} finally {
		btnRealizarPedido.disabled = false;
		btnRealizarPedido.textContent = 'Realizar pedido';
	}
}

async function obtenerIdRolCliente() {
	const { data, error } = await db
		.from('rol')
		.select('id_rol, nombre_rol')
		.ilike('nombre_rol', 'Cliente')
		.limit(1)
		.single();

	if (error || !data) {
		console.error('No se pudo obtener el rol Cliente:', error);
		throw new Error('No se encontró el rol Cliente en la base de datos.');
	}

	return Number(data.id_rol);
}

function generarNombreUsuarioAutomatico(nombreCompleto, correo) {
	const baseCorreo = correo
		.split('@')[0]
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, '');

	const baseNombre = nombreCompleto
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '_')
		.replace(/[^a-z0-9_]/g, '');

	return baseCorreo || baseNombre || `cliente_${Date.now()}`;
}

function validarRegistroModal() {
	const nombreCompleto = String(registroNombreCompleto?.value ?? '').trim();
	const correo = String(registroCorreo?.value ?? '').trim();
	const contrasena = String(registroContrasena?.value ?? '');
	const confirmarContrasena = String(registroConfirmarContrasena?.value ?? '');

	if (nombreCompleto === '') {
		mostrarMensajeRegistro('error', 'Debes escribir tu nombre completo.');
		registroNombreCompleto?.focus();
		return null;
	}

	if (correo === '') {
		mostrarMensajeRegistro('error', 'Debes escribir tu correo.');
		registroCorreo?.focus();
		return null;
	}

	if (!esCorreoValido(correo)) {
		mostrarMensajeRegistro('error', 'Debes escribir un correo válido.');
		registroCorreo?.focus();
		return null;
	}

	if (contrasena.trim() === '') {
		mostrarMensajeRegistro('error', 'Debes escribir una contraseña.');
		registroContrasena?.focus();
		return null;
	}

	if (confirmarContrasena.trim() === '') {
		mostrarMensajeRegistro('error', 'Debes confirmar la contraseña.');
		registroConfirmarContrasena?.focus();
		return null;
	}

	if (contrasena !== confirmarContrasena) {
		mostrarMensajeRegistro('error', 'Las contraseñas no coinciden.');
		registroConfirmarContrasena?.focus();
		return null;
	}

	return {
		nombreCompleto,
		nombreUsuario: generarNombreUsuarioAutomatico(nombreCompleto, correo),
		correo,
		contrasena
	};
}

async function correoONombreUsuarioYaExiste(correo, nombreUsuario) {
	const correoEscapado = correo.replace(/,/g, '\\,');
	const nombreUsuarioEscapado = nombreUsuario.replace(/,/g, '\\,');

	const { data, error } = await db
		.from('usuario')
		.select('id_usuario, correo, nombreuser')
		.or(`correo.eq.${correoEscapado},nombreuser.eq.${nombreUsuarioEscapado}`);

	if (error) {
		console.error('Error al validar correo o nombre de usuario:', error);
		throw new Error('No se pudo validar la información del registro.');
	}

	return Array.isArray(data) && data.length > 0;
}

async function registrarUsuarioDesdeModal(event) {
	event.preventDefault();
	limpiarMensajeRegistro();

	const datosRegistro = validarRegistroModal();

	if (!datosRegistro) {
		return;
	}

	btnRegistrarModal.disabled = true;
	btnRegistrarModal.textContent = 'Registrando...';

	try {
		const existe = await correoONombreUsuarioYaExiste(
			datosRegistro.correo,
			datosRegistro.nombreUsuario
		);

		if (existe) {
			mostrarMensajeRegistro(
				'error',
				'El correo ya está registrado. Intenta iniciar sesión o usa otro correo.'
			);
			return;
		}

		const idRolCliente = await obtenerIdRolCliente();

		const { data, error } = await db
			.from('usuario')
			.insert({
				nombre_completo: datosRegistro.nombreCompleto,
				correo: datosRegistro.correo,
				contrasena: datosRegistro.contrasena,
				id_rol: idRolCliente,
				nombreuser: datosRegistro.nombreUsuario,
				estado: true
			})
			.select(`
				id_usuario,
				nombre_completo,
				correo,
				id_rol,
				telefono,
				direccion,
				nombreuser,
				estado
			`)
			.single();

		if (error || !data) {
			console.error('Error al registrar usuario:', error);
			throw new Error('No se pudo completar el registro.');
		}

		const usuarioSesion = {
			...data,
			nombre_rol: 'Cliente'
		};

		sessionStorage.setItem('microventa_usuario', JSON.stringify(usuarioSesion));
		localStorage.setItem('microventa_usuario', JSON.stringify(usuarioSesion));

		localStorage.removeItem('microventa_carrito_invitado');

		window.location.href = '/cliente/cliente.html';
	} catch (error) {
		console.error('Error general al registrar usuario:', error);
		mostrarMensajeRegistro('error', error.message || 'No se pudo completar el registro.');
	} finally {
		btnRegistrarModal.disabled = false;
		btnRegistrarModal.textContent = 'Crear cuenta';
	}
}

window.addEventListener('resize', () => {
	actualizarBotonCarritoMovil();
});

buscarProducto?.addEventListener('input', aplicarFiltros);
filtroCategoria?.addEventListener('change', aplicarFiltros);
btnVaciarCarrito?.addEventListener('click', vaciarCarrito);
btnRealizarPedido?.addEventListener('click', realizarPedidoInvitado);
btnCerrarModal?.addEventListener('click', cerrarModalConfirmacion);
tipoEntregaPedido?.addEventListener('change', actualizarEstadoLugarEntrega);

btnAbrirRegistro?.addEventListener('click', abrirModalRegistro);
btnAbrirRegistroSecundario?.addEventListener('click', abrirModalRegistro);
btnCerrarRegistro?.addEventListener('click', cerrarModalRegistro);
btnCancelarRegistro?.addEventListener('click', cerrarModalRegistro);
formRegistroModal?.addEventListener('submit', registrarUsuarioDesdeModal);
btnIrCarritoMovil?.addEventListener('click', enfocarCarrito);

modalConfirmacion?.addEventListener('click', (event) => {
	if (event.target === modalConfirmacion) {
		cerrarModalConfirmacion();
	}
});

modalRegistro?.addEventListener('click', (event) => {
	if (event.target === modalRegistro) {
		cerrarModalRegistro();
	}
});

(async function init() {
	cargarCarrito();
	renderizarCarrito();
	await cargarCategorias();
	await cargarProductos();
	actualizarEstadoLugarEntrega();
	actualizarBotonCarritoMovil();
})();
