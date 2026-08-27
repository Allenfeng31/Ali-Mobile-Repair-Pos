import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'vercel.json'), 'utf8'));

describe('catalogue outbox Vercel cron configuration', () => {
  it('uses the API deployment config and runs once per day', () => {
    expect(config.crons).toContainEqual({ path: '/api/internal/process-catalogue-outbox', schedule: '30 16 * * *' });
  });
});
