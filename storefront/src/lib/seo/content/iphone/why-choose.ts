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
import type { Iphone14ProMaxPilotRepairType } from './types';

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

export const IPHONE_WHY_CHOOSE_CONTENT: Record<Iphone14ProMaxPilotRepairType, WhyChooseConfig> = {
  "screen-replacement": {
    kicker: "Ali Mobile support",
    heading: "Why choose Ali Mobile for iPhone 14 Pro Max screen replacement",
    intro:
      "For cracked displays and OLED faults, Ali Mobile starts with a practical screen assessment before confirming which repair option makes sense for the phone in front of us.",
    cards: [
      {
        title: "Display-first diagnosis",
        icon: Smartphone,
        points: [
          "We assess cracked glass, black display, lines, flickering, and touch-response faults before confirming the screen path.",
          "Available OLED or display options are explained clearly before work starts.",
        ],
      },
      {
        title: "Fit and sensor-area checks",
        icon: Search,
        points: [
          "Frame condition, lifted edges, and impact around the top display area are checked before fitting a replacement screen.",
          "Relevant front sensor or Face ID behaviour is checked where applicable, without assuming a screen repair will fix pre-existing sensor faults.",
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
    heading: "Why choose Ali Mobile for iPhone 14 Pro Max battery replacement",
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
    heading: "Why choose Ali Mobile for iPhone 14 Pro Max charging port replacement",
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
    heading: "Why choose Ali Mobile for iPhone 14 Pro Max back glass replacement",
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
          "We explain the existing back-glass or back-housing repair notice and retest the main related functions before pickup.",
        ],
      },
    ],
    footnote:
      "As with the existing repair-detail notices on these pages, factory water resistance cannot be guaranteed after the device has been opened.",
  },
};
