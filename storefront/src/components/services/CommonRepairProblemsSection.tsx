export type CommonRepairProblemsRepairType =
  | "screen-replacement"
  | "battery-replacement"
  | "charging-port-replacement"
  | "back-glass-replacement";

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
    heading: string;
    intro: string;
  }
> = {
  "screen-replacement": {
    heading: "Common iPhone 14 Pro Max Screen Repair Problems",
    intro: "These are common signs we check before confirming the repair path.",
  },
  "battery-replacement": {
    heading: "Common iPhone 14 Pro Max Battery Problems",
    intro: "These are common signs we check before confirming the repair path.",
  },
  "charging-port-replacement": {
    heading: "Common iPhone 14 Pro Max Charging Port Problems",
    intro: "These are common signs we check before confirming the repair path.",
  },
  "back-glass-replacement": {
    heading: "Common iPhone 14 Pro Max Back Glass Problems",
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
          <h2 id={headingId}>{copy.heading}</h2>
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
              className="flex h-full min-h-[280px] flex-col rounded-[28px] border-[2px] border-slate-800 bg-transparent px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-[50px] xl:py-[50px] md:min-h-[296px]"
            >
              <div className="flex flex-1 flex-col items-center text-center">
                <h3 className="mx-auto max-w-[18rem] text-balance text-[1rem] font-black leading-[1.14] tracking-[-0.015em] text-slate-950">
                  {problem.title}
                </h3>
                <p className="mx-auto mt-5 max-w-[22rem] text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500">
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
