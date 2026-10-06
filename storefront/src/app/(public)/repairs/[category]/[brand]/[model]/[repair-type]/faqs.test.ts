import { describe, it, expect, vi } from 'vitest';
import {
  generateFaqs,
  withApprovedTurnaroundFaq,
  withResolvedTierPriceFaq,
} from './repairFaqs';
import type { RepairDetailPricing } from '@/lib/repairDetailPricing';
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

  it.each(['screen-replacement', 'battery-replacement'])('uses the standard part-and-labour policy for %s', (repairSlug) => {
    const faqs = generateFaqs('iPhone 15', 'Standard Repair', repairSlug, 50, 'A3090', 'Apple');
    const warrantyFaq = faqs.find((faq) => faq.question.startsWith('Is there a warranty'));

    expect(warrantyFaq?.answer).toBe(STANDARD_WARRANTY_SUMMARY);
    expect(warrantyFaq?.answer).toContain('replacement part and labour');
  });

  it.each(['logic-board-repair', 'data-recovery'])('does not make outcome or whole-device guarantees for %s', (repairSlug) => {
    const faqs = generateFaqs('iPhone 15', 'Assessment Service', repairSlug, 50, 'A3090', 'Apple');
    const answers = faqs.map((faq) => faq.answer).join(' ');

    expect(answers).not.toMatch(/guaranteed successful repair/i);
    expect(answers).not.toMatch(/guaranteed data recovery/i);
    expect(answers).not.toMatch(/unconditional whole[- ]device warranty/i);
  });
});

describe('withResolvedTierPriceFaq', () => {
  const priceQuestion = 'How much will my iPhone 16 Pro screen repair cost?';
  const existingFaqs = [
    { question: 'Will I lose my photos?', answer: 'Back up your phone first.' },
    {
      question: priceQuestion,
      answer: 'The final quote depends on the display option, model, parts availability and device condition. We confirm the price with you before any repair work begins.',
    },
    { question: 'Will Face ID still work?', answer: 'We check the front sensor area.' },
  ];

  const pricing = (validVariants: RepairDetailPricing['validVariants']): RepairDetailPricing => ({
    resolvedPrice: validVariants.length ? Math.min(...validVariants.map((variant) => variant.price)) : null,
    validVariants,
    source: validVariants.length ? 'variant' : 'none',
    isQuoteOnly: validVariants.length === 0,
    canEmitOffer: validVariants.length > 0,
  });

  it('keeps the existing price answer unchanged when no priced tier is available', () => {
    expect(withResolvedTierPriceFaq({
      faqs: existingFaqs,
      question: priceQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      pricing: pricing([]),
    })).toEqual(existingFaqs);
  });

  it('answers one priced tier with its current price, name, and existing description', () => {
    const faqs = withResolvedTierPriceFaq({
      faqs: existingFaqs,
      question: priceQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      pricing: pricing([{ quality_grade: 'Standard', price: 321 }]),
    });

    expect(faqs[1]?.answer).toContain('$321');
    expect(faqs[1]?.answer).toContain('Standard option');
    expect(faqs[1]?.answer).toContain('Industry-standard replacement part with reliable performance.');
  });

  it('lists every priced tier using the live resolved price and shared description', () => {
    const faqs = withResolvedTierPriceFaq({
      faqs: existingFaqs,
      question: priceQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      pricing: pricing([
        { quality_grade: 'Genuine', price: 987 },
        { quality_grade: 'Premium', price: 654 },
        { quality_grade: 'Standard', price: 321 },
      ]),
    });

    expect(faqs[1]?.answer).toContain('Standard – $321. Industry-standard replacement part with reliable performance.');
    expect(faqs[1]?.answer).toContain('Premium – $654. Top-tier aftermarket display selected for strong colour, touch response and daily reliability.');
    expect(faqs[1]?.answer).toContain('Genuine – $987. Original equipment display where available, selected for the closest match to factory display performance.');
  });

  it('keeps unknown tiers with their current price and the neutral screen fallback', () => {
    const faqs = withResolvedTierPriceFaq({
      faqs: existingFaqs,
      question: priceQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      pricing: pricing([
        { quality_grade: 'Service Pack', price: 777 },
        { quality_grade: 'Standard', price: 321 },
        { quality_grade: 'Pulled Genuine', price: 654 },
      ]),
    });

    const answer = faqs[1]?.answer ?? '';
    expect(answer).toContain('Standard – $321. Industry-standard replacement part with reliable performance.');
    expect(answer).toContain('Service Pack – $777. Current screen option for this model. We confirm the suitable option before work begins.');
    expect(answer).toContain('Pulled Genuine – $654. Current screen option for this model. We confirm the suitable option before work begins.');
    expect(answer.indexOf('Standard – $321')).toBeLessThan(answer.indexOf('Service Pack – $777'));
    expect(answer.indexOf('Service Pack – $777')).toBeLessThan(answer.indexOf('Pulled Genuine – $654'));
  });

  it('uses a supplied neutral fallback for non-screen repair tiers', () => {
    const faqs = withResolvedTierPriceFaq({
      faqs: existingFaqs,
      question: priceQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Battery Replacement',
      pricing: pricing([{ quality_grade: 'Service Pack', price: 199 }]),
      getTierDescription: () => undefined,
      unknownTierDescription: 'Current repair option for this model. We confirm the suitable option before work begins.',
    });

    expect(faqs[1]?.answer).toContain('Service Pack option. Current repair option for this model. We confirm the suitable option before work begins.');
    expect(faqs[1]?.answer).not.toContain('Current screen option');
  });

  it('changes the FAQ when the resolved price or shared tier description changes', () => {
    const standardPricing = pricing([{ quality_grade: 'Standard', price: 321 }]);
    const changedPricing = pricing([{ quality_grade: 'Standard', price: 654 }]);

    const standard = withResolvedTierPriceFaq({
      faqs: existingFaqs,
      question: priceQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      pricing: standardPricing,
    });
    const changed = withResolvedTierPriceFaq({
      faqs: existingFaqs,
      question: priceQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      pricing: changedPricing,
      getTierDescription: () => 'Updated source description.',
    });

    expect(standard[1]?.answer).toContain('$321');
    expect(changed[1]?.answer).toContain('$654');
    expect(changed[1]?.answer).toContain('Updated source description.');
  });

  it('leaves unrelated FAQ answers unchanged', () => {
    const faqs = withResolvedTierPriceFaq({
      faqs: existingFaqs,
      question: priceQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      pricing: pricing([{ quality_grade: 'Standard', price: 321 }]),
    });

    expect(faqs[0]).toEqual(existingFaqs[0]);
    expect(faqs[2]).toEqual(existingFaqs[2]);
  });
});

