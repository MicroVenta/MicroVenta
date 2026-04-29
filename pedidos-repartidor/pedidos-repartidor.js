const DIRECCION_NEGOCIO = '21.478761147795492, -104.86575261965632';
const NOMBRE_NEGOCIO = 'Dulce Mordisco';
const COORDENADAS_TEPIC = { lat: 21.5095, lon: -104.8957 };
const AWS_REGION = 'us-east-2';
const AWS_LOCATION_KEY = 'v1.public.eyJqdGkiOiI4OTY5OGIyYy1hZmQyLTQyYmItYjZjNi0xZTAwNWU2MWY2N2UifRfhEn2cmnsmQT2oZxWtopI2LigByNeDiy0oA3Zqm4Yej9MvT33_zzXMYaad7gCh1zuVnyCyAUHBwg5htBa5nQhuCY4ViXzP8lO94Nx6tD3EqmkvjIKEvR3d4JCTYoFcHdOWKmOmUEeSKKiFNpK0e6E4fk7mvX4a5pdSEnv3zvu6ohA7qEvycpJsUjuP7h8FT6p5gLLp6XUfV-CQSqxKAzU2waRJGNvFlJttMF7KXBgli9nErtyG7Hyz56FDKL0GlLwC7Wl3-3xjcXNz7AY5Yd4TQXh97P3AUuZ-DoCXaGsG3NZdCqT42UvsTcDYmE49e97pyeBwCR5BMuOdH_a-YOU.NjAyMWJkZWUtMGMyOS00NmRkLThjZTMtODEyOTkzZTUyMTBi';
const AWS_BIAS_POSITION = [-104.8957, 21.5095];
const AWS_ROUTES_URL = `https://routes.geo.${AWS_REGION}.amazonaws.com/v2/routes?key=${AWS_LOCATION_KEY}`;
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
			tiles: [
				'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
			],
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

const nombreRepartidor = document.getElementById('nombreRepartidor');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

const fechaActualizacion = document.getElementById('fechaActualizacion');
const listaPedidos = document.getElementById('listaPedidos');
const mensajePedidos = document.getElementById('mensajePedidos');
const textoResultados = document.getElementById('textoResultados');

const statTotalPedidos = document.getElementById('statTotalPedidos');
const statPendientes = document.getElementById('statPendientes');
const statEnRuta = document.getElementById('statEnRuta');
const statEntregados = document.getElementById('statEntregados');

const buscarEntrega = document.getElementById('buscarEntrega');
const filtroEstado = document.getElementById('filtroEstado');
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
const btnRecargar = document.getElementById('btnRecargar');

const revealCards = document.querySelectorAll('.reveal-card');

const mensajeRuta = document.getElementById('mensajeRuta');
const rutaPedidoId = document.getElementById('rutaPedidoId');
const rutaClienteNombre = document.getElementById('rutaClienteNombre');
const rutaDistancia = document.getElementById('rutaDistancia');
const rutaDuracion = document.getElementById('rutaDuracion');
const rutaOrigenTexto = document.getElementById('rutaOrigenTexto');
const rutaDestinoTexto = document.getElementById('rutaDestinoTexto');
const btnRecalcularRuta = document.getElementById('btnRecalcularRuta');
const btnAbrirRutaExterna = document.getElementById('btnAbrirRutaExterna');
const btnOrigenNegocio = document.getElementById('btnOrigenNegocio');
const btnOrigenActual = document.getElementById('btnOrigenActual');

const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebarContainer');
const mobileOverlay = document.getElementById('mobileOverlay');
const mapCard = document.getElementById('mapCard');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let pedidosOriginales = [];
let mapaEstatus = {};

let pedidoRutaActual = null;
let modoOrigenRuta = 'negocio';
let mapaRuta = null;
let mapaRutaListo = false;
let marcadorOrigen = null;
let marcadorDestino = null;
let ultimaRutaExterna = '';
let ultimoPedidoSeleccionadoId = null;

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

function obtenerRolNormalizado(nombreRol) {
	return (nombreRol ?? '').toString().trim().toLowerCase();
}

function esRepartidor(usuarioActual) {
	if (!usuarioActual) {
		return false;
	}

	const nombreRol = obtenerRolNormalizado(usuarioActual.nombre_rol);
	const idRol = Number(usuarioActual.id_rol);

	return nombreRol === 'repartidor' || idRol === 3;
}

if (!esRepartidor(usuario)) {
	window.location.href = '/login/login.html';
}

if (nombreRepartidor) {
	nombreRepartidor.textContent = usuario?.nombre_completo || 'Repartidor';
}

renderizarSidebar('mis-entregas');

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

	if (mapaRuta) {
		setTimeout(() => {
			redimensionarMapaRuta();
		}, 150);
	}
});

function esVistaMovilMapa() {
	return window.matchMedia('(max-width: 900px), (max-height: 500px)').matches;
}

function resaltarMapa() {
	if (!mapCard) {
		return;
	}

	mapCard.classList.remove('map-highlight');
	void mapCard.offsetWidth;
	mapCard.classList.add('map-highlight');

	window.clearTimeout(resaltarMapa._timer);
	resaltarMapa._timer = window.setTimeout(() => {
		mapCard.classList.remove('map-highlight');
	}, 1400);
}

function enfocarMapaEnMovil() {
	if (!mapCard || !esVistaMovilMapa()) {
		return;
	}

	mapCard.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	});

	window.setTimeout(() => {
		mapCard.focus({ preventScroll: true });
		resaltarMapa();

		if (mapaRuta) {
			redimensionarMapaRuta();
		}
	}, 350);
}

function mostrarMensaje(texto, tipo = 'success') {
	if (!mensajePedidos) {
		return;
	}

	mensajePedidos.textContent = texto;
	mensajePedidos.className = `message ${tipo}`;
	mensajePedidos.classList.remove('hidden');
}

function ocultarMensaje() {
	if (!mensajePedidos) {
		return;
	}

	mensajePedidos.textContent = '';
	mensajePedidos.className = 'message hidden';
}

function mostrarMensajeRuta(texto, tipo = 'success') {
	if (!mensajeRuta) {
		return;
	}

	mensajeRuta.textContent = texto;
	mensajeRuta.className = `message ${tipo}`;
	mensajeRuta.classList.remove('hidden');
}

function ocultarMensajeRuta() {
	if (!mensajeRuta) {
		return;
	}

	mensajeRuta.textContent = '';
	mensajeRuta.className = 'message hidden';
}

function animarTarjetas() {
	revealCards.forEach((card, index) => {
		setTimeout(() => {
			card.classList.add('show');
		}, 180 + (index * 110));
	});
}

