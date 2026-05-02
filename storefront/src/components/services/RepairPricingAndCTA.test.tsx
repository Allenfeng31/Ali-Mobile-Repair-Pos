/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import RepairPricingAndCTA from './RepairPricingAndCTA';
import React from 'react';

// Track router.push calls
const mockPush = vi.fn();

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  analytics: {
    trackBookRepair: vi.fn(),
    trackCallNow: vi.fn(),
  },
}));

describe('RepairPricingAndCTA Interactive Pricing Cards', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockVariants = [
    { quality_grade: 'Standard', price: 170 },
    { quality_grade: 'Premium', price: 190 },
    { quality_grade: 'Genuine', price: 320 },
  ];

  const defaultProps = {
    brandName: 'iPhone',
    modelName: 'iPhone 13 Pro Max',
    repairName: 'Screen Replacement',
    variants: mockVariants,
  };

  // ── Step 1: Interactive Card State ─────────────────────────────────────────

  it('renders all pricing cards as interactive buttons with role="button"', () => {
    render(<RepairPricingAndCTA {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button', { name: /select .+ tier/i });
    expect(buttons.length).toBe(3);
  });

  it('clicking a card selects it (sets aria-pressed to true)', () => {
    render(<RepairPricingAndCTA {...defaultProps} />);
    
    const premiumCard = screen.getByRole('button', { name: /select premium tier/i });
    expect(premiumCard.getAttribute('aria-pressed')).toBe('false');
    
    fireEvent.click(premiumCard);
    expect(premiumCard.getAttribute('aria-pressed')).toBe('true');
  });

  it('clicking a selected card deselects it (toggle behavior)', () => {
    render(<RepairPricingAndCTA {...defaultProps} />);
    
    const premiumCard = screen.getByRole('button', { name: /select premium tier/i });
    
    // Select
    fireEvent.click(premiumCard);
    expect(premiumCard.getAttribute('aria-pressed')).toBe('true');
    
    // Deselect
    fireEvent.click(premiumCard);
    expect(premiumCard.getAttribute('aria-pressed')).toBe('false');
  });

  it('selecting one card deselects any previously selected card', () => {
    render(<RepairPricingAndCTA {...defaultProps} />);
    
    const standardCard = screen.getByRole('button', { name: /select standard tier/i });
    const premiumCard = screen.getByRole('button', { name: /select premium tier/i });
    
    fireEvent.click(standardCard);
    expect(standardCard.getAttribute('aria-pressed')).toBe('true');
    
    fireEvent.click(premiumCard);
    expect(premiumCard.getAttribute('aria-pressed')).toBe('true');
    expect(standardCard.getAttribute('aria-pressed')).toBe('false');
  });

  // ── Step 2: Routing Validation & URL ────────────────────────────────────────

  it('blocks routing when no tier is selected and shows alert', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<RepairPricingAndCTA {...defaultProps} />);
    
    const bookBtn = screen.getByRole('button', { name: /book repair now/i });
    fireEvent.click(bookBtn);
    
    expect(alertSpy).toHaveBeenCalledWith('Please select a screen quality tier first.');
    expect(mockPush).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('routes with tier param when a tier IS selected', () => {
    render(<RepairPricingAndCTA {...defaultProps} />);
    
    // Select Premium
    const premiumCard = screen.getByRole('button', { name: /select premium tier/i });
    fireEvent.click(premiumCard);
    
    // Click Book
    const bookBtn = screen.getByRole('button', { name: /book repair now/i });
    fireEvent.click(bookBtn);
    
    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0][0];
    expect(url).toContain('tier=Premium');
    expect(url).toContain('brand=iPhone');
    expect(url).toContain('model=iPhone%2013%20Pro%20Max');
    expect(url).toContain('service=Screen%20Replacement');
  });

  it('allows routing without tier selection when only one variant exists', () => {
    render(
      <RepairPricingAndCTA 
        {...defaultProps} 
        variants={[{ quality_grade: 'Standard', price: 150 }]}
      />
    );
    
    const bookBtn = screen.getByRole('button', { name: /book repair now/i });
    fireEvent.click(bookBtn);
    
    expect(mockPush).toHaveBeenCalledTimes(1);
    const url = mockPush.mock.calls[0][0];
    expect(url).toContain('tier=Standard');
  });

  // ── Step 3: Nuclear Spacer & Layout ──────────────────────────────────────────

  it('has a physical spacer div between grid and CTA', () => {
    const { container } = render(<RepairPricingAndCTA {...defaultProps} />);
    
    const spacer = container.querySelector('[aria-hidden="true"].h-16');
    expect(spacer).toBeTruthy();
    
    // Spacer should be between grid and CTA
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    
    // Walk siblings from grid: next should be spacer, then CTA
    expect(grid?.nextElementSibling).toBe(spacer);
    expect(spacer?.nextElementSibling?.querySelector('button')).toBeTruthy();
  });

  it('CTA container is constrained to max-w-sm and flex-col', () => {
    const { container } = render(<RepairPricingAndCTA {...defaultProps} />);
    
    const spacer = container.querySelector('[aria-hidden="true"]');
    const ctaContainer = spacer?.nextElementSibling;
    
    expect(ctaContainer?.className).toContain('flex-col');
    expect(ctaContainer?.className).toContain('max-w-sm');
    expect(ctaContainer?.className).toContain('items-center');
  });

  it('CTA container has no absolute or fixed positioning', () => {
    const { container } = render(<RepairPricingAndCTA {...defaultProps} />);
    
    const spacer = container.querySelector('[aria-hidden="true"]');
    const ctaContainer = spacer?.nextElementSibling as HTMLElement;
    
    expect(ctaContainer?.className).not.toContain('absolute');
    expect(ctaContainer?.className).not.toContain('fixed');
  });
});
