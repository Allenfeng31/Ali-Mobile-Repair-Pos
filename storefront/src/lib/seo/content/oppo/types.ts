import { StaticImageData } from "next/image";

export interface OppoModelHardwareConfig {
  officialModelCode: string;
  displayName: string;
  series: "A Series" | "Reno Series" | "Find Series";
  displayForm: "flat slab phone" | "curved edge phone" | "foldable";
  displayType: "LTPS LCD" | "AMOLED" | "OLED" | "LCD" | "unknown";
  displaySize: string;
  refreshRate: string;
  chargingPort: "USB-C" | "Micro-USB" | "unknown";
  rearPanelType: "glass" | "plastic" | "ceramic" | "eco-leather" | "uncertain";
  rearPanelPublicTerminology: string;
  rearCameraLayout: string;
  frontCamera: string;
  wirelessCharging: boolean;
  fingerprintType: "optical under-display" | "ultrasonic under-display" | "side-mounted" | "rear-mounted" | "home button" | "unknown";
  factoryWaterResistance: string;
}

export interface OppoEnhancedConfig {
  brand: string;
  brandSlug: "oppo";
  models: Record<string, OppoModelHardwareConfig>;
}
