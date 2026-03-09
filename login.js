const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

const btnAbrirRegistro = document.getElementById('btnAbrirRegistro');
const modalRegistro = document.getElementById('modalRegistro');
const modalRegistroBackdrop = document.getElementById('modalRegistroBackdrop');
const btnCerrarRegistro = document.getElementById('btnCerrarRegistro');
const btnCancelarRegistro = document.getElementById('btnCancelarRegistro');
const registroForm = document.getElementById('registroForm');
const registroMessage = document.getElementById('registroMessage');

function mostrarMensajeLogin(tipo, texto) {
    message.className = 'message';
    message.textContent = '';

    if (tipo) {
        message.classList.add(tipo);
        message.textContent = texto;
    }
}

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

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value.trim();

    mostrarMensajeLogin('', '');

    if (correo === '' || password === '') {
        mostrarMensajeLogin('error', 'Por favor, completa todos los campos.');
        return;
    }

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
            mostrarMensajeLogin('error', 'Correo o contraseña incorrectos.');
            return;
        }

        if (data.contrasena !== password) {
            mostrarMensajeLogin('error', 'Correo o contraseña incorrectos.');
            return;
        }

        const sesionUsuario = {
            id_usuario: data.id_usuario,
            nombre_completo: data.nombre_completo,
            correo: data.correo,
            id_rol: data.id_rol,
            nombre_rol: data.rol?.nombre_rol ?? 'Sin rol'
        };

        if (document.getElementById('recordarme').checked) {
            localStorage.setItem('microventa_usuario', JSON.stringify(sesionUsuario));
        } else {
            sessionStorage.setItem('microventa_usuario', JSON.stringify(sesionUsuario));
        }

        mostrarMensajeLogin('success', 'Inicio de sesión correcto.');

        setTimeout(() => {
            if (sesionUsuario.nombre_rol === 'Administrador') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 900);

    } catch (err) {
        console.error('Error en login:', err);
        mostrarMensajeLogin('error', 'No se pudo conectar con la base de datos.');
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

//Botón recuperar

const modalRecuperar = document.getElementById("modalRecuperar");
const btnRecuperar = document.getElementById("btnRecuperar");
const btnCerrarRecuperar = document.getElementById("btnCerrarRecuperar");
const btnCancelarRecuperar = document.getElementById("btnCancelarRecuperar");

btnRecuperar.addEventListener("click", () => {
    modalRecuperar.classList.remove("hidden");
});

btnCerrarRecuperar.addEventListener("click", () => {
    modalRecuperar.classList.add("hidden");
});

btnCancelarRecuperar.addEventListener("click", () => {
    modalRecuperar.classList.add("hidden");
});

const recuperarForm = document.getElementById("recuperarForm");

recuperarForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const correo = document.getElementById("recuperarCorreo").value.trim();
	const nuevaPassword = document.getElementById("nuevaPassword").value.trim();
	const confirmarPassword = document.getElementById("confirmarNuevaPassword").value.trim();

	const recuperarMessage = document.getElementById("recuperarMessage");
	recuperarMessage.className = "message";
	recuperarMessage.textContent = "";

	if (!correo || !nuevaPassword || !confirmarPassword) {
		recuperarMessage.className = "message error";
		recuperarMessage.textContent = "Completa todos los campos.";
		return;
	}

	if (nuevaPassword !== confirmarPassword) {
		recuperarMessage.className = "message error";
		recuperarMessage.textContent = "Las contraseñas no coinciden.";
		return;
	}

	const { data, error } = await db
		.from("usuario")
		.update({ contrasena: nuevaPassword })
		.eq("correo", correo)
		.select();

	if (error) {
		recuperarMessage.className = "message error";
		recuperarMessage.textContent = "No se pudo actualizar la contraseña.";
		return;
	}

	if (!data || data.length === 0) {
		recuperarMessage.className = "message error";
		recuperarMessage.textContent = "No existe una cuenta con ese correo.";
		return;
	}

	recuperarMessage.className = "message success";
	recuperarMessage.textContent = "Contraseña actualizada correctamente.";

	setTimeout(() => {
		modalRecuperar.classList.add("hidden");
		recuperarForm.reset();
		recuperarMessage.className = "message";
		recuperarMessage.textContent = "";
	}, 1500);
});