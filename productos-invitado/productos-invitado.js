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
const domicilioCp = document.getElementById('domicilioCp');
const domicilioDetalles = document.getElementById('domicilioDetalles');
const domicilioColonia = document.getElementById('domicilioColonia');
const domicilioCalle = document.getElementById('domicilioCalle');
const domicilioNumero = document.getElementById('domicilioNumero');

const cartCard = document.getElementById('cartCard');
const btnIrCarritoMovil = document.getElementById('btnIrCarritoMovil');
const mobileCartCount = document.getElementById('mobileCartCount');

const modalConfirmacion = document.getElementById('modalConfirmacion');
const btnCerrarModal = document.getElementById('btnCerrarModal');

const modalSeparacionPedido = document.getElementById('modalSeparacionPedido');
const splitOrderSummary = document.getElementById('splitOrderSummary');
const splitPersonalizadoProductos = document.getElementById('splitPersonalizadoProductos');
const splitOrderMessage = document.getElementById('splitOrderMessage');
const splitNormalTipo = document.getElementById('splitNormalTipo');
const splitNormalCp = document.getElementById('splitNormalCp');
const splitNormalDetalles = document.getElementById('splitNormalDetalles');
const splitNormalColonia = document.getElementById('splitNormalColonia');
const splitNormalCalle = document.getElementById('splitNormalCalle');
const splitNormalNumero = document.getElementById('splitNormalNumero');
const splitNormalLugar = document.getElementById('splitNormalLugar');
const splitPersonalizadoTipo = document.getElementById('splitPersonalizadoTipo');
const splitPersonalizadoCp = document.getElementById('splitPersonalizadoCp');
const splitPersonalizadoDetalles = document.getElementById('splitPersonalizadoDetalles');
const splitPersonalizadoColonia = document.getElementById('splitPersonalizadoColonia');
const splitPersonalizadoCalle = document.getElementById('splitPersonalizadoCalle');
const splitPersonalizadoNumero = document.getElementById('splitPersonalizadoNumero');
const splitPersonalizadoLugar = document.getElementById('splitPersonalizadoLugar');
const btnConfirmarSeparacionPedido = document.getElementById('btnConfirmarSeparacionPedido');
const btnCancelarSeparacionPedido = document.getElementById('btnCancelarSeparacionPedido');
const modalDireccionInvalida = document.getElementById('modalDireccionInvalida');
const modalDireccionInvalidaTexto = document.getElementById('modalDireccionInvalidaTexto');
const btnCerrarModalDireccionInvalida = document.getElementById('btnCerrarModalDireccionInvalida');
const modalResenas = document.getElementById('modalResenas');
const btnCerrarModalResenas = document.getElementById('btnCerrarModalResenas');
const resumenResenas = document.getElementById('resumenResenas');
const promedioResenas = document.getElementById('promedioResenas');
const estrellasPromedioResenas = document.getElementById('estrellasPromedioResenas');
const conteoResenas = document.getElementById('conteoResenas');
const listaResenas = document.getElementById('listaResenas');
const formularioResena = document.getElementById('formularioResena');
const calificacionResena = document.getElementById('calificacionResena');
const comentariosRapidosResena = document.getElementById('comentariosRapidosResena');
const comentarioResenaWrapper = document.getElementById('comentarioResenaWrapper');
const comentarioResena = document.getElementById('comentarioResena');
const btnEnviarResena = document.getElementById('btnEnviarResena');
const OPCIONES_COMENTARIO_RESENA = [
	'Delicioso',
	'Buena presentacion',
	'Suficiente cantidad',
	'Excelente sabor',
	'Muy recomendable',
	'Otro'
];

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
const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let productosOriginales = [];
let categoriasOriginales = [];
let carrito = [];
let usuarioActual = null;
const cacheCodigosPostales = new Map();

const AWS_REGION = 'us-east-2';
const AWS_LOCATION_KEY = 'v1.public.eyJqdGkiOiI4OTY5OGIyYy1hZmQyLTQyYmItYjZjNi0xZTAwNWU2MWY2N2UifRfhEn2cmnsmQT2oZxWtopI2LigByNeDiy0oA3Zqm4Yej9MvT33_zzXMYaad7gCh1zuVnyCyAUHBwg5htBa5nQhuCY4ViXzP8lO94Nx6tD3EqmkvjIKEvR3d4JCTYoFcHdOWKmOmUEeSKKiFNpK0e6E4fk7mvX4a5pdSEnv3zvu6ohA7qEvycpJsUjuP7h8FT6p5gLLp6XUfV-CQSqxKAzU2waRJGNvFlJttMF7KXBgli9nErtyG7Hyz56FDKL0GlLwC7Wl3-3xjcXNz7AY5Yd4TQXh97P3AUuZ-DoCXaGsG3NZdCqT42UvsTcDYmE49e97pyeBwCR5BMuOdH_a-YOU.NjAyMWJkZWUtMGMyOS00NmRkLThjZTMtODEyOTkzZTUyMTBi';
const AWS_BIAS_POSITION = [-104.8957, 21.5095];
const MUNICIPIOS_PERMITIDOS = [
	'tepic',
	'xalisco',
	'ixtlan del rio',
	'ixtlan del río'
];
const MAP_STYLE = {
	version: 8,
	sources: {
		'osm-raster': {
			type: 'raster',
			tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
			tileSize: 256,
			attribution: '© OpenStreetMap contributors'
		}
	},
	layers: [
		{
			id: 'osm-raster-layer',
			type: 'raster',
			source: 'osm-raster',
			minzoom: 0,
			maxzoom: 19
		}
	]
};
const MAP_CENTER_TEPIC = [-104.8957, 21.5095];

let mapaPrincipal = null;
let marcadorPrincipal = null;

const domicilioPrincipal = {
	cp: domicilioCp,
	detalles: domicilioDetalles,
	colonia: domicilioColonia,
	calle: domicilioCalle,
	numero: domicilioNumero,
	lugar: lugarEntrega
};

const domicilioSplitNormal = {
	cp: splitNormalCp,
	detalles: splitNormalDetalles,
	colonia: splitNormalColonia,
	calle: splitNormalCalle,
	numero: splitNormalNumero,
	lugar: splitNormalLugar
};

const domicilioSplitPersonalizado = {
	cp: splitPersonalizadoCp,
	detalles: splitPersonalizadoDetalles,
	colonia: splitPersonalizadoColonia,
	calle: splitPersonalizadoCalle,
	numero: splitPersonalizadoNumero,
	lugar: splitPersonalizadoLugar
};

const estadoAutocompleteDireccion = {
	principal: {
		input: null,
		suggestions: null,
		status: null,
		wrapper: null,
		anchorId: 'direccionEntregaAnchor',
		temporizador: null,
		controlador: null,
		seleccionando: false,
		latitud: null,
		longitud: null,
		lugar: lugarEntrega,
		legacyCp: domicilioCp,
		legacyDetalles: domicilioDetalles,
		legacyColonia: domicilioColonia,
		legacyCalle: domicilioCalle,
		legacyNumero: domicilioNumero
	},
	splitNormal: {
		input: null,
		suggestions: null,
		status: null,
		wrapper: null,
		anchorId: 'splitNormalDireccionAnchor',
		temporizador: null,
		controlador: null,
		seleccionando: false,
		latitud: null,
		longitud: null,
		lugar: splitNormalLugar,
		legacyCp: splitNormalCp,
		legacyDetalles: splitNormalDetalles,
		legacyColonia: splitNormalColonia,
		legacyCalle: splitNormalCalle,
		legacyNumero: splitNormalNumero
	},
	splitPersonalizado: {
		input: null,
		suggestions: null,
		status: null,
		wrapper: null,
		anchorId: 'splitPersonalizadoDireccionAnchor',
		temporizador: null,
		controlador: null,
		seleccionando: false,
		latitud: null,
		longitud: null,
		lugar: splitPersonalizadoLugar,
		legacyCp: splitPersonalizadoCp,
		legacyDetalles: splitPersonalizadoDetalles,
		legacyColonia: splitPersonalizadoColonia,
		legacyCalle: splitPersonalizadoCalle,
		legacyNumero: splitPersonalizadoNumero
	}
};

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

function mostrarModalDireccionInvalida(texto) {
	if (!modalDireccionInvalida) {
		window.alert(texto);
		return;
	}

	if (modalDireccionInvalidaTexto) {
		modalDireccionInvalidaTexto.textContent = texto;
	}

	modalDireccionInvalida.classList.remove('hidden');
}

