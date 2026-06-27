import { RepairTypeSeoPocket } from "../iphone/types";
import { getOppoWhyChooseUsBlocks } from "./why-choose";
import { getOppoModelConfig } from "./shared";

export function getOppoBackCameraPocket(modelSlug: string): RepairTypeSeoPocket | null {
  const config = getOppoModelConfig(modelSlug);
  if (!config) return null;

  const displayModel = modelSlug.toUpperCase();
  
  return {
    
    quickAnswer: `If your rear camera shakes, fails to focus, or displays a black screen, the internal camera module likely requires replacement. We safely replace the faulty camera hardware on your OPPO ${displayModel} to restore normal photography.`,
    repairOptions: [

        { name: "Module Fault vs External Lens Damage", shortDescription: "We determine if the internal camera sensor is failing or if the issue is merely a shattered external glass cover causing glare and blur.", bestFor: "", notes: "" },
        { name: "Multi-Camera Assessment", shortDescription: "We test the main camera, and where diagnosable, the mono and microscope cameras, to isolate the specific hardware failure.", bestFor: "", notes: "" }
      
    ],
    commonProblems: [

        { title: "Main Camera Faults", description: "The primary sensor fails to capture clear images or crashes the app." },
        { title: "Black Preview", description: "The screen remains dark when switching to the rear camera." },
        { title: "Blur or Focus Failure", description: "The camera constantly hunts for focus or remains permanently blurred." },
        { title: "Camera Switching Problems", description: "The phone freezes when switching between photo, video, or portrait modes." },
        { title: "Impact Near Camera Openings", description: "Physical damage to the housing surrounding the camera array." },
        { title: "Mechanical Shaking", description: "The internal lens physically vibrates, often accompanied by a buzzing sound, ruining image stability." }
      
    ],
    diagnosticSteps: [

        { step: "Visual Inspection", title: "Visual Inspection", description: "Check for external lens fractures that might be the true cause of the image distortion." },
        { step: "Software Testing", title: "Software Testing", description: "Rule out application errors using diagnostic modes." },
        { step: "Safe Access", title: "Safe Access", description: "Carefully open the rear panel to reach the camera array." },
        { step: "Module Replacement", title: "Module Replacement", description: "Remove the failing camera and install the new replacement module." },
        { step: "Comprehensive Testing", title: "Comprehensive Testing", description: "Test focus across all modes and ensure no dust is trapped within the assembly." },
        { step: "Final Seal", title: "Final Seal", description: "Reassemble the device securely." }
      
    ],
    
    faq: [

        { question: "Does this repair include the external glass cover?", answer: "No, this repair focuses on the internal camera module itself. External camera lens or lens-cover replacement is not automatically included." },
        { question: "Will replacing the camera fix a shattered lens?", answer: "If only the external glass is broken, you need a lens cover replacement, not a camera module replacement, unless shards have damaged the sensor beneath." },
        { question: "Do you replace every camera component?", answer: "We replace the specific module that matches the POS product. We do not imply that a single product automatically replaces every rear camera component in a multi-camera array." },
        { question: "How long does a back camera replacement take?", answer: "The repair typically takes 45 to 60 minutes once the correctly matched part is available." },
        { question: "Why is my camera shaking and buzzing?", answer: "This is usually a failure of the optical image stabilization (OIS) or autofocus mechanism inside the camera module. A replacement resolves this." },
        { question: "Will I lose my stored photos?", answer: "No, replacing the camera module does not affect your internal storage or delete existing photos." }
      
    ]
  };
}
