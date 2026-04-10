const nombreUsuario = document.getElementById('nombreUsuario');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

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
const detalleTipoCliente = document.getElementById('detalleTipoCliente');
const detalleCorreo = document.getElementById('detalleCorreo');
const detalleTelefono = document.getElementById('detalleTelefono');
const detalleFecha = document.getElementById('detalleFecha');
const detalleFechaEntrega = document.getElementById('detalleFechaEntrega');
const detalleTipoPedido = document.getElementById('detalleTipoPedido');
const detalleLugarEntrega = document.getElementById('detalleLugarEntrega');
const detalleTotal = document.getElementById('detalleTotal');
const detalleRepartidor = document.getElementById('detalleRepartidor');
const detalleEstatus = document.getElementById('detalleEstatus');
const detalleProductos = document.getElementById('detalleProductos');
const detalleHistorial = document.getElementById('detalleHistorial');

const selectRepartidorModal = document.getElementById('selectRepartidorModal');
const selectEstatusModal = document.getElementById('selectEstatusModal');
const inputFechaEntregaModal = document.getElementById('inputFechaEntregaModal');
const grupoFechaEntrega = document.getElementById('grupoFechaEntrega');

const btnGuardarCambiosPedido = document.getElementById('btnGuardarCambiosPedido');
const mensajeAccion = document.getElementById('mensajeAccion');

const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebarContainer');
const mobileOverlay = document.getElementById('mobileOverlay');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let pedidosOriginales = [];
let repartidoresOriginales = [];
let estatusOriginales = [];
let pedidoSeleccionado = null;

function normalizarTexto(texto) {
	return String(texto ?? '').trim().toLowerCase();
}

function esAdministradorOAyudante(usuarioData) {
	if (!usuarioData) {
		return false;
	}

	const idRol = Number(usuarioData.id_rol);
	const nombreRol = normalizarTexto(usuarioData.nombre_rol);

	return idRol === 1 || idRol === 2 || nombreRol === 'administrador' || nombreRol === 'ayudante';
}

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

if (!esAdministradorOAyudante(usuario)) {
	window.location.href = '/login/login.html';
}

renderizarSidebar('pedidos');

if (nombreUsuario) {
	nombreUsuario.textContent = usuario.nombre_completo ?? 'Usuario';
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
});

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

function convertirFechaLocalParaBD(valorFecha) {
	if (!valorFecha) {
		return null;
	}

	return new Date(valorFecha).toISOString();
}

function formatearFechaParaInput(fecha) {
	if (!fecha) {
		return '';
	}

	const fechaObj = new Date(fecha);
	const offset = fechaObj.getTimezoneOffset();
	const fechaLocal = new Date(fechaObj.getTime() - (offset * 60000));

	return fechaLocal.toISOString().slice(0, 16);
}

