import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createVirtualPhoneRepairMetadata } from './virtualPhoneRepairRoute';
import { getSharedRepairBookingHref, getValidatedSharedRepairModel } from './sharedRepairBooking';
import { getVirtualPhoneRepairHeading } from '@/components/services/VirtualPhoneRepairLandingPage';
import { getVirtualPhoneRepair } from './virtualPhoneRepairs';

const samsungModels = [
  { brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S22 Ultra', modelSlug: 'galaxy-s22-ultra' },
];

describe('Samsung shared repair metadata and model state', () => {
  it('uses clean, query-independent Samsung H1s without changing other brand headings', () => {
    const samsungH1s = [
      ['camera-lens-replacement', 'Samsung Camera Lens Replacement'],
      ['loudspeaker-replacement', 'Samsung Loudspeaker Replacement'],
      ['earpiece-speaker-replacement', 'Samsung Earpiece Speaker Replacement'],
      ['power-button-replacement', 'Samsung Power Button Replacement'],
      ['volume-button-replacement', 'Samsung Volume Button Replacement'],
    ] as const;

    for (const [slug, expectedHeading] of samsungH1s) {
      const repairName = slug === 'camera-lens-replacement'
        ? 'Camera Lens Replacement'
        : getVirtualPhoneRepair(slug)!.name;

      for (const modelSlug of [undefined, 'galaxy-s22-ultra', 'not-a-model']) {
        expect(getVirtualPhoneRepairHeading({
          brandName: 'Samsung',
          brandSlug: 'samsung',
          repairName,
        }), modelSlug).toBe(expectedHeading);
      }
      expect(expectedHeading).not.toContain('in Ringwood');
    }

    expect(getVirtualPhoneRepairHeading({ brandName: 'Google Pixel', brandSlug: 'google-pixel', repairName: 'Loudspeaker Replacement' }))
      .toBe('Google Pixel Loudspeaker Replacement in Ringwood');
    expect(getVirtualPhoneRepairHeading({ brandName: 'OPPO', brandSlug: 'oppo', repairName: 'Loudspeaker Replacement' }))
      .toBe('OPPO Loudspeaker Replacement in Ringwood');
    expect(getVirtualPhoneRepairHeading({ repairName: 'Loudspeaker Replacement' }))
      .toBe('Phone Loudspeaker Replacement in Ringwood');
  });

  it('keeps the five clean Samsung URLs as their own social and canonical identities', () => {
    for (const [slug, repairName] of [
      ['loudspeaker-replacement', 'Loudspeaker Replacement'],
      ['earpiece-speaker-replacement', 'Earpiece Speaker Replacement'],
      ['power-button-replacement', 'Power Button Replacement'],
      ['volume-button-replacement', 'Volume Button Replacement'],
    ] as const) {
      const metadata = createVirtualPhoneRepairMetadata('samsung', slug);
      const canonical = `/repairs/phone/samsung/${slug}`;

      expect(metadata.title).toBe(`Samsung ${repairName} in Ringwood | Ali Mobile`);
      expect(metadata.description).toContain('Starting from $50');
      expect(metadata.alternates?.canonical).toBe(canonical);
      expect(metadata.openGraph?.url).toBe(canonical);
      expect(canonical).not.toContain('?');
      expect(metadata.openGraph?.url).not.toContain('?');
      expect(metadata.openGraph?.title).toBe(metadata.title);
      expect(metadata.twitter?.title).toBe(metadata.title);
      expect(metadata.twitter?.description).toBe(metadata.description);
    }
  });

  it('keeps shared metadata brand-specific outside Samsung', () => {
    expect(createVirtualPhoneRepairMetadata('google', 'loudspeaker-replacement').title).toContain('Google Pixel');
    expect(createVirtualPhoneRepairMetadata('oppo', 'loudspeaker-replacement').title).toContain('OPPO');
    expect(createVirtualPhoneRepairMetadata('other', 'loudspeaker-replacement').title).toContain('Phone Loudspeaker');
  });

  it('uses only a validated Samsung model in Booking state', () => {
    const selected = getValidatedSharedRepairModel(samsungModels, 'galaxy-s22-ultra', 'samsung');
    const invalid = getValidatedSharedRepairModel(samsungModels, 'not-a-model', 'samsung');

    expect(selected?.model).toBe('Galaxy S22 Ultra');
    expect(invalid).toBeNull();

    const cleanBooking = new URL(getSharedRepairBookingHref({
      repairName: 'Earpiece Speaker Replacement',
      fallbackBrandName: 'Samsung',
    }), 'https://www.alimobile.com.au');
    const selectedBooking = new URL(getSharedRepairBookingHref({
      repairName: 'Earpiece Speaker Replacement',
      selectedModel: selected,
      fallbackBrandName: 'Samsung',
    }), 'https://www.alimobile.com.au');

    expect(cleanBooking.searchParams.get('brand')).toBe('Samsung');
    expect(cleanBooking.searchParams.get('model')).toBeNull();
    expect(selectedBooking.searchParams.get('brand')).toBe('Samsung');
    expect(selectedBooking.searchParams.get('model')).toBe('Galaxy S22 Ultra');
  });

  it('keeps primary page content server-rendered and scopes interactivity to the client island', () => {
    const virtualPage = readFileSync(resolve(process.cwd(), 'src/components/services/VirtualPhoneRepairLandingPage.tsx'), 'utf8');
    const cameraPage = readFileSync(resolve(process.cwd(), 'src/components/services/CameraLensLandingPage.tsx'), 'utf8');
    const cameraRoute = readFileSync(
      resolve(process.cwd(), 'src/app/(public)/repairs/phone/samsung/camera-lens-replacement/page.tsx'),
      'utf8'
    );
    const controls = readFileSync(resolve(process.cwd(), 'src/components/services/SharedRepairBookingControls.tsx'), 'utf8');
    const virtualRoute = readFileSync(resolve(process.cwd(), 'src/lib/virtualPhoneRepairRoute.tsx'), 'utf8');

    expect(virtualPage).not.toContain("'use client'");
    expect(virtualPage).not.toContain('useSearchParams');
    expect(cameraPage).not.toContain('useSearchParams');
    expect(virtualPage).toContain('<h1 id="virtual-phone-repair-heading">');
    expect(cameraPage).toContain('<h1 id="camera-lens-heading">');
    expect(virtualPage).toContain('Samsung {repair.name.toLowerCase()} starts from $50');
    expect(cameraPage).toContain('Samsung camera lens replacement starts from $50');
    expect(virtualPage).toContain("if (brandSlug === 'samsung') return `Samsung ${repairName}`;");
    expect(cameraRoute).toContain('title="Samsung Camera Lens Replacement"');
    expect(controls).toContain("'use client'");
    expect(controls).toContain('useSearchParams');
    expect(virtualRoute).toContain('brand === "samsung" ? SAMSUNG_REPAIR_CONTENT[repairSlug] : undefined');
    expect(virtualRoute).toContain('speakerphone audio');
    expect(virtualRoute).toContain('ordinary calls near your ear');
    expect(virtualRoute).toContain('battery, charging and board-level no-power symptoms');
    expect(virtualRoute).toContain('settings or software');
  });

  it('adds the five clean Samsung links only to the existing Samsung Brand Hub module', () => {
    const brandHub = readFileSync(resolve(process.cwd(), 'src/app/(public)/repairs/[category]/[brand]/page.tsx'), 'utf8');
    const samsungStart = brandHub.indexOf('const SAMSUNG_REPAIR_TYPE_LINKS');
    const googleStart = brandHub.indexOf('const GOOGLE_PIXEL_REPAIR_TYPE_LINKS');
    const samsungLinks = brandHub.slice(samsungStart, googleStart);

    for (const slug of [
      'camera-lens-replacement',
      'loudspeaker-replacement',
      'earpiece-speaker-replacement',
      'power-button-replacement',
      'volume-button-replacement',
    ]) {
      expect(samsungLinks.match(new RegExp(`/repairs/phone/samsung/${slug}`, 'g'))).toHaveLength(1);
    }
    expect(samsungLinks).not.toContain('?model=');
    expect(brandHub.slice(googleStart)).not.toContain('/repairs/phone/google/earpiece-speaker-replacement');
    expect(brandHub.slice(googleStart)).not.toContain('/repairs/phone/oppo/earpiece-speaker-replacement');
  });

  it('keeps camera social metadata scoped to the clean Samsung URL and leaves the Homepage untouched', () => {
    const cameraRoute = readFileSync(
      resolve(process.cwd(), 'src/app/(public)/repairs/phone/samsung/camera-lens-replacement/page.tsx'),
      'utf8'
    );
    const homepage = readFileSync(resolve(process.cwd(), 'src/app/(public)/page.tsx'), 'utf8');

    expect(cameraRoute).toContain('const PAGE_PATH = "/repairs/phone/samsung/camera-lens-replacement";');
    expect(cameraRoute).toContain('const PAGE_TITLE = "Samsung Camera Lens Replacement in Ringwood | Ali Mobile";');
    expect(cameraRoute).toContain('const PAGE_DESCRIPTION = "Samsung outer camera lens glass replacement in Ringwood. We inspect model fitment before confirming the listed $50 repair.";');
    expect(cameraRoute).toContain('alternates: { canonical: PAGE_PATH }');
    expect(cameraRoute).toContain('openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH');
    expect(cameraRoute).toContain('twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION }');
    expect(homepage).not.toContain('/repairs/phone/samsung/camera-lens-replacement');
    expect(homepage).not.toContain('/repairs/phone/samsung/earpiece-speaker-replacement');
  });
});