function formatearFecha(fecha) {
	if (!fecha) {
		return 'Sin fecha';
	}

	const fechaObj = new Date(fecha);

	if (Number.isNaN(fechaObj.getTime())) {
		return 'Fecha inválida';
	}

	return fechaObj.toLocaleDateString('es-MX', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

function formatearFechaCorta(fecha) {
	if (!fecha) {
		return 'Sin fecha';
	}

	const fechaObj = new Date(fecha);

	if (Number.isNaN(fechaObj.getTime())) {
		return 'Fecha inválida';
	}

	return fechaObj.toLocaleString('es-MX', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function formatearMoneda(valor) {
	return Number(valor || 0).toLocaleString('es-MX', {
		style: 'currency',
		currency: 'MXN'
	});
}

function formatearDistancia(metros) {
	if (!Number.isFinite(metros)) {
		return '-';
	}

	if (metros < 1000) {
		return `${Math.round(metros)} m`;
	}

	return `${(metros / 1000).toFixed(1)} km`;
}

function formatearDuracion(segundos) {
	if (!Number.isFinite(segundos)) {
		return '-';
	}

	const minutosTotales = Math.round(segundos / 60);
	const horas = Math.floor(minutosTotales / 60);
	const minutos = minutosTotales % 60;

	if (horas <= 0) {
		return `${minutos} min`;
	}

	return `${horas} h ${minutos} min`;
}

function obtenerDescripcionEstatus(pedido) {
	return pedido?.estatuspedido?.descripcion || 'Sin estatus';
}

function estatusNormalizado(pedido) {
	return obtenerDescripcionEstatus(pedido).trim().toLowerCase();
}

function esEstatusEntregado(pedido) {
	const estatus = estatusNormalizado(pedido);
	return estatus === 'entregado' || estatus === 'completado';
}

function esEstatusEnRuta(pedido) {
	const estatus = estatusNormalizado(pedido);
	return estatus === 'en camino' || estatus === 'en ruta' || estatus === 'enviando';
}

function esEstatusCancelado(pedido) {
	const estatus = estatusNormalizado(pedido);
	return estatus === 'cancelado' || estatus === 'cancelada' || estatus === 'rechazado';
}

function esEstatusPendiente(pedido) {
	if (esEstatusEntregado(pedido) || esEstatusEnRuta(pedido) || esEstatusCancelado(pedido)) {
		return false;
	}

	return true;
}

function obtenerClaseBadge(pedido) {
	if (esEstatusEntregado(pedido)) {
		return 'badge-entregado';
	}

	if (esEstatusEnRuta(pedido)) {
		return 'badge-en-ruta';
	}

	if (esEstatusCancelado(pedido)) {
		return 'badge-cancelado';
	}

	return 'badge-pendiente';
}

function esPedidoInvitado(pedido) {
	return pedido?.invitado != null;
}

function obtenerNombreCliente(pedido) {
	if (esPedidoInvitado(pedido)) {
		return pedido.invitado?.nombre_invitado ?? 'Invitado';
	}

	return pedido.cliente?.nombre_completo ?? 'Cliente no disponible';
}

function obtenerTelefonoCliente(pedido) {
	if (esPedidoInvitado(pedido)) {
		return pedido.invitado?.telefono_contacto ?? 'Sin teléfono';
	}

	return pedido.cliente?.telefono ?? 'Sin teléfono';
}

function obtenerTipoCliente(pedido) {
	return esPedidoInvitado(pedido) ? 'Invitado' : 'Registrado';
}

function obtenerProductosPedido(detalles) {
	if (!detalles || detalles.length === 0) {
		return [];
	}

	return detalles.map((detalle) => {
		const nombreProducto = detalle.producto?.nombre_producto ?? 'Producto';
		return `${nombreProducto} x${detalle.cantidad}`;
	});
}

function actualizarResumen(pedidos) {
	if (statTotalPedidos) {
		statTotalPedidos.textContent = pedidos.length.toString();
	}

	if (statPendientes) {
		statPendientes.textContent = pedidos.filter(esEstatusPendiente).length.toString();
	}

	if (statEnRuta) {
		statEnRuta.textContent = pedidos.filter(esEstatusEnRuta).length.toString();
	}

	if (statEntregados) {
		statEntregados.textContent = pedidos.filter(esEstatusEntregado).length.toString();
	}
}

function actualizarTextoResultados(totalMostrados, totalOriginal) {
	if (!textoResultados) {
		return;
	}

	if (totalOriginal === 0) {
		textoResultados.textContent = 'No tienes entregas asignadas por el momento.';
		return;
	}

	if (totalMostrados === totalOriginal) {
		textoResultados.textContent = `Mostrando ${totalOriginal} entrega${totalOriginal === 1 ? '' : 's'}.`;
		return;
	}

	textoResultados.textContent = `Mostrando ${totalMostrados} de ${totalOriginal} entrega${totalOriginal === 1 ? '' : 's'}.`;
}

function escaparHtml(texto) {
	return String(texto ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function construirUrlGoogleMaps(direccion) {
	if (!direccion) {
		return '';
	}

	const direccionCodificada = encodeURIComponent(direccion.trim());
	return `https://www.google.com/maps/search/?api=1&query=${direccionCodificada}`;
}

function construirUrlGoogleMapsRuta(origenLat, origenLon, destinoLat, destinoLon) {
	return `https://www.google.com/maps/dir/?api=1&origin=${origenLat},${origenLon}&destination=${destinoLat},${destinoLon}&travelmode=driving`;
}

function abrirEnGoogleMaps(url) {
	if (!url) {
		mostrarMensaje('No hay una dirección válida para abrir en Google Maps.', 'error');
		return;
	}

	window.open(url, '_blank');
}

function actualizarBotonesOrigen() {
	if (btnOrigenNegocio) {
		btnOrigenNegocio.classList.toggle('active', modoOrigenRuta === 'negocio');
	}

	if (btnOrigenActual) {
		btnOrigenActual.classList.toggle('active', modoOrigenRuta === 'actual');
	}
}

function marcarPedidoSeleccionado() {
	document.querySelectorAll('.order-item').forEach((item) => {
		const id = Number(item.dataset.pedidoId);
		item.classList.toggle('selected-order', id === ultimoPedidoSeleccionadoId);
	});
}

function esCadenaCoordenadas(texto) {
	if (!texto) {
		return false;
	}

	return /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(String(texto).trim());
}

function convertirCoordenadas(texto, etiqueta = 'Ubicación') {
	if (!esCadenaCoordenadas(texto)) {
		return null;
	}

	const [latitudTexto, longitudTexto] = String(texto).split(',');
	const lat = Number(latitudTexto.trim());
	const lon = Number(longitudTexto.trim());

	if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
		return null;
	}

	return {
		lat,
		lon,
		texto: etiqueta
	};
}

function normalizarTextoDireccion(texto) {
	return String(texto ?? '')
		.replace(/\n/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function obtenerLugarEntregaPedido(pedido) {
	return normalizarTextoDireccion(pedido?.lugar_entrega ?? '');
}

function actualizarBotonRutaExterna(url) {
	ultimaRutaExterna = url || '';

	if (btnAbrirRutaExterna) {
		btnAbrirRutaExterna.disabled = !ultimaRutaExterna;
	}
}

function normalizarTextoBuscable(texto) {
	return normalizarTextoDireccion(texto)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

function redimensionarMapaRuta() {
	if (mapaRuta && typeof mapaRuta.resize === 'function') {
		mapaRuta.resize();
	}
}

function crearGeoJsonRutaDesdeCoordenadas(coordenadas) {
	if (!Array.isArray(coordenadas) || coordenadas.length < 2) {
		return {
			type: 'FeatureCollection',
			features: []
		};
	}

	return {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'LineString',
					coordinates: coordenadas
				}
			}
		]
	};
}

function direccionPermitidaAws(item) {
	const texto = normalizarTextoBuscable([
		item?.Address?.Label,
		item?.Address?.Locality,
		item?.Address?.SubRegion,
		item?.Address?.Region,
		item?.Title
	].filter(Boolean).join(' '));

	return MUNICIPIOS_PERMITIDOS.some((municipio) => {
		return texto.includes(normalizarTextoBuscable(municipio));
	});
}

function obtenerDireccionAws(item) {
	return item?.Address?.Label || item?.Title || '';
}

function calcularDistanciaLinealMetros(origen, destino) {
	const radioTierra = 6371000;
	const lat1 = (origen.lat * Math.PI) / 180;
	const lat2 = (destino.lat * Math.PI) / 180;
	const deltaLat = ((destino.lat - origen.lat) * Math.PI) / 180;
	const deltaLon = ((destino.lon - origen.lon) * Math.PI) / 180;

	const a =
		(Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)) +
		(Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2));

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return radioTierra * c;
}

function estimarDuracionLinealSegundos(distanciaMetros) {
	const velocidadPromedioMps = 8.33;
	return distanciaMetros / velocidadPromedioMps;
}

function crearMarcadorMapa(colorFondo, textoInterior) {
	const contenedor = document.createElement('div');
	contenedor.className = 'route-marker';
	contenedor.innerHTML = `
		<div class="route-marker-shadow"></div>
		<div class="route-marker-pin" style="background: ${colorFondo};"></div>
		<div class="route-marker-core" style="color: ${colorFondo};">
			${escaparHtml(textoInterior)}
		</div>
	`;

	return contenedor;
}

function renderizarMapaConPuntos(origen, destino) {
	limpiarMapaRuta();

	const iconoOrigen = crearIconoMapa('#d96c8a', 'O');
	const iconoDestino = crearIconoMapa('#2563eb', 'D');

	marcadorOrigen = L.marker([origen.lat, origen.lon], {
		icon: iconoOrigen
	}).addTo(mapaRuta);

	marcadorOrigen.bindPopup(`
		<strong>Origen</strong><br>
		${escaparHtml(origen.texto ?? 'Ubicación de origen')}
	`);

	marcadorDestino = L.marker([destino.lat, destino.lon], {
		icon: iconoDestino
	}).addTo(mapaRuta);

	marcadorDestino.bindPopup(`
		<strong>Destino</strong><br>
		${escaparHtml(destino.texto ?? 'Ubicación de destino')}
	`);

	const capaBase = L.polyline(
		[
			[origen.lat, origen.lon],
			[destino.lat, destino.lon]
		],
		{
			color: '#ffffff',
			weight: 8,
			opacity: 0.9
		}
	).addTo(mapaRuta);

	capaRuta = L.polyline(
		[
			[origen.lat, origen.lon],
			[destino.lat, destino.lon]
		],
		{
			color: '#2563eb',
			weight: 4,
			opacity: 0.85,
			dashArray: '10, 10'
		}
	).addTo(mapaRuta);

	const grupo = L.featureGroup([marcadorOrigen, marcadorDestino, capaBase, capaRuta]);
	mapaRuta.fitBounds(grupo.getBounds(), {
		padding: [50, 50]
	});

	setTimeout(() => {
		if (mapaRuta) {
			mapaRuta.invalidateSize();
		}
	}, 150);
}

function renderizarRutaReal(origen, destino, ruta) {
	limpiarMapaRuta();

	const iconoOrigen = crearIconoMapa('#d96c8a', 'O');
	const iconoDestino = crearIconoMapa('#16a34a', 'D');

	marcadorOrigen = L.marker([origen.lat, origen.lon], {
		icon: iconoOrigen
	}).addTo(mapaRuta);

	marcadorOrigen.bindPopup(`
		<strong>Origen</strong><br>
		${escaparHtml(origen.texto ?? 'Ubicación de origen')}
	`);

	marcadorDestino = L.marker([destino.lat, destino.lon], {
		icon: iconoDestino
	}).addTo(mapaRuta);

	marcadorDestino.bindPopup(`
		<strong>Destino</strong><br>
		${escaparHtml(destino.texto ?? 'Ubicación de destino')}
	`);

	const capaBase = L.geoJSON(ruta.geometry, {
		style: {
			color: '#ffffff',
			weight: 10,
			opacity: 0.95,
			lineCap: 'round',
			lineJoin: 'round'
		}
	}).addTo(mapaRuta);

	capaRuta = L.geoJSON(ruta.geometry, {
		style: {
			color: '#2563eb',
			weight: 6,
			opacity: 0.95,
			lineCap: 'round',
			lineJoin: 'round'
		}
	}).addTo(mapaRuta);

	const grupo = L.featureGroup([marcadorOrigen, marcadorDestino, capaBase, capaRuta]);
	mapaRuta.fitBounds(grupo.getBounds(), {
		padding: [50, 50]
	});

	setTimeout(() => {
		if (mapaRuta) {
			mapaRuta.invalidateSize();
		}
	}, 150);
}

function actualizarResumenRuta(origen, destino, distancia, duracion) {
	if (rutaOrigenTexto) {
		rutaOrigenTexto.textContent = origen.texto ?? `${origen.lat}, ${origen.lon}`;
	}

	if (rutaDestinoTexto) {
		rutaDestinoTexto.textContent = destino.texto ?? `${destino.lat}, ${destino.lon}`;
	}

	if (rutaDistancia) {
		rutaDistancia.textContent = formatearDistancia(distancia);
	}

	if (rutaDuracion) {
		rutaDuracion.textContent = formatearDuracion(duracion);
	}
}

function renderizarFallbackRuta(origen, destino) {
	const distancia = calcularDistanciaLinealMetros(origen, destino);
	const duracion = estimarDuracionLinealSegundos(distancia);

	renderizarMapaConPuntos(origen, destino);
	actualizarResumenRuta(origen, destino, distancia, duracion);
	actualizarBotonRutaExterna(
		construirUrlGoogleMapsRuta(origen.lat, origen.lon, destino.lat, destino.lon)
	);

	mostrarMensajeRuta(
		'No se pudo dibujar la ruta detallada. Se mostró una ruta aproximada y puedes abrir la navegación en Google Maps.',
		'error'
	);
}

function obtenerTimeoutFetch(ms = 12000) {
	const controller = new AbortController();
	const timeoutId = window.setTimeout(() => {
		controller.abort();
	}, ms);

	return {
		signal: controller.signal,
		clear: () => window.clearTimeout(timeoutId)
	};
}

async function obtenerUbicacionActual() {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error('Tu navegador no soporta geolocalización.'));
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(posicion) => {
				resolve({
					lat: posicion.coords.latitude,
					lon: posicion.coords.longitude,
					texto: 'Ubicación actual del repartidor'
				});
			},
			(error) => {
				let mensaje = 'No se pudo obtener tu ubicación actual.';

				if (error.code === 1) {
					mensaje = 'Debes permitir el acceso a tu ubicación para calcular la ruta.';
				} else if (error.code === 2) {
					mensaje = 'No fue posible determinar tu ubicación actual.';
				} else if (error.code === 3) {
					mensaje = 'La solicitud de ubicación tardó demasiado.';
				}

				reject(new Error(mensaje));
			},
			{
				enableHighAccuracy: true,
				timeout: 12000,
				maximumAge: 0
			}
		);
	});
}

