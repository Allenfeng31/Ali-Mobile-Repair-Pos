import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { createVirtualPhoneRepairMetadata } from './virtualPhoneRepairRoute';
import { getSharedRepairBookingHref, getValidatedSharedRepairModel } from './sharedRepairBooking';
import { getVirtualPhoneRepairHeading } from '@/components/services/VirtualPhoneRepairLandingPage';
import { getVirtualPhoneRepair } from './virtualPhoneRepairs';
import { getCameraLensPrice } from './virtualCameraLens';
import { GOOGLE_PIXEL_HARDWARE_CONFIG } from '@/lib/seo/content/google-pixel/config';
import { OPPO_ENHANCED_CONFIG } from '@/lib/seo/content/oppo/config';

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

    for (const brand of [
      ['Google Pixel', 'google-pixel'],
      ['OPPO', 'oppo'],
    ] as const) {
      for (const slug of ['loudspeaker-replacement', 'earpiece-speaker-replacement', 'power-button-replacement', 'volume-button-replacement'] as const) {
        const heading = getVirtualPhoneRepairHeading({ brandName: brand[0], brandSlug: brand[1], repairName: getVirtualPhoneRepair(slug)!.name });
        expect(heading).toBe(`${brand[0]} ${getVirtualPhoneRepair(slug)!.name}`);
        expect(heading).not.toContain('in Ringwood');
      }
    }
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
    for (const [brand, path, label] of [
      ['google', '/repairs/phone/google/loudspeaker-replacement', 'Google Pixel'],
      ['oppo', '/repairs/phone/oppo/loudspeaker-replacement', 'OPPO'],
    ] as const) {
      const metadata = createVirtualPhoneRepairMetadata(brand, 'loudspeaker-replacement');
      expect(metadata.title).toContain(label);
      expect(metadata.alternates?.canonical).toBe(path);
      expect(metadata.openGraph?.url).toBe(path);
      expect(`${metadata.alternates?.canonical}${metadata.openGraph?.url}`).not.toContain('?');
    }
    expect(createVirtualPhoneRepairMetadata('other', 'loudspeaker-replacement').title).toContain('Phone Loudspeaker');
    expect(getVirtualPhoneRepairHeading({ repairName: 'Loudspeaker Replacement' })).not.toContain('Samsung');
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

  it('keeps Google Pixel and OPPO selectors limited to their configured model sets and preserves their Booking brands', () => {
    expect(Object.keys(GOOGLE_PIXEL_HARDWARE_CONFIG)).toHaveLength(27);
    expect(Object.keys(OPPO_ENHANCED_CONFIG.models)).toHaveLength(55);

    const pixel = { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8 Pro', modelSlug: 'pixel-8-pro' };
    const oppo = { brand: 'OPPO', brandSlug: 'oppo', model: 'Find X8 Pro', modelSlug: 'oppo-find-x8-pro' };
    expect(getValidatedSharedRepairModel([pixel], pixel.modelSlug, 'google-pixel')).toEqual(pixel);
    expect(getValidatedSharedRepairModel([pixel], 'pixel-fixture-unconfigured', 'google-pixel')).toBeNull();
    expect(getValidatedSharedRepairModel([oppo], oppo.modelSlug, 'oppo')).toEqual(oppo);
    expect(new URL(getSharedRepairBookingHref({ repairName: 'Loudspeaker Replacement', selectedModel: pixel }), 'https://www.alimobile.com.au').searchParams.get('brand')).toBe('Google Pixel');
    expect(new URL(getSharedRepairBookingHref({ repairName: 'Loudspeaker Replacement', selectedModel: oppo }), 'https://www.alimobile.com.au').searchParams.get('brand')).toBe('OPPO');

    const cameraBooking = new URL(getSharedRepairBookingHref({ repairName: 'Camera Lens Replacement', selectedModel: pixel }), 'https://www.alimobile.com.au');
    expect(cameraBooking.searchParams.get('category')).toBe('phone');
    expect(cameraBooking.searchParams.get('brand')).toBe('Google Pixel');
    expect(cameraBooking.searchParams.get('model')).toBe('Pixel 8 Pro');
    expect(cameraBooking.searchParams.get('service')).toBe('Camera Lens Replacement');
    expect(getCameraLensPrice('Google Pixel')).toBe(50);
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
    expect(virtualPage).toContain('Final quote depends on parts, model and device condition.');
    expect(cameraPage).toContain('Final quote depends on parts, model and device condition.');
    expect(virtualPage).toContain("brandSlug === 'google-pixel' || brandSlug === 'oppo'");
    expect(cameraRoute).toContain('title="Samsung Camera Lens Replacement"');
    expect(controls).toContain("'use client'");
    expect(controls).toContain('useSearchParams');
    expect(virtualRoute).toContain('getGooglePixelHardwareConfig(model.modelSlug)');
    expect(virtualRoute).toContain('getOppoModelConfig(model.modelSlug)');
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
    const oppoStart = brandHub.indexOf('const OPPO_REPAIR_TYPE_LINKS');
    const googleLinks = brandHub.slice(googleStart, oppoStart);
    const oppoLinks = brandHub.slice(oppoStart);
    for (const slug of ['camera-lens-replacement', 'loudspeaker-replacement', 'earpiece-speaker-replacement', 'power-button-replacement', 'volume-button-replacement']) {
      expect(googleLinks.match(new RegExp(`/repairs/phone/google/${slug}`, 'g'))).toHaveLength(1);
    }
    expect(googleLinks).not.toContain('/repairs/phone/google-pixel/camera-lens-replacement');
    for (const slug of ['camera-lens-replacement', 'loudspeaker-replacement', 'earpiece-speaker-replacement', 'power-button-replacement', 'volume-button-replacement']) {
      expect(oppoLinks.match(new RegExp(`/repairs/phone/oppo/${slug}`, 'g'))).toHaveLength(1);
    }
    expect(`${googleLinks}${oppoLinks}`).not.toContain('?model=');
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

  it('keeps Google Pixel Camera Lens in-place with separate route, config and display identities', () => {
    const oppoCamera = readFileSync(resolve(process.cwd(), 'src/app/(public)/repairs/phone/oppo/camera-lens-replacement/page.tsx'), 'utf8');
    const googleCamera = readFileSync(resolve(process.cwd(), 'src/app/(public)/repairs/phone/google/camera-lens-replacement/page.tsx'), 'utf8');
    const cameraPage = readFileSync(resolve(process.cwd(), 'src/components/services/CameraLensLandingPage.tsx'), 'utf8');

    expect(oppoCamera).toContain('const PAGE_PATH = "/repairs/phone/oppo/camera-lens-replacement";');
    expect(oppoCamera).toContain('openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH');
    expect(oppoCamera).toContain('twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION }');
    expect(googleCamera).toContain('const PAGE_PATH = "/repairs/phone/google/camera-lens-replacement";');
    expect(googleCamera).toContain('getGooglePixelHardwareConfig(model.slug)');
    expect(googleCamera).toContain('title="Google Pixel Camera Lens Replacement"');
    expect(googleCamera).toContain('showSharedRepairControls');
    expect(googleCamera).toContain('openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH');
    expect(googleCamera).toContain('twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION }');
    expect(cameraPage).toContain('const repairHubLabel = brandName ? `${brandName} Repairs` : null;');
    expect(cameraPage).toContain('showModelControls={hasSharedRepairControls}');
    expect(cameraPage).toContain('photo and video clarity');
    expect(googleCamera).not.toContain('/repairs/phone/google-pixel/camera-lens-replacement');
  });

  it('uses one approved, centred price-card quote boundary across Samsung, Google Pixel and OPPO shared repairs', () => {
    const virtualPage = readFileSync(resolve(process.cwd(), 'src/components/services/VirtualPhoneRepairLandingPage.tsx'), 'utf8');
    const cameraPage = readFileSync(resolve(process.cwd(), 'src/components/services/CameraLensLandingPage.tsx'), 'utf8');
    const modelDetail = readFileSync(resolve(process.cwd(), 'src/app/(public)/repairs/[category]/[brand]/[model]/[repair-type]/page.tsx'), 'utf8');
    const approvedCopy = 'Final quote depends on parts, model and device condition.';

    for (const sharedPage of [virtualPage, cameraPage]) {
      expect(sharedPage).toContain(approvedCopy);
      expect(sharedPage).toContain('max-w-[32rem] text-center');
      expect(sharedPage).not.toContain('Final pricing is confirmed after inspection if additional damage or parts are involved.');
      expect(sharedPage).not.toContain('Final fitment is confirmed after inspection. If the camera module is damaged, we will advise before repair.');
      expect(sharedPage).not.toContain('We confirm parts availability and provide a clear quote before work begins.');
    }

    expect(virtualPage).toContain("formatScopedRepairPriceLabel(repair.slug, 50, 'From $50', 'virtual')");
    expect(cameraPage).toContain('getCameraLensPrice(brandName ?? "")');
    expect(cameraPage).toContain('Camera lens glass or camera module?');
    expect(cameraPage).toContain('photo and video clarity');
    expect(modelDetail).toContain('export default');
  });
});
