import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import CameraLensLandingPage from './CameraLensLandingPage';
import VirtualPhoneRepairLandingPage from './VirtualPhoneRepairLandingPage';
import { SAMSUNG_CAMERA_LENS_CONTENT, SAMSUNG_SHARED_REPAIR_CONTENT } from '@/data/samsungSharedRepairContent';
import { createVirtualPhoneRepairMetadata } from '@/lib/virtualPhoneRepairRoute';
import { getVirtualPhoneRepair, type VirtualPhoneRepairSlug } from '@/lib/virtualPhoneRepairs';
import { buildSharedRepairPageSupportedModels } from '@/lib/sharedRepairPageV2';
import { getLocalRepairCatalogueFixture } from '@/lib/localRepairCatalogueFixture';

vi.mock('next/script', () => ({ default: (props: ComponentProps<'script'>) => <script {...props} /> }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog: vi.fn() }));
vi.mock('@/lib/repair-results.server', () => ({ fetchSharedRepairPageResultSeeds: vi.fn() }));

import { metadata as cameraLensMetadata } from '@/app/(public)/repairs/phone/samsung/camera-lens-replacement/page';

const services = [
  'camera-lens-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
] as const;
const model = { brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S21', modelSlug: 'galaxy-s21' };
const unsupportedModel = { brand: 'Samsung', brandSlug: 'samsung', model: 'Unsupported fixture', modelSlug: 'unsupported-fixture' };
const quickAnswers = { repairTime: 'Confirm after inspection.', partsSameDay: 'Call us.', warranty: 'Eligible repairs.' };

function renderSamsungHtml(service: (typeof services)[number]) {
  const canonicalPath = `/repairs/phone/samsung/${service}`;
  const supportedModels = buildSharedRepairPageSupportedModels({
    brands: getLocalRepairCatalogueFixture().brands,
    canonicalBrandSlug: 'samsung', repairSlug: service,
  });
  const element = service === 'camera-lens-replacement'
    ? <CameraLensLandingPage
        brandName="Samsung" brandSlug="samsung" title="Samsung Camera Lens Replacement"
        intro={SAMSUNG_CAMERA_LENS_CONTENT.intro} canonicalPath={canonicalPath}
        models={[model, unsupportedModel]}
        sharedPageV2={{ supportedModels, priceCandidates: [], initialResults: [], selectedModelSlug: null, quickAnswers, pricingStrategy: { mode: 'fixed', fixedPrice: 50 } }}
      />
    : <VirtualPhoneRepairLandingPage
        brandName="Samsung" brandSlug="samsung" repairSlug={service as VirtualPhoneRepairSlug}
        canonicalPath={canonicalPath} models={[model, unsupportedModel]}
        sharedPageV2={{ supportedModels, priceCandidates: [], initialResults: [], selectedModelSlug: null, quickAnswers, pricingStrategy: { mode: 'pos-derived' } }}
      />;
  const html = renderToStaticMarkup(element);
  return { html, document: new DOMParser().parseFromString(html, 'text/html'), canonicalPath };
}

describe('Samsung shared-page content in initial server HTML', () => {
  it.each(services)('%s emits only the supported Samsung model from the deterministic local catalogue', (service) => {
    const supportedModels = buildSharedRepairPageSupportedModels({
      brands: getLocalRepairCatalogueFixture().brands, canonicalBrandSlug: 'samsung', repairSlug: service,
    });
    expect(supportedModels.map((item) => item.modelSlug)).toEqual(['galaxy-s21']);
  });

  it.each(services)('%s has a service-intent H1, facts, FAQs, model link and query-free Service/Breadcrumb schemas', (service) => {
    const { document, canonicalPath } = renderSamsungHtml(service);
    const repairName = service === 'camera-lens-replacement' ? 'Camera Lens Replacement' : getVirtualPhoneRepair(service)!.name;
    const facts = document.querySelector('dl[aria-label="Repair facts"]');
    const modelLinks = Array.from(document.querySelectorAll('a')).filter((link) => link.getAttribute('href') === `${canonicalPath}?model=galaxy-s21`);
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((script) => JSON.parse(script.textContent ?? '{}'));

    expect(document.querySelector('h1')?.textContent).toBe(`Samsung ${repairName}`);
    expect(document.querySelector('h1')?.textContent).not.toContain('Ringwood');
    for (const fact of ['From $50', '30 Minutes', '6 Months Warranty', 'Ringwood Square']) expect(facts?.textContent).toContain(fact);
    expect(document.querySelectorAll('.faq-item').length).toBeGreaterThanOrEqual(6);
    expect(document.querySelector('.faq-section')?.textContent).toContain('Samsung');
    expect(modelLinks).toHaveLength(1);
    expect(document.querySelector('a[href*="unsupported-fixture"]')).toBeNull();
    expect(document.body.textContent).toContain('Kiosk C1');
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Service', 'BreadcrumbList']);
    expect(schemas[0]).toMatchObject({ name: `Samsung ${repairName}`, url: `https://www.alimobile.com.au${canonicalPath}`, provider: { '@id': 'https://www.alimobile.com.au/#localbusiness' } });
    expect(schemas[1].itemListElement.at(-1).item).toBe(`https://www.alimobile.com.au${canonicalPath}`);
    expect(JSON.stringify(schemas)).not.toMatch(/FAQPage|Product|Offer|AggregateOffer|availability|\?model=/);
  });

  it.each(services)('%s has distinct Samsung diagnosis, preparation and contextual linking', (service) => {
    const { document } = renderSamsungHtml(service);
    const content = document.body.textContent ?? '';
    const expected = {
      'camera-lens-replacement': ['protective rear-camera glass', 'Back Camera Module Replacement', 'dust and moisture', '/repairs/phone/samsung'],
      'loudspeaker-replacement': ['ringtones, music, notifications and speakerphone', 'earpiece', 'microphone', '/repairs/phone/samsung/earpiece-speaker-replacement'],
      'earpiece-speaker-replacement': ['upper call receiver', 'speakerphone', 'previous screen repair', '/repairs/phone/samsung/loudspeaker-replacement'],
      'power-button-replacement': ['will not power on does not automatically', 'battery', 'charging', '/repairs/battery-replacement'],
      'volume-button-replacement': ['volume-up or volume-down', 'case pressure', 'Liquid or moisture', '/repairs/phone/samsung/power-button-replacement'],
    }[service];
    for (const phrase of expected.slice(0, 3)) expect(content).toContain(phrase);
    expect(Array.from(document.querySelectorAll('a')).some((link) => link.getAttribute('href') === expected[3])).toBe(true);
    expect(content).toContain('30 minutes');
    expect(content).toContain('6-month warranty');
    expect(content).toContain('Back up');
  });

  it.each(services)('%s has useful Samsung metadata and clean canonical', (service) => {
    const metadata = service === 'camera-lens-replacement' ? cameraLensMetadata : createVirtualPhoneRepairMetadata('samsung', service);
    const content = service === 'camera-lens-replacement' ? SAMSUNG_CAMERA_LENS_CONTENT : SAMSUNG_SHARED_REPAIR_CONTENT[service];
    expect(metadata.title).toBe(content.title);
    expect(metadata.description).toBe(content.metadataDescription);
    expect(content.metadataDescription).toContain('Ringwood Square');
    expect(content.metadataDescription.length).toBeLessThanOrEqual(165);
    expect(metadata.alternates?.canonical).toBe(`/repairs/phone/samsung/${service}`);
    expect(metadata.openGraph?.url).toBe(`/repairs/phone/samsung/${service}`);
  });

  it('keeps the five Samsung FAQ sets service-specific rather than duplicating one template', () => {
    const questions = Object.values(SAMSUNG_SHARED_REPAIR_CONTENT).map((content) => content.faqs.map((faq) => faq.question));
    questions.push(SAMSUNG_CAMERA_LENS_CONTENT.faqs.map((faq) => faq.question));
    const allQuestions = questions.flat();
    expect(new Set(allQuestions).size).toBe(allQuestions.length);
  });
});
