import React from 'react';
import { getRepairResultDescriptionPresets } from '@/lib/repairResultWorkflow';

export type RepairResultDescriptionSource = 'generated' | 'preset' | 'custom';

interface Props {
  deviceName: string;
  repairType: string;
  repairTypeSlug: string;
  description: string;
  descriptionSource: RepairResultDescriptionSource;
  onSelect: (description: string) => void;
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
}: Props) {
  if (!deviceName || !repairType || !repairTypeSlug) return null;
  const presets = getRepairResultDescriptionPresets({ deviceName, repairType, repairTypeSlug });

  function selectPreset(preset: (typeof presets)[number]) {
    if (
      descriptionSource === 'custom'
      && description.trim()
      && description !== preset.description
      && !window.confirm('Replace the unsaved custom description with this preset?')
    ) return;
    onSelect(preset.description);
  }

  return (
    <fieldset className="min-w-0 rounded-[1rem] border border-black/10 bg-slate-50 p-3">
      <legend className="px-1 text-xs font-black text-neu-text-primary">Verified symptom preset</legend>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-black text-neu-text-primary">Description source</span>
        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-neu-text-secondary">
          {SOURCE_LABELS[descriptionSource]}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-semibold leading-4 text-neu-text-secondary">
        Choose only when the symptom matches the inspected device. The description remains editable.
      </p>
      <div className="mt-2 flex max-h-40 min-w-0 flex-wrap gap-2 overflow-y-auto overflow-x-hidden pr-1">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-label={`Use ${preset.label} preset`}
            aria-pressed={description === preset.description}
            onClick={() => selectPreset(preset)}
            className={`max-w-full rounded-full border px-2.5 py-1.5 text-left text-xs font-bold leading-4 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              description === preset.description
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-black/10 bg-white text-neu-text-primary hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <button type="button" aria-label="Try another neutral description" onClick={onTryAnother} className="mt-2 text-xs font-black text-blue-700 hover:text-blue-900">
        Try another neutral description
      </button>
    </fieldset>
  );
}
