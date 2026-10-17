import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('./QuoteRequestModal', () => ({ default: () => null }));

const { default: LivePricingGrid } = await import('./LivePricingGrid');

describe('LivePricingGrid', () => {
  it('keeps quote-only items and the booking route while describing published pricing accurately', () => {
    const html = renderToStaticMarkup(
      <LivePricingGrid
        title="Laptop Repair Price Check"
        deviceType="computer"
        defaultItems={[{ model: 'Laptop', service: 'Battery replacement', price: 0 }]}
      />,
    );

    expect(html).toContain('Request Quote');
    expect(html).toContain('Published prices are shown where available. For other repairs, contact us to confirm options and request a quote.');
    expect(html).toContain('href="/book-repair"');
    expect(html).toContain('Book a Repair');
    expect(html).not.toMatch(/queried live from our backend POS system|Live Repair Quote/i);
  });
});
