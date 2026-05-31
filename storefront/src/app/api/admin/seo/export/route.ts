import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

const SUPABASE_SYSTEM_ROLES = ['authenticated', 'anon', 'service_role'];

type AdminSessionUser = {
  role?: string;
  app_metadata?: Record<string, unknown>;
};

type SeoKeywordInventoryRecord = {
  id: string;
  keyword: string;
  source?: string | null;
  status?: string | null;
  search_weight?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type InventorySectionKey = 'phones' | 'computers' | 'watches' | 'tablets' | 'generic';

type InventoryBuckets = Record<string, SeoKeywordInventoryRecord[]>;

const SECTION_TITLES: Record<InventorySectionKey, string> = {
  phones: '手机类 Phone Repair Keywords',
  computers: '电脑类 Computer Repair Keywords',
  watches: '手表类 Smart Watch Repair Keywords',
  tablets: '平板类 Tablet Repair Keywords',
  generic: '泛意图与本地类 Generic & Local Intent',
};

const GAP_TARGETS: Record<string, string[]> = {
  'Phone Models': [
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 16',
    'iPhone 15',
    'iPhone 14',
    'iPhone 13',
    'iPhone 12',
    'iPhone 11',
    'Samsung Galaxy S24',
    'Samsung Galaxy S23',
    'Samsung Galaxy S22',
    'Google Pixel 8',
    'Google Pixel 7',
  ],
  'Computer Models': [
    'MacBook Pro M3',
    'MacBook Pro M2',
    'MacBook Air M3',
    'MacBook Air M2',
    'iMac M3',
  ],
  'Watch Models': [
    'Apple Watch Ultra',
    'Apple Watch Series 9',
    'Apple Watch Series 8',
    'Apple Watch SE',
    'Samsung Galaxy Watch',
  ],
  'Tablet Models': [
    'iPad Pro',
    'iPad Air',
    'iPad Mini',
    'iPad 10th Gen',
    'Samsung Galaxy Tab',
  ],
  'Commercial Intent': [
    'screen replacement near me',
    'battery replacement cost',
    'charging port repair ringwood',
    'phone repair shop ringwood',
    'same day repair ringwood',
  ],
};

function isSuperAdminUser(user: AdminSessionUser | undefined): boolean {
  const topLevelRole = String(user?.role || '');
  const isSystemRole = SUPABASE_SYSTEM_ROLES.includes(topLevelRole.toLowerCase());
  const trustedRole = isSystemRole ? String(user?.app_metadata?.role || '') : topLevelRole;
  return trustedRole.toLowerCase().replace(/_/g, ' ') === 'super admin';
}

function isLocalDevelopmentRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

  return process.env.NODE_ENV !== 'production' && isLocalHost;
}

async function createAdminSeoSupabase() {
  const cookieStore = await cookies();

  return createRouteHandlerClient({
    cookies: (() => cookieStore) as unknown as typeof cookies,
  });
}

async function assertCanAccessAdminSeo(
  request: Request,
  supabase: Awaited<ReturnType<typeof createAdminSeoSupabase>>
) {
  if (isLocalDevelopmentRequest(request)) {
    return true;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('[seo-export] Failed to fetch session:', error);
  }

  return Boolean(session && isSuperAdminUser(session.user));
}

function normalizeStatus(status?: string | null) {
  return (status || 'pending').trim();
}

function statusSuffix(status?: string | null) {
  const normalized = normalizeStatus(status);
  const upperStatus = normalized.toUpperCase();

  if (upperStatus === 'COMPLETED') return '[🟢 COMPLETED]';
  if (upperStatus === 'FAILED') return '[🔴 FAILED]';
  if (upperStatus === 'PROCESSING') return '[🟠 PROCESSING]';

  switch (normalized.toLowerCase()) {
    case 'approved':
      return '[🟢 APPROVED]';
    case 'queued':
      return '[🟣 QUEUED]';
    case 'blocked':
      return '[⚫ BLOCKED]';
    default:
      return '[🔵 PENDING]';
  }
}

