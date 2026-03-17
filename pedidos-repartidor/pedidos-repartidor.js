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

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let pedidosOriginales = [];
let mapaEstatus = {};

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
	const estatus = estatusNormalizado(pedido);

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

function abrirEnGoogleMaps(url) {
	if (!url) {
		mostrarMensaje('No hay una dirección válida para abrir en Google Maps.', 'error');
		return;
	}

	window.open(url, '_blank');
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
		const direccion = pedido.cliente?.direccion ?? 'Dirección no registrada';
		const telefono = pedido.cliente?.telefono ?? 'Sin teléfono';
		const urlMaps = construirUrlGoogleMaps(direccion);

		return `
			<article class="order-item">
				<div class="order-item-top">
					<h4>Pedido #${pedido.id_pedido}</h4>
					<div class="order-badge ${obtenerClaseBadge(pedido)}">${escaparHtml(estatusActual)}</div>
				</div>

				<div class="order-meta">
					<p><strong>Cliente:</strong> ${escaparHtml(cliente)}</p>
					<p><strong>Fecha:</strong> ${formatearFecha(pedido.fecha_pedido)}</p>
					<p><strong>Dirección:</strong> ${escaparHtml(direccion)}</p>
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
}

function aplicarFiltros() {
	const textoBusqueda = (buscarEntrega?.value ?? '').trim().toLowerCase();
	const estadoFiltro = (filtroEstado?.value ?? 'todos').trim().toLowerCase();

	let pedidosFiltrados = [...pedidosOriginales];

	if (textoBusqueda) {
		pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
			const idPedido = String(pedido.id_pedido ?? '').toLowerCase();
			const cliente = (pedido.cliente?.nombre_completo ?? '').toLowerCase();
			const direccion = (pedido.cliente?.direccion ?? '').toLowerCase();
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
		nuevoIdEstatus = obtenerIdEstatusPorDescripcion('en camino', 'en ruta', 'enviando');
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
					direccion,
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

		const idPedido = Number(boton.dataset.id);

		if (!idPedido || !accion) {
			return;
		}

		await actualizarEstatusPedido(idPedido, accion, boton);
	});
}

animarTarjetas();

(async function init() {
	await cargarCatalogoEstatus();
	await cargarPedidosRepartidor();
})();