function agregarIntentoUnico(lista, valor) {
	const limpio = normalizarTextoDireccion(valor);

	if (!limpio) {
		return;
	}

	if (!lista.includes(limpio)) {
		lista.push(limpio);
	}
}

function limpiarSeparadoresDireccion(texto) {
	return normalizarTextoDireccion(texto)
		.replace(/\s*,\s*/g, ', ')
		.replace(/\s+/g, ' ')
		.trim();
}

function limpiarPrefijoCampoDireccion(valor) {
	return String(valor ?? '')
		.replace(/^(cp|c\.p\.|codigo postal|código postal|colonia|calle|numero|número)\s*/i, '')
		.replace(/^:\s*/i, '')
		.trim();
}

function extraerCampoDireccion(texto, etiqueta, siguienteEtiquetas = []) {
	const etiquetasSiguientes = siguienteEtiquetas.length
		? `(?=,\\s*(?:${siguienteEtiquetas.join('|')})\\b|$)`
		: '(?=$)';

	const regex = new RegExp(
		`(?:^|,\\s*)${etiqueta}\\s*([^,]+?)\\s*${etiquetasSiguientes}`,
		'i'
	);

	const match = String(texto ?? '').match(regex);

	if (!match?.[1]) {
		return '';
	}

	return limpiarPrefijoCampoDireccion(match[1]);
}

