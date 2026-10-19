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

  it('uses the owner-approved Lenovo guidance only for screen, battery, and charging repairs', () => {
    expect(getLenovoTabletTypicalPriceGuidance('lenovo-tab-m11', 'screen-replacement')?.amountLabel)
      .toBe('AUD $120–$240');
    expect(getLenovoTabletTypicalPriceGuidance('lenovo-tab-m11', 'battery-replacement')?.amountLabel)
      .toBe('AUD $89–$149');
    expect(getLenovoTabletTypicalPriceGuidance('lenovo-tab-m11', 'charging-port-replacement')?.amountLabel)
      .toBe('AUD $79–$150');
    expect(getLenovoTabletTypicalPriceGuidance('lenovo-tab-m11', 'front-camera-replacement')).toBeNull();
    expect(getLenovoTabletTypicalPriceGuidance('lenovo-tab-m11', 'back-camera-replacement')).toBeNull();
  });
});
