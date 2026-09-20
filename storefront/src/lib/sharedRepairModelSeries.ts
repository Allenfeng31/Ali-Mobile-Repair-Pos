import { getOppoModelConfig } from './seo/content/oppo/shared';

export interface SharedRepairSeriesModel {
  model: string;
  modelSlug: string;
}

export interface SharedRepairSeriesClassification {
  key: string;
  label: string;
}

export interface SharedRepairModelSeriesGroup<T> {
  seriesKey: string;
  seriesLabel: string;
  models: T[];
}

const SERIES: Record<string, readonly SharedRepairSeriesClassification[]> = {
  samsung: [
    { key: 's', label: 'Galaxy S Series' },
    { key: 'a', label: 'Galaxy A Series' },
    { key: 'z', label: 'Galaxy Z Series' },
    { key: 'note', label: 'Galaxy Note Series' },
    { key: 'other', label: 'Other Samsung Models' },
  ],
  oppo: [
    { key: 'find', label: 'Find Series' },
    { key: 'reno', label: 'Reno Series' },
    { key: 'a', label: 'A Series' },
    { key: 'other', label: 'Other OPPO Models' },
  ],
  huawei: [
    { key: 'mate', label: 'Mate Series' },
    { key: 'p', label: 'P Series' },
    { key: 'nova', label: 'Nova Series' },
    { key: 'y', label: 'Y Series' },
    { key: 'other', label: 'Other Huawei Models' },
  ],
  xiaomi: [
    { key: 'redmi', label: 'Redmi Series' },
    { key: 'poco', label: 'POCO Series' },
    { key: 'xiaomi', label: 'Xiaomi / Mi Series' },
    { key: 'other', label: 'Other Xiaomi Models' },
  ],
};

function normalizedBrandSlug(brandSlug: string) {
  return brandSlug.toLowerCase();
}

function modelText(model: SharedRepairSeriesModel) {
  return {
    name: model.model.toLowerCase(),
    slug: model.modelSlug.toLowerCase(),
  };
}

function classificationFor(brandSlug: string, key: string) {
  return SERIES[brandSlug]?.find((classification) => classification.key === key) ?? null;
}

function classifySamsung(model: SharedRepairSeriesModel) {
  const { name, slug } = modelText(model);

  if (slug.startsWith('galaxy-s') || name.includes('galaxy s')) return 's';
  if (slug.startsWith('galaxy-a') || name.includes('galaxy a')) return 'a';
  if (slug.startsWith('galaxy-z') || name.includes('galaxy z') || name.includes('fold') || name.includes('flip')) return 'z';
  if (slug.startsWith('galaxy-note') || name.includes('galaxy note') || name.includes('note')) return 'note';
  return 'other';
}

function classifyOppo(model: SharedRepairSeriesModel) {
  const configuredSeries = getOppoModelConfig(model.modelSlug)?.series;
  if (configuredSeries === 'Find Series') return 'find';
  if (configuredSeries === 'Reno Series') return 'reno';
  if (configuredSeries === 'A Series') return 'a';

  const { name, slug } = modelText(model);
  if (name.includes('find') || slug.includes('find')) return 'find';
  if (name.includes('reno') || slug.includes('reno')) return 'reno';
  if (/^a\d+/i.test(name) || /\ba\d+\b/i.test(name) || /^a\d+/i.test(slug) || /-a\d+/i.test(slug)) return 'a';
  return 'other';
}

function classifyHuawei(model: SharedRepairSeriesModel) {
  const { name } = modelText(model);
  if (name.includes('mate')) return 'mate';
  if (/p\d+/.test(name) || /\bp\s*(pro|plus|lite|smart)\b/.test(name)) return 'p';
  if (name.includes('nova')) return 'nova';
  if (/\by\d+/.test(name)) return 'y';
  return 'other';
}

function classifyXiaomi(model: SharedRepairSeriesModel) {
  const { name, slug } = modelText(model);
  if (name.includes('redmi') || slug.startsWith('redmi-') || slug.includes('-redmi-')) return 'redmi';
  if (name.includes('poco') || slug.startsWith('poco-') || slug.includes('-poco-')) return 'poco';
  if (name.includes('xiaomi') || /^mi\s/.test(name) || slug.startsWith('xiaomi-') || slug.startsWith('mi-')) return 'xiaomi';
  return 'other';
}

export function supportsSharedRepairSeriesGrouping(brandSlug: string) {
  return Object.hasOwn(SERIES, normalizedBrandSlug(brandSlug));
}

export function classifySharedRepairModelSeries(
  brandSlug: string,
  model: SharedRepairSeriesModel,
): SharedRepairSeriesClassification | null {
  const normalizedBrand = normalizedBrandSlug(brandSlug);
  let key: string;

  switch (normalizedBrand) {
    case 'samsung':
      key = classifySamsung(model);
      break;
    case 'oppo':
      key = classifyOppo(model);
      break;
    case 'huawei':
      key = classifyHuawei(model);
      break;
    case 'xiaomi':
      key = classifyXiaomi(model);
      break;
    default:
      return null;
  }

  return classificationFor(normalizedBrand, key);
}

export function groupSharedRepairModelsBySeries<T extends SharedRepairSeriesModel>(
  brandSlug: string,
  models: readonly T[],
): SharedRepairModelSeriesGroup<T>[] | null {
  const normalizedBrand = normalizedBrandSlug(brandSlug);
  const series = SERIES[normalizedBrand];
  if (!series) return null;

  const modelsBySeries = new Map<string, T[]>();
  for (const model of models) {
    const classification = classifySharedRepairModelSeries(normalizedBrand, model);
    if (!classification) return null;
    const group = modelsBySeries.get(classification.key) ?? [];
    group.push(model);
    modelsBySeries.set(classification.key, group);
  }

  return series.flatMap((classification) => {
    const groupedModels = modelsBySeries.get(classification.key);
    return groupedModels && groupedModels.length > 0
      ? [{ seriesKey: classification.key, seriesLabel: classification.label, models: groupedModels }]
      : [];
  });
}
