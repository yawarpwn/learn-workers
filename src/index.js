import { WorkflowEntrypoint } from 'cloudflare:workers';
// import {
//   WorkflowEntrypoint,
//   WorkflowStep,
//   WorkflowEvent,
// } from "cloudflare:workers";
//
// // We are using R2 to store the D1 backup
// type Env = {
//   BACKUP_WORKFLOW: Workflow;
//   D1_REST_API_TOKEN: string;
//   BACKUP_BUCKET: R2Bucket;
// };
//
// // Workflow parameters: we expect accountId and databaseId
// type Params = {
//   accountId: string;
//   databaseId: string;
// };

// Workflow logic
export class backupWorkflow extends WorkflowEntrypoint {
	async run(event, step) {
		const { accountId, databaseId } = event.payload;

		const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/export`;
		const method = 'POST';
		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', `Bearer ${this.env.D1_REST_API_TOKEN}`);

		const bookmark = await step.do(`Starting backup for ${databaseId}`, async () => {
			const payload = { output_format: 'polling' };

			const res = await fetch(url, {
				method,
				headers,
				body: JSON.stringify(payload),
			});
			const { result } = await res.json();

			// If we don't get `at_bookmark` we throw to retry the step
			if (!result?.at_bookmark) throw new Error('Missing `at_bookmark`');

			return result.at_bookmark;
		});

		await step.do('Check backup status and store it on R2', async () => {
			const payload = { current_bookmark: bookmark };

			const res = await fetch(url, {
				method,
				headers,
				body: JSON.stringify(payload),
			});
			const { result } = await res.json();

			// The endpoint sends `signed_url` when the backup is ready to download.
			// If we don't get `signed_url` we throw to retry the step.
			if (!result?.signed_url) throw new Error('Missing `signed_url`');

			const dumpResponse = await fetch(result.signed_url);
			if (!dumpResponse.ok) throw new Error('Failed to fetch dump file');

			// Finally, stream the file directly to R2
			await this.env.BACKUP_BUCKET.put(result.filename, dumpResponse.body);
		});
	}
}

export default {
	async fetch(req, env) {
		return new Response('backup d1 database');
	},

	// This scheduled function will be triggered every 5 minutes
	async scheduled(controller, env, ctx) {
		const params = {
			accountId: '8822126d2aafa667c35b5849162bbb3b',
			databaseId: 'd0b07f27-00ed-426d-8ae4-692e970da855',
		};
		//
		// console.log('muuu');
		const instance = await env.BACKUP_WORKFLOW.create({ params });
		console.log(`Started workflow: ${instance.id}  `);
	},
};
