/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchRepairTypeHubRepairResultSeeds = vi.hoisted(() => vi.fn());
const capturedProps = vi.hoisted(() => [] as Array<Record<string, unknown>>);

vi.mock('next/link', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));
vi.mock('lucide-react', () => ({ ArrowRight: () => null, MapPin: () => null, PhoneCall: () => null }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));
vi.mock('@/lib/repair-results.server', () => ({ fetchRepairTypeHubRepairResultSeeds }));
vi.mock('@/lib/repair-type-hubs', () => ({
  buildRepairTypeHubCatalog: vi.fn(() => ({ categories: [{}] })),
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
