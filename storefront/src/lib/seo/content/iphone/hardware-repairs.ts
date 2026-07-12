import { appendUniqueCommonProblems, appendUniqueDiagnosticSteps, appendUniqueFaqs, appendUniqueRepairOptions } from './shared';
import type { IphoneHardwareConfig } from './config';
import type { AliMobileEnhancedIphoneRepairType, RepairTypeSeoPocket } from './types';

type IphoneHardwareRepairType = Extract<
  AliMobileEnhancedIphoneRepairType,
  | 'earpiece-speaker-replacement'
  | 'loudspeaker-replacement'
  | 'microphone-replacement'
  | 'power-button-replacement'
  | 'volume-button-replacement'
  | 'camera-lens-replacement'
>;

type HardwareRepairContent = {
  label: string;
  quickAnswer: (modelName: string) => string;
  headings: RepairTypeSeoPocket['workbenchHeadings'];
  option: RepairTypeSeoPocket['repairOptions'][number];
  problems: RepairTypeSeoPocket['commonProblems'];
  diagnostics: RepairTypeSeoPocket['diagnosticSteps'];
  faq: (modelName: string) => RepairTypeSeoPocket['faq'];
};

const HARDWARE_REPAIR_CONTENT: Record<IphoneHardwareRepairType, HardwareRepairContent> = {
  'earpiece-speaker-replacement': {
    label: 'earpiece speaker replacement',
    quickAnswer: (modelName) =>
      `Need ${modelName} earpiece speaker replacement in Ringwood? Ali Mobile & Repair checks low call volume, distorted call audio, loudspeaker-only audio, speaker mesh condition, software behaviour, the audio path, and part condition before confirming whether earpiece replacement is the right repair.`,
    headings: {
      options: 'Earpiece speaker repair approach',
      diagnostics: 'What do we check before replacing it?',
      symptoms: 'Which call-audio symptoms matter?',
      outcomes: 'What can affect the final audio result?',
    },
    option: {
      name: 'Call-audio diagnosis first',
      shortDescription: 'We compare normal calls, speakerphone behaviour, receiver output, and visible mesh condition before quoting earpiece speaker replacement.',
      bestFor: 'Phones with low call volume, distorted receiver sound, or calls that are only clear on loudspeaker.',
      notes: 'Repair timing depends on the exact model, part availability, and whether the fault is limited to the earpiece path.',
    },
    problems: [
      {
        title: 'Low call volume',
        description: 'The caller can be heard only faintly through the top earpiece even after volume and call settings are checked.',
      },
      {
        title: 'Distorted receiver sound',
        description: 'Voices crackle, buzz, or sound unclear during normal calls while other audio paths may still work.',
      },
      {
        title: 'Works on loudspeaker but not earpiece',
        description: 'Speakerphone audio can still work when the receiver path, mesh, or related top-audio assembly has a separate issue.',
      },
    ],
    diagnostics: [
      {
        step: 'Call audio comparison',
        title: 'Call audio comparison',
        description: 'We compare receiver and loudspeaker behaviour to separate earpiece symptoms from wider audio faults.',
      },
      {
        step: 'Mesh and path inspection',
        title: 'Mesh and path inspection',
        description: 'We check the speaker mesh, blockage signs, software behaviour, audio path, and part condition before confirming replacement.',
      },
    ],
    faq: (modelName) => [
      {
        question: `Does low ${modelName} call volume always mean earpiece speaker replacement?`,
        answer: 'No. We inspect the mesh, settings, software behaviour, and audio path first because some call-volume faults need cleaning or further diagnosis rather than immediate replacement.',
      },
      {
        question: 'Can I get a quote before the earpiece repair starts?',
        answer: 'Yes. We confirm the practical repair path and quote before proceeding, using the live repair listing price when a matching catalogue item exists.',
      },
    ],
  },
  'loudspeaker-replacement': {
    label: 'loudspeaker replacement',
    quickAnswer: (modelName) =>
      `Need ${modelName} loudspeaker replacement in Ringwood? Ali Mobile & Repair checks missing ringtone, no media sound, distorted bottom-speaker audio, settings, the speaker path, charging-port path overlap, and board-level fault signs before confirming replacement.`,
    headings: {
      options: 'Loudspeaker repair approach',
      diagnostics: 'What do we test first?',
      symptoms: 'Which speaker symptoms matter?',
      outcomes: 'What can affect the final sound result?',
    },
    option: {
      name: 'Bottom-speaker diagnosis first',
      shortDescription: 'We test ringtone, media playback, speaker output, settings, and related lower-path behaviour before assuming the loudspeaker has failed.',
      bestFor: 'Phones with no ringtone, no media sound, crackling audio, or distorted bottom-speaker output.',
      notes: 'Repair timing depends on model, part availability, and whether diagnosis finds speaker, lower-assembly, or board-level involvement.',
    },
    problems: [
      {
        title: 'No ringtone or alert sound',
        description: 'Incoming-call or alert sounds may be missing even when the phone otherwise powers on and displays notifications.',
      },
      {
        title: 'No media sound',
        description: 'Videos, music, or app audio may be silent through the bottom speaker while other audio outputs behave differently.',
      },
      {
        title: 'Distorted bottom-speaker audio',
        description: 'Crackling, buzzing, or muffled speaker output can come from speaker damage, contamination, or related lower-path faults.',
      },
    ],
    diagnostics: [
      {
        step: 'Speaker and settings test',
        title: 'Speaker and settings test',
        description: 'We check audio settings, ringtone output, media playback, and speaker behaviour before quoting.',
      },
      {
        step: 'Lower path assessment',
        title: 'Lower path assessment',
        description: 'We consider speaker condition, charging-port path overlap, contamination, and board-level fault signs before confirming replacement.',
      },
    ],
    faq: (modelName) => [
      {
        question: `Can ${modelName} loudspeaker faults overlap with charging-port issues?`,
        answer: 'Yes. Some lower-path symptoms can overlap, so we test the speaker, charging-port path, settings, and board-level fault signs before confirming the repair scope.',
      },
      {
        question: 'Will loudspeaker replacement fix every sound issue?',
        answer: 'Not always. It depends on diagnosis, part condition, and whether the issue is speaker-specific or related to another audio path.',
      },
    ],
  },
  'microphone-replacement': {
    label: 'microphone replacement',
    quickAnswer: (modelName) =>
      `Need ${modelName} microphone replacement in Ringwood? Ali Mobile & Repair checks caller-cannot-hear faults, unclear voice memos, muffled recordings, dust blockage, software behaviour, microphone path condition, and board-level audio fault signs before confirming replacement.`,
    headings: {
      options: 'Microphone repair approach',
      diagnostics: 'What do we check before replacing it?',
      symptoms: 'Which recording symptoms matter?',
      outcomes: 'What can affect the final microphone result?',
    },
    option: {
      name: 'Microphone path diagnosis first',
      shortDescription: 'We test calls, voice recording, dust blockage, software behaviour, and related audio paths before confirming microphone replacement.',
      bestFor: 'Phones where callers cannot hear you, recordings are muffled, or voice memos sound unclear.',
      notes: 'Repair timing depends on model, part availability, and whether the issue is isolated to a replaceable microphone path.',
    },
    problems: [
      {
        title: 'Caller cannot hear you',
        description: 'Phone calls may connect normally while the other person hears silence, dropouts, or very low voice audio.',
      },
      {
        title: 'Voice memo unclear',
        description: 'Recorded audio may sound distant, distorted, intermittent, or much quieter than expected.',
      },
      {
        title: 'Muffled recording',
        description: 'Blocked mesh, dust, liquid exposure, part damage, or wider audio-path faults can make recordings sound muffled.',
      },
    ],
    diagnostics: [
      {
        step: 'Call and recording tests',
        title: 'Call and recording tests',
        description: 'We compare call audio and voice memo behaviour to identify which microphone path is affected.',
      },
      {
        step: 'Blockage and fault-path check',
        title: 'Blockage and fault-path check',
        description: 'We inspect for dust blockage, software causes, part condition, and board-level audio fault signs before confirming replacement.',
      },
    ],
    faq: (modelName) => [
      {
        question: `Does muffled ${modelName} recording always need microphone replacement?`,
        answer: 'No. We check for dust blockage, software behaviour, and audio-path faults first because replacement is only quoted when diagnosis supports it.',
      },
      {
        question: 'Can microphone faults affect calls and recordings differently?',
        answer: 'Yes. Different apps and call modes can use different microphone paths, so we test more than one recording or call scenario before confirming the repair.',
      },
    ],
  },
  'power-button-replacement': {
    label: 'power button replacement',
    quickAnswer: (modelName) =>
      `Need ${modelName} power button replacement in Ringwood? Ali Mobile & Repair checks stuck buttons, hard-to-press response, unreliable wake or lock behaviour, button flex condition, housing damage, and internal connection issues before confirming replacement.`,
    headings: {
      options: 'Power button repair approach',
      diagnostics: 'What do we inspect first?',
      symptoms: 'Which button symptoms matter?',
      outcomes: 'What can affect the final button result?',
    },
    option: {
      name: 'Button and housing diagnosis first',
      shortDescription: 'We inspect button movement, frame condition, button flex, and internal connection behaviour before quoting power button replacement.',
      bestFor: 'Phones with a stuck power button, hard press, intermittent wake or lock response, or impact around the side button area.',
      notes: 'Repair timing depends on model, part availability, housing condition, and whether the fault is mechanical or connection-related.',
    },
    problems: [
      {
        title: 'Power button stuck',
        description: 'The side button may sit too low, fail to click, or remain pressed after impact or wear.',
      },
      {
        title: 'Hard to press',
        description: 'A stiff or inconsistent click can come from the button, surrounding housing, flex path, or internal alignment.',
      },
      {
        title: 'Wake or lock not reliable',
        description: 'The phone may not wake, lock, or respond consistently when the power button is pressed.',
      },
    ],
    diagnostics: [
      {
        step: 'Button movement check',
        title: 'Button movement check',
        description: 'We check click feel, travel, stiffness, and whether the housing is restricting the button.',
      },
      {
        step: 'Flex and connection assessment',
        title: 'Flex and connection assessment',
        description: 'We inspect button flex condition, impact signs, housing damage, and internal connection behaviour before confirming replacement.',
      },
    ],
    faq: (modelName) => [
      {
        question: `Can ${modelName} housing damage affect the power button?`,
        answer: 'Yes. Frame or side-housing damage can stop the button moving correctly, so we inspect the housing and internal connection before quoting.',
      },
      {
        question: 'Will you quote before replacing the power button?',
        answer: 'Yes. We inspect first, then confirm the repair scope and quote before proceeding.',
      },
    ],
  },
  'volume-button-replacement': {
    label: 'volume button replacement',
    quickAnswer: (modelName) =>
      `Need ${modelName} volume button replacement in Ringwood? Ali Mobile & Repair checks stuck buttons, missing or intermittent response, button flex condition, frame damage, and software settings before confirming replacement.`,
    headings: {
      options: 'Volume button repair approach',
      diagnostics: 'What do we inspect first?',
      symptoms: 'Which volume-button symptoms matter?',
      outcomes: 'What can affect the final button result?',
    },
    option: {
      name: 'Button response diagnosis first',
      shortDescription: 'We test volume up and down response, button feel, software settings, frame condition, and flex behaviour before quoting replacement.',
      bestFor: 'Phones with stuck volume buttons, no response, intermittent response, or impact near the button rail.',
      notes: 'Repair timing depends on model, part availability, frame condition, and whether the issue is mechanical, flex-related, or software-related.',
    },
    problems: [
      {
        title: 'Volume buttons stuck',
        description: 'One or both buttons may not click properly, may sit unevenly, or may stay pressed after impact.',
      },
      {
        title: 'Buttons not responding',
        description: 'Volume may not change when pressing the buttons even though the phone otherwise works.',
      },
      {
        title: 'Intermittent response',
        description: 'The buttons may work only at certain angles or after repeated presses, which can point to flex, frame, or connection issues.',
      },
    ],
    diagnostics: [
      {
        step: 'Button response test',
        title: 'Button response test',
        description: 'We test volume up, volume down, click feel, and response consistency before quoting.',
      },
      {
        step: 'Flex, frame, and settings check',
        title: 'Flex, frame, and settings check',
        description: 'We check button flex condition, frame damage, internal connection, and relevant software settings before confirming replacement.',
      },
    ],
    faq: (modelName) => [
      {
        question: `Do intermittent ${modelName} volume buttons always need replacement?`,
        answer: 'Not always. We inspect button flex, frame damage, internal connection, and software settings first before confirming replacement.',
      },
      {
        question: 'Can impact damage affect volume button repair?',
        answer: 'Yes. Bent or damaged housing can affect button fit and may change the practical repair scope after inspection.',
      },
    ],
  },
  'camera-lens-replacement': {
    label: 'camera lens replacement',
    quickAnswer: (modelName) =>
      `Need ${modelName} camera lens replacement in Ringwood? Ali Mobile & Repair checks cracked rear camera lens glass, blurry camera output, dust risk, camera module condition, and whether only the outer lens glass is affected before confirming the repair scope.`,
    headings: {
      options: 'Camera lens repair approach',
      diagnostics: 'What do we check before replacing it?',
      symptoms: 'Which lens symptoms matter?',
      outcomes: 'What can affect the final camera result?',
    },
    option: {
      name: 'Lens glass versus camera module diagnosis',
      shortDescription: 'We inspect the outer lens glass, image quality, dust risk, and camera module condition before confirming whether lens-only replacement is suitable.',
      bestFor: 'Phones with cracked rear camera lens glass, hazy photos, glare, or visible damage around the camera lens cover.',
      notes: 'Repair timing depends on model, part availability, glass condition, and whether the camera module itself has also been damaged.',
    },
    problems: [
      {
        title: 'Cracked rear camera lens glass',
        description: 'Broken outer lens glass can expose the camera area and should be inspected before dust or debris reaches the module.',
      },
      {
        title: 'Blurry or hazy camera',
        description: 'Scratched, cracked, or contaminated lens glass can affect photos, but internal camera module faults can look similar.',
      },
      {
        title: 'Dust risk near camera',
        description: 'Missing or cracked lens glass can increase dust risk around the camera opening, so the module condition is checked before quoting.',
      },
    ],
    diagnostics: [
      {
        step: 'Lens glass inspection',
        title: 'Lens glass inspection',
        description: 'We inspect the cracked or scratched rear lens glass and surrounding camera area before confirming the repair path.',
      },
      {
        step: 'Camera module condition check',
        title: 'Camera module condition check',
        description: 'We check image output, dust signs, and whether the camera module itself appears affected before quoting lens-only replacement.',
      },
    ],
    faq: (modelName) => [
      {
        question: `Is ${modelName} camera lens replacement the same as back camera replacement?`,
        answer: 'No. Camera lens replacement is for the outer lens glass. If diagnosis shows internal camera module damage, the repair scope and quote may be different.',
      },
      {
        question: 'Can cracked camera lens glass cause blurry photos?',
        answer: 'Yes, but blurry photos can also come from camera module faults or dust, so we inspect the lens glass and camera output before confirming the repair.',
      },
    ],
  },
};

export function applyIphoneHardwareRepairSeoPocket(
  pocket: RepairTypeSeoPocket,
  config: IphoneHardwareConfig,
  repairType: IphoneHardwareRepairType
): RepairTypeSeoPocket {
  const content = HARDWARE_REPAIR_CONTENT[repairType];

  return {
    ...pocket,
    quickAnswer: content.quickAnswer(config.modelName),
    workbenchHeadings: content.headings,
    repairOptions: appendUniqueRepairOptions(pocket.repairOptions, [content.option]),
    commonProblems: appendUniqueCommonProblems(pocket.commonProblems, content.problems),
    diagnosticSteps: appendUniqueDiagnosticSteps(pocket.diagnosticSteps, content.diagnostics),
    faq: appendUniqueFaqs(pocket.faq, content.faq(config.modelName)),
  };
}
