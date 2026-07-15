import { describe, expect, it } from 'vitest';
import type { CartDevice, RepairService } from './CartContext';
import {
  appendOtherRepairOption,
  formatOtherRepairServiceName,
  getOtherRepairPriceLabel,
  isOtherRepairService,
  OTHER_REPAIR_SERVICE_ID,
  OTHER_REPAIR_SERVICE_NAME,
  removeOtherRepairOption,
  updateOtherRepairDescription,
  validateOtherRepairDescription,
} from './CartContext';
import {
  calculateCartPricing,
  normalizeCartDevices,
  updateCartDeviceServices,
} from '../lib/otherRepairBooking';

const discountConfig = { multi_discount_tier_2: 0.1, multi_discount_tier_3: 0.15 };
const standardRepair: RepairService = { id: 101, name: 'Screen Replacement', price: 100 };
const device = (id: string, services: RepairService[]): CartDevice => ({
  id,
  brand: 'Samsung',
  model: `Model ${id}`,
  category: 'phone',
  services,
  isConfirmed: true,
});

describe('booking-only Other Repair cart service', () => {
  it('appends one synthetic zero-price Other Repair as the final service', () => {
    const services = appendOtherRepairOption([standardRepair]);
    const otherRepair = services[services.length - 1];

    expect(services).toHaveLength(2);
    expect(otherRepair).toEqual({
      id: OTHER_REPAIR_SERVICE_ID,
      name: OTHER_REPAIR_SERVICE_NAME,
      price: 0,
      customDescription: '',
    });
    expect(typeof otherRepair.id).toBe('string');
    expect(otherRepair.id).not.toBe(standardRepair.id);
    expect(appendOtherRepairOption(services)).toHaveLength(2);
  });

  it('validates the required trimmed description boundaries without altering content', () => {
    expect(validateOtherRepairDescription('')).toEqual({ valid: false, value: '' });
    expect(validateOtherRepairDescription('   ')).toEqual({ valid: false, value: '' });
    expect(validateOtherRepairDescription(' four')).toEqual({ valid: false, value: 'four' });
    expect(validateOtherRepairDescription(' fives ')).toEqual({ valid: true, value: 'fives' });
    expect(validateOtherRepairDescription('x'.repeat(300))).toEqual({ valid: true, value: 'x'.repeat(300) });
    expect(validateOtherRepairDescription('x'.repeat(301))).toEqual({ valid: false, value: 'x'.repeat(301) });
    expect(validateOtherRepairDescription(`  can't charge — 🔋! <b>help</b>  `)).toEqual({
      valid: true,
      value: `can't charge — 🔋! <b>help</b>`,
    });
  });

  it('updates and removes only the Other Repair item immutably', () => {
    const withOtherRepair = appendOtherRepairOption([standardRepair]);
    const updatedServices = updateOtherRepairDescription(withOtherRepair, '  speaker crackles  ');
    const updatedDevices = updateCartDeviceServices([device('a', withOtherRepair)], 'a', updatedServices);

    expect(withOtherRepair[withOtherRepair.length - 1].customDescription).toBe('');
    expect(updatedDevices[0].services[updatedDevices[0].services.length - 1].customDescription).toBe('  speaker crackles  ');
    expect(updatedDevices[0].services[0]).toEqual(standardRepair);
    expect(removeOtherRepairOption(updatedDevices[0].services)).toEqual([standardRepair]);
  });

  it('keeps Other Repair descriptions isolated between devices', () => {
    const deviceA = device('a', updateOtherRepairDescription(appendOtherRepairOption([]), 'screen flickers'));
    const deviceB = device('b', updateOtherRepairDescription(appendOtherRepairOption([]), 'battery drains'));

    expect(deviceA.services.find(isOtherRepairService)?.customDescription).toBe('screen flickers');
    expect(deviceB.services.find(isOtherRepairService)?.customDescription).toBe('battery drains');
  });

  it('serializes valid carts and safely normalizes old or malformed custom descriptions', () => {
    const persisted = JSON.parse(JSON.stringify([device('a', updateOtherRepairDescription(appendOtherRepairOption([]), 'charging issue'))]));
    const restored = normalizeCartDevices(persisted);
    const legacy = normalizeCartDevices([device('legacy', [standardRepair])]);
    const malformed = normalizeCartDevices([device('bad', [{
      id: OTHER_REPAIR_SERVICE_ID,
      name: OTHER_REPAIR_SERVICE_NAME,
      price: 99,
      customDescription: 42 as unknown as string,
    }])]);

    expect(restored[0].services.find(isOtherRepairService)?.customDescription).toBe('charging issue');
    expect(legacy[0].services).toEqual([standardRepair]);
    expect(malformed[0].services[0]).toMatchObject({ price: 0 });
    expect(formatOtherRepairServiceName(malformed[0].services[0])).toBe(OTHER_REPAIR_SERVICE_NAME);
  });

  it('excludes Other Repair from discount qualification while preserving paid-repair totals', () => {
    const onePaid = calculateCartPricing([device('one', [standardRepair])], discountConfig);
    const oneOther = calculateCartPricing([device('other', appendOtherRepairOption([]))], discountConfig);
    const paidAndOther = calculateCartPricing([device('mixed', appendOtherRepairOption([standardRepair]))], discountConfig);
    const twoPaid = calculateCartPricing([device('one', [standardRepair]), device('two', [{ ...standardRepair, id: 102 }])], discountConfig);
    const twoPaidAndOther = calculateCartPricing([
      device('one', appendOtherRepairOption([standardRepair])),
      device('two', [{ ...standardRepair, id: 102 }]),
    ], discountConfig);
    const twoOthers = calculateCartPricing([device('a', appendOtherRepairOption([])), device('b', appendOtherRepairOption([]))], discountConfig);

    expect(onePaid).toMatchObject({ subtotalPrice: 100, discountRate: 0, totalPrice: 100, qualifyingRepairItemCount: 1 });
    expect(oneOther).toMatchObject({ subtotalPrice: 0, discountRate: 0, discountAmount: 0, totalPrice: 0, qualifyingRepairItemCount: 0, hasCustomQuote: true });
    expect(paidAndOther).toMatchObject({ subtotalPrice: 100, discountRate: 0, totalPrice: 100, qualifyingRepairItemCount: 1 });
    expect(twoPaid).toMatchObject({ discountRate: 0.1, discountAmount: 20, totalPrice: 180, qualifyingRepairItemCount: 2 });
    expect(twoPaidAndOther).toMatchObject({
      subtotalPrice: twoPaid.subtotalPrice,
      discountRate: twoPaid.discountRate,
      discountAmount: twoPaid.discountAmount,
      totalPrice: twoPaid.totalPrice,
      qualifyingRepairItemCount: twoPaid.qualifyingRepairItemCount,
      hasCustomQuote: true,
    });
    expect(twoOthers).toMatchObject({ subtotalPrice: 0, discountAmount: 0, totalPrice: 0, qualifyingRepairItemCount: 0 });
  });

  it('keeps standard repairs unchanged and resolves the production quote label', () => {
    expect(isOtherRepairService(standardRepair)).toBe(false);
    expect(formatOtherRepairServiceName(standardRepair)).toBe('Screen Replacement');
    expect(getOtherRepairPriceLabel()).toBe('Quote on Request');
  });
});
