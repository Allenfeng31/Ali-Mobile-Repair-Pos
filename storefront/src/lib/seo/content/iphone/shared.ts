import type { RepairTypeSeoPocket } from './types';

export function appendUniqueRepairOptions(
  existing: RepairTypeSeoPocket["repairOptions"],
  additions: RepairTypeSeoPocket["repairOptions"]
) {
  return [
    ...existing,
    ...additions.filter((addition) => !existing.some((item) => item.name === addition.name)),
  ];
}

export function appendUniqueCommonProblems(
  existing: RepairTypeSeoPocket["commonProblems"],
  additions: RepairTypeSeoPocket["commonProblems"]
) {
  return [
    ...existing,
    ...additions.filter((addition) => !existing.some((item) => item.title === addition.title)),
  ];
}

export function appendUniqueDiagnosticSteps(
  existing: RepairTypeSeoPocket["diagnosticSteps"],
  additions: RepairTypeSeoPocket["diagnosticSteps"]
) {
  return [
    ...existing,
    ...additions.filter(
      (addition) =>
        !existing.some((item) => item.step === addition.step && item.title === addition.title)
    ),
  ];
}

export function appendUniqueFaqs(
  existing: RepairTypeSeoPocket["faq"],
  additions: RepairTypeSeoPocket["faq"]
) {
  return [
    ...existing,
    ...additions.filter((addition) => !existing.some((item) => item.question === addition.question)),
  ];
}
