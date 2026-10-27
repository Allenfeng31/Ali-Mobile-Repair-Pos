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

const batchOneSecondaryPhoneBrands = new Set<string>(BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS);

export function isBatchOneSecondaryPhoneBrand(brandSlug: string): boolean {
  return batchOneSecondaryPhoneBrands.has(brandSlug.toLowerCase());
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
