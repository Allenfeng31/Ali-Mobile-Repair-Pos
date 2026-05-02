import { ParsedItem, groupServicesByBaseName } from './inventoryUtils';

export interface AutoSelectResult {
  brand: string | null;
  model: string | null;
  category: string | null;
  serviceToSelect: { id: number, name: string, price: number } | null;
  serviceToExpand: string | null;
  shouldAutoConfirm: boolean;
}

export function resolveInitialCartState(
  brandParam: string | null,
  modelParam: string | null,
  serviceParam: string | null,
  inventory: ParsedItem[],
  tierParam?: string | null
): AutoSelectResult {
  if (!brandParam || !modelParam) {
    return { brand: null, model: null, category: null, serviceToSelect: null, serviceToExpand: null, shouldAutoConfirm: false };
  }

  // Find model matches
  const decodedBrand = decodeURIComponent(brandParam).toLowerCase();
  const decodedModel = decodeURIComponent(modelParam).toLowerCase();

  const matchedItems = inventory.filter(i => {
    // Standardize brand by removing prefix for comparison
    const itemBrand = (i.brand.includes(' ') && /^[PTCW] /i.test(i.brand)) 
      ? i.brand.split(' ')[1].toLowerCase() 
      : i.brand.toLowerCase();
      
    return itemBrand === decodedBrand && i.deviceModel.toLowerCase() === decodedModel;
  });

  if (matchedItems.length === 0) {
    return { brand: null, model: null, category: null, serviceToSelect: null, serviceToExpand: null, shouldAutoConfirm: false };
  }

  const category = matchedItems[0].category;
  const brand = matchedItems[0].brand;
  const model = matchedItems[0].deviceModel;

  if (!serviceParam) {
    return { brand, model, category, serviceToSelect: null, serviceToExpand: null, shouldAutoConfirm: false };
  }

  const decodedService = decodeURIComponent(serviceParam).toLowerCase();
  
  // Group services
  const grouped = groupServicesByBaseName(matchedItems);
  const matchedGroup = grouped.find(g => g.service.toLowerCase() === decodedService);

  if (!matchedGroup) {
    return { brand, model, category, serviceToSelect: null, serviceToExpand: null, shouldAutoConfirm: false };
  }

  // Check variants
  const hasMultipleVariants = matchedGroup.variants.length > 1;

  // If a specific tier is requested, try to match it regardless of variant count
  if (tierParam) {
    const decodedTier = decodeURIComponent(tierParam).toLowerCase();
    const matchedVariant = matchedGroup.variants.find(v => v.quality_grade.toLowerCase() === decodedTier);
    if (matchedVariant) {
      return {
        brand,
        model,
        category,
        serviceToSelect: {
          id: matchedVariant.id,
          name: matchedGroup.variants.length > 1 ? `${matchedGroup.service} - ${matchedVariant.quality_grade}` : matchedGroup.service,
          price: matchedVariant.price
        },
        serviceToExpand: null,
        shouldAutoConfirm: true
      };
    }
  }

  const defaultVariant = matchedGroup.variants.find(v => v.quality_grade === 'Standard') || matchedGroup.variants[0];
  
  const serviceToSelect = hasMultipleVariants ? null : {
    id: defaultVariant.id,
    name: matchedGroup.service,
    price: defaultVariant.price
  };

  const serviceToExpand = hasMultipleVariants ? matchedGroup.service : null;

  return {
    brand,
    model,
    category,
    serviceToSelect,
    serviceToExpand,
    shouldAutoConfirm: !hasMultipleVariants
  };
}

