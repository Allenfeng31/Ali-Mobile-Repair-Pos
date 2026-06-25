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
  | "iphone-17"
  | "iphone-17-pro"
  | "iphone-17-pro-max"
  | "iphone-17-air"
  | "iphone-17e"
  | "iphone-16"
  | "iphone-16-plus"
  | "iphone-16-pro"
  | "iphone-16-pro-max"
  | "iphone-16e"
  | "iphone-15"
  | "iphone-15-plus"
  | "iphone-15-pro"
  | "iphone-15-pro-max"
  | "iphone-14"
  | "iphone-14-plus"
  | "iphone-14-pro-max"
  | "iphone-14-pro"
  | "iphone-13-mini"
  | "iphone-13"
  | "iphone-13-pro"
  | "iphone-13-pro-max"
  | "iphone-12-mini"
  | "iphone-12"
  | "iphone-12-pro"
  | "iphone-12-pro-max";

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
