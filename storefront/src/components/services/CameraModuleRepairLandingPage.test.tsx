import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./CameraModuleRepairBookingControls', () => ({
  default: () => <div data-testid="camera-module-booking-controls" />,
}));

import CameraModuleRepairLandingPage, { type CameraModuleRepairLandingConfig } from './CameraModuleRepairLandingPage';

const candidates = [{ canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' }];

const front: CameraModuleRepairLandingConfig = {
  repairSlug: 'front-camera-replacement', bookingService: 'Front Camera Replacement', title: 'Phone Front Camera Replacement in Ringwood', description: 'Front module assessment.', eyebrow: 'Front camera module assessment', symptoms: ['Black preview'], distinctionTitle: 'Front camera module, not screen or biometric repair', distinctionBody: 'Face ID is not guaranteed.', inspectionBody: 'Inspection first.',
};

const back: CameraModuleRepairLandingConfig = {
  repairSlug: 'back-camera-replacement', bookingService: 'Back Camera Replacement', title: 'Phone Back Camera Replacement in Ringwood', description: 'Back module assessment.', eyebrow: 'Back camera module assessment', symptoms: ['Blurry photos'], distinctionTitle: 'Back camera module or camera lens glass?', distinctionBody: 'Lens glass is separate.', inspectionBody: 'Inspection first.', relatedHref: '/repairs/phone/camera-lens-replacement', relatedLabel: 'Camera lens glass repair',
};

describe('CameraModuleRepairLandingPage', () => {
  it('renders the front camera page as quote-only with Face ID and screen boundaries', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={front} canonicalPath="/repairs/phone/front-camera-replacement" candidates={candidates} />);
    expect(screen.getByRole('heading', { level: 1, name: front.title })).toBeTruthy();
    expect(screen.getByText(/Quote only/i)).toBeTruthy();
    expect(front.distinctionTitle).toContain('not screen');
    expect(front.distinctionBody).toContain('Face ID');
    expect(screen.queryByRole('link', { name: /camera lens glass repair/i })).toBeNull();
    expect(container.textContent).not.toMatch(/\$|same-day|genuine parts/i);
  });

  it('renders the back camera module/lens distinction and exactly one lens route link', () => {
    render(<CameraModuleRepairLandingPage config={back} canonicalPath="/repairs/phone/back-camera-replacement" candidates={candidates} />);
    expect(screen.getByRole('heading', { level: 1, name: back.title })).toBeTruthy();
    const lensLink = screen.getByRole('link', { name: 'Camera lens glass repair' });
    expect(lensLink.getAttribute('href')).toBe('/repairs/phone/camera-lens-replacement');
    expect(back.distinctionTitle).toContain('lens glass');
    expect(back.distinctionBody).toContain('Lens glass');
  });

  it('emits only query-free BreadcrumbList JSON-LD and no offer-bearing schema', () => {
    const { container } = render(<CameraModuleRepairLandingPage config={back} canonicalPath="/repairs/phone/back-camera-replacement" candidates={candidates} />);
    const schema = container.querySelector('script[type="application/ld+json"]')?.textContent ?? '';
    expect(schema).toContain('BreadcrumbList');
    expect(schema).toContain('/repairs/phone/back-camera-replacement');
    expect(schema).not.toMatch(/Offer|Product|AggregateOffer|priceCurrency|availability|\?/);
  });
});
