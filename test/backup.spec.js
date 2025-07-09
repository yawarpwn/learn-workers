import { describe, it, expect, vi } from 'vitest';
import worker from '../src/backup';

describe('scheduled', () => {
	it('should backup the database', async () => {
		const env = {
			DB: {
				dump: vi.fn().mockResolvedValue('database dump'),
			},
			BACKUP_BUCKET: {
				put: vi.fn(),
			},
		};

		await worker.scheduled(null, env, null);

		expect(env.DB.dump).toHaveBeenCalledOnce();
		expect(env.BACKUP_BUCKET.put).toHaveBeenCalledOnce();
	});
});
