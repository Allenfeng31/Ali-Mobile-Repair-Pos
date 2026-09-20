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
  brandSlug: string,
  models: readonly SharedRepairHierarchyModel[],
  selectedBrandSlug: string | null | undefined,
  selectedModelSlug: string | null | undefined,
) {
  const selectedIndex = selectedBrandSlug === brandSlug && selectedModelSlug
    ? models.findIndex((model) => model.modelSlug === selectedModelSlug)
    : -1;
  return selectedIndex >= 5;
}

function hasSelectedModel(
  brandSlug: string,
  models: readonly SharedRepairHierarchyModel[],
  selectedBrandSlug: string | null | undefined,
  selectedModelSlug: string | null | undefined,
) {
  return Boolean(
    selectedBrandSlug === brandSlug
      && selectedModelSlug
      && models.some((model) => model.modelSlug === selectedModelSlug),
  );
}

function buildSeries(
  brandSlug: string,
  models: SharedRepairHierarchyModel[],
  selectedBrandSlug: string | null | undefined,
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
    initiallyExpanded: hasSelectedModel(brandSlug, group.models, selectedBrandSlug, selectedModelSlug),
    initiallyExpandedModelList: modelListInitiallyExpanded(brandSlug, group.models, selectedBrandSlug, selectedModelSlug),
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
      const series = buildSeries(brandSlug, brandModels, options.selectedBrandSlug, options.selectedModelSlug);
      const ownsSelectedModel = hasSelectedModel(brandSlug, brandModels, options.selectedBrandSlug, options.selectedModelSlug);
      return {
        brandSlug,
        brandLabel: labelsByBrand.get(brandSlug) ?? brandSlug,
        modelCount: brandModels.length,
        models: series.length > 0 ? [] : brandModels,
        series,
        initiallyExpanded: brandSlug === options.selectedBrandSlug || ownsSelectedModel,
        initiallyExpandedModelList: series.length === 0
          ? modelListInitiallyExpanded(brandSlug, brandModels, options.selectedBrandSlug, options.selectedModelSlug)
          : false,
      };
    }),
  };
}
