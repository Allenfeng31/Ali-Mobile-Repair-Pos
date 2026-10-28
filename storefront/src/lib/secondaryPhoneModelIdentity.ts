export const SECONDARY_PHONE_BRAND_NAMES: Readonly<Record<string, string>> = Object.freeze({
  xiaomi: 'Xiaomi',
  nokia: 'Nokia',
  vivo: 'Vivo',
  lg: 'LG',
  oneplus: 'OnePlus',
  huawei: 'Huawei',
  htc: 'HTC',
  sony: 'Sony',
  telstra: 'Telstra',
  motorola: 'Motorola',
  microsoft: 'Microsoft',
  realme: 'Realme',
  asus: 'ASUS',
  tcl: 'TCL',
  nothing: 'Nothing',
});

export const BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS = [
  'xiaomi',
  'nokia',
  'vivo',
  'lg',
  'oneplus',
] as const;

export const BATCH_TWO_SECONDARY_PHONE_BRAND_SLUGS = [
  'huawei',
  'htc',
  'sony',
  'telstra',
  'motorola',
] as const;

export const EVIDENCE_QUALIFIED_SECONDARY_PHONE_BRAND_SLUGS = [
  ...BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS,
  ...BATCH_TWO_SECONDARY_PHONE_BRAND_SLUGS,
] as const;

const batchOneSecondaryPhoneBrands = new Set<string>(BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS);
const evidenceQualifiedSecondaryPhoneBrands = new Set<string>(EVIDENCE_QUALIFIED_SECONDARY_PHONE_BRAND_SLUGS);

const VERIFIED_TELSTRA_MANUFACTURER_IDENTIFIERS: Readonly<Record<string, string>> = Object.freeze({
  'essential-pro': 'ZTE A5 2019T',
  'tough-max-3': 'ZTE T86',
});

const UNVERIFIED_TELSTRA_MODEL_CODE_SLUGS = new Set([
  't-smart',
  'evoke-pro-2',
  'essential-smart-21',
]);

export function isBatchOneSecondaryPhoneBrand(brandSlug: string): boolean {
  return batchOneSecondaryPhoneBrands.has(brandSlug.toLowerCase());
}

export function isEvidenceQualifiedSecondaryPhoneBrand(brandSlug: string): boolean {
  return evidenceQualifiedSecondaryPhoneBrands.has(brandSlug.toLowerCase());
}

export function getSecondaryPhoneModelIdentity({
  categorySlug,
  brandSlug,
  modelName,
}: {
  categorySlug: string;
  brandSlug: string;
  modelName: string;
}): string {
  if (categorySlug !== 'phone') return modelName;

  const brandName = SECONDARY_PHONE_BRAND_NAMES[brandSlug.toLowerCase()];
  if (!brandName) return modelName;

  const normalizedModel = modelName.trim().toLowerCase();
  const normalizedBrand = brandName.toLowerCase();
  const suffixAfterBrand = normalizedModel.startsWith(normalizedBrand)
    ? normalizedModel.slice(normalizedBrand.length)
    : null;
  if (suffixAfterBrand !== null && (suffixAfterBrand === '' || /^[\s\-–—(/]/.test(suffixAfterBrand))) {
    return modelName;
  }

  return `${brandName} ${modelName}`;
}

export function getSecondaryPhonePublicModelCode({
  categorySlug,
  brandSlug,
  modelSlug,
  modelCode,
}: {
  categorySlug: string;
  brandSlug: string;
  modelSlug: string;
  modelCode?: string;
}): string | undefined {
  const normalizedCode = modelCode?.trim() || undefined;
  if (categorySlug !== 'phone' || brandSlug.toLowerCase() !== 'telstra') return normalizedCode;

  const normalizedModelSlug = modelSlug.toLowerCase();
  const verifiedIdentifier = VERIFIED_TELSTRA_MANUFACTURER_IDENTIFIERS[normalizedModelSlug];
  if (verifiedIdentifier) return verifiedIdentifier;
  if (UNVERIFIED_TELSTRA_MODEL_CODE_SLUGS.has(normalizedModelSlug)) return undefined;
  return normalizedCode;
}

export function getSecondaryPhoneMetadataIdentity({
  categorySlug,
  brandSlug,
  modelSlug,
  modelName,
}: {
  categorySlug: string;
  brandSlug: string;
  modelSlug: string;
  modelName: string;
}): string {
  const commercialIdentity = getSecondaryPhoneModelIdentity({ categorySlug, brandSlug, modelName });
  const manufacturerIdentifier = getSecondaryPhoneManufacturerIdentifier({ categorySlug, brandSlug, modelSlug });
  return manufacturerIdentifier ? `${commercialIdentity} (${manufacturerIdentifier})` : commercialIdentity;
}

export function getSecondaryPhoneManufacturerIdentifier({
  categorySlug,
  brandSlug,
  modelSlug,
}: {
  categorySlug: string;
  brandSlug: string;
  modelSlug: string;
}): string | undefined {
  if (categorySlug !== 'phone' || brandSlug.toLowerCase() !== 'telstra') return undefined;
  return VERIFIED_TELSTRA_MANUFACTURER_IDENTIFIERS[modelSlug.toLowerCase()];
}

export function applySecondaryPhoneModelCodePresentation(catalog: RepairCatalog): RepairCatalog {
  const brands = catalog.brands.map((brand) => {
    if (brand.category !== 'phone' || brand.slug !== 'telstra') return brand;
    return {
      ...brand,
      models: brand.models.map((model) => ({
        ...model,
        modelCode: getSecondaryPhonePublicModelCode({
          categorySlug: brand.category,
          brandSlug: brand.slug,
          modelSlug: model.slug,
          modelCode: model.modelCode,
        }),
      })),
    };
  });

  const retiredRepairs = catalog.retiredRepairs?.map((entry) => {
    if (entry.category !== 'phone' || entry.brandSlug !== 'telstra') return entry;
    return {
      ...entry,
      modelCode: getSecondaryPhonePublicModelCode({
        categorySlug: entry.category,
        brandSlug: entry.brandSlug,
        modelSlug: entry.modelSlug,
        modelCode: entry.modelCode,
      }),
    };
  });

  return { ...catalog, brands, ...(retiredRepairs ? { retiredRepairs } : {}) };
}
import type { RepairCatalog } from './publicRepairCataloguePolicy';
