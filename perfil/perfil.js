const ID_ROL_ADMINISTRADOR = 1;
const ID_ROL_AYUDANTE = 2;
const ID_ROL_REPARTIDOR = 3;
const ID_ROL_CLIENTE = 4;

const AWS_REGION = 'us-east-2';
const AWS_LOCATION_KEY = 'v1.public.eyJqdGkiOiI4OTY5OGIyYy1hZmQyLTQyYmItYjZjNi0xZTAwNWU2MWY2N2UifRfhEn2cmnsmQT2oZxWtopI2LigByNeDiy0oA3Zqm4Yej9MvT33_zzXMYaad7gCh1zuVnyCyAUHBwg5htBa5nQhuCY4ViXzP8lO94Nx6tD3EqmkvjIKEvR3d4JCTYoFcHdOWKmOmUEeSKKiFNpK0e6E4fk7mvX4a5pdSEnv3zvu6ohA7qEvycpJsUjuP7h8FT6p5gLLp6XUfV-CQSqxKAzU2waRJGNvFlJttMF7KXBgli9nErtyG7Hyz56FDKL0GlLwC7Wl3-3xjcXNz7AY5Yd4TQXh97P3AUuZ-DoCXaGsG3NZdCqT42UvsTcDYmE49e97pyeBwCR5BMuOdH_a-YOU.NjAyMWJkZWUtMGMyOS00NmRkLThjZTMtODEyOTkzZTUyMTBi';
const AWS_BIAS_POSITION = [-104.8957, 21.5095];

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

const btnMenu = document.getElementById('btnMenu');
const sidebar = document.getElementById('sidebarContainer');
const mobileOverlay = document.getElementById('mobileOverlay');

const usuarioGuardado =
	sessionStorage.getItem('microventa_usuario') ||
	localStorage.getItem('microventa_usuario');

let usuario = null;
let datosOriginales = null;
let temporizadorBusquedaDireccion = null;
let controladorBusquedaDireccion = null;
let seleccionandoSugerenciaDireccion = false;
let latitudDireccionSeleccionada = null;
let longitudDireccionSeleccionada = null;

function obtenerRolNormalizado(nombreRol) {
	return (nombreRol ?? '').toString().trim().toLowerCase();
}

