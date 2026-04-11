const nombreAyudante = document.getElementById('nombreAyudante');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionCard = document.getElementById('btnCerrarSesionCard');

const heroTitle = document.getElementById('heroTitle');
const heroText = document.getElementById('heroText');
const revealCards = document.querySelectorAll('.reveal-card');

const stockAlertasResumen = document.getElementById('stockAlertasResumen');
const listaAlertasStock = document.getElementById('listaAlertasStock');
const alertaPedidosInvitados = document.getElementById('alertaPedidosInvitados');
const pedidosInvitadosTitulo = document.getElementById('pedidosInvitadosTitulo');
const pedidosInvitadosTexto = document.getElementById('pedidosInvitadosTexto');

const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebarContainer');
const mobileOverlay = document.getElementById('mobileOverlay');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;

function normalizarRol(nombreRol) {
	return (nombreRol ?? '').toString().trim().toLowerCase();
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

if (normalizarRol(usuario.nombre_rol) !== 'ayudante') {
	window.location.href = '/login/login.html';
}

if (nombreAyudante) {
	nombreAyudante.textContent = usuario.nombre_completo || 'Ayudante';
}

renderizarSidebar('inicio');

if (btnCerrarSesion) {
	btnCerrarSesion.addEventListener('click', cerrarSesion);
}

if (btnCerrarSesionCard) {
	btnCerrarSesionCard.addEventListener('click', cerrarSesion);
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

function renderizarAlertasStock(productos) {
	if (!listaAlertasStock || !stockAlertasResumen) {
		return;
	}

	if (!productos || productos.length === 0) {
		stockAlertasResumen.textContent = 'No hay productos en stock bajo.';
		listaAlertasStock.innerHTML = `
			<div class="stock-alert-empty">
				Todo está en orden. No hay alertas de stock bajo por ahora.
			</div>
		`;
		return;
	}

	stockAlertasResumen.textContent = `Hay ${productos.length} producto(s) con stock bajo o igual al mínimo.`;

	listaAlertasStock.innerHTML = productos.map((producto) => {
		const stockActual = Number(producto.stock_actual ?? 0);
		const stockMinimo = Number(producto.stock_minimo ?? 0);
		const categoria = producto.categoria?.nombre_categoria ?? 'Sin categoría';
		const visible = Boolean(producto.visible);

		return `
			<article class="stock-alert-item">
				<h4>${producto.nombre_producto}</h4>
				<p><strong>Categoría:</strong> ${categoria}</p>
				<p><strong>Stock actual:</strong> ${stockActual}</p>
				<p><strong>Stock mínimo:</strong> ${stockMinimo}</p>
				<p><strong>Visible:</strong> ${visible ? 'Sí' : 'No'}</p>
			</article>
		`;
	}).join('');
}

function mostrarAlertaPedidosInvitados(pedidos) {
	if (!alertaPedidosInvitados || !pedidosInvitadosTitulo || !pedidosInvitadosTexto) {
		return;
	}

	const total = pedidos.length;

	if (total <= 0) {
		alertaPedidosInvitados.classList.add('hidden');
		return;
	}

	pedidosInvitadosTitulo.textContent = total === 1
		? 'Hay 1 pedido de invitado sin aceptar'
		: `Hay ${total} pedidos de invitado sin aceptar`;
	pedidosInvitadosTexto.textContent = 'Revisa los pedidos pendientes para aceptarlos o darles seguimiento.';
	alertaPedidosInvitados.classList.remove('hidden');
}

async function cargarPedidosInvitadosSinAceptar() {
	if (!alertaPedidosInvitados) {
		return;
	}

	try {
		const { data, error } = await db
			.from('pedido')
			.select(`
				id_pedido,
				id_invitado,
				id_estatus,
				estatuspedido (
					id_estatus,
					descripcion
				)
			`)
			.not('id_invitado', 'is', null);

		if (error) {
			console.error('Error al cargar pedidos de invitado sin aceptar:', error);
			alertaPedidosInvitados.classList.add('hidden');
			return;
		}

		const pedidosPendientesInvitado = (data ?? []).filter((pedido) => {
			const estatus = String(pedido.estatuspedido?.descripcion ?? '').trim().toLowerCase();
			return estatus === 'pendiente';
		});

		mostrarAlertaPedidosInvitados(pedidosPendientesInvitado);
	} catch (error) {
		console.error('Error general al cargar pedidos de invitado sin aceptar:', error);
		alertaPedidosInvitados.classList.add('hidden');
	}
}

async function cargarAlertasStock() {
	if (!listaAlertasStock || !stockAlertasResumen) {
		return;
	}

	try {
		const { data, error } = await db
			.from('producto')
			.select(`
				id_producto,
				nombre_producto,
				stock_actual,
				stock_minimo,
				visible,
				categoria (
					id_categoria,
					nombre_categoria
				)
			`)
			.order('stock_actual', { ascending: true });

		if (error) {
			console.error('Error al cargar alertas de stock:', error);
			stockAlertasResumen.textContent = 'No se pudieron cargar las alertas.';
			listaAlertasStock.innerHTML = `
				<div class="stock-alert-empty">
					No se pudieron consultar las alertas de stock bajo.
				</div>
			`;
			return;
		}

		const productosStockBajo = (data ?? []).filter((producto) => {
			const stockActual = Number(producto.stock_actual ?? 0);
			const stockMinimo = Number(producto.stock_minimo ?? 0);

			return stockActual <= stockMinimo;
		});

		renderizarAlertasStock(productosStockBajo);
	} catch (error) {
		console.error('Error general al cargar alertas de stock:', error);
		stockAlertasResumen.textContent = 'No se pudieron cargar las alertas.';
		listaAlertasStock.innerHTML = `
			<div class="stock-alert-empty">
				Ocurrió un error al consultar las alertas de stock bajo.
			</div>
		`;
	}
}

animarTextoPorPalabras(heroTitle, 0, 0.10);
animarTextoPorPalabras(heroText, 0.65, 0.05);
animarTarjetas();
cargarAlertasStock();
cargarPedidosInvitadosSinAceptar();
vincularCierreMenuEnSidebar();
