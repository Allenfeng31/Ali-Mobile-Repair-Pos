import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LocalBusinessSchema, RepairServiceSchema } from './SchemaOrg';

function repairServiceData(price?: string) {
  const element = RepairServiceSchema({
    serviceName: 'iPhone 13 Screen Replacement in Ringwood',
    description: 'Repair description',
    price,
    url: 'https://www.alimobile.com.au/repairs/phone/iphone/iphone-13/screen-replacement',
  }) as ReactElement<{ data: Record<string, unknown> }>;

  return element.props.data;
}

describe('RepairServiceSchema offer policy', () => {
  it('keeps a numeric AUD Offer without an unsupported availability claim', () => {
    const data = repairServiceData('249');

    expect(data).toMatchObject({
      offers: {
        '@type': 'Offer',
        price: '249.00',
        priceCurrency: 'AUD',
      },
    });
    expect((data.offers as Record<string, unknown>).availability).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain('Product');
    expect(JSON.stringify(data)).not.toContain('AggregateOffer');
  });

  it.each([undefined, '0', 'not-a-price'])('does not create an Offer for %j', (price) => {
    expect(repairServiceData(price)).not.toHaveProperty('offers');
  });

  it.each(['250', '85'])('keeps the resolved OPPO Find X8 Pro price as the Offer amount', (price) => {
    expect(repairServiceData(price)).toMatchObject({
      offers: {
        price: `${Number(price).toFixed(2)}`,
        priceCurrency: 'AUD',
      },
    });
  });
});

describe('LocalBusinessSchema rendering', () => {
  it('renders one parseable MobilePhoneStore JSON-LD script for the canonical local business', () => {
    const { container } = render(<LocalBusinessSchema />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');

    expect(scripts).toHaveLength(1);

    const schema = JSON.parse(scripts[0].textContent ?? '');
    expect(schema['@type']).toBe('MobilePhoneStore');
    expect(schema['@id']).toBe('https://www.alimobile.com.au/#localbusiness');
  });
});
