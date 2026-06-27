import { RepairTypeSeoPocket } from "../iphone/types";
import { getOppoWhyChooseUsBlocks } from "./why-choose";
import { getOppoModelConfig } from "./shared";

export function getOppoLogicBoardPocket(modelSlug: string): RepairTypeSeoPocket | null {
  const config = getOppoModelConfig(modelSlug);
  if (!config) return null;

  const displayModel = config.displayName;
  
  return {
    
    quickAnswer: `If your OPPO ${displayModel} is completely unresponsive, caught in a boot loop, or failing after liquid exposure, the main logic board may be damaged. This complex repair requires professional diagnosis to determine if component-level recovery is possible.`,
    repairOptions: [

        { name: "Diagnosis is Required", shortDescription: "Because symptoms overlap with simpler part failures, a full teardown and electrical diagnosis is required before any repair is confirmed.", bestFor: "", notes: "" },
        { name: "Data Recovery Goals", shortDescription: "In many cases of severe damage, our primary goal is to stabilize the board enough to extract your critical data, rather than returning the device to reliable daily use.", bestFor: "", notes: "" }
      
    ],
    commonProblems: [

        { title: "No Power", description: "The device shows absolutely no signs of life, even with a known-good battery and screen." },
        { title: "Boot Loops", description: "The phone continuously restarts or gets stuck on the OPPO logo." },
        { title: "Unexpected Restarting", description: "The device randomly shuts down during operation." },
        { title: "Charging-Path Faults", description: "The phone fails to charge despite a new battery and a functional charging port." },
        { title: "Liquid or Corrosion Symptoms", description: "Internal damage following exposure to water or other liquids." },
        { title: "Persistent Component Faults", description: "Camera, Wi-Fi, or audio connectivity faults that remain after simpler causes are excluded." }
      
    ],
    diagnosticSteps: [

        { step: "Initial Triage", title: "Initial Triage", description: "Test the device with a known-good screen, battery, and charging port." },
        { step: "Visual Inspection", title: "Visual Inspection", description: "Examine the board under magnification for burnt components or corrosion." },
        { step: "Electrical Measurement", title: "Electrical Measurement", description: "Test power rails and specific circuits using a multimeter." },
        { step: "Component-Level Repair", title: "Component-Level Repair", description: "If feasible, replace microscopic damaged components like capacitors or IC chips." },
        { step: "Data Extraction", title: "Data Extraction", description: "If the board is stabilized, securely back up your data." },
        { step: "Final Assessment", title: "Final Assessment", description: "Determine if the device is safe for continued use or if the repair was strictly for data recovery." }
      
    ],
    
    faq: [

        { question: "How much does a logic board repair cost?", answer: "Logic board repair is quoted individually. The final price depends entirely on the specific fault and the components required." },
        { question: "Is a successful repair guaranteed?", answer: "No. Repair may not be possible in cases of severe structural damage, extensive corrosion, or CPU failure. A no-fix outcome is possible." },
        { question: "Will my data be recovered?", answer: "Data recovery is not guaranteed. However, stabilizing the board to access your data is often the primary objective of this service." },
        { question: "How long does a diagnosis take?", answer: "Logic board diagnosis is complex and may take several days before we can provide a definitive assessment and quote." },
        { question: "If the phone got wet, can you just dry it out?", answer: "Drying a device does not remove the corrosive minerals left behind by liquid. The board must be properly cleaned and inspected." },
        { question: "Why do you test other parts first?", answer: "Component-level uncertainty means a completely dead phone could just have a deeply discharged battery or a damaged screen connector. We rule out simple fixes first." }
      
    ]
  };
}
