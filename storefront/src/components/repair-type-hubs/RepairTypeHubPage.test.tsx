/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./RepairTypeModelGrid', () => ({ default: () => <section data-repair-type-finder>Finder</section> }));
vi.mock('./RepairTypeHubSelectedDevice', () => ({ default: ({ selected }: { selected: { model: string } }) => <section data-repair-type-selected>{selected.model}</section> }));
vi.mock('next/link', () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('lucide-react', () => ({ ArrowLeft: () => null }));

import RepairTypeHubPage from './RepairTypeHubPage';

const data = { hub: { label: 'Screen Replacement' }, categories: [] } as never;

describe('RepairTypeHubPage hybrid selected state', () => {
  it('keeps the established finder for generic state', () => {
    const { container } = render(<RepairTypeHubPage data={data} />);
    expect(container.querySelector('[data-repair-type-finder]')).toBeInTheDocument();
    expect(container.querySelector('[data-repair-type-selected]')).toBeNull();
  });

  it('replaces only the finder area with the selected-device module', () => {
    const { container } = render(<RepairTypeHubPage
      data={data}
      selectedDevice={{ brand: 'Huawei', model: 'P30', repairName: 'Screen Replacement', priceLabel: 'Quote on Request', bookingHref: '/book-repair' }}
      changeModelHref="/repairs/screen-replacement#repair-type-model-finder"
    />);
    expect(container.querySelector('[data-repair-type-finder]')).toBeNull();
    expect(container.querySelector('[data-repair-type-selected]')).toHaveTextContent('P30');
  });
});
