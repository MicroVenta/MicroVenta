const nombreAdmin = document.getElementById('nombreAdmin');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

if (!usuarioGuardado) {
	window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioGuardado);

if (usuario.nombre_rol !== 'Administrador') {
	window.location.href = 'login.html';
}

nombreAdmin.textContent = usuario.nombre_completo;

btnCerrarSesion.addEventListener('click', () => {
	sessionStorage.removeItem('microventa_usuario');
	localStorage.removeItem('microventa_usuario');
	window.location.href = 'login.html';
});