describe('withApprovedTurnaroundFaq', () => {
  const timingQuestion = 'How long does iPhone 16 Pro screen replacement usually take?';
  const existingFaqs = [
    { question: timingQuestion, answer: 'Timing depends on part availability and device condition.' },
    { question: 'Will I lose my photos?', answer: 'Back up your phone first.' },
  ];

  it('uses the approved structured turnaround value for the timing answer', () => {
    const faqs = withApprovedTurnaroundFaq({
      faqs: existingFaqs,
      question: timingQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      turnaroundMinutes: 30,
    });

    expect(faqs[0]?.answer).toBe(
      'iPhone 16 Pro screen replacement usually takes around 30 minutes when the correct part is available. If additional damage is found during inspection, turnaround may vary.'
    );
    expect(faqs[0]?.answer).not.toMatch(/same-day|same day|immediate|while you wait/i);
    expect(faqs[1]).toEqual(existingFaqs[1]);
  });

  it('derives the numeric duration from the supplied turnaround value', () => {
    const faqs = withApprovedTurnaroundFaq({
      faqs: existingFaqs,
      question: timingQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
      turnaroundMinutes: 47,
    });

    expect(faqs[0]?.answer).toContain('around 47 minutes');
    expect(faqs[0]?.answer).not.toContain('30 minutes');
  });

  it('preserves the existing generic timing FAQ when no approved turnaround exists', () => {
    expect(withApprovedTurnaroundFaq({
      faqs: existingFaqs,
      question: timingQuestion,
      model: 'iPhone 16 Pro',
      repairName: 'Screen Replacement',
    })).toEqual(existingFaqs);
  });
});
