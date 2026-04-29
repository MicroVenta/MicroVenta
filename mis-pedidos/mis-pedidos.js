const DIRECCION_NEGOCIO = '21.478761147795492, -104.86575261965632';
const NOMBRE_NEGOCIO = 'Dulce Mordisco';
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjFjZjIzZmE2NjMxNTRjYTg4Nzk2Mzc4OGM1ZTE2OWMzIiwiaCI6Im11cm11cjY0In0=';

const nombreCliente = document.getElementById('nombreCliente');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionSidebar = document.getElementById('btnCerrarSesionSidebar');

const fechaActualizacion = document.getElementById('fechaActualizacion');

const statTotalPedidos = document.getElementById('statTotalPedidos');
const statEnProceso = document.getElementById('statEnProceso');
const statEntregados = document.getElementById('statEntregados');
const statTotalGastado = document.getElementById('statTotalGastado');

const buscarPedido = document.getElementById('buscarPedido');
const filtroEstado = document.getElementById('filtroEstado');
const filtroFechaDesde = document.getElementById('filtroFechaDesde');
const filtroFechaHasta = document.getElementById('filtroFechaHasta');
const filtroCantidadPedidos = document.getElementById('filtroCantidadPedidos');
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');

const textoResultados = document.getElementById('textoResultados');
const listaPedidos = document.getElementById('listaPedidos');
const mensajePedidos = document.getElementById('mensajePedidos');

const revealCards = document.querySelectorAll('.reveal-card');

const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebarContainer');
const mobileOverlay = document.getElementById('mobileOverlay');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let pedidosOriginales = [];
let pedidosFiltrados = [];
let estatusCatalogo = [];
let mapasRecogida = {};

