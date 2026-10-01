import '@testing-library/jest-dom/vitest';
import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import CameraLensLandingPage from './CameraLensLandingPage';
import VirtualPhoneRepairLandingPage from './VirtualPhoneRepairLandingPage';
import { OPPO_CAMERA_LENS_CONTENT, OPPO_SHARED_REPAIR_CONTENT } from '@/data/oppoSharedRepairContent';
import { createVirtualPhoneRepairMetadata } from '@/lib/virtualPhoneRepairRoute';
import { getVirtualPhoneRepair, type VirtualPhoneRepairSlug } from '@/lib/virtualPhoneRepairs';
import { buildSharedRepairPageSupportedModels } from '@/lib/sharedRepairPageV2';
import { getLocalRepairCatalogueFixture } from '@/lib/localRepairCatalogueFixture';

vi.mock('next/script', () => ({ default: (props: ComponentProps<'script'>) => <script {...props} /> }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog: vi.fn() }));
vi.mock('@/lib/repair-results.server', () => ({ fetchSharedRepairPageResultSeeds: vi.fn() }));

import { metadata as cameraLensMetadata } from '@/app/(public)/repairs/phone/oppo/camera-lens-replacement/page';

const services = [
  'camera-lens-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
] as const;
const model = { brand: 'OPPO', brandSlug: 'oppo', model: 'Find X5 Pro', modelSlug: 'find-x5-pro' };
const unsupportedModel = { brand: 'OPPO', brandSlug: 'oppo', model: 'Unsupported fixture', modelSlug: 'unsupported-fixture' };
const quickAnswers = { repairTime: 'Confirm after inspection.', partsSameDay: 'Call us.', warranty: 'Eligible repairs.' };

function renderOppoHtml(service: (typeof services)[number]) {
  const canonicalPath = `/repairs/phone/oppo/${service}`;
  const supportedModels = buildSharedRepairPageSupportedModels({
    brands: getLocalRepairCatalogueFixture().brands,
    canonicalBrandSlug: 'oppo', repairSlug: service,
  });
  const element = service === 'camera-lens-replacement'
    ? <CameraLensLandingPage
        brandName="OPPO" brandSlug="oppo" title="OPPO Camera Lens Replacement"
        intro={OPPO_CAMERA_LENS_CONTENT.intro} canonicalPath={canonicalPath}
        models={[model, unsupportedModel]}
        sharedPageV2={{ supportedModels, priceCandidates: [], initialResults: [], selectedModelSlug: null, quickAnswers, pricingStrategy: { mode: 'fixed', fixedPrice: 50 } }}
      />
    : <VirtualPhoneRepairLandingPage
        brandName="OPPO" brandSlug="oppo" repairSlug={service as VirtualPhoneRepairSlug}
        canonicalPath={canonicalPath} models={[model, unsupportedModel]}
        sharedPageV2={{ supportedModels, priceCandidates: [], initialResults: [], selectedModelSlug: null, quickAnswers, pricingStrategy: { mode: 'pos-derived' } }}
      />;
  const html = renderToStaticMarkup(element);
  return { html, document: new DOMParser().parseFromString(html, 'text/html'), canonicalPath };
}

