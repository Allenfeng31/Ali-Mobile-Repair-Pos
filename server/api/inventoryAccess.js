const PAGE_SIZE = 1000;

const PUBLIC_INVENTORY_SELECT = [
  'id',
  'name',
  'model',
  'device_model',
  'price',
  'category',
  'quality_grade',
  'is_recommended',
  'status',
].join(', ');

const NON_PUBLIC_STATUSES = new Set(['archived', 'hidden', 'inactive', 'unpublished']);

async function readAllInventory(supabase, columns) {
  const rows = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('inventory')
      .select(columns)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const page = Array.isArray(data) ? data : [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  return rows;
}

function isPublicRepairItem(item) {
  if (String(item.category || '').toLowerCase() === 'accessories') return false;
  return !NON_PUBLIC_STATUSES.has(String(item.status || '').toLowerCase());
}

function serializePublicRepairItem(item) {
  return {
    id: item.id,
    name: item.name,
    model: item.model,
    device_model: item.device_model,
    price: item.price,
    category: item.category,
    quality_grade: item.quality_grade,
    is_recommended: item.is_recommended,
  };
}

function createInventoryAccessHandlers(supabase) {
  return {
    async listPublic(_req, res) {
      try {
        const rows = await readAllInventory(supabase, PUBLIC_INVENTORY_SELECT);
        return res.json(rows.filter(isPublicRepairItem).map(serializePublicRepairItem));
      } catch (error) {
        console.error('Public inventory fetch failed:', error);
        return res.status(503).json({ error: 'Public repair pricing is temporarily unavailable.' });
      }
    },

    async listInternal(_req, res) {
      try {
        return res.json(await readAllInventory(supabase, '*'));
      } catch (error) {
        console.error('Inventory fetch failed:', error);
        return res.status(500).json({ error: 'Failed to fetch inventory.' });
      }
    },
  };
}

module.exports = {
  PUBLIC_INVENTORY_SELECT,
  createInventoryAccessHandlers,
};
