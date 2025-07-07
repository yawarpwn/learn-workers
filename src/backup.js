// src/backup.ts

// Definimos las "variables de entorno" que nuestro Worker espera recibir
// Estas son las conexiones a D1 y R2 que configuramos en wrangler.toml
// export interface Env {
//   DB: D1Database;
//   BACKUP_BUCKET: R2Bucket;
// }

// El export default es lo que Cloudflare busca para ejecutar el Worker
export default {
	// La función 'scheduled' se ejecuta cuando es activada por un Cron Trigger
	async scheduled(controller, env, ctx) {
		console.log('Iniciando respaldo programado de la base de datos...');

		try {
			// 1. Usamos la API de D1 para crear un volcado completo de la base de datos.
			// Esto nos devuelve un stream de datos en formato SQL.
			const dump = await env.DB.dump();

			console.log(dump);

			// 2. Creamos un nombre de archivo único usando la fecha y hora actual.
			// Formato: backup-2025-07-06T03-15-00-000Z.sql
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `backup-${timestamp}.sql`;

			// 3. Subimos el archivo de respaldo a nuestro bucket de R2.
			await env.BACKUP_BUCKET.put(filename, dump);

			console.log(`✅ Respaldo completado exitosamente. Archivo: ${filename}`);
		} catch (e) {
			// Si algo sale mal, lo mostramos en la consola del Worker.
			console.error('❌ Error durante el proceso de respaldo:', e);
		}
	},
};
