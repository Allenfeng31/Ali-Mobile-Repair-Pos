const PUBLIC_REPAIR_SERVICE_SUFFIXES: ReadonlyArray<readonly [RegExp, string]> = [
  [/(?:^|-)screen(?:-(?:repair|replacement))?$/, 'screen-replacement'],
  [/(?:^|-)battery(?:-(?:service|repair|replacement))?$/, 'battery-replacement'],
  [/(?:^|-)charging-port(?:-(?:repair|replacement))?$/, 'charging-port-replacement'],
  [/(?:^|-)front-camera(?:-replacement)?$/, 'front-camera-replacement'],
  [/(?:^|-)back-camera(?:-replacement)?$/, 'back-camera-replacement'],
  [/(?:^|-)camera-lens(?:-replacement)?$/, 'camera-lens-replacement'],
  [/(?:^|-)earpiece-speaker(?:-replacement)?$/, 'earpiece-speaker-replacement'],
  [/(?:^|-)loudspeaker(?:-replacement)?$/, 'loudspeaker-replacement'],
  [/(?:^|-)microphone(?:-replacement)?$/, 'microphone-replacement'],
  [/(?:^|-)power-button(?:-replacement)?$/, 'power-button-replacement'],
  [/(?:^|-)volume-button(?:-replacement)?$/, 'volume-button-replacement'],
  [/(?:^|-)logic-board(?:-(?:repair|replacement))?$/, 'logic-board-repair'],
  [/(?:^|-)back-glass(?:-(?:repair|replacement))?$/, 'back-glass-replacement'],
  [/(?:^|-)back-housing(?:-(?:repair|replacement))?$/, 'back-glass-replacement'],
  [/(?:^|-)water-damage(?:-(?:repair|recovery|cleaning-assessment))?$/, 'water-damage-repair'],
  [/(?:^|-)charging-repair$/, 'charging-repair'],
];

function serviceLabelSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves known public repair service semantics without trusting model or
 * device-family prefixes. Unknown or unsafe labels deliberately fail closed.
 */
export function getCanonicalPublicRepairServiceSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const slug = serviceLabelSlug(value);
  if (!slug) return null;

  return PUBLIC_REPAIR_SERVICE_SUFFIXES.find(([pattern]) => pattern.test(slug))?.[1] ?? null;
}
