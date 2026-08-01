export interface TerminalSearchItem {
  name?: string;
  model?: string;
  device_model?: string;
  brand?: string;
  sku?: string;
  category?: string;
}

export function matchesTerminalSearch(item: TerminalSearchItem, query: string): boolean {
  const terms = query.toLowerCase().split(' ').filter(Boolean);
  return terms.length === 0 || terms.every((term) =>
    (item.name || '').toLowerCase().includes(term) ||
    (item.model || '').toLowerCase().includes(term) ||
    (item.device_model || '').toLowerCase().includes(term) ||
    (item.brand || '').toLowerCase().includes(term) ||
    (item.sku || '').toLowerCase().includes(term) ||
    (item.category || '').toLowerCase().includes(term),
  );
}

export function terminalCategoryOptions(categories: readonly string[]): string[] {
  return [
    '⭐ Quick Access',
    'All Items',
    ...categories.filter((category) => !/accessor/i.test(category)),
    'Accessories',
  ];
}
