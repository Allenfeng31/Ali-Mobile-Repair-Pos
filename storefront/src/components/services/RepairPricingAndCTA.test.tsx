/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RepairPricingAndCTA from './RepairPricingAndCTA';
import React from 'react';

// Mock Next.js Link
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href, ...props }: any) => {
      return <a href={href} {...props}>{children}</a>;
    },
  };
});

// Mock analytics - using relative path to match component import if needed, 
// but vi.mock usually handles aliases if configured. 
// Let's try mocking the exact string used in the component.
vi.mock('@/lib/analytics', () => {
  return {
    analytics: {
      trackBookRepair: vi.fn(),
      trackCallNow: vi.fn(),
    },
  };
});

describe('RepairPricingAndCTA DOM Structure', () => {
  afterEach(() => {
    cleanup();
  });

  const mockVariants = [
    { quality_grade: 'Standard', price: 170 },
    { quality_grade: 'Premium', price: 190 },
    { quality_grade: 'Genuine', price: 320 },
  ];

  it('verifies that CTA wrapper is a sibling of the grid and not overlapping', () => {
    const { container } = render(
      <RepairPricingAndCTA 
        brandName="iPhone" 
        modelName="iPhone 13 Pro Max" 
        repairName="Screen Replacement" 
        variants={mockVariants}
      />
    );

    // Find the grid container
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();

    // Find the CTA container
    // It has specific classes: w-full flex flex-col items-center justify-center mt-12 mb-8 gap-4
    const ctaContainer = container.querySelector('.mt-12');
    expect(ctaContainer).toBeTruthy();

    // Verify they are siblings
    const parent = ctaContainer?.parentElement;
    expect(parent?.className).toContain('flex-col');
    expect(parent?.className).toContain('items-center');

    // Verify no absolute/fixed positioning on CTA container that would cause overlap
    const computedStyle = window.getComputedStyle(ctaContainer as HTMLElement);
    expect(computedStyle.position).not.toBe('absolute');
    expect(computedStyle.position).not.toBe('fixed');
    
    // Verify no negative margins that would pull it up
    expect(ctaContainer?.className).not.toContain('mt-[-');
    expect(ctaContainer?.className).not.toContain('-mt-');
  });

  it('verifies structure with 1 variant', () => {
    const { container } = render(
      <RepairPricingAndCTA 
        brandName="iPhone" 
        modelName="iPhone 13 Pro Max" 
        repairName="Screen Replacement" 
        variants={[mockVariants[0]]}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();

    const ctaContainer = container.querySelector('.mt-12');
    expect(ctaContainer).toBeTruthy();

    expect(grid?.nextElementSibling).toBe(ctaContainer);
  });
});
