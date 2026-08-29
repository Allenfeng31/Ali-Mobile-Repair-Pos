import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { execFile as executeFile } from 'node:child_process';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';

import { checksumPublicRepairCatalogue, serializePublicRepairCatalogue } from '../src/lib/publicRepairCataloguePolicy';
import {
  MAX_INPUT_BYTES,
  readStrictLocalJsonFile,
  runLocalDryRun,
} from './reportLegacyPhoneRepairCandidates';

const directories: string[] = [];
const execFile = promisify(executeFile);

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

function currentRow() {
  const payload = serializePublicRepairCatalogue(['phone', 'tablet', 'laptop', 'watch'].map((category) => ({
    category, brand: `${category} Brand`, slug: `${category}-brand`, icon: 'icon', models: [{
      model: `${category} Model`, slug: `${category}-model`, repairTypes: [{
        slug: 'screen-replacement', name: 'Screen Replacement', price: 987654321, repairOrigin: 'pos' as const,
        variants: [{ quality_grade: 'UNIQUE-PRIVATE-VARIANT-MARKER', price: 987654321, is_recommended: true }],
      }],
    }],
  })));
  return {
    snapshot_key: 'current', schema_version: 2, payload,
    checksum: checksumPublicRepairCatalogue(payload), source: 'live-pos',
    fetched_at: '2026-08-29T00:00:00.000Z', validated_at: '2026-08-29T01:00:00.000Z',
    inventory_row_count: 4, public_model_count: 4, public_repair_count: 4,
  };
}

function previousRow(withOrigin: boolean) {
  const payload = { brands: ['phone', 'tablet', 'laptop', 'watch'].map((category) => ({
    category, brand: `${category} Brand`, slug: `${category}-brand`, icon: 'icon', models: [{
      model: `${category} Model`, slug: `${category}-model`, repairTypes: [{
        slug: 'screen-replacement', name: 'Screen Replacement', price: 123,
        ...(withOrigin ? { repairOrigin: 'pos' } : {}),
      }],
    }],
  })) };
  return {
    snapshot_key: 'current', schema_version: 1, payload,
    checksum: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), source: 'live-pos',
    fetched_at: '2026-08-29T00:00:00.000Z', validated_at: '2026-08-29T01:00:00.000Z',
    inventory_row_count: 4, public_model_count: 4, public_repair_count: 4,
  };
}

async function fixture(value: string | Uint8Array) {
  const directory = await mkdtemp(join(tmpdir(), 'ali-mobile-snapshot-test-'));
  directories.push(directory);
  const path = join(directory, 'snapshot.json');
  await writeFile(path, value);
  return { directory, path };
}

