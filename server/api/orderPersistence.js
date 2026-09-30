const ESSENTIAL_ORDER_COLUMNS = ['id', 'timestamp', 'subtotal', 'tax', 'total', 'profit', 'type', 'paymentMethod'];

function preferRecordedTender(primaryValue, legacyValue) {
  if (primaryValue === undefined || primaryValue === null) return legacyValue;
  if (legacyValue !== undefined && legacyValue !== null && Number(primaryValue) === 0 && Number(legacyValue) !== 0) {
    return legacyValue;
  }
  return primaryValue;
}

function normalizeOrderPaymentFields(order) {
  if (!order) return order;
  const { mixedcash, mixedeftpos, ...normalizedOrder } = order;
  return {
    ...normalizedOrder,
    mixedCash: preferRecordedTender(order.mixedCash, mixedcash),
    mixedEftpos: preferRecordedTender(order.mixedEftpos, mixedeftpos),
  };
}

function usesMixedTender(orderData) {
  return orderData.paymentMethod === 'mixed'
    || orderData.mixedCash !== undefined
    || orderData.mixedEftpos !== undefined;
}

function validateMixedTender(orderData) {
  if (orderData.paymentMethod !== 'mixed') return null;
  if (!Number.isFinite(orderData.mixedCash) || !Number.isFinite(orderData.mixedEftpos)) {
    return new Error('A complete mixed payment split is required.');
  }
  if (orderData.mixedCash < 0 || orderData.mixedEftpos < 0) {
    return new Error('Mixed payment amounts cannot be negative.');
  }

  const expectedTenderTotal = Number(orderData.total || 0) - Number(orderData.surcharge || 0);
  const recordedTenderTotal = orderData.mixedCash + orderData.mixedEftpos;
  if (Math.abs(recordedTenderTotal - expectedTenderTotal) > 0.01) {
    return new Error('Mixed payment amounts must equal the paid total before customer surcharge.');
  }
  return null;
}

function isMixedColumnCompatibilityError(error) {
  return /mixedCash|mixedEftpos|mixedcash|mixedeftpos/.test(error?.message || '');
}

async function insert(supabase, orderData) {
  const { data, error } = await supabase.from('orders').insert([orderData]).select();
  return { order: data?.[0] || null, error };
}

async function insertOrderRecord(supabase, orderData) {
  const mixedTenderError = validateMixedTender(orderData);
  if (mixedTenderError) return { order: null, error: mixedTenderError };

  let result = await insert(supabase, orderData);
  if (!result.error) return { order: normalizeOrderPaymentFields(result.order), error: null };

  if (usesMixedTender(orderData)) {
    if (!isMixedColumnCompatibilityError(result.error)) return result;

    const { mixedCash, mixedEftpos, ...legacyOrderData } = orderData;
    result = await insert(supabase, {
      ...legacyOrderData,
      mixedcash: mixedCash,
      mixedeftpos: mixedEftpos,
    });
    return result.error
      ? result
      : { order: normalizeOrderPaymentFields(result.order), error: null };
  }

  const canDropLegacyOptionalFields = Number(orderData.surcharge || 0) === 0;
  if (canDropLegacyOptionalFields && result.error?.message && /surcharge|status|mixedCash|mixedEftpos/.test(result.error.message)) {
    const legacyOrderData = {};
    ESSENTIAL_ORDER_COLUMNS.forEach((key) => {
      if (orderData[key] !== undefined) legacyOrderData[key] = orderData[key];
    });
    result = await insert(supabase, legacyOrderData);
  }

  return result.error
    ? result
    : { order: normalizeOrderPaymentFields(result.order), error: null };
}

module.exports = {
  insertOrderRecord,
  normalizeOrderPaymentFields,
};
