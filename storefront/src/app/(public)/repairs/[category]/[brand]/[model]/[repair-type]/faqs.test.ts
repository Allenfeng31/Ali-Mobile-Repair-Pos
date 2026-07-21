import { describe, it, expect, vi } from 'vitest';
import { generateFaqs } from './repairFaqs';
import {
  STANDARD_WARRANTY_SUMMARY,
  WATER_DAMAGE_WARRANTY_SUMMARY,
} from '@/lib/repairPolicy';

// Mocking Lucide icons and other components that might be imported in page.tsx
// Since we are only testing the logic of generateFaqs, we just need to ensure the import doesn't fail.
vi.mock('lucide-react', () => ({
  Zap: () => null,
  ShieldCheck: () => null,
  CheckCircle: () => null,
  Droplet: () => null,
  Battery: () => null,
  Smartphone: () => null,
  Plug: () => null,
  Wrench: () => null,
  ShieldAlert: () => null,
}));

vi.mock('next/link', () => ({
  default: ({ children }: any) => children,
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('generateFaqs', () => {
  it('should inject the screen tier comparison FAQ for iPhone screen repairs', () => {
    const faqs = generateFaqs('iPhone 13', 'Screen Replacement', 'screen-replacement', 0, 'A2633', 'Apple');
    
    const comparisonFaq = faqs.find(f => f.question.includes('difference between Standard, Premium, and Genuine'));
    expect(comparisonFaq).toBeDefined();
    expect(comparisonFaq?.answer).toContain('Standard aftermarket');
    expect(comparisonFaq?.answer).toContain('Premium aftermarket');
    expect(comparisonFaq?.answer).toContain('Genuine');
  });

  it('should generate correctly with fallback values if exact brand missing', () => {
    // If brand doesn't perfectly match our known cases, it shouldn't crash
    const faqs = generateFaqs('iPhone 13', 'Screen Replacement', 'screen-replacement', 0, 'A2633', 'iPhone');
    
    const comparisonFaq = faqs.find(f => f.question.includes('difference between Standard, Premium, and Genuine'));
    expect(comparisonFaq).toBeDefined();
  });

  it('should NOT inject the comparison FAQ for non-Apple brands', () => {
    const faqs = generateFaqs('Galaxy S21', 'Screen Replacement', 'screen-replacement', 200, 'SM-G991B', 'Samsung');
    
    const comparisonFaq = faqs.find(f => f.question.includes('difference between Standard, Premium, and Genuine'));
    expect(comparisonFaq).toBeUndefined();
  });

  it('should NOT inject the comparison FAQ for non-screen repairs on iPhone', () => {
    const faqs = generateFaqs('iPhone 13', 'Battery Replacement', 'battery-replacement', 80, 'A2633', 'Apple');
    
    const comparisonFaq = faqs.find(f => f.question.includes('difference between Standard, Premium, and Genuine'));
    expect(comparisonFaq).toBeUndefined();
  });

  it.each(['water-damage-repair', 'water-damage'])('uses the no-warranty FAQ policy for %s', (repairSlug) => {
    const faqs = generateFaqs('iPhone 15', 'Water Damage Repair', repairSlug, 50, 'A3090', 'Apple');
    const warrantyFaq = faqs.find((faq) => faq.question.startsWith('Is there a warranty'));

    expect(warrantyFaq?.answer).toBe(WATER_DAMAGE_WARRANTY_SUMMARY);
    expect(warrantyFaq?.answer).not.toContain(STANDARD_WARRANTY_SUMMARY);
  });
});
