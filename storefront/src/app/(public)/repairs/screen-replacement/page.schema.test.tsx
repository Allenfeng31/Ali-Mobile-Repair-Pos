/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchRepairTypeHubRepairResultSeeds = vi.hoisted(() => vi.fn());

vi.mock('next/link', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('next/script', () => ({ default: (props: React.ScriptHTMLAttributes<HTMLScriptElement>) => <script {...props} /> }));
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));
vi.mock('lucide-react', () => ({ ArrowRight: () => null, MapPin: () => null, PhoneCall: () => null }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));
vi.mock('@/lib/repair-results.server', () => ({ fetchRepairTypeHubRepairResultSeeds }));
vi.mock('@/lib/repair-type-hubs', () => ({ buildRepairTypeHubCatalog: vi.fn(() => ({ categories: [{}] })) }));
vi.mock('@/components/repair-type-hubs/RepairTypeHubPage', () => ({ default: () => null }));
vi.mock('@/components/repair-type-hubs/RepairTypeSupportingBrandHubLinks', () => ({ default: () => null }));
vi.mock('@/components/repair-results/RepairTypeRepairResultsSection', () => ({ default: () => null }));

import ScreenReplacementPage from './page';

afterEach(() => {
  fetchRepairCatalog.mockReset();
  fetchRepairTypeHubRepairResultSeeds.mockReset();
});

describe('ScreenReplacementPage service schema', () => {
  it('renders the existing screen service data as a Service with the canonical provider reference', async () => {
    fetchRepairCatalog.mockResolvedValue({});
    fetchRepairTypeHubRepairResultSeeds.mockResolvedValue([]);

    const { container } = render(await ScreenReplacementPage());
    const schemas = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent || '{}'));
    const service = schemas.find((schema) => schema['@id'] === 'https://www.alimobile.com.au/repairs/screen-replacement#service');

    expect(service).toMatchObject({
      '@type': 'Service',
      name: 'Screen Replacement Services in Ringwood',
      url: 'https://www.alimobile.com.au/repairs/screen-replacement',
      description: 'Choose your supported phone model for screen replacement at Ali Mobile & Repair in Ringwood Square. Compare real repair paths, view starting prices where available, and book with our Ringwood team.',
      provider: { '@id': 'https://www.alimobile.com.au/#localbusiness' },
    });
    expect(schemas.some((schema) => schema['@type'] === 'MobilePhoneStore')).toBe(false);
  });
});
