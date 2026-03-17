const nombreUsuario = document.getElementById('nombreUsuario');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionSidebar = document.getElementById('btnCerrarSesionSidebar');

const buscarPedido = document.getElementById('buscarPedido');
const filtroEstatus = document.getElementById('filtroEstatus');
const filtroRepartidor = document.getElementById('filtroRepartidor');

const statTotalPedidos = document.getElementById('statTotalPedidos');
const statEnProceso = document.getElementById('statEnProceso');
const statFinalizados = document.getElementById('statFinalizados');
const statIngresos = document.getElementById('statIngresos');

const resumenPedidos = document.getElementById('resumenPedidos');
const tablaPedidosBody = document.getElementById('tablaPedidosBody');

const modalPedido = document.getElementById('modalPedido');
const modalBackdrop = document.getElementById('modalBackdrop');
const btnCerrarModal = document.getElementById('btnCerrarModal');

const detalleIdPedido = document.getElementById('detalleIdPedido');
const detalleCliente = document.getElementById('detalleCliente');
const detalleFecha = document.getElementById('detalleFecha');
const detalleTotal = document.getElementById('detalleTotal');
const detalleRepartidor = document.getElementById('detalleRepartidor');
const detalleEstatus = document.getElementById('detalleEstatus');
const detalleProductos = document.getElementById('detalleProductos');
const detalleHistorial = document.getElementById('detalleHistorial');

const selectRepartidorModal = document.getElementById('selectRepartidorModal');
const selectEstatusModal = document.getElementById('selectEstatusModal');
const btnGuardarCambiosPedido = document.getElementById('btnGuardarCambiosPedido');
const mensajeAccion = document.getElementById('mensajeAccion');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let pedidosOriginales = [];
let repartidoresOriginales = [];
let estatusOriginales = [];
let pedidoSeleccionado = null;