function obtenerNombreRolPorId(idRol) {
	switch (Number(idRol)) {
		case ID_ROL_ADMINISTRADOR:
			return 'administrador';
		case ID_ROL_AYUDANTE:
			return 'ayudante';
		case ID_ROL_REPARTIDOR:
			return 'repartidor';
		case ID_ROL_CLIENTE:
			return 'cliente';
		default:
			return '';
	}
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

function esAyudante(usuarioData) {
	if (!usuarioData) {
		return false;
	}

	const idRol = Number(usuarioData.id_rol);
	const nombreRol = obtenerRolNormalizado(usuarioData.nombre_rol);

	if (!Number.isNaN(idRol) && idRol === ID_ROL_AYUDANTE) {
		return true;
	}

	return nombreRol === 'ayudante';
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
	return esAdministrador(usuarioData) || esAyudante(usuarioData) || esCliente(usuarioData) || esRepartidor(usuarioData);
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
	if (!usuarioData?.estado) {
		return 'Cuenta inactiva';
	}

	const rol = obtenerRolNormalizado(usuarioData.nombre_rol);

	if (rol === 'administrador') {
		return 'Administrador activo';
	}

	if (rol === 'ayudante') {
		return 'Ayudante activo';
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
		infoEstado.textContent = formatearEstado(usuarioData.estado);
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

	latitudDireccionSeleccionada = usuarioData.latitud ?? null;
	longitudDireccionSeleccionada = usuarioData.longitud ?? null;
}

function guardarEnStorage(usuarioActualizado) {
	const usuarioParaGuardar = {
		...usuarioActualizado,
		id_rol: Number(usuarioActualizado.id_rol),
		nombre_rol: obtenerRolNormalizado(
			usuarioActualizado.nombre_rol || obtenerNombreRolPorId(usuarioActualizado.id_rol)
		)
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

function obtenerDireccionAws(item) {
	return item?.Address?.Label || item?.Title || '';
}

function obtenerTituloAws(item) {
	return item?.Title || item?.Address?.Label || 'Dirección';
}

function obtenerTextoSecundarioAws(item) {
	const address = item?.Address ?? {};
	const partes = [];

	if (address.Neighborhood) partes.push(address.Neighborhood);
	if (address.SubRegion) partes.push(address.SubRegion);
	if (address.Locality) partes.push(address.Locality);
	if (address.Region) partes.push(address.Region);
	if (address.PostalCode) partes.push(address.PostalCode);
	if (address.Country) partes.push(address.Country);

	const texto = partes
		.filter(Boolean)
		.filter((valor, index, arreglo) => arreglo.indexOf(valor) === index)
		.join(', ');

	return texto || item?.Address?.Label || item?.Title || '';
}

async function buscarAutocompleteAws(texto) {
	const url = `https://places.geo.${AWS_REGION}.amazonaws.com/v2/autocomplete?key=${AWS_LOCATION_KEY}`;

	const respuesta = await fetch(url, {
		method: 'post',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			QueryText: texto,
			Language: 'es',
			MaxResults: 5,
			Filter: {
				IncludeCountries: ['MEX']
			},
			BiasPosition: AWS_BIAS_POSITION
		}),
		signal: controladorBusquedaDireccion?.signal
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo consultar AWS Location.');
	}

	return respuesta.json();
}

async function geocodificarDireccionAws(direccion) {
	const texto = String(direccion ?? '').trim();

	if (!texto) {
		return null;
	}

	const url = `https://places.geo.${AWS_REGION}.amazonaws.com/v2/geocode?key=${AWS_LOCATION_KEY}`;

	const respuesta = await fetch(url, {
		method: 'post',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			QueryText: texto,
			Language: 'es',
			MaxResults: 1,
			Filter: {
				IncludeCountries: ['MEX']
			},
			BiasPosition: AWS_BIAS_POSITION
		})
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo geocodificar la dirección.');
	}

	const data = await respuesta.json();
	const item = data.ResultItems?.[0];

	if (!item?.Position || !Array.isArray(item.Position)) {
		return null;
	}

	const longitud = Number(item.Position[0]);
	const latitud = Number(item.Position[1]);

	if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
		return null;
	}

	return {
		direccion: obtenerDireccionAws(item) || texto,
		latitud,
		longitud
	};
}

async function obtenerDireccionDesdeUbicacion(latitud, longitud) {
	const url = `https://places.geo.${AWS_REGION}.amazonaws.com/v2/reverse-geocode?key=${AWS_LOCATION_KEY}`;

	const respuesta = await fetch(url, {
		method: 'post',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			QueryPosition: [Number(longitud), Number(latitud)],
			Language: 'es',
			MaxResults: 1
		})
	});

	if (!respuesta.ok) {
		throw new Error('No se pudo convertir la ubicación en una dirección.');
	}

	const data = await respuesta.json();
	const item = data.ResultItems?.[0];

	if (!item) {
		throw new Error('No se obtuvo una dirección válida.');
	}

	return {
		direccion: obtenerDireccionAws(item),
		latitud: Number(latitud),
		longitud: Number(longitud)
	};
}

function seleccionarSugerenciaDireccion(direccionCompleta, latitud = null, longitud = null) {
	inputDireccion.value = direccionCompleta;
	latitudDireccionSeleccionada = latitud;
	longitudDireccionSeleccionada = longitud;

	ocultarSugerenciasDireccion();

	if (latitud !== null && longitud !== null) {
		mostrarEstadoDireccion('Sugerencia aplicada con coordenadas.', 'success');
	} else {
		mostrarEstadoDireccion('Sugerencia aplicada.', 'success');
	}

	setTimeout(() => {
		ocultarEstadoDireccion();
	}, 1800);
}

