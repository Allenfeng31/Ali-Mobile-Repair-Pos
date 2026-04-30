export interface BaseInventoryData {
  name: string;
  model: string;
  device_model?: string;
  category: string;
  is_pinned?: boolean;
  pin_order?: number;
  iconName: string;
}

export interface InventoryVariant {
  quality_grade: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
}

export function transformFormDataToInventoryRows(
  baseData: BaseInventoryData,
  variants: InventoryVariant[]
) {
  return variants.map(variant => {
    const margin = variant.costPrice > 0 
      ? Math.round(((variant.price - variant.costPrice) / variant.price) * 100) 
      : 0;
      
    const status = variant.stock <= variant.minStock ? 'low-stock' : 'in-stock';

    return {
      ...baseData,
      quality_grade: variant.quality_grade,
      price: variant.price,
      costPrice: variant.costPrice,
      stock: variant.stock,
      minStock: variant.minStock,
      margin,
      status
    };
  });
}
