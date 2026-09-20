import { describe, expect, it } from 'vitest';
import { buildSharedRepairHierarchy } from './sharedRepairHierarchy';

describe('buildSharedRepairHierarchy', () => {
  it('preserves caller order, applies B1 series grouping, and keeps unknown brands flat', () => {
    const hierarchy = buildSharedRepairHierarchy([
      { brandSlug: 'samsung', brandLabel: 'Samsung', modelSlug: 'galaxy-s24', modelLabel: 'Galaxy S24', repairLabel: 'Front Camera Replacement', bookingHref: '/book/s24', priceLabel: '$99' },
      { brandSlug: 'samsung', brandLabel: 'Samsung', modelSlug: 'galaxy-a55', modelLabel: 'Galaxy A55', repairLabel: 'Front Camera Replacement', bookingHref: '/book/a55', priceLabel: 'From $129' },
      { brandSlug: 'htc', brandLabel: 'HTC', modelSlug: 'mystery', modelLabel: 'Mystery', repairLabel: 'Front Camera Replacement', bookingHref: '/book/mystery', priceLabel: null },
    ]);

    expect(hierarchy.brands.map((brand) => brand.brandSlug)).toEqual(['samsung', 'htc']);
    expect(hierarchy.brands[0]?.series.map((series) => series.seriesKey)).toEqual(['s', 'a']);
    expect(hierarchy.brands[0]?.models).toEqual([]);
    expect(hierarchy.brands[1]?.series).toEqual([]);
    expect(hierarchy.brands[1]?.models.map((model) => model.modelSlug)).toEqual(['mystery']);
    expect(hierarchy.brands[0]?.modelCount).toBe(2);
  });

  it('derives selected brand, series, and model-list visibility without reordering models', () => {
    const hierarchy = buildSharedRepairHierarchy(
      Array.from({ length: 6 }, (_, index) => ({
        brandSlug: 'samsung',
        brandLabel: 'Samsung',
        modelSlug: `galaxy-s${index + 1}`,
        modelLabel: `Galaxy S${index + 1}`,
        repairLabel: 'Screen Replacement',
        bookingHref: `/book/s${index + 1}`,
        priceLabel: index === 0 ? '$99' : null,
      })),
      { selectedModelSlug: 'galaxy-s6' },
    );

    const brand = hierarchy.brands[0]!;
    const series = brand.series[0]!;
    expect(brand.initiallyExpanded).toBe(true);
    expect(series.initiallyExpanded).toBe(true);
    expect(series.initiallyExpandedModelList).toBe(true);
    expect(series.models.map((model) => model.modelSlug)).toEqual([
      'galaxy-s1', 'galaxy-s2', 'galaxy-s3', 'galaxy-s4', 'galaxy-s5', 'galaxy-s6',
    ]);
  });

  it('keeps every supported Samsung family, including unclassified models, in the B1 taxonomy tree', () => {
    const hierarchy = buildSharedRepairHierarchy([
      { brandSlug: 'samsung', brandLabel: 'Samsung', modelSlug: 'galaxy-s24', modelLabel: 'Galaxy S24', repairLabel: 'Screen Replacement', bookingHref: '/book/s24', priceLabel: null },
      { brandSlug: 'samsung', brandLabel: 'Samsung', modelSlug: 'galaxy-a55', modelLabel: 'Galaxy A55', repairLabel: 'Screen Replacement', bookingHref: '/book/a55', priceLabel: null },
      { brandSlug: 'samsung', brandLabel: 'Samsung', modelSlug: 'galaxy-z-fold6', modelLabel: 'Galaxy Z Fold6', repairLabel: 'Screen Replacement', bookingHref: '/book/z6', priceLabel: null },
      { brandSlug: 'samsung', brandLabel: 'Samsung', modelSlug: 'galaxy-note20', modelLabel: 'Galaxy Note20', repairLabel: 'Screen Replacement', bookingHref: '/book/n20', priceLabel: null },
      { brandSlug: 'samsung', brandLabel: 'Samsung', modelSlug: 'unknown', modelLabel: 'Unknown Samsung', repairLabel: 'Screen Replacement', bookingHref: '/book/unknown', priceLabel: null },
    ]);

    expect(hierarchy.brands[0]?.series.map((series) => series.seriesKey)).toEqual(['s', 'a', 'z', 'note', 'other']);
    expect(hierarchy.brands[0]?.series.at(-1)?.models.map((model) => model.modelSlug)).toEqual(['unknown']);
  });
});
