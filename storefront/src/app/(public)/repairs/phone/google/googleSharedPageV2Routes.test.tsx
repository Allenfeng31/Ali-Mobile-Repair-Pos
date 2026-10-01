import { describe, expect, it, vi } from 'vitest';

const routeMock = vi.hoisted(() => vi.fn(() => <div data-testid="virtual-route" />));
vi.mock('@/lib/virtualPhoneRepairRoute', () => ({
  default: routeMock,
  createVirtualPhoneRepairMetadata: () => ({}),
}));

import Loudspeaker from './loudspeaker-replacement/page';
import Earpiece from './earpiece-speaker-replacement/page';
import Power from './power-button-replacement/page';
import Volume from './volume-button-replacement/page';
import SamsungLoudspeaker from '../samsung/loudspeaker-replacement/page';
import SamsungEarpiece from '../samsung/earpiece-speaker-replacement/page';
import SamsungPower from '../samsung/power-button-replacement/page';
import SamsungVolume from '../samsung/volume-button-replacement/page';
import OppoLoudspeaker from '../oppo/loudspeaker-replacement/page';
import OppoEarpiece from '../oppo/earpiece-speaker-replacement/page';
import OppoPower from '../oppo/power-button-replacement/page';
import OppoVolume from '../oppo/volume-button-replacement/page';

describe('Google Pixel V2 route query forwarding', () => {
  it.each([
    ['loudspeaker-replacement', Loudspeaker],
    ['earpiece-speaker-replacement', Earpiece],
    ['power-button-replacement', Power],
    ['volume-button-replacement', Volume],
  ] as const)('forwards complete untrusted query state for %s', async (repairSlug, Page) => {
    const query = { model: 'pixel-8-pro', brand: 'samsung', service: 'Power Button Replacement' };
    const element = await Page({ searchParams: Promise.resolve(query) });
    expect(element.type).toBe(routeMock);
    expect(element.props).toEqual({ brand: 'google', repairSlug, query });
  });
});

describe('Samsung and OPPO V2 route query forwarding', () => {
  it.each([
    ['samsung', 'loudspeaker-replacement', SamsungLoudspeaker],
    ['samsung', 'earpiece-speaker-replacement', SamsungEarpiece],
    ['samsung', 'power-button-replacement', SamsungPower],
    ['samsung', 'volume-button-replacement', SamsungVolume],
    ['oppo', 'loudspeaker-replacement', OppoLoudspeaker],
    ['oppo', 'earpiece-speaker-replacement', OppoEarpiece],
    ['oppo', 'power-button-replacement', OppoPower],
    ['oppo', 'volume-button-replacement', OppoVolume],
  ] as const)('forwards complete untrusted query state for %s %s', async (brand, repairSlug, Page) => {
    const query = { model: 'current-model', brand: 'invalid-brand', service: 'Invalid Service' };
    const element = await Page({ searchParams: Promise.resolve(query) });
    expect(element.type).toBe(routeMock);
    expect(element.props).toEqual({ brand, repairSlug, query });
  });
});
