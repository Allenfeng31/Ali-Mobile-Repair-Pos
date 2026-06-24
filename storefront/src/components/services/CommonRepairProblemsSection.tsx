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
          className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6"
          aria-label={`${modelName} common repair problems`}
        >
          {problems.map((problem, index) => (
            <article
              key={problem.title}
              className="flex h-full min-h-[220px] flex-col overflow-hidden rounded-[30px] border border-blue-200/50 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(248,250,252,0.86)),radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_48%)] p-6 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_26px_70px_rgba(15,23,42,0.08)] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_30px_86px_rgba(37,99,235,0.12)] sm:p-7 md:min-h-[240px]"
            >
              <span className="mb-4 inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-[0.78rem] font-black text-slate-500 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-1 flex-col">
                <h3 className="max-w-[28rem] text-[clamp(1.22rem,2vw,1.58rem)] font-black leading-[1.08] tracking-[-0.015em] text-slate-900 md:min-h-[5.5rem]">
                  {problem.title}
                </h3>
                <p className="mt-5 max-w-[32rem] text-[1rem] font-medium leading-8 text-slate-600">
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
