const loginForm = document.getElementById('loginForm');

const btnLogin = document.getElementById('btnLogin');
const btnLoginText = document.getElementById('btnLoginText');

const btnAbrirRegistro = document.getElementById('btnAbrirRegistro');
const modalRegistro = document.getElementById('modalRegistro');
const modalRegistroBackdrop = document.getElementById('modalRegistroBackdrop');
const btnCerrarRegistro = document.getElementById('btnCerrarRegistro');
const btnCancelarRegistro = document.getElementById('btnCancelarRegistro');
const registroForm = document.getElementById('registroForm');
const registroMessage = document.getElementById('registroMessage');

const modalRecuperar = document.getElementById('modalRecuperar');
const modalRecuperarBackdrop = document.getElementById('modalRecuperarBackdrop');
const btnRecuperar = document.getElementById('btnRecuperar');
const btnCerrarRecuperar = document.getElementById('btnCerrarRecuperar');
const btnCancelarRecuperar = document.getElementById('btnCancelarRecuperar');
const recuperarForm = document.getElementById('recuperarForm');
const recuperarMessage = document.getElementById('recuperarMessage');

function mostrarMensajeRegistro(tipo, texto) {
	registroMessage.className = 'message';
	registroMessage.textContent = '';

	if (tipo) {
		registroMessage.classList.add(tipo);
		registroMessage.textContent = texto;
	}
}

function abrirModalRegistro() {
	modalRegistro.classList.remove('hidden');
	registroForm.reset();
	mostrarMensajeRegistro('', '');
}

function cerrarModalRegistro() {
	modalRegistro.classList.add('hidden');
	registroForm.reset();
	mostrarMensajeRegistro('', '');
}

function abrirModalRecuperar() {
	modalRecuperar.classList.remove('hidden');
	recuperarForm.reset();
	recuperarMessage.className = 'message';
	recuperarMessage.textContent = '';
}

function cerrarModalRecuperar() {
	modalRecuperar.classList.add('hidden');
	recuperarForm.reset();
	recuperarMessage.className = 'message';
	recuperarMessage.textContent = '';
}

function restaurarBotonLogin() {
	btnLogin.classList.remove('loading', 'success', 'error');
	btnLogin.disabled = false;
	btnLoginText.textContent = 'Entrar al sistema';
}

function estadoBotonLogin(tipo, texto) {
	btnLogin.classList.remove('loading', 'success', 'error');

	if (tipo) {
		btnLogin.classList.add(tipo);
	}

	btnLoginText.textContent = texto;

	if (tipo === 'loading') {
		btnLogin.disabled = true;
	} else {
		btnLogin.disabled = false;
	}
}

loginForm.addEventListener('submit', async function (e) {
	e.preventDefault();

	const correo = document.getElementById('correo').value.trim();
	const password = document.getElementById('password').value.trim();

	if (correo === '' || password === '') {
		estadoBotonLogin('error', '✕ Completa los campos');

		setTimeout(() => {
			restaurarBotonLogin();
		}, 1400);

		return;
	}

	estadoBotonLogin('loading', 'Validando...');

	try {
		const { data, error } = await db
			.from('usuario')
			.select(`
				id_usuario,
				nombre_completo,
				correo,
				contrasena,
				id_rol,
				rol (
					id_rol,
					nombre_rol
				)
			`)
			.eq('correo', correo)
			.single();

		if (error || !data) {
			estadoBotonLogin('error', '✕ Datos incorrectos');

			setTimeout(() => {
				restaurarBotonLogin();
			}, 1400);

			return;
		}

		if (data.contrasena !== password) {
			estadoBotonLogin('error', '✕ Datos incorrectos');

			setTimeout(() => {
				restaurarBotonLogin();
			}, 1400);

			return;
		}

		const nombreRol = (data.rol?.nombre_rol ?? '').trim().toLowerCase();

		const sesionUsuario = {
			id_usuario: data.id_usuario,
			nombre_completo: data.nombre_completo,
			correo: data.correo,
			id_rol: data.id_rol,
			nombre_rol: nombreRol
		};

		console.log('Usuario logueado:', sesionUsuario);
		console.log('Rol detectado:', sesionUsuario.nombre_rol);

		if (document.getElementById('recordarme').checked) {
			sessionStorage.removeItem('microventa_usuario');
			localStorage.setItem('microventa_usuario', JSON.stringify(sesionUsuario));
		} else {
			localStorage.removeItem('microventa_usuario');
			sessionStorage.setItem('microventa_usuario', JSON.stringify(sesionUsuario));
		}

		estadoBotonLogin('success', '✓ Correcto');

		setTimeout(() => {
			if (sesionUsuario.nombre_rol === 'administrador') {
				window.location.href = '/admin/admin.html';
			} else if (sesionUsuario.nombre_rol === 'cliente') {
				window.location.href = '/cliente/cliente.html';
			} else if (sesionUsuario.nombre_rol === 'ayudante') {
				window.location.href = '/ayudante/ayudante.html';
			} else if (sesionUsuario.nombre_rol === 'repartidor') {
				window.location.href = '/repartidor/repartidor.html';
			} else {
				window.location.href = '/login/login.html';
			}
		}, 900);

	} catch (err) {
		console.error('Error en login:', err);
		estadoBotonLogin('error', '✕ Error de conexión');

		setTimeout(() => {
			restaurarBotonLogin();
		}, 1400);
	}
});

