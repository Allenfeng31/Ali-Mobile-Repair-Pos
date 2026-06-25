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
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-transparent px-1 py-1 text-center text-sm font-extrabold text-slate-700"
            >
              <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="text-blue-600" /> {text}
            </span>
          ))}
        </div>

        <div
          className="mx-auto grid w-full max-w-sm justify-items-center gap-5 md:max-w-5xl md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:max-w-[1180px] xl:grid-cols-3"
          aria-label={`${modelName} repair assessment details`}
        >
          {content.cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="flex h-full min-h-[372px] w-full max-w-sm flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-[50px] xl:py-[50px] text-center md:min-h-[388px]"
              >
                <div className="flex flex-1 flex-col items-center text-center">
                  <h3 className="flex min-h-[4rem] items-start justify-center gap-2 text-center text-[1.02rem] font-black leading-[1.16] tracking-[-0.015em] text-slate-950">
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0 text-blue-600" />
                    {card.title}
                  </h3>
                  <ul className="mt-5 list-none space-y-4 pl-0 text-center text-[0.96rem] font-medium leading-[1.68] text-slate-500">
                    {card.points.map((point) => (
                      <li key={point} className="text-center">
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
