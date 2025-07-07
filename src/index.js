/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		// console.log('request:', request);
		// console.log('db:', env);

		try {
			// 1. Usamos la API de D1 para crear un volcado completo de la base de datos.
			// Esto nos devuelve un stream de datos en formato SQL.
			console.log('------db', await env.DB.dump());

			// 2. Creamos un nombre de archivo único usando la fecha y hora actual.
			// Formato: backup-2025-07-06T03-15-00-000Z.sql
			// const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			// const filename = `backup-${timestamp}.sql`;

			// 3. Subimos el archivo de respaldo a nuestro bucket de R2.
			// await env.BACKUP_BUCKET.put(filename, dump);

			// console.log(`✅ Respaldo completado exitosamente. Archivo: ${filename}`);
		} catch (e) {
			// Si algo sale mal, lo mostramos en la consola del Worker.
			console.error('❌ Error durante el proceso de respaldo:', e);
		}

		return new Response('prueba okay');

		// const { results } = await env.DB.prepare('select * from productos where id = ?').bind(1).all();

		return new Response(JSON.stringify({ results }), {
			headers: { 'Content-Type': 'application/json' },
		});
	},
};