function normalizarTexto(texto) {
	return String(texto ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.toLowerCase();
}

function puedeVerMisPedidos(usuarioData) {
	if (!usuarioData) {
		return false;
	}

	const rolUsuario = normalizarTexto(usuarioData.nombre_rol);
	const idRol = Number(usuarioData.id_rol);

	return (
		rolUsuario === 'cliente' ||
		rolUsuario === 'repartidor' ||
		rolUsuario === 'administrador' ||
		rolUsuario === 'ayudante' ||
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

if (!usuario || !puedeVerMisPedidos(usuario)) {
	window.location.href = '/login/login.html';
}

if (nombreCliente) {
	nombreCliente.textContent = usuario.nombre_completo || 'Usuario';
}

renderizarSidebar('mis-pedidos');

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
});

function animarTarjetas() {
	revealCards.forEach((card, index) => {
		setTimeout(() => {
			card.classList.add('show');
		}, 220 + (index * 110));
	});
}

function mostrarMensaje(texto, tipo = 'error') {
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

function formatearFecha(fecha) {
	if (!fecha) {
		return 'Sin fecha';
	}

	const fechaObj = new Date(fecha);

	return fechaObj.toLocaleDateString('es-MX', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

function formatearFechaHora(fecha) {
	if (!fecha) {
		return 'Sin fecha';
	}

	const fechaObj = new Date(fecha);

	return fechaObj.toLocaleString('es-MX', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function formatearDinero(cantidad) {
	return `$${Number(cantidad || 0).toFixed(2)}`;
}

function construirFechaLocal(valorFecha, finDelDia = false) {
	if (!valorFecha) {
		return null;
	}

	const partes = String(valorFecha).split('-').map(Number);

	if (partes.length !== 3 || partes.some((parte) => !Number.isFinite(parte))) {
		return null;
	}

	const [anio, mes, dia] = partes;

	if (finDelDia) {
		return new Date(anio, mes - 1, dia, 23, 59, 59, 999);
	}

	return new Date(anio, mes - 1, dia, 0, 0, 0, 0);
}

function obtenerRangoFechas() {
	const fechaDesdeValor = filtroFechaDesde?.value || '';
	const fechaHastaValor = filtroFechaHasta?.value || '';

	if (fechaDesdeValor && fechaHastaValor && fechaDesdeValor > fechaHastaValor) {
		return {
			fechaDesde: construirFechaLocal(fechaHastaValor, false),
			fechaHasta: construirFechaLocal(fechaDesdeValor, true)
		};
	}

	return {
		fechaDesde: construirFechaLocal(fechaDesdeValor, false),
		fechaHasta: construirFechaLocal(fechaHastaValor, true)
	};
}

function actualizarTextoResultados(totalCoincidencias, totalMostrados) {
	if (!textoResultados) {
		return;
	}

	if (totalCoincidencias === 0) {
		textoResultados.textContent = '0 pedidos encontrados.';
		return;
	}

	if (totalCoincidencias !== totalMostrados) {
		textoResultados.textContent = `Mostrando ${totalMostrados} de ${totalCoincidencias} pedido(s) encontrado(s).`;
		return;
	}

	textoResultados.textContent = `${totalCoincidencias} pedido(s) encontrado(s).`;
}

function escaparHtml(texto) {
	return String(texto ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function esPedidoParaRecoger(pedido) {
	return pedido?.tipo_entrega === 'recoger';
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

	const minutosTotales = Math.max(1, Math.round(segundos / 60));
	const horas = Math.floor(minutosTotales / 60);
	const minutos = minutosTotales % 60;

	if (horas <= 0) {
		return `${minutos} min`;
	}

	return `${horas} h ${minutos} min`;
}

function esCadenaCoordenadas(texto) {
	return /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(String(texto ?? '').trim());
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

function construirUrlGoogleMapsRuta(origenLat, origenLon, destinoLat, destinoLon) {
	return `https://www.google.com/maps/dir/?api=1&origin=${origenLat},${origenLon}&destination=${destinoLat},${destinoLon}&travelmode=driving`;
}

function crearIconoMapa(colorFondo, textoInterior) {
	return L.divIcon({
		className: 'custom-route-marker',
		html: `
			<div style="position:relative;width:34px;height:46px;display:flex;align-items:flex-start;justify-content:center;">
				<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:${colorFondo};transform:rotate(-45deg);position:absolute;top:0;left:0;box-shadow:0 6px 16px rgba(0,0,0,0.25);border:3px solid #fff;box-sizing:border-box;"></div>
				<div style="position:absolute;top:6px;left:6px;width:22px;height:22px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${colorFondo};z-index:2;">
					${escaparHtml(textoInterior)}
				</div>
			</div>
		`,
		iconSize: [34, 46],
		iconAnchor: [17, 42],
		popupAnchor: [0, -38]
	});
}

function obtenerUbicacionActualCliente() {
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
					texto: 'Tu ubicación actual'
				});
			},
			(error) => {
				let mensaje = 'No se pudo obtener tu ubicación actual.';

				if (error.code === 1) {
					mensaje = 'Permite el acceso a tu ubicación para calcular la ruta a la tienda.';
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

async function consultarRuta(origen, destino) {
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

		const data = await respuesta.json();

		if (!respuesta.ok) {
			throw new Error(data?.error?.message || data?.message || 'No se encontró una ruta disponible.');
		}

		const featureRuta = data?.features?.[0];
		const summary = featureRuta?.properties?.summary || {};

		if (!featureRuta?.geometry) {
			throw new Error('No se encontró una ruta disponible.');
		}

		return {
			geometry: featureRuta.geometry,
			distance: Number(summary.distance || 0),
			duration: Number(summary.duration || 0)
		};
	} finally {
		timeout.clear();
	}
}

function actualizarTextoRutaRecogida(idPedido, texto, tipo = 'success') {
	const mensajeRuta = document.getElementById(`mensaje-ruta-recogida-${idPedido}`);

	if (!mensajeRuta) {
		return;
	}

	mensajeRuta.textContent = texto;
	mensajeRuta.className = `pickup-route-message ${tipo}`;
}

function actualizarResumenRutaRecogida(idPedido, origen, destino, distancia, duracion, urlRuta) {
	const origenTexto = document.getElementById(`ruta-recogida-origen-${idPedido}`);
	const destinoTexto = document.getElementById(`ruta-recogida-destino-${idPedido}`);
	const distanciaTexto = document.getElementById(`ruta-recogida-distancia-${idPedido}`);
	const duracionTexto = document.getElementById(`ruta-recogida-duracion-${idPedido}`);
	const botonRuta = document.getElementById(`btn-ruta-recogida-${idPedido}`);

	if (origenTexto) origenTexto.textContent = origen.texto ?? `${origen.lat}, ${origen.lon}`;
	if (destinoTexto) destinoTexto.textContent = destino.texto ?? `${destino.lat}, ${destino.lon}`;
	if (distanciaTexto) distanciaTexto.textContent = formatearDistancia(distancia);
	if (duracionTexto) duracionTexto.textContent = formatearDuracion(duracion);

	if (botonRuta) {
		botonRuta.disabled = !urlRuta;
		botonRuta.dataset.url = urlRuta || '';
	}
}

function renderizarRutaEnMapa(idPedido, origen, destino, ruta = null) {
	const mapId = `mapa-recogida-${idPedido}`;
	const mapElement = document.getElementById(mapId);

	if (!mapElement || typeof L === 'undefined') {
		return;
	}

	if (mapasRecogida[idPedido]) {
		mapasRecogida[idPedido].remove();
		delete mapasRecogida[idPedido];
	}

	const mapa = L.map(mapId, {
		zoomControl: true
	}).setView([destino.lat, destino.lon], 13);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; OpenStreetMap'
	}).addTo(mapa);

	const marcadorOrigen = L.marker([origen.lat, origen.lon], {
		icon: crearIconoMapa('#d96c8a', 'T')
	}).addTo(mapa);

	marcadorOrigen.bindPopup(`
		<strong>Origen</strong><br>
		${escaparHtml(origen.texto ?? 'Tu ubicación')}
	`);

	const marcadorDestino = L.marker([destino.lat, destino.lon], {
		icon: crearIconoMapa('#16a34a', 'D')
	}).addTo(mapa);

	marcadorDestino.bindPopup(`
		<strong>Destino</strong><br>
		${escaparHtml(destino.texto ?? NOMBRE_NEGOCIO)}
	`);

	let capaRuta = null;
	let capaBase = null;

	if (ruta?.geometry) {
		capaBase = L.geoJSON(ruta.geometry, {
			style: {
				color: '#ffffff',
				weight: 10,
				opacity: 0.95,
				lineCap: 'round',
				lineJoin: 'round'
			}
		}).addTo(mapa);

		capaRuta = L.geoJSON(ruta.geometry, {
			style: {
				color: '#2563eb',
				weight: 6,
				opacity: 0.95,
				lineCap: 'round',
				lineJoin: 'round'
			}
		}).addTo(mapa);
	} else {
		capaBase = L.polyline([[origen.lat, origen.lon], [destino.lat, destino.lon]], {
			color: '#ffffff',
			weight: 8,
			opacity: 0.9
		}).addTo(mapa);

		capaRuta = L.polyline([[origen.lat, origen.lon], [destino.lat, destino.lon]], {
			color: '#2563eb',
			weight: 4,
			opacity: 0.85,
			dashArray: '10, 10'
		}).addTo(mapa);
	}

	const grupo = L.featureGroup([marcadorOrigen, marcadorDestino, capaBase, capaRuta]);
	mapa.fitBounds(grupo.getBounds(), {
		padding: [40, 40]
	});

	mapasRecogida[idPedido] = mapa;

	setTimeout(() => {
		mapa.invalidateSize();
	}, 200);
}

async function mostrarRutaRecogida(pedido) {
	if (!esPedidoParaRecoger(pedido)) {
		return;
	}

	const destino = convertirCoordenadas(DIRECCION_NEGOCIO, NOMBRE_NEGOCIO);

	if (!destino) {
		actualizarTextoRutaRecogida(pedido.id_pedido, 'No se encontró la ubicación de la tienda.', 'error');
		return;
	}

	actualizarTextoRutaRecogida(pedido.id_pedido, 'Calculando ruta hacia la tienda...', 'success');

	try {
		const origen = await obtenerUbicacionActualCliente();
		const urlRuta = construirUrlGoogleMapsRuta(origen.lat, origen.lon, destino.lat, destino.lon);

		try {
			const ruta = await consultarRuta(origen, destino);
			renderizarRutaEnMapa(pedido.id_pedido, origen, destino, ruta);
			actualizarResumenRutaRecogida(pedido.id_pedido, origen, destino, ruta.distance, ruta.duration, urlRuta);
			actualizarTextoRutaRecogida(pedido.id_pedido, 'Ruta a la tienda calculada correctamente.', 'success');
		} catch (errorRuta) {
			console.error('No se pudo calcular la ruta detallada:', errorRuta);
			const distancia = calcularDistanciaLinealMetros(origen, destino);
			const duracion = estimarDuracionLinealSegundos(distancia);

			renderizarRutaEnMapa(pedido.id_pedido, origen, destino);
			actualizarResumenRutaRecogida(pedido.id_pedido, origen, destino, distancia, duracion, urlRuta);
			actualizarTextoRutaRecogida(
				pedido.id_pedido,
				'No se pudo dibujar la ruta detallada. Se muestra una ruta aproximada.',
				'error'
			);
		}
	} catch (error) {
		console.error('No se pudo obtener la ruta a la tienda:', error);
		actualizarTextoRutaRecogida(pedido.id_pedido, error.message || 'No se pudo calcular la ruta a la tienda.', 'error');
	}
}

function obtenerEstatusActual(historial, pedido) {
	const historialNormalizado = Array.isArray(historial) ? historial : [];

	if (historialNormalizado.length > 0) {
		const historialOrdenado = [...historialNormalizado].sort((a, b) =>
			new Date(b.fecha_registro) - new Date(a.fecha_registro)
		);

		return historialOrdenado[0]?.estatuspedido?.descripcion
			?? pedido?.estatuspedido?.descripcion
			?? 'Sin estatus';
	}

	return pedido?.estatuspedido?.descripcion ?? 'Sin estatus';
}

function obtenerClaseEstado(estatus) {
	const estado = normalizarTexto(estatus);

	if (estado === 'pendiente' || estado === 'aceptado') {
		return 'estado-pendiente';
	}

	if (estado === 'en preparación') {
		return 'estado-preparando';
	}

	if (estado === 'enviando') {
		return 'estado-en-camino';
	}

	if (estado === 'entregado') {
		return 'estado-entregado';
	}

	if (estado === 'completado') {
		return 'estado-completado';
	}

	if (estado === 'cancelado' || estado === 'rechazado') {
		return 'estado-cancelado';
	}

	return 'estado-default';
}

function contarProductos(detalles) {
	if (!detalles || detalles.length === 0) {
		return 0;
	}

	return detalles.reduce((total, detalle) => total + Number(detalle.cantidad || 0), 0);
}

function contarPedidosEnProceso(pedidos) {
	const estadosFinales = ['entregado', 'completado', 'cancelado', 'rechazado'];

	return pedidos.filter((pedido) => {
		const estatus = normalizarTexto(obtenerEstatusActual(pedido.historialestatus, pedido));
		return !estadosFinales.includes(estatus);
	}).length;
}

function contarPedidosEntregados(pedidos) {
	const estadosExito = ['entregado', 'completado'];

	return pedidos.filter((pedido) => {
		const estatus = normalizarTexto(obtenerEstatusActual(pedido.historialestatus, pedido));
		return estadosExito.includes(estatus);
	}).length;
}

function calcularTotalGastado(pedidos) {
	return pedidos.reduce((total, pedido) => total + Number(pedido.total_pagar || 0), 0);
}

function actualizarResumen(pedidos) {
	if (statTotalPedidos) {
		statTotalPedidos.textContent = pedidos.length.toString();
	}

	if (statEnProceso) {
		statEnProceso.textContent = contarPedidosEnProceso(pedidos).toString();
	}

	if (statEntregados) {
		statEntregados.textContent = contarPedidosEntregados(pedidos).toString();
	}

	if (statTotalGastado) {
		statTotalGastado.textContent = formatearDinero(calcularTotalGastado(pedidos));
	}
}

function renderizarDetalleProductos(detalles) {
	if (!detalles || detalles.length === 0) {
		return `
			<div class="empty-orders">
				No hay productos registrados para este pedido.
			</div>
		`;
	}

	return `
		<div class="products-list">
			${detalles.map((detalle) => {
				const nombreProducto = detalle.producto?.nombre_producto ?? 'Producto';
				const cantidad = Number(detalle.cantidad || 0);
				const subtotal = Number(detalle.subtotal || 0);
				const cantidadStock = Number(detalle.cantidad_stock ?? 0);
				const cantidadPersonalizada = Number(detalle.cantidad_personalizada ?? 0);
				const esPersonalizado = Boolean(detalle.personalizado);

				return `
					<div class="product-row">
						<div class="product-main">
							<strong>${nombreProducto}</strong>
							<span>
								Cantidad: ${cantidad}
								· De stock: ${cantidadStock}
								· Personalizadas: ${cantidadPersonalizada}
								${esPersonalizado ? '· Pedido personalizado' : ''}
							</span>
						</div>
						<div class="product-subtotal">${formatearDinero(subtotal)}</div>
					</div>
				`;
			}).join('')}
		</div>
	`;
}

function renderizarHistorial(historial) {
	if (!historial || historial.length === 0) {
		return `
			<div class="empty-orders">
				Este pedido aún no tiene historial de estatus.
			</div>
		`;
	}

	const historialOrdenado = [...historial].sort((a, b) =>
		new Date(b.fecha_registro) - new Date(a.fecha_registro)
	);

	return `
		<div class="history-list">
			${historialOrdenado.map((item) => {
				const descripcion = item.estatuspedido?.descripcion ?? 'Sin estatus';

				return `
					<div class="history-row">
						<div class="history-main">
							<strong>${descripcion}</strong>
							<span>Movimiento registrado en el sistema</span>
						</div>
						<div class="history-date">${formatearFechaHora(item.fecha_registro)}</div>
					</div>
				`;
			}).join('')}
		</div>
	`;
}

function renderizarMapaRecogida(pedido) {
	if (!esPedidoParaRecoger(pedido)) {
		return '';
	}

	return `
		<div class="detail-section pickup-route-section">
			<h4>Ruta para recoger en tienda</h4>
			<p class="pickup-route-intro">
				Usa tu ubicación actual para calcular la ruta hacia Dulce Mordisco.
			</p>

			<div id="mensaje-ruta-recogida-${pedido.id_pedido}" class="pickup-route-message success">
				Abre el detalle para calcular la ruta hacia la tienda.
			</div>

			<div class="pickup-route-summary">
				<div class="pickup-route-box">
					<strong>Origen</strong>
					<span id="ruta-recogida-origen-${pedido.id_pedido}">Tu ubicación actual</span>
				</div>

				<div class="pickup-route-box">
					<strong>Destino</strong>
					<span id="ruta-recogida-destino-${pedido.id_pedido}">${NOMBRE_NEGOCIO}</span>
				</div>

				<div class="pickup-route-box">
					<strong>Distancia</strong>
					<span id="ruta-recogida-distancia-${pedido.id_pedido}">-</span>
				</div>

				<div class="pickup-route-box">
					<strong>Tiempo estimado</strong>
					<span id="ruta-recogida-duracion-${pedido.id_pedido}">-</span>
				</div>
			</div>

			<div id="mapa-recogida-${pedido.id_pedido}" class="pickup-route-map"></div>

			<div class="pickup-route-actions">
				<button
					id="btn-ruta-recogida-${pedido.id_pedido}"
					class="btn-toggle btn-open-route"
					type="button"
					data-ruta-recogida=""
					disabled
				>
					Abrir ruta en Google Maps
				</button>
			</div>
		</div>
	`;
}

function puedeCancelarPedido(pedido) {
	const estatusActual = normalizarTexto(obtenerEstatusActual(pedido.historialestatus, pedido));

	return estatusActual === 'pendiente' || estatusActual === 'aceptado';
}

function obtenerIdEstatusCancelado() {
	const cancelado = estatusCatalogo.find((estatus) => {
		return normalizarTexto(estatus.descripcion) === 'cancelado';
	});

	return cancelado?.id_estatus ?? null;
}

async function cancelarPedido(idPedido) {
	const pedido = pedidosOriginales.find((item) => Number(item.id_pedido) === Number(idPedido));

	if (!pedido) {
		mostrarMensaje('No se encontró el pedido.');
		return;
	}

	if (!puedeCancelarPedido(pedido)) {
		mostrarMensaje('Este pedido ya no se puede cancelar porque ya entró a preparación o a una etapa posterior.');
		return;
	}

	const idEstatusCancelado = obtenerIdEstatusCancelado();

	if (!idEstatusCancelado) {
		mostrarMensaje('No se encontró el estatus Cancelado en la base de datos.');
		return;
	}

	const confirmacion = window.confirm(
		`¿Seguro que deseas cancelar el pedido #${pedido.id_pedido}?`
	);

	if (!confirmacion) {
		return;
	}

	ocultarMensaje();

	try {
		const { error } = await db
			.from('pedido')
			.update({
				id_estatus: idEstatusCancelado,
				id_repartidor: null,
				fecha_entrega_aproximada: null
			})
			.eq('id_pedido', pedido.id_pedido)
			.eq('id_cliente', usuario.id_usuario);

		if (error) {
			console.error('Error al cancelar pedido:', error);
			mostrarMensaje('No se pudo cancelar el pedido.');
			return;
		}

		mostrarMensaje(
			`El pedido #${pedido.id_pedido} fue cancelado correctamente.`,
			'success'
		);

		await cargarPedidosCliente();
	} catch (error) {
		console.error('Error general al cancelar pedido:', error);
		mostrarMensaje('Ocurrió un error al cancelar el pedido.');
	}
}

function renderizarPedidos(pedidos) {
	if (!listaPedidos) {
		return;
	}

	if (!pedidos || pedidos.length === 0) {
		listaPedidos.innerHTML = `
			<div class="empty-orders">
				No se encontraron pedidos con los filtros seleccionados.
			</div>
		`;

		return;
	}

	Object.values(mapasRecogida).forEach((mapa) => {
		if (mapa && typeof mapa.remove === 'function') {
			mapa.remove();
		}
	});
	mapasRecogida = {};

	listaPedidos.innerHTML = pedidos.map((pedido) => {
		const estatusActual = obtenerEstatusActual(pedido.historialestatus, pedido);
		const claseEstado = obtenerClaseEstado(estatusActual);
		const totalProductos = contarProductos(pedido.detallepedido);
		const detalleId = `detalle-pedido-${pedido.id_pedido}`;
		const puedeCancelar = puedeCancelarPedido(pedido);
		const repartidorTexto = esPedidoParaRecoger(pedido)
			? 'No aplica'
			: (pedido.repartidor?.nombre_completo ?? 'Pendiente');
		const tipoEntregaTexto = esPedidoParaRecoger(pedido) ? 'Recoger en tienda' : 'Entrega a domicilio';

		return `
			<article class="order-item">
				<div class="order-head">
					<div>
						<h3>Pedido #${pedido.id_pedido}</h3>
						<p>Realizado el ${formatearFecha(pedido.fecha_pedido)}</p>
					</div>

					<div class="order-status ${claseEstado}">
						${estatusActual}
					</div>
				</div>

				<div class="order-summary">
					<div class="summary-chip">
						<span>Total pagado</span>
						<strong>${formatearDinero(pedido.total_pagar)}</strong>
					</div>

					<div class="summary-chip">
						<span>Productos</span>
						<strong>${totalProductos}</strong>
					</div>

					<div class="summary-chip">
						<span>Repartidor</span>
						<strong>${repartidorTexto}</strong>
					</div>

					<div class="summary-chip">
						<span>Tipo de entrega</span>
						<strong>${tipoEntregaTexto}</strong>
					</div>

					<div class="summary-chip">
						<span>Estatus actual</span>
						<strong>${estatusActual}</strong>
					</div>
				</div>

				<div class="order-actions">
					<button class="btn-toggle" type="button" data-target="${detalleId}">
						Ver detalle
					</button>

					${puedeCancelar ? `
						<button class="btn-cancel-order" type="button" data-cancelar="${pedido.id_pedido}">
							Cancelar pedido
						</button>
					` : ''}
				</div>

				<div class="order-detail" id="${detalleId}">
					<div class="detail-section">
						<h4>Productos del pedido</h4>
						${renderizarDetalleProductos(pedido.detallepedido)}
					</div>

					<div class="detail-section">
						<h4>Comentarios o instrucciones</h4>
						<div class="empty-orders">
							${escaparHtml(pedido.comentario_pedido?.trim() || 'Sin comentarios registrados.')}
						</div>
					</div>

					<div class="detail-section">
						<h4>Historial del pedido</h4>
						${renderizarHistorial(pedido.historialestatus)}
					</div>

					${renderizarMapaRecogida(pedido)}
				</div>
			</article>
		`;
	}).join('');

	asignarEventosDetalle();
	asignarEventosCancelacion();
	asignarEventosRutaRecogida();
}

function asignarEventosDetalle() {
	const botones = document.querySelectorAll('.btn-toggle');

	botones.forEach((boton) => {
		boton.addEventListener('click', () => {
			const targetId = boton.dataset.target;
			const panel = document.getElementById(targetId);

			if (!panel) {
				return;
			}

			const abierto = panel.classList.contains('show');

			if (abierto) {
				panel.classList.remove('show');
				boton.textContent = 'Ver detalle';
			} else {
				panel.classList.add('show');
				boton.textContent = 'Ocultar detalle';

				const pedido = pedidosOriginales.find((item) => {
					return targetId === `detalle-pedido-${item.id_pedido}`;
				});

				if (pedido && esPedidoParaRecoger(pedido)) {
					mostrarRutaRecogida(pedido);
				}
			}
		});
	});
}

function asignarEventosRutaRecogida() {
	const botonesRuta = document.querySelectorAll('[data-ruta-recogida]');

	botonesRuta.forEach((boton) => {
		boton.addEventListener('click', () => {
			const url = boton.dataset.url || '';

			if (url) {
				window.open(url, '_blank');
			}
		});
	});
}

function asignarEventosCancelacion() {
	const botonesCancelar = document.querySelectorAll('[data-cancelar]');

	botonesCancelar.forEach((boton) => {
		boton.addEventListener('click', async () => {
			const idPedido = Number(boton.getAttribute('data-cancelar'));

			boton.disabled = true;
			boton.textContent = 'Cancelando...';

			try {
				await cancelarPedido(idPedido);
			} finally {
				boton.disabled = false;
				boton.textContent = 'Cancelar pedido';
			}
		});
	});
}

function aplicarFiltros() {
	const textoBusqueda = normalizarTexto(buscarPedido?.value || '');
	const estadoSeleccionado = normalizarTexto(filtroEstado?.value || 'todos');
	const cantidadSeleccionada = filtroCantidadPedidos?.value || 'todos';
	const { fechaDesde, fechaHasta } = obtenerRangoFechas();

	let coincidencias = pedidosOriginales.filter((pedido) => {
		const coincideBusqueda =
			textoBusqueda === '' ||
			String(pedido.id_pedido).toLowerCase().includes(textoBusqueda);

		const estatusActual = normalizarTexto(obtenerEstatusActual(pedido.historialestatus, pedido));

		const coincideEstado =
			estadoSeleccionado === 'todos' ||
			estatusActual === estadoSeleccionado;

		return coincideBusqueda && coincideEstado;
	});

	if (fechaDesde || fechaHasta) {
		coincidencias = coincidencias.filter((pedido) => {
			if (!pedido.fecha_pedido) {
				return false;
			}

			const fechaPedido = new Date(pedido.fecha_pedido);

			if (Number.isNaN(fechaPedido.getTime())) {
				return false;
			}

			if (fechaDesde && fechaPedido < fechaDesde) {
				return false;
			}

			if (fechaHasta && fechaPedido > fechaHasta) {
				return false;
			}

			return true;
		});
	}

	const totalCoincidencias = coincidencias.length;
	const limiteCantidad = Number.parseInt(cantidadSeleccionada, 10);

	pedidosFiltrados = [...coincidencias];

	if (cantidadSeleccionada !== 'todos' && Number.isFinite(limiteCantidad) && limiteCantidad > 0) {
		pedidosFiltrados = pedidosFiltrados.slice(0, limiteCantidad);
	}

	actualizarTextoResultados(totalCoincidencias, pedidosFiltrados.length);
	renderizarPedidos(pedidosFiltrados);
	actualizarResumen(pedidosFiltrados);
}

if (buscarPedido) {
	buscarPedido.addEventListener('input', aplicarFiltros);
}

if (filtroEstado) {
	filtroEstado.addEventListener('change', aplicarFiltros);
}

if (filtroFechaDesde) {
	filtroFechaDesde.addEventListener('input', aplicarFiltros);
}

if (filtroFechaHasta) {
	filtroFechaHasta.addEventListener('input', aplicarFiltros);
}

if (filtroCantidadPedidos) {
	filtroCantidadPedidos.addEventListener('change', aplicarFiltros);
}

if (btnLimpiarFiltros) {
	btnLimpiarFiltros.addEventListener('click', () => {
		if (buscarPedido) {
			buscarPedido.value = '';
		}

		if (filtroEstado) {
			filtroEstado.value = 'todos';
		}

		if (filtroFechaDesde) {
			filtroFechaDesde.value = '';
		}

		if (filtroFechaHasta) {
			filtroFechaHasta.value = '';
		}

		if (filtroCantidadPedidos) {
			filtroCantidadPedidos.value = 'todos';
		}

		aplicarFiltros();
	});
}

async function cargarEstatus() {
	try {
		const { data, error } = await db
			.from('estatuspedido')
			.select('id_estatus, descripcion')
			.order('id_estatus', { ascending: true });

		if (error) {
			console.error('Error al cargar estatus:', error);
			return;
		}

		estatusCatalogo = data ?? [];
	} catch (error) {
		console.error('Error general al cargar estatus:', error);
	}
}

async function cargarPedidosCliente() {
	if (!usuario || !usuario.id_usuario) {
		window.location.href = '/login/login.html';
		return;
	}

	ocultarMensaje();

	try {
		const { data, error } = await db
			.from('pedido')
			.select(`
				id_pedido,
				id_cliente,
				id_repartidor,
				id_estatus,
				fecha_pedido,
				total_pagar,
				fecha_entrega_aproximada,
				lugar_entrega,
				comentario_pedido,
				tipo_entrega,
				estatuspedido (
					id_estatus,
					descripcion
				),
				repartidor:usuario!pedido_id_repartidor_fkey (
					id_usuario,
					nombre_completo
				),
				detallepedido (
					id_detalle,
					id_producto,
					cantidad,
					subtotal,
					cantidad_stock,
					cantidad_personalizada,
					personalizado,
					producto (
						id_producto,
						nombre_producto
					)
				),
				historialestatus (
					id_historial,
					fecha_registro,
					estatuspedido (
						id_estatus,
						descripcion
					)
				)
			`)
			.eq('id_cliente', usuario.id_usuario)
			.order('fecha_pedido', { ascending: false });

		if (error) {
			console.error('Error al cargar pedidos:', error);
			mostrarMensaje('No se pudieron cargar tus pedidos.');
			listaPedidos.innerHTML = `
				<div class="empty-orders">
					No fue posible consultar la información por el momento.
				</div>
			`;
			return;
		}

		pedidosOriginales = data ?? [];
		pedidosFiltrados = [...pedidosOriginales];
		aplicarFiltros();

		if (fechaActualizacion) {
			fechaActualizacion.textContent = new Date().toLocaleString('es-MX', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}
	} catch (err) {
		console.error('Error general al cargar pedidos:', err);
		mostrarMensaje('Ocurrió un error al consultar tus pedidos.');
		listaPedidos.innerHTML = `
			<div class="empty-orders">
				Ocurrió un error al consultar la información.
			</div>
		`;
	}
}

async function inicializarPantalla() {
	animarTarjetas();
	await cargarEstatus();
	await cargarPedidosCliente();
	vincularCierreMenuEnSidebar();
}

inicializarPantalla();
