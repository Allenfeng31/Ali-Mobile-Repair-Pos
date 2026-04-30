import { parseItem } from './inventoryUtils';

export function groupRepairsByVariant(items: any[]) {
  const grouped = new Map<string, any>();

  for (const item of items) {
    const parsed = parseItem(item);
    if (!parsed) continue;

    // Use device_model and service as grouping key
    const groupKey = `${parsed.deviceModel}-${parsed.service}`;

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        service: parsed.service,
        deviceModel: parsed.deviceModel,
        variants: [],
      });
    }

    grouped.get(groupKey).variants.push({
      quality_grade: item.quality_grade || 'Standard',
      price: item.price,
    });
  }

  return Array.from(grouped.values());
}