describe('OPPO shared-page content in initial server HTML', () => {
  it.each(services)('%s emits only the supported OPPO model from the deterministic local catalogue', (service) => {
    const supportedModels = buildSharedRepairPageSupportedModels({
      brands: getLocalRepairCatalogueFixture().brands, canonicalBrandSlug: 'oppo', repairSlug: service,
    });
    expect(supportedModels.map((item) => item.modelSlug)).toEqual(['find-x5-pro']);
  });

  it.each(services)('%s has an intent H1, facts, six FAQs, a model anchor, and query-free Service/Breadcrumb schemas', (service) => {
    const { document, canonicalPath } = renderOppoHtml(service);
    const repairName = service === 'camera-lens-replacement' ? 'Camera Lens Replacement' : getVirtualPhoneRepair(service)!.name;
    const facts = document.querySelector('dl[aria-label="Repair facts"]');
    const modelLinks = Array.from(document.querySelectorAll('a')).filter((link) => link.getAttribute('href') === `${canonicalPath}?model=find-x5-pro`);
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((script) => JSON.parse(script.textContent ?? '{}'));

    expect(document.querySelector('h1')?.textContent).toBe(`OPPO ${repairName}`);
    expect(document.querySelector('h1')?.textContent).not.toContain('Ringwood');
    for (const fact of ['From $50', '30 Minutes', '6 Months Warranty', 'Ringwood Square']) expect(facts?.textContent).toContain(fact);
    expect(document.querySelectorAll('.faq-item')).toHaveLength(6);
    expect(modelLinks).toHaveLength(1);
    expect(document.querySelector('a[href*="unsupported-fixture"]')).toBeNull();
    expect(document.body.textContent).toContain('Kiosk C1');
    expect(schemas.map((schema) => schema['@type'])).toEqual(['Service', 'BreadcrumbList']);
    expect(schemas[0]).toMatchObject({ name: `OPPO ${repairName}`, url: `https://www.alimobile.com.au${canonicalPath}`, provider: { '@id': 'https://www.alimobile.com.au/#localbusiness' } });
    expect(schemas[1].itemListElement.at(-1).item).toBe(`https://www.alimobile.com.au${canonicalPath}`);
    expect(JSON.stringify(schemas)).not.toMatch(/FAQPage|Product|Offer|AggregateOffer|availability|\?model=/);
  });

  it.each(services)('%s has distinct OPPO diagnosis, preparation, and contextual links', (service) => {
    const { document } = renderOppoHtml(service);
    const content = document.body.textContent ?? '';
    const expected = {
      'camera-lens-replacement': ['protective camera lens glass', 'internal camera module', 'dust and moisture', '/repairs/phone/oppo'],
      'loudspeaker-replacement': ['ringtones, media, notifications and speakerphone', 'earpiece', 'microphone', '/repairs/phone/oppo/earpiece-speaker-replacement'],
      'earpiece-speaker-replacement': ['upper call receiver', 'speakerphone', 'previous display repair', '/repairs/phone/oppo/loudspeaker-replacement'],
      'power-button-replacement': ['will not turn on does not automatically', 'battery', 'charging', '/repairs/battery-replacement'],
      'volume-button-replacement': ['Volume Up', 'tight case pressure', 'Liquid or moisture', '/repairs/phone/oppo/power-button-replacement'],
    }[service];
    for (const phrase of expected.slice(0, 3)) expect(content).toContain(phrase);
    expect(Array.from(document.querySelectorAll('a')).some((link) => link.getAttribute('href') === expected[3])).toBe(true);
    expect(content).toContain('30-minute repair');
    expect(content).toContain('6-month warranty');
    expect(content).toContain('Back up');
  });

  it.each(services)('%s has useful OPPO metadata and a clean canonical', (service) => {
    const metadata = service === 'camera-lens-replacement' ? cameraLensMetadata : createVirtualPhoneRepairMetadata('oppo', service);
    const content = service === 'camera-lens-replacement' ? OPPO_CAMERA_LENS_CONTENT : OPPO_SHARED_REPAIR_CONTENT[service];
    expect(metadata.title).toBe(content.title);
    expect(metadata.description).toBe(content.metadataDescription);
    expect(content.metadataDescription).toContain('Ringwood Square');
    expect(content.metadataDescription.length).toBeLessThanOrEqual(165);
    expect(metadata.alternates?.canonical).toBe(`/repairs/phone/oppo/${service}`);
    expect(metadata.openGraph?.url).toBe(`/repairs/phone/oppo/${service}`);
  });

  it('keeps the five OPPO FAQ sets service-specific instead of duplicating a template', () => {
    const questions = Object.values(OPPO_SHARED_REPAIR_CONTENT).map((content) => content.faqs.map((faq) => faq.question));
    questions.push(OPPO_CAMERA_LENS_CONTENT.faqs.map((faq) => faq.question));
    const allQuestions = questions.flat();
    expect(new Set(allQuestions).size).toBe(allQuestions.length);
  });
});
