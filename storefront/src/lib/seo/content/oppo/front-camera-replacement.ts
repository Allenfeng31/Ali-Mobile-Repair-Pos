import { RepairTypeSeoPocket } from "../iphone/types";
import { getOppoWhyChooseUsBlocks } from "./why-choose";
import { getOppoModelConfig } from "./shared";

export function getOppoFrontCameraPocket(modelSlug: string): RepairTypeSeoPocket | null {
  const config = getOppoModelConfig(modelSlug);
  if (!config) return null;

  const displayModel = modelSlug.toUpperCase();
  
  return {
    
    quickAnswer: `If your selfies are blurry, the camera app crashes, or the preview is completely black, you may need a front camera replacement. We replace the faulty camera module to restore clear photos and video calls on your OPPO ${displayModel}.`,
    repairOptions: [

        { name: "Hardware vs Software Diagnosis", shortDescription: "We ensure the issue is a physical camera fault and not a software glitch or third-party app problem.", bestFor: "", notes: "" },
        { name: "Display-Area Damage Assessment", shortDescription: "If the screen glass covering the camera is cracked, a screen replacement might be required instead of, or alongside, the camera module.", bestFor: "", notes: "" }
      
    ],
    commonProblems: [

        { title: "Black Front-Camera Preview", description: "The camera app opens but shows a completely dark screen when switched to the front lens." },
        { title: "Blurred Image", description: "Photos appear permanently out of focus or hazy, regardless of lighting." },
        { title: "Exposure Problems", description: "Images are washed out or unusually dark, indicating a failing sensor." },
        { title: "Video-Call Faults", description: "The camera fails to initialize during video calls or third-party applications." },
        { title: "App Crashing", description: "The camera app freezes or closes unexpectedly when trying to use the front camera." },
        { title: "Visible Internal Dust", description: "Debris trapped inside the lens assembly affecting image quality." }
      
    ],
    diagnosticSteps: [

        { step: "Software Verification", title: "Software Verification", description: "We rule out temporary glitches by testing the camera in diagnostic modes." },
        { step: "Glass Inspection", title: "Glass Inspection", description: "We check if a cracked screen is causing the image distortion." },
        { step: "Safe Device Opening", title: "Safe Device Opening", description: "Carefully open the device to access the front camera housing." },
        { step: "Module Replacement", title: "Module Replacement", description: "Disconnect the faulty sensor and install the new front camera module." },
        { step: "Post-Repair Camera Testing", title: "Post-Repair Camera Testing", description: "Verify focus, exposure, and color accuracy in various lighting conditions." },
        { step: "Final Reassembly", title: "Final Reassembly", description: "Secure the device and re-apply appropriate seals." }
      
    ],
    
    faq: [

        { question: "Will a new front camera fix blurry selfies?", answer: "Yes, if the blur is caused by a failing sensor or internal lens damage. However, if the screen glass over the camera is shattered, you may need a screen replacement instead." },
        { question: "Do you replace the screen as part of the camera repair?", answer: "No, they are separate components. If both are damaged, they require separate replacements." },
        { question: "Does this repair restore facial recognition?", answer: "We replace the camera module, but we do not make biometric restoration claims as these systems often rely on secure enclave pairing which cannot always be restored by third-party repairs." },
        { question: "How long does a front camera replacement take?", answer: "The repair usually takes about 45 to 60 minutes once the part is available." },
        { question: "Is the new camera the same quality?", answer: "We use high-quality replacement modules designed to match the original specifications of your device." },
        { question: "Will I lose my photos?", answer: "No, replacing the camera module does not delete your stored photos or data. A backup is always recommended." }
      
    ]
  };
}
