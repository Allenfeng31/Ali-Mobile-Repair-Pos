import { ParsedItem, groupServicesByBaseName } from './inventoryUtils';

export interface AutoSelectResult {
  brand: string | null;
  model: string | null;
  category: string | null;
  serviceToSelect: { id: number, name: string, price: number } | null;
  shouldAutoConfirm: boolean;
}

export function resolveInitialCartState(
  brandParam: string | null,
  modelParam: string | null,
  serviceParam: string | null,
  inventory: ParsedItem[]
): AutoSelectResult {
  if (!brandParam || !modelParam) {
    return { brand: null, model: null, category: null, serviceToSelect: null, shouldAutoConfirm: false };
  }

  // Find model matches
  const decodedBrand = decodeURIComponent(brandParam).toLowerCase();
  const decodedModel = decodeURIComponent(modelParam).toLowerCase();

  const matchedItems = inventory.filter(i => 
    i.brand.toLowerCase() === decodedBrand && 
    i.deviceModel.toLowerCase() === decodedModel
  );

  if (matchedItems.length === 0) {
    return { brand: null, model: null, category: null, serviceToSelect: null, shouldAutoConfirm: false };
  }

  const category = matchedItems[0].category;
  const brand = matchedItems[0].brand;
  const model = matchedItems[0].deviceModel;

  if (!serviceParam) {
    return { brand, model, category, serviceToSelect: null, shouldAutoConfirm: false };
  }

  const decodedService = decodeURIComponent(serviceParam).toLowerCase();
  
  // Group services
  const grouped = groupServicesByBaseName(matchedItems);
  const matchedGroup = grouped.find(g => g.service.toLowerCase() === decodedService);

  if (!matchedGroup) {
    return { brand, model, category, serviceToSelect: null, shouldAutoConfirm: false };
  }

  // Check variants
  const hasMultipleVariants = matchedGroup.variants.length > 1;
  const defaultVariant = matchedGroup.variants.find(v => v.quality_grade === 'Standard') || matchedGroup.variants[0];
  
  const serviceToSelect = {
    id: defaultVariant.id,
    name: hasMultipleVariants ? `${matchedGroup.service} - ${defaultVariant.quality_grade}` : matchedGroup.service,
    price: defaultVariant.price
  };

  return {
    brand,
    model,
    category,
    serviceToSelect,
    shouldAutoConfirm: !hasMultipleVariants
  };
}
