const nombreRepartidor = document.getElementById('nombreRepartidor');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const heroTitle = document.getElementById('heroTitle');
const heroText = document.getElementById('heroText');
const revealCards = document.querySelectorAll('.reveal-card');

const totalAsignados = document.getElementById('totalAsignados');
const pedidosRuta = document.getElementById('pedidosRuta');
const pedidosEntregados = document.getElementById('pedidosEntregados');
const pedidosPendientes = document.getElementById('pedidosPendientes');
const misCompras = document.getElementById('misCompras');

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

function esRepartidor(usuarioActual) {
	if (!usuarioActual) {
		return false;
	}

	const nombreRol = (usuarioActual.nombre_rol || '').toString().trim().toLowerCase();
	const idRol = Number(usuarioActual.id_rol);

	return nombreRol === 'repartidor' || idRol === 3;
}

if (usuario) {
	if (!esRepartidor(usuario)) {
		window.location.href = '/login/login.html';
	} else if (nombreRepartidor) {
		nombreRepartidor.textContent = usuario.nombre_completo || 'Repartidor';
	}
}

renderizarSidebar('inicio');

function cerrarSesion() {
	sessionStorage.removeItem('microventa_usuario');
	localStorage.removeItem('microventa_usuario');
	window.location.href = '/login/login.html';
}

if (btnCerrarSesion) {
	btnCerrarSesion.addEventListener('click', cerrarSesion);
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
	return estatus === 'enviando' || estatus === 'en camino';
}

function esEstatusPendiente(pedido) {
	const estatus = estatusNormalizado(pedido);

	const estatusNoPendientes = [
		'entregado',
		'completado',
		'cancelado',
		'rechazado'
	];

	return !estatusNoPendientes.includes(estatus) && !esEstatusEnRuta(pedido);
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

function renderizarListaPedidos(pedidos) {
	if (!listaPedidos) {
		return;
	}

	if (!pedidos || pedidos.length === 0) {
		listaPedidos.innerHTML = `
			<div class="empty-orders">
				Aún no tienes pedidos asignados.
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

		return `
			<article class="order-item">
				<div class="order-item-top">
					<h4>Pedido #${pedido.id_pedido}</h4>
					<div class="order-badge">${estatusActual}</div>
				</div>

				<div class="order-meta">
					<p><strong>Cliente:</strong> ${cliente}</p>
					<p><strong>Fecha:</strong> ${formatearFecha(pedido.fecha_pedido)}</p>
					<p><strong>Dirección:</strong> ${direccion}</p>
					<p><strong>Teléfono:</strong> ${telefono}</p>
					<p><strong>Total:</strong> $${Number(pedido.total_pagar || 0).toFixed(2)}</p>
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

function cargarResumenVisual(pedidos, comprasUsuario = []) {
	if (totalAsignados) {
		totalAsignados.textContent = pedidos.length.toString();
	}

	if (pedidosRuta) {
		pedidosRuta.textContent = pedidos.filter(esEstatusEnRuta).length.toString();
	}

	if (pedidosEntregados) {
		pedidosEntregados.textContent = pedidos.filter(esEstatusEntregado).length.toString();
	}

	if (pedidosPendientes) {
		pedidosPendientes.textContent = pedidos.filter(esEstatusPendiente).length.toString();
	}

	if (misCompras) {
		misCompras.textContent = comprasUsuario.length.toString();
	}

	if (pedidos.length > 0) {
		const ultimoPedido = [...pedidos].sort((a, b) =>
			new Date(b.fecha_pedido) - new Date(a.fecha_pedido)
		)[0];

		const cliente = ultimoPedido.cliente?.nombre_completo ?? 'Cliente';
		const direccion = ultimoPedido.lugar_entrega ?? 'Lugar de entrega no registrado';
		const estatusActual = obtenerDescripcionEstatus(ultimoPedido);

		if (ultimoPedidoTitulo) {
			ultimoPedidoTitulo.textContent = `Pedido #${ultimoPedido.id_pedido} • ${cliente}`;
		}

		if (ultimoPedidoTexto) {
			ultimoPedidoTexto.textContent =
				`Entrega registrada el ${formatearFecha(ultimoPedido.fecha_pedido)} con destino en ${direccion}. Total del pedido: $${Number(ultimoPedido.total_pagar || 0).toFixed(2)}.`;
		}

		if (estadoPedido) {
			estadoPedido.textContent = estatusActual;
		}
	} else {
		if (ultimoPedidoTitulo) {
			ultimoPedidoTitulo.textContent = 'Aún no tienes pedidos asignados';
		}

		if (ultimoPedidoTexto) {
			ultimoPedidoTexto.textContent = 'Cuando se te asigne un pedido, aparecerá aquí con su información principal.';
		}

		if (estadoPedido) {
			estadoPedido.textContent = 'Sin pedidos';
		}
	}
}

async function cargarMisComprasUsuario() {
	if (!usuario || !usuario.id_usuario) {
		return [];
	}

	try {
		const { data, error } = await db
			.from('pedido')
			.select('id_pedido')
			.eq('id_cliente', usuario.id_usuario);

		if (error) {
			console.error('Error al cargar compras del usuario:', error);
			return [];
		}

		return data ?? [];
	} catch (err) {
		console.error('Error general al cargar compras del usuario:', err);
		return [];
	}
}

async function cargarPedidosRepartidor() {
	if (!usuario || !usuario.id_usuario) {
		return;
	}

	try {
		const [respuestaPedidos, comprasUsuario] = await Promise.all([
			db
				.from('pedido')
				.select(`
					id_pedido,
					fecha_pedido,
					total_pagar,
					id_estatus,
					lugar_entrega,
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
				.order('fecha_pedido', { ascending: false }),
			cargarMisComprasUsuario()
		]);

		const { data, error } = respuestaPedidos;

		if (error) {
			console.error('Error al cargar pedidos del repartidor:', error);

			if (listaPedidos) {
				listaPedidos.innerHTML = `
					<div class="empty-orders">
						No se pudieron cargar tus pedidos asignados.
					</div>
				`;
			}

			if (totalAsignados) {
				totalAsignados.textContent = '0';
			}

			if (pedidosRuta) {
				pedidosRuta.textContent = '0';
			}

			if (pedidosEntregados) {
				pedidosEntregados.textContent = '0';
			}

			if (pedidosPendientes) {
				pedidosPendientes.textContent = '0';
			}

			if (misCompras) {
				misCompras.textContent = comprasUsuario.length.toString();
			}

			return;
		}

		const pedidos = data ?? [];

		cargarResumenVisual(pedidos, comprasUsuario);
		renderizarListaPedidos(pedidos);
	} catch (err) {
		console.error('Error general al cargar pedidos del repartidor:', err);

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
cargarPedidosRepartidor();