import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve(__dirname, 'page.tsx'), 'utf8');

describe('Repair Detail page route export contract', () => {
  it('exports only Next.js route conventions and keeps the loader private', () => {
    expect(source).not.toMatch(/export\s+(?:async\s+)?function\s+fetchRepairPageData/);
    expect(source.match(/^export .*$/gm)).toEqual([
      'export const revalidate = 86400;',
      'export async function generateStaticParams() {',
      'export async function generateMetadata({ params }: RepairPageProps) {',
      'export default async function RepairServicePage({ params }: RepairPageProps) {',
    ]);
  });
});
