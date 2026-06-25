export type AliMobileEnhancedIphoneRepairType =
  | "screen-replacement"
  | "battery-replacement"
  | "charging-port-replacement"
  | "back-glass-replacement"
  | "front-camera-replacement"
  | "back-camera-replacement";

export type Iphone14ProMaxPilotRepairType =
  | "screen-replacement"
  | "battery-replacement"
  | "charging-port-replacement"
  | "back-glass-replacement";

export type AliMobileEnhancedIphoneModelSlug =
  | "iphone-14-pro-max"
  | "iphone-14-pro";

export interface RepairTypeSeoPocket {
  quickAnswer: string;
  workbenchHeadings?: {
    options: string;
    diagnostics: string;
    symptoms: string;
    outcomes: string;
  };
  repairOptions: Array<{
    name: string;
    shortDescription: string;
    bestFor: string;
    notes: string;
  }>;
  commonProblems: Array<{
    title: string;
    description: string;
  }>;
  diagnosticSteps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}
