import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./BeforeAfterSlider', () => ({
  default: ({ beforeSrc, afterSrc, beforeAlt, afterAlt }: { beforeSrc: string; afterSrc: string; beforeAlt: string; afterAlt: string }) => (
    <div data-testid="before-after-slider">Before|After|{beforeSrc}|{afterSrc}|{beforeAlt}|{afterAlt}</div>
  ),
}));

import SharedRepairPageResultsSection from './SharedRepairPageResultsSection';

const fallbackResult = {
  id: 'galaxy-s23-power',
  device_category: 'phone' as const,
  brand: 'Samsung',
  brand_slug: 'samsung',
  model: 'Galaxy S23',
  model_slug: 'galaxy-s23',
  repair_type: 'Power Button Replacement',
  repair_type_slug: 'power-button-replacement',
  image_pair_alt_text: null,
  title: 'Power button restored',
  short_description: null,
  related_repair_url: '/repairs/phone/samsung/power-button-replacement?model=galaxy-s23',
};

describe('SharedRepairPageResultsSection selected-device evidence', () => {
  it('renders same-brand fallback proof with the true model, explicit similar context, generated alt text, and its own destination in initial HTML', () => {
    const html = renderToStaticMarkup(
      <SharedRepairPageResultsSection
        initialResults={[fallbackResult]}
        repairName="Power Button Replacement"
        selectedModelSlug="galaxy-s24"
      />,
    );

    expect(html).toContain('Similar Samsung Power Button Repair');
    expect(html).toContain('Samsung Galaxy S23 · Power Button Replacement');
    expect(html).toContain('Example from another Samsung Galaxy model repaired by Ali Mobile &amp; Repair.');
    expect(html).toContain('Samsung Galaxy S23 Power Button Replacement by Ali Mobile &amp; Repair - before');
    expect(html).toContain('/media/repair-results/galaxy-s23-power/before');
    expect(html).toContain('/media/repair-results/galaxy-s23-power/after');
    expect(html).toContain('/repairs/phone/samsung/power-button-replacement?model=galaxy-s23');
    expect(html).toContain('Before');
    expect(html).toContain('After');
    expect(html).not.toContain('Samsung Galaxy S24 · Power Button Replacement');
  });

  it('renders exact proof as factual identity without the similar label', () => {
    render(
      <SharedRepairPageResultsSection
        initialResults={[{ ...fallbackResult, id: 'galaxy-s24-power', model: 'Galaxy S24', model_slug: 'galaxy-s24' }]}
        repairName="Power Button Replacement"
        selectedModelSlug="galaxy-s24"
      />,
    );

    expect(screen.getByText('Samsung Galaxy S24 · Power Button Replacement')).not.toBeNull();
    expect(screen.queryByText('Similar Samsung Power Button Repair')).toBeNull();
  });
});
