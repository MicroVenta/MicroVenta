const OSRM_ENDPOINTS = [
	'https://router.project-osrm.org/route/v1/driving',
	'https://routing.openstreetmap.de/routed-car/route/v1/driving'
];

function responderJson(res, status, data) {
	res.statusCode = status;
	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
	if (req.method === 'OPTIONS') {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		res.statusCode = 204;
		res.end();
		return;
	}

	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET, OPTIONS');
		res.statusCode = 405;
		res.end();
		return;
	}

	const coordinates = String(req.query.coordinates ?? '').trim();

	if (!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?;-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(coordinates)) {
		responderJson(res, 400, { error: 'Coordenadas invalidas.' });
		return;
	}

	let ultimoError = null;

	for (const endpoint of OSRM_ENDPOINTS) {
		const url = `${endpoint}/${coordinates}?overview=full&geometries=geojson&steps=false`;

		try {
			const respuesta = await fetch(url, {
				headers: {
					'Accept': 'application/json'
				}
			});

			if (!respuesta.ok) {
				ultimoError = `OSRM respondio ${respuesta.status}`;
				continue;
			}

			const data = await respuesta.json();

			if (!data.routes || !data.routes.length) {
				ultimoError = 'OSRM no devolvio rutas.';
				continue;
			}

			responderJson(res, 200, data);
			return;
		} catch (error) {
			ultimoError = error.message;
		}
	}

	responderJson(res, 502, {
		error: ultimoError || 'No se pudo calcular la ruta.'
	});
}
