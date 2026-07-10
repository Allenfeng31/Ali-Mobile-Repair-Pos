import {
  ClipboardCheck,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { WhyChooseConfig } from '../iphone/why-choose';
import type {
  AliMobileEnhancedLenovoTabletRepairType,
  LenovoTabletModelConfig,
} from './types';
import {
  ALI_MOBILE_LENOVO_TABLET_BUSINESS,
  formatLenovoTabletModelCodes,
  getLenovoTabletPostRepairChecks,
  getLenovoTabletRepairLabel,
} from './shared';

export const LENOVO_TABLET_WHY_CHOOSE_SHARED_HIGHLIGHTS: Array<{
  icon: LucideIcon;
  text: string;
}> = [
  { icon: MapPin, text: 'Inside Ringwood Square' },
  { icon: Search, text: 'Exact Lenovo Tablet model confirmation' },
  { icon: ClipboardCheck, text: 'Clear inspection before repair' },
  { icon: ShieldCheck, text: 'Existing dynamic price or quote stays visible' },
  { icon: Wrench, text: 'Model-aware function testing' },
  { icon: PhoneCall, text: `Call ${ALI_MOBILE_LENOVO_TABLET_BUSINESS.phone}` },
];

export function getLenovoTabletWhyChooseConfig(
  config: LenovoTabletModelConfig,
  repairType: AliMobileEnhancedLenovoTabletRepairType
): WhyChooseConfig {
  const repairLabel = getLenovoTabletRepairLabel(repairType).toLowerCase();
  const modelCodeLabel = formatLenovoTabletModelCodes(config.modelCodes);
  const postRepairChecks = getLenovoTabletPostRepairChecks(repairType);

  return {
    kicker: 'Ali Mobile support',
    heading: `Why choose Ali Mobile for ${config.modelName} ${repairLabel}`,
    intro:
      'We keep the repair process clear from the first inspection to the final handover, with the exact Lenovo tablet model and repair path confirmed before work begins.',
    cards: [
      {
        title: 'Exact model confirmation first',
        icon: Search,
        points: [
          `We confirm the exact ${config.modelName} model and model codes such as ${modelCodeLabel} before the repair path is approved.`,
          'That keeps the repair notes, visible pricing or quote path, and function checks aligned with the correct Lenovo tablet version.',
        ],
      },
      {
        title: 'Clear inspection and repair scope',
        icon: ClipboardCheck,
        points: [
          `We inspect the reported ${repairLabel} fault, check the related functions, and explain the suitable repair option before work begins.`,
          'The existing dynamic price or quote remains visible, so you can review the repair path with the current system before booking.',
        ],
      },
      {
        title: 'Post-repair checks before handover',
        icon: Wrench,
        points: [
          `After the repair, we retest ${postRepairChecks} so the main day-to-day functions are checked before handover.`,
          `Customers can book online, call ${ALI_MOBILE_LENOVO_TABLET_BUSINESS.phone}, or visit our Ringwood Square store for in-person support.`,
        ],
      },
    ],
  };
}

