const nombreUsuario = document.getElementById('nombreUsuario');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

const fechaInicio = document.getElementById('fechaInicio');
const fechaFin = document.getElementById('fechaFin');
const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
const mensajeReporte = document.getElementById('mensajeReporte');

const statIngresos = document.getElementById('statIngresos');
const statPedidos = document.getElementById('statPedidos');
const statCompletados = document.getElementById('statCompletados');
const statProductosVendidos = document.getElementById('statProductosVendidos');
const statTicketPromedio = document.getElementById('statTicketPromedio');
const statCancelados = document.getElementById('statCancelados');

const listaEstatus = document.getElementById('listaEstatus');
const listaIngresosPorDia = document.getElementById('listaIngresosPorDia');
const listaTopProductos = document.getElementById('listaTopProductos');
const listaTopClientes = document.getElementById('listaTopClientes');
const tablaPedidosRecientes = document.getElementById('tablaPedidosRecientes');
const resumenPedidosRecientes = document.getElementById('resumenPedidosRecientes');

const leyendaCategorias = document.getElementById('leyendaCategorias');
const categoriaLider = document.getElementById('categoriaLider');
const ingresoCategoriaLider = document.getElementById('ingresoCategoriaLider');
const productoLider = document.getElementById('productoLider');
const clienteLider = document.getElementById('clienteLider');

const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebarContainer');
const mobileOverlay = document.getElementById('mobileOverlay');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let pedidosOriginales = [];
let graficoCategorias = null;

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

renderizarSidebar('reportes');

