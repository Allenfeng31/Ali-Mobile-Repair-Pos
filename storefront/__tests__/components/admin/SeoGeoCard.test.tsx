import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SeoGeoCard } from '@/components/admin/SeoGeoCard';

describe('Admin Dashboard — SEO & GEO Scout Card', () => {
  
  it('should render the card with correct UI copy and route link for SUPER_ADMIN', () => {
    render(<SeoGeoCard role="SUPER_ADMIN" />);

    // Using bulletproof vanilla Vitest matchers to bypass jest-dom config limits
    expect(screen.getByText('SEO & GEO Scout')).toBeDefined();
    expect(
      screen.getByText('Automated Keyword Scraping & Content Generation')
    ).toBeDefined();

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/admin/seo');
  });

  it('should completely hide the card and return null for STAFF accounts', () => {
    const { container } = render(<SeoGeoCard role="STAFF" />);
    expect(container.firstChild).toBeNull();
  });

  it('should completely hide the card and return null for MANAGER accounts', () => {
    const { container } = render(<SeoGeoCard role="MANAGER" />);
    expect(container.firstChild).toBeNull();
  });
});