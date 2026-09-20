import { describe, expect, it } from 'vitest';
import {
  classifySharedRepairModelSeries,
  groupSharedRepairModelsBySeries,
  supportsSharedRepairSeriesGrouping,
} from './sharedRepairModelSeries';

const model = (modelName: string, modelSlug: string) => ({ model: modelName, modelSlug });

describe('shared repair model series classification', () => {
  it('classifies every Samsung family with the deterministic Shared Page order', () => {
    const models = [
      model('Galaxy A55', 'galaxy-a55'),
      model('Galaxy Note 20', 'galaxy-note-20'),
      model('Galaxy Z Fold 6', 'galaxy-z-fold-6'),
      model('Galaxy S24', 'galaxy-s24'),
      model('Samsung Mystery', 'samsung-mystery'),
      model('Galaxy Z Flip 6', 'galaxy-z-flip-6'),
    ];

    expect(groupSharedRepairModelsBySeries('samsung', models)).toEqual([
      { seriesKey: 's', seriesLabel: 'Galaxy S Series', models: [models[3]] },
      { seriesKey: 'a', seriesLabel: 'Galaxy A Series', models: [models[0]] },
      { seriesKey: 'z', seriesLabel: 'Galaxy Z Series', models: [models[2], models[5]] },
      { seriesKey: 'note', seriesLabel: 'Galaxy Note Series', models: [models[1]] },
      { seriesKey: 'other', seriesLabel: 'Other Samsung Models', models: [models[4]] },
    ]);
  });

  it('uses configured OPPO metadata before the current Find, Reno, and A fallbacks', () => {
    expect(classifySharedRepairModelSeries('oppo', model('Reno-labelled test model', 'find-x8')))
      .toEqual({ key: 'find', label: 'Find Series' });
    expect(classifySharedRepairModelSeries('oppo', model('Find X3 Pro', 'find-x3-pro')))
      .toEqual({ key: 'find', label: 'Find Series' });
    expect(classifySharedRepairModelSeries('oppo', model('Reno 11', 'reno-11')))
      .toEqual({ key: 'reno', label: 'Reno Series' });
    expect(classifySharedRepairModelSeries('oppo', model('A78', 'a78')))
      .toEqual({ key: 'a', label: 'A Series' });
    expect(classifySharedRepairModelSeries('oppo', model('OPPO Mystery', 'oppo-mystery')))
      .toEqual({ key: 'other', label: 'Other OPPO Models' });
  });

  it('groups OPPO deterministically while preserving input order within each family', () => {
    const models = [
      model('Reno 11', 'reno-11'),
      model('Reno 10', 'reno-10'),
      model('Find X8', 'find-x8'),
      model('A78', 'a78'),
      model('OPPO Mystery', 'oppo-mystery'),
    ];

    expect(groupSharedRepairModelsBySeries('oppo', models)).toEqual([
      { seriesKey: 'find', seriesLabel: 'Find Series', models: [models[2]] },
      { seriesKey: 'reno', seriesLabel: 'Reno Series', models: [models[0], models[1]] },
      { seriesKey: 'a', seriesLabel: 'A Series', models: [models[3]] },
      { seriesKey: 'other', seriesLabel: 'Other OPPO Models', models: [models[4]] },
    ]);
  });

  it('uses only the established Huawei families and keeps unknown models visible', () => {
    expect(groupSharedRepairModelsBySeries('huawei', [
      model('Huawei Nova 12', 'nova-12'),
      model('Huawei P60 Pro', 'p60-pro'),
      model('Huawei Y9', 'y9'),
      model('Huawei Mate 60', 'mate-60'),
      model('Huawei Mystery', 'huawei-mystery'),
    ])?.map(({ seriesKey, seriesLabel, models }) => [seriesKey, seriesLabel, models.length])).toEqual([
      ['mate', 'Mate Series', 1],
      ['p', 'P Series', 1],
      ['nova', 'Nova Series', 1],
      ['y', 'Y Series', 1],
      ['other', 'Other Huawei Models', 1],
    ]);
  });

  it('keeps Redmi and POCO inside the canonical Xiaomi brand identity', () => {
    const models = [
      model('Redmi Note 13', 'redmi-note-13'),
      model('POCO F6', 'poco-f6'),
      model('Xiaomi Mi 11', 'mi-11'),
      model('Mystery Handset', 'mystery-handset'),
    ];

    expect(groupSharedRepairModelsBySeries('xiaomi', models)).toEqual([
      { seriesKey: 'redmi', seriesLabel: 'Redmi Series', models: [models[0]] },
      { seriesKey: 'poco', seriesLabel: 'POCO Series', models: [models[1]] },
      { seriesKey: 'xiaomi', seriesLabel: 'Xiaomi / Mi Series', models: [models[2]] },
      { seriesKey: 'other', seriesLabel: 'Other Xiaomi Models', models: [models[3]] },
    ]);
  });

  it('keeps Motorola, HTC, and unknown brands on the direct-model path', () => {
    const example = [model('Moto G85', 'moto-g85')];
    expect(supportsSharedRepairSeriesGrouping('motorola')).toBe(false);
    expect(supportsSharedRepairSeriesGrouping('htc')).toBe(false);
    expect(supportsSharedRepairSeriesGrouping('unknown-brand')).toBe(false);
    expect(groupSharedRepairModelsBySeries('motorola', example)).toBeNull();
    expect(groupSharedRepairModelsBySeries('htc', example)).toBeNull();
    expect(groupSharedRepairModelsBySeries('unknown-brand', example)).toBeNull();
  });
});
