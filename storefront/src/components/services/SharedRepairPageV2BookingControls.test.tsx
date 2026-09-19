/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ search: 'model=pixel-8' }));
const routerReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: routerReplace }),
  useSearchParams: () => new URLSearchParams(state.search),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
}));

import SharedRepairPageV2BookingControls from './SharedRepairPageV2BookingControls';
import SharedRepairPageV2ModelSections from './SharedRepairPageV2ModelSections';
import type { SharedRepairPageCandidate, SharedRepairPageSupportedModel } from '@/lib/sharedRepairPageV2';
import { getVirtualPhoneRepairHeading } from './VirtualPhoneRepairLandingPage';

const supportedModels: SharedRepairPageSupportedModel[] = [
  { category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8', modelSlug: 'pixel-8' },
  { category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 9', modelSlug: 'pixel-9' },
  { category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 9a', modelSlug: 'pixel-9a' },
  { category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 10a', modelSlug: 'pixel-10a' },
  { category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 6 Pro', modelSlug: 'pixel-6-pro' },
];

const candidates: SharedRepairPageCandidate[] = [
  {
    category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8', modelSlug: 'pixel-8', repairSlug: 'loudspeaker-replacement', repairName: 'Loudspeaker Replacement',
    repair: { slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 129, repairOrigin: 'pos' },
    pricing: { resolvedPrice: 129, validVariants: [], source: 'base', isQuoteOnly: false, canEmitOffer: true },
  },
  {
    category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 9', modelSlug: 'pixel-9', repairSlug: 'loudspeaker-replacement', repairName: 'Loudspeaker Replacement',
    repair: { slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 149, repairOrigin: 'pos' },
    pricing: { resolvedPrice: 149, validVariants: [{ quality_grade: 'Standard', price: 149 }, { quality_grade: 'Premium', price: 169 }], source: 'variant', isQuoteOnly: false, canEmitOffer: true },
  },
];

const loudspeakerQuickAnswers = {
  repairTime: '30–60 minutes',
  partsSameDay: 'Call to confirm parts availability and same-day repair. Parts usually need to be ordered 1 day in advance.',
  warranty: '6 months warranty',
};

const cameraLensCandidates: SharedRepairPageCandidate[] = [
  {
    category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8', modelSlug: 'pixel-8', repairSlug: 'camera-lens-replacement', repairName: 'Camera Lens Replacement',
    repair: { slug: 'camera-lens-replacement', name: 'Camera Lens Replacement', price: 89, repairOrigin: 'pos' },
    pricing: { resolvedPrice: 89, validVariants: [{ quality_grade: 'Standard', price: 89 }, { quality_grade: 'Premium', price: 109 }], source: 'variant', isQuoteOnly: false, canEmitOffer: true },
  },
];

describe('Shared Page V2 Google Pixel Loudspeaker controls', () => {
  beforeEach(() => {
    state.search = 'model=pixel-8';
  });

  it('keeps exact pricing, model selection, and booking central before the three supporting boxes', () => {
    render(<SharedRepairPageV2BookingControls basePath="/repairs/phone/google/loudspeaker-replacement" brandSlug="google-pixel" brandName="Google Pixel" repairName="Loudspeaker Replacement" supportedModels={supportedModels} priceCandidates={candidates} quickAnswers={loudspeakerQuickAnswers} />);

    expect(screen.getByText('$129')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose your Google Pixel model')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', expect.stringContaining('model=Pixel+8'));
    expect(screen.getByRole('heading', { name: 'Repair Time' })).toBeInTheDocument();
    expect(screen.getByText('30–60 minutes')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Parts / Same-Day' })).toBeInTheDocument();
    expect(screen.getByText(/Parts usually need to be ordered 1 day in advance/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /0481 058 514/ })).toHaveAttribute('href', 'tel:0481058514');
    expect(screen.getByRole('heading', { name: 'Warranty' })).toBeInTheDocument();
    expect(screen.getByText('6 months warranty')).toBeInTheDocument();
    expect(screen.queryByText(/in stock/i)).toBeNull();
    expect(screen.queryByText(/same-day repair is guaranteed/i)).toBeNull();
  });

  it('keeps a supported Pixel 9a selected with quote-safe pricing and model-aware booking without a POS price candidate', () => {
    state.search = 'model=pixel-9a';
    render(<SharedRepairPageV2BookingControls basePath="/repairs/phone/google/loudspeaker-replacement" brandSlug="google-pixel" brandName="Google Pixel" repairName="Loudspeaker Replacement" supportedModels={supportedModels} priceCandidates={candidates} quickAnswers={loudspeakerQuickAnswers} />);

    expect(screen.getByLabelText('Choose your Google Pixel model')).toHaveValue('pixel-9a');
    expect(screen.getByText('Quote on Request')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', expect.stringContaining('model=Pixel+9a'));
  });

  it('keeps a catalogue-only Pixel 10a selected, quote-safe, and model-aware without a price candidate', () => {
    state.search = 'model=pixel-10a';
    render(<SharedRepairPageV2BookingControls basePath="/repairs/phone/google/loudspeaker-replacement" brandSlug="google-pixel" brandName="Google Pixel" repairName="Loudspeaker Replacement" supportedModels={supportedModels} priceCandidates={candidates} quickAnswers={loudspeakerQuickAnswers} />);

    expect(screen.getByLabelText('Choose your Google Pixel model')).toHaveValue('pixel-10a');
    expect(screen.getByText('Quote on Request')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', expect.stringContaining('model=Pixel+10a'));
  });

  it('uses the fixed Camera Lens price regardless of the exact POS candidate', () => {
    state.search = 'model=pixel-8';
    render(<SharedRepairPageV2BookingControls
      basePath="/repairs/phone/google/camera-lens-replacement"
      brandSlug="google-pixel"
      brandName="Google Pixel"
      repairName="Camera Lens Replacement"
      supportedModels={supportedModels}
      priceCandidates={cameraLensCandidates}
      pricingStrategy={{ mode: 'fixed', fixedPrice: 50 }}
      quickAnswers={{
        repairTime: 'Contact us to confirm repair time.',
        partsSameDay: 'Call to confirm parts availability.',
        warranty: 'Warranty applies to eligible standard repairs and the completed repair scope.',
      }}
    />);

    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.queryByText('From $50')).toBeNull();
    const booking = new URL(screen.getByRole('link', { name: /Book Repair Now/ }).getAttribute('href')!, 'https://www.alimobile.com.au');
    expect(booking.searchParams.get('category')).toBe('phone');
    expect(booking.searchParams.get('brand')).toBe('Google Pixel');
    expect(booking.searchParams.get('model')).toBe('Pixel 8');
    expect(booking.searchParams.get('service')).toBe('Camera Lens Replacement');
  });

  it('keeps a catalogue-only Camera Lens model selected at the fixed price', () => {
    state.search = 'model=pixel-10a';
    render(<SharedRepairPageV2BookingControls
      basePath="/repairs/phone/google/camera-lens-replacement"
      brandSlug="google-pixel"
      brandName="Google Pixel"
      repairName="Camera Lens Replacement"
      supportedModels={supportedModels}
      priceCandidates={cameraLensCandidates}
      pricingStrategy={{ mode: 'fixed', fixedPrice: 50 }}
      quickAnswers={{
        repairTime: 'Contact us to confirm repair time.',
        partsSameDay: 'Call to confirm parts availability.',
        warranty: 'Warranty applies to eligible standard repairs and the completed repair scope.',
      }}
    />);

    expect(screen.getByLabelText('Choose your Google Pixel model')).toHaveValue('pixel-10a');
    expect(screen.getByText('$50')).toBeInTheDocument();
    const booking = new URL(screen.getByRole('link', { name: /Book Repair Now/ }).getAttribute('href')!, 'https://www.alimobile.com.au');
    expect(booking.searchParams.get('model')).toBe('Pixel 10a');
  });

  it('shows the Camera Lens fixed price before a model is selected', () => {
    state.search = '';
    render(<SharedRepairPageV2BookingControls
      basePath="/repairs/phone/google/camera-lens-replacement"
      brandSlug="google-pixel"
      brandName="Google Pixel"
      repairName="Camera Lens Replacement"
      supportedModels={supportedModels}
      priceCandidates={[]}
      pricingStrategy={{ mode: 'fixed', fixedPrice: 50 }}
      quickAnswers={{ repairTime: 'Contact us to confirm repair time.', partsSameDay: 'Call to confirm parts availability.', warranty: 'Warranty applies to eligible standard repairs and the completed repair scope.' }}
    />);

    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.queryByText('Quote on Request')).toBeNull();
  });

  it('uses conservative Earpiece Speaker quick answers without inheriting Loudspeaker timing', () => {
    state.search = 'model=pixel-9a';
    render(<SharedRepairPageV2BookingControls
      basePath="/repairs/phone/google/earpiece-speaker-replacement"
      brandSlug="google-pixel"
      brandName="Google Pixel"
      repairName="Earpiece Speaker Replacement"
      supportedModels={supportedModels}
      priceCandidates={[]}
      quickAnswers={{
        repairTime: 'Contact us to confirm repair time.',
        partsSameDay: 'Call to confirm parts availability.',
        warranty: 'Warranty applies to eligible standard repairs and the completed repair scope.',
      }}
    />);

    expect(screen.getByLabelText('Choose your Google Pixel model')).toHaveValue('pixel-9a');
    expect(screen.getByText('Quote on Request')).toBeInTheDocument();
    expect(screen.getByText('Contact us to confirm repair time.')).toBeInTheDocument();
    expect(screen.getByText('Call to confirm parts availability.')).toBeInTheDocument();
    expect(screen.getByText('Warranty applies to eligible standard repairs and the completed repair scope.')).toBeInTheDocument();
    expect(screen.queryByText('30–60 minutes')).toBeNull();
    expect(screen.getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', expect.stringContaining('model=Pixel+9a'));
  });

  it.each([
    ['power-button-replacement', 'Power Button Replacement'],
    ['volume-button-replacement', 'Volume Button Replacement'],
  ] as const)('uses conservative %s quick answers with selected-model booking', (repairSlug, repairName) => {
    state.search = 'model=pixel-9a';
    render(<SharedRepairPageV2BookingControls
      basePath={`/repairs/phone/google/${repairSlug}`}
      brandSlug="google-pixel"
      brandName="Google Pixel"
      repairName={repairName}
      supportedModels={supportedModels}
      priceCandidates={[]}
      quickAnswers={{
        repairTime: 'Contact us to confirm repair time.',
        partsSameDay: 'Call to confirm parts availability.',
        warranty: 'Warranty applies to eligible standard repairs and the completed repair scope.',
      }}
    />);

    expect(screen.getByLabelText('Choose your Google Pixel model')).toHaveValue('pixel-9a');
    expect(screen.getByText('Quote on Request')).toBeInTheDocument();
    expect(screen.getByText('Contact us to confirm repair time.')).toBeInTheDocument();
    expect(screen.queryByText('30–60 minutes')).toBeNull();
    const booking = new URL(screen.getByRole('link', { name: /Book Repair Now/ }).getAttribute('href')!, 'https://www.alimobile.com.au');
    expect(booking.searchParams.get('service')).toBe(repairName);
    expect(booking.searchParams.get('model')).toBe('Pixel 9a');
  });

  it('keeps no or invalid model query unselected', () => {
    state.search = 'model=not-a-model';
    const { rerender } = render(<SharedRepairPageV2BookingControls basePath="/repairs/phone/google/loudspeaker-replacement" brandSlug="google-pixel" brandName="Google Pixel" repairName="Loudspeaker Replacement" supportedModels={supportedModels} priceCandidates={candidates} quickAnswers={loudspeakerQuickAnswers} />);
    expect(screen.getByLabelText('Choose your Google Pixel model')).toHaveValue('');
    expect(screen.getByText('Select your model for exact pricing')).toBeInTheDocument();

    state.search = '';
    rerender(<SharedRepairPageV2BookingControls basePath="/repairs/phone/google/loudspeaker-replacement" brandSlug="google-pixel" brandName="Google Pixel" repairName="Loudspeaker Replacement" supportedModels={supportedModels} priceCandidates={candidates} quickAnswers={loudspeakerQuickAnswers} />);
    expect(screen.getByLabelText('Choose your Google Pixel model')).toHaveValue('');
  });

  it('keeps the main heading shared while rendering centred, concise model cards with crawlable model-plus-repair text', () => {
    render(<SharedRepairPageV2ModelSections supportedModels={supportedModels} priceCandidates={candidates} repairName="Loudspeaker Replacement" />);

    expect(getVirtualPhoneRepairHeading({ brandName: 'Google Pixel', brandSlug: 'google-pixel', repairName: 'Loudspeaker Replacement' })).toBe('Google Pixel Loudspeaker Replacement');
    expect(screen.getByRole('heading', { name: 'Google Pixel Loudspeaker Replacement by Model' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Google Pixel 8' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Google Pixel 9a' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Google Pixel 10a' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Google Pixel 6 Pro' })).toBeInTheDocument();
    expect(screen.queryByText('Google Pixel Pixel 6 Pro')).toBeNull();
    expect(screen.getByText('Loudspeaker replacement for Google Pixel 8.')).toBeInTheDocument();
    expect(screen.getByText('Loudspeaker replacement for Google Pixel 9a.')).toBeInTheDocument();
    expect(screen.getByText('Loudspeaker replacement for Google Pixel 10a.')).toBeInTheDocument();
    expect(screen.getByText('$129')).toBeInTheDocument();
    expect(screen.getByText('From $149')).toBeInTheDocument();
    expect(screen.getAllByText('Quote on Request')).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: 'Book Repair' })).toHaveLength(supportedModels.length);
    expect(screen.getAllByRole('link', { name: 'Book Repair' })[0]).toHaveAttribute('href', expect.stringContaining('model=Pixel+8'));
    expect(screen.getAllByRole('link', { name: 'Book Repair' })[2]).toHaveAttribute('href', expect.stringContaining('model=Pixel+9a'));
    expect(screen.queryByRole('link', { name: /google-pixel\/pixel-8/i })).toBeNull();
  });

  it('renders natural server-side model copy for Earpiece Speaker', () => {
    render(<SharedRepairPageV2ModelSections supportedModels={supportedModels} priceCandidates={[]} repairName="Earpiece Speaker Replacement" />);

    expect(getVirtualPhoneRepairHeading({ brandName: 'Google Pixel', brandSlug: 'google-pixel', repairName: 'Earpiece Speaker Replacement' })).toBe('Google Pixel Earpiece Speaker Replacement');
    expect(screen.getByRole('heading', { name: 'Google Pixel Earpiece Speaker Replacement by Model' })).toBeInTheDocument();
    expect(screen.getByText('Earpiece speaker replacement for Google Pixel 9a.')).toBeInTheDocument();
  });

  it('renders natural server-side Camera Lens model copy without a Detail link', () => {
    render(<SharedRepairPageV2ModelSections supportedModels={supportedModels} priceCandidates={cameraLensCandidates} repairName="Camera Lens Replacement" pricingStrategy={{ mode: 'fixed', fixedPrice: 50 }} />);

    expect(screen.getByRole('heading', { name: 'Google Pixel Camera Lens Replacement by Model' })).toBeInTheDocument();
    expect(screen.getByText('Camera lens replacement for Google Pixel 9a.')).toBeInTheDocument();
    expect(screen.getAllByText('$50')).toHaveLength(supportedModels.length);
    expect(screen.queryByRole('link', { name: /google-pixel\/pixel-9a/i })).toBeNull();
  });

  it.each(['Power Button Replacement', 'Volume Button Replacement'] as const)('renders natural server-side model copy for %s', (repairName) => {
    render(<SharedRepairPageV2ModelSections supportedModels={supportedModels} priceCandidates={[]} repairName={repairName} />);

    expect(screen.getByRole('heading', { name: `Google Pixel ${repairName} by Model` })).toBeInTheDocument();
    expect(screen.getByText(`${repairName.replace(' Button Replacement', ' button replacement')} for Google Pixel 9a.`)).toBeInTheDocument();
  });

  it('removes the old top booking pills for the V2 page while preserving them for unchanged shared pages', () => {
    const controls = readFileSync(resolve(process.cwd(), 'src/components/services/SharedRepairPageV2BookingControls.tsx'), 'utf8');
    const landingPage = readFileSync(resolve(process.cwd(), 'src/components/services/VirtualPhoneRepairLandingPage.tsx'), 'utf8');

    expect(controls).toContain('mx-auto flex w-full max-w-md flex-col items-center');
    expect(controls).toContain('mt-5 flex w-full max-w-sm flex-col gap-4');
    const modelSections = readFileSync(resolve(process.cwd(), 'src/components/services/SharedRepairPageV2ModelSections.tsx'), 'utf8');
    expect(modelSections).toContain('grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3');
    expect(modelSections).toContain('flex flex-col items-center text-center');
    expect(modelSections).toContain('Call to confirm parts availability.');
    expect(modelSections).not.toContain('whether same-day repair is possible');
    for (const oldPill of ['Inspection Before Work', 'Clear Quote First', 'Repair Warranty', 'Ringwood Repair Desk']) {
      expect(controls).not.toContain(oldPill);
    }
    expect(landingPage).toContain('{!sharedPageV2 ? <div className="trust-badges mt-8">');
  });
});
