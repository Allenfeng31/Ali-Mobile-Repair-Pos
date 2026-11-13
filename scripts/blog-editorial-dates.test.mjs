import { after, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, copyFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const script = new URL('./blog-editorial-dates.mjs', import.meta.url).pathname;
const root = mkdtempSync(path.join(tmpdir(), 'blog-dates-'));
after(() => rmSync(root, { recursive: true, force: true }));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
const file = (slug) => `storefront/src/content/blog/${slug}.md`;
const write = (name, value) => {
  mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
  writeFileSync(path.join(root, name), value);
};
const read = (name) => readFileSync(path.join(root, name), 'utf8');
const run = (instant) => execFileSync('node', [script], {
  cwd: root, env: { ...process.env, BLOG_DATE_NOW: instant }, encoding: 'utf8',
});
const original = (slug) => `---\ntitle: '${slug}'\ndate: '2026-01-01'\nupdated_at: '2026-01-02'\n---\nOriginal\n`;

{
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  for (const slug of ['why-is-my-phone-not-charging', 'macbook-screen-repair-ringwood', 'how-much-does-samsung-galaxy-s-screen-replacement-cost-australia']) write(file(slug), original(slug));
  write('storefront/src/components/blog/MacbookScreenRepairArticle.tsx', 'export const text = "original";');
  write('storefront/src/data/samsungGalaxySScreenRepairCost.ts', 'export const price = 100;');
  write('storefront/public/images/blog/macbook-screen-repair/cover.webp', 'old');
  write('storefront/src/app/layout.tsx', 'layout');
  git('add', '.'); git('commit', '-qm', 'baseline');

  test('Markdown edit updates only its article; repeated runs and unstaged edits are safe', () => {
    const target = file('why-is-my-phone-not-charging');
    write(target, original('why-is-my-phone-not-charging').replace('Original', 'Staged text'));
    git('add', target);
    write(target, read(target).replace('Staged text', 'Unstaged text'));
    run('2026-10-03T15:30:00Z'); // Melbourne: 4 October, after DST starts.
    assert.match(git('show', `:${target}`), /updated_at: '2026-10-04'/);
    assert.match(git('show', `:${target}`), /Staged text/);
    assert.match(read(target), /Unstaged text/);
    assert.equal(read(file('macbook-screen-repair-ringwood')), original('macbook-screen-repair-ringwood'));
    assert.equal(run('2026-10-04T15:30:00Z'), '');
    assert.match(git('show', `:${target}`), /date: '2026-01-01'/);
    git('commit', '-qm', 'article edit');
  });

  test('component, cover, Samsung price and unrelated changes map to only affected articles', () => {
    write('storefront/src/components/blog/MacbookScreenRepairArticle.tsx', 'export const text = "edited";');
    write('storefront/public/images/blog/macbook-screen-repair/cover.webp', 'new');
    write('storefront/src/data/samsungGalaxySScreenRepairCost.ts', 'export const price = 110;');
    write('storefront/src/app/layout.tsx', 'new layout');
    git('add', 'storefront/src/components/blog/MacbookScreenRepairArticle.tsx', 'storefront/public/images/blog/macbook-screen-repair/cover.webp', 'storefront/src/data/samsungGalaxySScreenRepairCost.ts', 'storefront/src/app/layout.tsx');
    // The image must be referenced by the article to affect its date.
    write(file('macbook-screen-repair-ringwood'), original('macbook-screen-repair-ringwood').replace('Original', '/images/blog/macbook-screen-repair/cover.webp'));
    git('add', file('macbook-screen-repair-ringwood'));
    run('2026-04-04T13:30:00Z'); // Melbourne: 5 April, before DST ends.
    assert.match(git('show', `:${file('macbook-screen-repair-ringwood')}`), /updated_at: '2026-04-05'/);
    assert.match(git('show', `:${file('how-much-does-samsung-galaxy-s-screen-replacement-cost-australia')}`), /updated_at: '2026-04-05'/);
    assert.match(git('show', `:${file('why-is-my-phone-not-charging')}`), /updated_at: '2026-10-04'/);
  });

  test('the actual pre-commit hook stamps an article edit at commit time', () => {
    git('commit', '-qm', 'previous edits');
    mkdirSync(path.join(root, '.githooks'));
    mkdirSync(path.join(root, 'scripts'), { recursive: true });
    copyFileSync(new URL('../.githooks/pre-commit', import.meta.url), path.join(root, '.githooks/pre-commit'));
    copyFileSync(script, path.join(root, 'scripts/blog-editorial-dates.mjs'));
    chmodSync(path.join(root, '.githooks/pre-commit'), 0o755);
    git('config', 'core.hooksPath', '.githooks');
    const target = file('why-is-my-phone-not-charging');
    write(target, read(target).replace('Unstaged text', 'A new actual edit'));
    git('add', target);
    const base = git('rev-parse', 'HEAD').trim();
    execFileSync('git', ['commit', '-qm', 'article edit through hook'], {
      cwd: root, env: { ...process.env, BLOG_DATE_NOW: '2026-11-13T01:30:00Z' },
    });
    assert.match(git('show', `HEAD:${target}`), /updated_at: '2026-11-13'/);
    assert.match(git('show', `HEAD:${target}`), /A new actual edit/);
    execFileSync('node', [script, '--check', '--base', base], { cwd: root });
  });
}
