import { RepairTypeSeoPocket } from "../iphone/types";
import { getOppoWhyChooseUsBlocks } from "./why-choose";
import { getOppoModelConfig } from "./shared";

export function getOppoScreenPocket(modelSlug: string): RepairTypeSeoPocket | null {
  const config = getOppoModelConfig(modelSlug);
  if (!config) return null;

  const displayModel = config.displayName;
  const title = `OPPO ${displayModel} Screen Replacement in Ringwood | Ali Mobile & Repair`;
  
  return {
    
    quickAnswer: `A shattered screen, unresponsiveness, flickering, or a completely blank display typically requires a full screen replacement. For the OPPO ${displayModel}, this involves replacing the entire front panel assembly, which resolves both cracked glass and underlying ${config.displayType === 'unknown' ? 'LCD or OLED' : config.displayType} damage.`,
    repairOptions: [

        { name: "Full Display Assembly", shortDescription: "We replace the glass and underlying display panel together. This is the industry-standard method to guarantee reliable touch response and image quality.", bestFor: "", notes: "" },
        { name: "Display vs Board Fault", shortDescription: "If your screen is completely black, we check whether it's a damaged LCD panel or an internal logic board issue before confirming the repair.", bestFor: "", notes: "" }
      
    ],
    commonProblems: [

        {
          title: "Cracked Front Glass",
          description: "Visible physical damage to the outer glass layer, which can spread or cause injury over time."
        },
        {
          title: "Black or Blank LCD Image",
          description: "The phone still rings or vibrates, but the display remains entirely black."
        },
        {
          title: "Lines or Colour Distortion",
          description: "Vertical lines, ink-like bleeding spots, or incorrect colours across the display."
        },
        {
          title: "Flickering",
          description: "The screen brightness fluctuates rapidly or the display turns on and off unexpectedly."
        },
        {
          title: "Touch Failure & Ghost Touch",
          description: "Certain areas ignore your input, or the screen registers taps and swipes that you didn't make."
        },
        {
          title: "Frame Damage After Impact",
          description: "Heavy drops can deform the frame, which we inspect to ensure the new screen will sit securely aligned."
        }
      
    ],
    diagnosticSteps: [

        { step: "Confirm Exact Model", title: "Confirm Exact Model", description: "We verify the specific model identity to ensure we fit the correctly matched display assembly." },
        { step: "Pre-Repair Functional Checks", title: "Pre-Repair Functional Checks", description: "We assess the condition of your battery, cameras, and frame before beginning the repair." },
        { step: "Inspect Display & Frame Seating", title: "Inspect Display & Frame Seating", description: "We check the surrounding bezel to make sure there are no bends that would prevent a safe screen fit." },
        { step: "Protect Internal Components", title: "Protect Internal Components", description: "We carefully open the device, taking care not to damage internal flex cables or camera modules." },
        { step: "Fit Appropriate Display", title: "Fit Appropriate Display", description: "We install the new LCD display assembly and secure it correctly into the housing." },
        { step: "Test Image, Touch, and Brightness", title: "Test Image, Touch, and Brightness", description: "We run diagnostics to confirm colour accuracy, touch responsiveness, and backlight adjustment." },
        { step: "Final Hardware Checks", title: "Final Hardware Checks", description: "We verify that your cameras, speakers, and charging port are fully functional." },
        { step: "Explain Seal & IP54 Limitations", title: "Explain Seal & IP54 Limitations", description: "We explain how opening the device affects the original factory water resistance seal." }
      
    ],
    
    faq: [

        {
          question: `Does the OPPO ${displayModel} screen replacement fix touch issues?`,
          answer: "Yes, the replacement assembly includes the touch digitiser layer. This resolves ghost touch and unresponsive areas."
        },
        {
          question: "Will I lose my data during a screen repair?",
          answer: "Screen replacement normally generally does not affect your data, though we always recommend a backup beforehand. However, we always recommend having a recent backup before any hardware service."
        },
        {
          question: "Do you replace just the top glass or the whole LCD?",
          answer: "We replace the full display assembly (glass and LCD). Replacing just the top glass is unreliable and compromises the display's structural integrity."
        },
        {
          question: "How long does the screen repair take?",
          answer: "Most screen replacements take approximately approximately 30 to 60 minutes, subject to part availability and device condition once the correctly matched part is available at the store."
        },
        {
          question: "Will the new screen sit flush if my frame is dented?",
          answer: "We inspect your frame for impact damage. Minor dents can often be smoothed, but severe frame bending may require housing correction for the screen to sit perfectly."
        },
        {
          question: "Does the screen replacement come with a warranty?",
          answer: "Yes, our screen replacements are covered by a warranty against manufacturing defects (excluding accidental damage)."
        },
        {
          question: "Will my phone still be water resistant?",
          answer: "While we use appropriate adhesives, opening the device breaks the factory IP54 seal. We cannot guarantee it will retain its original water resistance."
        }
      
    ]
  };
}
