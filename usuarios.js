const tablaUsuariosBody = document.getElementById('tablaUsuariosBody');
const searchInput = document.getElementById('searchInput');
const modalUsuario = document.getElementById('modalUsuario');
const modalTitle = document.getElementById('modalTitle');
const usuarioForm = document.getElementById('usuarioForm');

const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnCancelar = document.getElementById('btnCancelar');
const modalBackdrop = document.getElementById('modalBackdrop');
const selectRol = document.getElementById('id_rol');

let usuarios = [];

function abrirModal() {
	modalUsuario.classList.remove('hidden');
}

function cerrarModal() {
	modalUsuario.classList.add('hidden');
	usuarioForm.reset();
	document.getElementById('id_usuario').value = '';
}

async function cargarRoles() {
	const { data, error } = await db
		.from('rol')
		.select('id_rol, nombre_rol')
		.order('id_rol', { ascending: true });

	if (error) {
		console.error('Error al cargar roles:', error);
		return;
	}

	selectRol.innerHTML = '<option value="">Selecciona un rol</option>';

	data.forEach((rol) => {
		const option = document.createElement('option');
		option.value = rol.id_rol;
		option.textContent = rol.nombre_rol;
		selectRol.appendChild(option);
	});
}

async function cargarUsuarios() {
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
		.order('id_usuario', { ascending: true });

	if (error) {
		console.error('Error al cargar usuarios:', error);
		tablaUsuariosBody.innerHTML = `
			<tr>
				<td colspan="5">No se pudieron cargar los usuarios.</td>
			</tr>
		`;
		return;
	}

	usuarios = data;
	renderUsuarios(searchInput.value);
}

function renderUsuarios(filtro = '') {
	tablaUsuariosBody.innerHTML = '';

	const usuariosFiltrados = usuarios.filter((usuario) => {
		const texto = `
			${usuario.nombre_completo ?? ''}
			${usuario.correo ?? ''}
			${usuario.rol?.nombre_rol ?? ''}
		`.toLowerCase();

		return texto.includes(filtro.toLowerCase());
	});

	if (usuariosFiltrados.length === 0) {
		tablaUsuariosBody.innerHTML = `
			<tr>
				<td colspan="5">No se encontraron usuarios.</td>
			</tr>
		`;
		return;
	}

	usuariosFiltrados.forEach((usuario) => {
		const tr = document.createElement('tr');

		tr.innerHTML = `
			<td>${usuario.id_usuario}</td>
			<td>${usuario.nombre_completo}</td>
			<td>${usuario.correo}</td>
			<td><span class="badge-role">${usuario.rol?.nombre_rol ?? 'Sin rol'}</span></td>
			<td>
				<div class="actions">
					<button class="btn-edit" onclick="editarUsuario(${usuario.id_usuario})">Editar</button>
					<button class="btn-delete" onclick="eliminarUsuario(${usuario.id_usuario})">Eliminar</button>
				</div>
			</td>
		`;

		tablaUsuariosBody.appendChild(tr);
	});
}

function editarUsuario(id) {
	const usuario = usuarios.find((u) => u.id_usuario === id);
	if (!usuario) return;

	modalTitle.textContent = 'Editar usuario';

	document.getElementById('id_usuario').value = usuario.id_usuario;
	document.getElementById('nombre_completo').value = usuario.nombre_completo ?? '';
	document.getElementById('correo').value = usuario.correo ?? '';
	document.getElementById('contrasena').value = usuario.contrasena ?? '';
	document.getElementById('id_rol').value = usuario.id_rol ?? '';

	abrirModal();
}

async function eliminarUsuario(id) {
	const confirmar = confirm('¿Deseas eliminar este usuario?');
	if (!confirmar) return;

	const { error } = await db
		.from('usuario')
		.delete()
		.eq('id_usuario', id);

	if (error) {
		console.error('Error al eliminar usuario:', error);
		alert('No se pudo eliminar el usuario.');
		return;
	}

	await cargarUsuarios();
}

btnNuevoUsuario.addEventListener('click', () => {
	modalTitle.textContent = 'Nuevo usuario';
	usuarioForm.reset();
	document.getElementById('id_usuario').value = '';
	abrirModal();
});

btnCerrarModal.addEventListener('click', cerrarModal);
btnCancelar.addEventListener('click', cerrarModal);
modalBackdrop.addEventListener('click', cerrarModal);

usuarioForm.addEventListener('submit', async (e) => {
	e.preventDefault();

	const id = document.getElementById('id_usuario').value;

	const usuarioData = {
		nombre_completo: document.getElementById('nombre_completo').value.trim(),
		correo: document.getElementById('correo').value.trim(),
		contrasena: document.getElementById('contrasena').value.trim(),
		id_rol: Number(document.getElementById('id_rol').value)
	};

	let error;

	if (id) {
		({ error } = await db
			.from('usuario')
			.update(usuarioData)
			.eq('id_usuario', Number(id)));
	} else {
		({ error } = await db
			.from('usuario')
			.insert(usuarioData));
	}

	if (error) {
		console.error('Error al guardar usuario:', error);
		alert('No se pudo guardar el usuario.');
		return;
	}

	cerrarModal();
	await cargarUsuarios();
});

searchInput.addEventListener('input', (e) => {
	renderUsuarios(e.target.value);
});

async function init() {
	await cargarRoles();
	await cargarUsuarios();
}

init();