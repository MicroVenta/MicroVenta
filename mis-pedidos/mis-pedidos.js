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
let estatusCatalogo = [];

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
		const repartidorTexto = pedido.repartidor?.nombre_completo ?? 'Pendiente';

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
				</div>
			</article>
		`;
	}).join('');

	asignarEventosDetalle();
	asignarEventosCancelacion();
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
}

inicializarPantalla();