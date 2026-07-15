import { describe, expect, it } from 'vitest';
import { resolveLegacyLogicBoardRoute } from './logicBoardRouting';

const canonicalLogicBoardService = {
  modelExists: true,
  canonicalLogicBoardServiceExists: true,
};

describe('resolveLegacyLogicBoardRoute', () => {
  it.each([
    ['Samsung', 'phone', 'samsung', 'galaxy-z-flip'],
    ['iPhone', 'phone', 'iphone', 'iphone-12-pro-max'],
    ['iPad', 'tablet', 'ipad', 'ipad-pro-129-inch-4th-generation'],
  ])('permanently redirects a valid %s legacy path to its canonical Logic Board path', (_, category, brand, model) => {
    expect(
      resolveLegacyLogicBoardRoute({
        category,
        brand,
        model,
        requestedRepairSlug: 'logic-board',
        ...canonicalLogicBoardService,
      })
    ).toEqual({
      type: 'redirect',
      status: 308,
      destination: `/repairs/${category}/${brand}/${model}/logic-board-repair`,
    });
  });

  it('preserves canonical Logic Board routes without a redirect', () => {
    expect(
      resolveLegacyLogicBoardRoute({
        category: 'phone',
        brand: 'samsung',
        model: 'galaxy-z-flip',
        requestedRepairSlug: 'logic-board-repair',
        ...canonicalLogicBoardService,
      })
    ).toEqual({ type: 'continue' });
  });

  it('returns 404 for an invalid model or a valid model without the service', () => {
    expect(
      resolveLegacyLogicBoardRoute({
        category: 'phone',
        brand: 'samsung',
        model: 'not-a-real-model',
        requestedRepairSlug: 'logic-board',
        modelExists: false,
        canonicalLogicBoardServiceExists: false,
      })
    ).toEqual({ type: 'not-found', status: 404 });

    expect(
      resolveLegacyLogicBoardRoute({
        category: 'phone',
        brand: 'samsung',
        model: 'valid-model-without-logic-board',
        requestedRepairSlug: 'logic-board',
        modelExists: true,
        canonicalLogicBoardServiceExists: false,
      })
    ).toEqual({ type: 'not-found', status: 404 });
  });

  it.each(['logic-board-component', 'motherboard', 'mainboard'])('does not match unrelated slug %s', (requestedRepairSlug) => {
    expect(
      resolveLegacyLogicBoardRoute({
        category: 'phone',
        brand: 'samsung',
        model: 'galaxy-z-flip',
        requestedRepairSlug,
        ...canonicalLogicBoardService,
      })
    ).toEqual({ type: 'continue' });
  });
});
