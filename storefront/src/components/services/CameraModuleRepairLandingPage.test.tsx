import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./CameraModuleRepairBookingControls', () => ({
  default: () => <div data-testid="camera-module-booking-controls" />,
}));
vi.mock('./SharedRepairHierarchySections', () => ({
  default: ({ models, selectedBrandSlug, selectedModelSlug, genericSelectionPath }: {
    models: Array<{ modelLabel: string; bookingHref: string }>;
    selectedBrandSlug?: string | null;
    selectedModelSlug?: string | null;
    genericSelectionPath?: string;
  }) => <div data-testid="camera-module-hierarchy" data-brand={selectedBrandSlug} data-model={selectedModelSlug} data-selection-path={genericSelectionPath}>{models.map((model) => <a key={model.bookingHref} href={model.bookingHref}>{model.modelLabel}</a>)}</div>,
}));
vi.mock('@/components/repair-results/SharedRepairPageResultsSection', () => ({
  default: ({ repairName, initialResults }: { repairName: string; initialResults: Array<{ id: string }> }) => initialResults.length > 0
    ? <section data-camera-module-results>Real {repairName} Results</section>
    : null,
}));
vi.mock('@/components/ReviewsSection', () => ({
  default: () => <section data-camera-module-reviews>Reviews</section>,
}));
vi.mock('next/script', () => ({ default: (props: React.ScriptHTMLAttributes<HTMLScriptElement>) => <script {...props} /> }));

import CameraModuleRepairLandingPage, { type CameraModuleRepairLandingConfig } from './CameraModuleRepairLandingPage';

