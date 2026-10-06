import type { IphoneHardwareConfig } from './config';
import type { RepairTypeSeoPocket } from './types';

export function applyIphoneBackGlassReplacementSeoPocket(
  pocket: RepairTypeSeoPocket,
  config: IphoneHardwareConfig
): RepairTypeSeoPocket {
  const { modelName } = config;
  const isHousing = config.rearRepairMethod === 'back-housing';
  const repairLabel = isHousing ? 'back housing' : 'back glass';

  return {
    ...pocket,
    turnaroundMinutes: isHousing ? 60 : undefined,
    quickAnswer: isHousing
      ? `Need ${modelName} back housing replacement in Ringwood? Ali Mobile & Repair assesses the rear housing or chassis assembly and confirms the suitable repair path before work begins.`
      : `Need ${modelName} back glass replacement in Ringwood? Ali Mobile & Repair assesses cracked rear glass and confirms the suitable repair path before work begins.`,
    workbenchHeadings: {
      options: isHousing ? 'What does the back housing service cover?' : 'What does the back glass service cover?',
      diagnostics: `How do we confirm the ${repairLabel} repair path?`,
      symptoms: `Which ${repairLabel} damage matters most?`,
      outcomes: `What can affect the final ${repairLabel} result?`,
    },
    repairOptions: [{
      name: isHousing ? 'Back housing replacement' : 'Back glass replacement',
      shortDescription: isHousing
        ? 'We assess the rear housing or chassis assembly and confirm the suitable replacement path before work begins.'
        : 'We assess cracked rear glass and confirm the suitable glass replacement path before work begins.',
      bestFor: isHousing ? 'Phones requiring a rear housing replacement.' : 'Phones with damaged rear glass.',
      notes: 'We confirm the repair scope and quote before starting work.',
    }],
    commonProblems: [{
      title: isHousing ? 'Damaged rear housing' : 'Cracked rear glass',
      description: isHousing
        ? 'Damage to the rear housing or chassis assembly is assessed before the repair method is confirmed.'
        : 'Cracked rear glass is assessed before the repair method is confirmed.',
    }],
    diagnosticSteps: [{
      step: '01',
      title: 'Confirm the repair scope',
      description: `We inspect the device and confirm whether the ${repairLabel} repair path is suitable before work begins.`,
    }],
    faq: [
      {
        question: `What does ${modelName} ${repairLabel} replacement cover?`,
        answer: isHousing
          ? 'This service concerns the rear housing or chassis assembly. We confirm the suitable repair scope before work begins.'
          : 'This service concerns the rear glass component. We confirm the suitable repair scope before work begins.',
      },
      {
        question: `How long does ${modelName} ${repairLabel} replacement take?`,
        answer: isHousing
          ? 'We confirm the expected turnaround after checking the device and part availability.'
          : `Turnaround for ${modelName} back glass replacement varies depending on the repair scope, damage found during inspection, and part availability. We confirm the expected turnaround before work begins.`,
      },
      {
        question: `How much does ${modelName} ${repairLabel} replacement cost?`,
        answer: 'Pricing depends on the confirmed repair scope and current part availability. We confirm the quote before work begins.',
      },
      {
        question: `Is there a warranty for ${modelName} ${repairLabel} replacement?`,
        answer: 'Eligible fitted parts and workmanship include the existing 6-month warranty terms.',
      },
    ],
  };
}
