/** @vitest-environment node */
import { describe, expect, it, vi } from 'vitest';
import catalogueRevalidation from './catalogueRevalidation.js';

const {
  STOREFRONT_REVALIDATION_PATH,
  notifyStorefrontRepairCatalogueMutation,
  sanitizeCatalogueMutations,
} = catalogueRevalidation;

const repair = (overrides = {}) => ({
  id: 1,
  name: 'Moto G24 Screen Replacement',
  model: 'P Motorola||Moto G24',
  device_model: 'XT2423-2',
  category: 'Screen Replacement',
  price: 149,
  costPrice: 65,
  stock: 2,
  ...overrides,
});

describe('repair catalogue revalidation notifier', () => {
  it('sanitizes a public repair and keeps every brand on the same payload shape', () => {
    expect(sanitizeCatalogueMutations({ operation: 'create', items: [repair()] })).toEqual([
      expect.objectContaining({ category: 'phone', brand: 'Motorola', model: 'Moto G24', repairType: 'Screen Replacement', topologyChanged: true }),
    ]);
  });

  it.each([
    ['P Motorola||Moto G24', 'phone'],
    ['T Samsung||Galaxy Tab S9', 'tablet'],
    ['C MacBook||MacBook Air M2', 'laptop'],
    ['W Apple Watch||Apple Watch Series 3 38mm', 'watch'],
  ])('uses the shared notifier for %s', (model, category) => {
    expect(sanitizeCatalogueMutations({ operation: 'create', items: [repair({ model })] })[0].category).toBe(category);
  });

  it('excludes Accessories and stock-only updates before any network request', async () => {
    const fetchImpl = vi.fn();
    await expect(notifyStorefrontRepairCatalogueMutation({ operation: 'create', items: [repair({ category: 'Accessories' })], fetchImpl })).resolves.toBe(false);
    await expect(notifyStorefrontRepairCatalogueMutation({
      operation: 'update', items: [repair({ stock: 3 })], beforeById: { 1: repair({ stock: 2 }) }, fetchImpl,
    })).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('posts once to the fixed Storefront destination with no caller-controlled URL fields', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    await expect(notifyStorefrontRepairCatalogueMutation({
      operation: 'update',
      items: [repair({ price: 159 })],
      beforeById: { 1: repair() },
      fetchImpl,
      url: STOREFRONT_REVALIDATION_PATH,
      secret: 'test-secret',
    })).resolves.toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(STOREFRONT_REVALIDATION_PATH, expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'x-catalogue-revalidation-secret': 'test-secret' }),
    }));
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ mutations: [expect.not.objectContaining({ path: expect.anything(), tag: expect.anything(), url: expect.anything() })] });
  });

  it.each(['create', 'update', 'delete'])('sends one notification for a successful single %s mutation', async (operation) => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    await notifyStorefrontRepairCatalogueMutation({
      operation,
      items: [repair({ price: operation === 'update' ? 159 : 149 })],
      beforeById: operation === 'update' ? { 1: repair() } : undefined,
      fetchImpl,
      url: STOREFRONT_REVALIDATION_PATH,
      secret: 'test-secret',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('coalesces a bulk notification into one request and does not fail a completed mutation when Storefront is unavailable', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('unavailable'));
    await expect(notifyStorefrontRepairCatalogueMutation({
      operation: 'create', items: [repair(), repair({ id: 2, model: 'T Samsung||Galaxy Tab S9', name: 'Galaxy Tab S9 Battery Replacement', category: 'Battery Replacement' })],
      fetchImpl, url: STOREFRONT_REVALIDATION_PATH, secret: 'test-secret',
    })).resolves.toBe(false);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not allow a non-Storefront destination even when a secret is present', async () => {
    const fetchImpl = vi.fn();
    await notifyStorefrontRepairCatalogueMutation({
      operation: 'create', items: [repair()], fetchImpl, url: 'https://www.api.alimobile.com.au/api/internal/revalidate-repair-catalogue', secret: 'test-secret',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