function extraerPartesDireccionEstructurada(texto) {
	const direccion = limpiarSeparadoresDireccion(texto);

	const cp = extraerCampoDireccion(direccion, '(?:cp|c\\.p\\.|codigo postal|código postal)', [
		'colonia',
		'calle',
		'numero',
		'número'
	]);

	const colonia = extraerCampoDireccion(direccion, 'colonia', [
		'calle',
		'numero',
		'número'
	]);

	const calle = extraerCampoDireccion(direccion, 'calle', [
		'numero',
		'número'
	]);

	const numero = extraerCampoDireccion(direccion, '(?:numero|número)', []);

	const restos = direccion
		.replace(/(?:^|,\s*)(?:cp|c\.p\.|codigo postal|código postal)\s*[^,]+/ig, '')
		.replace(/(?:^|,\s*)colonia\s*[^,]+/ig, '')
		.replace(/(?:^|,\s*)calle\s*[^,]+/ig, '')
		.replace(/(?:^|,\s*)(?:numero|número)\s*[^,]+/ig, '')
		.replace(/^,\s*|\s*,\s*$/g, '')
		.replace(/\s*,\s*,/g, ',')
		.trim();

	const partesResto = restos
		.split(',')
		.map((parte) => parte.trim())
		.filter(Boolean);

	let ciudad = '';
	let estado = '';
	let pais = '';

	if (partesResto.length >= 1) {
		estado = partesResto[0] ?? '';
	}

	if (partesResto.length >= 2) {
		pais = partesResto[1] ?? '';
	}

	if (/tepic/i.test(direccion)) {
		ciudad = 'Tepic';
	}

	if (/nayarit/i.test(direccion) && !estado) {
		estado = 'Nayarit';
	}

	if (/mexic|méxico/i.test(direccion) && !pais) {
		pais = 'México';
	}

	return {
		cp: cp.replace(/\D/g, '').slice(0, 5),
		colonia,
		calle,
		numero,
		ciudad,
		estado,
		pais,
		esEstructurada: Boolean(cp || colonia || calle || numero)
	};
}

