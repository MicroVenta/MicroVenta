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
let mapasRecogida = new Map();
let rutasRecogida = new Map();

const NOMBRE_TIENDA = 'Dulce Mordisco';
const COORDENADAS_TIENDA = {
	lat: 21.478741236697257,
	lon: -104.86570974660742
};
const OSRM_ENDPOINTS = [
	'/api/ruta-osrm',
	'https://router.project-osrm.org/route/v1/driving',
	'https://routing.openstreetmap.de/routed-car/route/v1/driving'
];

function normalizarTexto(texto) {
	return String(texto ?? '').trim().toLowerCase();
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

function esPedidoParaRecogerEnTienda(pedido) {
	return normalizarTexto(pedido?.lugar_entrega).startsWith('pasaran a recogerlo en tienda');
}

function construirUrlGoogleMapsTienda(origen) {
	const destino = `${COORDENADAS_TIENDA.lat},${COORDENADAS_TIENDA.lon}`;

	if (!origen) {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destino)}`;
	}

	return `https://www.google.com/maps/dir/?api=1&origin=${origen.lat},${origen.lon}&destination=${destino}&travelmode=driving`;
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

function renderizarRutaTienda(pedido) {
	if (!esPedidoParaRecogerEnTienda(pedido)) {
		return '';
	}

	const mapaId = `mapa-recogida-${pedido.id_pedido}`;
	const mensajeId = `mensaje-ruta-recogida-${pedido.id_pedido}`;
	const distanciaId = `distancia-ruta-recogida-${pedido.id_pedido}`;
	const duracionId = `duracion-ruta-recogida-${pedido.id_pedido}`;
	const botonExternoId = `ruta-externa-recogida-${pedido.id_pedido}`;
	const fechaRecogida = pedido.fecha_entrega_aproximada
		? formatearFechaHora(pedido.fecha_entrega_aproximada)
		: 'Pendiente de confirmar';

	return `
		<div class="pickup-route-box">
			<div class="pickup-route-head">
				<div>
					<h5>Ruta para recoger en tienda</h5>
					<p>Fecha para pasar: ${fechaRecogida}</p>
				</div>

				<div class="pickup-route-actions">
					<button class="btn-route-store" type="button" data-ruta-tienda="${pedido.id_pedido}">
						Ver ruta
					</button>

					<button
						id="${botonExternoId}"
						class="btn-route-store btn-route-store-light"
						type="button"
						data-ruta-externa="${pedido.id_pedido}"
					>
						Abrir en Maps
					</button>
				</div>
			</div>

			<div class="pickup-route-summary">
				<div>
					<span>Destino</span>
					<strong>${NOMBRE_TIENDA}</strong>
				</div>

				<div>
					<span>Distancia</span>
					<strong id="${distanciaId}">-</strong>
				</div>

				<div>
					<span>Tiempo aproximado</span>
					<strong id="${duracionId}">-</strong>
				</div>
			</div>

			<div id="${mensajeId}" class="route-message hidden"></div>
			<div id="${mapaId}" class="pickup-route-map"></div>
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

	limpiarMapasRecogida();

	if (!pedidos || pedidos.length === 0) {
		listaPedidos.innerHTML = `
			<div class="empty-orders">
				No se encontraron pedidos con los filtros seleccionados.
			</div>
		`;

		if (textoResultados) {
			textoResultados.textContent = '0 pedidos encontrados.';
		}

		return;
	}

	if (textoResultados) {
		textoResultados.textContent = `${pedidos.length} pedido(s) encontrado(s).`;
	}

	listaPedidos.innerHTML = pedidos.map((pedido) => {
		const estatusActual = obtenerEstatusActual(pedido.historialestatus, pedido);
		const claseEstado = obtenerClaseEstado(estatusActual);
		const totalProductos = contarProductos(pedido.detallepedido);
		const detalleId = `detalle-pedido-${pedido.id_pedido}`;
		const puedeCancelar = puedeCancelarPedido(pedido);
		const esRecogidaTienda = esPedidoParaRecogerEnTienda(pedido);
		const repartidorTexto = esRecogidaTienda
			? 'No aplica'
			: pedido.repartidor?.nombre_completo ?? 'Pendiente';

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
						<h4>Historial del pedido</h4>
						${renderizarHistorial(pedido.historialestatus)}
					</div>

					${renderizarRutaTienda(pedido)}
				</div>
			</article>
		`;
	}).join('');

	asignarEventosDetalle();
	asignarEventosCancelacion();
	asignarEventosRutaTienda();
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

