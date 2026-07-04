export const MACBOOK_FAMILY_ORDER = ['air', 'pro', 'macbook'] as const;

export const MACBOOK_FAMILY_LABELS: Record<string, string> = {
  air: 'MacBook Air',
  pro: 'MacBook Pro',
  macbook: 'MacBook',
};

export function getMacBookFamilyKey(modelName: string, modelSlug: string) {
  const name = modelName.toLowerCase();
  const slug = modelSlug.toLowerCase();

  if (name.includes('macbook air') || slug.startsWith('macbook-air')) return 'air';
  if (name.includes('macbook pro') || slug.startsWith('macbook-pro')) return 'pro';
  return 'macbook';
}
