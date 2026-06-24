import { IPHONE_WHY_CHOOSE_CONTENT, IPHONE_WHY_CHOOSE_SHARED_HIGHLIGHTS } from '@/lib/seo/content/iphone/why-choose';
import type { Iphone14ProMaxPilotRepairType } from '@/lib/seo/content/iphone';

export type WhyChooseUsRepairType = Iphone14ProMaxPilotRepairType;

interface WhyChooseUsSectionProps {
  modelName: string;
  repairType: WhyChooseUsRepairType;
}

export default function WhyChooseUsSection({ modelName, repairType }: WhyChooseUsSectionProps) {
  const content = IPHONE_WHY_CHOOSE_CONTENT[repairType];
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
          {IPHONE_WHY_CHOOSE_SHARED_HIGHLIGHTS.map(({ icon: Icon, text }) => (
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
