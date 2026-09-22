import { ParsedItem, displayBrand, groupServicesByBaseName } from './inventoryUtils';
import { CAMERA_LENS_REPAIR_NAME, withGoogleCameraLensFixedPrice, withVirtualCameraLensGroupedService } from './virtualCameraLens';
import { isVirtualPhoneRepairName, withVirtualPhoneRepairGroupedServices } from './virtualPhoneRepairs';
import { APPLE_WATCH_CHARGING_REPAIR_NAME, withAppleWatchChargingRepairGroupedService } from './seo/content/apple-watch';
import type { PublicBookingSelection } from './publicBookingSelection';

export interface AutoSelectResult {
  brand: string | null;
  model: string | null;
  category: string | null;
  serviceToSelect: { id: number | string, name: string, price: number } | null;
  serviceToExpand: string | null;
  shouldAutoConfirm: boolean;
}

interface ResolveInitialCartStateOptions {
  includeVirtualServices?: boolean;
}

export function resolveInitialCartState(
  brandParam: string | null,
  modelParam: string | null,
  serviceParam: string | null,
  inventory: ParsedItem[],
  tierParam?: string | null,
  options: ResolveInitialCartStateOptions = {},
): AutoSelectResult {
  if (!brandParam || !modelParam) {
    return { brand: null, model: null, category: null, serviceToSelect: null, serviceToExpand: null, shouldAutoConfirm: false };
  }

  // Find model matches
  const decodedBrand = decodeURIComponent(brandParam).toLowerCase();
  const decodedModel = decodeURIComponent(modelParam).toLowerCase();

  const matchedItems = inventory.filter(i => {
    const itemBrand = displayBrand(i.brand).toLowerCase();
      
    const isAppleWatchBrandMatch = decodedBrand === 'apple' && itemBrand === 'apple watch';
    return (itemBrand === decodedBrand || isAppleWatchBrandMatch) && i.deviceModel.toLowerCase() === decodedModel;
  });

  if (matchedItems.length === 0) {
    return { brand: null, model: null, category: null, serviceToSelect: null, serviceToExpand: null, shouldAutoConfirm: false };
  }

  const category = matchedItems[0].deviceType;
  const brand = matchedItems[0].brand;
  const model = matchedItems[0].deviceModel;

  if (!serviceParam) {
    return { brand, model, category, serviceToSelect: null, serviceToExpand: null, shouldAutoConfirm: false };
  }

  const decodedService = decodeURIComponent(serviceParam).toLowerCase();
  
  // Public booking selections may only enrich from exact raw inventory. Legacy
  // cart entry points retain their existing virtual-service behavior.
  const groupedServices = groupServicesByBaseName(matchedItems);
  const grouped = options.includeVirtualServices === false
    ? groupedServices
    : withAppleWatchChargingRepairGroupedService(withVirtualPhoneRepairGroupedServices(
      withGoogleCameraLensFixedPrice(
        withVirtualCameraLensGroupedService(groupedServices, brand, model, category),
        brand,
      ),
      brand,
      model,
      category,
    ), brand, model, category);
  const matchedGroup = grouped.find(g => g.service.toLowerCase() === decodedService);

  if (!matchedGroup) {
    if (
      decodedService !== CAMERA_LENS_REPAIR_NAME.toLowerCase() &&
      decodedService !== APPLE_WATCH_CHARGING_REPAIR_NAME.toLowerCase() &&
      !isVirtualPhoneRepairName(decodeURIComponent(serviceParam))
    ) {
      return { brand, model, category, serviceToSelect: null, serviceToExpand: null, shouldAutoConfirm: false };
    }
    return { brand, model, category, serviceToSelect: null, serviceToExpand: decodeURIComponent(serviceParam), shouldAutoConfirm: false };
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

/**
 * Public shared-page selection is authoritative for eligibility. Inventory is
 * used only to enrich that approved identity with a current service record.
 */
export function resolvePublicBookingCartState(
  selection: PublicBookingSelection,
  inventory: ParsedItem[],
  tierParam?: string | null,
): AutoSelectResult {
  if (selection.priceAuthority === 'fixed-camera-lens') {
    return {
      brand: selection.brand,
      model: selection.model,
      category: selection.category,
      serviceToSelect: {
        id: `public-booking:${selection.category}:${selection.brandSlug}:${selection.modelSlug}:${selection.serviceSlug}`,
        name: selection.service,
        price: 50,
      },
      serviceToExpand: null,
      shouldAutoConfirm: true,
    };
  }

  const rawResult = resolveInitialCartState(
    selection.brand,
    selection.model,
    selection.service,
    inventory,
    tierParam,
    { includeVirtualServices: false },
  );

  if (rawResult.serviceToExpand || (rawResult.serviceToSelect?.price ?? 0) > 0) {
    return rawResult;
  }

  const rawModelAndServiceExist = Boolean(rawResult.brand && rawResult.model && rawResult.serviceToSelect);
  const trustedPublicPrice = (
    selection.priceAuthority === 'exact-pos' || selection.priceAuthority === 'exact-pos-variant'
  ) && rawModelAndServiceExist
    ? selection.price
    : 0;

  return {
    brand: selection.brand,
    model: selection.model,
    category: selection.category,
    serviceToSelect: {
      id: `public-booking:${selection.category}:${selection.brandSlug}:${selection.modelSlug}:${selection.serviceSlug}`,
      name: selection.service,
      price: trustedPublicPrice,
    },
    serviceToExpand: null,
    shouldAutoConfirm: true,
  };
}