function cerrarModalDireccionInvalida() {
	modalDireccionInvalida?.classList.add('hidden');
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

		const productosInvalidos = sincronizarCarritoConCatalogo();

		guardarCarrito();
		renderizarCarrito();
		aplicarFiltros();

		if (productosInvalidos.length > 0) {
			mostrarMensaje(
				'error',
				'Se eliminaron del carrito productos que ya no existen en el catalogo.'
			);
		}
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

function crearNodoDireccionAutocomplete(idBase, textoLabel, placeholder) {
	const wrapper = document.createElement('div');
	wrapper.className = 'form-group address-autocomplete';
	wrapper.innerHTML = `
		<label for="${idBase}">${textoLabel}</label>
		<input
			type="text"
			id="${idBase}"
			class="form-control"
			placeholder="${placeholder}"
			autocomplete="off"
		>
		<div id="${idBase}Suggestions" class="address-suggestions hidden"></div>
		<div id="${idBase}Status" class="address-status hidden"></div>
	`;

	return wrapper;
}

function ocultarBloqueLegacyDireccion(...elementos) {
	elementos.forEach((elemento) => {
		if (!elemento) {
			return;
		}

		const grupo = elemento.closest('.form-group');
		if (grupo) {
			grupo.classList.add('hidden');
		} else {
			elemento.classList.add('hidden');
		}
	});
}

function inicializarCampoDireccion(config, inputId) {
	const anchor = document.getElementById(config.anchorId);

	if (!anchor) {
		return;
	}

	const nodo = crearNodoDireccionAutocomplete(
		inputId,
		'Direccion de entrega',
		'Escribe calle, numero, colonia o ciudad'
	);

	anchor.replaceWith(nodo);
	config.wrapper = nodo;
	config.input = nodo.querySelector(`#${inputId}`);
	config.suggestions = nodo.querySelector(`#${inputId}Suggestions`);
	config.status = nodo.querySelector(`#${inputId}Status`);

	ocultarBloqueLegacyDireccion(
		config.legacyCp,
		config.legacyDetalles,
		config.legacyColonia,
		config.legacyCalle,
		config.legacyNumero
	);
}

function mostrarEstadoDireccionCampo(campo, texto, tipo = 'normal') {
	if (!campo?.status) {
		return;
	}

	campo.status.textContent = texto;
	campo.status.classList.remove('hidden');

	if (tipo === 'error') {
		campo.status.style.color = 'var(--rojo)';
	} else if (tipo === 'success') {
		campo.status.style.color = 'var(--verde)';
	} else {
		campo.status.style.color = 'var(--rosa-oscuro)';
	}
}

function sincronizarCarritoConCatalogo() {
	const productosInvalidos = [];

	carrito = carrito.filter((item) => {
		const productoActual = productosOriginales.find(
			(producto) => Number(producto.id_producto) === Number(item.id_producto)
		);

		if (!productoActual) {
			productosInvalidos.push(
				String(item.nombre_producto ?? `ID ${item.id_producto}`).trim()
			);
			return false;
		}

		recalcularEstadoItemCarrito(item, productoActual);
		return true;
	});

	return productosInvalidos;
}

function ocultarEstadoDireccionCampo(campo) {
	if (!campo?.status) {
		return;
	}

	campo.status.textContent = '';
	campo.status.classList.add('hidden');
	campo.status.style.color = '';
}

function ocultarSugerenciasDireccionCampo(campo) {
	if (!campo?.suggestions) {
		return;
	}

	campo.suggestions.innerHTML = '';
	campo.suggestions.classList.add('hidden');
}

function normalizarTextoDireccion(valor) {
	return String(valor ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

function direccionPermitidaAws(item) {
	const texto = normalizarTextoDireccion([
		item?.Address?.Label,
		item?.Address?.Locality,
		item?.Address?.SubRegion,
		item?.Address?.Region,
		item?.Title
	].filter(Boolean).join(' '));

	return MUNICIPIOS_PERMITIDOS.some((municipio) => {
		return texto.includes(normalizarTextoDireccion(municipio));
	});
}

function obtenerDireccionAws(item) {
	return item?.Address?.Label || item?.Title || '';
}

function obtenerTituloDireccion(item) {
	return item?.Title || item?.Address?.Label || 'Direccion';
}

function construirTextoSecundarioDireccion(item) {
	const address = item?.Address ?? {};
	const partes = [];

	if (address.Neighborhood) partes.push(address.Neighborhood);
	if (address.SubRegion) partes.push(address.SubRegion);
	if (address.Locality) partes.push(address.Locality);
	if (address.Region) partes.push(address.Region);
	if (address.PostalCode) partes.push(address.PostalCode);
	if (address.Country) partes.push(address.Country);

	return partes
		.filter(Boolean)
		.filter((valor, index, arreglo) => arreglo.indexOf(valor) === index)
		.join(', ') || obtenerDireccionAws(item);
}

function obtenerMensajeCoberturaDireccion(etiqueta = 'el pedido') {
	return `La direccion para ${etiqueta} debe tener coordenadas validas dentro de Tepic, Xalisco o Ixtlan del Rio. Selecciona una sugerencia valida o ajusta el punto en el mapa.`;
}

async function buscarAutocompleteAws(campo, texto) {
	const url = `https://places.geo.${AWS_REGION}.amazonaws.com/v2/autocomplete?key=${AWS_LOCATION_KEY}`;

	const respuesta = await fetch(url, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			QueryText: texto,
			Language: 'es',
			MaxResults: 8,
			Filter: {
				IncludeCountries: ['MEX']
			},
			BiasPosition: AWS_BIAS_POSITION
		}),
		signal: campo.controlador?.signal
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo consultar AWS Location.');
	}

	const data = await respuesta.json();
	const resultados = data.ResultItems ?? [];

	return resultados
		.filter((item) => obtenerDireccionAws(item) !== '')
		.filter(direccionPermitidaAws)
		.slice(0, 5);
}

async function geocodificarDireccionAws(direccion) {
	const texto = String(direccion ?? '').trim();

	if (!texto) {
		return null;
	}

	const url = `https://places.geo.${AWS_REGION}.amazonaws.com/v2/geocode?key=${AWS_LOCATION_KEY}`;

	const respuesta = await fetch(url, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			QueryText: texto,
			Language: 'es',
			MaxResults: 5,
			Filter: {
				IncludeCountries: ['MEX']
			},
			BiasPosition: AWS_BIAS_POSITION
		})
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo geocodificar la direccion.');
	}

	const data = await respuesta.json();
	const item = (data.ResultItems ?? []).find(direccionPermitidaAws);

	if (!item?.Position || !Array.isArray(item.Position)) {
		return null;
	}

	const longitud = Number(item.Position[0]);
	const latitud = Number(item.Position[1]);

	if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
		return null;
	}

	return {
		direccion: obtenerDireccionAws(item) || texto,
		latitud,
		longitud
	};
}

function obtenerCoordenadasTepic() {
	return {
		latitud: Number(MAP_CENTER_TEPIC[1]),
		longitud: Number(MAP_CENTER_TEPIC[0])
	};
}

function centrarMapaEnTepic() {
	const coordenadasTepic = obtenerCoordenadasTepic();
	moverMapaDireccion(coordenadasTepic.latitud, coordenadasTepic.longitud);
}

function esCampoDireccionPrincipal(campo) {
	return campo === estadoAutocompleteDireccion.principal;
}

function normalizarCoordenada(valor) {
	const texto = String(valor ?? '').trim();

	if (texto === '') {
		return null;
	}

	const numero = Number(texto);
	return Number.isFinite(numero) ? numero : null;
}

function sonCoordenadasMapaValidas(latitud, longitud) {
	const latitudNormalizada = normalizarCoordenada(latitud);
	const longitudNormalizada = normalizarCoordenada(longitud);

	if (latitudNormalizada === null || longitudNormalizada === null) {
		return false;
	}

	return !(latitudNormalizada === 0 && longitudNormalizada === 0);
}

function tieneCoordenadasCampoDireccion(campo) {
	return sonCoordenadasMapaValidas(campo?.latitud, campo?.longitud);
}

function leerCoordenadaDataset(valor) {
	const texto = String(valor ?? '').trim();

	if (texto === '') {
		return null;
	}

	const numero = Number(texto);
	return Number.isFinite(numero) ? numero : null;
}

function crearMapaDireccionPrincipal() {
	const campo = estadoAutocompleteDireccion.principal;

	if (!campo?.wrapper || document.getElementById('mapaDireccionEntrega')) {
		return;
	}

	const wrapperMapa = document.createElement('div');
	wrapperMapa.className = 'address-map-wrapper';
	wrapperMapa.innerHTML = `
		<div id="mapaDireccionEntrega" class="address-map"></div>
		<div class="address-map-help">
			Puedes seleccionar una sugerencia o tocar un punto del mapa para ajustar la ubicacion.
		</div>
	`;

	campo.wrapper.insertAdjacentElement('afterend', wrapperMapa);
}

