/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import RepairTypeHubCrawlerLinkIndex from './RepairTypeHubCrawlerLinkIndex';

const categories = [
  {
    category: 'phone',
    categoryLabel: 'Phone',
    brands: [
      {
        brand: 'Samsung',
        brandSlug: 'samsung',
        models: [{
          category: 'phone', categoryLabel: 'Phone', brand: 'Samsung', brandSlug: 'samsung',
          model: 'Galaxy S24', modelSlug: 'galaxy-s24', repairName: 'Screen Replacement', repairSlug: 'screen-replacement',
          price: 199, href: '/repairs/phone/samsung/galaxy-s24/screen-replacement', destination: 'detail',
        }],
      },
      {
        brand: 'Huawei',
        brandSlug: 'huawei',
        models: [{
          category: 'phone', categoryLabel: 'Phone', brand: 'Huawei', brandSlug: 'huawei',
          model: 'P30 Pro', modelSlug: 'p30-pro', repairName: 'Screen Replacement', repairSlug: 'screen-replacement',
          price: 199, href: '/repairs/phone/huawei/p30-pro/screen-replacement', destination: 'detail',
        }],
      },
      {
        brand: 'Motorola',
        brandSlug: 'motorola',
        models: [{
          category: 'phone', categoryLabel: 'Phone', brand: 'Motorola', brandSlug: 'motorola',
          model: 'Future Phone', modelSlug: 'future-phone', repairName: 'Screen Replacement', repairSlug: 'screen-replacement',
          price: 119, href: '/repairs/screen-replacement?brand=motorola&model=future-phone', destination: 'hub-selected',
        }],
      },
    ],
  },
  {
    category: 'tablet',
    categoryLabel: 'Tablet',
    brands: [{
      brand: 'iPad',
      brandSlug: 'ipad',
      models: [{
        category: 'tablet', categoryLabel: 'Tablet', brand: 'iPad', brandSlug: 'ipad',
        model: 'iPad Pro', modelSlug: 'ipad-pro', repairName: 'Screen Replacement', repairSlug: 'screen-replacement',
        price: 299, href: '/repairs/tablet/ipad/ipad-pro/screen-replacement', destination: 'detail',
      }],
    }],
  },
] as const;

describe('RepairTypeHubCrawlerLinkIndex', () => {
  it('renders every already-authorized destination as a server-visible anchor', () => {
    const { container } = render(<RepairTypeHubCrawlerLinkIndex categories={categories} />);
    const links = Array.from(container.querySelectorAll('a'));

    expect(container.querySelector('details')).not.toHaveAttribute('open');
    expect(container.querySelectorAll('details')).toHaveLength(1);
    expect(container.querySelectorAll('h3')).toHaveLength(2);
    expect(container.querySelectorAll('h4')).toHaveLength(4);
    expect(links).toHaveLength(4);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/repairs/phone/samsung/galaxy-s24/screen-replacement',
      '/repairs/phone/huawei/p30-pro/screen-replacement',
      '/repairs/screen-replacement?brand=motorola&model=future-phone',
      '/repairs/tablet/ipad/ipad-pro/screen-replacement',
    ]);
    expect(container).toHaveTextContent('Browse all supported repair pages');
    expect(container).toHaveTextContent('Galaxy S24');
    expect(container).not.toHaveTextContent('Samsung Galaxy S24 Screen Replacement');
  });
});