function construirDireccionesCandidatasDesdeEstructurada(partes) {
	const intentos = [];
	const calleNumero = [partes.calle, partes.numero].filter(Boolean).join(' ').trim();
	const calleNumeroConComa = [partes.calle, partes.numero].filter(Boolean).join(', ').trim();
	const colonia = partes.colonia;
	const cp = partes.cp;
	const ciudad = partes.ciudad || 'Tepic';
	const estado = partes.estado || 'Nayarit';
	const pais = partes.pais || 'México';

	agregarIntentoUnico(intentos, [calleNumero, colonia, cp, ciudad, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [calleNumeroConComa, colonia, cp, ciudad, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [calleNumero, colonia, ciudad, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [calleNumeroConComa, colonia, ciudad, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [calleNumero, colonia, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [calleNumeroConComa, colonia, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [calleNumero, cp, ciudad, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [calleNumero, cp, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [colonia, cp, ciudad, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [colonia, ciudad, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [cp, ciudad, estado, pais].filter(Boolean).join(', '));
	agregarIntentoUnico(intentos, [cp, estado, pais].filter(Boolean).join(', '));

	return intentos;
}

function construirIntentosGeocodificacion(texto) {
	const intentos = [];
	const textoLimpio = limpiarSeparadoresDireccion(texto);
	const partes = extraerPartesDireccionEstructurada(textoLimpio);

	agregarIntentoUnico(intentos, textoLimpio);

	if (partes.esEstructurada) {
		const estructuradas = construirDireccionesCandidatasDesdeEstructurada(partes);
		estructuradas.forEach((intento) => agregarIntentoUnico(intentos, intento));
	}

	agregarIntentoUnico(intentos, `${textoLimpio}, Tepic, Nayarit, México`);
	agregarIntentoUnico(intentos, `${textoLimpio}, Nayarit, México`);
	agregarIntentoUnico(intentos, `${textoLimpio}, México`);

	return intentos;
}

async function buscarPrimeraCoincidenciaDireccion(intento) {
	const url = new URL('https://nominatim.openstreetmap.org/search');
	url.searchParams.set('q', intento);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('addressdetails', '1');
	url.searchParams.set('limit', '1');
	url.searchParams.set('countrycodes', 'mx');
	url.searchParams.set('accept-language', 'es');

	const timeout = obtenerTimeoutFetch(10000);

	try {
		const respuesta = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			},
			signal: timeout.signal
		});

		if (!respuesta.ok) {
			return null;
		}

		const data = await respuesta.json();

		if (Array.isArray(data) && data.length > 0) {
			return {
				lat: Number(data[0].lat),
				lon: Number(data[0].lon),
				texto: data[0].display_name ?? intento
			};
		}

		return null;
	} catch (error) {
		console.error('Error geocodificando dirección:', intento, error);
		return null;
	} finally {
		timeout.clear();
	}
}

async function geocodificarDireccion(direccion, etiquetaSiEsCoordenada = 'Ubicación') {
	const texto = normalizarTextoDireccion(direccion);

	if (!texto) {
		throw new Error('No hay un lugar de entrega válido para calcular la ruta.');
	}

	const coordenadasDirectas = convertirCoordenadas(texto, etiquetaSiEsCoordenada);

	if (coordenadasDirectas) {
		return coordenadasDirectas;
	}

	const intentos = construirIntentosGeocodificacion(texto);

	for (const intento of intentos) {
		const resultado = await buscarPrimeraCoincidenciaDireccion(intento);

		if (resultado) {
			return resultado;
		}
	}

	throw new Error(`No se encontró una ubicación válida para el lugar de entrega: "${texto}".`);
}

async function consultarRuta(origen, destino) {
	if (!ORS_API_KEY || ORS_API_KEY === 'PEGA_AQUI_TU_API_KEY_DE_OPENROUTESERVICE') {
		throw new Error('Debes colocar tu API key de OpenRouteService en ORS_API_KEY.');
	}

	const timeout = obtenerTimeoutFetch(20000);

	try {
		const respuesta = await fetch(
			'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
			{
				method: 'POST',
				headers: {
					'Authorization': ORS_API_KEY,
					'Content-Type': 'application/json',
					'Accept': 'application/json, application/geo+json'
				},
				body: JSON.stringify({
					coordinates: [
						[origen.lon, origen.lat],
						[destino.lon, destino.lat]
					]
				}),
				signal: timeout.signal
			}
		);

		const contentType = respuesta.headers.get('content-type') || '';
		const esJson =
			contentType.includes('application/json') ||
			contentType.includes('application/geo+json');

		if (!esJson) {
			const texto = await respuesta.text();
			throw new Error(`ORS devolvió una respuesta no válida: ${texto.slice(0, 150)}`);
		}

		const data = await respuesta.json();

		if (!respuesta.ok) {
			const detalle =
				data?.error?.message ||
				data?.error ||
				data?.message ||
				`ORS respondió con estado ${respuesta.status}.`;

			throw new Error(detalle);
		}

		if (
			!data ||
			data.type !== 'FeatureCollection' ||
			!Array.isArray(data.features) ||
			!data.features.length
		) {
			throw new Error('No se encontró una ruta disponible.');
		}

		const featureRuta = data.features[0];
		const summary = featureRuta?.properties?.summary || {};

		return {
			geometry: featureRuta.geometry,
			distance: Number(summary.distance || 0),
			duration: Number(summary.duration || 0)
		};
	} finally {
		timeout.clear();
	}
}

async function obtenerOrigenRuta() {
	if (modoOrigenRuta === 'actual') {
		return obtenerUbicacionActual();
	}

	return geocodificarDireccion(DIRECCION_NEGOCIO, NOMBRE_NEGOCIO);
}

function inicializarMapaRuta() {
	if (mapaRuta) {
		return;
	}

	const coordenadasNegocio = convertirCoordenadas(DIRECCION_NEGOCIO, NOMBRE_NEGOCIO);
	const vistaInicial = coordenadasNegocio
		? [coordenadasNegocio.lat, coordenadasNegocio.lon]
		: COORDENADAS_TEPIC;

	mapaRuta = L.map('mapaRuta', {
		zoomControl: true
	}).setView(vistaInicial, 13);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; OpenStreetMap'
	}).addTo(mapaRuta);

	setTimeout(() => {
		if (mapaRuta) {
			mapaRuta.invalidateSize();
		}
	}, 200);
}

function limpiarMapaRuta() {
	if (!mapaRuta) {
		return;
	}

	if (capaRuta) {
		mapaRuta.removeLayer(capaRuta);
		capaRuta = null;
	}

	if (marcadorOrigen) {
		mapaRuta.removeLayer(marcadorOrigen);
		marcadorOrigen = null;
	}

	if (marcadorDestino) {
		mapaRuta.removeLayer(marcadorDestino);
		marcadorDestino = null;
	}
}

function asegurarCapasRutaMapa() {
	if (!mapaRuta || !mapaRutaListo) {
		return false;
	}

	if (!mapaRuta.getSource('ruta-source')) {
		mapaRuta.addSource('ruta-source', {
			type: 'geojson',
			lineMetrics: true,
			data: crearGeoJsonRutaDesdeCoordenadas([])
		});
	}

	if (!mapaRuta.getLayer('ruta-base-layer')) {
		mapaRuta.addLayer({
			id: 'ruta-base-layer',
			type: 'line',
			source: 'ruta-source',
			layout: {
				'line-cap': 'round',
				'line-join': 'round'
			},
			paint: {
				'line-color': '#ffffff',
				'line-width': 11,
				'line-opacity': 0.78,
				'line-blur': 1.2
			}
		});
	}

	if (!mapaRuta.getLayer('ruta-main-layer')) {
		mapaRuta.addLayer({
			id: 'ruta-main-layer',
			type: 'line',
			source: 'ruta-source',
			layout: {
				'line-cap': 'round',
				'line-join': 'round'
			},
			paint: {
				'line-color': '#2563eb',
				'line-width': 6.5,
				'line-opacity': 0.96,
				'line-gradient': crearGradienteRuta('#16a34a')
			}
		});
	}

	return true;
}

function crearGradienteRuta(colorDestino = '#16a34a') {
	return [
		'interpolate',
		['linear'],
		['line-progress'],
		0,
		'#d96c8a',
		0.45,
		'#fb7185',
		1,
		colorDestino
	];
}

function crearContenidoPopupRuta(etiqueta, texto) {
	return `
		<div class="route-popup">
			<strong class="route-popup-title">${escaparHtml(etiqueta)}</strong>
			<span class="route-popup-text">${escaparHtml(texto)}</span>
		</div>
	`;
}

function ejecutarCuandoMapaRutaEsteListo(callback) {
	if (!mapaRuta) {
		return;
	}

	if (mapaRutaListo || mapaRuta.isStyleLoaded()) {
		mapaRutaListo = true;
		callback();
		return;
	}

	mapaRuta.once('load', () => {
		mapaRutaListo = true;
		callback();
	});
}

function ajustarVistaRuta(origen, destino, coordenadasRuta = []) {
	if (!mapaRuta) {
		return;
	}

	const bounds = new maplibregl.LngLatBounds();
	const puntos = [
		[origen.lon, origen.lat],
		...coordenadasRuta,
		[destino.lon, destino.lat]
	];

	puntos.forEach((punto) => {
		if (Array.isArray(punto) && punto.length === 2) {
			bounds.extend(punto);
		}
	});

	if (!bounds.isEmpty()) {
		mapaRuta.fitBounds(bounds, {
			padding: 60,
			duration: 700
		});
	}

	window.setTimeout(() => {
		redimensionarMapaRuta();
	}, 150);
}

function renderizarRutaEnMapa(origen, destino, coordenadasRuta, opciones = {}) {
	const {
		colorDestino = '#16a34a',
		esAproximada = false
	} = opciones;

	ejecutarCuandoMapaRutaEsteListo(() => {
		if (!asegurarCapasRutaMapa()) {
			return;
		}

		limpiarMapaRuta();

		const coordenadasValidas = Array.isArray(coordenadasRuta) && coordenadasRuta.length >= 2
			? coordenadasRuta
			: [
				[origen.lon, origen.lat],
				[destino.lon, destino.lat]
			];

		const source = mapaRuta.getSource('ruta-source');
		if (source) {
			source.setData(crearGeoJsonRutaDesdeCoordenadas(coordenadasValidas));
		}

		mapaRuta.setPaintProperty('ruta-base-layer', 'line-width', esAproximada ? 9 : 11);
		mapaRuta.setPaintProperty('ruta-base-layer', 'line-opacity', esAproximada ? 0.72 : 0.78);
		mapaRuta.setPaintProperty('ruta-base-layer', 'line-blur', esAproximada ? 0.8 : 1.2);
		mapaRuta.setPaintProperty('ruta-main-layer', 'line-width', esAproximada ? 4.5 : 6.5);
		mapaRuta.setPaintProperty('ruta-main-layer', 'line-opacity', esAproximada ? 0.86 : 0.96);
		mapaRuta.setPaintProperty('ruta-main-layer', 'line-gradient', crearGradienteRuta(colorDestino));
		mapaRuta.setPaintProperty(
			'ruta-main-layer',
			'line-dasharray',
			esAproximada ? [2, 2] : [1, 0.001]
		);

		marcadorOrigen = new maplibregl.Marker({
			element: crearMarcadorMapa('#d96c8a', 'O'),
			anchor: 'bottom'
		})
			.setLngLat([origen.lon, origen.lat])
			.setPopup(
				new maplibregl.Popup({ offset: 28 }).setHTML(crearContenidoPopupRuta('Origen', origen.texto ?? 'Ubicacion de origen'))
			)
			.addTo(mapaRuta);

		marcadorDestino = new maplibregl.Marker({
			element: crearMarcadorMapa(colorDestino, 'D'),
			anchor: 'bottom'
		})
			.setLngLat([destino.lon, destino.lat])
			.setPopup(
				new maplibregl.Popup({ offset: 28 }).setHTML(crearContenidoPopupRuta('Destino', destino.texto ?? 'Ubicacion de destino'))
			)
			.addTo(mapaRuta);

		ajustarVistaRuta(origen, destino, coordenadasValidas);
	});
}

function renderizarMapaConPuntos(origen, destino) {
	renderizarRutaEnMapa(
		origen,
		destino,
		[
			[origen.lon, origen.lat],
			[destino.lon, destino.lat]
		],
		{
			colorDestino: '#2563eb',
			esAproximada: true
		}
	);
}

function renderizarRutaReal(origen, destino, ruta) {
	renderizarRutaEnMapa(origen, destino, ruta.coordinates, {
		colorDestino: '#16a34a',
		esAproximada: false
	});
}

async function geocodificarDireccionAws(direccion) {
	const texto = String(direccion ?? '').trim();

	if (!texto) {
		return null;
	}

	const timeout = obtenerTimeoutFetch(12000);

	try {
		const respuesta = await fetch(
			`https://places.geo.${AWS_REGION}.amazonaws.com/v2/geocode?key=${AWS_LOCATION_KEY}`,
			{
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
				}),
				signal: timeout.signal
			}
		);

		if (!respuesta.ok) {
			throw new Error('No se pudo geocodificar la dirección con AWS.');
		}

		const data = await respuesta.json();
		const item = (data.ResultItems ?? []).find(direccionPermitidaAws);

		if (!item?.Position || !Array.isArray(item.Position)) {
			return null;
		}

		const lon = Number(item.Position[0]);
		const lat = Number(item.Position[1]);

		if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
			return null;
		}

		return {
			lat,
			lon,
			texto: obtenerDireccionAws(item) || texto
		};
	} finally {
		timeout.clear();
	}
}

async function buscarPrimeraCoincidenciaDireccion(intento) {
	try {
		return await geocodificarDireccionAws(intento);
	} catch (error) {
		console.error('Error geocodificando dirección con AWS:', intento, error);
		return null;
	}
}

async function geocodificarDireccion(direccion, etiquetaSiEsCoordenada = 'Ubicación') {
	const texto = normalizarTextoDireccion(direccion);

	if (!texto) {
		throw new Error('No hay un lugar de entrega válido para calcular la ruta.');
	}

	const coordenadasDirectas = convertirCoordenadas(texto, etiquetaSiEsCoordenada);

	if (coordenadasDirectas) {
		return coordenadasDirectas;
	}

	const intentos = construirIntentosGeocodificacion(texto);

	for (const intento of intentos) {
		const resultado = await buscarPrimeraCoincidenciaDireccion(intento);

		if (resultado) {
			return resultado;
		}
	}

	throw new Error(`No se encontró una ubicación válida en AWS para el lugar de entrega: "${texto}".`);
}

async function consultarRuta(origen, destino) {
	const timeout = obtenerTimeoutFetch(20000);

	try {
		const respuesta = await fetch(AWS_ROUTES_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				Origin: [origen.lon, origen.lat],
				Destination: [destino.lon, destino.lat],
				TravelMode: 'Car',
				RoutingObjective: 'FastestRoute',
				DepartureTime: new Date().toISOString(),
				LegGeometryFormat: 'Simple'
			}),
			signal: timeout.signal
		});

		const contentType = respuesta.headers.get('content-type') || '';
		const esJson = contentType.includes('application/json');
		const data = esJson ? await respuesta.json() : null;

		if (!respuesta.ok) {
			const detalle =
				data?.message ||
				data?.Message ||
				data?.Errors?.[0]?.Message ||
				`AWS respondió con estado ${respuesta.status}.`;

			throw new Error(detalle);
		}

		const rutaPrincipal = Array.isArray(data?.Routes) ? data.Routes[0] : null;
		const legs = Array.isArray(rutaPrincipal?.Legs) ? rutaPrincipal.Legs : [];
		const coordinates = legs.flatMap((leg, index) => {
			const lineString = Array.isArray(leg?.Geometry?.LineString)
				? leg.Geometry.LineString
				: [];

			return index === 0 ? lineString : lineString.slice(1);
		});

		if (coordinates.length < 2) {
			throw new Error('No se encontró una ruta disponible en AWS.');
		}

		const distanceMetros = Number(
			rutaPrincipal?.Summary?.Distance ??
			legs.reduce((total, leg) => {
				return total + Number(
					leg?.VehicleLegDetails?.Summary?.Overview?.Distance ??
					leg?.PedestrianLegDetails?.Summary?.Overview?.Distance ??
					leg?.FerryLegDetails?.Summary?.Overview?.Distance ??
					0
				);
			}, 0)
		);
		const durationSeconds = Number(
			rutaPrincipal?.Summary?.Duration ??
			legs.reduce((total, leg) => {
				return total + Number(
					leg?.VehicleLegDetails?.Summary?.Overview?.Duration ??
					leg?.PedestrianLegDetails?.Summary?.Overview?.Duration ??
					leg?.FerryLegDetails?.Summary?.Overview?.Duration ??
					0
				);
			}, 0)
		);

		return {
			geometry: crearGeoJsonRutaDesdeCoordenadas(coordinates),
			coordinates,
			distance: Number.isFinite(distanceMetros) ? distanceMetros : 0,
			duration: Number.isFinite(durationSeconds) ? durationSeconds : 0
		};
	} finally {
		timeout.clear();
	}
}

