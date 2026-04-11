export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({
			error: 'Método no permitido.'
		});
	}

	try {
		const origenLat = Number(req.query.origenLat);
		const origenLon = Number(req.query.origenLon);
		const destinoLat = Number(req.query.destinoLat);
		const destinoLon = Number(req.query.destinoLon);

		if (
			!Number.isFinite(origenLat) ||
			!Number.isFinite(origenLon) ||
			!Number.isFinite(destinoLat) ||
			!Number.isFinite(destinoLon)
		) {
			return res.status(400).json({
				error: 'Coordenadas inválidas.'
			});
		}

		const url = new URL(
			`https://router.project-osrm.org/route/v1/driving/${origenLon},${origenLat};${destinoLon},${destinoLat}`
		);

		url.searchParams.set('overview', 'full');
		url.searchParams.set('geometries', 'geojson');
		url.searchParams.set('steps', 'false');

		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
		}, 12000);

		let respuesta;

		try {
			respuesta = await fetch(url.toString(), {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				},
				signal: controller.signal
			});
		} finally {
			clearTimeout(timeoutId);
		}

		if (!respuesta.ok) {
			return res.status(respuesta.status).json({
				error: `OSRM respondió con estado ${respuesta.status}.`
			});
		}

		const data = await respuesta.json();

		if (!data.routes || !data.routes.length) {
			return res.status(404).json({
				error: 'No se encontró una ruta disponible.'
			});
		}

		return res.status(200).json(data.routes[0]);
	} catch (error) {
		console.error('Error al consultar OSRM:', error);

		const mensaje =
			error?.name === 'AbortError'
				? 'La consulta de ruta tardó demasiado.'
				: 'Error interno al calcular la ruta.';

		return res.status(500).json({
			error: mensaje
		});
	}
}