import { describe, expect, it } from 'vitest';
import { SAMSUNG_TABLET_MODEL_CONFIG_LIST } from './samsung-tablet/config';
import {
  getLenovoTabletTypicalPriceGuidance,
  getSamsungTabletTypicalPriceGuidance,
} from './tabletTypicalPriceGuidance';

describe('tablet typical price guidance', () => {
  it('classifies every configured Samsung Tablet as Galaxy Tab A or Galaxy Tab S', () => {
    const tabA = SAMSUNG_TABLET_MODEL_CONFIG_LIST.filter((config) => config.family === 'galaxy-tab-a');
    const tabS = SAMSUNG_TABLET_MODEL_CONFIG_LIST.filter((config) => config.family === 'galaxy-tab-s');

    expect(SAMSUNG_TABLET_MODEL_CONFIG_LIST).toHaveLength(39);
    expect(tabA).toHaveLength(12);
    expect(tabS).toHaveLength(27);
    expect(tabA.length + tabS.length).toBe(SAMSUNG_TABLET_MODEL_CONFIG_LIST.length);
  });

  it('uses distinct Tab A and Tab S ranges without cross-series leakage', () => {
    expect(getSamsungTabletTypicalPriceGuidance('galaxy-tab-a8-sm-x200-sm-x205', 'screen-replacement')?.amountLabel)
      .toBe('AUD $139–$220');
    expect(getSamsungTabletTypicalPriceGuidance('galaxy-tab-s8-sm-x700-sm-x706', 'screen-replacement')?.amountLabel)
      .toBe('AUD $180–$550');
  });

  it('uses Lenovo ranges only for supported standard repairs', () => {
    expect(getLenovoTabletTypicalPriceGuidance('lenovo-tab-m11', 'screen-replacement')?.amountLabel)
      .toBe('AUD $100–$250');
    expect(getLenovoTabletTypicalPriceGuidance('lenovo-tab-m11', 'front-camera-replacement')).toBeNull();
  });
});
