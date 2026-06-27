import { RepairTypeSeoPocket } from "../iphone/types";
import { getOppoWhyChooseUsBlocks } from "./why-choose";
import { getOppoModelConfig } from "./shared";

export function getOppoBatteryPocket(modelSlug: string): RepairTypeSeoPocket | null {
  const config = getOppoModelConfig(modelSlug);
  if (!config) return null;

  const displayModel = modelSlug.toUpperCase();
  
  return {
    
    quickAnswer: `If your OPPO ${displayModel} drains quickly, shuts down randomly, or feels excessively hot, it likely needs a new battery. Replacing the worn battery restores stable power delivery and prevents potential damage from swelling.`,
    repairOptions: [

        { name: "Battery vs Charging Port Diagnosis", shortDescription: "We confirm whether your battery is failing or if the charging port is preventing a proper charge.", bestFor: "", notes: "" },
        { name: "Safe Swelling Management", shortDescription: "If the battery has expanded, we safely extract and dispose of it to prevent pressure damage to your screen or rear panel.", bestFor: "", notes: "" }
      
    ],
    commonProblems: [

        { title: "Rapid Battery Drain", description: "The battery percentage drops significantly faster than it used to during normal use." },
        { title: "Unexpected Shutdown", description: "The phone turns off suddenly, even when the battery shows remaining charge." },
        { title: "Unstable Percentage", description: "The charge level jumps erratically, dropping from high to low suddenly." },
        { title: "Excessive Heat", description: "The back of the device feels unusually hot during light use or charging." },
        { title: "Battery Swelling", description: "The battery physically expands, which can push against the internal components." },
        { title: "Rear-Panel Lifting", description: "A swollen battery may cause the back cover or screen to lift away from the frame." }
      
    ],
    diagnosticSteps: [

        { step: "Confirm Model", title: "Confirm Model", description: "Verify the exact device to select the correctly matched battery capacity." },
        { step: "Pre-Repair Functional Checks", title: "Pre-Repair Functional Checks", description: "Test basic functionality before opening the device." },
        { step: "Safe Removal", title: "Safe Removal", description: "Carefully remove the rear panel without causing damage to the glass or plastic housing." },
        { step: "Battery Extraction", title: "Battery Extraction", description: "Safely unseat the degraded or swollen battery using appropriate adhesive removers." },
        { step: "Fit New Battery", title: "Fit New Battery", description: "Install the new battery and secure it safely in the housing." },
        { step: "Test Charging", title: "Test Charging", description: "Verify that the new battery accepts charge efficiently and maintains a stable connection." },
        { step: "Final Seal", title: "Final Seal", description: "Reapply adhesive to secure the rear panel back in place." }
      
    ],
    
    faq: [

        { question: "Will a new battery make my phone last exactly as long as when it was new?", answer: "While a new battery resolves degradation issues and significantly improves stability, overall runtime also depends on your current software and app usage. We do not make fixed runtime promises." },
        { question: "How do I know if the battery or the charging port is broken?", answer: "We perform a diagnosis before replacement to determine if power is successfully reaching the battery from the port." },
        { question: "Is it dangerous if my phone back cover is lifting?", answer: "Yes, this is often caused by a swollen battery. We recommend bringing it in for inspection promptly to avoid pressure damage to the screen." },
        { question: "Will my data be safe?", answer: "Battery replacements do not typically affect internal storage, but a backup is always recommended." },
        { question: "How long does a battery replacement take?", answer: "The repair normally takes around 30 to 45 minutes once the part is available." },
        { question: "Do you use safe adhesives for the battery?", answer: "Yes, we use industry-standard stretch-release adhesive strips to mount the battery securely without causing pressure points." },
        { question: "Is there a warranty?", answer: "Yes, our new batteries come with a warranty covering manufacturing faults." }
      
    ]
  };
}
