import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

// type Env = {
//   BACKUP_WORKFLOW: Workflow;
//   DB: D1Database;
//   BACKUP_BUCKET: R2Bucket;
//   D1_REST_API_TOKEN: string;
// };
//
// type Params = {
//   accountId: string;
//   databaseId: string;
// };

export class BackupWorkflow extends WorkflowEntrypoint {
	async run(event, step) {
		const { accountId, databaseId } = event.payload;

		// 1. Iniciar exportación
		const bookmark = await step.do('Start D1 export', async () => {
			const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/export`;
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.env.D1_REST_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ output_format: 'polling' }),
			});
			const { result } = await res.json();
			if (!result?.at_bookmark) throw new Error('Export failed');
			return result.at_bookmark;
		});

		// 2. Verificar y subir a R2
		await step.do('Upload to R2', async () => {
			const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/export`;
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.env.D1_REST_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ current_bookmark: bookmark }),
			});
			const { result } = await res.json();
			if (!result?.signed_url) throw new Error('Backup not ready');

			// Descargar y subir a R2
			const dumpRes = await fetch(result.signed_url);
			await this.env.BACKUP_BUCKET.put(`backup-${new Date().toISOString()}.sql`, dumpRes.body);
		});
	}
}

// Handler para el Worker (opcional)
export default {
	async fetch(request, env) {
		return new Response('Use /backup to trigger manually');
	},
	async scheduled(controller, env) {
		const params = {
			accountId: '8822126d2aafa667c35b5849162bbb3b', // Reemplaza con tu Account ID de Cloudflare
			databaseId: '5106c371-333c-4545-ac8f-a1b7827fdb31',
		};
		await env.BACKUP_WORKFLOW.create({ params });
	},
};
