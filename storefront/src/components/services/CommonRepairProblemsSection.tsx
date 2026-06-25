import type { AliMobileEnhancedIphoneRepairType } from '@/lib/seo/content/iphone';

export type CommonRepairProblemsRepairType = AliMobileEnhancedIphoneRepairType;

interface RepairProblem {
  title: string;
  description: string;
}

interface CommonRepairProblemsSectionProps {
  modelName: string;
  repairType: CommonRepairProblemsRepairType;
  problems: ReadonlyArray<RepairProblem>;
}

const SECTION_COPY: Record<
  CommonRepairProblemsRepairType,
  {
    heading: (modelName: string) => string;
    intro: string;
  }
> = {
  "screen-replacement": {
    heading: (modelName) => `Common ${modelName} Screen Repair Problems`,
    intro: "These are common signs we check before confirming the repair path.",
  },
  "battery-replacement": {
    heading: (modelName) => `Common ${modelName} Battery Problems`,
    intro: "These are common signs we check before confirming the repair path.",
  },
  "charging-port-replacement": {
    heading: (modelName) => `Common ${modelName} Charging Port Problems`,
    intro: "These are common signs we check before confirming the repair path.",
  },
  "back-glass-replacement": {
    heading: (modelName) => `Common ${modelName} Back Glass Problems`,
    intro: "These are common signs we check before confirming the repair path.",
  },
  "front-camera-replacement": {
    heading: (modelName) => `Common ${modelName} Front Camera Problems`,
    intro: "These are common signs we check before confirming the repair path.",
  },
  "back-camera-replacement": {
    heading: (modelName) => `Common ${modelName} Back Camera Problems`,
    intro: "These are common signs we check before confirming the repair path.",
  },
};

export default function CommonRepairProblemsSection({
  modelName,
  repairType,
  problems,
}: CommonRepairProblemsSectionProps) {
  const copy = SECTION_COPY[repairType];
  const headingId = `common-repair-problems-${repairType}`;

  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      aria-labelledby={headingId}
    >
      <div className="mx-auto flex w-full flex-col gap-8 lg:gap-10">
        <div className="repair-workbench-heading">
          <span>Common problems</span>
          <h2 id={headingId} className="scroll-mt-32">{copy.heading(modelName)}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty">
            {copy.intro}
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6 xl:grid-cols-3"
          aria-label={`${modelName} common repair problems`}
        >
          {problems.map((problem) => (
            <article
              key={problem.title}
              className="flex h-full min-h-[188px] flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent px-6 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-[50px] xl:py-[50px] md:min-h-[198px]"
            >
              <div className="flex flex-1 flex-col items-start text-left md:items-center md:text-center">
                <h3 className="w-full text-left text-balance text-[1rem] font-black leading-[1.14] tracking-[-0.015em] text-slate-950 md:mx-auto md:max-w-[18rem] md:text-center">
                  {problem.title}
                </h3>
                <p className="mt-5 w-full text-left text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500 md:mx-auto md:max-w-[22rem] md:text-center">
                  {problem.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
