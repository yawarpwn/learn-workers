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
		const { results } = await env.DB.prepare('select * from products where id = ?').bind(1).all();

		return new Response(JSON.stringify(results), {
			headers: { 'Content-Type': 'application/json' },
		});
	},
};
