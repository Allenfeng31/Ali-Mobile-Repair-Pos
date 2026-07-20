import { describe, expect, it } from 'vitest';
import {
  applyRepairResultTaxonomyChange,
  createInitialRepairResultForm,
  getRepairResultDestinationPreview,
  getRepairResultTaxonomyOptions,
  toRepairResultSubmissionFields,
  validateRepairResultSubmission,
  type RepairResultTaxonomy,
} from './repairResultWorkflow';

const taxonomy: RepairResultTaxonomy = {
  categories: [
    {
      value: 'phone', label: 'Phone', brands: [{
        name: 'Samsung', slug: 'samsung', models: [{
          name: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [{
            name: 'Screen Replacement', slug: 'screen-replacement', relatedRepairUrl: '/repairs/phone/samsung/galaxy-s24/screen-replacement',
          }],
        }],
      }],
    },
    {
      value: 'laptop', label: 'Laptop', brands: [{
        name: 'MacBook', slug: 'macbook', models: [{
          name: 'MacBook Air M2 13-inch 2022', slug: 'macbook-air-m2-13-2022', repairTypes: [{
            name: 'Screen Replacement', slug: 'screen-replacement', relatedRepairUrl: '/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement',
          }],
        }],
      }],
    },
  ],
};

describe('Repair Result taxonomy workflow', () => {
  it('drives dependent category, brand, model, and repair selections from canonical taxonomy', () => {
    let form = createInitialRepairResultForm();
    form = applyRepairResultTaxonomyChange(form, taxonomy, 'device_category', 'laptop').form;
    form = applyRepairResultTaxonomyChange(form, taxonomy, 'brand_slug', 'macbook').form;
    form = applyRepairResultTaxonomyChange(form, taxonomy, 'model_slug', 'macbook-air-m2-13-2022').form;
    const outcome = applyRepairResultTaxonomyChange(form, taxonomy, 'repair_type_slug', 'screen-replacement');

    expect(getRepairResultTaxonomyOptions(taxonomy, outcome.form)).toMatchObject({
      brands: [{ slug: 'macbook' }],
      models: [{ slug: 'macbook-air-m2-13-2022' }],
      repairTypes: [{ slug: 'screen-replacement' }],
    });
    expect(outcome.form).toMatchObject({
      device_category: 'laptop',
      brand: 'MacBook',
      brand_slug: 'macbook',
      model: 'MacBook Air M2 13-inch 2022',
      model_slug: 'macbook-air-m2-13-2022',
      repair_type: 'Screen Replacement',
      repair_type_slug: 'screen-replacement',
      related_repair_url: '/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement',
    });
  });

  it('resets invalid child selections without changing staff-selected feature flags', () => {
    const selected = {
      ...createInitialRepairResultForm(),
      device_category: 'laptop' as const,
      brand: 'MacBook', brand_slug: 'macbook', model: 'MacBook Air M2 13-inch 2022', model_slug: 'macbook-air-m2-13-2022',
      repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
      featured_on_homepage: true, featured_on_repair_hub: true, featured_on_brand_hub: true,
    };

    const { form } = applyRepairResultTaxonomyChange(selected, taxonomy, 'device_category', 'phone');

    expect(form).toMatchObject({
      device_category: 'phone', brand: '', brand_slug: '', model: '', model_slug: '', repair_type: '', repair_type_slug: '',
      featured_on_homepage: true, featured_on_repair_hub: true, featured_on_brand_hub: true,
    });
  });

  it('generates deterministic SEO text and the canonical MacBook repair URL', () => {
    let form = createInitialRepairResultForm();
    form = applyRepairResultTaxonomyChange(form, taxonomy, 'device_category', 'laptop').form;
    form = applyRepairResultTaxonomyChange(form, taxonomy, 'brand_slug', 'macbook').form;
    form = applyRepairResultTaxonomyChange(form, taxonomy, 'model_slug', 'macbook-air-m2-13-2022').form;
    const { form: completed, generatedSeo } = applyRepairResultTaxonomyChange(form, taxonomy, 'repair_type_slug', 'screen-replacement');

    expect(generatedSeo).toEqual({
      title: 'MacBook Air M2 13-inch 2022 Screen Replacement in Ringwood',
      short_description: 'Before and after result from a MacBook Air M2 13-inch 2022 Screen Replacement completed by Ali Mobile Repairs in Ringwood.',
      image_pair_alt_text: 'Before and after photos of a MacBook Air M2 13-inch 2022 Screen Replacement completed in Ringwood.',
    });
    expect(completed.related_repair_url).toBe('/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement');
  });

  it('keeps manual SEO text while taxonomy changes regenerate only auto-generated fields', () => {
    const form = { ...createInitialRepairResultForm(), title: 'Staff title', short_description: '', image_pair_alt_text: '' };
    const outcome = applyRepairResultTaxonomyChange(form, taxonomy, 'device_category', 'laptop');

    expect(outcome.form.title).toBe('Staff title');
    expect(outcome.generatedSeo).toBeNull();
  });

  it('defaults new results to draft and blocks invalid or unpublished privacy-unsafe submissions', () => {
    const form = createInitialRepairResultForm();

    expect(form.status).toBe('draft');
    expect(validateRepairResultSubmission(form, taxonomy)).toBe('Select a valid canonical repair destination before saving.');
    expect(validateRepairResultSubmission({ ...form, status: 'published', privacy_checked: false }, taxonomy)).toBe('Privacy confirmation is required before publishing.');
  });

  it('keeps all feature fields in the existing submission payload and distinguishes destinations', () => {
    const form = {
      ...createInitialRepairResultForm(),
      device_category: 'laptop' as const,
      brand: 'MacBook', brand_slug: 'macbook', model: 'MacBook Air M2 13-inch 2022', model_slug: 'macbook-air-m2-13-2022',
      repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
      related_repair_url: '/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement',
      featured_on_homepage: true, featured_on_repair_hub: true, featured_on_brand_hub: true,
    };

    expect(toRepairResultSubmissionFields(form)).toMatchObject({
      featured_on_homepage: true,
      featured_on_repair_hub: true,
      featured_on_brand_hub: true,
    });
    expect(getRepairResultDestinationPreview(form, taxonomy)).toEqual([
      { label: 'Exact Model Page', url: '/repairs/laptop/macbook/macbook-air-m2-13-2022', visibility: 'Visible after publishing' },
      { label: 'Exact Repair Page', url: '/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement', visibility: 'Visible after publishing' },
      { label: 'Homepage', url: '/', visibility: 'Visible after publishing' },
      { label: 'Repair Hub', url: '/repairs/laptop', visibility: 'Visible after publishing' },
      { label: 'Brand Repair Hub', url: '/repairs/laptop/macbook', visibility: 'Visible after publishing' },
    ]);
  });

  it('does not make model or repair destinations depend on feature flags after publishing', () => {
    const form = {
      ...createInitialRepairResultForm(),
      status: 'published' as const,
      device_category: 'phone' as const,
      brand: 'Samsung', brand_slug: 'samsung', model: 'Galaxy S24', model_slug: 'galaxy-s24',
      repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
      related_repair_url: '/repairs/phone/samsung/galaxy-s24/screen-replacement',
    };

    expect(getRepairResultDestinationPreview(form, taxonomy)).toEqual([
      { label: 'Exact Model Page', url: '/repairs/phone/samsung/galaxy-s24', visibility: 'Active when published' },
      { label: 'Exact Repair Page', url: '/repairs/phone/samsung/galaxy-s24/screen-replacement', visibility: 'Active when published' },
    ]);
  });
});