function cerrarSesion() {
	sessionStorage.removeItem('microventa_usuario');
	localStorage.removeItem('microventa_usuario');
	window.location.href = '/login/login.html';
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

if (Number(usuario.id_rol) !== 1) {
	window.location.href = '/login/login.html';
}

if (nombreUsuario) {
	nombreUsuario.textContent = usuario.nombre_completo ?? 'Administrador';
}

if (btnCerrarSesion) {
	btnCerrarSesion.addEventListener('click', cerrarSesion);
}

if (btnCerrarSesionSidebar) {
	btnCerrarSesionSidebar.addEventListener('click', cerrarSesion);
}

function normalizarTexto(texto) {
	return String(texto ?? '').trim().toLowerCase();
}

function formatearMoneda(valor) {
	return `$${Number(valor ?? 0).toFixed(2)}`;
}

function formatearFecha(fecha) {
	if (!fecha) {
		return 'Sin fecha';
	}

	return new Date(fecha).toLocaleString('es-MX', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function mostrarMensajeAccion(tipo, texto) {
	mensajeAccion.className = 'message';
	mensajeAccion.textContent = '';

	if (tipo) {
		mensajeAccion.classList.add(tipo);
		mensajeAccion.textContent = texto;
	}
}

function obtenerNombreCliente(pedido) {
	return pedido.cliente?.nombre_completo ?? 'Cliente no disponible';
}

function obtenerNombreRepartidor(pedido) {
	return pedido.repartidor?.nombre_completo ?? 'Sin asignar';
}

function obtenerDescripcionEstatus(pedido) {
	return pedido.estatus?.descripcion ?? 'Sin estatus';
}

function obtenerClaseBadgeEstatus(descripcion) {
	const texto = normalizarTexto(descripcion);

	if (texto === 'pendiente') return 'badge badge-pendiente';
	if (texto === 'en espera') return 'badge badge-en-espera';
	if (texto === 'aceptado') return 'badge badge-aceptado';
	if (texto === 'amasando') return 'badge badge-amasando';
	if (texto === 'en el horno') return 'badge badge-en-el-horno';
	if (texto === 'decorando') return 'badge badge-decorando';
	if (texto === 'empaquetando') return 'badge badge-empaquetando';
	if (texto === 'enviando') return 'badge badge-enviando';
	if (texto === 'entregado') return 'badge badge-entregado';
	if (texto === 'completado') return 'badge badge-completado';
	if (texto === 'rechazado') return 'badge badge-rechazado';
	if (texto === 'cancelado') return 'badge badge-cancelado';

	return 'badge badge-default';
}

function esPedidoFinalizado(descripcionEstatus) {
	const estatus = normalizarTexto(descripcionEstatus);
	return estatus === 'entregado' || estatus === 'completado';
}

function esPedidoCerrado(descripcionEstatus) {
	const estatus = normalizarTexto(descripcionEstatus);
	return estatus === 'entregado' ||
		estatus === 'completado' ||
		estatus === 'rechazado' ||
		estatus === 'cancelado';
}

function cargarOpcionesEstatus() {
	filtroEstatus.innerHTML = '<option value="">Todos</option>';
	selectEstatusModal.innerHTML = '<option value="">Selecciona un estatus</option>';

	estatusOriginales.forEach((estatus) => {
		const optionFiltro = document.createElement('option');
		optionFiltro.value = estatus.id_estatus;
		optionFiltro.textContent = estatus.descripcion;
		filtroEstatus.appendChild(optionFiltro);

		const optionModal = document.createElement('option');
		optionModal.value = estatus.id_estatus;
		optionModal.textContent = estatus.descripcion;
		selectEstatusModal.appendChild(optionModal);
	});
}

function cargarOpcionesRepartidores() {
	filtroRepartidor.innerHTML = '<option value="">Todos</option>';
	selectRepartidorModal.innerHTML = '<option value="">Sin asignar</option>';

	repartidoresOriginales.forEach((repartidor) => {
		const optionFiltro = document.createElement('option');
		optionFiltro.value = repartidor.id_usuario;
		optionFiltro.textContent = repartidor.nombre_completo;
		filtroRepartidor.appendChild(optionFiltro);

		const optionModal = document.createElement('option');
		optionModal.value = repartidor.id_usuario;
		optionModal.textContent = repartidor.nombre_completo;
		selectRepartidorModal.appendChild(optionModal);
	});
}

function actualizarEstadisticas(pedidos) {
	const total = pedidos.length;

	const enProceso = pedidos.filter((pedido) => {
		return !esPedidoCerrado(obtenerDescripcionEstatus(pedido));
	}).length;

	const finalizados = pedidos.filter((pedido) => {
		return esPedidoFinalizado(obtenerDescripcionEstatus(pedido));
	}).length;

	const ingresos = pedidos.reduce((acumulado, pedido) => {
		return acumulado + Number(pedido.total_pagar ?? 0);
	}, 0);

	statTotalPedidos.textContent = String(total);
	statEnProceso.textContent = String(enProceso);
	statFinalizados.textContent = String(finalizados);
	statIngresos.textContent = formatearMoneda(ingresos);
}

function renderizarPedidos(pedidos) {
	if (!pedidos.length) {
		tablaPedidosBody.innerHTML = `
			<tr>
				<td colspan="7" class="empty-row">
					No se encontraron pedidos con los filtros seleccionados.
				</td>
			</tr>
		`;
		return;
	}

	tablaPedidosBody.innerHTML = pedidos.map((pedido) => {
		const nombreCliente = obtenerNombreCliente(pedido);
		const nombreRepartidor = obtenerNombreRepartidor(pedido);
		const nombreEstatus = obtenerDescripcionEstatus(pedido);
		const cantidadProductos = Array.isArray(pedido.detalles) ? pedido.detalles.length : 0;

		return `
			<tr>
				<td>
					<div class="order-id">#${pedido.id_pedido}</div>
					<div class="order-subtext">${cantidadProductos} producto(s)</div>
				</td>

				<td>
					<div class="order-id">${nombreCliente}</div>
					<div class="order-subtext">${pedido.cliente?.correo ?? 'Sin correo'}</div>
				</td>

				<td>${formatearFecha(pedido.fecha_pedido)}</td>
				<td>${formatearMoneda(pedido.total_pagar)}</td>
				<td>${nombreRepartidor}</td>

				<td>
					<span class="${obtenerClaseBadgeEstatus(nombreEstatus)}">
						${nombreEstatus}
					</span>
				</td>

				<td>
					<div class="row-actions">
						<button class="btn-mini btn-view" data-id="${pedido.id_pedido}">
							Ver detalle
						</button>
					</div>
				</td>
			</tr>
		`;
	}).join('');

	document.querySelectorAll('.btn-view').forEach((boton) => {
		boton.addEventListener('click', () => {
			const idPedido = boton.getAttribute('data-id');
			const pedido = pedidosOriginales.find(
				(item) => String(item.id_pedido) === String(idPedido)
			);

			if (pedido) {
				abrirModalPedido(pedido);
			}
		});
	});
}

function aplicarFiltrosInterno() {
	let pedidosFiltrados = [...pedidosOriginales];

	const texto = normalizarTexto(buscarPedido.value);
	const estatusSeleccionado = filtroEstatus.value;
	const repartidorSeleccionado = filtroRepartidor.value;

	if (texto !== '') {
		pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
			const bloqueBusqueda = [
				String(pedido.id_pedido),
				obtenerNombreCliente(pedido),
				obtenerNombreRepartidor(pedido),
				obtenerDescripcionEstatus(pedido),
				pedido.cliente?.correo ?? ''
			].join(' ');

			return normalizarTexto(bloqueBusqueda).includes(texto);
		});
	}

	if (estatusSeleccionado !== '') {
		pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
			return String(pedido.id_estatus) === String(estatusSeleccionado);
		});
	}

	if (repartidorSeleccionado !== '') {
		pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
			return String(pedido.id_repartidor ?? '') === String(repartidorSeleccionado);
		});
	}

	resumenPedidos.textContent = `${pedidosFiltrados.length} pedido(s) encontrado(s).`;

	return pedidosFiltrados;
}

