const DIRECCION_NEGOCIO = '21.478741236697257, -104.86570974660742';

const nombreRepartidor = document.getElementById('nombreRepartidor');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionSidebar = document.getElementById('btnCerrarSesionSidebar');

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
		const cliente = pedido.cliente?.nombre_completo ?? 'Cliente no disponible';
		const direccion = pedido.lugar_entrega ?? 'Lugar de entrega no registrado';
		const telefono = pedido.cliente?.telefono ?? 'Sin teléfono';
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
					<p><strong>Fecha pedido:</strong> ${formatearFecha(pedido.fecha_pedido)}</p>
					<p><strong>Entrega:</strong> ${fechaEntrega}</p>
					<p><strong>Lugar de entrega:</strong> ${escaparHtml(direccion)}</p>
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
			const cliente = (pedido.cliente?.nombre_completo ?? '').toLowerCase();
			const direccion = (pedido.lugar_entrega ?? '').toLowerCase();
			const telefono = (pedido.cliente?.telefono ?? '').toLowerCase();
			const estatus = obtenerDescripcionEstatus(pedido).toLowerCase();

			return (
				idPedido.includes(textoBusqueda) ||
				cliente.includes(textoBusqueda) ||
				direccion.includes(textoBusqueda) ||
				telefono.includes(textoBusqueda) ||
				estatus.includes(textoBusqueda)
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

function obtenerIdEstatusPorDescripcion(...descripciones) {
	for (const descripcion of descripciones) {
		const clave = descripcion.trim().toLowerCase();

		if (mapaEstatus[clave]) {
			return mapaEstatus[clave];
		}
	}

	return null;
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

function inicializarMapaRuta() {
	if (mapaRuta) {
		return;
	}

	mapaRuta = L.map('mapaRuta', {
		zoomControl: true
	}).setView([23.2494, -106.4111], 12);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; OpenStreetMap'
	}).addTo(mapaRuta);
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
			? DIRECCION_NEGOCIO
			: 'Ubicación actual del repartidor';
	}

	if (rutaDestinoTexto) {
		rutaDestinoTexto.textContent = 'Selecciona un pedido.';
	}

	if (btnAbrirRutaExterna) {
		btnAbrirRutaExterna.disabled = true;
	}
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

async function geocodificarDireccion(direccion) {
	const texto = (direccion ?? '').trim();

	if (!texto) {
		throw new Error('No hay una dirección válida para calcular la ruta.');
	}

	const url = new URL('https://nominatim.openstreetmap.org/search');
	url.searchParams.set('q', texto);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('addressdetails', '1');
	url.searchParams.set('limit', '1');
	url.searchParams.set('countrycodes', 'mx');
	url.searchParams.set('accept-language', 'es');

	const respuesta = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo interpretar una de las direcciones.');
	}

	const data = await respuesta.json();

	if (!Array.isArray(data) || data.length === 0) {
		throw new Error('No se encontró una ubicación válida para una de las direcciones.');
	}

	return {
		lat: Number(data[0].lat),
		lon: Number(data[0].lon),
		texto: data[0].display_name ?? texto
	};
}

async function consultarRuta(origen, destino) {
	const coordenadas = `${origen.lon},${origen.lat};${destino.lon},${destino.lat}`;
	const url = `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson&steps=false`;

	const respuesta = await fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo calcular la ruta.');
	}

	const data = await respuesta.json();

	if (!data.routes || !data.routes.length) {
		throw new Error('No se encontró una ruta disponible entre los puntos.');
	}

	return data.routes[0];
}

function dibujarRutaEnMapa(origen, destino, ruta) {
	limpiarMapaRuta();

	marcadorOrigen = L.marker([origen.lat, origen.lon]).addTo(mapaRuta);
	marcadorOrigen.bindPopup('Origen');

	marcadorDestino = L.marker([destino.lat, destino.lon]).addTo(mapaRuta);
	marcadorDestino.bindPopup('Destino');

	capaRuta = L.geoJSON(ruta.geometry, {
		style: {
			color: '#2563eb',
			weight: 6,
			opacity: 0.9
		}
	}).addTo(mapaRuta);

	const grupo = L.featureGroup([marcadorOrigen, marcadorDestino, capaRuta]);
	mapaRuta.fitBounds(grupo.getBounds(), {
		padding: [30, 30]
	});
}

async function obtenerOrigenRuta() {
	if (modoOrigenRuta === 'actual') {
		return obtenerUbicacionActual();
	}

	return geocodificarDireccion(DIRECCION_NEGOCIO);
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

	if (btnAbrirRutaExterna) {
		btnAbrirRutaExterna.disabled = true;
	}

	if (rutaPedidoId) {
		rutaPedidoId.textContent = `#${pedido.id_pedido}`;
	}

	if (rutaClienteNombre) {
		rutaClienteNombre.textContent = pedido.cliente?.nombre_completo ?? 'Cliente no disponible';
	}

	if (rutaDistancia) {
		rutaDistancia.textContent = '-';
	}

	if (rutaDuracion) {
		rutaDuracion.textContent = '-';
	}

	if (rutaDestinoTexto) {
		rutaDestinoTexto.textContent = pedido.lugar_entrega ?? 'Lugar de entrega no registrado';
	}

	try {
		const origen = await obtenerOrigenRuta();
		const destino = await geocodificarDireccion(pedido.lugar_entrega ?? '');
		const ruta = await consultarRuta(origen, destino);

		dibujarRutaEnMapa(origen, destino, ruta);

		if (rutaOrigenTexto) {
			rutaOrigenTexto.textContent = origen.texto ?? `${origen.lat}, ${origen.lon}`;
		}

		if (rutaDestinoTexto) {
			rutaDestinoTexto.textContent = destino.texto;
		}

		if (rutaDistancia) {
			rutaDistancia.textContent = formatearDistancia(ruta.distance);
		}

		if (rutaDuracion) {
			rutaDuracion.textContent = formatearDuracion(ruta.duration);
		}

		ultimaRutaExterna = construirUrlGoogleMapsRuta(origen.lat, origen.lon, destino.lat, destino.lon);

		if (btnAbrirRutaExterna) {
			btnAbrirRutaExterna.disabled = false;
		}
	} catch (error) {
		console.error('Error al mostrar la ruta del pedido:', error);
		limpiarMapaRuta();
		mostrarMensajeRuta(error.message || 'No se pudo calcular la ruta.', 'error');
		ultimaRutaExterna = '';
	} finally {
		if (btnRecalcularRuta) {
			btnRecalcularRuta.disabled = false;
			btnRecalcularRuta.textContent = 'Recalcular ruta';
		}
	}
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
				fecha_pedido,
				fecha_entrega_aproximada,
				lugar_entrega,
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
		if (pedidoRutaActual) {
			await mostrarRutaPedido(pedidoRutaActual);
		}
	});
}

if (btnAbrirRutaExterna) {
	btnAbrirRutaExterna.addEventListener('click', () => {
		if (ultimaRutaExterna) {
			window.open(ultimaRutaExterna, '_blank');
		}
	});
}

animarTarjetas();
actualizarBotonesOrigen();
inicializarMapaRuta();
limpiarResumenRuta();

(async function init() {
	await cargarCatalogoEstatus();
	await cargarPedidosRepartidor();
})();