/** @vitest-environment node */
import { describe, expect, it, vi } from 'vitest';

const {
  buildCatalogueOutboxDelivery,
  calculateRetry,
  processCatalogueOutboxBatch,
} = require('./catalogueOutbox.js');

const repair = (overrides = {}) => ({
  id: 'repair-1',
  name: 'Moto G24 Screen Replacement',
  model: 'P Motorola||Moto G24',
  device_model: 'XT2423-2',
  category: 'Screen Replacement',
  price: 149,
  ...overrides,
});

describe('catalogue mutation outbox processor', () => {
  it('preserves both identities for a rename and emits a stable event version', () => {
    const delivery = buildCatalogueOutboxDelivery({
      id: 'event-1', sequence: 42, operation: 'update',
      before_item: repair(), after_item: repair({ model: 'P Motorola||Moto G24 5G' }),
    });
    expect(delivery.eventId).toBe('event-1');
    expect(delivery.eventVersion).toBe(42);
    expect(delivery.mutations).toEqual(expect.arrayContaining([
      expect.objectContaining({ model: 'Moto G24' }),
      expect.objectContaining({ model: 'Moto G24 5G' }),
    ]));
  });

  it('uses bounded exponential retry with a capped needs-attention result', () => {
    expect(calculateRetry({ attempts: 1, now: new Date('2026-08-27T00:00:00.000Z'), random: () => 0 })).toMatchObject({ status: 'pending', attempts: 2 });
    expect(calculateRetry({ attempts: 5, now: new Date('2026-08-27T00:00:00.000Z'), random: () => 0 })).toEqual({ status: 'needs_attention', attempts: 5 });
  });

  it('delivers claimed rows once, leaves failed rows retryable, and never marks a secret failure successful', async () => {
    const claimed = [
      { id: 'ok', sequence: 1, operation: 'update', before_item: repair(), after_item: repair({ price: 159 }), attempts: 0 },
      { id: 'bad', sequence: 2, operation: 'update', before_item: repair(), after_item: repair({ price: 169 }), attempts: 0 },
    ];
    const finalize = vi.fn(async () => undefined);
    const result = await processCatalogueOutboxBatch({
      claim: async () => claimed,
      finalizeSuccess: finalize,
      finalizeFailure: vi.fn(async () => undefined),
      deliver: async (delivery) => delivery.eventId === 'ok' ? { ok: true } : { ok: false, category: 'authentication' },
      now: () => new Date('2026-08-27T00:00:00.000Z'),
      random: () => 0,
    });
    expect(result).toEqual({ claimed: 2, delivered: 1, failed: 1 });
    expect(finalize).toHaveBeenCalledTimes(1);
    expect(finalize).toHaveBeenCalledWith('ok');
  });

  it('does not silently truncate a 1001-event delivery batch', async () => {
    const events = Array.from({ length: 1001 }, (_, index) => ({ id: String(index), sequence: index + 1, operation: 'update', before_item: repair(), after_item: repair({ price: 150 + index }), attempts: 0 }));
    const delivered = [];
    const result = await processCatalogueOutboxBatch({ claim: async () => events, finalizeSuccess: async () => undefined, finalizeFailure: async () => undefined, deliver: async (event) => { delivered.push(event.eventId); return { ok: true }; } });
    expect(result).toEqual({ claimed: 1001, delivered: 1001, failed: 0 });
    expect(delivered).toHaveLength(1001);
  });
});
