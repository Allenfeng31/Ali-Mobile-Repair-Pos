export function getOppoWhyChooseUsBlocks(modelDisplayName: string) {
  return [
    {
      title: "Model-Specific Parts",
      content: `We ensure parts are precisely matched for the ${modelDisplayName}. Using the correct specification preserves features like display brightness, touch responsiveness, and charging speed.`,
      iconType: "chip"
    },
    {
      title: "Professional Diagnosis",
      content: "Instead of simply replacing parts, we diagnose the true cause of the fault. We test your display, battery, and logic board connections to provide an accurate quote before proceeding.",
      iconType: "search"
    },
    {
      title: "Safe Component Handling",
      content: "Modern devices contain delicate ribbon cables, tightly packed camera modules, and complex frame assemblies. We follow strict teardown procedures to protect your device during repair.",
      iconType: "shield"
    }
  ];
}
