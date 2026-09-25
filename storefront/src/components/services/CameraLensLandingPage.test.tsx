import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./SharedRepairPageV2BookingControls', () => ({ default: () => <div data-testid="shared-page-v2-booking-controls" /> }));
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
    expect(screen.getByRole('link', { name: /change model/i })).toHaveAttribute('href', '/repairs/phone/camera-lens-replacement');
    expect(screen.queryByLabelText(/choose your/i)).toBeNull();
    expect(screen.getByText('$50')).toBeTruthy();
  });

  it('keeps Pixel Camera Lens model cards as real selected-query links and preserves their natural order', () => {
    const pixelModels = models.filter((model) => model.brandSlug === 'google-pixel');
    render(<CameraLensLandingPage brandName="Google Pixel" brandSlug="google-pixel" title="Google Pixel Camera Lens Replacement" intro="Inspection first." canonicalPath="/repairs/phone/google/camera-lens-replacement" models={pixelModels} sharedPageV2={{ supportedModels: pixelModels.map((model) => ({ category: 'phone', canonicalBrandSlug: model.brandSlug, ...model })), priceCandidates: [], initialResults: [], selectedModelSlug: null, quickAnswers: { repairTime: 'Contact us.', partsSameDay: 'Call us.', warranty: 'Warranty.' }, pricingStrategy: { mode: 'fixed', fixedPrice: 50 } }} />);

    const card = screen.getByRole('link', { name: /pixel 8 pro/i });
    expect(card).toHaveAttribute('href', '?model=pixel-8-pro');
    expect(card.getAttribute('href')).not.toContain('/book-repair');
    expect(screen.getByText('$50')).toBeTruthy();
  });
});