if (nombreUsuario) {
	nombreUsuario.textContent = usuario.nombre_completo ?? 'Administrador';
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

function mostrarMensaje(tipo, texto) {
	mensajeReporte.className = 'message';
	mensajeReporte.textContent = '';

	if (tipo) {
		mensajeReporte.classList.add(tipo);
		mensajeReporte.textContent = texto;
	}
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

function formatearFechaSoloDia(fecha) {
	if (!fecha) {
		return '';
	}

	return new Date(fecha).toLocaleDateString('es-MX', {
		year: 'numeric',
		month: 'short',
		day: '2-digit'
	});
}

function normalizarTexto(texto) {
	return String(texto ?? '').trim().toLowerCase();
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

function obtenerTipoCliente(pedido) {
	return esPedidoInvitado(pedido) ? 'Invitado' : 'Registrado';
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

function esPedidoCanceladoORechazado(descripcionEstatus) {
	const estatus = normalizarTexto(descripcionEstatus);
	return estatus === 'cancelado' || estatus === 'rechazado';
}

function obtenerFechaInput(fecha) {
	const year = fecha.getFullYear();
	const month = String(fecha.getMonth() + 1).padStart(2, '0');
	const day = String(fecha.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function asignarRangoInicial() {
	const hoy = new Date();
	const hace30Dias = new Date();
	hace30Dias.setDate(hoy.getDate() - 29);

	fechaInicio.value = obtenerFechaInput(hace30Dias);
	fechaFin.value = obtenerFechaInput(hoy);
}

function obtenerFechaInicioRango() {
	if (!fechaInicio.value) {
		return null;
	}

	return new Date(`${fechaInicio.value}T00:00:00`);
}

function obtenerFechaFinRango() {
	if (!fechaFin.value) {
		return null;
	}

	return new Date(`${fechaFin.value}T23:59:59`);
}

function filtrarPedidosPorFecha(pedidos) {
	const inicio = obtenerFechaInicioRango();
	const fin = obtenerFechaFinRango();

	return pedidos.filter((pedido) => {
		const fechaPedido = new Date(pedido.fecha_pedido);

		if (inicio && fechaPedido < inicio) {
			return false;
		}

		if (fin && fechaPedido > fin) {
			return false;
		}

		return true;
	});
}

function renderizarTarjetas(pedidos) {
	const ingresos = pedidos.reduce((acumulado, pedido) => {
		return acumulado + Number(pedido.total_pagar ?? 0);
	}, 0);

	const completados = pedidos.filter((pedido) => {
		return esPedidoFinalizado(pedido.estatus?.descripcion);
	}).length;

	const cancelados = pedidos.filter((pedido) => {
		return esPedidoCanceladoORechazado(pedido.estatus?.descripcion);
	}).length;

	const productosVendidos = pedidos.reduce((acumulado, pedido) => {
		const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];

		return acumulado + detalles.reduce((suma, detalle) => {
			return suma + Number(detalle.cantidad ?? 0);
		}, 0);
	}, 0);

	const ticketPromedio = pedidos.length > 0 ? ingresos / pedidos.length : 0;

	statIngresos.textContent = formatearMoneda(ingresos);
	statPedidos.textContent = String(pedidos.length);
	statCompletados.textContent = String(completados);
	statProductosVendidos.textContent = String(productosVendidos);
	statTicketPromedio.textContent = formatearMoneda(ticketPromedio);
	statCancelados.textContent = String(cancelados);
}

function renderizarBarrasEstatus(pedidos) {
	if (!pedidos.length) {
		listaEstatus.innerHTML = '<div class="empty-state">No hay datos para mostrar.</div>';
		return;
	}

	const contador = {};

	pedidos.forEach((pedido) => {
		const nombre = pedido.estatus?.descripcion ?? 'Sin estatus';
		contador[nombre] = (contador[nombre] ?? 0) + 1;
	});

	const datos = Object.entries(contador)
		.map(([nombre, cantidad]) => ({ nombre, cantidad }))
		.sort((a, b) => b.cantidad - a.cantidad);

	const maximo = Math.max(...datos.map((item) => item.cantidad), 1);

	listaEstatus.innerHTML = datos.map((item) => {
		const porcentaje = (item.cantidad / maximo) * 100;

		return `
			<div class="bar-item">
				<div class="bar-item-header">
					<span class="bar-item-title">${item.nombre}</span>
					<span class="bar-item-value">${item.cantidad}</span>
				</div>
				<div class="bar-track">
					<div class="bar-fill" style="width: ${porcentaje}%"></div>
				</div>
			</div>
		`;
	}).join('');
}

function renderizarIngresosPorDia(pedidos) {
	if (!pedidos.length) {
		listaIngresosPorDia.innerHTML = '<div class="empty-state">No hay datos para mostrar.</div>';
		return;
	}

	const mapa = {};

	pedidos.forEach((pedido) => {
		const fecha = formatearFechaSoloDia(pedido.fecha_pedido);
		mapa[fecha] = (mapa[fecha] ?? 0) + Number(pedido.total_pagar ?? 0);
	});

	const datos = Object.entries(mapa)
		.map(([fecha, total]) => ({ fecha, total }))
		.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
		.slice(-10);

	const maximo = Math.max(...datos.map((item) => item.total), 1);

	listaIngresosPorDia.innerHTML = datos.map((item) => {
		const porcentaje = (item.total / maximo) * 100;

		return `
			<div class="bar-item">
				<div class="bar-item-header">
					<span class="bar-item-title">${item.fecha}</span>
					<span class="bar-item-value">${formatearMoneda(item.total)}</span>
				</div>
				<div class="bar-track">
					<div class="bar-fill" style="width: ${porcentaje}%"></div>
				</div>
			</div>
		`;
	}).join('');
}

function obtenerTopProductos(pedidos) {
	const mapa = {};

	pedidos.forEach((pedido) => {
		const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];

		detalles.forEach((detalle) => {
			const nombre = detalle.producto?.nombre_producto ?? 'Producto no disponible';

			if (!mapa[nombre]) {
				mapa[nombre] = {
					nombre,
					cantidad: 0,
					ingreso: 0
				};
			}

			mapa[nombre].cantidad += Number(detalle.cantidad ?? 0);
			mapa[nombre].ingreso += Number(detalle.subtotal ?? 0);
		});
	});

	return Object.values(mapa)
		.sort((a, b) => b.cantidad - a.cantidad)
		.slice(0, 5);
}

function renderizarTopProductos(pedidos) {
	const top = obtenerTopProductos(pedidos);

	if (!top.length) {
		listaTopProductos.innerHTML = '<div class="empty-state">No hay productos vendidos en el rango seleccionado.</div>';
		productoLider.textContent = '-';
		return;
	}

	listaTopProductos.innerHTML = top.map((item, index) => {
		return `
			<div class="rank-item">
				<div class="rank-left">
					<div class="rank-number">${index + 1}</div>
					<div class="rank-info">
						<div class="rank-title">${item.nombre}</div>
						<div class="rank-subtitle">Ingreso generado: ${formatearMoneda(item.ingreso)}</div>
					</div>
				</div>

				<div class="rank-value">${item.cantidad} vend.</div>
			</div>
		`;
	}).join('');

	productoLider.textContent = top[0].nombre;
}

function obtenerTopClientes(pedidos) {
	const mapa = {};

	pedidos.forEach((pedido) => {
		const llaveCliente = esPedidoInvitado(pedido)
			? `invitado_${pedido.id_invitado ?? pedido.invitado?.id_invitado ?? 'sin_id'}`
			: `cliente_${pedido.id_cliente ?? pedido.cliente?.id_usuario ?? 'sin_id'}`;

		const nombre = obtenerNombreCliente(pedido);
		const tipoCliente = obtenerTipoCliente(pedido);

		if (!mapa[llaveCliente]) {
			mapa[llaveCliente] = {
				nombre,
				tipoCliente,
				cantidadPedidos: 0,
				totalGastado: 0
			};
		}

		mapa[llaveCliente].cantidadPedidos += 1;
		mapa[llaveCliente].totalGastado += Number(pedido.total_pagar ?? 0);
	});

	return Object.values(mapa)
		.sort((a, b) => b.cantidadPedidos - a.cantidadPedidos || b.totalGastado - a.totalGastado)
		.slice(0, 5);
}

function renderizarTopClientes(pedidos) {
	const top = obtenerTopClientes(pedidos);

	if (!top.length) {
		listaTopClientes.innerHTML = '<div class="empty-state">No hay clientes para mostrar en este rango.</div>';
		clienteLider.textContent = '-';
		return;
	}

	listaTopClientes.innerHTML = top.map((item, index) => {
		return `
			<div class="rank-item">
				<div class="rank-left">
					<div class="rank-number">${index + 1}</div>
					<div class="rank-info">
						<div class="rank-title">${item.nombre}</div>
						<div class="rank-subtitle">
							${item.tipoCliente} · Total comprado: ${formatearMoneda(item.totalGastado)}
						</div>
					</div>
				</div>

				<div class="rank-value">${item.cantidadPedidos} pedido(s)</div>
			</div>
		`;
	}).join('');

	clienteLider.textContent = top[0].nombre;
}

function renderizarPedidosRecientes(pedidos) {
	if (!pedidos.length) {
		tablaPedidosRecientes.innerHTML = `
			<tr>
				<td colspan="5" class="empty-row">No hay pedidos en el rango seleccionado.</td>
			</tr>
		`;
		resumenPedidosRecientes.textContent = 'No hay actividad en el periodo seleccionado.';
		return;
	}

	const recientes = [...pedidos]
		.sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
		.slice(0, 10);

	tablaPedidosRecientes.innerHTML = recientes.map((pedido) => {
		const estatus = pedido.estatus?.descripcion ?? 'Sin estatus';
		const nombreCliente = obtenerNombreCliente(pedido);
		const tipoCliente = obtenerTipoCliente(pedido);

		return `
			<tr>
				<td data-label="Pedido">#${pedido.id_pedido}</td>
				<td data-label="Cliente">${nombreCliente} (${tipoCliente})</td>
				<td data-label="Fecha">${formatearFecha(pedido.fecha_pedido)}</td>
				<td data-label="Estatus">
					<span class="${obtenerClaseBadgeEstatus(estatus)}">${estatus}</span>
				</td>
				<td data-label="Total">${formatearMoneda(pedido.total_pagar)}</td>
			</tr>
		`;
	}).join('');

	resumenPedidosRecientes.textContent = `Mostrando los ${recientes.length} pedidos más recientes del periodo filtrado.`;
}

function obtenerVentasPorCategoria(pedidos) {
	const mapa = {};

	pedidos.forEach((pedido) => {
		const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];

		detalles.forEach((detalle) => {
			const nombreCategoria =
				detalle.producto?.categoria?.nombre_categoria ?? 'Sin categoría';

			if (!mapa[nombreCategoria]) {
				mapa[nombreCategoria] = {
					nombre: nombreCategoria,
					total: 0
				};
			}

			mapa[nombreCategoria].total += Number(detalle.subtotal ?? 0);
		});
	});

	return Object.values(mapa).sort((a, b) => b.total - a.total);
}

function obtenerColoresGrafico(cantidad) {
	const base = [
		'#d96c8a',
		'#f7c59f',
		'#8b5e3c',
		'#b14f6b',
		'#ffd6dc',
		'#f59f00',
		'#3b82f6',
		'#2f9e44',
		'#7c3aed',
		'#d9485f'
	];

	const colores = [];

	for (let i = 0; i < cantidad; i += 1) {
		colores.push(base[i % base.length]);
	}

	return colores;
}

function destruirGraficoCategorias() {
	if (graficoCategorias) {
		graficoCategorias.destroy();
		graficoCategorias = null;
	}
}

function renderizarGraficoCategorias(pedidos) {
	const datos = obtenerVentasPorCategoria(pedidos);

	if (!datos.length) {
		destruirGraficoCategorias();
		leyendaCategorias.innerHTML = '<div class="empty-state">No hay ventas por categoría en el rango seleccionado.</div>';
		categoriaLider.textContent = '-';
		ingresoCategoriaLider.textContent = '$0.00';
		return;
	}

	const canvas = document.getElementById('graficoCategorias');
	const ctx = canvas.getContext('2d');

	const labels = datos.map((item) => item.nombre);
	const valores = datos.map((item) => Number(item.total ?? 0));
	const colores = obtenerColoresGrafico(datos.length);
	const totalGeneral = valores.reduce((acumulado, item) => acumulado + item, 0);

	destruirGraficoCategorias();

	graficoCategorias = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels,
			datasets: [
				{
					data: valores,
					backgroundColor: colores,
					borderColor: '#ffffff',
					borderWidth: 3,
					hoverOffset: 10
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			cutout: '62%',
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					callbacks: {
						label(context) {
							const valor = Number(context.raw ?? 0);
							const porcentaje = totalGeneral > 0
								? ((valor / totalGeneral) * 100).toFixed(1)
								: '0.0';

							return `${context.label}: ${formatearMoneda(valor)} (${porcentaje}%)`;
						}
					}
				}
			}
		}
	});

	leyendaCategorias.innerHTML = datos.map((item, index) => {
		const porcentaje = totalGeneral > 0
			? ((item.total / totalGeneral) * 100).toFixed(1)
			: '0.0';

		return `
			<div class="legend-item">
				<div class="legend-left">
					<span class="legend-color" style="background:${colores[index]}"></span>

					<div class="legend-texts">
						<div class="legend-title">${item.nombre}</div>
						<div class="legend-subtitle">${porcentaje}% del total</div>
					</div>
				</div>

				<div class="legend-value">${formatearMoneda(item.total)}</div>
			</div>
		`;
	}).join('');

	categoriaLider.textContent = datos[0].nombre;
	ingresoCategoriaLider.textContent = formatearMoneda(datos[0].total);
}

