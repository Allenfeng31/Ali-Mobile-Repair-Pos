import type { VirtualPhoneRepairSlug } from '@/lib/virtualPhoneRepairs';

type Link = Readonly<{ href: string; label: string }>;
type Card = Readonly<{ title: string; body: string; icon: string; link?: Link }>;
type Faq = Readonly<{ question: string; answer: string }>;

type OppoRepairContent = Readonly<{
  title: string;
  metadataDescription: string;
  intro: string;
  guidanceIntro: string;
  cards: readonly Card[];
  faqs: readonly Faq[];
}>;

export const OPPO_SHARED_REPAIR_CONTENT: Readonly<Record<VirtualPhoneRepairSlug, OppoRepairContent>> = {
  'loudspeaker-replacement': {
    title: 'OPPO Loudspeaker Replacement Ringwood | Ali Mobile',
    metadataDescription: 'OPPO media, ringtone or speakerphone sound low or distorted? Diagnosis-led loudspeaker repair at Ringwood Square, typically 30 minutes where suitable.',
    intro: 'OPPO loudspeaker replacement concerns the speaker used for ringtones, media, notifications and speakerphone. We test the affected audio path before recommending a part.',
    guidanceIntro: 'OPPO loudspeaker symptoms may affect ringtones, media, notifications and speakerphone, but debris, routing or a wider audio fault can look similar.',
    cards: [
      { title: 'When the OPPO loudspeaker is the relevant path', body: 'The loudspeaker handles ringtones, media, video, notifications and speakerphone. Low volume, muffled sound, crackling, distortion, intermittent output or no sound across those uses can point to that audio path, but do not by themselves prove that the speaker needs replacement.', icon: 'loudspeaker' },
      { title: 'Loudspeaker, earpiece or microphone?', body: 'The upper earpiece is for normal ear-level calls, and the microphone affects what the other person hears. If media, ringtones and speakerphone are affected while normal call audio still works, the loudspeaker path is more relevant than the earpiece.', icon: 'earpiece', link: { href: '/repairs/phone/oppo/earpiece-speaker-replacement', label: 'Compare OPPO earpiece symptoms' } },
      { title: 'Checks before a speaker repair', body: 'Disconnect Bluetooth, wired and USB audio, then test a ringtone and local media. A blocked speaker grille, dry debris, moisture, a drop, audio-routing settings, an app or software issue can imitate loudspeaker failure. Avoid pushing tools or liquid into the grille.', icon: 'clipboard' },
      { title: 'Diagnosis and output testing', body: 'We inspect the speaker opening and device condition, then compare media, ringtone and speakerphone output. A damaged connector, another internal component or a board-level audio path can require a different repair, so replacement is confirmed only where suitable.', icon: 'wrench' },
      { title: 'Price, timing, warranty and preparation', body: 'OPPO loudspeaker replacement starts from $50 as a general service starting price, not a price for every Find, Reno or A series model. Your selected OPPO may show an exact price, From price or Quote on Request. A suitable repair is typically scheduled as a 30-minute repair, subject to diagnosis and parts. Eligible completed standard repairs include a 6-month warranty. Back up important data when practical and mention liquid exposure or impact.', icon: 'check' },
    ],
    faqs: [
      { question: 'Why does my OPPO have no sound for media but calls still work?', answer: 'Media, ringtones and speakerphone use the loudspeaker path, while normal ear-level calls use the upper earpiece. Check volume, routing and accessories first; persistent lower-speaker symptoms need inspection.' },
      { question: 'Is the OPPO loudspeaker the same as the earpiece?', answer: 'No. The loudspeaker handles media, ringtones and speakerphone, while the earpiece handles normal calls at your ear. If only normal calls are quiet, the earpiece path is more relevant.' },
      { question: 'How much does OPPO loudspeaker replacement cost?', answer: 'OPPO loudspeaker replacement starts from $50 as a general service starting price. Select your model for an exact price, a From price for legitimate variants, or Quote on Request when a trusted model price is unavailable.' },
      { question: 'How long does OPPO loudspeaker repair take?', answer: 'A suitable OPPO loudspeaker replacement is typically scheduled as a 30-minute repair. Diagnosis, model fitment, parts and other damage can change the confirmed timing.' },
      { question: 'Will OPPO loudspeaker repair erase my data?', answer: 'A standard loudspeaker replacement does not normally erase phone data. Back up important information when practical and disclose drops, moisture or previous repairs that may affect diagnosis.' },
      { question: 'Is OPPO loudspeaker repair covered by a warranty?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. We confirm the completed repair scope before work begins.' },
    ],
  },
  'earpiece-speaker-replacement': {
    title: 'OPPO Earpiece Speaker Repair Melbourne | Ali Mobile',
    metadataDescription: 'OPPO calls quiet at your ear while speakerphone works? We assess the upper earpiece path at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'OPPO earpiece speaker replacement concerns the upper call receiver, not the bottom loudspeaker used for media and speakerphone. We compare those audio paths before quoting.',
    guidanceIntro: 'When OPPO normal-call audio is weak or absent but speakerphone works, the upper receiver path needs assessment—not an automatic earpiece replacement.',
    cards: [
      { title: 'Normal-call audio versus speakerphone', body: 'The upper call receiver lets you hear a caller with the phone at your ear. Weak, muffled, distorted or absent normal-call audio while speakerphone remains clear can point to that area. Media, ringtones and speakerphone usually use the separate bottom loudspeaker.', icon: 'earpiece', link: { href: '/repairs/phone/oppo/loudspeaker-replacement', label: 'Compare OPPO loudspeaker symptoms' } },
      { title: 'Safe checks before diagnosis', body: 'During a normal call, raise call volume, disconnect Bluetooth or wired audio, and compare speakerphone. Check whether a screen protector or case covers the top mesh; only remove loose dry debris gently with a soft brush or cloth.', icon: 'clipboard' },
      { title: 'When it may be more than the receiver', body: 'Moisture, a drop, a previous display repair, mesh blockage, a speaker flex or connector, alignment, network quality or a broader board-level audio path can affect call sound. If callers cannot hear you, the microphone is a separate diagnostic path.', icon: 'wrench' },
      { title: 'Inspection and functional checks', body: 'We compare normal-call, speakerphone and media audio, inspect the top opening and check the affected functions after a suitable repair. We do not assume every muffled call needs a receiver part.', icon: 'check' },
      { title: 'Price, timing, warranty and preparation', body: 'OPPO earpiece speaker replacement starts from $50 as a general category price, not every model’s quote. Your selected OPPO shows exact, From or Quote on Request pricing. Suitable repairs are typically scheduled for 30 minutes, subject to diagnosis and parts. Eligible completed standard repairs have a 6-month warranty. Back up data when practical and mention earlier display work, drops or moisture.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Why can I hear OPPO calls on speakerphone but not through the earpiece?', answer: 'Speakerphone and the upper earpiece use different audio paths. Clear speakerphone with poor normal-call audio can involve the receiver, top mesh or its connection, but routing and other faults still need checking.' },
      { question: 'Can a previous OPPO display repair affect call audio?', answer: 'Yes. The receiver sits near the display assembly, and previous display repair, impact or misalignment can affect its flex, connector or surrounding parts. We inspect the wider symptom pattern before recommending replacement.' },
      { question: 'How much does OPPO earpiece speaker replacement cost?', answer: 'OPPO earpiece speaker replacement starts from $50 as a general service price. Select your model for its exact price, From price or Quote on Request; a final quote follows inspection.' },
      { question: 'How long does OPPO earpiece repair take?', answer: 'A suitable OPPO earpiece replacement is typically scheduled for a 30-minute repair. Model fitment, part availability and any additional fault can alter timing, which we confirm after assessment.' },
      { question: 'Will OPPO earpiece repair affect my data?', answer: 'A standard earpiece repair does not normally erase data. Back up important information when practical, and have the device passcode available if functional call testing requires access.' },
      { question: 'Does OPPO earpiece repair have a warranty?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. The confirmed repair scope is explained before work.' },
    ],
  },
  'power-button-replacement': {
    title: 'OPPO Power Button Replacement Ringwood | Ali Mobile',
    metadataDescription: 'OPPO power button stuck, recessed or unresponsive? We check button, battery and charging causes at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'OPPO power button replacement is for a confirmed physical side-button or button-flex fault. An OPPO phone that will not turn on does not automatically need a new button.',
    guidanceIntro: 'An OPPO side button can fail physically, but no-power symptoms need battery, charging, display, software and motherboard checks before a button repair is selected.',
    cards: [
      { title: 'Physical side-button symptoms', body: 'A stuck, recessed, mushy, loose or clickless OPPO power button, intermittent response, or failure to wake and lock the screen can indicate damage to the button, frame or side-button flex. A drop can shift the key or affect an internal connection.', icon: 'power' },
      { title: 'No power is not proof of a button fault', body: 'An OPPO phone that will not turn on does not automatically need power-button replacement. Battery, charging-port, display, software, liquid, motherboard or power-management faults can look similar. A device that starts only while connected to charging needs battery or charging diagnosis first.', icon: 'clipboard', link: { href: '/repairs/battery-replacement', label: 'Compare battery repair symptoms' } },
      { title: 'Safe checks and related faults', body: 'Remove a case that may hold the key down, use a compatible charger, and note vibration, sound or computer connection despite a black display. Settings can change long-press behaviour, so an unexpected on-screen action is not proof of hardware failure. Do not force or dismantle a jammed button.', icon: 'wrench', link: { href: '/repairs/charging-port-replacement', label: 'Compare charging-port symptoms' } },
      { title: 'What we inspect and test', body: 'We inspect button feel, frame alignment, the side-button flex and connection where appropriate, then test wake, lock, long-press behaviour and charging response. Tell us about impact, liquid exposure and previous repair work so the assessment can include related components.', icon: 'check' },
      { title: 'Price, timing, warranty and preparation', body: 'OPPO power button replacement starts from $50 as a general category price; a selected OPPO may show exact, From or Quote on Request pricing. Suitable repairs are typically scheduled for a 30-minute repair, subject to diagnosis and parts. Eligible completed standard repairs have a 6-month warranty. Back up accessible data before the battery runs flat.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Does an OPPO phone that will not turn on need a power button?', answer: 'Not necessarily. Battery, charging, display, software, liquid, motherboard or power-management faults can prevent normal startup. We check signs of life and charging response before recommending a side-button replacement.' },
      { question: 'Why does my OPPO only start when connected to a charger?', answer: 'That can point to a depleted or failing battery, charging path or another power fault rather than the button alone. We assess charging response and the wider device condition before choosing a repair.' },
      { question: 'How much does OPPO power button replacement cost?', answer: 'OPPO power button replacement starts from $50 as a general service price, not a confirmed price for every model. Choose your model for exact, From or Quote on Request pricing; we confirm the final quote before work.' },
      { question: 'How long does OPPO power button repair take?', answer: 'A suitable OPPO side-button repair is typically scheduled as a 30-minute repair. Diagnosis, frame damage or parts availability can change the final time, which we explain after assessment.' },
      { question: 'What should I do before an OPPO power button repair?', answer: 'Back up data while the phone is still accessible, remove a case pressing the key, and tell us if the fault followed a drop, moisture or another repair. Do not force a stuck button.' },
      { question: 'Is an OPPO power button repair warranted?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. We confirm the repaired fault and scope before work.' },
    ],
  },
  'volume-button-replacement': {
    title: 'OPPO Volume Button Repair Melbourne | Ali Mobile',
    metadataDescription: 'OPPO volume keys stuck or changing by themselves? We check case pressure, flex and settings at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'OPPO volume button replacement addresses confirmed physical Volume Up, Volume Down or button-flex faults—not every change in sound level, setting or connected accessory.',
    guidanceIntro: 'One OPPO volume key can fail while the other works, and phantom volume changes can come from tight case pressure or settings as well as hardware.',
    cards: [
      { title: 'One key, both keys or phantom volume?', body: 'An OPPO Volume Up or Volume Down key may be stuck, loose, mushy, clickless or intermittent; one direction or both can be affected. Repeated self-changing volume can indicate a pressed key, but does not by itself prove a button-flex fault.', icon: 'volume' },
      { title: 'Safe checks before repair', body: 'Remove a tight case, inspect only visible dry debris and restart the phone. Compare media, ringtone and call volume, then disconnect Bluetooth or wired audio. Different sound controls, apps, mute options or accessibility settings can alter volume without a physical-key failure.', icon: 'clipboard' },
      { title: 'Impact, liquid and internal causes', body: 'A drop can shift the frame or damage a button flex or connector. Liquid or moisture can affect the physical button, button flex, connector or other internal components. We diagnose the affected path rather than assuming every exposure requires button replacement.', icon: 'wrench' },
      { title: 'What we test', body: 'We check the feel and response of both buttons, on-screen volume changes, tight case pressure, frame interference and whether other functions are affected. If settings, an app, Bluetooth routing or a broader fault explains the symptom, button replacement may not be suitable.', icon: 'check', link: { href: '/repairs/phone/oppo/power-button-replacement', label: 'Compare OPPO power-button symptoms' } },
      { title: 'Price, timing, warranty and preparation', body: 'OPPO volume button replacement starts from $50 as a general category price. A selected OPPO may show an exact price, From price or Quote on Request. Suitable repairs are typically scheduled as a 30-minute repair, subject to diagnosis and parts; eligible completed standard repairs have a 6-month warranty. Back up data when practical and describe intermittent behaviour.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Why does my OPPO volume change by itself?', answer: 'A key held down by a tight case or debris can change volume, but a connected accessory, app, setting or software fault can also be responsible. Remove the case and compare behaviour across sound types before assuming a button fault.' },
      { question: 'Can a phone case cause OPPO volume-button problems?', answer: 'Yes. A tight case can keep a Volume Up or Volume Down key pressed or make it feel unresponsive. Remove it before testing so we can distinguish case pressure from a physical key fault.' },
      { question: 'How much does OPPO volume button replacement cost?', answer: 'OPPO volume button replacement starts from $50 as a service starting price, not every model’s final quote. Choose your model to see exact, From or Quote on Request pricing before booking.' },
      { question: 'How long does OPPO volume button repair take?', answer: 'A suitable OPPO volume-button repair is typically scheduled as a 30-minute repair. Diagnosis, parts or related frame damage can change timing; we confirm it before work.' },
      { question: 'Can liquid exposure make OPPO volume keys stop working?', answer: 'Yes, moisture can affect a physical button, button flex, connector or other internal components. We assess the wider device condition before deciding whether button replacement alone is appropriate.' },
      { question: 'Will OPPO volume button repair erase data or have a warranty?', answer: 'A standard volume-button repair does not normally erase data, so back up important information when practical. Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms.' },
    ],
  },
};