function aplicarFiltros() {
	const pedidosFiltrados = aplicarFiltrosInterno();
	actualizarEstadisticas(pedidosFiltrados);
	renderizarPedidos(pedidosFiltrados);
}

function renderizarProductosDetalle(pedido) {
	const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];

	if (!detalles.length) {
		detalleProductos.innerHTML = `
			<div class="empty-detail">Este pedido no tiene productos registrados.</div>
		`;
		return;
	}

	detalleProductos.innerHTML = detalles.map((detalle) => {
		const nombreProducto = detalle.producto?.nombre_producto ?? 'Producto no disponible';
		const precioUnitario = Number(detalle.producto?.precio_unitario ?? 0);
		const cantidad = Number(detalle.cantidad ?? 0);
		const subtotal = Number(detalle.subtotal ?? 0);

		return `
			<div class="product-line">
				<div class="product-line-left">
					<div class="product-line-name">${nombreProducto}</div>
					<div class="product-line-meta">
						Cantidad: ${cantidad} · Precio unitario: ${formatearMoneda(precioUnitario)}
					</div>
				</div>

				<div class="product-line-price">${formatearMoneda(subtotal)}</div>
			</div>
		`;
	}).join('');
}

function renderizarHistorial(pedido) {
	const historial = Array.isArray(pedido.historial) ? [...pedido.historial] : [];

	if (!historial.length) {
		detalleHistorial.innerHTML = `
			<div class="empty-detail">Este pedido no tiene historial registrado.</div>
		`;
		return;
	}

	historial.sort((a, b) => {
		return new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime();
	});

	detalleHistorial.innerHTML = historial.map((registro) => {
		return `
			<div class="timeline-item">
				<div class="timeline-dot"></div>
				<div class="timeline-body">
					<strong>${registro.estatus?.descripcion ?? 'Sin estatus'}</strong>
					<span>${formatearFecha(registro.fecha_registro)}</span>
				</div>
			</div>
		`;
	}).join('');
}

function abrirModalPedido(pedido) {
	pedidoSeleccionado = pedido;
	mostrarMensajeAccion('', '');

	detalleIdPedido.textContent = `#${pedido.id_pedido}`;
	detalleCliente.textContent = obtenerNombreCliente(pedido);
	detalleFecha.textContent = formatearFecha(pedido.fecha_pedido);
	detalleTotal.textContent = formatearMoneda(pedido.total_pagar);
	detalleRepartidor.textContent = obtenerNombreRepartidor(pedido);
	detalleEstatus.innerHTML = `
		<span class="${obtenerClaseBadgeEstatus(obtenerDescripcionEstatus(pedido))}">
			${obtenerDescripcionEstatus(pedido)}
		</span>
	`;

	selectRepartidorModal.value = pedido.id_repartidor ? String(pedido.id_repartidor) : '';
	selectEstatusModal.value = pedido.id_estatus ? String(pedido.id_estatus) : '';

	renderizarProductosDetalle(pedido);
	renderizarHistorial(pedido);

	modalPedido.classList.remove('hidden');
	document.body.style.overflow = 'hidden';
}

function cerrarModalPedido() {
	modalPedido.classList.add('hidden');
	document.body.style.overflow = '';
	pedidoSeleccionado = null;
	mostrarMensajeAccion('', '');
}

async function cargarEstatus() {
	const { data, error } = await db
		.from('estatuspedido')
		.select('id_estatus, descripcion')
		.order('id_estatus', { ascending: true });

	if (error) {
		console.error('Error al cargar estatus:', error);
		return;
	}

	estatusOriginales = data ?? [];
	cargarOpcionesEstatus();
}