function moverMapaDireccion(latitud, longitud) {
	if (!mapaPrincipal || !marcadorPrincipal) {
		return;
	}

	const latitudNormalizada = normalizarCoordenada(latitud);
	const longitudNormalizada = normalizarCoordenada(longitud);

	if (!sonCoordenadasMapaValidas(latitudNormalizada, longitudNormalizada)) {
		return;
	}

	const lngLat = [longitudNormalizada, latitudNormalizada];
	marcadorPrincipal.setLngLat(lngLat);
	mapaPrincipal.flyTo({
		center: lngLat,
		zoom: 16,
		essential: true
	});
}

function inicializarMapaDireccionPrincipal() {
	if (!window.maplibregl) {
		return;
	}

	const contenedorMapa = document.getElementById('mapaDireccionEntrega');

	if (!contenedorMapa || mapaPrincipal) {
		return;
	}

	mapaPrincipal = new maplibregl.Map({
		container: 'mapaDireccionEntrega',
		style: MAP_STYLE,
		center: MAP_CENTER_TEPIC,
		zoom: 13
	});

	mapaPrincipal.addControl(new maplibregl.NavigationControl(), 'top-right');

	marcadorPrincipal = new maplibregl.Marker({
		draggable: true
	})
		.setLngLat(MAP_CENTER_TEPIC)
		.addTo(mapaPrincipal);

	marcadorPrincipal.on('dragend', async () => {
		const posicion = marcadorPrincipal.getLngLat();
		await aplicarPuntoMapaComoDireccion(posicion.lat, posicion.lng);
	});

	mapaPrincipal.on('load', () => {
		if (tieneCoordenadasCampoDireccion(estadoAutocompleteDireccion.principal)) {
			moverMapaDireccion(
				estadoAutocompleteDireccion.principal.latitud,
				estadoAutocompleteDireccion.principal.longitud
			);
		} else {
			centrarMapaEnTepic();
		}
	});

	mapaPrincipal.on('click', async (event) => {
		await aplicarPuntoMapaComoDireccion(event.lngLat.lat, event.lngLat.lng);
	});
}

async function obtenerDireccionDesdeCoordenadasAws(latitud, longitud) {
	const url = `https://places.geo.${AWS_REGION}.amazonaws.com/v2/reverse-geocode?key=${AWS_LOCATION_KEY}`;

	const respuesta = await fetch(url, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			QueryPosition: [Number(longitud), Number(latitud)],
			Language: 'es',
			MaxResults: 5
		})
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo obtener la direccion desde el mapa.');
	}

	const data = await respuesta.json();
	const item = (data.ResultItems ?? []).find(direccionPermitidaAws);

	if (!item) {
		return null;
	}

	return {
		direccion: obtenerDireccionAws(item),
		latitud: Number(latitud),
		longitud: Number(longitud)
	};
}

function obtenerTextoDireccionCampo(campo) {
	return String(campo?.input?.value ?? '').trim();
}

function aplicarTextoDireccionCampo(campo, direccion) {
	if (!campo?.input) {
		return;
	}

	const texto = String(direccion ?? '').trim();
	campo.input.value = texto;
	campo.latitud = null;
	campo.longitud = null;

	if (campo.lugar) {
		campo.lugar.value = texto;
	}
}

function limpiarCampoDireccion(campo) {
	if (!campo?.input) {
		return;
	}

	campo.input.value = '';
	campo.latitud = null;
	campo.longitud = null;

	if (campo.lugar) {
		campo.lugar.value = '';
	}

	campo.input.disabled = false;
	ocultarSugerenciasDireccionCampo(campo);
	ocultarEstadoDireccionCampo(campo);

	if (esCampoDireccionPrincipal(campo)) {
		centrarMapaEnTepic();
	}
}

function habilitarCampoDireccion(campo, habilitado) {
	if (!campo?.input) {
		return;
	}

	campo.input.disabled = !habilitado;

	if (!habilitado) {
		ocultarSugerenciasDireccionCampo(campo);
	}
}

function obtenerWrapperMapaDireccionPrincipal() {
	const mapa = document.getElementById('mapaDireccionEntrega');
	return mapa?.closest('.address-map-wrapper') ?? null;
}

function actualizarVisibilidadCampoDireccion(campo, visible) {
	if (!campo) {
		return;
	}

	campo.wrapper?.classList.toggle('hidden', !visible);
	ocultarSugerenciasDireccionCampo(campo);
	ocultarEstadoDireccionCampo(campo);

	if (!esCampoDireccionPrincipal(campo)) {
		return;
	}

	obtenerWrapperMapaDireccionPrincipal()?.classList.toggle('hidden', !visible);

	if (visible && mapaPrincipal) {
		window.requestAnimationFrame(() => {
			mapaPrincipal?.resize();
		});
	}
}

function validarTextoDireccionCampo(campo, etiqueta, mostrarError = mostrarMensaje) {
	const direccion = obtenerTextoDireccionCampo(campo);

	if (direccion === '') {
		mostrarError('error', `Debes escribir la direccion para ${etiqueta}.`);
		campo.input?.focus();
		return null;
	}

	if (direccion.length < 8) {
		mostrarError('error', `La direccion para ${etiqueta} es demasiado corta.`);
		campo.input?.focus();
		return null;
	}

	if (campo.lugar) {
		campo.lugar.value = direccion;
	}

	return direccion;
}

function seleccionarSugerenciaDireccionCampo(
	campo,
	direccionCompleta,
	latitud = null,
	longitud = null,
	opciones = {}
) {
	const { mostrarEstado = true } = opciones;
	const latitudNormalizada = normalizarCoordenada(latitud);
	const longitudNormalizada = normalizarCoordenada(longitud);
	const tieneCoordenadasValidas = sonCoordenadasMapaValidas(
		latitudNormalizada,
		longitudNormalizada
	);

	if (!campo?.input) {
		return;
	}

	campo.input.value = direccionCompleta;
	campo.latitud = tieneCoordenadasValidas ? latitudNormalizada : null;
	campo.longitud = tieneCoordenadasValidas ? longitudNormalizada : null;

	if (campo.lugar) {
		campo.lugar.value = direccionCompleta;
	}

	if (esCampoDireccionPrincipal(campo)) {
		if (tieneCoordenadasValidas) {
			moverMapaDireccion(campo.latitud, campo.longitud);
		} else {
			centrarMapaEnTepic();
		}
	}

	ocultarSugerenciasDireccionCampo(campo);

	if (!mostrarEstado) {
		return;
	}

	if (tieneCoordenadasValidas) {
		mostrarEstadoDireccionCampo(campo, 'Sugerencia aplicada con coordenadas.', 'success');
	} else {
		mostrarEstadoDireccionCampo(campo, 'Sugerencia aplicada, pero sin coordenadas.', 'error');
	}

	setTimeout(() => {
		ocultarEstadoDireccionCampo(campo);
	}, 1800);
}

async function aplicarPuntoMapaComoDireccion(latitud, longitud) {
	const campo = estadoAutocompleteDireccion.principal;

	if (esPedidoParaRecoger()) {
		mostrarEstadoDireccionCampo(
			campo,
			'Cambia el tipo de entrega a domicilio para seleccionar una direccion.',
			'error'
		);
		return;
	}

	habilitarCampoDireccion(campo, true);

	try {
		mostrarEstadoDireccionCampo(campo, 'Obteniendo direccion con AWS...', 'normal');
		const resultado = await obtenerDireccionDesdeCoordenadasAws(latitud, longitud);

		if (!resultado?.direccion) {
			mostrarEstadoDireccionCampo(campo, 'No se encontro una direccion valida en ese punto.', 'error');
			return;
		}

		seleccionarSugerenciaDireccionCampo(
			campo,
			resultado.direccion,
			resultado.latitud,
			resultado.longitud
		);
	} catch (error) {
		console.error('Error al seleccionar punto del mapa:', error);
		mostrarEstadoDireccionCampo(campo, 'No se pudo obtener la direccion desde el mapa.', 'error');
	}
}

async function sincronizarDireccionPrincipalDesdeTexto(opciones = {}) {
	const { mostrarEstado = false } = opciones;
	const campo = estadoAutocompleteDireccion.principal;

	if (!campo?.input || esPedidoParaRecoger()) {
		return false;
	}

	const direccion = obtenerTextoDireccionCampo(campo);

	if (direccion === '') {
		return false;
	}

	if (tieneCoordenadasCampoDireccion(campo)) {
		moverMapaDireccion(campo.latitud, campo.longitud);
		return true;
	}

	try {
		if (mostrarEstado) {
			mostrarEstadoDireccionCampo(campo, 'Ubicando direccion en el mapa...', 'normal');
		}

		const resultado = await geocodificarDireccionAws(direccion);

		if (obtenerTextoDireccionCampo(campo) !== direccion) {
			return false;
		}

		if (!resultado?.direccion) {
			if (mostrarEstado) {
				mostrarEstadoDireccionCampo(campo, 'No se pudo ubicar esa direccion en el mapa.', 'error');
			}
			return false;
		}

		seleccionarSugerenciaDireccionCampo(
			campo,
			resultado.direccion || direccion,
			resultado.latitud,
			resultado.longitud,
			{ mostrarEstado }
		);
		return true;
	} catch (error) {
		console.error('Error al sincronizar direccion con el mapa:', error);
		if (mostrarEstado) {
			mostrarEstadoDireccionCampo(campo, 'No se pudo ubicar la direccion en el mapa.', 'error');
		}
		return false;
	}
}