export const OPPO_CAMERA_LENS_CONTENT: OppoRepairContent = {
  title: 'OPPO Camera Lens Glass Replacement Ringwood | Ali Mobile',
  metadataDescription: 'Cracked OPPO rear camera lens glass? Fixed $50 repair at Ringwood Square, typically 30 minutes where suitable. We check focus, housing and moisture risk.',
  intro: 'OPPO camera lens replacement repairs suitable damaged exterior protective camera lens glass for $50. We inspect camera output and the surrounding area before confirming lens-glass repair.',
  guidanceIntro: 'OPPO rear camera lens glass protects the camera opening. Cracks, chips, missing glass and deep scratches need assessment before dust or moisture reaches the camera area.',
  cards: [
    { title: 'Protective camera lens glass, not the camera module', body: 'This fixed $50 OPPO service repairs suitable damaged exterior protective camera lens glass. Cracked or scratched outer glass can create haze or glare, but failure to focus, shaking, a black image, persistent internal spots or artifacts can indicate an internal camera module or another fault instead.', icon: 'camera' },
    { title: 'Camera-area damage and contamination', body: 'We inspect cracked, chipped, missing or scratched protective glass, impact around the camera area and the surrounding housing. OPPO camera layouts vary by model, so we confirm fitment rather than assuming the same camera-island design. Damaged outer glass can expose the opening to dust and moisture.', icon: 'wrench' },
    { title: 'When diagnosis goes beyond outer glass', body: 'If the camera cannot focus, shakes, produces a black image, persistent internal spots or artifacts, or fails despite intact exterior glass, an internal camera module or another fault may need diagnosis. Replacing outer glass alone does not automatically solve internal liquid damage.', icon: 'clipboard' },
    { title: 'Fixed price, timing and preparation', body: 'OPPO protective camera lens-glass replacement is fixed at $50 where suitable. It is typically scheduled as a 30-minute repair, subject to model fitment, parts and diagnosis. Eligible completed standard repairs include a 6-month warranty. Back up important data when practical, remove accessories and tell us about impact or liquid exposure.', icon: 'check' },
  ],
  faqs: [
    { question: 'Do I need OPPO camera lens replacement or back camera replacement?', answer: 'Camera lens replacement addresses damaged exterior protective glass. If the OPPO camera cannot focus, shakes, shows a black image or has persistent internal artifacts, the internal camera module or another component may need diagnosis instead.' },
    { question: 'Can cracked OPPO camera glass cause blurry photos?', answer: 'Yes. Cracked, scratched or contaminated protective glass can haze photos or cause glare, especially around lights. Blurring can also come from the internal camera module, so we check image output before confirming lens-glass repair.' },
    { question: 'Is missing OPPO camera lens glass urgent?', answer: 'Missing or chipped protective glass leaves the camera opening more exposed to dust and moisture. Avoid adding liquid or pressing into the opening, and arrange an assessment because internal contamination may need a different repair.' },
    { question: 'How much is OPPO camera lens glass replacement?', answer: 'OPPO protective rear-camera lens-glass replacement is fixed at $50 where the repair is suitable. This is separate from internal back-camera module repair; we check model fitment and other damage first.' },
    { question: 'How long does OPPO camera lens replacement take?', answer: 'A suitable OPPO outer lens-glass replacement is typically scheduled as a 30-minute repair. Model fitment, part availability or deeper camera-area damage can change the confirmed timing.' },
    { question: 'Will OPPO camera lens repair affect my data or warranty?', answer: 'Outer lens-glass repair does not normally erase data, but back up important information when practical. Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms.' },
  ],
};