function limpiarMapasRecogida() {
	mapasRecogida.forEach((mapa) => {
		mapa.remove();
	});

	mapasRecogida = new Map();
	rutasRecogida = new Map();
}

function mostrarMensajeRuta(idPedido, texto, tipo = 'error') {
	const mensaje = document.getElementById(`mensaje-ruta-recogida-${idPedido}`);

	if (!mensaje) {
		return;
	}

	mensaje.textContent = texto;
	mensaje.className = `route-message ${tipo}`;
	mensaje.classList.remove('hidden');
}

function ocultarMensajeRuta(idPedido) {
	const mensaje = document.getElementById(`mensaje-ruta-recogida-${idPedido}`);

	if (!mensaje) {
		return;
	}

	mensaje.textContent = '';
	mensaje.className = 'route-message hidden';
}

function obtenerUbicacionActual() {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error('Tu navegador no soporta geolocalizacion.'));
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(posicion) => {
				resolve({
					lat: posicion.coords.latitude,
					lon: posicion.coords.longitude
				});
			},
			(error) => {
				let mensaje = 'No se pudo obtener tu ubicacion actual.';

				if (error.code === 1) {
					mensaje = 'Debes permitir el acceso a tu ubicacion para calcular la ruta.';
				} else if (error.code === 2) {
					mensaje = 'No fue posible determinar tu ubicacion actual.';
				} else if (error.code === 3) {
					mensaje = 'La solicitud de ubicacion tardo demasiado.';
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

async function consultarRutaTienda(origen) {
	const destino = COORDENADAS_TIENDA;
	const coordenadas = `${origen.lon},${origen.lat};${destino.lon},${destino.lat}`;
	let ultimoError = null;

	for (const endpoint of OSRM_ENDPOINTS) {
		const esProxy = endpoint.startsWith('/api/');
		const url = esProxy
			? `${endpoint}?coordinates=${encodeURIComponent(coordenadas)}`
			: `${endpoint}/${coordenadas}?overview=full&geometries=geojson&steps=false`;

		try {
			const respuesta = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});

			if (!respuesta.ok) {
				ultimoError = `No se pudo calcular la ruta con ${endpoint}.`;
				continue;
			}

			const data = await respuesta.json();

			if (!data.routes || !data.routes.length) {
				ultimoError = `No se encontro una ruta disponible con ${endpoint}.`;
				continue;
			}

			return data.routes[0];
		} catch (error) {
			ultimoError = error.message;
		}
	}

	throw new Error(ultimoError || 'No se pudo calcular la ruta a la tienda.');
}

function obtenerMapaRecogida(idPedido) {
	if (mapasRecogida.has(idPedido)) {
		const mapaExistente = mapasRecogida.get(idPedido);
		mapaExistente.invalidateSize();
		return mapaExistente;
	}

	const mapa = L.map(`mapa-recogida-${idPedido}`, {
		zoomControl: true
	}).setView([COORDENADAS_TIENDA.lat, COORDENADAS_TIENDA.lon], 14);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; OpenStreetMap'
	}).addTo(mapa);

	mapasRecogida.set(idPedido, mapa);

	return mapa;
}

function limpiarCapasMapaRecogida(mapa) {
	mapa.eachLayer((layer) => {
		if (layer.options?.attribution) {
			return;
		}

		mapa.removeLayer(layer);
	});
}

function dibujarRutaTienda(idPedido, origen, ruta) {
	const mapa = obtenerMapaRecogida(idPedido);
	const destino = COORDENADAS_TIENDA;

	limpiarCapasMapaRecogida(mapa);

	const marcadorOrigen = L.marker([origen.lat, origen.lon]).addTo(mapa);
	marcadorOrigen.bindPopup('Tu ubicacion');

	const marcadorDestino = L.marker([destino.lat, destino.lon]).addTo(mapa);
	marcadorDestino.bindPopup(NOMBRE_TIENDA);

	const capaRuta = L.geoJSON(ruta.geometry, {
		style: {
			color: '#356a9a',
			weight: 6,
			opacity: 0.9
		}
	}).addTo(mapa);

	const grupo = L.featureGroup([marcadorOrigen, marcadorDestino, capaRuta]);
	mapa.fitBounds(grupo.getBounds(), {
		padding: [28, 28]
	});

	window.setTimeout(() => {
		mapa.invalidateSize();
	}, 160);
}

