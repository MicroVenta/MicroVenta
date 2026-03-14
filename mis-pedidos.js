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

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let pedidosOriginales = [];
let pedidosFiltrados = [];

if (!usuarioGuardado) {
	window.location.href = 'login.html';
} else {
	try {
		usuario = JSON.parse(usuarioGuardado);
	} catch (error) {
		sessionStorage.removeItem('microventa_usuario');
		localStorage.removeItem('microventa_usuario');
		window.location.href = 'login.html';
	}
}

if (usuario) {
	if (usuario.nombre_rol !== 'cliente') {
		window.location.href = 'login.html';
	} else if (nombreCliente) {
		nombreCliente.textContent = usuario.nombre_completo || 'Cliente';
	}
}

function cerrarSesion() {
	sessionStorage.removeItem('microventa_usuario');
	localStorage.removeItem('microventa_usuario');
	window.location.href = 'login.html';
}

if (btnCerrarSesion) {
	btnCerrarSesion.addEventListener('click', cerrarSesion);
}

if (btnCerrarSesionSidebar) {
	btnCerrarSesionSidebar.addEventListener('click', cerrarSesion);
}

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

function obtenerEstatusActual(historial) {
	if (!historial || historial.length === 0) {
		return 'Sin estatus';
	}

	const historialOrdenado = [...historial].sort((a, b) =>
		new Date(b.fecha_registro) - new Date(a.fecha_registro)
	);

	return historialOrdenado[0]?.estatuspedido?.descripcion ?? 'Sin estatus';
}

function obtenerClaseEstado(estatus) {
	const estado = (estatus || '').toLowerCase().trim();

	if (estado === 'pendiente') {
		return 'estado-pendiente';
	}

	if (estado === 'preparando') {
		return 'estado-preparando';
	}

	if (estado === 'en camino') {
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
		const estatus = obtenerEstatusActual(pedido.historialestatus).toLowerCase();
		return !estadosFinales.includes(estatus);
	}).length;
}

function contarPedidosEntregados(pedidos) {
	const estadosExito = ['entregado', 'completado'];

	return pedidos.filter((pedido) => {
		const estatus = obtenerEstatusActual(pedido.historialestatus).toLowerCase();
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

				return `
					<div class="product-row">
						<div class="product-main">
							<strong>${nombreProducto}</strong>
							<span>Cantidad: ${cantidad}</span>
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

		if (textoResultados) {
			textoResultados.textContent = '0 pedidos encontrados.';
		}

		return;
	}

	if (textoResultados) {
		textoResultados.textContent = `${pedidos.length} pedido(s) encontrado(s).`;
	}

	listaPedidos.innerHTML = pedidos.map((pedido) => {
		const estatusActual = obtenerEstatusActual(pedido.historialestatus);
		const claseEstado = obtenerClaseEstado(estatusActual);
		const totalProductos = contarProductos(pedido.detallepedido);
		const detalleId = `detalle-pedido-${pedido.id_pedido}`;

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
						<strong>${pedido.id_repartidor ?? 'Pendiente'}</strong>
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
				</div>
			</article>
		`;
	}).join('');

	asignarEventosDetalle();
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

function aplicarFiltros() {
	const textoBusqueda = (buscarPedido?.value || '').trim().toLowerCase();
	const estadoSeleccionado = (filtroEstado?.value || 'todos').toLowerCase();

	pedidosFiltrados = pedidosOriginales.filter((pedido) => {
		const coincideBusqueda =
			textoBusqueda === '' ||
			String(pedido.id_pedido).toLowerCase().includes(textoBusqueda);

		const estatusActual = obtenerEstatusActual(pedido.historialestatus).toLowerCase();

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

async function cargarPedidosCliente() {
	if (!usuario || !usuario.id_usuario) {
		window.location.href = 'login.html';
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
				fecha_pedido,
				total_pagar,
				detallepedido (
					id_detalle,
					id_producto,
					cantidad,
					subtotal,
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

animarTarjetas();
cargarPedidosCliente();