function escapeMarkdown(value: string) {
  return value.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function includesAny(value: string, tokens: string[]) {
  return tokens.some((token) => value.includes(token));
}

function classifyKeyword(keyword: string): [InventorySectionKey, string] {
  const lower = keyword.toLowerCase();

  if (lower.includes('macbook pro')) return ['computers', 'MacBook Pro'];
  if (lower.includes('macbook air')) return ['computers', 'MacBook Air'];
  if (lower.includes('imac')) return ['computers', 'iMac'];
  if (includesAny(lower, ['macbook', 'laptop', 'computer'])) return ['computers', 'Other Computer Intent'];

  if (lower.includes('apple watch')) return ['watches', 'Apple Watch'];
  if (lower.includes('iwatch')) return ['watches', 'iWatch'];
  if (lower.includes('samsung galaxy watch')) return ['watches', 'Samsung Galaxy Watch'];
  if (lower.includes('watch')) return ['watches', 'Other Watch Intent'];

  if (lower.includes('samsung galaxy tab')) return ['tablets', 'Samsung Galaxy Tab'];
  if (lower.includes('ipad')) return ['tablets', 'iPad'];
  if (includesAny(lower, ['tablet', 'tab screen'])) return ['tablets', 'Other Tablet Intent'];

  if (lower.includes('iphone 15')) return ['phones', 'iPhone 15 Series'];
  if (lower.includes('iphone 14')) return ['phones', 'iPhone 14 Series'];
  if (lower.includes('iphone 13')) return ['phones', 'iPhone 13 Series'];
  if (lower.includes('iphone 12')) return ['phones', 'iPhone 12 Series'];
  if (lower.includes('iphone 11')) return ['phones', 'iPhone 11 Series'];
  if (lower.includes('iphone')) return ['phones', 'Other iPhone Intent'];
  if (lower.includes('samsung galaxy')) return ['phones', 'Samsung Galaxy'];
  if (lower.includes('pixel')) return ['phones', 'Google Pixel'];
  if (includesAny(lower, ['phone', 'screen replacement', 'battery replacement'])) return ['phones', 'Other Phone Intent'];

  return ['generic', 'Near Me / Cost / Shop'];
}

function createInventoryBuckets(records: SeoKeywordInventoryRecord[]) {
  const inventory: Record<InventorySectionKey, InventoryBuckets> = {
    phones: {},
    computers: {},
    watches: {},
    tablets: {},
    generic: {},
  };

  for (const record of records) {
    const [section, bucket] = classifyKeyword(record.keyword);

    if (!inventory[section][bucket]) {
      inventory[section][bucket] = [];
    }

    inventory[section][bucket].push(record);
  }

  for (const buckets of Object.values(inventory)) {
    for (const recordsInBucket of Object.values(buckets)) {
      recordsInBucket.sort((a, b) => a.keyword.localeCompare(b.keyword));
    }
  }

  return inventory;
}

function buildSectionMarkdown(title: string, buckets: InventoryBuckets) {
  const lines = [`## ${title}`, ''];
  const bucketEntries = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));

  if (!bucketEntries.length) {
    lines.push('_No keywords found in this category yet._', '');
    return lines.join('\n');
  }

  for (const [bucketName, records] of bucketEntries) {
    lines.push(`### ${bucketName} (${records.length})`, '');

    for (const record of records) {
      const weight = record.search_weight ?? 0;
      const source = record.source ? ` · source: ${escapeMarkdown(record.source)}` : '';
      lines.push(`- ${escapeMarkdown(record.keyword)} ${statusSuffix(record.status)} · weight: ${weight}${source}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

function hasMarketCoverage(model: string, keywordHaystack: string) {
  return keywordHaystack.includes(model.toLowerCase());
}

function buildGapAnalysis(records: SeoKeywordInventoryRecord[]) {
  const keywordHaystack = records.map((record) => record.keyword.toLowerCase()).join('\n');
  const lines = [
    '## 漏网蓝海型号缺口分析 (Gap Analysis)',
    '',
    '> These high-value model and commercial-intent clusters are not clearly represented in the current keyword inventory.',
    '',
  ];

  for (const [groupName, targets] of Object.entries(GAP_TARGETS)) {
    const missingTargets = targets.filter((target) => !hasMarketCoverage(target, keywordHaystack));

    lines.push(`### ${groupName}`, '');

    if (!missingTargets.length) {
      lines.push('- No obvious gaps detected.', '');
      continue;
    }

    for (const target of missingTargets) {
      lines.push(`- ${target}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

function buildInventoryMarkdown(records: SeoKeywordInventoryRecord[]) {
  const inventory = createInventoryBuckets(records);
  const generatedAt = new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Australia/Melbourne',
  }).format(new Date());
  const lines = [
    '# Ali Mobile & Repair SEO Master Inventory',
    '',
    `Generated: ${generatedAt} (Melbourne time)`,
    `Total keywords: ${records.length}`,
    '',
    buildSectionMarkdown(SECTION_TITLES.phones, inventory.phones),
    buildSectionMarkdown(SECTION_TITLES.computers, inventory.computers),
    buildSectionMarkdown(SECTION_TITLES.watches, inventory.watches),
    buildSectionMarkdown(SECTION_TITLES.tablets, inventory.tablets),
    buildSectionMarkdown(SECTION_TITLES.generic, inventory.generic),
    buildGapAnalysis(records),
  ];

  return lines.join('\n');
}

async function loadAllSeoKeywords(supabase: Awaited<ReturnType<typeof createAdminSeoSupabase>>) {
  const pageSize = 1000;
  const records: SeoKeywordInventoryRecord[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('seo_keywords')
      .select('id, keyword, source, status, search_weight, created_at, updated_at')
      .order('keyword', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const batch = (data || []) as SeoKeywordInventoryRecord[];
    records.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return records;
}

function getExportFilename() {
  return `ali-mobile-seo-master-inventory-${new Date().toISOString().slice(0, 10)}.md`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

export async function GET(request: Request) {
  try {
    const supabase = await createAdminSeoSupabase();
    const authorized = await assertCanAccessAdminSeo(request, supabase);

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await loadAllSeoKeywords(supabase);
    const markdown = buildInventoryMarkdown(records);

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${getExportFilename()}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('[seo-export] Failed to build inventory:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