function limpiarMapaRuta() {
	if (!mapaRuta) {
		return;
	}

	if (marcadorOrigen) {
		marcadorOrigen.remove();
		marcadorOrigen = null;
	}

	if (marcadorDestino) {
		marcadorDestino.remove();
		marcadorDestino = null;
	}

	if (mapaRutaListo && mapaRuta.getSource('ruta-source')) {
		mapaRuta.getSource('ruta-source').setData(crearGeoJsonRutaDesdeCoordenadas([]));
	}
}

function inicializarMapaRuta() {
	if (mapaRuta || !window.maplibregl) {
		return;
	}

	const coordenadasNegocio = convertirCoordenadas(DIRECCION_NEGOCIO, NOMBRE_NEGOCIO) || COORDENADAS_TEPIC;

	mapaRuta = new maplibregl.Map({
		container: 'mapaRuta',
		style: MAP_STYLE,
		center: [coordenadasNegocio.lon, coordenadasNegocio.lat],
		zoom: 13,
		attributionControl: false,
		pitchWithRotate: false,
		dragRotate: false
	});

	mapaRuta.addControl(new maplibregl.NavigationControl(), 'top-right');
	mapaRuta.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

	mapaRuta.on('load', () => {
		mapaRutaListo = true;
		asegurarCapasRutaMapa();
		limpiarMapaRuta();
		window.setTimeout(() => {
			redimensionarMapaRuta();
		}, 200);
	});

	window.setTimeout(() => {
		redimensionarMapaRuta();
	}, 200);
}

function limpiarResumenRuta() {
	if (rutaPedidoId) {
		rutaPedidoId.textContent = '-';
	}

	if (rutaClienteNombre) {
		rutaClienteNombre.textContent = '-';
	}

	if (rutaDistancia) {
		rutaDistancia.textContent = '-';
	}

	if (rutaDuracion) {
		rutaDuracion.textContent = '-';
	}

	if (rutaOrigenTexto) {
		rutaOrigenTexto.textContent = modoOrigenRuta === 'negocio'
			? NOMBRE_NEGOCIO
			: 'Ubicación actual del repartidor';
	}

	if (rutaDestinoTexto) {
		rutaDestinoTexto.textContent = 'Selecciona un pedido.';
	}

	actualizarBotonRutaExterna('');
}