function renderizarSugerenciasDireccionCampo(campo, resultados) {
	if (!campo?.suggestions) {
		return;
	}

	if (!Array.isArray(resultados) || resultados.length === 0) {
		campo.suggestions.innerHTML = `
			<div class="address-suggestion-item" style="cursor: default;">
				<span class="address-suggestion-main">No se encontraron coincidencias validas</span>
				<span class="address-suggestion-secondary">Solo se permiten direcciones de Tepic, Xalisco e Ixtlan del Rio.</span>
			</div>
		`;
		campo.suggestions.classList.remove('hidden');
		return;
	}

	campo.suggestions.innerHTML = resultados.map((item) => {
		const titulo = obtenerTituloDireccion(item);
		const secundario = construirTextoSecundarioDireccion(item);
		const direccion = obtenerDireccionAws(item);
		const latitud = Array.isArray(item.Position) ? Number(item.Position[1]) : '';
		const longitud = Array.isArray(item.Position) ? Number(item.Position[0]) : '';

		return `
			<button
				type="button"
				class="address-suggestion-item"
				data-direccion="${encodeURIComponent(direccion)}"
				data-latitud="${Number.isFinite(latitud) ? latitud : ''}"
				data-longitud="${Number.isFinite(longitud) ? longitud : ''}"
			>
				<span class="address-suggestion-main">${titulo}</span>
				<span class="address-suggestion-secondary">${secundario}</span>
			</button>
		`;
	}).join('');

	campo.suggestions.classList.remove('hidden');

	campo.suggestions.querySelectorAll('.address-suggestion-item').forEach((boton) => {
		boton.addEventListener('mousedown', (event) => {
			event.preventDefault();
			aplicarSugerenciaDesdeBotonCampo(campo, boton);
		});

		boton.addEventListener('touchstart', (event) => {
			event.preventDefault();
			aplicarSugerenciaDesdeBotonCampo(campo, boton);
		}, { passive: false });

		boton.addEventListener('click', (event) => {
			event.preventDefault();
			aplicarSugerenciaDesdeBotonCampo(campo, boton);
		});
	});
}

async function aplicarSugerenciaDesdeBotonCampo(campo, boton) {
	const direccion = decodeURIComponent(boton.dataset.direccion || '');
	const latitud = leerCoordenadaDataset(boton.dataset.latitud);
	const longitud = leerCoordenadaDataset(boton.dataset.longitud);

	if (!direccion) {
		return;
	}

	campo.seleccionando = true;
	mostrarEstadoDireccionCampo(campo, 'Obteniendo coordenadas con AWS...', 'normal');

	try {
		if (sonCoordenadasMapaValidas(latitud, longitud)) {
			seleccionarSugerenciaDireccionCampo(campo, direccion, latitud, longitud);
			return;
		}

		const resultado = await geocodificarDireccionAws(direccion);

		if (!resultado) {
			seleccionarSugerenciaDireccionCampo(campo, direccion, null, null);
			mostrarEstadoDireccionCampo(campo, 'Se aplico la direccion, pero no se encontraron coordenadas.', 'error');
			return;
		}

		seleccionarSugerenciaDireccionCampo(
			campo,
			resultado.direccion || direccion,
			resultado.latitud,
			resultado.longitud
		);
	} catch (error) {
		console.error('Error al geocodificar sugerencia con AWS:', error);
		seleccionarSugerenciaDireccionCampo(campo, direccion, null, null);
		mostrarEstadoDireccionCampo(campo, 'Se aplico la direccion, pero no se pudieron obtener coordenadas.', 'error');
	} finally {
		setTimeout(() => {
			campo.seleccionando = false;
		}, 200);
	}
}

async function buscarSugerenciasDireccionCampo(campo, texto) {
	const termino = texto.trim();

	campo.latitud = null;
	campo.longitud = null;

	if (termino.length < 5) {
		ocultarSugerenciasDireccionCampo(campo);
		ocultarEstadoDireccionCampo(campo);

		if (campo?.lugar) {
			campo.lugar.value = termino;
		}

		return;
	}

	try {
		if (campo.controlador) {
			campo.controlador.abort();
		}

		campo.controlador = new AbortController();
		mostrarEstadoDireccionCampo(campo, 'Buscando sugerencias con AWS...');
		const data = await buscarAutocompleteAws(campo, termino);
		renderizarSugerenciasDireccionCampo(campo, data);
		ocultarEstadoDireccionCampo(campo);

		if (campo?.lugar) {
			campo.lugar.value = termino;
		}
	} catch (error) {
		if (error.name === 'AbortError') {
			return;
		}

		console.error('Error al buscar sugerencias de direccion con AWS:', error);
		ocultarSugerenciasDireccionCampo(campo);
		mostrarEstadoDireccionCampo(campo, 'No se pudieron obtener sugerencias en este momento.', 'error');

		if (campo?.lugar) {
			campo.lugar.value = termino;
		}
	}
}

function programarBusquedaDireccionCampo(campo) {
	if (!campo?.input) {
		return;
	}

	clearTimeout(campo.temporizador);
	campo.temporizador = setTimeout(() => {
		buscarSugerenciasDireccionCampo(campo, campo.input.value);
	}, 450);
}

function vincularEventosCampoDireccion(campo) {
	if (!campo?.input) {
		return;
	}

	campo.input.addEventListener('input', () => {
		campo.latitud = null;
		campo.longitud = null;

		if (campo.lugar) {
			campo.lugar.value = campo.input.value.trim();
		}

		programarBusquedaDireccionCampo(campo);
	});

	campo.input.addEventListener('keydown', (event) => {
		if (event.key !== 'Enter' || !esCampoDireccionPrincipal(campo)) {
			return;
		}

		event.preventDefault();
		void sincronizarDireccionPrincipalDesdeTexto({ mostrarEstado: true });
	});

	campo.input.addEventListener('blur', () => {
		setTimeout(() => {
			if (!campo.seleccionando) {
				ocultarSugerenciasDireccionCampo(campo);
			}
		}, 180);

		if (esCampoDireccionPrincipal(campo)) {
			setTimeout(() => {
				void sincronizarDireccionPrincipalDesdeTexto();
			}, 200);
		}
	});
}

function inicializarAutocompletadoDirecciones() {
	inicializarCampoDireccion(estadoAutocompleteDireccion.principal, 'direccionEntregaTexto');
	inicializarCampoDireccion(estadoAutocompleteDireccion.splitNormal, 'splitNormalDireccionTexto');
	inicializarCampoDireccion(estadoAutocompleteDireccion.splitPersonalizado, 'splitPersonalizadoDireccionTexto');

	vincularEventosCampoDireccion(estadoAutocompleteDireccion.principal);
	vincularEventosCampoDireccion(estadoAutocompleteDireccion.splitNormal);
	vincularEventosCampoDireccion(estadoAutocompleteDireccion.splitPersonalizado);

	document.addEventListener('click', (event) => {
		[
			estadoAutocompleteDireccion.principal,
			estadoAutocompleteDireccion.splitNormal,
			estadoAutocompleteDireccion.splitPersonalizado
		].forEach((campo) => {
			const clicDentro =
				campo?.input?.contains(event.target) ||
				campo?.suggestions?.contains(event.target);

			if (!clicDentro) {
				ocultarSugerenciasDireccionCampo(campo);
			}
		});
	});

	crearMapaDireccionPrincipal();
	inicializarMapaDireccionPrincipal();
}

function limpiarDomicilioCampos(campos) {
	[campos.cp, campos.colonia, campos.calle, campos.numero].forEach((campo) => {
		if (campo) {
			campo.value = '';
			campo.disabled = false;
		}
	});

	if (campos.colonia) {
		campos.colonia.innerHTML = '<option value="">Primero escribe el CP</option>';
	}

	if (campos.lugar) {
		campos.lugar.value = '';
	}

	campos.datosCp = null;
	campos.detalles?.classList.add('hidden');
}

function mostrarDomicilioCp(campos, visible) {
	campos.cp?.closest('.form-group')?.classList.toggle('hidden', !visible);
	campos.detalles?.classList.toggle('hidden', !visible || String(campos.cp?.value ?? '').length !== 5);
}