function renderizarReporte() {
	const pedidosFiltrados = filtrarPedidosPorFecha(pedidosOriginales);

	renderizarTarjetas(pedidosFiltrados);
	renderizarBarrasEstatus(pedidosFiltrados);
	renderizarIngresosPorDia(pedidosFiltrados);
	renderizarGraficoCategorias(pedidosFiltrados);
	renderizarTopProductos(pedidosFiltrados);
	renderizarTopClientes(pedidosFiltrados);
	renderizarPedidosRecientes(pedidosFiltrados);
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
			total_pagar,
			id_estatus,
			cliente:usuario!pedido_id_cliente_fkey (
				id_usuario,
				nombre_completo,
				correo
			),
			invitado:invitado!pedido_id_invitado_fkey (
				id_invitado,
				nombre_invitado,
				correo_contacto,
				telefono_contacto,
				direccion_contacto
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
					precio_unitario,
					categoria:categoria (
						id_categoria,
						nombre_categoria
					)
				)
			)
		`)
		.order('fecha_pedido', { ascending: false });

	if (error) {
		console.error('Error al cargar pedidos para reportes:', error);
		mostrarMensaje('error', 'No se pudo cargar la información de reportes.');
		return;
	}

	pedidosOriginales = data ?? [];
	renderizarReporte();
}

btnAplicarFiltros.addEventListener('click', () => {
	const inicio = obtenerFechaInicioRango();
	const fin = obtenerFechaFinRango();

	if (inicio && fin && inicio > fin) {
		mostrarMensaje('error', 'La fecha de inicio no puede ser mayor que la fecha final.');
		return;
	}

	mostrarMensaje('', '');
	renderizarReporte();
});

btnLimpiarFiltros.addEventListener('click', () => {
	asignarRangoInicial();
	mostrarMensaje('', '');
	renderizarReporte();
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && sidebar.classList.contains('sidebar-open')) {
		cerrarMenuMovil();
	}
});

async function inicializarPantalla() {
	try {
		asignarRangoInicial();
		await cargarPedidos();
		vincularCierreMenuEnSidebar();
	} catch (error) {
		console.error('Error al inicializar reportes:', error);
		mostrarMensaje('error', 'Ocurrió un error al inicializar la pantalla de reportes.');
	}
}

inicializarPantalla();