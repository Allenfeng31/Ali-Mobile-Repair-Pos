import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ repairResultProps: [] as Array<Record<string, unknown>> }));
const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchRepairTypeHubRepairResultSeeds = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));
vi.mock('@/lib/repair-results.server', () => ({ fetchRepairTypeHubRepairResultSeeds }));
vi.mock('@/lib/repair-type-hubs', () => ({
  buildRepairTypeHubCatalog: vi.fn(() => ({ categories: [{}] })),
}));
vi.mock('@/components/services/ServiceSchema', () => ({ ServiceSchema: () => null }));
vi.mock('@/components/repair-type-hubs/RepairTypeHubPage', () => ({
  default: ({ repairResultsSlot }: { repairResultsSlot: React.ReactNode }) => <>{repairResultsSlot}</>,
}));
vi.mock('@/components/repair-type-hubs/RepairTypeSupportingBrandHubLinks', () => ({ default: () => null }));
vi.mock('@/components/repair-results/RepairTypeRepairResultsSection', () => ({
  default: (props: Record<string, unknown>) => { state.repairResultProps.push(props); return null; },
}));
vi.mock('next/link', () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));
vi.mock('lucide-react', () => ({ ArrowRight: () => null, MapPin: () => null, PhoneCall: () => null }));

import ScreenReplacementPage from './screen-replacement/page';
import BatteryReplacementPage from './battery-replacement/page';
import ChargingPortReplacementPage from './charging-port-replacement/page';
import BackGlassReplacementPage from './back-glass-replacement/page';

const seed = [{
  id: 'seed', device_category: 'phone' as const, brand: 'Samsung', brand_slug: 'samsung',
  model: 'Galaxy S21', model_slug: 'galaxy-s21', repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
  title: 'Screen repaired', short_description: 'Approved public proof.', image_pair_alt_text: 'Approved proof',
  related_repair_url: '/repairs/phone/samsung/galaxy-s21/screen-replacement',
}];

const pages = [
  ['screen-replacement', ScreenReplacementPage],
  ['battery-replacement', BatteryReplacementPage],
  ['charging-port-replacement', ChargingPortReplacementPage],
  ['back-glass-replacement', BackGlassReplacementPage],
] as const;

afterEach(() => {
  state.repairResultProps = [];
  fetchRepairCatalog.mockReset();
  fetchRepairTypeHubRepairResultSeeds.mockReset();
});

describe('generic phone repair-type page Repair Results SSR integration', () => {
  it.each(pages)('passes a non-empty %s server seed to the existing slot', async (repairTypeSlug, Page) => {
    fetchRepairCatalog.mockResolvedValue({});
    fetchRepairTypeHubRepairResultSeeds.mockResolvedValue(seed);

    renderToStaticMarkup(await Page());

    expect(fetchRepairCatalog).toHaveBeenCalledTimes(1);
    expect(fetchRepairTypeHubRepairResultSeeds).toHaveBeenCalledWith({ category: 'phone', repairTypeSlug });
    expect(state.repairResultProps).toEqual([expect.objectContaining({
      category: 'phone', repairType: repairTypeSlug, initialResults: seed,
    })]);
  });

  it.each(pages)('keeps the %s client fallback eligible when its server reader returns no seed', async (repairTypeSlug, Page) => {
    fetchRepairCatalog.mockResolvedValue({});
    fetchRepairTypeHubRepairResultSeeds.mockResolvedValue([]);

    renderToStaticMarkup(await Page());

    expect(state.repairResultProps).toEqual([expect.objectContaining({
      category: 'phone', repairType: repairTypeSlug, initialResults: undefined,
    })]);
  });
});
