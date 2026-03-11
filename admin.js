const nombreAdmin = document.getElementById('nombreAdmin');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const heroTitle = document.getElementById('heroTitle');
const heroText = document.getElementById('heroText');
const revealCards = document.querySelectorAll('.reveal-card');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

if (!usuarioGuardado) {
	window.location.href = 'login.html';
} else {
	const usuario = JSON.parse(usuarioGuardado);

	if (usuario.nombre_rol !== 'Administrador') {
		window.location.href = 'login.html';
	} else {
		nombreAdmin.textContent = usuario.nombre_completo;
	}
}

btnCerrarSesion.addEventListener('click', () => {
	sessionStorage.removeItem('microventa_usuario');
	localStorage.removeItem('microventa_usuario');
	window.location.href = 'login.html';
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

animarTextoPorPalabras(heroTitle, 0, 0.10);
animarTextoPorPalabras(heroText, 0.65, 0.05);
animarTarjetas();