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

const modalResenas = document.getElementById('modalResenas');
const btnCerrarModalResenas = document.getElementById('btnCerrarModalResenas');
const listaResenas = document.getElementById('listaResenas');
const formularioResena = document.getElementById('formularioResena');
const calificacionResena = document.getElementById('calificacionResena');
const comentarioResena = document.getElementById('comentarioResena');
const btnEnviarResena = document.getElementById('btnEnviarResena');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let productosOriginales = [];
let categoriasOriginales = [];
let carrito = [];

const estadoAutocompleteDireccion = {
	principal: {
		input: null,
		suggestions: null,
		status: null,
		wrapper: null,
		temporizador: null,
		controlador: null,
		seleccionando: false,
		lugar: lugarEntrega
	},
	splitNormal: {
		input: null,
		suggestions: null,
		status: null,
		wrapper: null,
		temporizador: null,
		controlador: null,
		seleccionando: false,
		lugar: splitNormalLugar
	},
	splitPersonalizado: {
		input: null,
		suggestions: null,
		status: null,
		wrapper: null,
		temporizador: null,
		controlador: null,
		seleccionando: false,
		lugar: splitPersonalizadoLugar
	}
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

function obtenerRolUsuarioActual() {
	return normalizarRol(
		usuario?.nombre_rol || obtenerNombreRolPorId(usuario?.id_rol)
	);
}

function puedeResenar() {
	return !!usuario && puedeComprar(usuario);
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

/* =========================
	DIRECCIÓN CON AUTOCOMPLETADO
========================= */

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

function inicializarCampoDireccion(config) {
	if (!config?.lugar) {
		return;
	}

	const yaExisteInput = document.getElementById(config.inputId);
	const yaExisteSuggestions = document.getElementById(config.suggestionsId);
	const yaExisteStatus = document.getElementById(config.statusId);

	if (yaExisteInput && yaExisteSuggestions && yaExisteStatus) {
		config.input = yaExisteInput;
		config.suggestions = yaExisteSuggestions;
		config.status = yaExisteStatus;
		config.wrapper = yaExisteInput.closest('.address-autocomplete');
		return;
	}

	const nodo = crearNodoDireccionAutocomplete(
		config.inputId,
		config.label,
		config.placeholder
	);

	config.lugar.parentNode.insertBefore(nodo, config.lugar);

	config.input = nodo.querySelector(`#${config.inputId}`);
	config.suggestions = nodo.querySelector(`#${config.suggestionsId}`);
	config.status = nodo.querySelector(`#${config.statusId}`);
	config.wrapper = nodo;

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

function partsPushUnico(lista, valor) {
	if (!valor) {
		return;
	}

	if (!lista.includes(valor)) {
		lista.push(valor);
	}
}

function construirTextoSecundarioDireccion(item) {
	const partes = [];

	if (item.address?.suburb) partes.push(item.address.suburb);
	if (item.address?.city) partsPushUnico(partes, item.address.city);
	if (item.address?.town) partsPushUnico(partes, item.address.town);
	if (item.address?.state) partsPushUnico(partes, item.address.state);
	if (item.address?.postcode) partsPushUnico(partes, item.address.postcode);

	return partes.join(', ');
}

function obtenerTituloDireccion(item) {
	const address = item.address ?? {};
	const titulo = [];

	if (address.road) titulo.push(address.road);
	if (address.house_number) titulo.push(address.house_number);
	if (!titulo.length && item.name) titulo.push(item.name);
	if (!titulo.length && item.display_name) {
		return item.display_name.split(',')[0];
	}

	return titulo.join(' ');
}

function seleccionarSugerenciaDireccionCampo(campo, direccionCompleta) {
	if (!campo?.input) {
		return;
	}

	campo.input.value = direccionCompleta;

	if (campo.lugar) {
		campo.lugar.value = direccionCompleta;
	}

	ocultarSugerenciasDireccionCampo(campo);
	mostrarEstadoDireccionCampo(campo, 'Sugerencia aplicada.', 'success');

	setTimeout(() => {
		ocultarEstadoDireccionCampo(campo);
	}, 1800);
}

function aplicarSugerenciaDesdeBotonCampo(campo, boton) {
	const direccion = decodeURIComponent(boton.dataset.direccion || '');

	if (!direccion) {
		return;
	}

	campo.seleccionando = true;
	seleccionarSugerenciaDireccionCampo(campo, direccion);

	setTimeout(() => {
		campo.seleccionando = false;
	}, 200);
}

function renderizarSugerenciasDireccionCampo(campo, resultados) {
	if (!campo?.suggestions) {
		return;
	}

	if (!Array.isArray(resultados) || resultados.length === 0) {
		campo.suggestions.innerHTML = `
			<div class="address-suggestion-item" style="cursor: default;">
				<span class="address-suggestion-main">No se encontraron coincidencias</span>
				<span class="address-suggestion-secondary">Prueba escribiendo calle, colonia o ciudad.</span>
			</div>
		`;
		campo.suggestions.classList.remove('hidden');
		return;
	}

	campo.suggestions.innerHTML = resultados.map((item) => {
		const titulo = obtenerTituloDireccion(item);
		const secundario = construirTextoSecundarioDireccion(item) || item.display_name;

		return `
			<button
				type="button"
				class="address-suggestion-item"
				data-direccion="${encodeURIComponent(item.display_name)}"
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

async function buscarSugerenciasDireccionCampo(campo, texto) {
	const termino = texto.trim();

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

		mostrarEstadoDireccionCampo(campo, 'Buscando sugerencias...');

		const url = new URL('https://nominatim.openstreetmap.org/search');
		url.searchParams.set('q', termino);
		url.searchParams.set('format', 'jsonv2');
		url.searchParams.set('addressdetails', '1');
		url.searchParams.set('limit', '5');
		url.searchParams.set('countrycodes', 'mx');
		url.searchParams.set('accept-language', 'es');

		const respuesta = await fetch(url.toString(), {
			method: 'GET',
			signal: campo.controlador.signal,
			headers: {
				'Accept': 'application/json'
			}
		});

		if (!respuesta.ok) {
			throw new Error('No se pudo consultar el servicio de direcciones.');
		}

		const data = await respuesta.json();

		renderizarSugerenciasDireccionCampo(campo, data);
		ocultarEstadoDireccionCampo(campo);

		if (campo?.lugar) {
			campo.lugar.value = termino;
		}
	} catch (error) {
		if (error.name === 'AbortError') {
			return;
		}

		console.error('Error al buscar sugerencias de dirección:', error);
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

function limpiarCampoDireccion(campo) {
	if (!campo?.input) {
		return;
	}

	campo.input.value = '';

	if (campo.lugar) {
		campo.lugar.value = '';
	}

	campo.input.disabled = false;
	ocultarSugerenciasDireccionCampo(campo);
	ocultarEstadoDireccionCampo(campo);
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

function obtenerTextoDireccionCampo(campo) {
	return String(campo?.input?.value ?? '').trim();
}

function aplicarTextoDireccionCampo(campo, direccion) {
	if (!campo?.input) {
		return;
	}

	const texto = String(direccion ?? '').trim();
	campo.input.value = texto;

	if (campo.lugar) {
		campo.lugar.value = texto;
	}
}

function validarTextoDireccionCampo(campo, etiqueta, mostrarError = mostrarMensaje) {
	const direccion = obtenerTextoDireccionCampo(campo);

	if (direccion === '') {
		mostrarError('error', `Debes escribir la dirección para ${etiqueta}.`);
		campo.input?.focus();
		return null;
	}

	if (direccion.length < 8) {
		mostrarError('error', `La dirección para ${etiqueta} es demasiado corta.`);
		campo.input?.focus();
		return null;
	}

	if (campo.lugar) {
		campo.lugar.value = direccion;
	}

	return direccion;
}

function configurarAutocompleteDireccion() {
	inicializarCampoDireccion({
		...estadoAutocompleteDireccion.principal,
		inputId: 'direccionEntregaTexto',
		suggestionsId: 'direccionEntregaTextoSuggestions',
		statusId: 'direccionEntregaTextoStatus',
		label: 'Dirección de entrega',
		placeholder: 'Escribe calle, número, colonia o ciudad',
		legacyCp: domicilioCp,
		legacyDetalles: domicilioDetalles,
		legacyColonia: domicilioColonia,
		legacyCalle: domicilioCalle,
		legacyNumero: domicilioNumero
	});

	inicializarCampoDireccion({
		...estadoAutocompleteDireccion.splitNormal,
		inputId: 'splitNormalDireccionTexto',
		suggestionsId: 'splitNormalDireccionTextoSuggestions',
		statusId: 'splitNormalDireccionTextoStatus',
		label: 'Dirección de entrega',
		placeholder: 'Escribe calle, número, colonia o ciudad',
		legacyCp: splitNormalCp,
		legacyDetalles: splitNormalDetalles,
		legacyColonia: splitNormalColonia,
		legacyCalle: splitNormalCalle,
		legacyNumero: splitNormalNumero
	});

	inicializarCampoDireccion({
		...estadoAutocompleteDireccion.splitPersonalizado,
		inputId: 'splitPersonalizadoDireccionTexto',
		suggestionsId: 'splitPersonalizadoDireccionTextoSuggestions',
		statusId: 'splitPersonalizadoDireccionTextoStatus',
		label: 'Dirección de entrega',
		placeholder: 'Escribe calle, número, colonia o ciudad',
		legacyCp: splitPersonalizadoCp,
		legacyDetalles: splitPersonalizadoDetalles,
		legacyColonia: splitPersonalizadoColonia,
		legacyCalle: splitPersonalizadoCalle,
		legacyNumero: splitPersonalizadoNumero
	});

	const principalInput = document.getElementById('direccionEntregaTexto');
	const principalSuggestions = document.getElementById('direccionEntregaTextoSuggestions');
	const principalStatus = document.getElementById('direccionEntregaTextoStatus');

	const splitNormalInput = document.getElementById('splitNormalDireccionTexto');
	const splitNormalSuggestions = document.getElementById('splitNormalDireccionTextoSuggestions');
	const splitNormalStatus = document.getElementById('splitNormalDireccionTextoStatus');

	const splitPersonalizadoInput = document.getElementById('splitPersonalizadoDireccionTexto');
	const splitPersonalizadoSuggestions = document.getElementById('splitPersonalizadoDireccionTextoSuggestions');
	const splitPersonalizadoStatus = document.getElementById('splitPersonalizadoDireccionTextoStatus');

	estadoAutocompleteDireccion.principal.input = principalInput;
	estadoAutocompleteDireccion.principal.suggestions = principalSuggestions;
	estadoAutocompleteDireccion.principal.status = principalStatus;
	estadoAutocompleteDireccion.principal.wrapper = principalInput?.closest('.address-autocomplete') ?? null;

	estadoAutocompleteDireccion.splitNormal.input = splitNormalInput;
	estadoAutocompleteDireccion.splitNormal.suggestions = splitNormalSuggestions;
	estadoAutocompleteDireccion.splitNormal.status = splitNormalStatus;
	estadoAutocompleteDireccion.splitNormal.wrapper = splitNormalInput?.closest('.address-autocomplete') ?? null;

	estadoAutocompleteDireccion.splitPersonalizado.input = splitPersonalizadoInput;
	estadoAutocompleteDireccion.splitPersonalizado.suggestions = splitPersonalizadoSuggestions;
	estadoAutocompleteDireccion.splitPersonalizado.status = splitPersonalizadoStatus;
	estadoAutocompleteDireccion.splitPersonalizado.wrapper = splitPersonalizadoInput?.closest('.address-autocomplete') ?? null;
}

function vincularEventosCampoDireccion(campo) {
	if (!campo?.input) {
		return;
	}

	campo.input.addEventListener('input', () => {
		if (campo.lugar) {
			campo.lugar.value = campo.input.value.trim();
		}

		programarBusquedaDireccionCampo(campo);
	});

	campo.input.addEventListener('blur', () => {
		setTimeout(() => {
			if (!campo.seleccionando) {
				ocultarSugerenciasDireccionCampo(campo);
			}
		}, 180);
	});
}

function inicializarAutocompletadoDirecciones() {
	configurarAutocompleteDireccion();
	vincularEventosCampoDireccion(estadoAutocompleteDireccion.principal);
	vincularEventosCampoDireccion(estadoAutocompleteDireccion.splitNormal);
	vincularEventosCampoDireccion(estadoAutocompleteDireccion.splitPersonalizado);

	document.addEventListener('click', (event) => {
		const campos = [
			estadoAutocompleteDireccion.principal,
			estadoAutocompleteDireccion.splitNormal,
			estadoAutocompleteDireccion.splitPersonalizado
		];

		campos.forEach((campo) => {
			const clicDentro =
				campo?.input?.contains(event.target) ||
				campo?.suggestions?.contains(event.target);

			if (!clicDentro) {
				ocultarSugerenciasDireccionCampo(campo);
			}
		});
	});
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

	limpiarCampoDireccion(estadoAutocompleteDireccion.principal);
	actualizarEstadoLugarEntrega();
}

function esPedidoParaRecoger() {
	return tipoEntregaPedido?.value === 'recoger';
}

function actualizarEstadoLugarEntrega() {
	if (!usarDireccionPerfil || !lugarEntrega) {
		return;
	}

	const campoDireccion = estadoAutocompleteDireccion.principal;

	if (esPedidoParaRecoger()) {
		usarDireccionPerfil.checked = false;
		usarDireccionPerfil.disabled = true;
		limpiarCampoDireccion(campoDireccion);
		habilitarCampoDireccion(campoDireccion, false);
		lugarEntrega.value = 'Recoger en tienda';
		limpiarMensaje();
		return;
	}

	usarDireccionPerfil.disabled = false;
	habilitarCampoDireccion(campoDireccion, true);

	const direccionGuardada = (usuario?.direccion ?? '').trim();
	const usarPerfil = usarDireccionPerfil.checked;

	if (usarPerfil) {
		if (direccionGuardada === '') {
			usarDireccionPerfil.checked = false;
			mostrarMensaje(
				'error',
				'No puedes usar la dirección del perfil porque no tienes una guardada.'
			);
			limpiarCampoDireccion(campoDireccion);
			habilitarCampoDireccion(campoDireccion, true);
			return;
		}

		aplicarTextoDireccionCampo(campoDireccion, direccionGuardada);
		habilitarCampoDireccion(campoDireccion, false);
		limpiarMensaje();
		return;
	}

	habilitarCampoDireccion(campoDireccion, true);

	if (obtenerTextoDireccionCampo(campoDireccion) === direccionGuardada) {
		limpiarCampoDireccion(campoDireccion);
	}

	lugarEntrega.value = obtenerTextoDireccionCampo(campoDireccion);
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

						<div class="product-actions">
							<button
								class="btn-reviews"
								data-id="${producto.id_producto}"
								data-name="${producto.nombre_producto}"
								type="button"
							>
								Ver reseñas
							</button>

							<button
								class="btn-add"
								data-id="${producto.id_producto}"
								type="button"
							>
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
		if (lugarEntrega) {
			lugarEntrega.value = 'Recoger en tienda';
		}
		return 'Recoger en tienda';
	}

	const direccionGuardada = (usuario?.direccion ?? '').trim();

	if (usarDireccionPerfil?.checked && direccionGuardada !== '') {
		lugarEntrega.value = direccionGuardada;
		return direccionGuardada;
	}

	const lugar = validarTextoDireccionCampo(
		estadoAutocompleteDireccion.principal,
		'el pedido'
	);

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
		direccionTexto: tipoEntrega === 'domicilio'
			? obtenerTextoDireccionCampo(estadoAutocompleteDireccion.principal)
			: ''
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
		limpiarCampoDireccion(campoDireccion);

		if (campoDireccion.lugar) {
			campoDireccion.lugar.value = 'Recoger en tienda';
		}

		habilitarCampoDireccion(campoDireccion, false);
		return;
	}

	habilitarCampoDireccion(campoDireccion, true);

	const textoActual = obtenerTextoDireccionCampo(campoDireccion);
	if (campoDireccion.lugar) {
		campoDireccion.lugar.value = textoActual;
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

	configurarEntregaSeparada(
		splitNormalTipo,
		estadoAutocompleteDireccion.splitNormal,
		entregaBase
	);

	configurarEntregaSeparada(
		splitPersonalizadoTipo,
		estadoAutocompleteDireccion.splitPersonalizado,
		entregaBase
	);

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

		btnConfirmarSeparacionPedido.onclick = () => {
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

/* =========================
	RESEÑAS
========================= */

let productoActualResena = null;

function obtenerNombreVisibleUsuarioResena(resena) {
	return (
		resena?.usuario?.nombreuser ||
		resena?.usuario?.nombre_completo ||
		'Usuario'
	);
}

function obtenerAvisoResena() {
	if (!modalResenas) {
		return null;
	}

	let aviso = document.getElementById('mensajeResenaAcceso');

	if (!aviso) {
		aviso = document.createElement('p');
		aviso.id = 'mensajeResenaAcceso';
		aviso.style.textAlign = 'center';
		aviso.style.color = 'var(--gris-texto)';
		aviso.style.fontStyle = 'italic';
		aviso.style.marginTop = '15px';
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
			console.error('Error cargando reseñas:', error);
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

	if (!resenas || resenas.length === 0) {
		listaResenas.innerHTML = `
			<p class="no-reviews">
				Aún no hay reseñas para este producto. ¡Sé el primero en opinar!
			</p>
		`;
		return;
	}

	listaResenas.innerHTML = resenas.map((resena) => {
		const estrellas = '★'.repeat(Number(resena.calificacion ?? 0)) + '☆'.repeat(5 - Number(resena.calificacion ?? 0));
		const fecha = resena.fecha
			? new Date(resena.fecha).toLocaleDateString('es-MX')
			: '';
		const autor = obtenerNombreVisibleUsuarioResena(resena);
		const comentario = String(resena.comentario ?? '').trim() || 'Sin comentario';

		return `
			<div class="review-item">
				<div class="review-header">
					<span class="review-author">${autor}</span>
					<span class="review-rating">${estrellas} (${resena.calificacion})</span>
				</div>
				<div class="review-date">${fecha}</div>
				<div class="review-comment">${comentario}</div>
			</div>
		`;
	}).join('');
}

async function mostrarModalResenas(idProducto, nombreProducto) {
	productoActualResena = Number(idProducto);

	const tituloModal = modalResenas?.querySelector('h2');
	if (tituloModal) {
		tituloModal.textContent = `Reseñas de ${nombreProducto}`;
	}

	const resenas = await cargarResenas(idProducto);
	renderizarResenas(resenas);

	if (puedeResenar()) {
		if (formularioResena) {
			formularioResena.style.display = 'block';
		}

		calificacionResena.value = '';
		comentarioResena.value = '';
		ocultarAvisoResena();
	} else {
		if (formularioResena) {
			formularioResena.style.display = 'none';
		}

		mostrarAvisoResena('Debes iniciar sesión para dejar una reseña.');
	}

	modalResenas?.classList.remove('hidden');
}

async function enviarResena() {
	if (!productoActualResena) {
		alert('No se encontró el producto para la reseña.');
		return;
	}

	if (!usuario || !puedeResenar()) {
		alert('Debes iniciar sesión para dejar una reseña.');
		return;
	}

	const calificacion = Number(calificacionResena?.value ?? 0);
	const comentario = String(comentarioResena?.value ?? '').trim();

	if (!calificacion || calificacion < 1 || calificacion > 5) {
		alert('Por favor selecciona una calificación válida.');
		return;
	}

	if (comentario === '') {
		alert('Por favor escribe un comentario.');
		return;
	}

	try {
		const { error } = await db
			.from('reseñas_productos')
			.upsert(
				{
					id_producto: Number(productoActualResena),
					id_usuario: Number(usuario.id_usuario),
					calificacion,
					comentario
				},
				{
					onConflict: 'id_producto,id_usuario'
				}
			);

		if (error) {
			console.error('Error enviando reseña:', error);
			alert('Error al guardar la reseña. Inténtalo de nuevo.');
			return;
		}

		alert('¡Reseña guardada exitosamente!');
		calificacionResena.value = '';
		comentarioResena.value = '';

		const resenas = await cargarResenas(productoActualResena);
		renderizarResenas(resenas);
	} catch (error) {
		console.error('Error en enviarResena:', error);
		alert('Error al enviar la reseña.');
	}
}

function cerrarModalResenas() {
	modalResenas?.classList.add('hidden');
	productoActualResena = null;

	if (calificacionResena) {
		calificacionResena.value = '';
	}

	if (comentarioResena) {
		comentarioResena.value = '';
	}
}

if (btnCerrarModalResenas) {
	btnCerrarModalResenas.addEventListener('click', cerrarModalResenas);
}

if (btnEnviarResena) {
	btnEnviarResena.addEventListener('click', enviarResena);
}

if (modalResenas) {
	modalResenas.addEventListener('click', (e) => {
		if (e.target === modalResenas) {
			cerrarModalResenas();
		}
	});
}

(async function init() {
	cargarCarrito();
	renderizarCarrito();
	inicializarAutocompletadoDirecciones();
	await refrescarUsuarioDesdeBD();
	inicializarEntrega();
	cargarCategorias();
	cargarProductos();
	vincularCierreMenuEnSidebar();
	actualizarBotonCarritoMovil();
})();