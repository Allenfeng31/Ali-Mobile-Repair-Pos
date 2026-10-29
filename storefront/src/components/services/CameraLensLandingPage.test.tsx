import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./SharedRepairBookingControls', () => ({ default: () => <div data-testid="shared-repair-booking-controls" /> }));
import CameraLensLandingPage, { resolveCameraLensSelectedDevice } from './CameraLensLandingPage';

const models = [
  { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8 Pro', modelSlug: 'pixel-8-pro' },
  { brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S25', modelSlug: 'galaxy-s25' },
  { brand: 'Huawei', brandSlug: 'huawei', model: 'P30 Pro', modelSlug: 'p30-pro' },
  { brand: 'Huawei', brandSlug: 'huawei', model: 'Future Huawei', modelSlug: 'future-huawei' },
];

describe('Camera Lens selected-device normalization', () => {
  it('resolves valid generic brand and model context with the canonical booking identity', () => {
    const selection = resolveCameraLensSelectedDevice({ route: { scope: 'global' }, models, query: { brand: 'huawei', model: 'p30-pro' } });

    expect(selection.selectedModelSlug).toBe('p30-pro');
    expect(selection.selectedDevice).toMatchObject({
      selectedDevice: { brand: 'Huawei', model: 'P30 Pro', modelSlug: 'p30-pro' },
      selectedRepair: { serviceSlug: 'camera-lens-replacement' },
      booking: { href: '/book-repair?category=phone&service=Camera+Lens+Replacement&brand=Huawei&model=P30+Pro&brandSlug=huawei&modelSlug=p30-pro&serviceSlug=camera-lens-replacement' },
    });
  });

  it.each([
    { model: 'p30-pro' },
    { brand: 'huawei', model: 'pixel-8-pro' },
    { brand: 'huawei', model: 'unknown' },
    { brand: ['huawei', 'samsung'], model: 'p30-pro' },
    { brand: 'huawei', model: 'p30-pro', service: 'Camera Lens Replacement' },
  ])('fails closed for invalid generic query state: %o', (query) => {
    expect(resolveCameraLensSelectedDevice({ route: { scope: 'global' }, models, query }).selectedDevice).toBeNull();
  });

  it.each(['google-pixel', 'samsung', 'oppo'] as const)('uses a brand route as server authority and rejects overrides for %s', (brandSlug) => {
    const brandModels = brandSlug === 'oppo'
      ? [{ brand: 'OPPO', brandSlug: 'oppo', model: 'Find X8 Pro', modelSlug: 'find-x8-pro' }]
      : models.filter((model) => model.brandSlug === brandSlug);
    const valid = resolveCameraLensSelectedDevice({
      route: { scope: 'brand', canonicalBrandSlug: brandSlug, routeBrandSegment: brandSlug === 'google-pixel' ? 'google' : brandSlug },
      models: brandModels,
      query: { model: brandModels[0]!.modelSlug },
    });
    const invalid = resolveCameraLensSelectedDevice({
      route: { scope: 'brand', canonicalBrandSlug: brandSlug, routeBrandSegment: brandSlug === 'google-pixel' ? 'google' : brandSlug },
      models: brandModels,
      query: { model: brandModels[0]!.modelSlug, brand: 'huawei' },
    });

    expect(valid.selectedDevice?.selectedDevice.brandSlug).toBe(brandSlug);
    expect(invalid.selectedDevice).toBeNull();
  });

  it('renders the server-selected module with a real canonical booking link and no client selector', () => {
    const selection = resolveCameraLensSelectedDevice({ route: { scope: 'global' }, models, query: { brand: 'huawei', model: 'p30-pro' } });
    render(<CameraLensLandingPage title="Phone Camera Lens Replacement in Ringwood" intro="Inspection first." canonicalPath="/repairs/phone/camera-lens-replacement" models={models} isGeneric selectedDevice={selection.selectedDevice} />);

    expect(screen.getByText('Selected device')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Huawei P30 Pro' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /book repair now/i })).toHaveAttribute('href', selection.selectedDevice?.booking.href);
    expect(screen.getByRole('link', { name: /change model/i })).toHaveAttribute('href', '/repairs/phone/camera-lens-replacement#shared-repair-model-selection');
    expect(screen.queryByLabelText(/choose your/i)).toBeNull();
    expect(screen.getAllByText('$50').length).toBeGreaterThan(0);
    const facts = screen.getByLabelText('Repair facts');
    for (const text of ['$50', '30 Minutes', '6 Months Warranty', 'Ringwood Square']) expect(within(facts).getByText(text)).toBeInTheDocument();
    expect(screen.queryByText('From $50')).toBeNull();
    expect(screen.queryByText('Inspection Before Work')).toBeNull();
    expect(facts.compareDocumentPosition(screen.getByRole('heading', { level: 1 })) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it('shows generic Camera Lens fixed pricing in the compact facts without a selected card or a separate large price card', () => {
    const { container } = render(<CameraLensLandingPage title="Phone Camera Lens Replacement" intro="Eligible external camera lens glass replacement is $50." canonicalPath="/repairs/phone/camera-lens-replacement" models={models} isGeneric />);
    const facts = screen.getByLabelText('Repair facts');
    for (const text of ['$50', '30 Minutes', '6 Months Warranty', 'Ringwood Square']) expect(within(facts).getByText(text)).toBeInTheDocument();
    expect(screen.getAllByText('$50')).toHaveLength(1);
    expect(screen.queryByText('Selected device')).toBeNull();
    expect(screen.queryByText('Inspection first')).toBeNull();
    expect(screen.queryByLabelText('Commercial repair facts')).toBeNull();
    expect(screen.getByText('Standard repair time is approximately 30 minutes when the correct part is available and no additional faults are found. Actual turnaround may vary after inspection.')).toBeInTheDocument();
    const serviceSchema = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent ?? '{}'))
      .find((schema) => schema['@type'] === 'Service');
    expect(serviceSchema).toMatchObject({
      name: 'Phone Camera Lens Replacement',
      description: 'Eligible external camera lens glass replacement is $50.',
      url: 'https://www.alimobile.com.au/repairs/phone/camera-lens-replacement',
      provider: { '@id': 'https://www.alimobile.com.au/#localbusiness' },
    });
    expect(JSON.stringify(serviceSchema)).not.toMatch(/AggregateRating|Offer|offers|price/);
  });

  it('qualifies the 30-minute Camera Lens estimate when timing is explained in the fallback FAQ', () => {
    render(<CameraLensLandingPage brandName="Huawei" brandSlug="huawei" title="Huawei Camera Lens Replacement" intro="Inspection first." canonicalPath="/repairs/phone/camera-lens-replacement" models={models} />);

    expect(screen.getByText('Standard repair time is approximately 30 minutes when the correct part is available and no additional faults are found. Actual turnaround may vary after inspection.')).toBeInTheDocument();
  });

  it('keeps Pixel Camera Lens model cards as real selected-query links and preserves their natural order', () => {
    const pixelModels = models.filter((model) => model.brandSlug === 'google-pixel');
    render(<CameraLensLandingPage brandName="Google Pixel" brandSlug="google-pixel" title="Google Pixel Camera Lens Replacement" intro="Inspection first." canonicalPath="/repairs/phone/google/camera-lens-replacement" models={pixelModels} sharedPageV2={{ supportedModels: pixelModels.map((model) => ({ category: 'phone', canonicalBrandSlug: model.brandSlug, ...model })), priceCandidates: [], initialResults: [], selectedModelSlug: null, quickAnswers: { repairTime: 'Contact us.', partsSameDay: 'Call us.', warranty: 'Warranty.' }, pricingStrategy: { mode: 'fixed', fixedPrice: 50 } }} />);

    const card = screen.getByRole('link', { name: /pixel 8 pro/i });
    expect(card).toHaveAttribute('href', '/repairs/phone/google/camera-lens-replacement?model=pixel-8-pro');
    expect(card.getAttribute('href')).not.toContain('/book-repair');
    expect(screen.getAllByText('$50').length).toBeGreaterThan(0);
  });

  it('renders the fixed Camera Lens price in the selected Master card and compact facts after the H1', () => {
    const pixelModels = models.filter((model) => model.brandSlug === 'google-pixel');
    const selection = resolveCameraLensSelectedDevice({
      route: { scope: 'brand', canonicalBrandSlug: 'google-pixel', routeBrandSegment: 'google' },
      models: pixelModels,
      query: { model: 'pixel-8-pro' },
    });
    render(<CameraLensLandingPage brandName="Google Pixel" brandSlug="google-pixel" title="Google Pixel Camera Lens Replacement" intro="Inspection first." canonicalPath="/repairs/phone/google/camera-lens-replacement" models={pixelModels} selectedDevice={selection.selectedDevice} sharedPageV2={{ supportedModels: pixelModels.map((model) => ({ category: 'phone', canonicalBrandSlug: model.brandSlug, ...model })), priceCandidates: [], initialResults: [], selectedModelSlug: 'pixel-8-pro', quickAnswers: { repairTime: 'Contact us.', partsSameDay: 'Call us.', warranty: 'Warranty.' }, pricingStrategy: { mode: 'fixed', fixedPrice: 50 } }} />);

    const heading = screen.getByRole('heading', { level: 1, name: 'Google Pixel Camera Lens Replacement' });
    const facts = screen.getByLabelText('Repair facts');
    expect(facts).toHaveTextContent('From $50');
    expect(facts).toHaveTextContent('30 Minutes');
    expect(facts).toHaveTextContent('6 Months Warranty');
    expect(facts).toHaveTextContent('Ringwood Square');
    expect(screen.getByText('$50', { selector: '[data-camera-module-hero-price]' })).toBeInTheDocument();
    expect(heading.compareDocumentPosition(facts) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('link', { name: /Change model/ })).toHaveAttribute('href', '/repairs/phone/google/camera-lens-replacement');
  });

  it('does not render an inner main landmark under PublicLayout', () => {
    const { container } = render(
      <CameraLensLandingPage
        brandName="Google Pixel"
        brandSlug="google-pixel"
        title="Google Pixel Camera Lens Replacement"
        intro="Inspection first."
        canonicalPath="/repairs/phone/google/camera-lens-replacement"
        models={[]}
      />,
    );

    expect(container.querySelector('main')).toBeNull();
    expect(container.querySelector('.repair-detail-page-shell')).not.toBeNull();
  });
});
