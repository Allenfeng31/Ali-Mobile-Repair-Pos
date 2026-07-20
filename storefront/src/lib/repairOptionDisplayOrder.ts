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

export function sortRepairOptionsForDisplay<T extends RepairOptionWithSlug>(repairOptions: readonly T[]): T[] {
  return repairOptions
    .map((repairOption, index) => ({ repairOption, index, priority: getRepairOptionPriority(repairOption.slug) }))
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map(({ repairOption }) => repairOption);
}
