import { RepairTypeSeoPocket } from "../iphone/types";
import { getOppoWhyChooseUsBlocks } from "./why-choose";
import { getOppoModelConfig } from "./shared";

export function getOppoChargingPortPocket(modelSlug: string): RepairTypeSeoPocket | null {
  const config = getOppoModelConfig(modelSlug);
  if (!config) return null;

  const displayModel = config.displayName;
  
  return {
    
    quickAnswer: `If your ${config.chargingPort === 'unknown' ? 'charging' : config.chargingPort} cable feels loose, charging cuts out, or the phone won't charge at all, the charging port may be damaged or obstructed. For the OPPO ${displayModel}, a replacement restores reliable wired power and data connectivity.`,
    repairOptions: [

        { name: "Port vs Cable, Battery or Board Diagnosis", shortDescription: "We test multiple known-good cables and assess battery health to ensure the port is truly the fault before attempting replacement.", bestFor: "", notes: "" },
        { name: "Debris Cleaning", shortDescription: "Sometimes the issue is compacted dust rather than hardware failure. We carefully inspect for contamination first.", bestFor: "", notes: "" }
      
    ],
    commonProblems: [

        { title: "Cable Not Seating Correctly", description: `The ${config.chargingPort === 'unknown' ? 'charging' : config.chargingPort} cable feels loose or falls out easily.` },
        { title: "Intermittent Charging", description: "The device only charges if you hold the cable at a specific angle." },
        { title: "No Wired Charging", description: "The phone completely fails to register a connected charger." },
        { title: "Debris or Contamination", description: "Visible lint, dust, or moisture inside the port." },
        { title: "Damaged Connector", description: "Internal pins are visibly bent, broken, or corroded." },
        { title: "Data-Connection Faults", description: "The phone charges but is not recognised when plugged into a computer." }
      
    ],
    diagnosticSteps: [

        { step: "Visual Inspection", title: "Visual Inspection", description: "We examine the port under magnification for physical damage or lint." },
        { step: "Test Alternate Cables", title: "Test Alternate Cables", description: "We rule out faulty chargers by testing with verified equipment." },
        { step: "Device Teardown", title: "Device Teardown", description: "We carefully open the device to access the charging port assembly." },
        { step: "Install Replacement Port", title: "Install Replacement Port", description: `We fit a new ${config.chargingPort === 'unknown' ? 'charging' : config.chargingPort} flex or sub-board.` },
        { step: "Verify Charging Stability", title: "Verify Charging Stability", description: "We confirm the device pulls appropriate amperage and maintains a steady connection." },
        { step: "Check Microphone & Speaker", title: "Check Microphone & Speaker", description: "Since the charging board often houses the primary microphone, we test audio functions before closing." }
      
    ],
    
    faq: [

        { question: "Do you automatically replace the port if my phone won't charge?", answer: "No. We do not promise port replacement before inspection. We check for simple lint buildup or a faulty battery first." },
        { question: "My cable feels loose, is the port broken?", answer: `Often, a loose cable is caused by compacted lint at the bottom of the ${config.chargingPort === 'unknown' ? 'charging' : config.chargingPort} port preventing a full click. We will check this during diagnosis.` },
        { question: "How long does a charging port repair take?", answer: "Typically around around 45 minutes to an hour, provided there is no unforeseen frame damage once parts are available." },
        { question: "Will a new port fix slow charging?", answer: "If the current port has damaged pins limiting power delivery, a replacement typically resolves it. However, slow charging can also be due to the charger itself or the battery." },
        { question: `Is the replacement part a genuine ${config.chargingPort === 'unknown' ? 'charging' : config.chargingPort} standard?`, answer: "We use high-quality replacement flex cables that support the appropriate charging protocols for your device." },
        { question: "Does this repair affect my data?", answer: "No, replacing the charging sub-board does not interact with the main logic board's storage." },
        { question: "Can liquid damage cause charging issues?", answer: "Yes, corrosion on the port pins can stop charging entirely. If liquid is present, we may need to assess the logic board as well." }
      
    ]
  };
}
