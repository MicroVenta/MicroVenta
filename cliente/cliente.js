const nombreCliente = document.getElementById('nombreCliente');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionSidebar = document.getElementById('btnCerrarSesionSidebar');
const heroTitle = document.getElementById('heroTitle');
const heroText = document.getElementById('heroText');
const revealCards = document.querySelectorAll('.reveal-card');

const totalPedidos = document.getElementById('totalPedidos');
const pedidosProceso = document.getElementById('pedidosProceso');
const productoFavorito = document.getElementById('productoFavorito');
const promoActiva = document.getElementById('promoActiva');
const ultimoPedidoTitulo = document.getElementById('ultimoPedidoTitulo');
const ultimoPedidoTexto = document.getElementById('ultimoPedidoTexto');
const estadoPedido = document.getElementById('estadoPedido');
const listaPedidos = document.getElementById('listaPedidos');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;

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

if (usuario) {
	if (usuario.nombre_rol !== 'cliente') {
		window.location.href = '/login/login.html';
	} else if (nombreCliente) {
		nombreCliente.textContent = usuario.nombre_completo;
	}
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

function animarTextoPorPalabras(elemento, delayBase = 0, paso = 0.12) {
	if (!elemento) {
		return;
	}

	const textoOriginal = elemento.textContent.trim();

	if (!textoOriginal) {
		return;
	}

	const palabras = textoOriginal.split(' ');
	elemento.innerHTML = '';

	palabras.forEach((palabra, index) => {
		const spanPalabra = document.createElement('span');
		spanPalabra.className = 'word';
		spanPalabra.textContent = palabra;
		spanPalabra.style.animationDelay = `${delayBase + (index * paso)}s`;

		elemento.appendChild(spanPalabra);

		if (index < palabras.length - 1) {
			elemento.appendChild(document.createTextNode(' '));
		}
	});
}

function animarTarjetas() {
	revealCards.forEach((card, index) => {
		setTimeout(() => {
			card.classList.add('show');
		}, 250 + (index * 110));
	});
}

function formatearFecha(fecha) {
	const fechaObj = new Date(fecha);

	return fechaObj.toLocaleDateString('es-MX', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
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

function obtenerProductosPedido(detalles) {
	if (!detalles || detalles.length === 0) {
		return [];
	}

	return detalles.map((detalle) => {
		const nombreProducto = detalle.producto?.nombre_producto ?? 'Producto';
		return `${nombreProducto} x${detalle.cantidad}`;
	});
}

function contarPedidosEnProceso(pedidos) {
	const estatusFinales = ['entregado', 'completado', 'cancelado', 'rechazado'];

	return pedidos.filter((pedido) => {
		const estatus = obtenerEstatusActual(pedido.historialestatus).toLowerCase();
		return !estatusFinales.includes(estatus);
	}).length;
}

function obtenerProductoMasPedido(pedidos) {
	const conteo = {};

	pedidos.forEach((pedido) => {
		if (pedido.detallepedido && pedido.detallepedido.length > 0) {
			pedido.detallepedido.forEach((detalle) => {
				const nombreProducto = detalle.producto?.nombre_producto ?? 'Producto';

				if (!conteo[nombreProducto]) {
					conteo[nombreProducto] = 0;
				}

				conteo[nombreProducto] += detalle.cantidad;
			});
		}
	});

	let favorito = 'Sin datos';
	let maximo = 0;

	for (const producto in conteo) {
		if (conteo[producto] > maximo) {
			maximo = conteo[producto];
			favorito = producto;
		}
	}

	return favorito;
}

function renderizarListaPedidos(pedidos) {
	if (!listaPedidos) {
		return;
	}

	if (!pedidos || pedidos.length === 0) {
		listaPedidos.innerHTML = `
			<div class="empty-orders">
				Aún no tienes pedidos registrados.
			</div>
		`;
		return;
	}

	listaPedidos.innerHTML = pedidos.map((pedido) => {
		const estatusActual = obtenerEstatusActual(pedido.historialestatus);
		const productos = obtenerProductosPedido(pedido.detallepedido);

		return `
			<article class="order-item">
				<div class="order-item-top">
					<h4>Pedido #${pedido.id_pedido}</h4>
					<div class="order-badge">${estatusActual}</div>
				</div>

				<div class="order-meta">
					<p><strong>Fecha:</strong> ${formatearFecha(pedido.fecha_pedido)}</p>
					<p><strong>Total:</strong> $${Number(pedido.total_pagar).toFixed(2)}</p>
				</div>

				${
					productos.length > 0
						? `
							<ul class="order-products">
								${productos.map((producto) => `<li>${producto}</li>`).join('')}
							</ul>
						`
						: ''
				}
			</article>
		`;
	}).join('');
}

function cargarResumenVisual(pedidos) {
	if (totalPedidos) {
		totalPedidos.textContent = pedidos.length.toString();
	}

	if (pedidosProceso) {
		pedidosProceso.textContent = contarPedidosEnProceso(pedidos).toString();
	}

	if (productoFavorito) {
		productoFavorito.textContent = obtenerProductoMasPedido(pedidos);
	}

	if (promoActiva) {
		promoActiva.textContent = '10% OFF';
	}

	if (pedidos.length > 0) {
		const ultimoPedido = [...pedidos].sort((a, b) =>
			new Date(b.fecha_pedido) - new Date(a.fecha_pedido)
		)[0];

		const estatusActual = obtenerEstatusActual(ultimoPedido.historialestatus);

		if (ultimoPedidoTitulo) {
			ultimoPedidoTitulo.textContent = `Pedido #${ultimoPedido.id_pedido}`;
		}

		if (ultimoPedidoTexto) {
			ultimoPedidoTexto.textContent =
				`Tu pedido fue registrado el ${formatearFecha(ultimoPedido.fecha_pedido)} por un total de $${Number(ultimoPedido.total_pagar).toFixed(2)}.`;
		}

		if (estadoPedido) {
			estadoPedido.textContent = estatusActual;
		}
	} else {
		if (ultimoPedidoTitulo) {
			ultimoPedidoTitulo.textContent = 'Aún no tienes pedidos';
		}

		if (ultimoPedidoTexto) {
			ultimoPedidoTexto.textContent = 'Cuando realices tu primera compra, aparecerá aquí.';
		}

		if (estadoPedido) {
			estadoPedido.textContent = 'Sin pedidos';
		}
	}
}

async function cargarPedidosCliente() {
	if (!usuario || !usuario.id_usuario) {
		return;
	}

	try {
		const { data, error } = await db
			.from('pedido')
			.select(`
				id_pedido,
				fecha_pedido,
				total_pagar,
				detallepedido (
					id_detalle,
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

			if (listaPedidos) {
				listaPedidos.innerHTML = `
					<div class="empty-orders">
						No se pudieron cargar tus pedidos.
					</div>
				`;
			}

			if (totalPedidos) {
				totalPedidos.textContent = '0';
			}

			if (pedidosProceso) {
				pedidosProceso.textContent = '0';
			}

			if (productoFavorito) {
				productoFavorito.textContent = 'Sin datos';
			}

			return;
		}

		const pedidos = data ?? [];

		cargarResumenVisual(pedidos);
		renderizarListaPedidos(pedidos);

	} catch (err) {
		console.error('Error general al cargar pedidos:', err);

		if (listaPedidos) {
			listaPedidos.innerHTML = `
				<div class="empty-orders">
					Ocurrió un error al consultar la información.
				</div>
			`;
		}
	}
}

animarTextoPorPalabras(heroTitle, 0, 0.10);
animarTextoPorPalabras(heroText, 0.65, 0.05);
animarTarjetas();
cargarPedidosCliente();