btnAbrirRegistro.addEventListener('click', function (e) {
	e.preventDefault();
	abrirModalRegistro();
});

btnCerrarRegistro.addEventListener('click', cerrarModalRegistro);
btnCancelarRegistro.addEventListener('click', cerrarModalRegistro);
modalRegistroBackdrop.addEventListener('click', cerrarModalRegistro);

registroForm.addEventListener('submit', async function (e) {
	e.preventDefault();

	const nombre = document.getElementById('registroNombre').value.trim();
	const correo = document.getElementById('registroCorreo').value.trim();
	const password = document.getElementById('registroPassword').value.trim();
	const password2 = document.getElementById('registroPassword2').value.trim();

	mostrarMensajeRegistro('', '');

	if (!nombre || !correo || !password || !password2) {
		mostrarMensajeRegistro('error', 'Completa todos los campos.');
		return;
	}

	if (password !== password2) {
		mostrarMensajeRegistro('error', 'Las contraseñas no coinciden.');
		return;
	}

	try {
		const { data: rolCliente, error: errorRol } = await db
			.from('rol')
			.select('id_rol, nombre_rol')
			.eq('nombre_rol', 'Cliente')
			.single();

		if (errorRol || !rolCliente) {
			mostrarMensajeRegistro('error', 'No se encontró el rol Cliente.');
			return;
		}

		const { data: usuarioExistente } = await db
			.from('usuario')
			.select('id_usuario')
			.eq('correo', correo)
			.maybeSingle();

		if (usuarioExistente) {
			mostrarMensajeRegistro('error', 'Ese correo ya está registrado.');
			return;
		}

		const { error: errorInsert } = await db
			.from('usuario')
			.insert({
				nombre_completo: nombre,
				correo: correo,
				contrasena: password,
				id_rol: rolCliente.id_rol
			});

		if (errorInsert) {
			console.error('Error al registrar usuario:', errorInsert);
			mostrarMensajeRegistro('error', 'No se pudo crear la cuenta.');
			return;
		}

		mostrarMensajeRegistro('success', 'Cuenta creada correctamente. Ahora puedes iniciar sesión.');

		setTimeout(() => {
			cerrarModalRegistro();
			document.getElementById('correo').value = correo;
			document.getElementById('password').value = '';
		}, 1200);

	} catch (err) {
		console.error('Error en registro:', err);
		mostrarMensajeRegistro('error', 'Ocurrió un error al registrar la cuenta.');
	}
});

btnRecuperar.addEventListener('click', function (e) {
	e.preventDefault();
	abrirModalRecuperar();
});

btnCerrarRecuperar.addEventListener('click', cerrarModalRecuperar);
btnCancelarRecuperar.addEventListener('click', cerrarModalRecuperar);
modalRecuperarBackdrop.addEventListener('click', cerrarModalRecuperar);

recuperarForm.addEventListener('submit', async function (e) {
	e.preventDefault();

	const correo = document.getElementById('recuperarCorreo').value.trim();
	const nuevaPassword = document.getElementById('nuevaPassword').value.trim();
	const confirmarPassword = document.getElementById('confirmarNuevaPassword').value.trim();

	recuperarMessage.className = 'message';
	recuperarMessage.textContent = '';

	if (!correo || !nuevaPassword || !confirmarPassword) {
		recuperarMessage.className = 'message error';
		recuperarMessage.textContent = 'Completa todos los campos.';
		return;
	}

	if (nuevaPassword !== confirmarPassword) {
		recuperarMessage.className = 'message error';
		recuperarMessage.textContent = 'Las contraseñas no coinciden.';
		return;
	}

	try {
		const { data, error } = await db
			.from('usuario')
			.update({ contrasena: nuevaPassword })
			.eq('correo', correo)
			.select();

		if (error) {
			recuperarMessage.className = 'message error';
			recuperarMessage.textContent = 'No se pudo actualizar la contraseña.';
			return;
		}

		if (!data || data.length === 0) {
			recuperarMessage.className = 'message error';
			recuperarMessage.textContent = 'No existe una cuenta con ese correo.';
			return;
		}

		recuperarMessage.className = 'message success';
		recuperarMessage.textContent = 'Contraseña actualizada correctamente.';

		setTimeout(() => {
			cerrarModalRecuperar();
		}, 1500);

	} catch (err) {
		console.error('Error al recuperar contraseña:', err);
		recuperarMessage.className = 'message error';
		recuperarMessage.textContent = 'Ocurrió un error al actualizar la contraseña.';
	}
});