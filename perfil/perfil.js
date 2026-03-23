const ID_ROL_CLIENTE = 4;
const ID_ROL_REPARTIDOR = 3;
const nombreClienteTopbar = document.getElementById('nombreClienteTopbar');
const nombreClienteHero = document.getElementById('nombreClienteHero');
const correoClienteHero = document.getElementById('correoClienteHero');
const avatarCliente = document.getElementById('avatarCliente');
const estadoClienteTag = document.getElementById('estadoClienteTag');

const infoIdUsuario = document.getElementById('infoIdUsuario');
const infoRol = document.getElementById('infoRol');
const infoEstado = document.getElementById('infoEstado');
const infoCorreo = document.getElementById('infoCorreo');

const formPerfil = document.getElementById('formPerfil');
const btnGuardarPerfil = document.getElementById('btnGuardarPerfil');
const btnRestaurar = document.getElementById('btnRestaurar');
const mensajePerfil = document.getElementById('mensajePerfil');

const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionSidebar = document.getElementById('btnCerrarSesionSidebar');

const inputNombreCompleto = document.getElementById('nombre_completo');
const inputNombreUser = document.getElementById('nombreuser');
const inputCorreo = document.getElementById('correo');
const inputTelefono = document.getElementById('telefono');
const inputDireccion = document.getElementById('direccion');
const buscadorDireccion = document.getElementById('buscadorDireccion');
if (buscadorDireccion) {
    buscadorDireccion.addEventListener('input', () => {
        inputDireccion.value = buscadorDireccion.value;
    });
}
const resultadosDireccion = document.getElementById('resultadosDireccion');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let datosOriginales = null;

function obtenerRolNormalizado(nombreRol) {
	return (nombreRol ?? '').toString().trim().toLowerCase();
}

