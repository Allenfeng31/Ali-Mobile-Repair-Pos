const assert = require('node:assert/strict');
const test = require('node:test');
const {
  calculateMultiItemPricing,
  formatBookingServiceName,
  normaliseBookingDevices,
  validateBookingOtherRepairItems,
  validateOtherRepairDescription,
} = require('./otherRepairBooking.js');

const otherRepair = (customDescription, price = 99) => ({ name: 'Other Repair', price, customDescription });
const paidRepair = (id = 1) => ({ id, name: 'Screen Replacement', price: 100 });
const device = (services) => ({ brand: 'Samsung', model: 'Galaxy', services });
const config = { multi_discount_tier_2: 0.1, multi_discount_tier_3: 0.15 };

test('validates Other Repair description boundaries and preserves trimmed labels', () => {
  for (const value of [undefined, 42, '   ', 'four', 'x'.repeat(301)]) {
    assert.equal(validateOtherRepairDescription(value).valid, false);
  }
  assert.equal(validateOtherRepairDescription(' fives ').valid, true);
  assert.equal(validateOtherRepairDescription('x'.repeat(300)).valid, true);
  assert.equal(formatBookingServiceName(otherRepair('  speaker crackles  ')), 'Other Repair - speaker crackles');
  assert.equal(formatBookingServiceName(paidRepair()), 'Screen Replacement');
});

test('normalizes quote-only services and validates incoming booking devices', () => {
  const normalized = normaliseBookingDevices([device([otherRepair('speaker crackles', 250)])]);
  assert.equal(normalized[0].services[0].price, 0);
  assert.equal(normalized[0].services[0].customDescription, 'speaker crackles');
  assert.deepEqual(validateBookingOtherRepairItems(normalized), { valid: true });
  assert.equal(validateBookingOtherRepairItems([device([otherRepair('bad')])]).valid, false);
});

test('keeps Other Repair out of discount qualification and prevents negative totals', () => {
  const onePaid = calculateMultiItemPricing([device([paidRepair()])], config);
  const oneOther = calculateMultiItemPricing([device([otherRepair('speaker crackles')])], config);
  const paidAndOther = calculateMultiItemPricing([device([paidRepair(), otherRepair('speaker crackles')])], config);
  const twoPaid = calculateMultiItemPricing([device([paidRepair(1)]), device([paidRepair(2)])], config);
  const twoPaidAndOther = calculateMultiItemPricing([device([paidRepair(1), otherRepair('speaker crackles')]), device([paidRepair(2)])], config);

  assert.deepEqual(onePaid, { subtotal: 100, discountRate: 0, discountAmount: 0, qualifyingRepairItemCount: 1, total: 100 });
  assert.deepEqual(oneOther, { subtotal: 0, discountRate: 0, discountAmount: 0, qualifyingRepairItemCount: 0, total: 0 });
  assert.deepEqual(paidAndOther, onePaid);
  assert.deepEqual(twoPaidAndOther, twoPaid);
});