async function mostrarRutaPedido(pedido) {
	if (!pedido) {
		return;
	}

	inicializarMapaRuta();
	ocultarMensajeRuta();

	pedidoRutaActual = pedido;
	ultimoPedidoSeleccionadoId = Number(pedido.id_pedido);
	marcarPedidoSeleccionado();

	if (btnRecalcularRuta) {
		btnRecalcularRuta.disabled = true;
		btnRecalcularRuta.textContent = 'Calculando...';
	}

	actualizarBotonRutaExterna('');

	if (rutaPedidoId) {
		rutaPedidoId.textContent = `#${pedido.id_pedido}`;
	}

	if (rutaClienteNombre) {
		rutaClienteNombre.textContent = obtenerNombreCliente(pedido);
	}

	if (rutaDistancia) {
		rutaDistancia.textContent = '-';
	}

	if (rutaDuracion) {
		rutaDuracion.textContent = '-';
	}

	const destinoTextoOriginal = obtenerLugarEntregaPedido(pedido);

	if (rutaDestinoTexto) {
		rutaDestinoTexto.textContent = destinoTextoOriginal || 'Lugar de entrega no registrado';
	}

	try {
		if (!destinoTextoOriginal) {
			throw new Error('Este pedido no tiene un lugar de entrega registrado.');
		}

		console.log('Pedido seleccionado para ruta:', pedido);
		console.log('Lugar de entrega enviado a geocodificación:', destinoTextoOriginal);

		const origen = await obtenerOrigenRuta();
		const destino = await geocodificarDireccion(destinoTextoOriginal, 'Destino del pedido');

		console.log('Origen calculado:', origen);
		console.log('Destino calculado:', destino);

		actualizarBotonRutaExterna(
			construirUrlGoogleMapsRuta(origen.lat, origen.lon, destino.lat, destino.lon)
		);

		try {
			const ruta = await consultarRuta(origen, destino);

			console.log('Ruta calculada:', ruta);

			renderizarRutaReal(origen, destino, ruta);
			actualizarResumenRuta(origen, destino, ruta.distance, ruta.duration);
			mostrarMensajeRuta('Ruta real calculada correctamente.', 'success');

			if (esVistaMovilMapa()) {
				enfocarMapaEnMovil();
			} else {
				resaltarMapa();

				setTimeout(() => {
					if (mapaRuta) {
						redimensionarMapaRuta();
					}
				}, 250);
			}
		} catch (errorRuta) {
			console.error('Fallo la ruta detallada, se usará fallback visual:', errorRuta);
			renderizarFallbackRuta(origen, destino);

			if (esVistaMovilMapa()) {
				enfocarMapaEnMovil();
			} else {
				resaltarMapa();

				setTimeout(() => {
					if (mapaRuta) {
						redimensionarMapaRuta();
					}
				}, 250);
			}
		}
	} catch (error) {
		console.error('Error al mostrar la ruta del pedido:', error);
		limpiarMapaRuta();
		mostrarMensajeRuta(error.message || 'No se pudo calcular la ruta.', 'error');
		actualizarBotonRutaExterna('');
	} finally {
		if (btnRecalcularRuta) {
			btnRecalcularRuta.disabled = false;
			btnRecalcularRuta.textContent = 'Recalcular ruta';
		}
	}
}

async function cargarCatalogoEstatus() {
	try {
		const { data, error } = await db
			.from('estatuspedido')
			.select('id_estatus, descripcion');

		if (error) {
			console.error('Error al consultar estatus:', error);
			return;
		}

		mapaEstatus = {};

		(data ?? []).forEach((estatus) => {
			const clave = (estatus.descripcion ?? '').trim().toLowerCase();

			if (clave) {
				mapaEstatus[clave] = estatus.id_estatus;
			}
		});
	} catch (err) {
		console.error('Error general al cargar catálogo de estatus:', err);
	}
}

function obtenerIdEstatusPorDescripcion(...descripciones) {
	for (const descripcion of descripciones) {
		const clave = descripcion.trim().toLowerCase();

		if (mapaEstatus[clave]) {
			return mapaEstatus[clave];
		}
	}

	return null;
}

async function actualizarEstatusPedido(idPedido, accion, boton) {
	if (!idPedido) {
		return;
	}

	let nuevoIdEstatus = null;
	let etiquetaAccion = '';

	if (accion === 'ruta') {
		nuevoIdEstatus = obtenerIdEstatusPorDescripcion('en ruta', 'enviando', 'en camino');
		etiquetaAccion = 'en ruta';
	} else if (accion === 'entregado') {
		nuevoIdEstatus = obtenerIdEstatusPorDescripcion('entregado', 'completado');
		etiquetaAccion = 'entregado';
	}

	if (!nuevoIdEstatus) {
		mostrarMensaje(`No se encontró un estatus válido para marcar el pedido como ${etiquetaAccion}.`, 'error');
		return;
	}

	try {
		ocultarMensaje();

		if (boton) {
			boton.disabled = true;
			boton.textContent = 'Actualizando...';
		}

		const { error } = await db
			.from('pedido')
			.update({
				id_estatus: nuevoIdEstatus
			})
			.eq('id_pedido', idPedido)
			.eq('id_repartidor', usuario.id_usuario);

		if (error) {
			console.error('Error al actualizar estatus del pedido:', error);
			mostrarMensaje('No se pudo actualizar el estatus del pedido.', 'error');
			return;
		}

		mostrarMensaje(`Pedido #${idPedido} actualizado correctamente a ${etiquetaAccion}.`, 'success');
		await cargarPedidosRepartidor();
	} catch (err) {
		console.error('Error general al actualizar el pedido:', err);
		mostrarMensaje('Ocurrió un error al actualizar la entrega.', 'error');
	} finally {
		if (boton) {
			boton.disabled = false;
			boton.textContent = accion === 'ruta' ? 'Marcar en ruta' : 'Marcar entregado';
		}
	}
}

function renderizarListaPedidos(pedidos) {
	if (!listaPedidos) {
		return;
	}

	if (!pedidos || pedidos.length === 0) {
		listaPedidos.innerHTML = `
			<div class="empty-orders">
				No se encontraron entregas con los filtros aplicados.
			</div>
		`;
		return;
	}

	listaPedidos.innerHTML = pedidos.map((pedido) => {
		const estatusActual = obtenerDescripcionEstatus(pedido);
		const productos = obtenerProductosPedido(pedido.detallepedido);
		const cliente = obtenerNombreCliente(pedido);
		const tipoCliente = obtenerTipoCliente(pedido);
		const direccion = obtenerLugarEntregaPedido(pedido) || 'Lugar de entrega no registrado';
		const comentarioPedido = String(pedido.comentario_pedido ?? '').trim();
		const telefono = obtenerTelefonoCliente(pedido);
		const fechaEntrega = pedido.fecha_entrega_aproximada
			? formatearFechaCorta(pedido.fecha_entrega_aproximada)
			: 'Sin definir';
		const urlMaps = construirUrlGoogleMaps(direccion);

		return `
			<article class="order-item" data-pedido-id="${pedido.id_pedido}">
				<div class="order-item-top">
					<h4>Pedido #${pedido.id_pedido}</h4>
					<div class="order-badge ${obtenerClaseBadge(pedido)}">${escaparHtml(estatusActual)}</div>
				</div>

				<div class="order-meta">
					<p><strong>Cliente:</strong> ${escaparHtml(cliente)}</p>
					<p><strong>Tipo:</strong> ${escaparHtml(tipoCliente)}</p>
					<p><strong>Fecha pedido:</strong> ${formatearFecha(pedido.fecha_pedido)}</p>
					<p><strong>Entrega:</strong> ${fechaEntrega}</p>
					<p><strong>Lugar de entrega:</strong> ${escaparHtml(direccion)}</p>
					<p><strong>Comentarios:</strong> ${comentarioPedido ? escaparHtml(comentarioPedido) : 'Sin comentarios'}</p>
					<p><strong>Teléfono:</strong> ${escaparHtml(telefono)}</p>
					<p><strong>Total:</strong> ${formatearMoneda(pedido.total_pagar || 0)}</p>
				</div>

				<div class="order-products-title">Productos</div>

				${
					productos.length > 0
						? `
							<ul class="order-products">
								${productos.map((producto) => `<li>${escaparHtml(producto)}</li>`).join('')}
							</ul>
						`
						: `
							<div class="order-products">No hay productos registrados para este pedido.</div>
						`
				}

				<div class="order-actions">
					<button
						type="button"
						class="btn btn-map"
						data-accion="ver-ruta"
						data-id="${pedido.id_pedido}"
					>
						🗺️ Ver ruta
					</button>

					<button
						type="button"
						class="btn btn-secondary"
						data-accion="maps"
						data-url="${escaparHtml(urlMaps)}"
						${!urlMaps ? 'disabled' : ''}
					>
						📍 Abrir en Google Maps
					</button>

					<button
						type="button"
						class="btn btn-route"
						data-accion="ruta"
						data-id="${pedido.id_pedido}"
						${esEstatusEntregado(pedido) || esEstatusCancelado(pedido) ? 'disabled' : ''}
					>
						Marcar en ruta
					</button>

					<button
						type="button"
						class="btn btn-delivered"
						data-accion="entregado"
						data-id="${pedido.id_pedido}"
						${esEstatusEntregado(pedido) || esEstatusCancelado(pedido) ? 'disabled' : ''}
					>
						Marcar entregado
					</button>
				</div>
			</article>
		`;
	}).join('');

	marcarPedidoSeleccionado();
}