function esCliente(usuarioData) {
	if (!usuarioData) {
		return false;
	}

	const idRol = Number(usuarioData.id_rol);
	const nombreRol = obtenerRolNormalizado(usuarioData.nombre_rol);

	if (!Number.isNaN(idRol) && idRol === ID_ROL_CLIENTE) {
		return true;
	}

	return nombreRol === 'cliente';
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

if (!tieneAccesoPerfil(usuario)) {
	window.location.href = '/login/login.html';
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

function obtenerInicial(nombre) {
	if (!nombre || typeof nombre !== 'string') {
		return 'C';
	}

	return nombre.trim().charAt(0).toUpperCase() || 'C';
}

function mostrarMensaje(texto, tipo = 'success') {
	if (!mensajePerfil) {
		return;
	}

	mensajePerfil.textContent = texto;
	mensajePerfil.className = `message ${tipo}`;
	mensajePerfil.classList.remove('hidden');
}

function ocultarMensaje() {
	if (!mensajePerfil) {
		return;
	}

	mensajePerfil.textContent = '';
	mensajePerfil.className = 'message hidden';
}

function formatearEstado(estado) {
	return estado ? 'Activo' : 'Inactivo';
}

function capitalizarRol(nombreRol) {
	const rol = obtenerRolNormalizado(nombreRol);

	if (!rol) {
		return 'Cliente';
	}

	return rol.charAt(0).toUpperCase() + rol.slice(1);
}

function llenarVista(usuarioData) {
	if (!usuarioData) {
		return;
	}

	if (nombreClienteTopbar) {
		nombreClienteTopbar.textContent = usuarioData.nombre_completo || 'Cliente';
	}

	if (nombreClienteHero) {
		nombreClienteHero.textContent = usuarioData.nombre_completo || 'Cliente';
	}

	if (correoClienteHero) {
		correoClienteHero.textContent = usuarioData.correo || 'Sin correo';
	}

	if (avatarCliente) {
		avatarCliente.textContent = obtenerInicial(usuarioData.nombre_completo);
	}

	if (estadoClienteTag) {
		estadoClienteTag.textContent = usuarioData.Estado ? 'Cuenta activa' : 'Cuenta inactiva';
	}

	if (infoIdUsuario) {
		infoIdUsuario.textContent = usuarioData.id_usuario ?? '-';
	}

	if (infoRol) {
		infoRol.textContent = capitalizarRol(usuarioData.nombre_rol);
	}

	if (infoEstado) {
		infoEstado.textContent = formatearEstado(usuarioData.Estado);
	}

	if (infoCorreo) {
		infoCorreo.textContent = usuarioData.correo || '-';
	}
}

function llenarFormulario(usuarioData) {
	if (!usuarioData) {
		return;
	}

	inputNombreCompleto.value = usuarioData.nombre_completo ?? '';
	inputNombreUser.value = usuarioData.nombreuser ?? '';
	inputCorreo.value = usuarioData.correo ?? '';
	inputTelefono.value = usuarioData.telefono ?? '';
	inputDireccion.value = usuarioData.direccion ?? '';
	buscadorDireccion.value = usuarioData.direccion ?? '';
}

function guardarEnStorage(usuarioActualizado) {
	const usuarioParaGuardar = {
		...usuarioActualizado,
		id_rol: Number(usuarioActualizado.id_rol),
		nombre_rol: obtenerRolNormalizado(usuarioActualizado.nombre_rol)
	};

	const usuarioSerializado = JSON.stringify(usuarioParaGuardar);

	if (sessionStorage.getItem('microventa_usuario')) {
		sessionStorage.setItem('microventa_usuario', usuarioSerializado);
	}

	if (localStorage.getItem('microventa_usuario')) {
		localStorage.setItem('microventa_usuario', usuarioSerializado);
	}
}

async function cargarPerfil() {
	if (!usuario || !usuario.id_usuario) {
		window.location.href = '/login/login.html';
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
				telefono,
				direccion,
				nombreuser,
				Estado,
				rol (
					nombre_rol
				)
			`)
			.eq('id_usuario', usuario.id_usuario)
			.single();

		if (error) {
			console.error('Error al cargar perfil:', error);
			mostrarMensaje('No se pudo cargar tu información.', 'error');
			return;
		}

		const usuarioData = {
			...data,
			id_rol: Number(data.id_rol),
			nombre_rol: obtenerRolNormalizado(data.rol?.nombre_rol ?? usuario?.nombre_rol ?? 'cliente')
		};

		if (!tieneAccesoPerfil(usuarioData)) {
			window.location.href = '/login/login.html';
			return;
		}

		datosOriginales = {
			nombre_completo: usuarioData.nombre_completo ?? '',
			nombreuser: usuarioData.nombreuser ?? '',
			correo: usuarioData.correo ?? '',
			telefono: usuarioData.telefono ?? '',
			direccion: usuarioData.direccion ?? ''
		};

		usuario = {
			...usuario,
			...usuarioData
		};

		guardarEnStorage(usuario);
		llenarVista(usuario);
		llenarFormulario(usuario);

	} catch (err) {
		console.error('Error general al cargar perfil:', err);
		mostrarMensaje('Ocurrió un error al consultar tus datos.', 'error');
	}
}

function restaurarFormulario() {
	if (!datosOriginales) {
		return;
	}

	inputNombreCompleto.value = datosOriginales.nombre_completo;
	inputNombreUser.value = datosOriginales.nombreuser;
	inputCorreo.value = datosOriginales.correo;
	inputTelefono.value = datosOriginales.telefono;
	inputDireccion.value = datosOriginales.direccion;

	ocultarMensaje();
}

if (btnRestaurar) {
	btnRestaurar.addEventListener('click', restaurarFormulario);
}

function validarFormulario() {
	const nombreCompleto = inputNombreCompleto.value.trim();
	const nombreuser = inputNombreUser.value.trim();
	const correo = inputCorreo.value.trim();
	const telefono = inputTelefono.value.trim();
	const direccion = inputDireccion.value.trim();

	if (!nombreCompleto) {
		mostrarMensaje('El nombre completo es obligatorio.', 'error');
		inputNombreCompleto.focus();
		return null;
	}

	if (!correo) {
		mostrarMensaje('El correo electrónico es obligatorio.', 'error');
		inputCorreo.focus();
		return null;
	}

	if (telefono && !/^[0-9+\-\s()]{8,20}$/.test(telefono)) {
		mostrarMensaje('Ingresa un teléfono válido.', 'error');
		inputTelefono.focus();
		return null;
	}

	if (!direccion) {
		mostrarMensaje('La dirección de entrega es obligatoria para facilitar tus pedidos.', 'error');
		inputDireccion.focus();
		return null;
	}

	return {
		nombre_completo: nombreCompleto,
		nombreuser: nombreuser || null,
		correo,
		telefono: telefono || null,
		direccion
	};
}

if (formPerfil) {
	formPerfil.addEventListener('submit', async (e) => {
		e.preventDefault();
		ocultarMensaje();

		const datosValidados = validarFormulario();

		if (!datosValidados || !usuario?.id_usuario) {
			return;
		}

		try {
			btnGuardarPerfil.disabled = true;
			btnGuardarPerfil.textContent = 'Guardando...';

			const { data, error } = await db
				.from('usuario')
				.update({
					nombre_completo: datosValidados.nombre_completo,
					nombreuser: datosValidados.nombreuser,
					correo: datosValidados.correo,
					telefono: datosValidados.telefono,
					direccion: datosValidados.direccion
				})
				.eq('id_usuario', usuario.id_usuario)
				.select(`
					id_usuario,
					nombre_completo,
					correo,
					contrasena,
					id_rol,
					telefono,
					direccion,
					nombreuser,
					Estado,
					rol (
						nombre_rol
					)
				`)
				.single();

			if (error) {
				console.error('Error al actualizar perfil:', error);

				if (
					error.message &&
					error.message.toLowerCase().includes('duplicate')
				) {
					mostrarMensaje('Ese correo ya está registrado en otra cuenta.', 'error');
				} else {
					mostrarMensaje('No se pudieron guardar los cambios.', 'error');
				}

				return;
			}

			const usuarioActualizado = {
				...usuario,
				...data,
				id_rol: Number(data.id_rol),
				nombre_rol: obtenerRolNormalizado(data.rol?.nombre_rol ?? usuario?.nombre_rol ?? 'cliente')
			};

			if (!tieneAccesoPerfil(usuarioActualizado)) {
				window.location.href = '/login/login.html';
				return;
			}

			usuario = usuarioActualizado;

			datosOriginales = {
				nombre_completo: usuarioActualizado.nombre_completo ?? '',
				nombreuser: usuarioActualizado.nombreuser ?? '',
				correo: usuarioActualizado.correo ?? '',
				telefono: usuarioActualizado.telefono ?? '',
				direccion: usuarioActualizado.direccion ?? ''
			};

			guardarEnStorage(usuarioActualizado);
			llenarVista(usuarioActualizado);
			llenarFormulario(usuarioActualizado);

			mostrarMensaje('Tu perfil fue actualizado correctamente.', 'success');

		} catch (err) {
			console.error('Error general al guardar perfil:', err);
			mostrarMensaje('Ocurrió un error al guardar la información.', 'error');
		} finally {
			btnGuardarPerfil.disabled = false;
			btnGuardarPerfil.textContent = 'Guardar cambios';
		}
	});
}
let timeoutBusqueda;
let ultimaBusqueda = "";
const cache = {};

if (buscadorDireccion) {
    buscadorDireccion.addEventListener('input', () => {
        const query = buscadorDireccion.value.trim();

        clearTimeout(timeoutBusqueda);

        if (query.length < 3) {
            resultadosDireccion.innerHTML = '';
            return;
        }

        if (query === ultimaBusqueda) return;

        if (cache[query]) {
            mostrarResultados(cache[query]);
            return;
        }

        timeoutBusqueda = setTimeout(async () => {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(query)}&viewbox=-105.8,23.0,-103.0,20.0&bounded=1`;

                const res = await fetch(url, {
                    headers: {
                        'Accept-Language': 'es',
                        'User-Agent': 'MicroVentaApp'
                    }
                });

                const data = await res.json();
				ultimaBusqueda = query; 
                cache[query] = data;

                mostrarResultados(data);

            } catch (error) {
                console.error('Error buscando dirección:', error);
            }
        }, 700); 
    });
}

