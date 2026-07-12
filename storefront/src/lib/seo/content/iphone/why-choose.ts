import {
  BatteryCharging,
  ClipboardCheck,
  MapPin,
  Search,
  ShieldCheck,
  Smartphone,
  Plug,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getIphoneHardwareConfigByModelName } from './config';
import type { AliMobileEnhancedIphoneRepairType, Iphone14ProMaxPilotRepairType } from './types';

export interface WhyChooseCard {
  title: string;
  icon: LucideIcon;
  points: string[];
}

export interface WhyChooseConfig {
  kicker: string;
  heading: string;
  intro: string;
  cards: WhyChooseCard[];
  footnote?: string;
}

export const IPHONE_WHY_CHOOSE_SHARED_HIGHLIGHTS: Array<{ icon: LucideIcon; text: string }> = [
  { icon: MapPin, text: "Inside Ringwood Square" },
  { icon: ClipboardCheck, text: "Clear quote before proceeding" },
  { icon: ShieldCheck, text: "Walk-ins welcome" },
  { icon: Search, text: "Practical technician assessment" },
  { icon: Wrench, text: "Functional testing before handover" },
  { icon: Smartphone, text: "Book online or contact the store" },
];

export function getIphoneWhyChooseContent(
  modelName: string
): Record<AliMobileEnhancedIphoneRepairType, WhyChooseConfig> {
  const hardwareConfig = getIphoneHardwareConfigByModelName(modelName);
  const supportsOledCopy = hardwareConfig?.displayType === 'oled';
  const supportsFaceIdCopy = hardwareConfig?.biometrics === 'face-id';
  const supportsRearCameraModes =
    hardwareConfig?.rearCameraClass === 'dual' || hardwareConfig?.rearCameraClass === 'triple';

  return {
    "screen-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} screen replacement`,
      intro:
        supportsOledCopy
          ? "For cracked displays and OLED faults, Ali Mobile starts with a practical screen assessment before confirming which repair option makes sense for the phone in front of us."
          : "For cracked displays and screen faults, Ali Mobile starts with a practical screen assessment before confirming which repair option makes sense for the phone in front of us.",
      cards: [
        {
          title: "Display-first diagnosis",
          icon: Smartphone,
          points: [
            "We assess cracked glass, black display, lines, flickering, and touch-response faults before confirming the screen path.",
            supportsOledCopy
              ? "Available OLED or display options are explained clearly before work starts."
              : "Available display options are explained clearly before work starts.",
          ],
        },
        {
          title: "Fit and sensor-area checks",
          icon: Search,
          points: [
            "Frame condition, lifted edges, and impact around the top display area are checked before fitting a replacement screen.",
            supportsFaceIdCopy
              ? "Relevant front sensor or Face ID behaviour is checked where applicable, without assuming a screen repair will fix pre-existing sensor faults."
              : "Relevant front sensor behaviour is checked where applicable, without assuming a screen repair will fix pre-existing sensor faults.",
          ],
        },
        {
          title: "Practical handover testing",
          icon: ClipboardCheck,
          points: [
            "Before handover we recheck display output, touch response, brightness, and the main front-facing functions linked to the repair area.",
          ],
        },
      ],
    },
    "battery-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} battery replacement`,
      intro:
        "Battery complaints can overlap with charging, heat, and other power-path issues, so Ali Mobile checks the symptoms first and explains the quote before proceeding.",
      cards: [
        {
          title: "Battery symptoms in context",
          icon: BatteryCharging,
          points: [
            "We look at fast battery drain, shutdown behaviour, charging behaviour, temperature, and Battery Health as one diagnostic indicator rather than absolute proof on its own.",
            "Visible swelling, screen lifting, or pressure signs are checked before the phone is opened.",
          ],
        },
        {
          title: "Charging and power-path assessment",
          icon: Plug,
          points: [
            "Cable response and charging behaviour are checked so we do not assume every battery complaint is caused by the battery itself.",
          ],
        },
        {
          title: "Post-repair charging checks",
          icon: ClipboardCheck,
          points: [
            "After replacement we verify charging response and practical power stability before handover.",
          ],
        },
      ],
    },
    "charging-port-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} charging port replacement`,
      intro:
        "Charging faults are diagnosed carefully because the port, cable, battery, and board-level path can overlap. Ali Mobile checks the basics first and only confirms replacement when the repair path is clear.",
      cards: [
        {
          title: "Accessory and cable checks",
          icon: Plug,
          points: [
            "We test cable fit and charger response when the phone only charges at an angle, feels loose, or charges intermittently.",
          ],
        },
        {
          title: "Port inspection before replacement",
          icon: Search,
          points: [
            "Debris, contamination, corrosion, and socket wear are inspected first, with cleaning assessment where appropriate before a replacement is quoted.",
            "We do not assume every charging fault is solved by the port alone.",
          ],
        },
        {
          title: "Relevant connection retesting",
          icon: ClipboardCheck,
          points: [
            "After repair we recheck cable charging and the relevant lower-assembly connection behaviour linked to the charging path.",
          ],
        },
      ],
    },
    "back-glass-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} back glass replacement`,
      intro:
        "Rear glass damage can overlap with housing condition, camera-area impact, and wireless charging concerns, so Ali Mobile confirms the repair method before proceeding.",
      cards: [
        {
          title: "Damage and housing review",
          icon: Smartphone,
          points: [
            "We assess cracked or missing rear glass, sharp edges, lifted sections, exposed areas, and the surrounding housing or frame condition before confirming the repair path.",
          ],
        },
        {
          title: "Method and camera-area checks",
          icon: Search,
          points: [
            "Damage around the camera area is reviewed and the practical rear-glass or back-housing method is confirmed before work begins.",
            "Where relevant, we also check the nearby wireless-charging area and related rear fit concerns.",
          ],
        },
        {
          title: "Clear limitations before handover",
          icon: ClipboardCheck,
          points: [
            "We explain the existing back-glass or back-housing repair notice and retest the main related functions before handover.",
          ],
        },
      ],
      footnote:
        "As with the existing repair-detail notices on these pages, factory water resistance cannot be guaranteed after the device has been opened.",
    },
    "front-camera-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} front camera replacement`,
      intro:
        "Front camera faults can overlap with the top sensor area and other paired components, so Ali Mobile checks the front camera path carefully before confirming whether replacement is the right scope.",
      cards: [
        {
          title: "Selfie and portrait-camera diagnosis",
          icon: Smartphone,
          points: [
            "We check selfie preview, portrait-camera response, blur, image failure, and front-facing camera behaviour before confirming the repair path.",
          ],
        },
        {
          title: supportsFaceIdCopy ? "TrueDepth-area inspection first" : "Top sensor-area inspection first",
          icon: Search,
          points: [
            "Impact near the earpiece and top sensor area is inspected before work begins.",
            supportsFaceIdCopy
              ? "Front camera replacement does not automatically guarantee Face ID restoration because the TrueDepth path can involve paired or separate components."
              : "Front camera replacement does not automatically guarantee every top sensor-area function will be restored because paired or separate components may also be involved.",
          ],
        },
        {
          title: "Clear limitations and retesting",
          icon: ClipboardCheck,
          points: [
            "After repair we retest the main front-facing camera functions linked to the repair area and explain any remaining limitation clearly before handover.",
          ],
        },
      ],
    },
    "back-camera-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} back camera replacement`,
      intro:
        "Rear camera faults can overlap with lens-glass damage, camera-area impact, and internal module issues, so Ali Mobile diagnoses the rear camera path carefully before confirming replacement.",
      cards: [
        {
          title: "Rear camera fault diagnosis",
          icon: Smartphone,
          points: [
            supportsRearCameraModes
              ? "We check focus, black preview, image shake, switching between supported rear cameras, and stabilisation-related symptoms before confirming the repair path."
              : "We check focus, black preview, image shake, and stabilisation-related symptoms before confirming the repair path.",
          ],
        },
        {
          title: "Lens-glass versus module checks",
          icon: Search,
          points: [
            "We separate cracked external lens glass, housing damage, and internal rear camera module faults before work begins.",
            "We do not assume every image-quality fault is solved by the back camera module alone.",
          ],
        },
        {
          title: "Relevant rear-camera retesting",
          icon: ClipboardCheck,
          points: [
            supportsRearCameraModes
              ? "After repair we retest the main rear-camera modes linked to the repair area and explain any remaining housing or lens-glass limitation clearly before handover."
              : "After repair we retest the main rear-camera functions linked to the repair area and explain any remaining housing or lens-glass limitation clearly before handover.",
          ],
        },
      ],
    },
    "earpiece-speaker-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} earpiece speaker replacement`,
      intro:
        "Call-audio faults can come from mesh blockage, software behaviour, the receiver path, or part failure, so Ali Mobile checks the symptoms before confirming earpiece speaker replacement.",
      cards: [
        {
          title: "Receiver audio checks",
          icon: Smartphone,
          points: [
            "We compare normal call audio, loudspeaker behaviour, low receiver volume, and distortion before confirming the repair path.",
          ],
        },
        {
          title: "Mesh and audio-path inspection",
          icon: Search,
          points: [
            "Speaker mesh condition, blockage signs, software behaviour, audio path, and part condition are checked before a quote is confirmed.",
          ],
        },
        {
          title: "Practical call retesting",
          icon: ClipboardCheck,
          points: [
            "After repair we retest the relevant call-audio path and explain any remaining limitation clearly before handover.",
          ],
        },
      ],
    },
    "loudspeaker-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} loudspeaker replacement`,
      intro:
        "Bottom-speaker symptoms can overlap with settings, contamination, charging-port path issues, or board-level faults, so Ali Mobile diagnoses speaker behaviour first.",
      cards: [
        {
          title: "Ringtone and media testing",
          icon: Smartphone,
          points: [
            "We test ringtone, media playback, no-sound symptoms, and distorted bottom-speaker output before confirming loudspeaker replacement.",
          ],
        },
        {
          title: "Lower-path diagnosis",
          icon: Search,
          points: [
            "Speaker condition, settings, charging-port path overlap, contamination, and board-level fault signs are checked before work begins.",
          ],
        },
        {
          title: "Relevant speaker retesting",
          icon: ClipboardCheck,
          points: [
            "After repair we retest the speaker output linked to the repair area and explain any remaining audio limitation clearly before handover.",
          ],
        },
      ],
    },
    "microphone-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} microphone replacement`,
      intro:
        "Microphone faults can show differently in calls, recordings, and apps, so Ali Mobile checks the microphone path, blockage signs, and software behaviour before quoting.",
      cards: [
        {
          title: "Call and recording checks",
          icon: Smartphone,
          points: [
            "We compare caller-cannot-hear symptoms, unclear voice memos, muffled recordings, and app behaviour before confirming the repair path.",
          ],
        },
        {
          title: "Blockage and audio-path review",
          icon: Search,
          points: [
            "Dust blockage, software causes, microphone path condition, and board-level audio fault signs are checked before replacement is confirmed.",
          ],
        },
        {
          title: "Microphone retesting",
          icon: ClipboardCheck,
          points: [
            "After repair we retest the relevant microphone behaviour and explain any remaining audio limitation clearly before handover.",
          ],
        },
      ],
    },
    "power-button-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} power button replacement`,
      intro:
        "Power button faults can be mechanical, flex-related, or linked to housing damage, so Ali Mobile inspects the button and surrounding frame before confirming replacement.",
      cards: [
        {
          title: "Button movement assessment",
          icon: Smartphone,
          points: [
            "We check stuck, hard-to-press, intermittent wake, and lock-response symptoms before confirming the repair path.",
          ],
        },
        {
          title: "Flex and housing checks",
          icon: Search,
          points: [
            "Button flex condition, housing damage, impact signs, and internal connection behaviour are inspected before a quote is confirmed.",
          ],
        },
        {
          title: "Wake and lock retesting",
          icon: ClipboardCheck,
          points: [
            "After repair we retest the relevant wake and lock behaviour before handover.",
          ],
        },
      ],
    },
    "volume-button-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} volume button replacement`,
      intro:
        "Volume button issues can come from button flex, frame damage, internal connection, or settings, so Ali Mobile checks the practical cause before quoting.",
      cards: [
        {
          title: "Volume response checks",
          icon: Smartphone,
          points: [
            "We test stuck buttons, no response, intermittent response, and click feel before confirming replacement.",
          ],
        },
        {
          title: "Frame, flex, and settings review",
          icon: Search,
          points: [
            "Button flex condition, frame damage, internal connection, and relevant software settings are checked before work begins.",
          ],
        },
        {
          title: "Button retesting",
          icon: ClipboardCheck,
          points: [
            "After repair we retest volume up and down response and explain any remaining limitation clearly before handover.",
          ],
        },
      ],
    },
    "camera-lens-replacement": {
      kicker: "Ali Mobile support",
      heading: `Why choose Ali Mobile for ${modelName} camera lens replacement`,
      intro:
        "Rear camera lens damage can look like a camera-module fault, so Ali Mobile checks the outer lens glass, image output, and dust risk before confirming the repair scope.",
      cards: [
        {
          title: "Lens glass inspection",
          icon: Smartphone,
          points: [
            "We inspect cracked rear camera lens glass, scratches, missing glass, blurry camera output, and dust risk before quoting.",
          ],
        },
        {
          title: "Lens versus module diagnosis",
          icon: Search,
          points: [
            "Camera module condition is checked so lens-only replacement is only confirmed when the internal camera path appears suitable.",
          ],
        },
        {
          title: "Camera output retesting",
          icon: ClipboardCheck,
          points: [
            "After repair we retest the relevant rear camera output and explain any remaining module or housing limitation clearly before handover.",
          ],
        },
      ],
    },
  };
}

export const IPHONE_WHY_CHOOSE_CONTENT: Record<Iphone14ProMaxPilotRepairType, WhyChooseConfig> =
  getIphoneWhyChooseContent("iPhone 14 Pro Max");
