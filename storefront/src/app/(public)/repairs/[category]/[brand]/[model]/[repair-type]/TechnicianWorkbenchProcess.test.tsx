/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { getOppoScreenPocket } from '@/lib/seo/content/oppo/screen-replacement';
import { getAliMobileEnhancedSamsungTabletSeoPocket } from '@/lib/seo/content/samsung-tablet';

import TechnicianWorkbenchProcess from './TechnicianWorkbenchProcess';

afterEach(cleanup);

describe('TechnicianWorkbenchProcess identity-safe headings', () => {
  it('uses a neutral fallback for the real OPPO Reno 9 Pro screen pocket', () => {
    const oppoPocket = getOppoScreenPocket('reno-9-pro');

    if (!oppoPocket) {
      throw new Error('Expected the OPPO Reno 9 Pro screen pocket');
    }

    render(<TechnicianWorkbenchProcess pocket={oppoPocket} />);

    const fallbackHeading = screen.getByRole('heading', {
      level: 3,
      name: 'Which repair path fits your device?',
    });

    expect(fallbackHeading).toBeInTheDocument();
    expect(fallbackHeading).not.toHaveTextContent('Which repair path fits this iPhone 13?');

    for (const brandOrModel of ['iPhone', 'Samsung', 'Google Pixel', 'OPPO', 'MacBook', 'Apple Watch']) {
      expect(fallbackHeading).not.toHaveTextContent(brandOrModel);
    }
  });

  it('preserves an existing Samsung Tablet custom option heading', () => {
    const samsungTabletPocket = getAliMobileEnhancedSamsungTabletSeoPocket({
      modelSlug: 'galaxy-tab-a8-sm-x200-sm-x205',
      repairSlug: 'battery-replacement',
    });

    if (!samsungTabletPocket) {
      throw new Error('Expected the Galaxy Tab A8 battery pocket');
    }

    render(<TechnicianWorkbenchProcess pocket={samsungTabletPocket} />);

    expect(screen.getByRole('heading', {
      level: 3,
      name: 'What do we check before Galaxy Tab A8 (SM-X200 / SM-X205) battery replacement?',
    })).toBeInTheDocument();
    expect(screen.queryByText('Which repair path fits your device?')).not.toBeInTheDocument();
  });
});
