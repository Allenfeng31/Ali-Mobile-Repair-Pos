import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import CameraLensLandingPage from './CameraLensLandingPage';
import VirtualPhoneRepairLandingPage from './VirtualPhoneRepairLandingPage';
import { GOOGLE_PIXEL_CAMERA_LENS_CONTENT, GOOGLE_PIXEL_SHARED_REPAIR_CONTENT } from '@/data/googlePixelSharedRepairContent';
import { createVirtualPhoneRepairMetadata } from '@/lib/virtualPhoneRepairRoute';
import { getVirtualPhoneRepair, type VirtualPhoneRepairSlug } from '@/lib/virtualPhoneRepairs';
import { buildSharedRepairPageSupportedModels } from '@/lib/sharedRepairPageV2';
import { getLocalRepairCatalogueFixture } from '@/lib/localRepairCatalogueFixture';

vi.mock('next/script', () => ({ default: (props: ComponentProps<'script'>) => <script {...props} /> }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog: vi.fn() }));
vi.mock('@/lib/repair-results.server', () => ({ fetchSharedRepairPageResultSeeds: vi.fn() }));

import { metadata as cameraLensMetadata } from '@/app/(public)/repairs/phone/google/camera-lens-replacement/page';

const services = [
  'camera-lens-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
] as const;
const model = { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8 Pro', modelSlug: 'pixel-8-pro' };
const unsupportedModel = { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Unsupported fixture', modelSlug: 'unsupported-fixture' };
const quickAnswers = { repairTime: 'Confirm after inspection.', partsSameDay: 'Call us.', warranty: 'Eligible repairs.' };

function renderGoogleHtml(service: (typeof services)[number]) {
  const canonicalPath = `/repairs/phone/google/${service}`;
  const supportedModels = buildSharedRepairPageSupportedModels({
    brands: getLocalRepairCatalogueFixture().brands,
    canonicalBrandSlug: 'google-pixel', repairSlug: service,
  });
  const element = service === 'camera-lens-replacement'
    ? <CameraLensLandingPage
        brandName="Google Pixel" brandSlug="google-pixel" title="Google Pixel Camera Lens Replacement"
        intro={GOOGLE_PIXEL_CAMERA_LENS_CONTENT.intro} canonicalPath={canonicalPath}
        models={[model, unsupportedModel]}
        sharedPageV2={{ supportedModels, priceCandidates: [], initialResults: [], selectedModelSlug: null, quickAnswers, pricingStrategy: { mode: 'fixed', fixedPrice: 50 } }}
      />
    : <VirtualPhoneRepairLandingPage
        brandName="Google Pixel" brandSlug="google-pixel" repairSlug={service as VirtualPhoneRepairSlug}
        canonicalPath={canonicalPath} models={[model, unsupportedModel]}
        sharedPageV2={{ supportedModels, priceCandidates: [], initialResults: [], selectedModelSlug: null, quickAnswers, pricingStrategy: { mode: 'pos-derived' } }}
      />;
  const html = renderToStaticMarkup(element);
  return { html, document: new DOMParser().parseFromString(html, 'text/html'), canonicalPath };
}

describe('Google Pixel shared-page content in initial server HTML', () => {
  it.each(services)('%s emits only the supported Google Pixel model from the deterministic local catalogue', (service) => {
    const supportedModels = buildSharedRepairPageSupportedModels({
      brands: getLocalRepairCatalogueFixture().brands, canonicalBrandSlug: 'google-pixel', repairSlug: service,
    });
    expect(supportedModels.map((item) => item.modelSlug)).toEqual(['pixel-8-pro']);
  });

  it.each(services)('%s has an intent H1, facts, six FAQs, a model anchor, and query-free Service/Breadcrumb schemas', (service) => {
    const { document, canonicalPath } = renderGoogleHtml(service);
    const repairName = service === 'camera-lens-replacement' ? 'Camera Lens Replacement' : getVirtualPhoneRepair(service)!.name;
    const facts = document.querySelector('dl[aria-label="Repair facts"]');
    const modelLinks = Array.from(document.querySelectorAll('a')).filter((link) => link.getAttribute('href') === `${canonicalPath}?model=pixel-8-pro`);
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((script) => JSON.parse(script.textContent ?? '{}'));

    expect(document.querySelector('h1')?.textContent).toBe(`Google Pixel ${repairName}`);
    expect(document.querySelector('h1')?.textContent).not.toContain('Ringwood');
    for (const fact of ['From $50', '30 Minutes', '6 Months Warranty', 'Ringwood Square']) expect(facts?.textContent).toContain(fact);
    expect(document.querySelectorAll('.faq-item')).toHaveLength(6);
    expect(modelLinks).toHaveLength(1);
    expect(document.querySelector('a[href*="unsupported-fixture"]')).toBeNull();
    expect(document.body.textContent).toContain('Kiosk C1');
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Service', 'BreadcrumbList']);
    expect(schemas[0]).toMatchObject({ name: `Google Pixel ${repairName}`, url: `https://www.alimobile.com.au${canonicalPath}`, provider: { '@id': 'https://www.alimobile.com.au/#localbusiness' } });
    expect(schemas[1].itemListElement.at(-1).item).toBe(`https://www.alimobile.com.au${canonicalPath}`);
    expect(JSON.stringify(schemas)).not.toMatch(/FAQPage|Product|Offer|AggregateOffer|availability|\?model=/);
  });

  it.each(services)('%s has distinct Google Pixel diagnosis, preparation, and contextual links', (service) => {
    const { document } = renderGoogleHtml(service);
    const content = document.body.textContent ?? '';
    const expected = {
      'camera-lens-replacement': ['protective camera lens glass', 'internal camera module', 'dust and moisture', '/repairs/phone/google-pixel'],
      'loudspeaker-replacement': ['ringtones, media, notifications and speakerphone', 'earpiece', 'microphone', '/repairs/phone/google/earpiece-speaker-replacement'],
      'earpiece-speaker-replacement': ['upper call receiver', 'speakerphone', 'previous display repair', '/repairs/phone/google/loudspeaker-replacement'],
      'power-button-replacement': ['will not turn on does not automatically', 'battery', 'charging', '/repairs/battery-replacement'],
      'volume-button-replacement': ['Volume Up', 'case pressure', 'Liquid or moisture', '/repairs/phone/google/power-button-replacement'],
    }[service];
    for (const phrase of expected.slice(0, 3)) expect(content).toContain(phrase);
    expect(Array.from(document.querySelectorAll('a')).some((link) => link.getAttribute('href') === expected[3])).toBe(true);
    expect(content).toContain('30-minute repair');
    expect(content).toContain('6-month warranty');
    expect(content).toContain('Back up');
  });

  it.each(services)('%s has useful Google Pixel metadata and a clean canonical', (service) => {
    const metadata = service === 'camera-lens-replacement' ? cameraLensMetadata : createVirtualPhoneRepairMetadata('google', service);
    const content = service === 'camera-lens-replacement' ? GOOGLE_PIXEL_CAMERA_LENS_CONTENT : GOOGLE_PIXEL_SHARED_REPAIR_CONTENT[service];
    expect(metadata.title).toBe(content.title);
    expect(metadata.description).toBe(content.metadataDescription);
    expect(content.metadataDescription).toContain('Ringwood Square');
    expect(content.metadataDescription.length).toBeLessThanOrEqual(165);
    expect(metadata.alternates?.canonical).toBe(`/repairs/phone/google/${service}`);
    expect(metadata.openGraph?.url).toBe(`/repairs/phone/google/${service}`);
  });

  it('keeps the five Google Pixel FAQ sets service-specific instead of duplicating a template', () => {
    const questions = Object.values(GOOGLE_PIXEL_SHARED_REPAIR_CONTENT).map((content) => content.faqs.map((faq) => faq.question));
    questions.push(GOOGLE_PIXEL_CAMERA_LENS_CONTENT.faqs.map((faq) => faq.question));
    const allQuestions = questions.flat();
    expect(new Set(allQuestions).size).toBe(allQuestions.length);
  });
});
