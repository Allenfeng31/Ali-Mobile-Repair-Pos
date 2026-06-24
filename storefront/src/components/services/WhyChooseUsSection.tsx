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

export type WhyChooseUsRepairType =
  | "screen-replacement"
  | "battery-replacement"
  | "charging-port-replacement"
  | "back-glass-replacement";

interface WhyChooseUsSectionProps {
  modelName: string;
  repairType: WhyChooseUsRepairType;
}

interface WhyChooseCard {
  title: string;
  icon: LucideIcon;
  points: string[];
}

interface WhyChooseConfig {
  kicker: string;
  heading: string;
  intro: string;
  cards: WhyChooseCard[];
  footnote?: string;
}

const SHARED_HIGHLIGHTS: Array<{ icon: LucideIcon; text: string }> = [
  { icon: MapPin, text: "Inside Ringwood Square" },
  { icon: ClipboardCheck, text: "Clear quote before proceeding" },
  { icon: ShieldCheck, text: "Walk-ins welcome" },
  { icon: Search, text: "Practical technician assessment" },
  { icon: Wrench, text: "Functional testing before handover" },
  { icon: Smartphone, text: "Book online or contact the store" },
];

const WHY_CHOOSE_CONTENT: Record<WhyChooseUsRepairType, WhyChooseConfig> = {
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

export default function WhyChooseUsSection({ modelName, repairType }: WhyChooseUsSectionProps) {
  const content = WHY_CHOOSE_CONTENT[repairType];
  const headingId = `why-choose-us-${repairType}`;

  return (
    <section
      className="mx-auto flex w-full justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-labelledby={headingId}
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-8 text-center lg:gap-10">
        <div className="repair-workbench-heading">
          <span>{content.kicker}</span>
          <h2 id={headingId}>{content.heading}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty">
            {content.intro} Customers can walk in to our Ringwood Square store, book online, or contact
            the store before visiting.
          </p>
        </div>

        <div
          className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-3"
          aria-label={`${modelName} repair support highlights`}
        >
          {SHARED_HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-blue-200/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))] px-4 py-2 text-center text-sm font-extrabold text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.05)]"
            >
              <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="text-blue-600" /> {text}
            </span>
          ))}
        </div>

        <div
          className="mx-auto grid w-full max-w-sm justify-items-center gap-5 md:max-w-4xl md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:max-w-[1180px] xl:grid-cols-3"
          aria-label={`${modelName} repair assessment details`}
        >
          {content.cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="flex h-full min-h-[320px] w-full max-w-sm flex-col items-center overflow-hidden rounded-[30px] border border-blue-200/50 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(248,250,252,0.86)),radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_48%)] p-6 text-center shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_26px_70px_rgba(15,23,42,0.08)] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_30px_86px_rgba(37,99,235,0.12)] sm:p-7"
              >
                <span className="mb-4 inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-[0.78rem] font-black text-slate-500 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-1 flex-col">
                  <h3 className="flex min-h-[4.8rem] items-start justify-center gap-2 text-center text-[clamp(1.18rem,2vw,1.58rem)] font-black leading-[1.08] tracking-[-0.015em] text-slate-900">
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" className="mt-1 shrink-0 text-blue-600" />
                    {card.title}
                  </h3>
                  <ul className="mt-5 space-y-4 pl-5 text-[1rem] font-medium leading-8 text-slate-600">
                    {card.points.map((point) => (
                      <li key={point} className="text-left">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {content.footnote ? (
          <p className="mx-auto max-w-3xl text-center text-[0.98rem] font-medium leading-7 text-slate-500">
            {content.footnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
