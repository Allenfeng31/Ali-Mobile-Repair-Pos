import { appendUniqueCommonProblems, appendUniqueDiagnosticSteps, appendUniqueFaqs, appendUniqueRepairOptions } from './shared';
import type { RepairTypeSeoPocket } from './types';

export function applyIphone14ProMaxBatteryReplacementSeoPocket(
  pocket: RepairTypeSeoPocket
): RepairTypeSeoPocket {
  return {
    ...pocket,
    quickAnswer:
      "Need iPhone 14 Pro Max battery replacement in Ringwood? We check battery health symptoms, fast drain, battery-percentage instability, charging behaviour, swelling signs, and shutdown patterns before confirming whether battery replacement is the right path.",
    repairOptions: appendUniqueRepairOptions(pocket.repairOptions, [
      {
        name: "Battery health review",
        shortDescription:
          "We check the reported battery health, service message, fast drain, battery-percentage instability, and shutdown behaviour.",
        bestFor: "Battery health drop, short runtime, or unexpected shutdowns.",
        notes: "Battery Health helps the diagnosis, but it is not the only indicator we rely on before quoting.",
      },
      {
        name: "Charging path check",
        shortDescription:
          "We test cable response, charging behaviour, and port condition before assuming the battery is the only fault.",
        bestFor: "Phones that charge but drain quickly, charge unpredictably, or only respond with certain cables.",
        notes: "Bring the cable or charger that shows the issue if you can.",
      },
      {
        name: "Swelling and fit inspection",
        shortDescription:
          "We look for lifted screen edges, pressure marks, visible swelling, or heat symptoms that can point to battery stress inside the phone.",
        bestFor: "Devices with screen lift, heat, sudden power loss, or concern about internal pressure.",
        notes: "Back up important data before any repair when possible.",
      },
      {
        name: "Post-repair charging and power checks",
        shortDescription:
          "After fitting, we confirm charging response, startup behaviour, and practical power stability before handover.",
        bestFor:
          "Customers who want the phone rechecked before pickup rather than only having the battery fitted.",
        notes:
          "Battery percentage reporting can settle over the next few charge cycles, so we explain what to watch after collection.",
      },
    ]),
    commonProblems: appendUniqueCommonProblems(pocket.commonProblems, [
      {
        title: "Battery percentage jumps or unstable reading",
        description:
          "A percentage that drops suddenly, stalls while charging, or behaves unpredictably can be part of the symptom picture, but it is not proof on its own.",
      },
      {
        title: "Service Battery or battery-health warning",
        description:
          "A service warning or low health reading can point to battery wear, but we still compare it with charging behaviour, shutdown history, and heat before confirming the repair path.",
      },
      {
        title: "Phone becomes unusually warm",
        description:
          "If the phone heats up during normal use, charging, or standby, we assess whether battery wear is involved or whether another power-path issue may be contributing.",
      },
      {
        title: "Screen lifting from internal battery pressure",
        description:
          "A raised display or lifting edge can be a warning sign that the battery is swelling underneath. We inspect the fit and internal pressure signs before confirming the repair path.",
      },
      {
        title: "Only works while connected to power",
        description:
          "If the phone powers off as soon as the cable is removed, we check whether the battery can still hold stable voltage or whether another charging-path issue is involved.",
      },
      {
        title: "Charging shows but the percentage does not increase normally",
        description:
          "A charging icon without normal battery gain can point to battery wear, charging-path instability, or another power issue, so we test before confirming the replacement.",
      },
    ]),
    diagnosticSteps: appendUniqueDiagnosticSteps(pocket.diagnosticSteps, [
      {
        step: "01",
        title: "Check the charging setup",
        description:
          "We test charging response with known-good cable and charger before confirming the battery path.",
      },
      {
        step: "02",
        title: "Inspect battery symptoms in context",
        description:
          "We review shutdowns, heat, swelling signs, display lifting, battery-percentage behaviour, and reported Battery Health before quoting.",
      },
      {
        step: "03",
        title: "Confirm quote and repair scope",
        description:
          "We confirm whether the symptoms still point to battery replacement after checking the charging path and practical power behaviour.",
      },
      {
        step: "04",
        title: "Final charging and power checks",
        description:
          "After repair, we check startup, charging response, and practical power stability before handover.",
      },
    ]),
    faq: appendUniqueFaqs(pocket.faq, [
      {
        question: "Can Battery Health alone prove my iPhone 14 Pro Max needs a new battery?",
        answer:
          "No. Battery Health is one useful indicator, but we also look at shutdowns, charging behaviour, heat, runtime, swelling signs, and general power stability before confirming the repair path.",
      },
      {
        question: "What if my iPhone 14 Pro Max battery problem also involves charging issues?",
        answer:
          "We check charging behaviour first because a port, cable, or another power-path fault can overlap with battery complaints. That is why we do not assume every battery symptom is caused by the battery alone.",
      },
    ]),
  };
}
