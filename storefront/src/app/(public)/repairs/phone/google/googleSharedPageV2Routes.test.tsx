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
