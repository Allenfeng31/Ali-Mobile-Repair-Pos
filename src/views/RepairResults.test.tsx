/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RepairResultsView } from './RepairResults';

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }) } },
}));

vi.mock('@/hooks/useAuthStore', () => ({
  useAuthStore: () => ({ permissions: { is_super_admin: true }, isLoading: false }),
}));

const taxonomy = {
  categories: [
    { value: 'phone', label: 'Phone', brands: [{ name: 'Samsung', slug: 'samsung', models: [{ name: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [{ name: 'Screen Replacement', slug: 'screen-replacement', relatedRepairUrl: '/repairs/phone/samsung/galaxy-s24/screen-replacement' }] }] }] },
    { value: 'laptop', label: 'Laptop', brands: [{ name: 'MacBook', slug: 'macbook', models: [{ name: 'MacBook Air M2 13-inch 2022', slug: 'macbook-air-m2-13-2022', repairTypes: [{ name: 'Screen Replacement', slug: 'screen-replacement', relatedRepairUrl: '/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement' }] }] }] },
  ],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('RepairResultsView taxonomy workflow', () => {
  it('uses dependent canonical controls, generates preview text, and preserves feature choices across taxonomy changes', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve({
      ok: true,
      json: async () => url.includes('view=taxonomy') ? { data: taxonomy } : { data: [] },
    })));
    render(<RepairResultsView onBack={vi.fn()} />);

    const category = await screen.findByLabelText('Device category');
    fireEvent.change(category, { target: { value: 'laptop' } });
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'macbook' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'macbook-air-m2-13-2022' } });
    fireEvent.change(screen.getByLabelText('Repair type'), { target: { value: 'screen-replacement' } });

    expect(screen.getByDisplayValue('MacBook Air M2 13-inch 2022 Screen Replacement in Ringwood')).toBeTruthy();
    expect(screen.getByDisplayValue('/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement')).toBeTruthy();

    const homepage = screen.getByLabelText(/Featured on Homepage/i);
    fireEvent.click(homepage);
    fireEvent.change(category, { target: { value: 'phone' } });

    expect((homepage as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Brand') as HTMLSelectElement).value).toBe('');
    expect(screen.getByText('Feature selections will become publicly visible only after this result is published.')).toBeTruthy();
  });
});