function habilitarDomicilioCampos(campos, habilitado) {
	[campos.cp, campos.colonia, campos.calle, campos.numero].forEach((campo) => {
		if (campo) {
			campo.disabled = !habilitado;
		}
	});

	mostrarDomicilioCp(campos, habilitado);
}

function actualizarDetallesDomicilio(campos) {
	const cp = String(campos.cp?.value ?? '').replace(/\D/g, '').slice(0, 5);

	if (campos.cp && campos.cp.value !== cp) {
		campos.cp.value = cp;
	}

	if (cp.length === 5) {
		campos.detalles?.classList.remove('hidden');
		cargarOpcionesCodigoPostal(campos, cp);
	} else {
		campos.detalles?.classList.add('hidden');
		if (campos.colonia) {
			campos.colonia.innerHTML = '<option value="">Primero escribe el CP</option>';
		}
		if (campos.calle) campos.calle.value = '';
		if (campos.numero) campos.numero.value = '';
		campos.datosCp = null;
	}
}

function obtenerDomicilioEstructurado(campos) {
	return {
		cp: String(campos.cp?.value ?? '').trim(),
		colonia: String(campos.colonia?.value ?? '').trim(),
		calle: String(campos.calle?.value ?? '').trim(),
		numero: String(campos.numero?.value ?? '').trim(),
		datosCp: campos.datosCp ?? null
	};
}

function aplicarDomicilioEstructurado(campos, domicilio) {
	if (!domicilio || !campos.cp) {
		return;
	}

	campos.cp.value = domicilio.cp ?? '';
	campos.datosCp = domicilio.datosCp ?? null;

	if (campos.datosCp?.colonias?.length && campos.colonia) {
		campos.colonia.innerHTML = '<option value="">Selecciona una colonia</option>';
		campos.datosCp.colonias.forEach((colonia) => {
			const option = document.createElement('option');
			option.value = colonia;
			option.textContent = colonia;
			campos.colonia.appendChild(option);
		});
	}

	actualizarDetallesDomicilio(campos);

	if (campos.colonia) campos.colonia.value = domicilio.colonia ?? '';
	if (campos.calle) campos.calle.value = domicilio.calle ?? '';
	if (campos.numero) campos.numero.value = domicilio.numero ?? '';
}

async function consultarCodigoPostal(cp) {
	if (cacheCodigosPostales.has(cp)) {
		return cacheCodigosPostales.get(cp);
	}

	const respuesta = await fetch(`https://api.zippopotam.us/MX/${cp}`);

	if (!respuesta.ok) {
		cacheCodigosPostales.set(cp, null);
		return null;
	}

	const datos = await respuesta.json();
	const lugares = Array.isArray(datos.places) ? datos.places : [];
	const resultado = {
		cp,
		estado: datos.places?.[0]?.state ?? '',
		colonias: lugares
			.map((lugar) => String(lugar['place name'] ?? '').trim())
			.filter(Boolean)
			.sort((a, b) => a.localeCompare(b, 'es'))
	};

	cacheCodigosPostales.set(cp, resultado);
	return resultado;
}

async function cargarOpcionesCodigoPostal(campos, cp) {
	if (!campos.colonia || campos.cp?.dataset.cpCargado === cp) {
		return;
	}

	campos.cp.dataset.cpCargado = cp;
	campos.colonia.innerHTML = '<option value="">Buscando colonias...</option>';
	campos.colonia.disabled = true;
	campos.datosCp = null;

	try {
		const datosCp = await consultarCodigoPostal(cp);

		if (!datosCp || datosCp.colonias.length === 0) {
			campos.colonia.innerHTML = '<option value="">CP no encontrado</option>';
			campos.cp.dataset.cpCargado = '';
			return;
		}

		campos.datosCp = datosCp;
		campos.colonia.innerHTML = '<option value="">Selecciona una colonia</option>';
		datosCp.colonias.forEach((colonia) => {
			const option = document.createElement('option');
			option.value = colonia;
			option.textContent = colonia;
			campos.colonia.appendChild(option);
		});
	} catch (error) {
		console.error('Error al consultar codigo postal:', error);
		campos.colonia.innerHTML = '<option value="">No se pudo consultar el CP</option>';
		campos.cp.dataset.cpCargado = '';
	} finally {
		campos.colonia.disabled = false;
	}
}

function validarDomicilioCampos(campos, etiqueta, mostrarError = mostrarMensaje) {
	const cp = String(campos.cp?.value ?? '').trim();
	const colonia = String(campos.colonia?.value ?? '').trim();
	const calle = String(campos.calle?.value ?? '').trim();
	const numero = String(campos.numero?.value ?? '').trim();

	if (!/^\d{5}$/.test(cp)) {
		mostrarError('error', `Debes escribir un codigo postal valido de 5 digitos para ${etiqueta}.`);
		campos.cp?.focus();
		return null;
	}

	actualizarDetallesDomicilio(campos);

	if (colonia === '') {
		mostrarError('error', `Debes escribir la colonia para ${etiqueta}.`);
		campos.colonia?.focus();
		return null;
	}

	if (calle === '') {
		mostrarError('error', `Debes escribir la calle para ${etiqueta}.`);
		campos.calle?.focus();
		return null;
	}

	if (numero === '') {
		mostrarError('error', `Debes escribir el numero para ${etiqueta}.`);
		campos.numero?.focus();
		return null;
	}

	const direccion = `CP ${cp}, Colonia ${colonia}, Calle ${calle}, Numero ${numero}`;
	const direccionCompleta = campos.datosCp?.estado
		? `${direccion}, ${campos.datosCp.estado}`
		: direccion;

	if (campos.lugar) {
		campos.lugar.value = direccionCompleta;
	}

	return direccionCompleta;
}

function vincularDomicilioCampos(campos) {
	campos.cp?.addEventListener('input', () => actualizarDetallesDomicilio(campos));
}

function esPedidoParaRecoger() {
	return tipoEntregaPedido?.value === 'recoger';
}

function actualizarEstadoLugarEntrega() {
	if (!lugarEntrega) {
		return;
	}

	const campoDireccion = estadoAutocompleteDireccion.principal;

	if (esPedidoParaRecoger()) {
		actualizarVisibilidadCampoDireccion(campoDireccion, false);
		limpiarCampoDireccion(campoDireccion);
		habilitarCampoDireccion(campoDireccion, false);
		lugarEntrega.value = 'Recoger en tienda';
		limpiarMensaje();
		return;
	}

	actualizarVisibilidadCampoDireccion(campoDireccion, true);
	habilitarCampoDireccion(campoDireccion, true);
	lugarEntrega.value = obtenerTextoDireccionCampo(campoDireccion);

	if (!tieneCoordenadasCampoDireccion(campoDireccion) && obtenerTextoDireccionCampo(campoDireccion) === '') {
		centrarMapaEnTepic();
	}
}

function validarFormularioInvitado() {
	const nombre = String(nombreInvitado?.value ?? '').trim();
	const correo = String(correoPedido?.value ?? '').trim();
	const telefono = String(telefonoPedido?.value ?? '').trim();
	const paraRecoger = esPedidoParaRecoger();
	const direccion = paraRecoger
		? 'Recoger en tienda'
		: validarTextoDireccionCampo(estadoAutocompleteDireccion.principal, 'el pedido');

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

	if (!direccion) {
		return null;
	}

	return {
		nombre,
		correo,
		telefono,
		direccion,
		tipoEntrega: paraRecoger ? 'recoger' : 'domicilio',
		latitudEntrega: paraRecoger ? null : estadoAutocompleteDireccion.principal.latitud,
		longitudEntrega: paraRecoger ? null : estadoAutocompleteDireccion.principal.longitud
	};
}

function obtenerCantidadStockItem(item) {
	const cantidad = Math.max(0, Number(item.cantidad ?? 0));
	const cantidadStock = Math.max(0, Number(item.cantidad_stock ?? 0));

	return Math.min(cantidad, cantidadStock);
}

function obtenerCantidadPersonalizadaItem(item) {
	const cantidad = Math.max(0, Number(item.cantidad ?? 0));
	const cantidadStock = obtenerCantidadStockItem(item);
	const cantidadPersonalizada = Math.max(0, Number(item.cantidad_personalizada ?? 0));

	return Math.min(cantidad - cantidadStock, cantidadPersonalizada || (cantidad - cantidadStock));
}

function crearDetallePedido(item, cantidad) {
	return {
		id_producto: Number(item.id_producto),
		cantidad: Number(cantidad),
		subtotal: Number(item.precio_unitario) * Number(cantidad)
	};
}

function calcularTotalDetalles(detalles) {
	return detalles.reduce(
		(total, detalle) => total + Number(detalle.subtotal ?? 0),
		0
	);
}