async function cargarRepartidores() {
	const { data, error } = await db
		.from('usuario')
		.select('id_usuario, nombre_completo')
		.eq('id_rol', 3)
		.eq('Estado', true)
		.order('nombre_completo', { ascending: true });

	if (error) {
		console.error('Error al cargar repartidores:', error);
		return;
	}

	repartidoresOriginales = data ?? [];
	cargarOpcionesRepartidores();
}

async function cargarPedidos() {
	const { data, error } = await db
		.from('pedido')
		.select(`
			id_pedido,
			id_cliente,
			id_repartidor,
			fecha_pedido,
			total_pagar,
			id_estatus,
			cliente:usuario!pedido_id_cliente_fkey (
				id_usuario,
				nombre_completo,
				correo
			),
			repartidor:usuario!pedido_id_repartidor_fkey (
				id_usuario,
				nombre_completo
			),
			estatus:estatuspedido!pedido_id_estatus_fkey (
				id_estatus,
				descripcion
			),
			detalles:detallepedido (
				id_detalle,
				id_producto,
				cantidad,
				subtotal,
				producto:producto (
					id_producto,
					nombre_producto,
					precio_unitario
				)
			),
			historial:historialestatus (
				id_historial,
				id_estatus,
				fecha_registro,
				estatus:estatuspedido (
					id_estatus,
					descripcion
				)
			)
		`)
		.order('id_pedido', { ascending: false });

	if (error) {
		console.error('Error al cargar pedidos:', error);
		tablaPedidosBody.innerHTML = `
			<tr>
				<td colspan="7" class="empty-row">
					No se pudieron cargar los pedidos.
				</td>
			</tr>
		`;
		resumenPedidos.textContent = 'No se pudieron cargar los pedidos.';
		return;
	}

	pedidosOriginales = data ?? [];
	aplicarFiltros();
}

async function actualizarPedido(idPedido, idRepartidor, idEstatus) {
	const { error } = await db
		.from('pedido')
		.update({
			id_repartidor: idRepartidor === '' ? null : Number(idRepartidor),
			id_estatus: Number(idEstatus)
		})
		.eq('id_pedido', idPedido);

	if (error) {
		console.error('Error al actualizar pedido:', error);
		throw new Error('No se pudo actualizar el pedido.');
	}
}

btnGuardarCambiosPedido.addEventListener('click', async () => {
	if (!pedidoSeleccionado) {
		return;
	}

	const nuevoRepartidor = selectRepartidorModal.value;
	const nuevoEstatus = selectEstatusModal.value;

	if (nuevoEstatus === '') {
		mostrarMensajeAccion('error', 'Selecciona un estatus.');
		return;
	}

	const sinCambios =
		String(pedidoSeleccionado.id_repartidor ?? '') === String(nuevoRepartidor) &&
		String(pedidoSeleccionado.id_estatus ?? '') === String(nuevoEstatus);

	if (sinCambios) {
		mostrarMensajeAccion('error', 'No hay cambios para guardar.');
		return;
	}

	btnGuardarCambiosPedido.disabled = true;
	btnGuardarCambiosPedido.textContent = 'Guardando...';
	mostrarMensajeAccion('', '');

	try {
		await actualizarPedido(
			pedidoSeleccionado.id_pedido,
			nuevoRepartidor,
			nuevoEstatus
		);

		await cargarPedidos();

		const pedidoActualizado = pedidosOriginales.find(
			(item) => String(item.id_pedido) === String(pedidoSeleccionado.id_pedido)
		);

		if (pedidoActualizado) {
			abrirModalPedido(pedidoActualizado);
		}

		mostrarMensajeAccion('success', 'Pedido actualizado correctamente.');
	} catch (error) {
		console.error(error);
		mostrarMensajeAccion('error', error.message || 'No se pudo guardar el pedido.');
	} finally {
		btnGuardarCambiosPedido.disabled = false;
		btnGuardarCambiosPedido.textContent = 'Guardar cambios';
	}
});

buscarPedido.addEventListener('input', aplicarFiltros);
filtroEstatus.addEventListener('change', aplicarFiltros);
filtroRepartidor.addEventListener('change', aplicarFiltros);

btnCerrarModal.addEventListener('click', cerrarModalPedido);
modalBackdrop.addEventListener('click', cerrarModalPedido);

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !modalPedido.classList.contains('hidden')) {
		cerrarModalPedido();
	}
});

async function inicializarPantalla() {
	try {
		await Promise.all([
			cargarEstatus(),
			cargarRepartidores()
		]);

		await cargarPedidos();
	} catch (error) {
		console.error('Error al inicializar pedidos:', error);
	}
}

inicializarPantalla();