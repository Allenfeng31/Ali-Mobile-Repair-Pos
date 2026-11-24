export interface QuickQuoteInventoryItem {
  id: string | number;
  name?: string;
  model?: string;
  device_model?: string;
  brand?: string;
  category?: string;
  sku?: string;
  quality_grade?: string;
  variant?: string;
  repair_type?: string;
  type?: string;
  price?: number;
  stock?: number;
}

export interface QuickQuoteSearchResult<T> {
  items: T[];
  usedTypoFallback: boolean;
  totalMatches: number;
}

const SEARCH_FIELDS: Array<keyof QuickQuoteInventoryItem> = [
  'brand',
  'model',
  'device_model',
  'name',
  'repair_type',
  'type',
  'category',
  'quality_grade',
  'variant',
  'sku',
];

const FIELD_WEIGHTS: Partial<Record<keyof QuickQuoteInventoryItem, number>> = {
  device_model: 90,
  model: 80,
  brand: 65,
  name: 55,
  repair_type: 55,
  type: 35,
  category: 25,
  quality_grade: 20,
  variant: 20,
  sku: 45,
};

const MODEL_MODIFIERS = ['mini', 'air', 'pro', 'max', 'plus', 'ultra', 'fusion', 'neo', 'power'];

function cleanInternalLabel(value: string) {
  return value.replace(/^[PTCW]\s+/i, '').trim();
}

export function getQuickQuoteModelLabel(item: QuickQuoteInventoryItem) {
  const rawModel = item.model?.trim() ?? '';
  const modelParts = rawModel.split('||').map((part) => part.trim()).filter(Boolean);
  const model = cleanInternalLabel(modelParts.at(-1) ?? rawModel);
  const rawBrand = item.brand?.trim() || (modelParts.length > 1 ? modelParts[0] : '');
  const brand = cleanInternalLabel(rawBrand.split('||').at(-1) ?? rawBrand);

  if (!model) return brand || 'Repair item';
  if (!brand || model.toLowerCase().startsWith(brand.toLowerCase())) return model;
  return `${brand} ${model}`;
}

function normalize(value: unknown) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function words(value: string) {
  return value.split(' ').filter(Boolean);
}

function editDistanceAtMostOne(a: string, b: string) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;

  let edits = 0;
  let aIndex = 0;
  let bIndex = 0;

  while (aIndex < a.length && bIndex < b.length) {
    if (a[aIndex] === b[bIndex]) {
      aIndex += 1;
      bIndex += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) aIndex += 1;
    else if (b.length > a.length) bIndex += 1;
    else {
      aIndex += 1;
      bIndex += 1;
    }
  }

  return edits + Number(aIndex < a.length || bIndex < b.length) <= 1;
}

function buildSearchRecord(item: QuickQuoteInventoryItem) {
  const fields = SEARCH_FIELDS.map((field) => {
    const value = normalize(item[field]);
    return { field, value, words: words(value) };
  });

  return {
    fields,
    modelWords: words(normalize(item.model)),
    combined: fields.map(({ value }) => value).filter(Boolean).join(' '),
  };
}

function getDirectTokenScore(
  fields: ReturnType<typeof buildSearchRecord>['fields'],
  token: string
) {
  let bestScore = 0;

  for (const field of fields) {
    if (!field.value) continue;
    const weight = FIELD_WEIGHTS[field.field] ?? 10;

    if (field.value === token) bestScore = Math.max(bestScore, weight + 60);
    if (field.words.includes(token)) bestScore = Math.max(bestScore, weight + 40);
    if (field.words.some((word) => word.startsWith(token))) bestScore = Math.max(bestScore, weight + 20);
  }

  return bestScore;
}

function getFuzzyTokenScore(
  fields: ReturnType<typeof buildSearchRecord>['fields'],
  token: string
) {
  if (token.length < 5) return 0;

  let bestScore = 0;
  for (const field of fields) {
    const weight = FIELD_WEIGHTS[field.field] ?? 10;
    if (field.words.some((word) => word.length >= 5 && editDistanceAtMostOne(token, word))) {
      bestScore = Math.max(bestScore, weight);
    }
  }
  return bestScore;
}

function scoreItem(item: QuickQuoteInventoryItem, queryTokens: string[], allowFuzzy: boolean) {
  const record = buildSearchRecord(item);
  let score = 0;

  for (const token of queryTokens) {
    const directScore = getDirectTokenScore(record.fields, token);
    const tokenScore = directScore || (allowFuzzy ? getFuzzyTokenScore(record.fields, token) : 0);
    if (tokenScore === 0) return null;
    score += tokenScore;
  }

  const normalizedQuery = queryTokens.join(' ');
  const normalizedModel = normalize(item.model);
  const normalizedBrandModel = normalize(`${item.brand ?? ''} ${item.model ?? ''}`);
  const normalizedName = normalize(item.name);

  if (normalizedModel === normalizedQuery || normalizedBrandModel === normalizedQuery || normalizedName === normalizedQuery) {
    score += 500;
  }
  if (normalizedBrandModel.startsWith(normalizedQuery) || `${normalizedModel} ${normalizedName}`.startsWith(normalizedQuery)) {
    score += 180;
  }

  const queryHasModelIdentifier = queryTokens.some((token) => /\d/.test(token));
  for (const modifier of MODEL_MODIFIERS) {
    if (queryHasModelIdentifier && !queryTokens.includes(modifier) && record.modelWords.includes(modifier)) score -= 15;
  }

  return score;
}

export function getQuickQuoteSearchResults<T extends QuickQuoteInventoryItem>(
  items: T[],
  query: string,
  limit = 40
): QuickQuoteSearchResult<T> {
  const queryTokens = words(normalize(query));
  if (queryTokens.length === 0) return { items: [], usedTypoFallback: false, totalMatches: 0 };

  const rank = (allowFuzzy: boolean) => items
    .map((item, index) => ({ item, index, score: scoreItem(item, queryTokens, allowFuzzy) }))
    .filter((candidate): candidate is { item: T; index: number; score: number } => candidate.score !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  let ranked = rank(false);
  const usedTypoFallback = ranked.length === 0;
  if (usedTypoFallback) ranked = rank(true);

  return {
    items: ranked.slice(0, limit).map(({ item }) => item),
    usedTypoFallback,
    totalMatches: ranked.length,
  };
}

export function searchQuickQuoteItems<T extends QuickQuoteInventoryItem>(items: T[], query: string, limit = 40) {
  return getQuickQuoteSearchResults(items, query, limit).items;
}
