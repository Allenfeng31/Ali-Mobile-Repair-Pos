import type { RepairResultDeviceCategory, RepairResultStatus } from './repair-results';

export interface RepairResultTaxonomyRepair { name: string; slug: string; relatedRepairUrl: string; }
export interface RepairResultTaxonomyModel { name: string; slug: string; repairTypes: RepairResultTaxonomyRepair[]; }
export interface RepairResultTaxonomyBrand { name: string; slug: string; models: RepairResultTaxonomyModel[]; }
export interface RepairResultTaxonomyCategory { value: RepairResultDeviceCategory; label: string; brands: RepairResultTaxonomyBrand[]; }
export interface RepairResultTaxonomy { categories: RepairResultTaxonomyCategory[]; }

export interface RepairResultFormState {
  device_category: RepairResultDeviceCategory;
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  repair_type: string;
  repair_type_slug: string;
  title: string;
  short_description: string;
  image_pair_alt_text: string;
  image_aspect_ratio: string;
  related_repair_url: string;
  featured_on_homepage: boolean;
  featured_on_repair_hub: boolean;
  featured_on_brand_hub: boolean;
  sort_order: string;
  status: RepairResultStatus;
  privacy_checked: boolean;
}

export interface GeneratedRepairResultSeo { title: string; short_description: string; image_pair_alt_text: string; }
export interface RepairResultDestinationPreview { label: 'Exact Model Page' | 'Exact Repair Page' | 'Homepage' | 'Repair Hub' | 'Brand Repair Hub'; url: string; visibility: 'Visible after publishing' | 'Active when published'; }

export function createInitialRepairResultForm(): RepairResultFormState {
  return { device_category: 'phone', brand: '', brand_slug: '', model: '', model_slug: '', repair_type: '', repair_type_slug: '', title: '', short_description: '', image_pair_alt_text: '', image_aspect_ratio: '4:3', related_repair_url: '', featured_on_homepage: false, featured_on_repair_hub: false, featured_on_brand_hub: false, sort_order: '0', status: 'draft', privacy_checked: false };
}

function getCategory(taxonomy: RepairResultTaxonomy, category: string) { return taxonomy.categories.find((candidate) => candidate.value === category) || null; }
function getBrand(taxonomy: RepairResultTaxonomy, form: Pick<RepairResultFormState, 'device_category' | 'brand_slug'>) { return getCategory(taxonomy, form.device_category)?.brands.find((candidate) => candidate.slug === form.brand_slug) || null; }
function getModel(taxonomy: RepairResultTaxonomy, form: Pick<RepairResultFormState, 'device_category' | 'brand_slug' | 'model_slug'>) { return getBrand(taxonomy, form)?.models.find((candidate) => candidate.slug === form.model_slug) || null; }
function getResolvedTaxonomy(taxonomy: RepairResultTaxonomy, form: RepairResultFormState) { const brand = getBrand(taxonomy, form); const model = getModel(taxonomy, form); const repair = model?.repairTypes.find((candidate) => candidate.slug === form.repair_type_slug) || null; return brand && model && repair ? { brand, model, repair } : null; }

export function getRepairResultTaxonomyOptions(taxonomy: RepairResultTaxonomy, form: RepairResultFormState) {
  const category = getCategory(taxonomy, form.device_category); const brand = getBrand(taxonomy, form); const model = getModel(taxonomy, form);
  return { brands: category?.brands || [], models: brand?.models || [], repairTypes: model?.repairTypes || [] };
}

export function generateRepairResultSeo(model: string, repairType: string): GeneratedRepairResultSeo {
  return { title: `${model} ${repairType} in Ringwood`, short_description: `Before and after result from a ${model} ${repairType} completed by Ali Mobile Repairs in Ringwood.`, image_pair_alt_text: `Before and after photos of a ${model} ${repairType} completed in Ringwood.` };
}

export function applyRepairResultTaxonomyChange(current: RepairResultFormState, taxonomy: RepairResultTaxonomy, field: 'device_category' | 'brand_slug' | 'model_slug' | 'repair_type_slug', value: string) {
  let form = current;
  if (field === 'device_category') {
    const category = getCategory(taxonomy, value);
    form = { ...current, device_category: category?.value || current.device_category, brand: '', brand_slug: '', model: '', model_slug: '', repair_type: '', repair_type_slug: '', related_repair_url: '' };
  } else if (field === 'brand_slug') {
    const brand = getCategory(taxonomy, current.device_category)?.brands.find((candidate) => candidate.slug === value);
    form = brand ? { ...current, brand: brand.name, brand_slug: brand.slug, model: '', model_slug: '', repair_type: '', repair_type_slug: '', related_repair_url: '' } : { ...current, brand: '', brand_slug: '', model: '', model_slug: '', repair_type: '', repair_type_slug: '', related_repair_url: '' };
  } else if (field === 'model_slug') {
    const model = getBrand(taxonomy, current)?.models.find((candidate) => candidate.slug === value);
    form = model ? { ...current, model: model.name, model_slug: model.slug, repair_type: '', repair_type_slug: '', related_repair_url: '' } : { ...current, model: '', model_slug: '', repair_type: '', repair_type_slug: '', related_repair_url: '' };
  } else {
    const brand = getBrand(taxonomy, current); const model = getModel(taxonomy, current); const repair = model?.repairTypes.find((candidate) => candidate.slug === value);
    form = brand && model && repair ? { ...current, brand: brand.name, brand_slug: brand.slug, model: model.name, model_slug: model.slug, repair_type: repair.name, repair_type_slug: repair.slug, related_repair_url: repair.relatedRepairUrl } : { ...current, repair_type: '', repair_type_slug: '', related_repair_url: '' };
  }
  const resolved = getResolvedTaxonomy(taxonomy, form);
  return { form, generatedSeo: resolved ? generateRepairResultSeo(resolved.model.name, resolved.repair.name) : null };
}

export function validateRepairResultSubmission(form: RepairResultFormState, taxonomy: RepairResultTaxonomy) {
  if (form.status === 'published' && !form.privacy_checked) return 'Privacy confirmation is required before publishing.';
  return getResolvedTaxonomy(taxonomy, form) ? null : 'Select a valid canonical repair destination before saving.';
}

export function getRepairResultDestinationPreview(form: RepairResultFormState, taxonomy: RepairResultTaxonomy): RepairResultDestinationPreview[] {
  const resolved = getResolvedTaxonomy(taxonomy, form); if (!resolved) return [];
  const visibility = form.status === 'published' ? 'Active when published' : 'Visible after publishing';
  const base = `/repairs/${form.device_category}/${resolved.brand.slug}/${resolved.model.slug}`;
  const destinations: RepairResultDestinationPreview[] = [{ label: 'Exact Model Page', url: base, visibility }, { label: 'Exact Repair Page', url: resolved.repair.relatedRepairUrl, visibility }];
  if (form.featured_on_homepage) destinations.push({ label: 'Homepage', url: '/', visibility });
  if (form.featured_on_repair_hub) destinations.push({ label: 'Repair Hub', url: `/repairs/${form.device_category}`, visibility });
  if (form.featured_on_brand_hub) destinations.push({ label: 'Brand Repair Hub', url: `/repairs/${form.device_category}/${resolved.brand.slug}`, visibility });
  return destinations;
}
