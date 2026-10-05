const CUSTOMER_HISTORY_PAGE_SIZE = 500;

const CUSTOMER_FIELDS = 'id, name, phone, email, initials, totalSpent, status, statusColor, lastVisit, lastReviewSent, synced_to_google';
const REPAIR_FIELDS = 'id, customer_id, timestamp, repairItem, modelNumber, price, status, liquidDamage, deposit, password, imei, remark';

async function fetchAllRows({ supabase, table, fields, orders, pageSize = CUSTOMER_HISTORY_PAGE_SIZE, logger = console }) {
  const rows = [];
  let offset = 0;
  let pageNumber = 1;

  while (true) {
    const end = offset + pageSize - 1;
    let query = supabase.from(table).select(fields);
    for (const [column, options] of orders) {
      query = query.order(column, options);
    }

    let rangeResult;
    try {
      rangeResult = await query.range(offset, end);
    } catch (rangeError) {
      const reason = rangeError instanceof Error ? rangeError.message : typeof rangeError;
      logger.error(`[Customers API] Failed to fetch ${table} page ${pageNumber} range ${offset}-${end}: ${reason}`);
      throw rangeError;
    }

    const { data, error } = rangeResult;
    if (error || !Array.isArray(data)) {
      const reason = error?.message || 'missing page data';
      logger.error(`[Customers API] Failed to fetch ${table} page ${pageNumber} range ${offset}-${end}: ${reason}`);
      throw new Error(`Unable to fetch complete ${table} dataset`);
    }

    rows.push(...data);
    if (data.length < pageSize) return rows;

    offset += pageSize;
    pageNumber += 1;
  }
}

async function fetchCustomerRepairHistory({ supabase, logger = console } = {}) {
  const [customers, repairs] = await Promise.all([
    fetchAllRows({
      supabase,
      table: 'customers',
      fields: CUSTOMER_FIELDS,
      orders: [['name', { ascending: true }], ['id', { ascending: true }]],
      logger,
    }),
    fetchAllRows({
      supabase,
      table: 'repairs',
      fields: REPAIR_FIELDS,
      orders: [['timestamp', { ascending: true }], ['id', { ascending: true }]],
      logger,
    }),
  ]);

  const repairsByCustomer = new Map();
  for (const repair of repairs) {
    if (!repairsByCustomer.has(repair.customer_id)) repairsByCustomer.set(repair.customer_id, []);
    repairsByCustomer.get(repair.customer_id).push(repair);
  }

  return customers.map((customer) => ({
    ...customer,
    repairs: repairsByCustomer.get(customer.id) || [],
  }));
}

module.exports = {
  CUSTOMER_HISTORY_PAGE_SIZE,
  fetchAllRows,
  fetchCustomerRepairHistory,
};