describe('reportLegacyPhoneRepairCandidates local dry run', () => {
  it('prints redacted JSON and does not write a baseline', async () => {
    const { path } = await fixture(JSON.stringify(currentRow()));
    const output = await runLocalDryRun(['--input', path, '--format', 'json']);
    const parsed = JSON.parse(output);
    expect(parsed).toMatchObject({ dryRun: true, baselineWritten: false });
    expect(output).not.toContain('"price"');
    expect(output).not.toContain('variants');
  });

  it('prints the local-only summary including validation provenance', async () => {
    const { path } = await fixture(JSON.stringify(currentRow()));
    await expect(runLocalDryRun(['--format', 'summary', '--input', path])).resolves.toContain('DRY RUN ONLY');
    await expect(runLocalDryRun(['--format', 'summary', '--input', path])).resolves.toContain('Validated at: 2026-08-29T01:00:00.000Z');
  });

  it('accepts a PostgreSQL TIMESTAMPTZ fixture and reports its canonical validated timestamp', async () => {
    const value = currentRow();
    value.fetched_at = '2026-08-29 11:00:00.123+10';
    value.validated_at = '2026-08-29 11:00:00.123+10';
    const { path } = await fixture(JSON.stringify(value));

    await expect(runLocalDryRun(['--input', path, '--format', 'summary']))
      .resolves.toContain('Validated at: 2026-08-29T01:00:00.123Z');
  });

  it.each([
    ['previous pre-Origin', previousRow(false)],
    ['previous Origin', previousRow(true)],
  ])('accepts a valid %s row using its versioned checksum contract', async (_label, row) => {
    const { path } = await fixture(JSON.stringify(row));
    await expect(runLocalDryRun(['--input', path, '--format', 'summary'])).resolves.toContain('Source snapshot schema version: 1');
  });

  it('runs with the documented repository-local npx --no-install tsx command', async () => {
    const { path } = await fixture(JSON.stringify(currentRow()));
    const { stdout, stderr } = await execFile('npx', [
      '--no-install', 'tsx', 'scripts/reportLegacyPhoneRepairCandidates.ts', '--input', path, '--format', 'summary',
    ], { cwd: process.cwd() });
    expect(stderr).toBe('');
    expect(stdout).toContain('NO BASELINE WRITTEN');
    expect(stdout).not.toContain('987654321');
    expect(stdout).not.toContain('UNIQUE-PRIVATE-VARIANT-MARKER');
  });

  it('opens once with O_NOFOLLOW, stats and reads that descriptor, and closes it on success', async () => {
    let flags = 0;
    let closed = false;
    const result = await readStrictLocalJsonFile('/absolute/fixture.json', async (_path, receivedFlags) => {
      flags = receivedFlags;
      return {
        stat: async () => ({ isFile: () => true, size: MAX_INPUT_BYTES }),
        readFile: async () => Buffer.from('{"fixture":true}'),
        close: async () => { closed = true; },
      } as never;
    });

    expect(result).toEqual({ fixture: true });
    expect(flags & constants.O_NOFOLLOW).toBe(constants.O_NOFOLLOW);
    expect(closed).toBe(true);
  });

  it('rejects non-regular files and growth beyond the size limit while closing the opened descriptor', async () => {
    let closedOnStatFailure = false;
    await expect(readStrictLocalJsonFile('/absolute/directory', async () => ({
      stat: async () => ({ isFile: () => false, size: 0 }),
      readFile: async () => Buffer.from('{}'),
      close: async () => { closedOnStatFailure = true; },
    }) as never)).rejects.toThrow('regular local JSON');
    expect(closedOnStatFailure).toBe(true);

    let closedOnGrowth = false;
    await expect(readStrictLocalJsonFile('/absolute/growing.json', async () => ({
      stat: async () => ({ isFile: () => true, size: 1 }),
      readFile: async () => new Uint8Array(MAX_INPUT_BYTES + 1),
      close: async () => { closedOnGrowth = true; },
    }) as never)).rejects.toThrow('size limit');
    expect(closedOnGrowth).toBe(true);
  });

  it.each([
    ['relative input', ['--input', 'snapshot.json', '--format', 'summary']],
    ['URL input', ['--input', 'https://example.test/snapshot.json', '--format', 'summary']],
    ['unknown flag', ['--input', '/tmp/snapshot.json', '--write', 'summary']],
    ['duplicate flag', ['--input', '/tmp/a.json', '--input', '/tmp/b.json']],
    ['no arguments', []],
  ])('rejects %s without accessing an external system', async (_label, arguments_) => {
    await expect(runLocalDryRun(arguments_)).rejects.toThrow();
  });

  it('rejects malformed JSON, duplicate keys, invalid UTF-8, directories and symlinks', async () => {
    const malformed = await fixture('{');
    const duplicate = await fixture('{"snapshot_key":"current","snapshot_key":"other"}');
    const invalidUtf8 = await fixture(new Uint8Array([0xc3, 0x28]));
    const directory = await mkdtemp(join(tmpdir(), 'ali-mobile-snapshot-test-'));
    directories.push(directory);
    const symlinkPath = join(directory, 'snapshot-link.json');
    await symlink(malformed.path, symlinkPath);

    await expect(runLocalDryRun(['--input', malformed.path, '--format', 'summary'])).rejects.toThrow();
    await expect(runLocalDryRun(['--input', duplicate.path, '--format', 'summary'])).rejects.toThrow();
    await expect(runLocalDryRun(['--input', invalidUtf8.path, '--format', 'summary'])).rejects.toThrow();
    await expect(runLocalDryRun(['--input', directory, '--format', 'summary'])).rejects.toThrow();
    await expect(runLocalDryRun(['--input', symlinkPath, '--format', 'summary'])).rejects.toThrow();
  });

  it('accepts the exact stat-size boundary and rejects oversized input before parsing', async () => {
    await expect(readStrictLocalJsonFile('/absolute/boundary.json', async () => ({
      stat: async () => ({ isFile: () => true, size: MAX_INPUT_BYTES }),
      readFile: async () => Buffer.from('{}'),
      close: async () => {},
    }) as never)).resolves.toEqual({});
    const { path } = await fixture(new Uint8Array(64 * 1024 * 1024 + 1));
    await expect(runLocalDryRun(['--input', path, '--format', 'summary'])).rejects.toThrow();
  });
});