async function mostrarRutaTienda(idPedido, boton) {
	ocultarMensajeRuta(idPedido);

	if (typeof L === 'undefined') {
		mostrarMensajeRuta(idPedido, 'No se pudo cargar el mapa. Intenta abrir la ruta en Maps.');
		return;
	}

	if (boton) {
		boton.disabled = true;
		boton.textContent = 'Calculando...';
	}

	try {
		const origen = await obtenerUbicacionActual();
		const ruta = await consultarRutaTienda(origen);

		rutasRecogida.set(idPedido, construirUrlGoogleMapsTienda(origen));
		dibujarRutaTienda(idPedido, origen, ruta);

		const distancia = document.getElementById(`distancia-ruta-recogida-${idPedido}`);
		const duracion = document.getElementById(`duracion-ruta-recogida-${idPedido}`);

		if (distancia) {
			distancia.textContent = formatearDistancia(ruta.distance);
		}

		if (duracion) {
			duracion.textContent = formatearDuracion(ruta.duration);
		}

		mostrarMensajeRuta(idPedido, 'Ruta calculada desde tu ubicacion actual.', 'success');
	} catch (error) {
		console.error('Error al mostrar ruta a tienda:', error);
		rutasRecogida.set(idPedido, construirUrlGoogleMapsTienda());
		mostrarMensajeRuta(error.idPedido ?? idPedido, error.message || 'No se pudo calcular la ruta a la tienda.');
	} finally {
		if (boton) {
			boton.disabled = false;
			boton.textContent = 'Ver ruta';
		}
	}
}

function asignarEventosRutaTienda() {
	const botonesRuta = document.querySelectorAll('[data-ruta-tienda]');
	const botonesRutaExterna = document.querySelectorAll('[data-ruta-externa]');

	botonesRuta.forEach((boton) => {
		boton.addEventListener('click', async () => {
			const idPedido = Number(boton.getAttribute('data-ruta-tienda'));
			await mostrarRutaTienda(idPedido, boton);
		});
	});

	botonesRutaExterna.forEach((boton) => {
		boton.addEventListener('click', () => {
			const idPedido = Number(boton.getAttribute('data-ruta-externa'));
			const url = rutasRecogida.get(idPedido) ?? construirUrlGoogleMapsTienda();
			window.open(url, '_blank');
		});
	});
}

function aplicarFiltros() {
	const textoBusqueda = normalizarTexto(buscarPedido?.value || '');
	const estadoSeleccionado = normalizarTexto(filtroEstado?.value || 'todos');

	pedidosFiltrados = pedidosOriginales.filter((pedido) => {
		const coincideBusqueda =
			textoBusqueda === '' ||
			String(pedido.id_pedido).toLowerCase().includes(textoBusqueda);

		const estatusActual = normalizarTexto(obtenerEstatusActual(pedido.historialestatus, pedido));

		const coincideEstado =
			estadoSeleccionado === 'todos' ||
			estatusActual === estadoSeleccionado;

		return coincideBusqueda && coincideEstado;
	});

	renderizarPedidos(pedidosFiltrados);
	actualizarResumen(pedidosFiltrados);
}

if (buscarPedido) {
	buscarPedido.addEventListener('input', aplicarFiltros);
}

if (filtroEstado) {
	filtroEstado.addEventListener('change', aplicarFiltros);
}

if (btnLimpiarFiltros) {
	btnLimpiarFiltros.addEventListener('click', () => {
		if (buscarPedido) {
			buscarPedido.value = '';
		}

		if (filtroEstado) {
			filtroEstado.value = 'todos';
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

		renderizarPedidos(pedidosFiltrados);
		actualizarResumen(pedidosFiltrados);

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
