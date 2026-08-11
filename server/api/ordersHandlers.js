const DEFAULT_ORDER_PAGE_SIZE = 1000;
const DEFAULT_ORDER_ID_BATCH_SIZE = 100;
const DEFAULT_ITEM_PAGE_SIZE = 1000;
const MELBOURNE_TIME_ZONE = 'Australia/Melbourne';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function nextCalendarDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return date.toISOString().slice(0, 10);
}

function getMelbourneOffsetMilliseconds(date) {
  const offset = new Intl.DateTimeFormat('en-AU', {
    timeZone: MELBOURNE_TIME_ZONE,
    timeZoneName: 'longOffset',
  }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value;
  const match = offset?.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) throw new Error('Unable to determine Melbourne timezone offset');

  const milliseconds = (Number(match[2]) * 60 + Number(match[3])) * 60 * 1000;
  return match[1] === '+' ? milliseconds : -milliseconds;
}

function melbourneDayStart(value) {
  const [year, month, day] = value.split('-').map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day);
  let boundary = utcMidnight - getMelbourneOffsetMilliseconds(new Date(utcMidnight));
  const correctedBoundary = utcMidnight - getMelbourneOffsetMilliseconds(new Date(boundary));
  if (correctedBoundary !== boundary) boundary = correctedBoundary;
  return new Date(boundary).toISOString();
}

function parseDateRange(query = {}) {
  const { from, to } = query;
  if (from === undefined && to === undefined) return null;
  if (!isCalendarDate(from) || !isCalendarDate(to) || from > to) return undefined;

  return {
    from: melbourneDayStart(from),
    to: melbourneDayStart(nextCalendarDate(to)),
  };
}

async function fetchOrders(supabase, dateRange, { orderPageSize = DEFAULT_ORDER_PAGE_SIZE } = {}) {
  const orders = [];
  let offset = 0;

  while (true) {
    let query = supabase
      .from('orders')
      .select('*')
      .order('timestamp', { ascending: false })
      .order('id', { ascending: true });

    if (dateRange) query = query.gte('timestamp', dateRange.from).lt('timestamp', dateRange.to);

    const { data, error } = await query.range(offset, offset + orderPageSize - 1);
    if (error) throw error;

    const page = data || [];
    orders.push(...page);
    if (page.length < orderPageSize) return orders;
    offset += orderPageSize;
  }
}

async function fetchItemsForOrderIds(supabase, orderIds, {
  orderIdBatchSize = DEFAULT_ORDER_ID_BATCH_SIZE,
  itemPageSize = DEFAULT_ITEM_PAGE_SIZE,
} = {}) {
  const itemsById = new Map();

  for (const orderIdBatch of chunk(orderIds, orderIdBatchSize)) {
    let offset = 0;

    while (true) {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIdBatch)
        .order('id', { ascending: true })
        .range(offset, offset + itemPageSize - 1);

      if (error) throw error;

      const page = data || [];
      for (const item of page) {
        if (!itemsById.has(item.id)) itemsById.set(item.id, item);
      }

      if (page.length < itemPageSize) break;
      offset += itemPageSize;
    }
  }

  return [...itemsById.values()];
}

function createOrdersHandlers({
  supabase,
  orderPageSize,
  orderIdBatchSize,
  itemPageSize,
}) {
  return {
    get: async (req, res) => {
      const dateRange = parseDateRange(req.query);
      if (dateRange === undefined) return res.status(400).json({ error: 'Invalid date range' });

      let currentOrders;
      try {
        currentOrders = await fetchOrders(supabase, dateRange, { orderPageSize });
      } catch (_error) {
        console.error('[Orders] Failed to retrieve orders.');
        return res.status(500).json({ error: 'Unable to load orders' });
      }

      const orderIds = [...new Set(currentOrders
        .map((order) => order.id)
        .filter((orderId) => orderId !== undefined && orderId !== null))];

      let items;
      try {
        items = await fetchItemsForOrderIds(supabase, orderIds, { orderIdBatchSize, itemPageSize });
      } catch (_error) {
        console.error('[Orders] Failed to retrieve order items.');
        return res.status(500).json({ error: 'Unable to load order items' });
      }

      const itemsByOrderId = new Map();
      for (const item of items) {
        const orderItems = itemsByOrderId.get(item.order_id) || [];
        orderItems.push(item);
        itemsByOrderId.set(item.order_id, orderItems);
      }

      return res.json(currentOrders.map((order) => ({
        ...order,
        items: itemsByOrderId.get(order.id) || [],
      })));
    },
  };
}

module.exports = {
  createOrdersHandlers,
  fetchItemsForOrderIds,
  fetchOrders,
  melbourneDayStart,
  parseDateRange,
};
