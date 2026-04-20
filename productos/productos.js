const nombreCliente = document.getElementById('nombreCliente');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
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
const tipoEntregaPedido = document.getElementById('tipoEntregaPedido');
const lugarEntrega = document.getElementById('lugarEntrega');
const comentarioPedido = document.getElementById('comentarioPedido');
const domicilioCp = document.getElementById('domicilioCp');
const domicilioDetalles = document.getElementById('domicilioDetalles');
const domicilioColonia = document.getElementById('domicilioColonia');
const domicilioCalle = document.getElementById('domicilioCalle');
const domicilioNumero = document.getElementById('domicilioNumero');

const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebarContainer');
const mobileOverlay = document.getElementById('mobileOverlay');

const cartCard = document.getElementById('cartCard');
const btnIrCarritoMovil = document.getElementById('btnIrCarritoMovil');
const mobileCartCount = document.getElementById('mobileCartCount');

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

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let productosOriginales = [];
let categoriasOriginales = [];
let carrito = [];
const cacheCodigosPostales = new Map();

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

function normalizarRol(nombreRol) {
	return (nombreRol ?? '').toString().trim().toLowerCase();
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

	const rol = normalizarRol(usuarioData.nombre_rol);
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

if (!puedeComprar(usuario)) {
	window.location.href = '/login/login.html';
}

renderizarSidebar('productos');

if (nombreCliente) {
	nombreCliente.textContent = usuario.nombre_completo ?? 'Usuario';
}

function guardarUsuarioEnStorage() {
	const usuarioParaGuardar = {
		...usuario,
		id_rol: Number(usuario.id_rol),
		nombre_rol: normalizarRol(
			usuario.nombre_rol || obtenerNombreRolPorId(usuario.id_rol)
		)
	};

	const usuarioSerializado = JSON.stringify(usuarioParaGuardar);

	if (sessionStorage.getItem('microventa_usuario')) {
		sessionStorage.setItem('microventa_usuario', usuarioSerializado);
	}

	if (localStorage.getItem('microventa_usuario')) {
		localStorage.setItem('microventa_usuario', usuarioSerializado);
	}
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
				estado
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
			id_rol: Number(data.id_rol),
			nombre_rol: normalizarRol(
				usuario?.nombre_rol || obtenerNombreRolPorId(data.id_rol)
			)
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

/* =========================
	MENÚ MÓVIL
========================= */

function abrirMenuMovil() {
	if (!sidebar || !mobileOverlay) {
		return;
	}

	sidebar.classList.add('sidebar-open');
	mobileOverlay.classList.remove('hidden');
	document.body.style.overflow = 'hidden';
}

function cerrarMenuMovil() {
	if (!sidebar || !mobileOverlay) {
		return;
	}

	sidebar.classList.remove('sidebar-open');
	mobileOverlay.classList.add('hidden');
	document.body.style.overflow = '';
}

function vincularCierreMenuEnSidebar() {
	if (!sidebar) {
		return;
	}

	const enlacesSidebar = sidebar.querySelectorAll('a, button');

	enlacesSidebar.forEach((elemento) => {
		elemento.addEventListener('click', () => {
			if (window.innerWidth <= 900) {
				cerrarMenuMovil();
			}
		});
	});
}

if (btnMenu) {
	btnMenu.addEventListener('click', () => {
		if (sidebar.classList.contains('sidebar-open')) {
			cerrarMenuMovil();
		} else {
			abrirMenuMovil();
		}
	});
}

if (mobileOverlay) {
	mobileOverlay.addEventListener('click', cerrarMenuMovil);
}

window.addEventListener('resize', () => {
	if (window.innerWidth > 900) {
		cerrarMenuMovil();
	}

	actualizarBotonCarritoMovil();
});

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

function obtenerTelefonoCapturado() {
	return String(telefonoPedido?.value ?? '').trim();
}

function tieneTelefonoRegistrado() {
	return obtenerTelefonoCapturado() !== '';
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

	try {
		const respuesta = await fetch(`https://api.zippopotam.us/MX/${cp}`);

		if (!respuesta.ok) {
			cacheCodigosPostales.set(cp, null);
			return null;
		}

		const datos = await respuesta.json();
		const lugares = Array.isArray(datos.places) ? datos.places : [];
		
		if (lugares.length === 0) {
			cacheCodigosPostales.set(cp, null);
			return null;
		}

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
	} catch (error) {
		console.error('Error al consultar código postal:', error);
		cacheCodigosPostales.set(cp, null);
		return null;
	}
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

function inicializarEntrega() {
	const direccionGuardada = (usuario?.direccion ?? '').trim();

	if (direccionPerfilInfo) {
		if (direccionGuardada !== '') {
			direccionPerfilInfo.textContent = `Dirección guardada: ${direccionGuardada}`;
			direccionPerfilInfo.classList.remove('hidden');
		} else {
			direccionPerfilInfo.textContent = 'No tienes una dirección guardada en tu perfil.';
			direccionPerfilInfo.classList.remove('hidden');
		}
	}

	actualizarInfoTelefono();

	if (usarDireccionPerfil) {
		usarDireccionPerfil.checked = false;
	}

	if (tipoEntregaPedido) {
		tipoEntregaPedido.value = 'domicilio';
	}

	if (lugarEntrega) {
		lugarEntrega.value = '';
	}

	actualizarEstadoLugarEntrega();
}

function esPedidoParaRecoger() {
	return tipoEntregaPedido?.value === 'recoger';
}

function actualizarEstadoLugarEntrega() {
	if (!usarDireccionPerfil || !lugarEntrega) {
		return;
	}

	if (esPedidoParaRecoger()) {
		usarDireccionPerfil.checked = false;
		usarDireccionPerfil.disabled = true;
		limpiarDomicilioCampos(domicilioPrincipal);
		habilitarDomicilioCampos(domicilioPrincipal, false);
		limpiarMensaje();
		return;
	}

	usarDireccionPerfil.disabled = false;
	habilitarDomicilioCampos(domicilioPrincipal, true);

	const direccionGuardada = (usuario?.direccion ?? '').trim();
	const usarPerfil = usarDireccionPerfil.checked;

	if (usarPerfil) {
		if (direccionGuardada === '') {
			usarDireccionPerfil.checked = false;
			mostrarMensaje(
				'error',
				'No puedes usar la dirección del perfil porque no tienes una guardada.'
			);
			limpiarDomicilioCampos(domicilioPrincipal);
			habilitarDomicilioCampos(domicilioPrincipal, true);
			return;
		}

		limpiarDomicilioCampos(domicilioPrincipal);
		lugarEntrega.value = direccionGuardada;
		habilitarDomicilioCampos(domicilioPrincipal, false);
		limpiarMensaje();
		return;
	}

	habilitarDomicilioCampos(domicilioPrincipal, true);
	if (lugarEntrega.value === direccionGuardada) {
		lugarEntrega.value = '';
	}
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

		if (carritoCantidad) {
			carritoCantidad.textContent = '0';
		}

		if (carritoTotal) {
			carritoTotal.textContent = '$0.00';
		}

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

	if (carritoCantidad) {
		carritoCantidad.textContent = cantidadTotal.toString();
	}

	if (carritoTotal) {
		carritoTotal.textContent = formatearMoneda(total);
	}

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

						<button
							class="btn-add"
							data-id="${producto.id_producto}"
						>
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

		if (listaProductos) {
			listaProductos.innerHTML = `
				<div class="empty-state">
					Ocurrió un error al consultar la información.
				</div>
			`;
		}
	}
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
	if (esPedidoParaRecoger()) {
		return 'Recoger en tienda';
	}

	const direccionGuardada = (usuario?.direccion ?? '').trim();

	if (usarDireccionPerfil?.checked && direccionGuardada !== '') {
		lugarEntrega.value = direccionGuardada;
		return direccionGuardada;
	}

	const lugar = validarDomicilioCampos(domicilioPrincipal, 'el pedido');

	if (!lugar) {
		return null;
	}

	return lugar;
}

function obtenerComentarioPedido() {
	const comentario = String(comentarioPedido?.value ?? '').trim();
	return comentario === '' ? null : comentario;
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

async function crearPedidoCliente(detallesPedido, entregaPedido) {
	const total = calcularTotalDetalles(detallesPedido);
	const tipoEntrega = entregaPedido.tipoEntrega === 'recoger' ? 'recoger' : 'domicilio';
	const lugarEntregaFinal = tipoEntrega === 'recoger'
		? 'Recoger en tienda'
		: entregaPedido.lugarEntrega;

	const { data: idPedido, error } = await db.rpc('procesar_pedido', {
		p_id_cliente: Number(usuario.id_usuario),
		p_total: Number(total),
		p_lugar_entrega: lugarEntregaFinal,
		p_tipo_entrega: tipoEntrega,
		p_comentario_pedido: obtenerComentarioPedido(),
		p_detalles: detallesPedido
	});

	if (error || !idPedido) {
		console.error('Error al procesar pedido:', error);
		throw new Error('No se pudo crear el pedido.');
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

function obtenerEntregaBase(lugarEntregaFinal) {
	const tipoEntrega = esPedidoParaRecoger() ? 'recoger' : 'domicilio';

	return {
		tipoEntrega,
		lugarEntrega: tipoEntrega === 'recoger' ? 'Recoger en tienda' : lugarEntregaFinal,
		domicilio: tipoEntrega === 'domicilio'
			? obtenerDomicilioEstructurado(domicilioPrincipal)
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

function actualizarCampoLugarSeparacion(tipoSelect, campos) {
	if (!tipoSelect || !campos?.cp) {
		return;
	}

	if (tipoSelect.value === 'recoger') {
		limpiarDomicilioCampos(campos);
		if (campos.lugar) {
			campos.lugar.value = 'Recoger en tienda';
		}
		habilitarDomicilioCampos(campos, false);
		return;
	}

	habilitarDomicilioCampos(campos, true);
	actualizarDetallesDomicilio(campos);
}

function configurarEntregaSeparada(tipoSelect, campos, entregaBase) {
	if (!tipoSelect || !campos?.cp) {
		return;
	}

	tipoSelect.value = entregaBase.tipoEntrega;
	limpiarDomicilioCampos(campos);
	actualizarCampoLugarSeparacion(tipoSelect, campos);

	if (entregaBase.tipoEntrega === 'domicilio') {
		aplicarDomicilioEstructurado(campos, entregaBase.domicilio);
	}
}

function leerEntregaSeparada(tipoSelect, campos, etiqueta) {
	const tipoEntrega = tipoSelect?.value === 'recoger' ? 'recoger' : 'domicilio';
	const lugar = tipoEntrega === 'recoger'
		? 'Recoger en tienda'
		: validarDomicilioCampos(campos, etiqueta, mostrarMensajeSeparacion);

	if (!lugar) {
		return null;
	}

	return {
		tipoEntrega,
		lugarEntrega: lugar
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

	configurarEntregaSeparada(splitNormalTipo, domicilioSplitNormal, entregaBase);
	configurarEntregaSeparada(splitPersonalizadoTipo, domicilioSplitPersonalizado, entregaBase);
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
			domicilioSplitNormal
		);
		splitPersonalizadoTipo.onchange = () => actualizarCampoLugarSeparacion(
			splitPersonalizadoTipo,
			domicilioSplitPersonalizado
		);

		btnCancelarSeparacionPedido.onclick = () => cerrar(null);
		btnConfirmarSeparacionPedido.onclick = () => {
			const entregaNormal = leerEntregaSeparada(
				splitNormalTipo,
				domicilioSplitNormal,
				'pedido normal'
			);
			const entregaPersonalizada = leerEntregaSeparada(
				splitPersonalizadoTipo,
				domicilioSplitPersonalizado,
				'pedido personalizado'
			);

			if (!entregaNormal || !entregaPersonalizada) {
				return;
			}

			cerrar({
				normal: entregaNormal,
				personalizado: entregaPersonalizada
			});
		};
	});
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
		const detallesSeparados = separarDetallesPedido();
		const idsPedidos = [];
		const entregaBase = obtenerEntregaBase(lugarEntregaFinal);
		const entregasPedido = await abrirModalSeparacionPedido(detallesSeparados, entregaBase);

		if (!entregasPedido) {
			return;
		}

		if (detallesSeparados.normales.length > 0) {
			const idPedidoNormal = await crearPedidoCliente(
				detallesSeparados.normales,
				entregasPedido.normal
			);
			idsPedidos.push(idPedidoNormal);
		}

		if (detallesSeparados.personalizados.length > 0) {
			const idPedidoPersonalizado = await crearPedidoCliente(
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

		if (usarDireccionPerfil) {
			usarDireccionPerfil.checked = false;
		}

		if (tipoEntregaPedido) {
			tipoEntregaPedido.value = 'domicilio';
		}

		if (lugarEntrega) {
			lugarEntrega.value = '';
		}

		limpiarDomicilioCampos(domicilioPrincipal);

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

if (tipoEntregaPedido) {
	tipoEntregaPedido.addEventListener('change', actualizarEstadoLugarEntrega);
}

if (btnIrCarritoMovil) {
	btnIrCarritoMovil.addEventListener('click', enfocarCarrito);
}

vincularDomicilioCampos(domicilioPrincipal);
vincularDomicilioCampos(domicilioSplitNormal);
vincularDomicilioCampos(domicilioSplitPersonalizado);

(async function init() {
	cargarCarrito();
	renderizarCarrito();
	await refrescarUsuarioDesdeBD();
	inicializarEntrega();
	cargarCategorias();
	cargarProductos();
	vincularCierreMenuEnSidebar();
	actualizarBotonCarritoMovil();
})();
