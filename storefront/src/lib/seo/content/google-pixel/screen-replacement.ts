import type { RepairTypeSeoPocket, GooglePixelHardwareConfig } from './types';
import { getGooglePixelWhyChooseConfig } from './why-choose';

export function buildGooglePixelScreenReplacementPocket(
  config: GooglePixelHardwareConfig
): RepairTypeSeoPocket {
  return {
    quickAnswer: `Need ${config.modelName} screen replacement in Ringwood? Ali Mobile & Repair inspects cracked display glass, black display areas, lines or flickering, touch response, OLED image quality, under-display fingerprint operation, and frame condition after impact before starting work.`,
    workbenchHeadings: {
      options: `Display options for the ${config.modelName}`,
      diagnostics: 'What do we check first?',
      symptoms: 'What are the common display symptoms?',
      outcomes: 'What affects the final result?',
    },
    repairOptions: [
      {
        name: 'Standard Screen Replacement',
        shortDescription: `A practical display replacement for cracked glass, dead pixels, or a failing touch panel on your ${config.modelName}.`,
        bestFor: 'Users who need their device working reliably without demanding premium panel specifications.',
        notes: 'We test brightness, touch, speaker alignment, and fingerprint functionality where applicable before returning the device.',
      },
      {
        name: 'Diagnosis and Assessment',
        shortDescription: 'Comprehensive testing for devices with no display, extreme impact damage, or complex faults.',
        bestFor: 'Situations where the display fault might be linked to a bent frame, liquid damage, or a deeper internal board issue.',
        notes: 'A bent frame can place stress on a new OLED panel, so housing integrity is always inspected first.',
      },
    ],
    commonProblems: [
      {
        title: 'Cracked Front Glass',
        description: 'Impact damage causing shattering or sharp edges on the front panel.',
        // context: 'Glass damage can spread and expose the delicate OLED layer underneath to moisture and debris.',
      },
      {
        title: 'Black or Blank OLED Display',
        description: 'The phone powers on, vibrates, or rings, but the display remains completely dark.',
        // context: 'Often caused by internal fractures in the OLED panel hidden beneath intact outer glass.',
      },
      {
        title: 'Lines, Flickering, or Discolouration',
        description: 'Green or coloured vertical lines, screen flickering, or irregular patches of colour.',
        // context: 'These visual artifacts indicate permanent damage to the display assembly itself.',
      },
      {
        title: 'Dead or Ghost Touch',
        description: 'The screen fails to register touch input, or registers inputs you haven\'t made (ghost touch).',
        // context: 'Touch layer damage requires full display assembly replacement.',
      },
      {
        title: 'Fingerprint Recognition Issues',
        description: 'The under-display fingerprint sensor fails to read consistently after a drop or impact.',
        // context: 'Can be caused by display damage directly over the sensor or a misalignment from the impact.',
      },
    ],
    diagnosticSteps: [
      {
        step: 'Confirm exact model and display requirement',
        title: 'Confirm exact model and display requirement',
        description: 'We identify the specific Pixel model and assess the display specifications required.',
      },
      {
        step: 'Pre-repair functional checks',
        title: 'Pre-repair functional checks',
        description: 'We test charging, cameras, vibration, and general power state before disassembly.',
      },
      {
        step: 'Inspect frame and display seating',
        title: 'Inspect frame and display seating',
        description: 'We check for a bent housing or corner impact damage that could stress the new panel.',
      },
      {
        step: 'Disconnect internal components',
        title: 'Disconnect internal components',
        description: 'We carefully open the device, disconnect the battery, and remove the damaged display safely.',
      },
      {
        step: 'Fit the appropriate display assembly',
        title: 'Fit the appropriate display assembly',
        description: 'We align and connect the new display, ensuring all flex cables route correctly.',
      },
      {
        step: 'Test image, brightness and touch',
        title: 'Test image, brightness and touch',
        description: 'We verify the display renders correctly without artifacts and that touch responds across the entire panel.',
      },
      {
        step: 'Test fingerprint function',
        title: 'Test fingerprint function',
        description: 'We check the under-display fingerprint sensor operation where applicable.',
      },
      {
        step: 'Test cameras, speakers and charging',
        title: 'Test cameras, speakers and charging',
        description: 'We perform a final round of functional testing to ensure no other components were affected.',
      },
      {
        step: 'Explain seal limitations',
        title: 'Explain seal limitations',
        description: 'We explain that while adhesives are replaced, original factory water resistance cannot be guaranteed after repair.',
      },
    ],
    faq: [
      {
        question: `How much does ${config.modelName} screen replacement cost?`,
        answer: `The exact cost depends on the display tier chosen and the condition of your phone's frame. We provide clear pricing options after assessing the damage at our Ringwood store.`,
      },
      {
        question: 'Is the OLED display included?',
        answer: 'Yes, our screen replacement service replaces the entire front display assembly, which includes both the outer glass and the underlying OLED panel.',
      },
      {
        question: 'Will the under-display fingerprint sensor still work?',
        answer: 'We test fingerprint functionality during and after repair. If the original sensor is undamaged by the drop, it generally continues to function normally with the new display.',
      },
      {
        question: 'Will my data remain on the phone?',
        answer: 'Screen replacement is a hardware service that does not typically affect your stored data. However, we always recommend having a recent backup before any repair.',
      },
      {
        question: 'What happens if the frame is bent?',
        answer: 'A bent or heavily dented frame can prevent a new screen from sitting flush and may cause it to crack under pressure. We inspect the housing first and will discuss any necessary frame correction before fitting the new display.',
      },
      {
        question: 'Will factory water resistance be restored?',
        answer: 'No. While we use appropriate internal adhesives during reassembly, the original factory IP rating cannot be guaranteed once a device has been opened.',
      },
      {
        question: 'How long does the repair take?',
        answer: 'Most standard Pixel screen replacements take a few hours. We can provide a more accurate time estimate when you bring the device in.',
      },
    ],
  };
}
