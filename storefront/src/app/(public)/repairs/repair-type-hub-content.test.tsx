/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { ReactElement, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchRepairTypeHubRepairResultSeeds = vi.hoisted(() => vi.fn());
const capturedProps = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const heroFactsByRepairSlug = vi.hoisted(() => ({
  'screen-replacement': { startingPriceLabel: 'From $60' },
  'battery-replacement': { startingPriceLabel: 'From $50' },
  'charging-port-replacement': { startingPriceLabel: 'From $50' },
  'back-glass-replacement': { startingPriceLabel: 'From $50' },
} as const));

vi.mock('next/link', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));
vi.mock('lucide-react', () => ({ ArrowRight: () => null, MapPin: () => null, PhoneCall: () => null }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));
vi.mock('@/lib/repair-results.server', () => ({ fetchRepairTypeHubRepairResultSeeds }));
vi.mock('@/lib/repair-type-hubs', () => ({
  buildRepairTypeHubCatalog: vi.fn((_catalog, repairSlug: keyof typeof heroFactsByRepairSlug) => ({
    hub: heroFactsByRepairSlug[repairSlug],
    categories: [{}],
  })),
  getRepairTypeHubStartingPriceLabel: vi.fn((data) => data.hub.startingPriceLabel),
  resolveRepairTypeHubSelectedState: vi.fn(() => null),
}));
vi.mock('@/components/services/ServiceSchema', () => ({ ServiceSchema: () => null }));
vi.mock('@/components/repair-type-hubs/RepairTypeHubPage', () => ({
  default: (props: Record<string, unknown>) => {
    capturedProps.push(props);
    return null;
  },
}));
vi.mock('@/components/repair-type-hubs/RepairTypeSupportingBrandHubLinks', () => ({ default: () => null }));
vi.mock('@/components/repair-results/RepairTypeRepairResultsSection', () => ({ default: () => null }));

import ScreenReplacementPage from './screen-replacement/page';
import BatteryReplacementPage from './battery-replacement/page';
import ChargingPortReplacementPage from './charging-port-replacement/page';
import BackGlassReplacementPage from './back-glass-replacement/page';

async function pageProps(page: (input: { searchParams: Promise<Record<string, never>> }) => Promise<unknown>) {
  render(await page({ searchParams: Promise.resolve({}) }) as ReactElement);
  return capturedProps.at(-1)!;
}

afterEach(() => {
  capturedProps.length = 0;
  fetchRepairCatalog.mockReset();
  fetchRepairTypeHubRepairResultSeeds.mockReset();
  fetchRepairCatalog.mockResolvedValue({});
  fetchRepairTypeHubRepairResultSeeds.mockResolvedValue([]);
});

describe('Repair Type Hub intent content', () => {
  it('uses the approved service-intent H1s without changing canonical metadata', async () => {
    fetchRepairCatalog.mockResolvedValue({});
    fetchRepairTypeHubRepairResultSeeds.mockResolvedValue([]);

    await expect(pageProps(ScreenReplacementPage)).resolves.toMatchObject({ title: 'Phone Screen & Display Replacement' });
    await expect(pageProps(BatteryReplacementPage)).resolves.toMatchObject({ title: 'Phone Battery Replacement' });
    await expect(pageProps(ChargingPortReplacementPage)).resolves.toMatchObject({ title: 'Phone Charging Port Repair' });
    await expect(pageProps(BackGlassReplacementPage)).resolves.toMatchObject({ title: 'Phone Back Glass & Housing Repair' });
  });

  it.each([
    ['Screen', ScreenReplacementPage],
    ['Battery', BatteryReplacementPage],
    ['Charging Port', ChargingPortReplacementPage],
    ['Back Glass', BackGlassReplacementPage],
  ] as const)('uses the fixed %s commercial Hero facts independently of the fallback catalogue', async (_service, page) => {
    fetchRepairCatalog.mockResolvedValue({ brands: [] });
    fetchRepairTypeHubRepairResultSeeds.mockResolvedValue([]);

    await expect(pageProps(page)).resolves.toMatchObject({
      heroHighlights: expect.arrayContaining([
        expect.objectContaining({ title: 'Price' }),
        expect.objectContaining({ title: 'Repair Time' }),
        expect.objectContaining({ title: 'Ringwood Square', description: 'Walk-ins welcome at Kiosk C1 inside Ringwood Square.' }),
      ]),
    });
  });

  it.each([
    ['Screen', ScreenReplacementPage, 'Screen replacement starts from $60.', '$60', 'Most screen replacements take around 30 minutes.'],
    ['Battery', BatteryReplacementPage, 'Battery replacement starts from $50.', '$50', 'Most battery replacements take around 30 minutes.'],
    ['Charging Port', ChargingPortReplacementPage, 'Charging port replacement starts from $50.', '$50', 'Most charging port replacements take around 30 minutes.'],
    ['Back Glass', BackGlassReplacementPage, 'Back glass replacement starts from $50.', '$50', 'Turnaround varies by model, repair scope, damage found during inspection, and part availability. We confirm the expected turnaround before work begins.'],
  ] as const)('uses approved %s card body copy with semantic emphasis', async (_service, page, priceCopy, price, timeCopy) => {
    fetchRepairCatalog.mockResolvedValue({ brands: [] });
    fetchRepairTypeHubRepairResultSeeds.mockResolvedValue([]);

    const props = await pageProps(page);
    const highlights = props.heroHighlights as Array<{ title: string; description?: ReactNode }>;
    const priceHighlight = highlights.find((highlight) => highlight.title === 'Price')!;
    const timeHighlight = highlights.find((highlight) => highlight.title === 'Repair Time')!;
    const priceCard = render(<>{priceHighlight.description}</>);
    const timeCard = render(<>{timeHighlight.description}</>);

    expect(priceCard.container).toHaveTextContent(priceCopy);
    expect(priceCard.container.querySelector('strong')).toHaveTextContent(price);
    expect(timeCard.container).toHaveTextContent(timeCopy);
    if (_service === 'Back Glass') {
      expect(timeCard.container.querySelector('strong')).toBeNull();
    } else {
      expect(timeCard.container.querySelector('strong')).toHaveTextContent('30 minutes');
    }
  });

  it('provides direct, diagnosis-first answers for the newly covered repair questions', async () => {
    fetchRepairCatalog.mockResolvedValue({});
    fetchRepairTypeHubRepairResultSeeds.mockResolvedValue([]);

    const screen = JSON.stringify(await pageProps(ScreenReplacementPage));
    const battery = JSON.stringify(await pageProps(BatteryReplacementPage));
    const charging = JSON.stringify(await pageProps(ChargingPortReplacementPage));
    const backGlass = JSON.stringify(await pageProps(BackGlassReplacementPage));

    expect(screen).toContain('LCD or OLED display');
    expect(screen).toContain('glass is not cracked');
    expect(battery).toContain('How much does a phone battery replacement cost?');
    expect(battery).toContain('calibration');
    expect(charging).toContain('How long does charging port repair take?');
    expect(charging).toContain('known-good cable');
    expect(backGlass).toContain('How much does back glass repair cost?');
    expect(backGlass).toContain('back up');
  });
});
