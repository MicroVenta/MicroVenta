function obtenerUsuarioDesdeStorage() {
	const usuarioGuardado =
		sessionStorage.getItem('microventa_usuario') ||
		localStorage.getItem('microventa_usuario');

	if (!usuarioGuardado) {
		return null;
	}

	try {
		return JSON.parse(usuarioGuardado);
	} catch (error) {
		sessionStorage.removeItem('microventa_usuario');
		localStorage.removeItem('microventa_usuario');
		return null;
	}
}

function normalizarRol(nombreRol) {
	return (nombreRol ?? '').toString().trim().toLowerCase();
}

function esRepartidor(usuario) {
	if (!usuario) {
		return false;
	}

	const rol = normalizarRol(usuario.nombre_rol);
	const idRol = Number(usuario.id_rol);

	return rol === 'repartidor' || idRol === 3;
}

function cerrarSesionSidebar() {
	sessionStorage.removeItem('microventa_usuario');
	localStorage.removeItem('microventa_usuario');
	window.location.href = '/login/login.html';
}

function obtenerSidebarCliente(activo) {
	return `
		<div class="sidebar-brand">
			<img src="/grafico/Logo_DM.png" alt="Dulce Mordisco" class="sidebar-logo">
			<div>
				<h2>Dulce Mordisco</h2>
				<p>MicroVenta</p>
			</div>
		</div>

		<nav class="sidebar-menu">
			<a href="/cliente/cliente.html" class="menu-item ${activo === 'inicio' ? 'active' : ''}">🏠 Inicio</a>
			<a href="/productos/productos.html" class="menu-item ${activo === 'productos' ? 'active' : ''}">🧁 Productos</a>
			<a href="/mis-pedidos/mis-pedidos.html" class="menu-item ${activo === 'mis-pedidos' ? 'active' : ''}">🛒 Mis pedidos</a>
			<a href="/perfil/perfil.html" class="menu-item ${activo === 'perfil' ? 'active' : ''}">👤 Mi perfil</a>

			<button id="btnCerrarSesionSidebar" class="menu-item menu-item-logout" type="button">
				🚪 Cerrar sesión
			</button>
		</nav>
	`;
}

function obtenerSidebarRepartidor(activo) {
	return `
		<div class="sidebar-brand">
			<img src="/grafico/Logo_DM.png" alt="Dulce Mordisco" class="sidebar-logo">
			<div>
				<h2>Dulce Mordisco</h2>
				<p>MicroVenta</p>
			</div>
		</div>

		<nav class="sidebar-menu">
			<a href="/repartidor/repartidor.html" class="menu-item ${activo === 'inicio' ? 'active' : ''}">🏠 Inicio</a>
			<a href="/pedidos-repartidor/pedidos-repartidor.html" class="menu-item ${activo === 'mis-entregas' ? 'active' : ''}">🛵 Mis entregas</a>
			<a href="/productos/productos.html" class="menu-item ${activo === 'productos' ? 'active' : ''}">🧁 Catálogo</a>
			<a href="/mis-pedidos/mis-pedidos.html" class="menu-item ${activo === 'mis-pedidos' ? 'active' : ''}">🧾 Mis pedidos</a>
			<a href="/perfil/perfil.html" class="menu-item ${activo === 'perfil' ? 'active' : ''}">👤 Mi perfil</a>

			<button id="btnCerrarSesionSidebar" class="menu-item menu-item-logout" type="button">
				🚪 Cerrar sesión
			</button>
		</nav>
	`;
}

function renderizarSidebar(activo = '') {
	const contenedorSidebar = document.getElementById('sidebarContainer');
	const usuario = obtenerUsuarioDesdeStorage();

	if (!contenedorSidebar || !usuario) {
		return;
	}

	if (esRepartidor(usuario)) {
		contenedorSidebar.innerHTML = obtenerSidebarRepartidor(activo);
	} else {
		contenedorSidebar.innerHTML = obtenerSidebarCliente(activo);
	}

	const btnCerrarSesionSidebar = document.getElementById('btnCerrarSesionSidebar');

	if (btnCerrarSesionSidebar) {
		btnCerrarSesionSidebar.addEventListener('click', cerrarSesionSidebar);
	}
}