function separarDetallesPedido() {
	const detallesNormales = [];
	const detallesPersonalizados = [];

	carrito.forEach((item) => {
		const cantidadStock = obtenerCantidadStockItem(item);
		const cantidadPersonalizada = obtenerCantidadPersonalizadaItem(item);

		if (cantidadStock > 0) {
			detallesNormales.push(crearDetallePedido(item, cantidadStock));
		}

		if (cantidadPersonalizada > 0) {
			detallesPersonalizados.push(crearDetallePedido(item, cantidadPersonalizada));
		}
	});

	return {
		normales: detallesNormales,
		personalizados: detallesPersonalizados
	};
}

function aplicarResultadoValidacionDireccion(campoDireccion, direccion, latitud, longitud) {
	if (!campoDireccion) {
		return;
	}

	campoDireccion.latitud = latitud;
	campoDireccion.longitud = longitud;

	if (campoDireccion.lugar) {
		campoDireccion.lugar.value = direccion;
	}

	if (campoDireccion.input) {
		seleccionarSugerenciaDireccionCampo(
			campoDireccion,
			direccion,
			latitud,
			longitud,
			{ mostrarEstado: false }
		);
	}
}

async function validarEntregaConCobertura(entregaPedido, opciones = {}) {
	const {
		campoDireccion = null,
		etiqueta = 'el pedido',
		mostrarError = null
	} = opciones;

	const tipoEntrega = entregaPedido?.tipoEntrega === 'recoger' ? 'recoger' : 'domicilio';

	if (tipoEntrega === 'recoger') {
		return {
			...entregaPedido,
			lugarEntrega: 'Recoger en tienda',
			latitudEntrega: null,
			longitudEntrega: null
		};
	}

	const direccion = String(entregaPedido?.lugarEntrega ?? '').trim();

	if (!direccion) {
		return null;
	}

	let resultado = null;

	try {
		if (
			Number.isFinite(Number(entregaPedido?.latitudEntrega)) &&
			Number.isFinite(Number(entregaPedido?.longitudEntrega))
		) {
			resultado = await obtenerDireccionDesdeCoordenadasAws(
				Number(entregaPedido.latitudEntrega),
				Number(entregaPedido.longitudEntrega)
			);
		}

		if (!resultado?.direccion) {
			resultado = await geocodificarDireccionAws(direccion);
		}
	} catch (error) {
		console.error('Error validando cobertura de direccion:', error);
	}

	if (!resultado?.direccion) {
		const mensaje = obtenerMensajeCoberturaDireccion(etiqueta);

		if (typeof mostrarError === 'function') {
			mostrarError('error', mensaje);
		}

		mostrarModalDireccionInvalida(mensaje);
		campoDireccion?.input?.focus();
		return null;
	}

	aplicarResultadoValidacionDireccion(
		campoDireccion,
		resultado.direccion,
		resultado.latitud,
		resultado.longitud
	);

	return {
		...entregaPedido,
		lugarEntrega: resultado.direccion,
		latitudEntrega: resultado.latitud,
		longitudEntrega: resultado.longitud
	};
}

async function crearPedidoInvitado(datosInvitado, detallesPedido, entregaPedido) {
	const total = calcularTotalDetalles(detallesPedido);
	const entregaPreparada = await validarEntregaConCobertura(entregaPedido);

	if (!entregaPreparada) {
		throw new Error(obtenerMensajeCoberturaDireccion('el pedido'));
	}

	const tipoEntrega = entregaPreparada.tipoEntrega === 'recoger' ? 'recoger' : 'domicilio';
	const lugarEntregaFinal = tipoEntrega === 'recoger'
		? 'Recoger en tienda'
		: entregaPreparada.lugarEntrega;

	const { data: idPedido, error } = await db.rpc('procesar_pedido_invitado', {
		p_nombre_invitado: datosInvitado.nombre,
		p_correo_contacto: datosInvitado.correo,
		p_telefono_contacto: datosInvitado.telefono,
		p_direccion_contacto: lugarEntregaFinal,
		p_total: Number(total),
		p_lugar_entrega: lugarEntregaFinal,
		p_tipo_entrega: tipoEntrega,
		p_latitud_entrega: tipoEntrega === 'recoger' ? null : entregaPreparada.latitudEntrega,
		p_longitud_entrega: tipoEntrega === 'recoger' ? null : entregaPreparada.longitudEntrega,
		p_comentario_pedido: obtenerComentarioPedido(),
		p_detalles: detallesPedido
	});

	if (error || !idPedido) {
		console.error('Error al procesar pedido invitado:', error);
		throw new Error('No se pudo crear el pedido como invitado.');
	}

	return idPedido;
}

function formatearIdsPedidos(idsPedidos) {
	return idsPedidos.map((idPedido) => `#${idPedido}`).join(' y ');
}

function obtenerProductosConPedidoPersonalizado() {
	return carrito
		.map((item) => ({
			nombre: item.nombre_producto,
			cantidad: obtenerCantidadPersonalizadaItem(item)
		}))
		.filter((item) => item.cantidad > 0);
}

function obtenerEntregaBase(datosInvitado) {
	return {
		tipoEntrega: datosInvitado.tipoEntrega,
		lugarEntrega: datosInvitado.tipoEntrega === 'recoger'
			? 'Recoger en tienda'
			: datosInvitado.direccion,
		direccionTexto: datosInvitado.tipoEntrega === 'domicilio'
			? datosInvitado.direccion
			: '',
		latitudEntrega: datosInvitado.tipoEntrega === 'domicilio'
			? (Number.isFinite(Number(datosInvitado.latitudEntrega)) ? Number(datosInvitado.latitudEntrega) : null)
			: null,
		longitudEntrega: datosInvitado.tipoEntrega === 'domicilio'
			? (Number.isFinite(Number(datosInvitado.longitudEntrega)) ? Number(datosInvitado.longitudEntrega) : null)
			: null
	};
}

function mostrarMensajeSeparacion(tipo, texto) {
	if (!splitOrderMessage) {
		return;
	}

	splitOrderMessage.className = `message ${tipo}`;
	splitOrderMessage.textContent = texto;
}

function actualizarCampoLugarSeparacion(tipoSelect, campoDireccion) {
	if (!tipoSelect || !campoDireccion?.input) {
		return;
	}

	if (tipoSelect.value === 'recoger') {
		actualizarVisibilidadCampoDireccion(campoDireccion, false);
		limpiarCampoDireccion(campoDireccion);
		if (campoDireccion.lugar) {
			campoDireccion.lugar.value = 'Recoger en tienda';
		}
		habilitarCampoDireccion(campoDireccion, false);
		return;
	}

	actualizarVisibilidadCampoDireccion(campoDireccion, true);
	habilitarCampoDireccion(campoDireccion, true);

	if (campoDireccion.lugar) {
		campoDireccion.lugar.value = obtenerTextoDireccionCampo(campoDireccion);
	}
}

function configurarEntregaSeparada(tipoSelect, campoDireccion, entregaBase) {
	if (!tipoSelect || !campoDireccion?.input) {
		return;
	}

	tipoSelect.value = entregaBase.tipoEntrega;
	limpiarCampoDireccion(campoDireccion);
	actualizarCampoLugarSeparacion(tipoSelect, campoDireccion);

	if (entregaBase.tipoEntrega === 'domicilio') {
		aplicarTextoDireccionCampo(campoDireccion, entregaBase.direccionTexto || entregaBase.lugarEntrega);
		campoDireccion.latitud = Number.isFinite(Number(entregaBase.latitudEntrega))
			? Number(entregaBase.latitudEntrega)
			: null;
		campoDireccion.longitud = Number.isFinite(Number(entregaBase.longitudEntrega))
			? Number(entregaBase.longitudEntrega)
			: null;
	}
}

function leerEntregaSeparada(tipoSelect, campoDireccion, etiqueta) {
	const tipoEntrega = tipoSelect?.value === 'recoger' ? 'recoger' : 'domicilio';
	const lugar = tipoEntrega === 'recoger'
		? 'Recoger en tienda'
		: validarTextoDireccionCampo(campoDireccion, etiqueta, mostrarMensajeSeparacion);

	if (!lugar) {
		return null;
	}

	return {
		tipoEntrega,
		lugarEntrega: lugar,
		latitudEntrega: tipoEntrega === 'domicilio' && Number.isFinite(Number(campoDireccion.latitud))
			? Number(campoDireccion.latitud)
			: null,
		longitudEntrega: tipoEntrega === 'domicilio' && Number.isFinite(Number(campoDireccion.longitud))
			? Number(campoDireccion.longitud)
			: null
	};
}

