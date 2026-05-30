import { describe, it, expect, vi } from 'vitest';
import { generateFaqs } from './repairFaqs';

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
    expect(comparisonFaq?.answer).toContain('Standard (In-cell LCD)');
    expect(comparisonFaq?.answer).toContain('Premium (Soft OLED)');
    expect(comparisonFaq?.answer).toContain('Genuine (OEM)');
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
});