function mostrarMensajeAccion(tipo, texto) {
	mensajeAccion.className = 'message';
	mensajeAccion.textContent = '';

	if (tipo) {
		mensajeAccion.classList.add(tipo);
		mensajeAccion.textContent = texto;
	}
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

function obtenerCorreoCliente(pedido) {
	if (esPedidoInvitado(pedido)) {
		return pedido.invitado?.correo_contacto ?? 'Sin correo';
	}

	return pedido.cliente?.correo ?? 'Sin correo';
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

function obtenerNombreRepartidor(pedido) {
	if (esPedidoParaRecogerEnTienda(pedido)) {
		return 'No aplica';
	}

	return pedido.repartidor?.nombre_completo ?? 'Sin asignar';
}

function obtenerDescripcionEstatus(pedido) {
	return pedido.estatus?.descripcion ?? 'Sin estatus';
}

function obtenerClaseBadgeEstatus(descripcion) {
	const texto = normalizarTexto(descripcion);

	if (texto === 'pendiente') return 'badge badge-pendiente';
	if (texto === 'aceptado') return 'badge badge-aceptado';
	if (texto === 'en preparación') return 'badge badge-en-preparacion';
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

function requiereLogisticaPorEstatus(valor) {
	const texto = normalizarTexto(valor);

	if (texto === '' || texto === 'selecciona un estatus') {
		return false;
	}

	return texto !== 'rechazado' && texto !== 'cancelado' && texto !== 'pendiente';
}

function esPedidoParaRecogerEnTienda(pedido) {
	return normalizarTexto(pedido?.lugar_entrega).startsWith('pasaran a recogerlo en tienda');
}

function requiereRepartidorPedido(pedido, descripcionEstatus) {
	if (esPedidoParaRecogerEnTienda(pedido)) {
		return false;
	}

	return requiereLogisticaPorEstatus(descripcionEstatus);
}

function requiereFechaEntregaPedido(pedido, descripcionEstatus) {
	if (!requiereLogisticaPorEstatus(descripcionEstatus)) {
		return false;
	}

	return !esPedidoParaRecogerEnTienda(pedido) || Boolean(pedido?.personalizado);
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

function actualizarCamposSegunEstatus() {
	const optionSeleccionada = selectEstatusModal.options[selectEstatusModal.selectedIndex];
	const descripcionSeleccionada = optionSeleccionada
		? optionSeleccionada.textContent
		: '';

	const necesitaRepartidor = requiereRepartidorPedido(pedidoSeleccionado, descripcionSeleccionada);
	const necesitaFechaEntrega = requiereFechaEntregaPedido(pedidoSeleccionado, descripcionSeleccionada);

	selectRepartidorModal.disabled = !necesitaRepartidor;

	if (!necesitaRepartidor) {
		selectRepartidorModal.value = '';
	}

	if (!necesitaFechaEntrega) {
		inputFechaEntregaModal.value = '';
		grupoFechaEntrega.classList.add('hidden');
		inputFechaEntregaModal.disabled = true;
		return;
	}

	grupoFechaEntrega.classList.remove('hidden');
	inputFechaEntregaModal.disabled = false;
}

function renderizarPedidos(pedidos) {
	if (!pedidos.length) {
		tablaPedidosBody.innerHTML = `
			<tr>
				<td colspan="8" class="empty-row">
					No se encontraron pedidos con los filtros seleccionados.
				</td>
			</tr>
		`;
		return;
	}

	tablaPedidosBody.innerHTML = pedidos.map((pedido) => {
		const nombreCliente = obtenerNombreCliente(pedido);
		const correoCliente = obtenerCorreoCliente(pedido);
		const nombreRepartidor = obtenerNombreRepartidor(pedido);
		const nombreEstatus = obtenerDescripcionEstatus(pedido);
		const cantidadProductos = Array.isArray(pedido.detalles) ? pedido.detalles.length : 0;
		const lugarEntrega = pedido.lugar_entrega ?? 'Sin lugar registrado';
		let fechaEntrega = 'Sin definir';

		if (esPedidoParaRecogerEnTienda(pedido)) {
			fechaEntrega = pedido.fecha_entrega_aproximada
				? formatearFecha(pedido.fecha_entrega_aproximada)
				: 'Recoge en tienda';
		} else if (pedido.fecha_entrega_aproximada) {
			fechaEntrega = formatearFecha(pedido.fecha_entrega_aproximada);
		}
		const etiquetaTipoCliente = esPedidoInvitado(pedido)
			? '<div class="order-subtext">Invitado</div>'
			: '';

		return `
			<tr class="order-row" data-id="${pedido.id_pedido}" tabindex="0">
				<td data-label="Pedido">
					<div class="order-id">#${pedido.id_pedido}</div>
					<div class="order-subtext">${cantidadProductos} producto(s)</div>
					${pedido.personalizado ? '<div class="badge badge-personalizado">Personalizado</div>' : ''}
				</td>

				<td data-label="Cliente">
					<div class="order-id">${nombreCliente}</div>
					<div class="order-subtext">${correoCliente}</div>
					${etiquetaTipoCliente}
				</td>

				<td data-label="Fecha pedido">${formatearFecha(pedido.fecha_pedido)}</td>
				<td data-label="Entrega">${fechaEntrega}</td>
				<td data-label="Lugar">${lugarEntrega}</td>
				<td data-label="Total">${formatearMoneda(pedido.total_pagar)}</td>
				<td data-label="Repartidor">${nombreRepartidor}</td>

				<td data-label="Estatus">
					<span class="${obtenerClaseBadgeEstatus(nombreEstatus)}">
						${nombreEstatus}
					</span>
				</td>
			</tr>
		`;
	}).join('');

	document.querySelectorAll('.order-row').forEach((fila) => {
		fila.addEventListener('click', () => {
			const idPedido = fila.getAttribute('data-id');
			const pedido = pedidosOriginales.find(
				(item) => String(item.id_pedido) === String(idPedido)
			);

			if (pedido) {
				abrirModalPedido(pedido);
			}
		});

		fila.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();

				const idPedido = fila.getAttribute('data-id');
				const pedido = pedidosOriginales.find(
					(item) => String(item.id_pedido) === String(idPedido)
				);

				if (pedido) {
					abrirModalPedido(pedido);
				}
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
				obtenerCorreoCliente(pedido),
				obtenerTelefonoCliente(pedido),
				obtenerNombreRepartidor(pedido),
				obtenerDescripcionEstatus(pedido),
				pedido.lugar_entrega ?? '',
				pedido.fecha_entrega_aproximada ?? '',
				pedido.personalizado ? 'personalizado' : 'normal',
				esPedidoInvitado(pedido) ? 'invitado' : 'registrado'
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
		const cantidadStock = Number(detalle.cantidad_stock ?? 0);
		const cantidadPersonalizada = Number(detalle.cantidad_personalizada ?? 0);
		const esPersonalizado = Boolean(detalle.personalizado);

		return `
			<div class="product-line">
				<div class="product-line-left">
					<div class="product-line-name">${nombreProducto}</div>
					<div class="product-line-meta">
						Cantidad total: ${cantidad} · Precio unitario: ${formatearMoneda(precioUnitario)}
					</div>
					<div class="product-line-meta">
						De stock: ${cantidadStock} · Personalizadas: ${cantidadPersonalizada}
					</div>

					<div class="product-line-badges">
						${esPersonalizado ? '<span class="badge badge-personalizado">Pedido personalizado</span>' : ''}
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
	detalleTipoCliente.textContent = obtenerTipoCliente(pedido);
	detalleCorreo.textContent = obtenerCorreoCliente(pedido);
	detalleTelefono.textContent = obtenerTelefonoCliente(pedido);
	detalleFecha.textContent = formatearFecha(pedido.fecha_pedido);
	if (esPedidoParaRecogerEnTienda(pedido)) {
		detalleFechaEntrega.textContent = pedido.fecha_entrega_aproximada
			? formatearFecha(pedido.fecha_entrega_aproximada)
			: 'Recoge en tienda';
	} else {
		detalleFechaEntrega.textContent = pedido.fecha_entrega_aproximada
			? formatearFecha(pedido.fecha_entrega_aproximada)
			: 'Sin definir';
	}
	detalleTipoPedido.innerHTML = pedido.personalizado
		? '<span class="badge badge-personalizado">Pedido personalizado</span>'
		: '<span class="badge badge-entregado">Pedido normal</span>';
	detalleLugarEntrega.textContent = pedido.lugar_entrega ?? 'Sin lugar registrado';
	detalleTotal.textContent = formatearMoneda(pedido.total_pagar);
	detalleRepartidor.textContent = obtenerNombreRepartidor(pedido);
	detalleEstatus.innerHTML = `
		<span class="${obtenerClaseBadgeEstatus(obtenerDescripcionEstatus(pedido))}">
			${obtenerDescripcionEstatus(pedido)}
		</span>
	`;

	selectRepartidorModal.value = pedido.id_repartidor ? String(pedido.id_repartidor) : '';
	selectEstatusModal.value = pedido.id_estatus ? String(pedido.id_estatus) : '';
	inputFechaEntregaModal.value = formatearFechaParaInput(pedido.fecha_entrega_aproximada);

	renderizarProductosDetalle(pedido);
	renderizarHistorial(pedido);
	actualizarCamposSegunEstatus();

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
			id_invitado,
			id_repartidor,
			fecha_pedido,
			fecha_entrega_aproximada,
			lugar_entrega,
			total_pagar,
			id_estatus,
			personalizado,
			cliente:usuario!pedido_id_cliente_fkey (
				id_usuario,
				nombre_completo,
				correo,
				telefono
			),
			invitado:invitado!pedido_id_invitado_fkey (
				id_invitado,
				nombre_invitado,
				correo_contacto,
				telefono_contacto,
				direccion_contacto
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
				cantidad_stock,
				cantidad_personalizada,
				personalizado,
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
				<td colspan="8" class="empty-row">
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

async function actualizarPedido(idPedido, datosActualizar) {
	const { error } = await db
		.from('pedido')
		.update(datosActualizar)
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

	const nuevoEstatus = selectEstatusModal.value;
	const nuevaDescripcionEstatus = selectEstatusModal.options[selectEstatusModal.selectedIndex]
		? selectEstatusModal.options[selectEstatusModal.selectedIndex].textContent
		: '';
	const nuevoRepartidor = selectRepartidorModal.value;
	const nuevaFechaEntrega = inputFechaEntregaModal.value;

	if (nuevoEstatus === '') {
		mostrarMensajeAccion('error', 'Selecciona un estatus.');
		return;
	}

	const requiereRepartidor = requiereRepartidorPedido(pedidoSeleccionado, nuevaDescripcionEstatus);
	const requiereFechaEntrega = requiereFechaEntregaPedido(pedidoSeleccionado, nuevaDescripcionEstatus);

	if (requiereRepartidor) {
		if (nuevoRepartidor === '') {
			mostrarMensajeAccion('error', 'Debes asignar un repartidor para ese estatus.');
			return;
		}
	}

	if (requiereFechaEntrega) {
		if (nuevaFechaEntrega === '') {
			mostrarMensajeAccion('error', 'Debes indicar la fecha y hora de entrega.');
			return;
		}
	}

	const sinCambios =
		String(pedidoSeleccionado.id_repartidor ?? '') === String(requiereRepartidor ? nuevoRepartidor : '') &&
		String(pedidoSeleccionado.id_estatus ?? '') === String(nuevoEstatus) &&
		String(formatearFechaParaInput(pedidoSeleccionado.fecha_entrega_aproximada) ?? '') === String(requiereFechaEntrega ? nuevaFechaEntrega : '');

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
			{
				id_estatus: Number(nuevoEstatus),
				id_repartidor: requiereRepartidor ? Number(nuevoRepartidor) : null,
				fecha_entrega_aproximada: requiereFechaEntrega ? convertirFechaLocalParaBD(nuevaFechaEntrega) : null
			}
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

selectEstatusModal.addEventListener('change', actualizarCamposSegunEstatus);

btnCerrarModal.addEventListener('click', cerrarModalPedido);
modalBackdrop.addEventListener('click', cerrarModalPedido);

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !modalPedido.classList.contains('hidden')) {
		cerrarModalPedido();
	}

	if (event.key === 'Escape' && sidebar.classList.contains('sidebar-open')) {
		cerrarMenuMovil();
	}
});

async function inicializarPantalla() {
	try {
		await Promise.all([
			cargarEstatus(),
			cargarRepartidores()
		]);

		await cargarPedidos();
		vincularCierreMenuEnSidebar();
	} catch (error) {
		console.error('Error al inicializar pedidos:', error);
	}
}

inicializarPantalla();