function abrirModalSeparacionPedido(detallesSeparados, entregaBase) {
	if (detallesSeparados.normales.length === 0 || detallesSeparados.personalizados.length === 0) {
		return Promise.resolve({
			normal: entregaBase,
			personalizado: entregaBase
		});
	}

	if (!modalSeparacionPedido) {
		return Promise.resolve(null);
	}

	const productosPersonalizados = obtenerProductosConPedidoPersonalizado();
	const textoProductos = productosPersonalizados
		.map((item) => `- ${item.nombre}: ${item.cantidad} unidad(es)`)
		.join('\n');

	if (splitOrderSummary) {
		splitOrderSummary.textContent =
			'Por sobrepasar el stock, se generaran dos pedidos. Puedes elegir una entrega distinta para cada uno.';
	}

	if (splitPersonalizadoProductos) {
		splitPersonalizadoProductos.textContent =
			`Se realizara aparte el pedido personalizado de: ${textoProductos.replace(/\n/g, ' ')}`;
	}

	if (splitOrderMessage) {
		splitOrderMessage.className = 'message';
		splitOrderMessage.textContent = '';
	}

	configurarEntregaSeparada(splitNormalTipo, estadoAutocompleteDireccion.splitNormal, entregaBase);
	configurarEntregaSeparada(splitPersonalizadoTipo, estadoAutocompleteDireccion.splitPersonalizado, entregaBase);
	modalSeparacionPedido.classList.remove('hidden');

	return new Promise((resolve) => {
		const cerrar = (resultado) => {
			modalSeparacionPedido.classList.add('hidden');
			btnConfirmarSeparacionPedido.onclick = null;
			btnCancelarSeparacionPedido.onclick = null;
			splitNormalTipo.onchange = null;
			splitPersonalizadoTipo.onchange = null;
			resolve(resultado);
		};

		splitNormalTipo.onchange = () => actualizarCampoLugarSeparacion(
			splitNormalTipo,
			estadoAutocompleteDireccion.splitNormal
		);
		splitPersonalizadoTipo.onchange = () => actualizarCampoLugarSeparacion(
			splitPersonalizadoTipo,
			estadoAutocompleteDireccion.splitPersonalizado
		);

		btnCancelarSeparacionPedido.onclick = () => cerrar(null);
		btnConfirmarSeparacionPedido.onclick = async () => {
			const entregaNormal = leerEntregaSeparada(
				splitNormalTipo,
				estadoAutocompleteDireccion.splitNormal,
				'pedido normal'
			);
			const entregaPersonalizada = leerEntregaSeparada(
				splitPersonalizadoTipo,
				estadoAutocompleteDireccion.splitPersonalizado,
				'pedido personalizado'
			);

			if (!entregaNormal || !entregaPersonalizada) {
				return;
			}

			const entregaNormalValidada = await validarEntregaConCobertura(
				entregaNormal,
				{
					campoDireccion: estadoAutocompleteDireccion.splitNormal,
					etiqueta: 'el pedido normal',
					mostrarError: mostrarMensajeSeparacion
				}
			);

			if (!entregaNormalValidada) {
				return;
			}

			const entregaPersonalizadaValidada = await validarEntregaConCobertura(
				entregaPersonalizada,
				{
					campoDireccion: estadoAutocompleteDireccion.splitPersonalizado,
					etiqueta: 'el pedido personalizado',
					mostrarError: mostrarMensajeSeparacion
				}
			);

			if (!entregaPersonalizadaValidada) {
				return;
			}

			cerrar({
				normal: entregaNormalValidada,
				personalizado: entregaPersonalizadaValidada
			});
		};
	});
}

function obtenerComentarioPedido() {
	const comentario = String(comentarioPedido?.value ?? '').trim();
	return comentario === '' ? null : comentario;
}

