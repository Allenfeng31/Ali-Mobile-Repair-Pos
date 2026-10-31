import { describe, expect, it } from 'vitest';

import {
  auditRepairResultDescriptions,
  getNeutralRepairResultDescription,
  getRepairResultDescriptionPresets,
} from './repairResultDescriptions';

describe('repair result description presets', () => {
  it('provides the ten approved Screen Replacement scenarios with device-specific two-sentence copy', () => {
    const presets = getRepairResultDescriptionPresets({
      deviceName: 'iPhone 16 Pro',
      repairType: 'Screen Replacement',
      repairTypeSlug: 'screen-replacement',
    });

    expect(presets.map((preset) => preset.label)).toEqual([
      'No Display',
      'Cracked Glass',
      'Touch Failure',
      'Screen Lines',
      'Black Spots',
      'Flickering',
      'Green / White Screen',
      'Ghost Touch',
      'Dead Pixels',
      'Screen Lifting',
    ]);
    expect(presets.every((preset) => preset.description.includes('iPhone 16 Pro'))).toBe(true);
    expect(presets.every((preset) => preset.description.split('.').filter(Boolean).length === 2)).toBe(true);
    expect(presets.some((preset) => /Ringwood/i.test(preset.description))).toBe(false);
  });

  it.each([
    ['battery-replacement', 'Battery Replacement', ['Rapid Drain', 'Low Battery Health', 'Unexpected Shutdown', 'No Power', 'Swollen Battery', 'Overheating', 'Percentage Jump', 'Battery Warning', 'Short Battery Life', 'Intermittent Power']],
    ['charging-port-replacement', 'Charging Port Replacement', ['Not Charging', 'Loose Port', 'Cable Angle', 'Intermittent Charging', 'Slow Charging', 'Damaged Pins', 'Broken Connector', 'Liquid Exposure', 'Cable Not Detected', 'Data Connection']],
  ])('provides ten approved %s scenarios', (repairTypeSlug, repairType, labels) => {
    const presets = getRepairResultDescriptionPresets({ deviceName: 'Galaxy S24', repairType, repairTypeSlug });

    expect(presets.map((preset) => preset.label)).toEqual(labels);
    expect(presets.every((preset) => preset.description.includes('Galaxy S24'))).toBe(true);
    expect(presets.every((preset) => preset.description.split('.').filter(Boolean).length === 2)).toBe(true);
  });

  it.each([
    'back-glass-replacement',
    'front-camera-replacement',
    'back-camera-replacement',
    'camera-lens-replacement',
    'loudspeaker-replacement',
    'earpiece-speaker-replacement',
    'power-button-replacement',
    'volume-button-replacement',
    'water-damage-repair',
    'logic-board-repair',
    'unmapped-catalogue-repair',
  ])('provides exactly five relevant or neutral options for %s', (repairTypeSlug) => {
    const presets = getRepairResultDescriptionPresets({
      deviceName: 'Test Device',
      repairType: repairTypeSlug === 'unmapped-catalogue-repair' ? 'Specialist Assessment' : repairTypeSlug,
      repairTypeSlug,
    });

    expect(presets).toHaveLength(5);
    expect(presets.every((preset) => preset.description.includes('Test Device'))).toBe(true);
  });

  it('creates a stable, neutral automatic default without asserting a symptom or outcome', () => {
    const input = { deviceName: 'Pixel 9 Pro', repairType: 'Screen Replacement', repairTypeSlug: 'screen-replacement' };
    const first = getNeutralRepairResultDescription(input);

    expect(getNeutralRepairResultDescription(input)).toBe(first);
    expect(first).toContain('Pixel 9 Pro');
    expect(first).toContain('Screen Replacement');
    expect(first).not.toMatch(/cracked|drop|restored|successful|Ringwood/i);
  });
});

describe('legacy description audit', () => {
  it('only proposes replacements for the exact legacy generated pattern', () => {
    const report = auditRepairResultDescriptions([
      {
        id: 'legacy',
        model: 'iPhone 13',
        repair_type: 'Screen Replacement',
        repair_type_slug: 'screen-replacement',
        short_description: 'Before and after result from a iPhone 13 Screen Replacement completed by Ali Mobile Repairs in Ringwood.',
      },
      {
        id: 'authored',
        model: 'iPhone 14',
        repair_type: 'Battery Replacement',
        repair_type_slug: 'battery-replacement',
        short_description: 'Customer reported rapid drain and approved a battery replacement after testing.',
      },
    ]);

    expect(report).toMatchObject({ total: 2, likelyLegacy: 1, userAuthoredOrUnknown: 1 });
    expect(report.proposals).toHaveLength(1);
    expect(report.proposals[0]).toMatchObject({ id: 'legacy', model: 'iPhone 13', repairType: 'Screen Replacement' });
    expect(report.proposals[0].replacement).not.toContain('Ringwood');
  });
});
