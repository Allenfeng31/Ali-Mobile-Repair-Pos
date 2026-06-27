import { RepairTypeSeoPocket } from "../iphone/types";
import { getOppoWhyChooseUsBlocks } from "./why-choose";
import { getOppoModelConfig } from "./shared";

export function getOppoBackGlassPocket(modelSlug: string): RepairTypeSeoPocket | null {
  const config = getOppoModelConfig(modelSlug);
  if (!config) return null;

  const displayModel = modelSlug.toUpperCase();
  const terminology = config.rearPanelPublicTerminology;
  
  return {
    
    quickAnswer: `The public Back Glass Replacement service maps directly to the real model-specific Back Housing Replacement product for the OPPO ${displayModel}. This repair addresses a cracked, chipped or damaged ${terminology} to restore the structural integrity of your device.`,
    repairOptions: [

        { name: "Damage Assessment", shortDescription: `The inspection checks the ${terminology}, frame, camera openings and battery swelling before proceeding.`, bestFor: "", notes: "" },
        { name: "Methodology", shortDescription: `The actual replacement method depends on the damaged rear assembly and available part.`, bestFor: "", notes: "" }
      
    ],
    commonProblems: [

        { title: "Cracked, Chipped or Damaged Rear Panel", description: `Visible physical damage across the ${terminology} surface.` },
        { title: "Lifting Back Cover", description: "The rear assembly has started to peel away or lift from the device frame." },
        { title: "Gaps Around the Frame", description: "Uneven seating or gaps that compromise the internal seals." },
        { title: "Damage Near Camera Openings", description: "Fractures or chips near the camera array housing." },
        { title: "Battery Swelling", description: `Internal battery expansion putting pressure on the ${terminology}.` },
        { title: "Frame Deformation", description: "Physical warping of the housing following an impact." },
        { title: "Cosmetic Damage Hiding Deeper Structural Damage", description: "Visible flaws that might indicate more significant internal issues." }
      
    ],
    diagnosticSteps: [

        { step: "Confirm Model", title: "Confirm Model", description: "Verify the exact device variant for the correct replacement part." },
        { step: "Pre-Repair Checks", title: "Pre-Repair Checks", description: "Test basic functionality including cameras and wireless features if applicable." },
        { step: "Safe Extraction", title: "Safe Extraction", description: `Carefully remove the damaged ${terminology} using specialized heat application and tools.` },
        { step: "Surface Preparation", title: "Surface Preparation", description: "Clean the frame of all old adhesives and glass/plastic fragments." },
        { step: "Installation", title: "Installation", description: `Fit the new ${terminology} with precision alignment.` },
        { step: "Seal Application", title: "Seal Application", description: "Apply appropriate adhesive seals and clamp the device safely." }
      
    ],
    
    faq: [

        { question: "Is this the rear panel or full housing?", answer: "This service primarily targets the rear panel (back cover). If the main mid-frame is heavily bent, a full housing replacement may be required, which we assess during diagnosis." },
        { question: `How much does OPPO ${displayModel} Back Glass Replacement cost?`, answer: "Pricing is available in-store or online through our live catalog. We verify the exact part required for your specific model." },
        { question: "Can battery swelling lift the rear panel?", answer: "Yes, an expanding battery applies internal pressure which often causes the back cover to lift or unglue. If this is the cause, the battery must also be safely replaced." },
        { question: "Is camera-lens replacement included?", answer: "No, external camera lens or lens-cover replacement is not automatically included with the rear panel replacement." },
        { question: "Will my data normally remain on the phone?", answer: "Yes, rear panel replacement does not normally affect your data. However, a backup is always recommended." },
        { question: "Will factory water resistance be restored?", answer: "While we use appropriate replacement adhesives, opening the device breaks the original factory seal. We cannot guarantee it will remain fully water resistant." },
        { question: "How long does the repair take?", answer: "The repair generally takes 60 to 90 minutes as careful cleaning of the frame and proper adhesive curing is required." }
      
    ]
  };
}