async function realizarPedidoInvitado() {
	limpiarMensaje();

	const productosInvalidos = sincronizarCarritoConCatalogo();

	if (productosInvalidos.length > 0) {
		guardarCarrito();
		renderizarCarrito();
		mostrarMensaje(
			'error',
			'Se quitaron del carrito productos que ya no existen. Revisa tu pedido antes de continuar.'
		);
		return;
	}

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
		const detallesSeparados = separarDetallesPedido();
		const idsPedidos = [];
		const entregaBaseValidada = await validarEntregaConCobertura(
			obtenerEntregaBase(datosInvitado),
			{
				campoDireccion: estadoAutocompleteDireccion.principal,
				etiqueta: 'el pedido',
				mostrarError: mostrarMensaje
			}
		);

		if (!entregaBaseValidada) {
			return;
		}

		const entregasPedido = await abrirModalSeparacionPedido(
			detallesSeparados,
			entregaBaseValidada
		);

		if (!entregasPedido) {
			return;
		}

		if (detallesSeparados.normales.length > 0) {
			const idPedidoNormal = await crearPedidoInvitado(
				datosInvitado,
				detallesSeparados.normales,
				entregasPedido.normal
			);
			idsPedidos.push(idPedidoNormal);
		}

		if (detallesSeparados.personalizados.length > 0) {
			const idPedidoPersonalizado = await crearPedidoInvitado(
				datosInvitado,
				detallesSeparados.personalizados,
				entregasPedido.personalizado
			);
			idsPedidos.push(idPedidoPersonalizado);
		}

		if (idsPedidos.length === 0) {
			throw new Error('No se encontraron productos validos para el pedido.');
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
		limpiarCampoDireccion(estadoAutocompleteDireccion.principal);
		if (comentarioPedido) {
			comentarioPedido.value = '';
		}
		actualizarEstadoLugarEntrega();

		if (detallesSeparados.normales.length > 0 && detallesSeparados.personalizados.length > 0) {
			mostrarMensaje(
				'success',
				`Pedido realizado correctamente. Se separo en pedido normal y pedido personalizado. Tus numeros de pedido son ${formatearIdsPedidos(idsPedidos)}.`
			);
		} else if (detallesSeparados.personalizados.length > 0) {
			mostrarMensaje(
				'success',
				`Pedido personalizado realizado correctamente. Tu numero de pedido es ${formatearIdsPedidos(idsPedidos)}.`
			);
		} else {
			mostrarMensaje(
				'success',
				`Pedido realizado correctamente. Tu numero de pedido es ${formatearIdsPedidos(idsPedidos)}.`
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

function normalizarRol(nombreRol) {
	return String(nombreRol ?? '').trim().toLowerCase();
}

function obtenerNombreRolPorId(idRol) {
	switch (Number(idRol)) {
		case 1:
			return 'administrador';
		case 2:
			return 'ayudante';
		case 3:
			return 'repartidor';
		case 4:
			return 'cliente';
		default:
			return '';
	}
}

function puedeComprar(usuarioData) {
	if (!usuarioData) {
		return false;
	}

	const rol = normalizarRol(usuarioData.nombre_rol || obtenerNombreRolPorId(usuarioData.id_rol));
	const idRol = Number(usuarioData.id_rol);

	return (
		rol === 'cliente' ||
		rol === 'repartidor' ||
		rol === 'administrador' ||
		rol === 'ayudante' ||
		idRol === 1 ||
		idRol === 2 ||
		idRol === 3 ||
		idRol === 4
	);
}

function puedeResenar() {
	return !!usuarioActual && puedeComprar(usuarioActual);
}

if (usuarioGuardado) {
	try {
		usuarioActual = JSON.parse(usuarioGuardado);
	} catch (error) {
		console.warn('No se pudo leer la sesion del usuario para resenas.', error);
		usuarioActual = null;
	}
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
		const nombreCategoria = producto.categoria?.nombre_categoria ?? 'Sin categoria';
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
			textoBoton = 'Agregar mas';
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

						<div class="product-actions">
							<button
								class="btn-reviews"
								data-id="${producto.id_producto}"
								data-name="${producto.nombre_producto}"
								type="button"
							>
								Ver resenas
							</button>

							<button class="btn-add" data-id="${producto.id_producto}" type="button">
								${textoBoton}
							</button>
						</div>
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

	const botonesResenas = listaProductos.querySelectorAll('.btn-reviews');
	botonesResenas.forEach((boton) => {
		boton.addEventListener('click', () => {
			const idProducto = Number(boton.getAttribute('data-id'));
			const nombreProducto = boton.getAttribute('data-name') ?? 'Producto';
			mostrarModalResenas(idProducto, nombreProducto);
		});
	});
}

let productoActualResena = null;
let opcionComentarioResenaSeleccionada = '';

function escaparHtmlResena(valor) {
	return String(valor ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function obtenerEstrellasResena(calificacion) {
	const valor = Math.max(0, Math.min(5, Number(calificacion) || 0));
	return '★'.repeat(valor) + '☆'.repeat(5 - valor);
}

function obtenerInicialResena(nombre) {
	const texto = String(nombre ?? '').trim();
	return texto ? texto.charAt(0).toUpperCase() : 'U';
}

function obtenerNombreVisibleUsuarioResena(resena) {
	return (
		resena?.usuario?.nombreuser ||
		resena?.usuario?.nombre_completo ||
		'Usuario'
	);
}

function actualizarResumenResenas(resenas) {
	if (!resumenResenas || !promedioResenas || !estrellasPromedioResenas || !conteoResenas) {
		return;
	}

	const total = Array.isArray(resenas) ? resenas.length : 0;
	const suma = total > 0
		? resenas.reduce((acumulado, resena) => acumulado + Number(resena.calificacion ?? 0), 0)
		: 0;
	const promedio = total > 0 ? suma / total : 0;

	promedioResenas.textContent = promedio.toFixed(1);
	estrellasPromedioResenas.textContent = obtenerEstrellasResena(Math.round(promedio));
	conteoResenas.textContent = `${total} resena(s)`;
	resumenResenas.classList.remove('hidden');
}

function actualizarCampoComentarioResena() {
	const usarComentarioLibre = opcionComentarioResenaSeleccionada === 'Otro';

	comentarioResenaWrapper?.classList.toggle('hidden', !usarComentarioLibre);

	if (!usarComentarioLibre && comentarioResena) {
		comentarioResena.value = '';
	}
}

function renderizarOpcionesComentarioResena() {
	if (!comentariosRapidosResena) {
		return;
	}

	comentariosRapidosResena.innerHTML = OPCIONES_COMENTARIO_RESENA.map((opcion) => `
		<button
			type="button"
			class="review-chip ${opcionComentarioResenaSeleccionada === opcion ? 'selected' : ''}"
			data-value="${escaparHtmlResena(opcion)}"
		>
			${escaparHtmlResena(opcion)}
		</button>
	`).join('');

	const botonesComentario = comentariosRapidosResena.querySelectorAll('.review-chip');
	botonesComentario.forEach((boton) => {
		boton.addEventListener('click', () => {
			opcionComentarioResenaSeleccionada = boton.dataset.value ?? '';
			renderizarOpcionesComentarioResena();
			actualizarCampoComentarioResena();

			if (opcionComentarioResenaSeleccionada === 'Otro') {
				comentarioResena?.focus();
			}
		});
	});
}

function reiniciarFormularioResena() {
	if (calificacionResena) {
		calificacionResena.value = '';
	}

	if (comentarioResena) {
		comentarioResena.value = '';
	}

	opcionComentarioResenaSeleccionada = '';
	renderizarOpcionesComentarioResena();
	actualizarCampoComentarioResena();
}

function obtenerComentarioResenaSeleccionado() {
	if (opcionComentarioResenaSeleccionada === 'Otro') {
		return String(comentarioResena?.value ?? '').trim();
	}

	return opcionComentarioResenaSeleccionada;
}

function obtenerAvisoResena() {
	if (!modalResenas) {
		return null;
	}

	let aviso = document.getElementById('mensajeResenaAcceso');

	if (!aviso) {
		aviso = document.createElement('p');
		aviso.id = 'mensajeResenaAcceso';
		formularioResena?.parentNode?.insertBefore(aviso, formularioResena.nextSibling);
	}

	return aviso;
}

function mostrarAvisoResena(texto) {
	const aviso = obtenerAvisoResena();

	if (!aviso) {
		return;
	}

	aviso.textContent = texto;
	aviso.classList.remove('hidden');
}

function ocultarAvisoResena() {
	const aviso = obtenerAvisoResena();

	if (!aviso) {
		return;
	}

	aviso.textContent = '';
	aviso.classList.add('hidden');
}

async function cargarResenas(idProducto) {
	try {
		const { data, error } = await db
			.from('reseñas_productos')
			.select(`
				id_reseña,
				comentario,
				calificacion,
				fecha,
				id_usuario,
				usuario (
					nombre_completo,
					nombreuser
				)
			`)
			.eq('id_producto', idProducto)
			.order('fecha', { ascending: false });

		if (error) {
			console.error('Error cargando resenas:', error);
			return [];
		}

		return data ?? [];
	} catch (error) {
		console.error('Error en cargarResenas:', error);
		return [];
	}
}

function renderizarResenas(resenas) {
	if (!listaResenas) {
		return;
	}

	actualizarResumenResenas(resenas);

	if (!resenas || resenas.length === 0) {
		listaResenas.innerHTML = `
			<p class="no-reviews">
				Aun no hay resenas para este producto. Se el primero en opinar.
			</p>
		`;
		return;
	}

	listaResenas.innerHTML = resenas.map((resena) => {
		const estrellas = obtenerEstrellasResena(resena.calificacion);
		const fecha = resena.fecha
			? new Date(resena.fecha).toLocaleDateString('es-MX', {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			})
			: '';
		const autor = obtenerNombreVisibleUsuarioResena(resena);
		const comentario = String(resena.comentario ?? '').trim() || 'Sin comentario';

		return `
			<div class="review-item">
				<div class="review-header">
					<div class="review-author-block">
						<span class="review-avatar">${escaparHtmlResena(obtenerInicialResena(autor))}</span>
						<div class="review-author-meta">
							<span class="review-author">${escaparHtmlResena(autor)}</span>
							<div class="review-date">${escaparHtmlResena(fecha)}</div>
						</div>
					</div>
					<span class="review-rating">${escaparHtmlResena(estrellas)} (${Number(resena.calificacion ?? 0)})</span>
				</div>
				<div class="review-comment">${escaparHtmlResena(comentario)}</div>
			</div>
		`;
	}).join('');
}

async function mostrarModalResenas(idProducto, nombreProducto) {
	productoActualResena = Number(idProducto);

	const tituloModal = modalResenas?.querySelector('h2');
	if (tituloModal) {
		tituloModal.textContent = `Resenas de ${nombreProducto}`;
	}

	const resenas = await cargarResenas(idProducto);
	renderizarResenas(resenas);

	if (puedeResenar()) {
		if (formularioResena) {
			formularioResena.style.display = 'block';
		}

		reiniciarFormularioResena();
		ocultarAvisoResena();
	} else {
		if (formularioResena) {
			formularioResena.style.display = 'none';
		}

		mostrarAvisoResena('Inicia sesion o registrate para dejar una resena.');
	}

	modalResenas?.classList.remove('hidden');
}

async function enviarResena() {
	if (!productoActualResena) {
		alert('No se encontro el producto para la resena.');
		return;
	}

	if (!usuarioActual || !puedeResenar()) {
		alert('Inicia sesion para dejar una resena.');
		return;
	}

	const calificacion = Number(calificacionResena?.value ?? 0);
	const comentario = obtenerComentarioResenaSeleccionado();

	if (!calificacion || calificacion < 1 || calificacion > 5) {
		alert('Por favor selecciona una calificacion valida.');
		return;
	}

	if (comentario === '') {
		alert('Selecciona un comentario rapido o elige "Otro" para escribir uno.');
		return;
	}

	try {
		const { error } = await db
			.from('reseñas_productos')
			.upsert(
				{
					id_producto: Number(productoActualResena),
					id_usuario: Number(usuarioActual.id_usuario),
					calificacion,
					comentario
				},
				{
					onConflict: 'id_producto,id_usuario'
				}
			);

		if (error) {
			console.error('Error enviando resena:', error);
			alert('Error al guardar la resena. Intentalo de nuevo.');
			return;
		}

		alert('Resena guardada exitosamente.');
		reiniciarFormularioResena();

		const resenas = await cargarResenas(productoActualResena);
		renderizarResenas(resenas);
	} catch (error) {
		console.error('Error en enviarResena:', error);
		alert('Error al enviar la resena.');
	}
}

function cerrarModalResenas() {
	modalResenas?.classList.add('hidden');
	productoActualResena = null;
	reiniciarFormularioResena();
}

btnCerrarModalResenas?.addEventListener('click', cerrarModalResenas);
btnEnviarResena?.addEventListener('click', enviarResena);
modalResenas?.addEventListener('click', (event) => {
	if (event.target === modalResenas) {
		cerrarModalResenas();
	}
});

window.addEventListener('resize', () => {
	actualizarBotonCarritoMovil();
});

buscarProducto?.addEventListener('input', aplicarFiltros);
filtroCategoria?.addEventListener('change', aplicarFiltros);
btnVaciarCarrito?.addEventListener('click', vaciarCarrito);
btnRealizarPedido?.addEventListener('click', realizarPedidoInvitado);
btnCerrarModal?.addEventListener('click', cerrarModalConfirmacion);
tipoEntregaPedido?.addEventListener('change', actualizarEstadoLugarEntrega);
btnCerrarModalDireccionInvalida?.addEventListener('click', cerrarModalDireccionInvalida);

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

modalDireccionInvalida?.addEventListener('click', (event) => {
	if (event.target === modalDireccionInvalida) {
		cerrarModalDireccionInvalida();
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
	inicializarAutocompletadoDirecciones();
	await cargarCategorias();
	await cargarProductos();
	actualizarEstadoLugarEntrega();
	actualizarBotonCarritoMovil();
})();