const candidates = [{ canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' }];
const hierarchy = {
  models: [{ brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'p30-pro', modelLabel: 'Huawei P30 Pro', repairLabel: 'Front Camera Replacement', priceLabel: '$99', bookingHref: '/book/p30-pro' }],
  selectedBrandSlug: 'huawei',
  selectedModelSlug: 'p30-pro',
  selectedDevice: {
    selectedDevice: { brand: 'Huawei', brandSlug: 'huawei', model: 'P30 Pro', modelSlug: 'p30-pro' },
    selectedRepair: { name: 'Front Camera Replacement', serviceSlug: 'front-camera-replacement' },
    booking: { href: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Huawei&model=P30+Pro&brandSlug=huawei&modelSlug=p30-pro&serviceSlug=front-camera-replacement', isAvailable: true },
  },
};
const backHierarchy = {
  models: [{ brandSlug: 'oppo', brandLabel: 'OPPO', modelSlug: 'find-x8-pro', modelLabel: 'OPPO Find X8 Pro', repairLabel: 'Back Camera Replacement', priceLabel: null, bookingHref: '/book/find-x8-pro' }],
  selectedBrandSlug: 'oppo',
  selectedModelSlug: 'find-x8-pro',
  selectedDevice: {
    selectedDevice: { brand: 'OPPO', brandSlug: 'oppo', model: 'Find X8 Pro', modelSlug: 'find-x8-pro' },
    selectedRepair: { name: 'Back Camera Replacement', serviceSlug: 'back-camera-replacement' },
    booking: { href: '/book-repair?category=phone&service=Back+Camera+Replacement&brand=OPPO&model=Find+X8+Pro&brandSlug=oppo&modelSlug=find-x8-pro&serviceSlug=back-camera-replacement', isAvailable: true },
  },
};

const front: CameraModuleRepairLandingConfig = {
  repairSlug: 'front-camera-replacement', bookingService: 'Front Camera Replacement', title: 'Phone Front Camera Repair & Replacement', description: 'Front module assessment.', eyebrow: 'Front camera module assessment', symptoms: ['Black preview'], distinctionTitle: 'Front camera module, not screen or biometric repair', distinctionBody: 'Face ID is not guaranteed.', inspectionBody: 'Inspection first.',
};

const back: CameraModuleRepairLandingConfig = {
  repairSlug: 'back-camera-replacement', bookingService: 'Back Camera Replacement', title: 'Phone Back Camera Repair & Replacement', description: 'Back module assessment.', eyebrow: 'Back camera module assessment', symptoms: ['Blurry photos'], distinctionTitle: 'Back camera module or camera lens glass?', distinctionBody: 'Lens glass is separate.', inspectionBody: 'Inspection first.', relatedHref: '/repairs/phone/camera-lens-replacement', relatedLabel: 'Camera lens glass repair',
};

describe('CameraModuleRepairLandingPage', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('orders the hierarchy, matching repair proof, practical camera content, local links, and reviews after the hero', () => {
    const { container } = render(<CameraModuleRepairLandingPage
      config={front}
      canonicalPath="/repairs/phone/front-camera-replacement"
      candidates={candidates}
      hierarchy={hierarchy}
      initialResults={[{ id: 'front-proof' } as never]}
    />);

    const orderedSections = [
      '[data-camera-module-hero]',
      '[data-camera-module-model-selector]',
      '[data-camera-module-results]',
      '[data-camera-module-content]',
      '[data-camera-module-links]',
      '[data-camera-module-reviews]',
    ].map((selector) => container.querySelector(selector));
    expect(orderedSections.every(Boolean)).toBe(true);
    expect(orderedSections.map((element) => element?.compareDocumentPosition(orderedSections[0]!))).toEqual([
      0,
      Node.DOCUMENT_POSITION_PRECEDING,
      Node.DOCUMENT_POSITION_PRECEDING,
      Node.DOCUMENT_POSITION_PRECEDING,
      Node.DOCUMENT_POSITION_PRECEDING,
      Node.DOCUMENT_POSITION_PRECEDING,
    ]);
    expect(screen.getByText('Quick checks before repair')).toBeTruthy();
    expect(screen.getByText('Before bringing your phone in')).toBeTruthy();
    expect(screen.getByText('Real Front Camera Replacement Results')).toBeTruthy();
    expect(screen.getByText('Book an assessment at Ali Mobile & Repair in Ringwood. We confirm the model, fault, suitable repair and quote before approved work begins.')).toBeTruthy();
  });

  it('renders no empty Repair Results placeholder when no matching privacy-approved proof is supplied', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} hierarchy={hierarchy} initialResults={[]} />);
    expect(container.querySelector('[data-camera-module-results]')).toBeNull();
  });

  it('uses the shared repair rhythm with compact, balanced symptom cards', () => {
    const fiveSymptoms = {
      ...front,
      symptoms: ['One', 'Two', 'Three', 'Four', 'Five'],
    };
    const { container } = render(<CameraModuleRepairLandingPage config={fiveSymptoms} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} hierarchy={hierarchy} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Before a front camera repair' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Diagnosis and preparation' })).toBeTruthy();
    expect(container.querySelectorAll('[data-camera-module-layout-section]')).toHaveLength(5);

    const symptomGrid = container.querySelector('[data-camera-module-symptom-grid]');
    expect(symptomGrid).toHaveClass('lg:grid-cols-3');
    const symptomCards = container.querySelectorAll('[data-camera-module-symptom-card]');
    expect(symptomCards).toHaveLength(5);
    symptomCards.forEach((card) => expect(card).not.toHaveClass('min-h-[188px]'));
  });

  it('renders the front camera page without the retired assessment card while preserving Face ID and screen boundaries', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} />);
    expect(screen.getByRole('heading', { level: 1, name: front.title })).toBeTruthy();
    expect(screen.queryByText(/Quote only/i)).toBeNull();
    expect(screen.queryByText(/Assessment before repair/i)).toBeNull();
    expect(front.distinctionTitle).toContain('not screen');
    expect(front.distinctionBody).toContain('Face ID');
    expect(screen.queryByRole('link', { name: /camera lens glass repair/i })).toBeNull();
    expect(container.textContent).not.toMatch(/\$\d|same-day|genuine parts/i);
  });

  it('renders Front Camera selected state in the centered Hero stack without the retired assessment card', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} hierarchy={hierarchy} />);
    const hierarchyElement = screen.getByTestId('camera-module-hierarchy');
    expect(hierarchyElement.getAttribute('data-brand')).toBe('huawei');
    expect(hierarchyElement.getAttribute('data-model')).toBe('p30-pro');
    expect(hierarchyElement.getAttribute('data-selection-path')).toBeNull();
    expect(hierarchyElement.textContent).toContain('Huawei P30 Pro');
    expect(screen.getByRole('heading', { name: 'Huawei P30 Pro' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /book repair now/i })).toHaveAttribute('href', hierarchy.selectedDevice.booking.href);
    expect(screen.getByRole('button', { name: /change model/i })).toBeTruthy();
    expect(screen.getByText('$99')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Select your model' })).toBeNull();
    expect(screen.queryByTestId('camera-module-booking-controls')).toBeNull();
    expect(screen.queryByText(/Quote only/i)).toBeNull();
    expect(screen.queryByText(/Assessment before repair/i)).toBeNull();
    expect(container.querySelector('[data-shared-repair-selected-device]')).toBeNull();
    expect(container.querySelector('[data-camera-module-model-selector]')).toHaveAttribute('hidden');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('replaces Back Camera’s legacy selector with its hierarchy while preserving camera-lens guidance', () => {
    render(<CameraModuleRepairLandingPage config={back} canonicalPath="/repairs/phone/back-camera-replacement" candidates={candidates} hierarchy={backHierarchy} />);
    expect(screen.getByRole('heading', { level: 1, name: back.title })).toBeTruthy();
    const lensLinks = screen.getAllByRole('link', { name: 'Camera lens glass repair' });
    expect(lensLinks.every((link) => link.getAttribute('href') === '/repairs/phone/camera-lens-replacement')).toBe(true);
    expect(back.distinctionTitle).toContain('lens glass');
    expect(back.distinctionBody).toContain('Lens glass');
    expect(screen.getByRole('heading', { name: 'Camera Module or Camera Lens?' })).toBeTruthy();
    expect(screen.getByText('Quick checks before repair')).toBeTruthy();
    expect(screen.getByText('What we test after repair')).toBeTruthy();
    const hierarchyElement = screen.getByTestId('camera-module-hierarchy');
    expect(hierarchyElement.getAttribute('data-brand')).toBe('oppo');
    expect(hierarchyElement.getAttribute('data-model')).toBe('find-x8-pro');
    expect(hierarchyElement.getAttribute('data-selection-path')).toBeNull();
    expect(hierarchyElement.textContent).toContain('OPPO Find X8 Pro');
    expect(screen.getByRole('link', { name: /book repair now/i })).toHaveAttribute('href', backHierarchy.selectedDevice.booking.href);
    expect(screen.getByRole('button', { name: /change model/i })).toBeTruthy();
    expect(screen.getByText('Quote on Request')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Select your model' })).toBeNull();
    expect(screen.queryByTestId('camera-module-booking-controls')).toBeNull();
    expect(screen.queryByText(/Quote only/i)).toBeNull();
  });

  it('renders the generic repair price card and smoothly opens the model selector without a valid full selection', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} hierarchy={{ ...hierarchy, selectedBrandSlug: null, selectedModelSlug: null, selectedDevice: null }} />);
    expect(screen.queryByRole('link', { name: /book repair now/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /change model/i })).toBeNull();
    expect(screen.getByText('STARTING FROM')).toBeTruthy();
    expect(screen.getByText('$99')).toBeTruthy();
    expect(screen.getByText('Final quote depends on parts, model and device condition.')).toBeTruthy();
    expect(screen.getByText('Quote on Request')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Huawei P30 Pro' })).toHaveAttribute('href', '/repairs/phone/front-camera-replacement?brand=huawei&model=p30-pro');
    expect(screen.getByRole('link', { name: 'Huawei P30 Pro' }).getAttribute('href')).not.toContain('/book-repair');
    expect(container.querySelector('[data-camera-module-model-selector]')).not.toHaveAttribute('hidden');

    fireEvent.click(screen.getByRole('button', { name: 'Select your model' }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('keeps generic and selected Hero pricing inside the existing trusted-price rules', () => {
    const { rerender } = render(<CameraModuleRepairLandingPage config={back} canonicalPath="/repairs/phone/back-camera-replacement" candidates={candidates} hierarchy={{ ...backHierarchy, selectedBrandSlug: null, selectedModelSlug: null, selectedDevice: null }} />);
    expect(screen.getByText('Quote on Request')).toBeTruthy();
    expect(screen.queryByText('Starting from $50')).toBeNull();

    rerender(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} hierarchy={{
      ...hierarchy,
      models: hierarchy.models.map((model) => ({ ...model, priceLabel: 'From $149' })),
    }} />);
    expect(screen.getByText('From $149')).toBeTruthy();
  });

  it('keeps the main CTA stable while using a compact price card and revealing the existing hierarchy on Change model', () => {
    const genericHierarchy = { ...hierarchy, selectedBrandSlug: null, selectedModelSlug: null, selectedDevice: null };
    const { container, rerender } = render(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} hierarchy={genericHierarchy} />);
    const genericPrimaryActionClass = screen.getByRole('button', { name: 'Select your model' }).className;
    const genericHeroCard = container.querySelector('[data-camera-module-hero-price-card]');

    expect(genericHeroCard?.className).not.toMatch(/min-h-/);

    rerender(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} hierarchy={hierarchy} />);
    const heroCard = container.querySelector('[data-camera-module-hero-price-card]');
    const primaryAction = screen.getByRole('link', { name: /book repair now/i });
    const phoneAction = screen.getByRole('link', { name: /call 0481 058 514/i });
    const changeModel = screen.getByRole('button', { name: /change model/i });

    expect(heroCard).toHaveClass('max-w-md');
    expect(heroCard?.className).not.toMatch(/min-h-/);
    expect(primaryAction).toHaveClass('min-h-14', 'w-full', 'text-lg');
    expect(primaryAction.className).toBe(genericPrimaryActionClass);
    expect(primaryAction).toHaveAttribute('href', hierarchy.selectedDevice.booking.href);
    expect(phoneAction.compareDocumentPosition(changeModel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(changeModel).toHaveClass('mt-4');

    fireEvent.click(changeModel);

    const openSelector = container.querySelector('[data-camera-module-model-selector]');
    const genericCardAfterChange = container.querySelector('[data-camera-module-hero-price-card]');

    expect(screen.getByRole('button', { name: 'Select your model' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /book repair now/i })).toBeNull();
    expect(within(genericCardAfterChange as HTMLElement).queryByText('Selected device')).toBeNull();
    expect(within(genericCardAfterChange as HTMLElement).getByText('STARTING FROM')).toBeTruthy();
    expect(openSelector).not.toHaveAttribute('hidden');
    expect(Element.prototype.scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'start' });

    const replacementModel = screen.getByRole('link', { name: 'Huawei P30 Pro' });
    replacementModel.addEventListener('click', (event) => event.preventDefault(), { once: true });
    fireEvent.click(replacementModel);

    expect(screen.getByRole('link', { name: /book repair now/i })).toBeTruthy();
    expect(container.querySelector('[data-camera-module-model-selector]')).toHaveAttribute('hidden');
    expect(within(container.querySelector('[data-camera-module-hero-price-card]') as HTMLElement).getByRole('heading', { name: 'Huawei P30 Pro' })).toBeTruthy();
    expect(Element.prototype.scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('emits query-free BreadcrumbList and Service JSON-LD without FAQ or offer-bearing schema', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={back} canonicalPath="/repairs/phone/back-camera-replacement" candidates={candidates} />);
    const schemas = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map((script) => JSON.parse(script.textContent ?? '{}'));
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Service', 'BreadcrumbList']);
    expect(schemas.find((schema) => schema['@type'] === 'Service')).toMatchObject({
      name: 'Phone Back Camera Repair & Replacement',
      url: 'https://www.alimobile.com.au/repairs/phone/back-camera-replacement',
      provider: { '@id': 'https://www.alimobile.com.au/#localbusiness' },
    });
    expect(JSON.stringify(schemas)).not.toMatch(/FAQPage|Offer|Product|AggregateOffer|priceCurrency|availability|\?/);
  });

  it('explains model pricing and renders the approved Front Camera FAQs and reciprocal link', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} hierarchy={hierarchy} />);

    expect(container.querySelector('[data-camera-module-price-guide]')).toHaveClass('w-full', 'max-w-3xl', 'mx-auto', 'text-center');
    expect(screen.getByText(/models with valid repair variants show “From \$X”/i)).toBeTruthy();
    expect(screen.getByText('Why is my front camera black, blurry or not opening?')).toBeTruthy();
    expect(screen.getByText(/usually takes around 30–45 minutes/i)).toBeTruthy();
    expect(screen.getByText(/include a 6-month warranty/i)).toBeTruthy();
    expect(screen.getAllByText(/0481 058 514/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Back Camera Repair' })).toHaveAttribute('href', '/repairs/phone/back-camera-replacement');
    expect(container.textContent?.match(/Ringwood/g)).toHaveLength(1);
    expect(container.textContent).not.toMatch(/water resistance|resealing/i);
  });

  it('renders the approved Back Camera FAQs, Camera Lens link, and reciprocal Front Camera link', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={back} canonicalPath="/repairs/phone/back-camera-replacement" candidates={candidates} hierarchy={backHierarchy} />);

    expect(screen.getByText('Is a rattling rear camera always a fault?')).toBeTruthy();
    expect(screen.getByText(/usually takes around 30–45 minutes/i)).toBeTruthy();
    expect(screen.getByText(/include a 6-month warranty/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Front Camera Repair' })).toHaveAttribute('href', '/repairs/phone/front-camera-replacement');
    expect(screen.getAllByRole('link', { name: /Camera Lens Replacement|camera lens glass repair/i }).length).toBeGreaterThan(0);
    expect(container.textContent?.match(/Ringwood/g)).toHaveLength(1);
    expect(container.textContent).not.toMatch(/water resistance|resealing/i);
  });

  it.each([
    ['Front Camera', front, hierarchy],
    ['Back Camera', back, backHierarchy],
  ] as const)('%s uses a centered Hero stack without the assessment sibling', (_, config, pageHierarchy) => {
    const { container } = render(
      <CameraModuleRepairLandingPage config={config} canonicalPath={`/repairs/phone/${config.repairSlug}`} candidates={candidates} hierarchy={pageHierarchy} />,
    );

    expect(container.querySelector('[data-camera-module-hero]')?.className).toContain('repair-detail-hero');
    const heroStack = container.querySelector('[data-camera-module-hero-stack]');
    expect(heroStack).toHaveClass('w-full');
    expect(heroStack).not.toHaveClass('max-w-2xl');
    expect(heroStack).not.toHaveClass('mx-auto');
    expect(heroStack?.querySelector('h1')?.textContent).toBe(config.title);
    expect(heroStack?.textContent).toContain(config.description);
    expect(heroStack?.querySelector('[data-camera-module-hero-price-card]')).toBeTruthy();
    expect(heroStack?.querySelector('[data-shared-repair-selected-device]')).toBeNull();
    expect(container.querySelector('[data-camera-module-assessment]')).toBeNull();
    expect(container.querySelector('[data-camera-module-guidance-grid]')).toBeTruthy();
    expect(container.textContent).toMatch(/inspect|inspection/i);
    expect(container.textContent).not.toMatch(/starting from \$50/i);
  });
});
