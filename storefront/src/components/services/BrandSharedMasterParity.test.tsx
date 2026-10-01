import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import CameraLensLandingPage, { resolveCameraLensSelectedDevice } from './CameraLensLandingPage';
import VirtualPhoneRepairLandingPage from './VirtualPhoneRepairLandingPage';
import { resolveBrandSharedPageV2Selection } from '@/lib/virtualPhoneRepairRoute';
import { getVirtualPhoneRepair, type VirtualPhoneRepairSlug } from '@/lib/virtualPhoneRepairs';
import { buildSharedRepairPageSupportedModels, type SharedRepairPageSupportedModel } from '@/lib/sharedRepairPageV2';
import type { RepairResultMatchingItem } from '@/lib/repair-results';
import { getLocalRepairCatalogueFixture } from '@/lib/localRepairCatalogueFixture';

vi.mock('next/script', () => ({ default: (props: ComponentProps<'script'>) => <script {...props} /> }));

const brands = [
  { route: 'samsung', slug: 'samsung', name: 'Samsung', model: 'Galaxy S24', modelSlug: 'galaxy-s24' },
  { route: 'google', slug: 'google-pixel', name: 'Google Pixel', model: 'Pixel 8 Pro', modelSlug: 'pixel-8-pro' },
  { route: 'oppo', slug: 'oppo', name: 'OPPO', model: 'Find X8 Pro', modelSlug: 'find-x8-pro' },
] as const;
const services = [
  'camera-lens-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
] as const;
const cases = brands.flatMap((brand) => services.map((service) => ({ ...brand, service, path: `/repairs/phone/${brand.route}/${service}` })));
const quickAnswers = { repairTime: 'Confirm after inspection.', partsSameDay: 'Call us.', warranty: 'Eligible repairs.' };

function page(caseItem: (typeof cases)[number], selected: boolean, initialResults: RepairResultMatchingItem[] = []) {
  const model = { brand: caseItem.name, brandSlug: caseItem.slug, model: caseItem.model, modelSlug: caseItem.modelSlug };
  const supportedModels: SharedRepairPageSupportedModel[] = [{ category: 'phone', canonicalBrandSlug: caseItem.slug, ...model }];
  if (caseItem.service === 'camera-lens-replacement') {
    const selection = resolveCameraLensSelectedDevice({
      route: { scope: 'brand', canonicalBrandSlug: caseItem.slug, routeBrandSegment: caseItem.route },
      models: [model],
      query: selected ? { model: caseItem.modelSlug } : {},
    });
    return {
      element: <CameraLensLandingPage
        brandName={caseItem.name} brandSlug={caseItem.slug}
        title={`${caseItem.name} Camera Lens Replacement`} intro="Inspection first."
        canonicalPath={caseItem.path} models={[model]} selectedDevice={selection.selectedDevice}
        sharedPageV2={{ supportedModels, priceCandidates: [], initialResults, selectedModelSlug: selection.selectedModelSlug, quickAnswers, pricingStrategy: { mode: 'fixed', fixedPrice: 50 } }}
      />,
      selection,
      repairName: 'Camera Lens Replacement',
    };
  }

  const repairSlug = caseItem.service as VirtualPhoneRepairSlug;
  const repairName = getVirtualPhoneRepair(repairSlug)!.name;
  const selection = resolveBrandSharedPageV2Selection({
    brand: caseItem.route, repairSlug, repairName, supportedModels,
    query: selected ? { model: caseItem.modelSlug } : {},
  });
  return {
    element: <VirtualPhoneRepairLandingPage
      brandName={caseItem.name} brandSlug={caseItem.slug} repairSlug={repairSlug}
      canonicalPath={caseItem.path} models={[model]}
      hierarchy={selection.selectedDevice ? {
        models: [], selectedBrandSlug: caseItem.slug, selectedModelSlug: selection.selectedModelSlug,
        selectedDevice: { ...selection.selectedDevice, priceLabel: 'Quote on Request' },
      } : undefined}
      sharedPageV2={{ supportedModels, priceCandidates: [], initialResults, selectedModelSlug: selection.selectedModelSlug, quickAnswers, pricingStrategy: { mode: 'pos-derived' } }}
    />,
    selection,
    repairName,
  };
}

