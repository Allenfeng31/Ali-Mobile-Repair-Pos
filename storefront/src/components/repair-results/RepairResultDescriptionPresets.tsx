"use client";

import { getRepairResultDescriptionPresets } from '@/lib/repairResultDescriptions';

export type RepairResultDescriptionSource = 'generated' | 'preset' | 'custom';

interface RepairResultDescriptionPresetsProps {
  deviceName: string;
  repairType: string;
  repairTypeSlug: string;
  description: string;
  descriptionSource: RepairResultDescriptionSource;
  onSelect: (description: string, presetId: string) => void;
  onTryAnother: () => void;
}

const SOURCE_LABELS: Record<RepairResultDescriptionSource, string> = {
  generated: 'Automatically generated',
  preset: 'Preset selected',
  custom: 'Custom edited',
};

export function RepairResultDescriptionPresets({
  deviceName,
  repairType,
  repairTypeSlug,
  description,
  descriptionSource,
  onSelect,
  onTryAnother,
}: RepairResultDescriptionPresetsProps) {
  if (!deviceName || !repairType || !repairTypeSlug) return null;

  const presets = getRepairResultDescriptionPresets({ deviceName, repairType, repairTypeSlug });

  function selectPreset(preset: (typeof presets)[number]) {
    if (
      descriptionSource === 'custom'
      && description.trim()
      && description !== preset.description
      && !window.confirm('Replace the unsaved custom description with this preset?')
    ) {
      return;
    }

    onSelect(preset.description, preset.id);
  }

  return (
    <fieldset className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <legend className="px-1 text-xs font-black text-slate-700">Verified symptom preset</legend>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-black text-slate-700">Description source</span>
        <span data-testid="description-source" className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
          {SOURCE_LABELS[descriptionSource]}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">
        Choose only when the symptom matches the inspected device. The description remains editable.
      </p>
      <div data-preset-list className="mt-2 flex max-h-40 min-w-0 flex-wrap gap-2 overflow-y-auto overflow-x-hidden pr-1">
        {presets.map((preset) => {
          const selected = description === preset.description;
          return (
            <button
              key={preset.id}
              type="button"
              aria-label={`Use ${preset.label} preset`}
              aria-pressed={selected}
              onClick={() => selectPreset(preset)}
              className={`max-w-full rounded-full border px-2.5 py-1.5 text-left text-xs font-bold leading-4 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                selected
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Try another neutral description"
        onClick={onTryAnother}
        className="mt-2 text-xs font-black text-blue-700 hover:text-blue-900"
      >
        Try another neutral description
      </button>
    </fieldset>
  );
}
