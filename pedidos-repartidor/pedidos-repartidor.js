const DIRECCION_NEGOCIO = '21.478761147795492, -104.86575261965632';
const NOMBRE_NEGOCIO = 'Dulce Mordisco';

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFjZjIzZmE2NjMxNTRjYTg4Nzk2Mzc4OGM1ZTE2OWMzIiwiaCI6Im11cm11cjY0In0=';

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
let capaRuta = null;
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
			mapaRuta.invalidateSize();
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
			mapaRuta.invalidateSize();
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

function crearIconoMapa(colorFondo, textoInterior) {
	return L.divIcon({
		className: 'custom-route-marker',
		html: `
			<div style="
				position: relative;
				width: 34px;
				height: 46px;
				display: flex;
				align-items: flex-start;
				justify-content: center;
			">
				<div style="
					width: 34px;
					height: 34px;
					border-radius: 50% 50% 50% 0;
					background: ${colorFondo};
					transform: rotate(-45deg);
					position: absolute;
					top: 0;
					left: 0;
					box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
					border: 3px solid #ffffff;
					box-sizing: border-box;
				"></div>

				<div style="
					position: absolute;
					top: 6px;
					left: 6px;
					width: 22px;
					height: 22px;
					border-radius: 50%;
					background: #ffffff;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 12px;
					font-weight: 700;
					color: ${colorFondo};
					z-index: 2;
				">
					${escaparHtml(textoInterior)}
				</div>
			</div>
		`,
		iconSize: [34, 46],
		iconAnchor: [17, 42],
		popupAnchor: [0, -38]
	});
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

async function geocodificarDireccion(direccion, etiquetaSiEsCoordenada = 'Ubicación') {
	const texto = normalizarTextoDireccion(direccion);

	if (!texto) {
		throw new Error('No hay un lugar de entrega válido para calcular la ruta.');
	}

	const coordenadasDirectas = convertirCoordenadas(texto, etiquetaSiEsCoordenada);

	if (coordenadasDirectas) {
		return coordenadasDirectas;
	}

	const intentos = [
		texto,
		`${texto}, Tepic, Nayarit, México`,
		`${texto}, Nayarit, México`,
		`${texto}, México`
	];

	for (const intento of intentos) {
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
				continue;
			}

			const data = await respuesta.json();

			if (Array.isArray(data) && data.length > 0) {
				return {
					lat: Number(data[0].lat),
					lon: Number(data[0].lon),
					texto: data[0].display_name ?? intento
				};
			}
		} catch (error) {
			console.error('Error geocodificando dirección:', intento, error);
		} finally {
			timeout.clear();
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
		: [23.2494, -106.4111];

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
						mapaRuta.invalidateSize();
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
						mapaRuta.invalidateSize();
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
			mapaRuta.invalidateSize();
		}
	}, 300);
});
