/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ServiceSchema } from './ServiceSchema';

vi.mock('next/script', () => ({ default: (props: React.ScriptHTMLAttributes<HTMLScriptElement>) => <script {...props} /> }));

describe('ServiceSchema', () => {
  it('emits the Service JSON-LD in server markup without a client Script wrapper', () => {
    const html = renderToStaticMarkup(
      <ServiceSchema
        serviceName="Screen Replacement Services in Ringwood"
        description="Choose your supported phone model for screen replacement."
        url="https://www.alimobile.com.au/repairs/screen-replacement"
      />,
    );

    expect(html).toContain('<script id="service-schema" type="application/ld+json">');
    expect(html).toContain('"@type":"Service"');
  });

  it('renders a page-specific Service that references the canonical LocalBusiness', () => {
    const url = 'https://www.alimobile.com.au/repairs/screen-replacement';
    const { container } = render(
      <ServiceSchema
        serviceName="Screen Replacement Services in Ringwood"
        description="Choose your supported phone model for screen replacement."
        url={url}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    const schema = JSON.parse(script?.textContent || '{}');

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: 'Screen Replacement Services in Ringwood',
      url,
      description: 'Choose your supported phone model for screen replacement.',
      provider: { '@id': 'https://www.alimobile.com.au/#localbusiness' },
    });
    expect(schema.provider).toEqual({ '@id': 'https://www.alimobile.com.au/#localbusiness' });
    expect(schema).not.toHaveProperty('telephone');
    expect(schema).not.toHaveProperty('address');
    expect(schema).not.toHaveProperty('geo');
    expect(schema).not.toHaveProperty('openingHoursSpecification');
  });
});