async function aplicarSugerenciaDesdeBoton(boton) {
	const direccion = decodeURIComponent(boton.dataset.direccion || '');

	if (!direccion) {
		return;
	}

	seleccionandoSugerenciaDireccion = true;
	mostrarEstadoDireccion('Obteniendo coordenadas...', 'normal');

	try {
		const resultado = await geocodificarDireccionAws(direccion);

		if (!resultado) {
			seleccionarSugerenciaDireccion(direccion, null, null);
			mostrarEstadoDireccion('Se aplicó la dirección, pero no se encontraron coordenadas.', 'error');
			return;
		}

		seleccionarSugerenciaDireccion(
			resultado.direccion || direccion,
			resultado.latitud,
			resultado.longitud
		);
	} catch (error) {
		console.error('Error al geocodificar sugerencia:', error);
		seleccionarSugerenciaDireccion(direccion, null, null);
		mostrarEstadoDireccion('Se aplicó la dirección, pero no se pudieron obtener coordenadas.', 'error');
	} finally {
		setTimeout(() => {
			seleccionandoSugerenciaDireccion = false;
		}, 200);
	}
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
		const titulo = obtenerTituloAws(item);
		const secundario = obtenerTextoSecundarioAws(item);
		const direccion = obtenerDireccionAws(item);

		return `
			<button
				type="button"
				class="address-suggestion-item"
				data-direccion="${encodeURIComponent(direccion)}"
			>
				<span class="address-suggestion-main">${titulo}</span>
				<span class="address-suggestion-secondary">${secundario}</span>
			</button>
		`;
	}).join('');

	sugerenciasDireccion.classList.remove('hidden');

	sugerenciasDireccion.querySelectorAll('.address-suggestion-item').forEach((boton) => {
		boton.addEventListener('mousedown', (event) => {
			event.preventDefault();
			aplicarSugerenciaDesdeBoton(boton);
		});

		boton.addEventListener('touchstart', (event) => {
			event.preventDefault();
			aplicarSugerenciaDesdeBoton(boton);
		}, { passive: false });

		boton.addEventListener('click', (event) => {
			event.preventDefault();
			aplicarSugerenciaDesdeBoton(boton);
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

		mostrarEstadoDireccion('Buscando sugerencias con AWS...');

		const data = await buscarAutocompleteAws(termino);

		renderizarSugerenciasDirecciones(data.ResultItems ?? []);
		ocultarEstadoDireccion();
	} catch (error) {
		if (error.name === 'AbortError') {
			return;
		}

		console.error('Error al buscar sugerencias de dirección con AWS:', error);
		ocultarSugerenciasDireccion();
		mostrarEstadoDireccion('No se pudieron obtener sugerencias en este momento.', 'error');
	}
}

function programarBusquedaDireccion() {
	clearTimeout(temporizadorBusquedaDireccion);

	latitudDireccionSeleccionada = null;
	longitudDireccionSeleccionada = null;

	temporizadorBusquedaDireccion = setTimeout(() => {
		buscarSugerenciasDireccion(inputDireccion.value);
	}, 450);
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

				mostrarEstadoDireccion('Convirtiendo ubicación en dirección con AWS...');

				const resultado = await obtenerDireccionDesdeUbicacion(latitud, longitud);

				if (!resultado?.direccion) {
					throw new Error('No se obtuvo una dirección válida.');
				}

				inputDireccion.value = resultado.direccion;
				latitudDireccionSeleccionada = resultado.latitud;
				longitudDireccionSeleccionada = resultado.longitud;

				ocultarSugerenciasDireccion();
				mostrarEstadoDireccion('Dirección detectada correctamente.', 'success');

				setTimeout(() => {
					ocultarEstadoDireccion();
				}, 2200);
			} catch (error) {
				console.error('Error al convertir ubicación con AWS:', error);
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

	renderizarSidebar('perfil');
	vincularCierreMenuEnSidebar();

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
				latitud,
				longitud,
				nombreuser,
				estado
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
			nombre_rol: obtenerRolNormalizado(
				usuario?.nombre_rol || obtenerNombreRolPorId(data.id_rol)
			)
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
			direccion: usuarioData.direccion ?? '',
			latitud: usuarioData.latitud ?? null,
			longitud: usuarioData.longitud ?? null
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

	latitudDireccionSeleccionada = datosOriginales.latitud;
	longitudDireccionSeleccionada = datosOriginales.longitud;

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

	return {
		nombre_completo: nombreCompleto,
		nombreuser: nombreuser || null,
		correo,
		telefono: telefono || null,
		direccion: direccion || null
	};
}

async function prepararDatosDireccionParaGuardar(datosValidados) {
	if (!datosValidados.direccion) {
		return {
			...datosValidados,
			latitud: null,
			longitud: null
		};
	}

	if (
		Number.isFinite(Number(latitudDireccionSeleccionada)) &&
		Number.isFinite(Number(longitudDireccionSeleccionada))
	) {
		return {
			...datosValidados,
			latitud: Number(latitudDireccionSeleccionada),
			longitud: Number(longitudDireccionSeleccionada)
		};
	}

	mostrarEstadoDireccion('Obteniendo coordenadas con AWS...', 'normal');

	const resultado = await geocodificarDireccionAws(datosValidados.direccion);

	if (!resultado) {
		throw new Error('No se pudieron obtener coordenadas para la dirección.');
	}

	inputDireccion.value = resultado.direccion;
	latitudDireccionSeleccionada = resultado.latitud;
	longitudDireccionSeleccionada = resultado.longitud;

	return {
		...datosValidados,
		direccion: resultado.direccion,
		latitud: resultado.latitud,
		longitud: resultado.longitud
	};
}

if (btnUbicacionActual) {
	btnUbicacionActual.classList.remove('hidden');
	btnUbicacionActual.addEventListener('click', usarUbicacionActual);
}

if (inputDireccion) {
	inputDireccion.addEventListener('input', programarBusquedaDireccion);
}

document.addEventListener('click', (event) => {
	const clicDentroDeDireccion =
		inputDireccion?.contains(event.target) ||
		sugerenciasDireccion?.contains(event.target);

	if (!clicDentroDeDireccion) {
		ocultarSugerenciasDireccion();
	}
});

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

			const datosParaGuardar = await prepararDatosDireccionParaGuardar(datosValidados);

			const { data, error } = await db
				.from('usuario')
				.update({
					nombre_completo: datosParaGuardar.nombre_completo,
					nombreuser: datosParaGuardar.nombreuser,
					correo: datosParaGuardar.correo,
					telefono: datosParaGuardar.telefono,
					direccion: datosParaGuardar.direccion,
					latitud: datosParaGuardar.latitud,
					longitud: datosParaGuardar.longitud
				})
				.eq('id_usuario', usuario.id_usuario)
				.select(`
					id_usuario,
					nombre_completo,
					correo,
					id_rol,
					telefono,
					direccion,
					latitud,
					longitud,
					nombreuser,
					estado
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
				nombre_rol: obtenerRolNormalizado(
					usuario?.nombre_rol || obtenerNombreRolPorId(data.id_rol)
				)
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
				direccion: usuarioActualizado.direccion ?? '',
				latitud: usuarioActualizado.latitud ?? null,
				longitud: usuarioActualizado.longitud ?? null
			};

			guardarEnStorage(usuarioActualizado);
			llenarVista(usuarioActualizado);
			llenarFormulario(usuarioActualizado);

			ocultarEstadoDireccion();
			mostrarMensaje('Tu perfil fue actualizado correctamente.', 'success');
		} catch (err) {
			console.error('Error general al guardar perfil:', err);
			mostrarMensaje(
				err.message || 'Ocurrió un error al guardar la información.',
				'error'
			);
		} finally {
			btnGuardarPerfil.disabled = false;
			btnGuardarPerfil.textContent = 'Guardar cambios';
		}
	});
}

cargarPerfil();