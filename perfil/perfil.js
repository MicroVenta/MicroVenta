const ID_ROL_ADMINISTRADOR = 1;
const ID_ROL_REPARTIDOR = 3;
const ID_ROL_CLIENTE = 4;

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

const inputNombreCompleto = document.getElementById('nombre_completo');
const inputNombreUser = document.getElementById('nombreuser');
const inputCorreo = document.getElementById('correo');
const inputTelefono = document.getElementById('telefono');
const inputDireccion = document.getElementById('direccion');

const sugerenciasDireccion = document.getElementById('sugerenciasDireccion');
const btnUbicacionActual = document.getElementById('btnUbicacionActual');
const estadoDireccion = document.getElementById('estadoDireccion');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let datosOriginales = null;
let temporizadorBusquedaDireccion = null;
let controladorBusquedaDireccion = null;

function obtenerRolNormalizado(nombreRol) {
	return (nombreRol ?? '').toString().trim().toLowerCase();
}

function esAdministrador(usuarioData) {
	if (!usuarioData) {
		return false;
	}

	const idRol = Number(usuarioData.id_rol);
	const nombreRol = obtenerRolNormalizado(usuarioData.nombre_rol);

	if (!Number.isNaN(idRol) && idRol === ID_ROL_ADMINISTRADOR) {
		return true;
	}

	return nombreRol === 'administrador';
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
	return esAdministrador(usuarioData) || esCliente(usuarioData) || esRepartidor(usuarioData);
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

function obtenerInicial(nombre) {
	if (!nombre || typeof nombre !== 'string') {
		return 'U';
	}

	return nombre.trim().charAt(0).toUpperCase() || 'U';
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
		return 'Usuario';
	}

	return rol.charAt(0).toUpperCase() + rol.slice(1);
}

function obtenerEtiquetaEstadoCuenta(usuarioData) {
	if (!usuarioData?.Estado) {
		return 'Cuenta inactiva';
	}

	const rol = obtenerRolNormalizado(usuarioData.nombre_rol);

	if (rol === 'administrador') {
		return 'Administrador activo';
	}

	if (rol === 'repartidor') {
		return 'Repartidor activo';
	}

	if (rol === 'cliente') {
		return 'Cliente activo';
	}

	return 'Cuenta activa';
}

