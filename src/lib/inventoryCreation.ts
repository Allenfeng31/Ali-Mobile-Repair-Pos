export type RepairDeviceCategory = 'Phone' | 'Tablet' | 'Laptop' | 'Watch';

export const REPAIR_DEVICE_CATEGORIES: ReadonlyArray<{
  value: RepairDeviceCategory;
  prefix: 'P' | 'T' | 'C' | 'W';
}> = [
  { value: 'Phone', prefix: 'P' },
  { value: 'Tablet', prefix: 'T' },
  { value: 'Laptop', prefix: 'C' },
  { value: 'Watch', prefix: 'W' },
];

export interface BrandSourceItem {
  brand?: string;
  model?: string;
}

export interface RepairBrandOption {
  category: RepairDeviceCategory;
  label: string;
  value: string;
}

const prefixForCategory = (category: RepairDeviceCategory) =>
  REPAIR_DEVICE_CATEGORIES.find((item) => item.value === category)!.prefix;

const splitStoredBrand = (value: string): { prefix?: string; label: string } => {
  const trimmed = value.trim();
  const match = trimmed.match(/^([PTCW])\s+(.+)$/i);
  return match
    ? { prefix: match[1].toUpperCase(), label: match[2].trim() }
    : { label: trimmed };
};

export function repairDeviceCategoryForBrand(value: string): RepairDeviceCategory {
  const { prefix, label } = splitStoredBrand(value);
  if (prefix === 'T') return 'Tablet';
  if (prefix === 'C') return 'Laptop';
  if (prefix === 'W') return 'Watch';
  if (prefix === 'P') return 'Phone';

  if (/ipad|tablet|lenovo tab|galaxy tab/i.test(label)) return 'Tablet';
  if (/macbook|laptop|notebook/i.test(label)) return 'Laptop';
  if (/watch/i.test(label)) return 'Watch';
  return 'Phone';
}

export function toStoredRepairBrand(label: string, category: RepairDeviceCategory): string {
  const clean = splitStoredBrand(label).label;
  return `${prefixForCategory(category)} ${clean}`;
}

export function deriveRepairBrandOptions(
  configuredBrands: readonly string[],
  inventory: readonly BrandSourceItem[],
): RepairBrandOption[] {
  const sources = [
    ...configuredBrands,
    ...inventory.map((item) => item.brand || item.model?.split('||')[0] || ''),
  ];
  const seen = new Set<string>();
  const options: RepairBrandOption[] = [];

  for (const source of sources) {
    if (!source?.trim()) continue;
    const { label } = splitStoredBrand(source);
    if (!label || /^other$/i.test(label)) continue;
    const category = repairDeviceCategoryForBrand(source);
    const key = `${category}:${label.toLocaleLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ category, label, value: toStoredRepairBrand(label, category) });
  }

  return options.sort((a, b) =>
    a.category.localeCompare(b.category) || a.label.localeCompare(b.label),
  );
}

export function repairBrandOptionsForCategory(
  options: readonly RepairBrandOption[],
  category: RepairDeviceCategory,
): RepairBrandOption[] {
  return options.filter((option) => option.category === category);
}

export function isDuplicateRepairRow(
  inventory: readonly { name: string; model: string }[],
  brand: string,
  modelName: string,
  repairName: string,
): boolean {
  const expectedModel = `${brand}||${modelName.trim()}`;
  const expectedName = `${modelName.trim()} ${repairName}`;
  return inventory.some((item) => item.model === expectedModel && item.name === expectedName);
}

export function isQuotePrice(value: string | number | null | undefined): boolean {
  return value === '' || value === null || value === undefined || Number(value) === 0;
}

export function priceLabel(value: string | number | null | undefined): string {
  return isQuotePrice(value) ? 'Quote' : `$${Number(value).toFixed(2)}`;
}

export interface BulkRepairTemplate {
  label: string;
  iconName: string;
}

export interface BulkRepairSelection {
  selected: boolean;
  price: string;
  costPrice: string;
}

export function buildBulkRepairRows({
  inventory,
  brand,
  modelName,
  deviceModel,
  templates,
  selections,
}: {
  inventory: readonly { name: string; model: string }[];
  brand: string;
  modelName: string;
  deviceModel: string;
  templates: readonly BulkRepairTemplate[];
  selections: Record<string, BulkRepairSelection>;
}) {
  const rows: Array<Record<string, string | number | boolean | null>> = [];
  let duplicateCount = 0;
  const cleanModel = modelName.trim();

  for (const template of templates) {
    const selection = selections[template.label];
    if (!selection?.selected) continue;
    if (isDuplicateRepairRow(inventory, brand, cleanModel, template.label)) {
      duplicateCount += 1;
      continue;
    }

    rows.push({
      name: `${cleanModel} ${template.label}`,
      model: `${brand}||${cleanModel}`,
      device_model: deviceModel.trim() || null,
      stock: 0,
      minStock: 0,
      costPrice: Number(selection.costPrice) || 0,
      price: Number(selection.price) || 0,
      margin: 0,
      iconName: template.iconName,
      status: 'in-stock',
      category: template.label,
      is_pinned: false,
      pin_order: 0,
    });
  }

  return { rows, duplicateCount };
}
