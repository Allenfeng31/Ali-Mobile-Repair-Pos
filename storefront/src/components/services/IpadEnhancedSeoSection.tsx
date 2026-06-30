import React from 'react';

export interface IpadEnhancedSeoSectionProps {
  modelName: string;
  repairName: string;
}

export default function IpadEnhancedSeoSection({
  modelName,
  repairName,
}: IpadEnhancedSeoSectionProps) {
  const cards = [
    {
      title: 'Exact Model Matching',
      description: `We confirm the display, touch response and frame alignment together so the correct ${repairName.toLowerCase()} option can be matched to your ${modelName}.`,
    },
    {
      title: 'Clear Repair Plan',
      description: `We inspect your device thoroughly, explain the repair process, and verify all necessary parts before beginning work on your ${modelName}.`,
    },
    {
      title: 'Comprehensive Testing',
      description: `We test all related functions after the ${repairName.toLowerCase()} to ensure your iPad performs reliably.`,
    },
    {
      title: 'Local Ringwood Service',
      description: 'Visit Ali Mobile & Repair at Ringwood Square Shopping Centre, book online or call 0481 058 514 before visiting.',
    },
  ];

  return (
    <section 
      id="ipad-enhanced-seo"
      className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-label={`${modelName} ${repairName} in Ringwood`}
    >
      <div className="mx-auto flex w-full flex-col gap-8 lg:gap-10">
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Model-Aware iPad Repair
            </span>
            <h2 className="text-balance text-[1.5rem] font-black leading-[1.12] tracking-[-0.015em] text-slate-950 sm:text-[1.75rem] md:max-w-3xl lg:text-[2.25rem]">
              {modelName} {repairName} in Ringwood
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
            {cards.map((card, index) => (
              <article
                key={index}
                className="flex h-full min-h-[188px] flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent px-6 py-6 sm:px-8 sm:py-8 lg:px-8 lg:py-8 xl:px-8 xl:py-8 md:min-h-[198px]"
              >
                <div className="flex flex-1 flex-col items-center text-center">
                  <h3 className="w-full text-balance text-[1rem] font-black leading-[1.14] tracking-[-0.015em] text-slate-950">
                    {card.title}
                  </h3>
                  <p className="mt-4 w-full text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500">
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
    </section>
  );
}