describe('all 15 brand-shared routes use the centered Master', () => {
  it.each(cases)('$path derives only eligible same-brand models from the catalogue', (caseItem) => {
    const supportedModels = buildSharedRepairPageSupportedModels({
      brands: getLocalRepairCatalogueFixture().brands,
      canonicalBrandSlug: caseItem.slug,
      repairSlug: caseItem.service,
    });
    expect(supportedModels.map((model) => model.modelSlug)).toEqual([caseItem.slug === 'samsung' ? 'galaxy-s21' : caseItem.slug === 'google-pixel' ? 'pixel-8-pro' : 'find-x5-pro']);
    expect(supportedModels.every((model) => model.canonicalBrandSlug === caseItem.slug)).toBe(true);
  });

  it.each(cases.filter((caseItem) => caseItem.service === 'camera-lens-replacement' || caseItem.service === 'loudspeaker-replacement'))('$path places supplied Repair Results directly after the Master and before guidance', (caseItem) => {
    const repairName = caseItem.service === 'camera-lens-replacement' ? 'Camera Lens Replacement' : 'Loudspeaker Replacement';
    const result: RepairResultMatchingItem = {
      id: 'synthetic-result', device_category: 'phone', brand: caseItem.name, brand_slug: caseItem.slug,
      model: caseItem.model, model_slug: caseItem.modelSlug, repair_type: repairName,
      repair_type_slug: caseItem.service, image_pair_alt_text: null, title: 'Approved repair result',
      short_description: null, related_repair_url: null,
    };
    const { container } = render(page(caseItem, true, [result]).element);
    const hero = container.querySelector('[data-camera-module-hero]') as HTMLElement;
    const resultHeading = screen.getByRole('heading', { level: 2, name: `Real ${repairName} Results` });
    const guidanceHeading = screen.getByRole('heading', { level: 2, name: /explained clearly/i });
    expect(hero.compareDocumentPosition(resultHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(resultHeading.compareDocumentPosition(guidanceHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each(cases)('$path rejects an invalid model before rendering a selected card', (caseItem) => {
    const supportedModels: SharedRepairPageSupportedModel[] = [{
      category: 'phone', canonicalBrandSlug: caseItem.slug, brand: caseItem.name,
      brandSlug: caseItem.slug, model: caseItem.model, modelSlug: caseItem.modelSlug,
    }];
    const selection = caseItem.service === 'camera-lens-replacement'
      ? resolveCameraLensSelectedDevice({
          route: { scope: 'brand', canonicalBrandSlug: caseItem.slug, routeBrandSegment: caseItem.route },
          models: supportedModels, query: { model: 'invalid-model' },
        })
      : resolveBrandSharedPageV2Selection({
          brand: caseItem.route, repairSlug: caseItem.service,
          repairName: getVirtualPhoneRepair(caseItem.service)!.name,
          supportedModels, query: { model: 'invalid-model' },
        });
    expect(selection.selectedDevice).toBeNull();
    expect(selection.selectedModelSlug).toBeNull();
  });

  it.each(cases)('$path generic state', (caseItem) => {
    const { element, repairName } = page(caseItem, false);
    const { container } = render(element);
    const hero = container.querySelector('[data-camera-module-hero]') as HTMLElement;
    const selector = container.querySelector('[data-camera-module-model-selector]') as HTMLElement;
    const facts = screen.getByLabelText('Repair facts');

    expect(within(hero).getByRole('heading', { level: 1, name: `${caseItem.name} ${repairName}` })).toBeInTheDocument();
    expect(hero).toHaveClass('repair-hero', 'repair-detail-hero');
    expect(within(facts).getByText('From $50')).toBeInTheDocument();
    expect(within(facts).getByText('30 Minutes')).toBeInTheDocument();
    expect(within(facts).getByText('6 Months Warranty')).toBeInTheDocument();
    expect(within(facts).getByText('Ringwood Square')).toBeInTheDocument();
    expect(selector).not.toHaveAttribute('hidden');
    const modelLink = within(selector).getByRole('link', { name: new RegExp(caseItem.model, 'i') });
    expect(modelLink).toHaveAttribute('href', `${caseItem.path}?model=${caseItem.modelSlug}`);
    expect(modelLink.closest('[data-shared-repair-hierarchy-panel][data-expanded="false"]')).toBeNull();
    expect(within(selector).getByRole('heading', { level: 2, name: `${caseItem.name} ${repairName} by Model` })).toBeInTheDocument();
    expect(selector.compareDocumentPosition(screen.getByRole('heading', { level: 2, name: /explained clearly/i })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector('[data-camera-module-hero-price-card]')).toBeNull();
    expect(container.querySelector('[data-shared-repair-selected-device]')).toBeNull();
    expect(screen.queryByLabelText('Commercial repair facts')).toBeNull();
  });

  it.each(cases)('$path selected state', (caseItem) => {
    const { element, selection, repairName } = page(caseItem, true);
    const { container } = render(element);
    const hero = container.querySelector('[data-camera-module-hero]') as HTMLElement;
    const card = container.querySelector('[data-camera-module-hero-price-card]') as HTMLElement;
    const selector = container.querySelector('[data-camera-module-model-selector]') as HTMLElement;
    const facts = screen.getByLabelText('Repair facts');

    expect(within(hero).getByRole('heading', { level: 1, name: `${caseItem.name} ${repairName}` })).toBeInTheDocument();
    expect(within(card).getByRole('heading', { level: 2, name: `${caseItem.name} ${caseItem.model}` })).toBeInTheDocument();
    expect(within(card).getByText(repairName)).toBeInTheDocument();
    expect(within(card).getByText(caseItem.service === 'camera-lens-replacement' ? '$50' : 'Quote on Request')).toBeInTheDocument();
    expect(within(facts).getByText('From $50')).toBeInTheDocument();
    expect(within(facts).getByText('30 Minutes')).toBeInTheDocument();
    expect(within(facts).getByText('6 Months Warranty')).toBeInTheDocument();
    expect(within(facts).getByText('Ringwood Square')).toBeInTheDocument();
    expect(selector).toHaveAttribute('hidden');
    expect(within(hero).getByRole('link', { name: /Book Repair Now/ })).toHaveAttribute('href', selection.selectedDevice?.booking.href);
    expect(within(hero).getByRole('link', { name: /Call 0481 058 514/ })).toHaveAttribute('href', 'tel:0481058514');
    expect(within(hero).getByRole('link', { name: /Change model/ })).toHaveAttribute('href', caseItem.path);
    expect(container.querySelector('[data-shared-repair-selected-device]')).toBeNull();
    expect(renderToStaticMarkup(element)).not.toContain('camera-module-model-selector-region[hidden] { display: block !important; }');
  });

  it.each(cases.filter((caseItem) => caseItem.service === 'power-button-replacement'))('$path reveals models immediately after Change model clears the query', (caseItem) => {
    const selected = page(caseItem, true);
    const { container, rerender } = render(selected.element);
    expect(screen.getByRole('link', { name: /Change model/ })).toHaveAttribute('href', caseItem.path);

    rerender(page(caseItem, false).element);

    const selector = container.querySelector('[data-camera-module-model-selector]') as HTMLElement;
    expect(container.querySelector('[data-camera-module-hero-price-card]')).toBeNull();
    expect(selector).not.toHaveAttribute('hidden');
    const modelLink = within(selector).getByRole('link', { name: new RegExp(caseItem.model, 'i') });
    expect(modelLink).toHaveAttribute('href', `${caseItem.path}?model=${caseItem.modelSlug}`);
    expect(modelLink.closest('[data-shared-repair-hierarchy-panel][data-expanded="false"]')).toBeNull();

    rerender(selected.element);
    expect(container.querySelector('[data-camera-module-model-selector]')).toHaveAttribute('hidden');
    expect(container.querySelectorAll('[data-camera-module-hero-price-card]')).toHaveLength(1);
  });
});
