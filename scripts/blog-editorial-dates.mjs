import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const blog = 'storefront/src/content/blog/';
const components = new Map([
  ['IphoneBatteryHealthArticle.tsx', 'when-should-you-replace-iphone-battery'],
  ['IphoneScreenRepairCostArticle.tsx', 'how-much-does-iphone-screen-repair-cost-australia'],
  ['PhoneNotChargingArticle.tsx', 'why-is-my-phone-not-charging'],
  ['MacbookScreenRepairArticle.tsx', 'macbook-screen-repair-ringwood'],
  ['SamsungGalaxySScreenRepairCostArticle.tsx', 'how-much-does-samsung-galaxy-s-screen-replacement-cost-australia'],
]);
const samsung = 'how-much-does-samsung-galaxy-s-screen-replacement-cost-australia';
const run = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const staged = (file) => run('show', `:${file}`);
const published = (source) => source.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})/m)?.[1];
const stripDate = (source) => source.replace(/^updated_at:.*(?:\r?\n|$)/m, '');
const dateInMelbourne = (instant) => {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(instant));
  const field = (type) => parts.find((part) => part.type === type)?.value;
  return `${field('year')}-${field('month')}-${field('day')}`;
};
const changedPaths = (base) => run('diff', '--name-only', '-z', '--diff-filter=ACMR', base, '--').split('\0').filter(Boolean);
const articleFile = (slug) => `${blog}${slug}.md`;
const markdownFiles = () => run('ls-files', '-z', `${blog}*.md`).split('\0').filter(Boolean);

function affected(paths, read) {
  const slugs = new Set();
  const markdown = markdownFiles();
  const sources = markdown.map((file) => [file, read(file)]);
  for (const file of paths) {
    if (file.startsWith(blog) && file.endsWith('.md')) slugs.add(path.basename(file, '.md'));
    const component = file.match(/^storefront\/src\/components\/blog\/([^/]+)$/)?.[1];
    if (components.has(component)) slugs.add(components.get(component));
    if (file === 'storefront/src/data/samsungGalaxySScreenRepairCost.ts') slugs.add(samsung);
    if (file.startsWith('storefront/public/images/blog/')) {
      const url = file.slice('storefront/public'.length);
      for (const [md, contents] of sources) if (contents.includes(url)) slugs.add(path.basename(md, '.md'));
      for (const [name, slug] of components) {
        const componentFile = `storefront/src/components/blog/${name}`;
        if (read(componentFile).includes(url)) slugs.add(slug);
      }
    }
  }
  return slugs;
}

function setDate(source, date) {
  if (!source.startsWith('---')) throw new Error('Expected YAML frontmatter');
  const replacement = `updated_at: '${date}'`;
  if (/^updated_at:.*$/m.test(source)) return source.replace(/^updated_at:.*$/m, replacement);
  return source.replace(/^(date:.*)$/m, `$1\n${replacement}`);
}

const check = process.argv.includes('--check');
const base = process.argv[process.argv.indexOf('--base') + 1];
if (check && !base) throw new Error('Use --check --base <commit>');
const paths = changedPaths(check ? base : '--cached');
const read = (file) => {
  try { return execFileSync('git', ['show', `:${file}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return existsSync(file) ? readFileSync(file, 'utf8') : ''; }
};
const slugs = affected(paths, read);
const today = dateInMelbourne(process.env.BLOG_DATE_NOW || new Date().toISOString());
for (const slug of slugs) {
  const file = articleFile(slug);
  const original = read(file);
  if (!original) throw new Error(`Missing Markdown date source: ${file}`);
  let previous = '';
  try { previous = run('show', `${check ? base : 'HEAD'}:${file}`); } catch { /* New article. */ }
  const relevant = paths.some((item) => item !== file && affected([item], read).has(slug))
    || stripDate(original) !== stripDate(previous);
  if (!relevant) continue;
  const expected = check
    ? dateInMelbourne(run('log', '-1', '--format=%cI', 'HEAD', '--', ...paths.filter((item) => affected([item], read).has(slug))).trim())
    : today;
  if (expected < published(original)) throw new Error(`${slug}: modification predates publication`);
  if (!check && previous && original.match(/^updated_at:\s*['"]?(\d{4}-\d{2}-\d{2})/m)?.[1]
      !== previous.match(/^updated_at:\s*['"]?(\d{4}-\d{2}-\d{2})/m)?.[1]) continue;
  const updated = setDate(original, expected);
  if (check) {
    if (original !== updated) throw new Error(`${slug}: expected updated_at ${expected}`);
    continue;
  }
  if (updated === original) continue;
  const mode = run('ls-files', '-s', '--', file).split(' ')[0] || '100644';
  const hashed = spawnSync('git', ['hash-object', '-w', '--stdin'], { input: updated, encoding: 'utf8' });
  if (hashed.status !== 0) throw new Error(hashed.stderr);
  run('update-index', '--cacheinfo', `${mode},${hashed.stdout.trim()},${file}`);
  // Keep unstaged edits intact; only change their frontmatter date.
  const working = readFileSync(file, 'utf8');
  if (working !== setDate(working, expected)) writeFileSync(file, setDate(working, expected));
  process.stdout.write(`${slug}: ${expected}\n`);
}