function aplicarFiltros() {
	const textoBusqueda = (buscarEntrega?.value ?? '').trim().toLowerCase();
	const estadoFiltro = (filtroEstado?.value ?? 'todos').trim().toLowerCase();

	let pedidosFiltrados = [...pedidosOriginales];

	if (textoBusqueda) {
		pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
			const idPedido = String(pedido.id_pedido ?? '').toLowerCase();
			const cliente = obtenerNombreCliente(pedido).toLowerCase();
			const direccion = obtenerLugarEntregaPedido(pedido).toLowerCase();
			const comentario = String(pedido.comentario_pedido ?? '').toLowerCase();
			const telefono = obtenerTelefonoCliente(pedido).toLowerCase();
			const estatus = obtenerDescripcionEstatus(pedido).toLowerCase();
			const tipoCliente = obtenerTipoCliente(pedido).toLowerCase();

			return (
				idPedido.includes(textoBusqueda) ||
				cliente.includes(textoBusqueda) ||
				direccion.includes(textoBusqueda) ||
				comentario.includes(textoBusqueda) ||
				telefono.includes(textoBusqueda) ||
				estatus.includes(textoBusqueda) ||
				tipoCliente.includes(textoBusqueda)
			);
		});
	}

	if (estadoFiltro !== 'todos') {
		pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
			const estatus = estatusNormalizado(pedido);
			return estatus.includes(estadoFiltro);
		});
	}

	actualizarTextoResultados(pedidosFiltrados.length, pedidosOriginales.length);
	renderizarListaPedidos(pedidosFiltrados);
}

async function cargarPedidosRepartidor() {
	if (!usuario || !usuario.id_usuario) {
		return;
	}

	try {
		ocultarMensaje();

		const { data, error } = await db
			.from('pedido')
			.select(`
				id_pedido,
				id_cliente,
				id_invitado,
				fecha_pedido,
				fecha_entrega_aproximada,
				lugar_entrega,
				comentario_pedido,
				total_pagar,
				id_estatus,
				id_repartidor,
				estatuspedido (
					id_estatus,
					descripcion
				),
				cliente:usuario!pedido_id_cliente_fkey (
					id_usuario,
					nombre_completo,
					telefono
				),
				invitado:invitado!pedido_id_invitado_fkey (
					id_invitado,
					nombre_invitado,
					correo_contacto,
					telefono_contacto,
					direccion_contacto
				),
				detallepedido (
					id_detalle,
					cantidad,
					subtotal,
					producto (
						id_producto,
						nombre_producto
					)
				)
			`)
			.eq('id_repartidor', usuario.id_usuario)
			.order('fecha_pedido', { ascending: false });

		if (error) {
			console.error('Error al cargar entregas del repartidor:', error);

			pedidosOriginales = [];
			actualizarResumen([]);
			actualizarTextoResultados(0, 0);

			if (listaPedidos) {
				listaPedidos.innerHTML = `
					<div class="empty-orders">
						No se pudieron cargar tus entregas asignadas.
					</div>
				`;
			}

			return;
		}

		pedidosOriginales = data ?? [];

		actualizarResumen(pedidosOriginales);
		aplicarFiltros();

		if (fechaActualizacion) {
			fechaActualizacion.textContent = formatearFechaCorta(new Date());
		}

		if (pedidoRutaActual) {
			const pedidoActualizado = pedidosOriginales.find((item) =>
				Number(item.id_pedido) === Number(pedidoRutaActual.id_pedido)
			);

			if (pedidoActualizado) {
				await mostrarRutaPedido(pedidoActualizado);
			}
		}
	} catch (err) {
		console.error('Error general al cargar entregas:', err);

		pedidosOriginales = [];
		actualizarResumen([]);
		actualizarTextoResultados(0, 0);

		if (listaPedidos) {
			listaPedidos.innerHTML = `
				<div class="empty-orders">
					Ocurrió un error al consultar la información.
				</div>
			`;
		}
	}
}

if (buscarEntrega) {
	buscarEntrega.addEventListener('input', aplicarFiltros);
}

if (filtroEstado) {
	filtroEstado.addEventListener('change', aplicarFiltros);
}

if (btnLimpiarFiltros) {
	btnLimpiarFiltros.addEventListener('click', () => {
		if (buscarEntrega) {
			buscarEntrega.value = '';
		}

		if (filtroEstado) {
			filtroEstado.value = 'todos';
		}

		aplicarFiltros();
	});
}

if (btnRecargar) {
	btnRecargar.addEventListener('click', async () => {
		await cargarPedidosRepartidor();
	});
}

if (listaPedidos) {
	listaPedidos.addEventListener('click', async (event) => {
		const boton = event.target.closest('button');

		if (!boton) {
			return;
		}

		const accion = boton.dataset.accion;

		if (accion === 'maps') {
			const url = boton.dataset.url ?? '';
			abrirEnGoogleMaps(url);
			return;
		}

		if (accion === 'ver-ruta') {
			const idPedido = Number(boton.dataset.id);
			const pedido = pedidosOriginales.find((item) => Number(item.id_pedido) === idPedido);

			if (pedido) {
				await mostrarRutaPedido(pedido);
			}

			return;
		}

		const idPedido = Number(boton.dataset.id);

		if (!idPedido || !accion) {
			return;
		}

		await actualizarEstatusPedido(idPedido, accion, boton);
	});
}

if (btnOrigenNegocio) {
	btnOrigenNegocio.addEventListener('click', async () => {
		if (modoOrigenRuta === 'negocio') {
			return;
		}

		modoOrigenRuta = 'negocio';
		actualizarBotonesOrigen();
		limpiarResumenRuta();

		if (pedidoRutaActual) {
			await mostrarRutaPedido(pedidoRutaActual);
		}
	});
}

if (btnOrigenActual) {
	btnOrigenActual.addEventListener('click', async () => {
		if (modoOrigenRuta === 'actual') {
			return;
		}

		modoOrigenRuta = 'actual';
		actualizarBotonesOrigen();
		limpiarResumenRuta();

		if (pedidoRutaActual) {
			await mostrarRutaPedido(pedidoRutaActual);
		}
	});
}

if (btnRecalcularRuta) {
	btnRecalcularRuta.addEventListener('click', async () => {
		if (!pedidoRutaActual) {
			mostrarMensajeRuta('Selecciona un pedido para calcular la ruta.', 'error');
			return;
		}

		await mostrarRutaPedido(pedidoRutaActual);
	});
}

if (btnAbrirRutaExterna) {
	btnAbrirRutaExterna.addEventListener('click', () => {
		if (!ultimaRutaExterna) {
			mostrarMensajeRuta('No hay una ruta calculada para abrir.', 'error');
			return;
		}

		window.open(ultimaRutaExterna, '_blank');
	});
}

document.addEventListener('DOMContentLoaded', async () => {
	animarTarjetas();
	inicializarMapaRuta();
	limpiarResumenRuta();
	actualizarBotonesOrigen();
	await cargarCatalogoEstatus();
	await cargarPedidosRepartidor();
	vincularCierreMenuEnSidebar();

	setTimeout(() => {
		if (mapaRuta) {
			redimensionarMapaRuta();
		}
	}, 300);
});
