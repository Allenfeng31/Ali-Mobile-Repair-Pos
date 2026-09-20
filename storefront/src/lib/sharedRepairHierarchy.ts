import {
  groupSharedRepairModelsBySeries,
} from './sharedRepairModelSeries';

export interface SharedRepairHierarchyModel {
  brandSlug: string;
  brandLabel: string;
  modelSlug: string;
  modelLabel: string;
  repairLabel: string;
  bookingHref: string;
  priceLabel: string | null;
}

export interface SharedRepairHierarchySeries {
  seriesKey: string;
  seriesLabel: string;
  models: SharedRepairHierarchyModel[];
  initiallyExpanded: boolean;
  initiallyExpandedModelList: boolean;
}

export interface SharedRepairHierarchyBrand {
  brandSlug: string;
  brandLabel: string;
  modelCount: number;
  models: SharedRepairHierarchyModel[];
  series: SharedRepairHierarchySeries[];
  initiallyExpanded: boolean;
  initiallyExpandedModelList: boolean;
}

export interface SharedRepairHierarchy {
  brands: SharedRepairHierarchyBrand[];
}

export interface BuildSharedRepairHierarchyOptions {
  selectedBrandSlug?: string | null;
  selectedModelSlug?: string | null;
}

function modelListInitiallyExpanded(
  models: readonly SharedRepairHierarchyModel[],
  selectedModelSlug: string | null | undefined,
) {
  const selectedIndex = selectedModelSlug
    ? models.findIndex((model) => model.modelSlug === selectedModelSlug)
    : -1;
  return selectedIndex >= 5;
}

function hasSelectedModel(
  models: readonly SharedRepairHierarchyModel[],
  selectedModelSlug: string | null | undefined,
) {
  return Boolean(selectedModelSlug && models.some((model) => model.modelSlug === selectedModelSlug));
}

function buildSeries(
  brandSlug: string,
  models: SharedRepairHierarchyModel[],
  selectedModelSlug: string | null | undefined,
): SharedRepairHierarchySeries[] {
  const groups = groupSharedRepairModelsBySeries(brandSlug, models.map((model) => ({
    ...model,
    model: model.modelLabel,
  })));

  if (!groups) return [];

  return groups.map((group) => ({
    seriesKey: group.seriesKey,
    seriesLabel: group.seriesLabel,
    models: group.models,
    initiallyExpanded: hasSelectedModel(group.models, selectedModelSlug),
    initiallyExpandedModelList: modelListInitiallyExpanded(group.models, selectedModelSlug),
  }));
}

export function buildSharedRepairHierarchy(
  models: readonly SharedRepairHierarchyModel[],
  options: BuildSharedRepairHierarchyOptions = {},
): SharedRepairHierarchy {
  const modelsByBrand = new Map<string, SharedRepairHierarchyModel[]>();
  const labelsByBrand = new Map<string, string>();

  for (const model of models) {
    const brandModels = modelsByBrand.get(model.brandSlug) ?? [];
    brandModels.push(model);
    modelsByBrand.set(model.brandSlug, brandModels);
    if (!labelsByBrand.has(model.brandSlug)) labelsByBrand.set(model.brandSlug, model.brandLabel);
  }

  return {
    brands: Array.from(modelsByBrand, ([brandSlug, brandModels]) => {
      const series = buildSeries(brandSlug, brandModels, options.selectedModelSlug);
      const ownsSelectedModel = hasSelectedModel(brandModels, options.selectedModelSlug);
      return {
        brandSlug,
        brandLabel: labelsByBrand.get(brandSlug) ?? brandSlug,
        modelCount: brandModels.length,
        models: series.length > 0 ? [] : brandModels,
        series,
        initiallyExpanded: brandSlug === options.selectedBrandSlug || ownsSelectedModel,
        initiallyExpandedModelList: series.length === 0
          ? modelListInitiallyExpanded(brandModels, options.selectedModelSlug)
          : false,
      };
    }),
  };
}
