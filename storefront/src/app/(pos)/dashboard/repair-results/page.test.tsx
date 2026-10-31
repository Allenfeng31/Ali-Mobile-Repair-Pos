import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RepairResultsDashboardPage from './page';

const savedResult = {
  id: '00000000-0000-4000-8000-000000000003',
  device_category: 'phone',
  brand: 'iPhone',
  brand_slug: 'iphone',
  model: 'iPhone 16 Pro',
  model_slug: 'iphone-16-pro',
  repair_type: 'Screen Replacement',
  repair_type_slug: 'screen-replacement',
  before_image_path: 'approved/result/before.webp',
  after_image_path: 'approved/result/after.webp',
  image_pair_alt_text: 'Saved image alt',
  image_aspect_ratio: '3:4',
  before_image_width: null,
  before_image_height: null,
  after_image_width: null,
  after_image_height: null,
  title: 'Saved title',
  short_description: 'Saved custom description.',
  status: 'published',
  privacy_checked: true,
  featured_on_homepage: true,
  featured_on_repair_hub: true,
  featured_on_brand_hub: true,
  sort_order: 8,
  related_repair_url: '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
  published_at: '2026-01-01T00:00:00.000Z',
};

const taxonomy = {
  categories: [{
    value: 'phone',
    label: 'Phone',
    brands: [{
      name: 'iPhone',
      slug: 'iphone',
      models: [{
        name: 'iPhone 16 Pro',
        slug: 'iphone-16-pro',
        repairTypes: [{
          name: 'Screen Replacement',
          slug: 'screen-replacement',
          relatedRepairUrl: savedResult.related_repair_url,
        }],
      }],
    }],
  }],
};

describe('Repair Results dashboard editing', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const payload = url.includes('view=taxonomy') ? { data: taxonomy } : { data: [savedResult] };
      return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } });
    }));
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('starts with advanced fields expanded and fully prepopulates an existing published result', async () => {
    const { container } = render(<RepairResultsDashboardPage />);

    expect(container.querySelector('details')?.open).toBe(true);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));

    expect((screen.getByLabelText(/Short description/i) as HTMLTextAreaElement).value).toBe(savedResult.short_description);
    expect((screen.getByLabelText(/^Title/i) as HTMLInputElement).value).toBe(savedResult.title);
    expect((screen.getByLabelText(/Image alt text/i) as HTMLInputElement).value).toBe(savedResult.image_pair_alt_text);
    expect((screen.getByLabelText(/Image aspect ratio/i) as HTMLInputElement).value).toBe('3:4');
    expect((screen.getByLabelText(/Sort order/i) as HTMLInputElement).value).toBe('8');
    expect((screen.getByLabelText(/Canonical related repair URL/i) as HTMLInputElement).value).toBe(savedResult.related_repair_url);
    expect((screen.getByLabelText(/Featured on Homepage/i) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Feature on Repair Hub/i) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Feature on Brand Repair Hub/i) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Save as/i) as HTMLSelectElement).value).toBe('published');
    expect(screen.getByText(savedResult.before_image_path)).toBeTruthy();
    expect(screen.getByText(savedResult.after_image_path)).toBeTruthy();
    expect(screen.getAllByText('Custom edited')).toHaveLength(2);
  });

  it('protects custom text before applying a preset and keeps the result editable', async () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<RepairResultsDashboardPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const description = screen.getByLabelText(/Short description/i) as HTMLTextAreaElement;
    const preset = screen.getByRole('button', { name: 'Use No Display preset' });

    fireEvent.click(preset);
    expect(description.value).toBe(savedResult.short_description);
    fireEvent.click(preset);
    await waitFor(() => expect(description.value).toContain('iPhone 16 Pro'));
    fireEvent.change(description, { target: { value: 'Technician verified custom wording.' } });
    expect(description.value).toBe('Technician verified custom wording.');
    expect(screen.getAllByText('Custom edited')).toHaveLength(2);
  });
});
