const nombreAyudante = document.getElementById('nombreAyudante');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionCard = document.getElementById('btnCerrarSesionCard');

const heroTitle = document.getElementById('heroTitle');
const heroText = document.getElementById('heroText');
const revealCards = document.querySelectorAll('.reveal-card');

const stockAlertasResumen = document.getElementById('stockAlertasResumen');
const listaAlertasStock = document.getElementById('listaAlertasStock');

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