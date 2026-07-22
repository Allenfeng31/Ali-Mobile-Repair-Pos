export interface RepairOptionWithSlug {
  slug: string;
}

const REPAIR_OPTION_PRIORITY: Record<string, number> = {
  "screen-replacement": 1,
  "screen-repair": 1,
  "battery-replacement": 2,
  "battery-repair": 2,
  "battery-service": 2,
  "charging-port-replacement": 3,
  "charging-port-repair": 3,
  "charging-port": 3,
  "back-glass-replacement": 4,
  "back-glass-repair": 4,
  "back-glass": 4,
  "back-housing-replacement": 4,
  "back-housing": 4,
  "back-camera-replacement": 5,
  "back-camera": 5,
  "front-camera-replacement": 6,
  "front-camera": 6,
  "camera-lens-replacement": 7,
  "back-camera-lens-replacement": 7,
  "water-damage-repair": 8,
  "water-damage-cleaning": 8,
  "water-damage": 8,
  "loudspeaker-replacement": 9,
  "loud-speaker-replacement": 9,
  "earpiece-speaker-replacement": 10,
  "earpiece-replacement": 10,
  "power-button-replacement": 11,
  "volume-button-replacement": 12,
  "logic-board-repair": 13,
  "logic-board-replacement": 13,
};

function getRepairOptionPriority(slug: string) {
  return REPAIR_OPTION_PRIORITY[slug.trim().toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
}

export type RepairOptionIntent =
  | 'screen'
  | 'battery'
  | 'charging-port'
  | 'back-glass'
  | 'back-camera'
  | 'front-camera'
  | 'camera-lens'
  | 'water-damage'
  | 'loudspeaker'
  | 'earpiece-speaker'
  | 'power-button'
  | 'volume-button'
  | 'logic-board'
  | 'generic';

const REPAIR_OPTION_INTENT_BY_SLUG: Record<string, RepairOptionIntent> = {
  "screen-replacement": 'screen',
  "screen-repair": 'screen',
  "battery-replacement": 'battery',
  "battery-repair": 'battery',
  "battery-service": 'battery',
  "charging-port-replacement": 'charging-port',
  "charging-port-repair": 'charging-port',
  "charging-port": 'charging-port',
  "back-glass-replacement": 'back-glass',
  "back-glass-repair": 'back-glass',
  "back-glass": 'back-glass',
  "back-housing-replacement": 'back-glass',
  "back-housing": 'back-glass',
  "back-camera-replacement": 'back-camera',
  "back-camera": 'back-camera',
  "front-camera-replacement": 'front-camera',
  "front-camera": 'front-camera',
  "camera-lens-replacement": 'camera-lens',
  "back-camera-lens-replacement": 'camera-lens',
  "water-damage-repair": 'water-damage',
  "water-damage": 'water-damage',
  "loudspeaker-replacement": 'loudspeaker',
  "loud-speaker-replacement": 'loudspeaker',
  "earpiece-speaker-replacement": 'earpiece-speaker',
  "earpiece-replacement": 'earpiece-speaker',
  "power-button-replacement": 'power-button',
  "volume-button-replacement": 'volume-button',
  "logic-board-repair": 'logic-board',
  "logic-board-replacement": 'logic-board',
};

/**
 * Resolves semantic repair intent directly from the existing repair-option
 * aliases. Display priority and metadata meaning intentionally stay separate.
 */
export function getRepairOptionIntent(slug: string): RepairOptionIntent {
  const normalizedSlug = slug.trim().toLowerCase();
  return REPAIR_OPTION_INTENT_BY_SLUG[normalizedSlug] ?? 'generic';
}

export function sortRepairOptionsForDisplay<T extends RepairOptionWithSlug>(repairOptions: readonly T[]): T[] {
  return repairOptions
    .map((repairOption, index) => ({ repairOption, index, priority: getRepairOptionPriority(repairOption.slug) }))
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map(({ repairOption }) => repairOption);
}