function mostrarResultados(lugares) {
    resultadosDireccion.innerHTML = '';
	const lugaresUnicos = [];
	const nombresVistos = new Set();

	lugares.forEach(lugar => {
    const limpio = lugar.display_name
        .replace(/\d{5}/g, '')
        .replace(', México', '')
        .replace(/,\s*,/g, ',')
        .replace(/,\s*$/, '')
        .trim();

    if (!nombresVistos.has(limpio)) {
        nombresVistos.add(limpio);
        lugaresUnicos.push(lugar);
    }

});
    lugaresUnicos.forEach(lugar => {
        const div = document.createElement('div');
        div.classList.add('resultado-item');
        const direccionLimpia = lugar.display_name
    .replace(/\d{5}/g, '')       // quita CP
    .replace(', , México', '.')     // quita México
		div.textContent = direccionLimpia;

div.addEventListener('click', () => {
    const direccionLimpia = lugar.display_name
        .replace(/\d{5}/g, '')
        .replace(', México', '')
        .replace(/,\s*,/g, ',')
        .replace(/,\s*$/, '')
        .trim();
    const partes = direccionLimpia.split(',');

    const primeraParte = partes[0]; 
    const resto = partes.slice(1).join(','); 

    const nuevaDireccion = `${primeraParte} #,${resto}`;

    buscadorDireccion.value = nuevaDireccion;
    inputDireccion.value = nuevaDireccion;

    resultadosDireccion.innerHTML = '';
    const posicionCursor = nuevaDireccion.indexOf('#') + 1;

    buscadorDireccion.focus();
    buscadorDireccion.setSelectionRange(posicionCursor, posicionCursor);
});

        resultadosDireccion.appendChild(div);
    });
}

function esRepartidor(usuarioData) {
	if (!usuarioData) {
		return false;
	}

	const idRol = Number(usuarioData.id_rol);
	const nombreRol = obtenerRolNormalizado(usuarioData.nombre_rol);

	if (!Number.isNaN(idRol) && idRol === ID_ROL_REPARTIDOR) {
		return true;
	}

	return nombreRol === 'repartidor';
}

function tieneAccesoPerfil(usuarioData) {
	return esCliente(usuarioData) || esRepartidor(usuarioData);
}

cargarPerfil();