function llenarVista(usuarioData) {
	if (!usuarioData) {
		return;
	}

	if (nombreClienteTopbar) {
		nombreClienteTopbar.textContent = usuarioData.nombre_completo || 'Usuario';
	}

	if (nombreClienteHero) {
		nombreClienteHero.textContent = usuarioData.nombre_completo || 'Usuario';
	}

	if (correoClienteHero) {
		correoClienteHero.textContent = usuarioData.correo || 'Sin correo';
	}

	if (avatarCliente) {
		avatarCliente.textContent = obtenerInicial(usuarioData.nombre_completo);
	}

	if (estadoClienteTag) {
		estadoClienteTag.textContent = obtenerEtiquetaEstadoCuenta(usuarioData);
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

function mostrarEstadoDireccion(texto, tipo = 'normal') {
	if (!estadoDireccion) {
		return;
	}

	estadoDireccion.textContent = texto;
	estadoDireccion.classList.remove('hidden');
	estadoDireccion.style.color =
		tipo === 'error'
			? 'var(--rojo-texto)'
			: tipo === 'success'
				? 'var(--verde-texto)'
				: 'var(--rosa-oscuro)';
}

function ocultarEstadoDireccion() {
	if (!estadoDireccion) {
		return;
	}

	estadoDireccion.textContent = '';
	estadoDireccion.classList.add('hidden');
	estadoDireccion.style.color = '';
}

function ocultarSugerenciasDireccion() {
	if (!sugerenciasDireccion) {
		return;
	}

	sugerenciasDireccion.innerHTML = '';
	sugerenciasDireccion.classList.add('hidden');
}

function construirTextoSecundarioDireccion(item) {
	const partes = [];

	if (item.address?.suburb) partes.push(item.address.suburb);
	if (item.address?.city) partsPushUnico(partes, item.address.city);
	if (item.address?.town) partsPushUnico(partes, item.address.town);
	if (item.address?.state) partsPushUnico(partes, item.address.state);
	if (item.address?.postcode) partsPushUnico(partes, item.address.postcode);

	return partes.join(', ');
}

function partsPushUnico(lista, valor) {
	if (!valor) {
		return;
	}

	if (!lista.includes(valor)) {
		lista.push(valor);
	}
}

function obtenerTituloDireccion(item) {
	const address = item.address ?? {};
	const titulo = [];

	if (address.road) titulo.push(address.road);
	if (address.house_number) titulo.push(address.house_number);
	if (!titulo.length && item.name) titulo.push(item.name);
	if (!titulo.length && item.display_name) {
		return item.display_name.split(',')[0];
	}

	return titulo.join(' ');
}

function seleccionarSugerenciaDireccion(direccionCompleta) {
	inputDireccion.value = direccionCompleta;
	ocultarSugerenciasDireccion();
	mostrarEstadoDireccion('Sugerencia aplicada.', 'success');

	setTimeout(() => {
		ocultarEstadoDireccion();
	}, 1800);
}

function renderizarSugerenciasDirecciones(resultados) {
	if (!sugerenciasDireccion) {
		return;
	}

	if (!Array.isArray(resultados) || resultados.length === 0) {
		sugerenciasDireccion.innerHTML = `
			<div class="address-suggestion-item" style="cursor: default;">
				<span class="address-suggestion-main">No se encontraron coincidencias</span>
				<span class="address-suggestion-secondary">Prueba escribiendo calle, colonia o ciudad.</span>
			</div>
		`;
		sugerenciasDireccion.classList.remove('hidden');
		return;
	}

	sugerenciasDireccion.innerHTML = resultados.map((item) => {
		const titulo = obtenerTituloDireccion(item);
		const secundario = construirTextoSecundarioDireccion(item) || item.display_name;

		return `
			<button
				type="button"
				class="address-suggestion-item"
				data-direccion="${encodeURIComponent(item.display_name)}"
			>
				<span class="address-suggestion-main">${titulo}</span>
				<span class="address-suggestion-secondary">${secundario}</span>
			</button>
		`;
	}).join('');

	sugerenciasDireccion.classList.remove('hidden');

	sugerenciasDireccion.querySelectorAll('.address-suggestion-item').forEach((boton) => {
		boton.addEventListener('click', () => {
			const direccion = decodeURIComponent(boton.dataset.direccion || '');
			seleccionarSugerenciaDireccion(direccion);
		});
	});
}

async function buscarSugerenciasDireccion(texto) {
	const termino = texto.trim();

	if (termino.length < 5) {
		ocultarSugerenciasDireccion();
		ocultarEstadoDireccion();
		return;
	}

	try {
		if (controladorBusquedaDireccion) {
			controladorBusquedaDireccion.abort();
		}

		controladorBusquedaDireccion = new AbortController();

		mostrarEstadoDireccion('Buscando sugerencias...');

		const url = new URL('https://nominatim.openstreetmap.org/search');
		url.searchParams.set('q', termino);
		url.searchParams.set('format', 'jsonv2');
		url.searchParams.set('addressdetails', '1');
		url.searchParams.set('limit', '5');
		url.searchParams.set('countrycodes', 'mx');
		url.searchParams.set('accept-language', 'es');

		const respuesta = await fetch(url.toString(), {
			method: 'GET',
			signal: controladorBusquedaDireccion.signal,
			headers: {
				'Accept': 'application/json'
			}
		});

		if (!respuesta.ok) {
			throw new Error('No se pudo consultar el servicio de direcciones.');
		}

		const data = await respuesta.json();

		renderizarSugerenciasDirecciones(data);
		ocultarEstadoDireccion();
	} catch (error) {
		if (error.name === 'AbortError') {
			return;
		}

		console.error('Error al buscar sugerencias de dirección:', error);
		ocultarSugerenciasDireccion();
		mostrarEstadoDireccion('No se pudieron obtener sugerencias en este momento.', 'error');
	}
}

function programarBusquedaDireccion() {
	clearTimeout(temporizadorBusquedaDireccion);

	temporizadorBusquedaDireccion = setTimeout(() => {
		buscarSugerenciasDireccion(inputDireccion.value);
	}, 450);
}

async function obtenerDireccionDesdeUbicacion(latitud, longitud) {
	const url = new URL('https://nominatim.openstreetmap.org/reverse');
	url.searchParams.set('lat', latitud);
	url.searchParams.set('lon', longitud);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('addressdetails', '1');
	url.searchParams.set('accept-language', 'es');

	const respuesta = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo convertir la ubicación en una dirección.');
	}

	return respuesta.json();
}

async function usarUbicacionActual() {
	if (!navigator.geolocation) {
		mostrarEstadoDireccion('Tu navegador no permite obtener la ubicación.', 'error');
		return;
	}

	if (btnUbicacionActual) {
		btnUbicacionActual.disabled = true;
		btnUbicacionActual.textContent = 'Obteniendo ubicación...';
	}

	mostrarEstadoDireccion('Solicitando ubicación...');

	navigator.geolocation.getCurrentPosition(
		async (posicion) => {
			try {
				const latitud = posicion.coords.latitude;
				const longitud = posicion.coords.longitude;

				mostrarEstadoDireccion('Convirtiendo ubicación en dirección...');

				const resultado = await obtenerDireccionDesdeUbicacion(latitud, longitud);
				const direccion = resultado?.display_name ?? '';

				if (!direccion) {
					throw new Error('No se obtuvo una dirección válida.');
				}

				inputDireccion.value = direccion;
				ocultarSugerenciasDireccion();
				mostrarEstadoDireccion('Dirección detectada correctamente.', 'success');

				setTimeout(() => {
					ocultarEstadoDireccion();
				}, 2200);
			} catch (error) {
				console.error('Error al convertir ubicación:', error);
				mostrarEstadoDireccion('No se pudo obtener la dirección desde tu ubicación.', 'error');
			} finally {
				if (btnUbicacionActual) {
					btnUbicacionActual.disabled = false;
					btnUbicacionActual.textContent = 'Usar mi ubicación actual';
				}
			}
		},
		(error) => {
			console.error('Error de geolocalización:', error);

			let mensaje = 'No se pudo obtener tu ubicación.';

			if (error.code === 1) {
				mensaje = 'Debes permitir el acceso a tu ubicación.';
			} else if (error.code === 2) {
				mensaje = 'No fue posible determinar tu ubicación actual.';
			} else if (error.code === 3) {
				mensaje = 'La solicitud de ubicación tardó demasiado.';
			}

			mostrarEstadoDireccion(mensaje, 'error');

			if (btnUbicacionActual) {
				btnUbicacionActual.disabled = false;
				btnUbicacionActual.textContent = 'Usar mi ubicación actual';
			}
		},
		{
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 0
		}
	);
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
			nombre_rol: obtenerRolNormalizado(data.rol?.nombre_rol ?? usuario?.nombre_rol ?? '')
		};

		if (!tieneAccesoPerfil(usuarioData)) {
			window.location.href = '/login/login.html';
			return;
		}

		renderizarSidebar('perfil');

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
	ocultarSugerenciasDireccion();
	ocultarEstadoDireccion();
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

	if (direccion && direccion.length < 10) {
		mostrarMensaje('Ingresa una dirección más completa.', 'error');
		inputDireccion.focus();
		return null;
	}

	return {
		nombre_completo: nombreCompleto,
		nombreuser: nombreuser || null,
		correo,
		telefono: telefono || null,
		direccion: direccion || null
	};
}

if (inputDireccion) {
	inputDireccion.addEventListener('input', () => {
		programarBusquedaDireccion();
	});

	inputDireccion.addEventListener('focus', () => {
		if (inputDireccion.value.trim().length >= 5) {
			programarBusquedaDireccion();
		}
	});

	inputDireccion.addEventListener('blur', () => {
		setTimeout(() => {
			ocultarSugerenciasDireccion();
		}, 180);
	});
}

if (btnUbicacionActual) {
	btnUbicacionActual.addEventListener('click', usarUbicacionActual);
}

if (formPerfil) {
	formPerfil.addEventListener('submit', async (e) => {
		e.preventDefault();
		ocultarMensaje();
		ocultarSugerenciasDireccion();

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
				nombre_rol: obtenerRolNormalizado(data.rol?.nombre_rol ?? usuario?.nombre_rol ?? '')
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

cargarPerfil();