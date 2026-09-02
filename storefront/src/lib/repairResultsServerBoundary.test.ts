import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('repair results server module boundary', () => {
  it('keeps the server fetcher behind server-only and out of client components', () => {
    const sharedModule = source('src/lib/repair-results.ts');
    const serverModule = source('src/lib/repair-results.server.ts');
    const clientModules = [
      'src/components/repair-results/BeforeAfterSlider.tsx',
      'src/components/repair-results/HubRepairResultsSection.tsx',
      'src/components/repair-results/RealRepairResultsSection.tsx',
      'src/components/repair-results/RepairResultsMatchingSection.tsx',
      'src/components/repair-results/RepairTypeRepairResultsSection.tsx',
    ];

    expect(serverModule.startsWith("import 'server-only';")).toBe(true);
    expect(serverModule).toContain("from './repair-results'");
    expect(sharedModule).not.toContain('repair-results.server');

    for (const clientModule of clientModules) {
      const contents = source(clientModule);
      expect(contents).toContain('"use client"');
      expect(contents).not.toContain('repair-results.server');
    }
  });
});
