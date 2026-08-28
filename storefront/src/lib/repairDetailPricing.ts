export interface RepairDetailPriceVariant {
  quality_grade: string;
  price: number;
  is_recommended?: boolean;
}

export interface RepairDetailPricing {
  resolvedPrice: number | null;
  validVariants: RepairDetailPriceVariant[];
  source: 'variant' | 'base' | 'none';
  isQuoteOnly: boolean;
  canEmitOffer: boolean;
}

function toPositiveFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

  return typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function resolveRepairDetailPricing({
  basePrice,
  variants,
}: {
  basePrice?: unknown;
  variants?: Array<{ quality_grade: string; price: unknown; is_recommended?: boolean }>;
}): RepairDetailPricing {
  const validVariants = (variants ?? []).flatMap((variant) => {
    const price = toPositiveFiniteNumber(variant.price);

    return price === null ? [] : [{ ...variant, price }];
  });

  if (validVariants.length > 0) {
    return {
      resolvedPrice: Math.min(...validVariants.map((variant) => variant.price)),
      validVariants,
      source: 'variant',
      isQuoteOnly: false,
      canEmitOffer: true,
    };
  }

  const price = toPositiveFiniteNumber(basePrice);
  if (price !== null) {
    return {
      resolvedPrice: price,
      validVariants,
      source: 'base',
      isQuoteOnly: false,
      canEmitOffer: true,
    };
  }

  return {
    resolvedPrice: null,
    validVariants,
    source: 'none',
    isQuoteOnly: true,
    canEmitOffer: false,
  };
}
