import type { VirtualPhoneRepairSlug } from '@/lib/virtualPhoneRepairs';

type Link = Readonly<{ href: string; label: string }>;
type Card = Readonly<{ title: string; body: string; icon: string; link?: Link }>;
type Faq = Readonly<{ question: string; answer: string }>;

type GooglePixelRepairContent = Readonly<{
  title: string;
  metadataDescription: string;
  intro: string;
  guidanceIntro: string;
  cards: readonly Card[];
  faqs: readonly Faq[];
}>;

export const GOOGLE_PIXEL_SHARED_REPAIR_CONTENT: Readonly<Record<VirtualPhoneRepairSlug, GooglePixelRepairContent>> = {
  'loudspeaker-replacement': {
    title: 'Google Pixel Loudspeaker Replacement Melbourne | Ali Mobile',
    metadataDescription: 'Google Pixel speaker quiet or crackling for media, ringtones or speakerphone? Diagnosis-led repair at Ringwood Square, typically 30 minutes where suitable.',
    intro: 'Google Pixel loudspeaker replacement addresses the lower speaker used for ringtones, media, notifications and speakerphone. We test the audio path before recommending a part.',
    guidanceIntro: 'Google Pixel loudspeaker symptoms can affect ringtones, media, notifications and speakerphone, but a blocked grille, routing or another fault can look similar.',
    cards: [
      { title: 'What the Google Pixel loudspeaker does', body: 'The lower loudspeaker plays ringtones, media, notifications and speakerphone audio. Low volume, muffled sound, intermittent output, crackling, distortion or silence across those uses can indicate a fault in this output path.', icon: 'loudspeaker' },
      { title: 'Loudspeaker, earpiece or microphone?', body: 'Normal call audio at your ear uses the upper earpiece, while the microphone controls what the other person hears. If media and ringtone are affected but normal call audio still works, the loudspeaker path is more relevant than the earpiece.', icon: 'earpiece', link: { href: '/repairs/phone/google/earpiece-speaker-replacement', label: 'Compare Google Pixel earpiece symptoms' } },
      { title: 'Safe checks and other causes', body: 'Test a ringtone and local media with Bluetooth, wired and USB-C audio disconnected. A blocked grille, dry debris, moisture, impact, audio-routing setting, app or software issue can mimic speaker failure; several affected functions can need broader diagnosis.', icon: 'clipboard' },
      { title: 'Inspection and after-repair checks', body: 'We inspect the grille, physical condition and relevant connections, then compare media, ringtone and speakerphone output. If the fault is in a connector or board-level audio circuit, loudspeaker replacement alone may not solve it.', icon: 'wrench' },
      { title: 'Price, time, warranty and preparation', body: 'Google Pixel loudspeaker replacement starts from $50 as a general service price, not a quote for every model. Your selected Pixel may show an exact price, From price or Quote on Request. A suitable repair is typically scheduled as a 30-minute repair, subject to diagnosis and parts. Eligible completed standard repairs carry a 6-month warranty. Back up important data when practical and mention drops or liquid exposure.', icon: 'check' },
    ],
    faqs: [
      { question: 'Why does my Google Pixel have no sound for media but calls still work?', answer: 'Media, ringtones and speakerphone use the lower loudspeaker path, while normal calls use the upper earpiece. Check routing and accessories first; persistent lower-speaker symptoms need inspection.' },
      { question: 'Is the Google Pixel earpiece the same as the loudspeaker?', answer: 'No. The earpiece handles normal calls at your ear, while the loudspeaker handles media, ringtones and speakerphone. If only normal calls are affected, start with the earpiece path.' },
      { question: 'How much does Google Pixel loudspeaker replacement cost?', answer: 'Google Pixel loudspeaker replacement starts from $50 as a general service starting price. Choose your Pixel for an exact price, a From price for legitimate variants, or Quote on Request when a trusted model price is unavailable.' },
      { question: 'How long does Google Pixel loudspeaker repair take?', answer: 'A suitable Google Pixel loudspeaker replacement is typically scheduled as a 30-minute repair. Diagnosis, model fitment, parts and other damage can change the confirmed timing.' },
      { question: 'Will Google Pixel loudspeaker repair erase my data?', answer: 'A standard loudspeaker replacement does not normally erase data. Back up important information when practical and disclose liquid exposure, drops or previous repairs that may affect diagnosis.' },
      { question: 'Is Google Pixel loudspeaker repair covered by a warranty?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. We confirm the completed repair scope before work begins.' },
    ],
  },
  'earpiece-speaker-replacement': {
    title: 'Google Pixel Earpiece Speaker Repair Ringwood | Ali Mobile',
    metadataDescription: 'Google Pixel calls quiet at your ear while speakerphone works? We assess the earpiece path at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'Google Pixel earpiece speaker replacement concerns the upper call receiver, not the lower loudspeaker used for media and speakerphone. We compare those audio paths before quoting.',
    guidanceIntro: 'When Google Pixel normal-call audio is low or absent but speakerphone works, the upper receiver path needs assessment—not an automatic earpiece replacement.',
    cards: [
      { title: 'Normal calls versus speakerphone', body: 'The Google Pixel earpiece is the upper call receiver used when the phone is held to your ear. Quiet, muffled, distorted or absent normal-call audio with clear speakerphone can point to that area. Media and ringtones normally use the separate lower loudspeaker.', icon: 'earpiece', link: { href: '/repairs/phone/google/loudspeaker-replacement', label: 'Compare Google Pixel loudspeaker symptoms' } },
      { title: 'Safe checks before repair', body: 'During a normal call, raise call volume, disconnect Bluetooth or wired audio, and compare speakerphone. Check whether a case or screen protector covers the top mesh; remove only dry visible debris gently with a soft brush or cloth.', icon: 'clipboard' },
      { title: 'When it is not just the earpiece', body: 'Moisture, a drop, a previous display repair, receiver mesh blockage, speaker flex or alignment issue, network quality or a board-level audio-path fault can affect calls. If callers cannot hear you, the microphone is a different diagnostic path.', icon: 'wrench' },
      { title: 'Diagnosis and verification', body: 'We compare normal-call, speakerphone and media audio, inspect the top opening and device condition, then check the affected functions after a suitable repair. We do not assume every call-audio fault needs a receiver part.', icon: 'check' },
      { title: 'Price, time, warranty and preparation', body: 'Google Pixel earpiece speaker replacement starts from $50 as a category starting price, not every model’s quote. The selected Pixel shows exact, From or Quote on Request pricing. Suitable repairs are typically scheduled for 30 minutes, subject to diagnosis and parts. Eligible completed standard repairs have a 6-month warranty. Back up data when practical and mention display work, drops or moisture.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Why can I hear Google Pixel calls on speakerphone but not through the earpiece?', answer: 'Speakerphone and the upper earpiece use different audio paths. Clear speakerphone with poor normal-call audio can point to the receiver, top mesh or its connection, but routing and other faults still need checking.' },
      { question: 'Could a Google Pixel display repair or drop affect call audio?', answer: 'Yes. The receiver sits near the display assembly, and impact or previous work can affect alignment, the flex, connector or surrounding parts. We inspect the wider symptom pattern before recommending replacement.' },
      { question: 'How much does Google Pixel earpiece speaker replacement cost?', answer: 'Google Pixel earpiece speaker replacement starts from $50 as a general service price. Select your model for its exact price, From price or Quote on Request; a final quote follows inspection.' },
      { question: 'How long does Google Pixel earpiece repair take?', answer: 'A suitable Google Pixel earpiece replacement is typically scheduled as a 30-minute repair. Model fitment, part availability and any additional fault can alter timing, which we confirm after assessment.' },
      { question: 'Will Google Pixel earpiece repair affect my data?', answer: 'A standard earpiece repair does not normally erase data. Back up important information when practical, and have the device passcode available if functional call testing requires access.' },
      { question: 'Does Google Pixel earpiece repair have a warranty?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. The confirmed repair scope is explained before work.' },
    ],
  },
  'power-button-replacement': {
    title: 'Google Pixel Power Button Replacement Melbourne | Ali Mobile',
    metadataDescription: 'Google Pixel side button stuck or unresponsive? We check button, battery and charging causes at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'Google Pixel power button replacement is for a confirmed physical side-button or flex fault. A Pixel that will not turn on does not automatically need a new button.',
    guidanceIntro: 'A Google Pixel side button can fail physically, but no-power symptoms need battery, charging, display, software and motherboard checks before a button repair is chosen.',
    cards: [
      { title: 'Physical side-button symptoms', body: 'A stuck, recessed, mushy, loose or clickless Google Pixel power button, intermittent press response, or failure to wake and lock the screen can indicate button, frame or flex damage. Impact can shift the key or damage an internal connection.', icon: 'power' },
      { title: 'No power is not proof of a button fault', body: 'A Google Pixel that will not turn on does not automatically need power-button replacement. A depleted battery, charging-port fault, black display, frozen software, liquid damage, motherboard or power-management fault can look similar. If it starts only while connected to power, battery or charging diagnosis matters. We check charging response and signs of life first.', icon: 'clipboard', link: { href: '/repairs/battery-replacement', label: 'Compare battery repair symptoms' } },
      { title: 'Safe checks and related faults', body: 'Remove a case that may hold the button down, use a compatible charger, and note vibration, sound or a computer connection despite a black screen. Long-press behaviour can be configured in Pixel settings, so an assistant or another action does not by itself prove hardware failure. Do not force or dismantle a stuck button.', icon: 'wrench', link: { href: '/repairs/charging-port-replacement', label: 'Compare charging-port symptoms' } },
      { title: 'What we inspect and test', body: 'We inspect key feel, frame alignment, flex and connection where appropriate, then test wake, lock, configured long-press behaviour and charging response. Tell us about drops, liquid exposure and previous repairs so the assessment can include other affected components.', icon: 'check' },
      { title: 'Price, time, warranty and preparation', body: 'Google Pixel power button replacement starts from $50 as a general category price; a selected Pixel may show exact, From or Quote on Request pricing. Suitable repairs are typically scheduled for 30 minutes, subject to diagnosis and parts. Eligible completed standard repairs have a 6-month warranty. Back up accessible data before the battery runs flat.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Does a Google Pixel that will not turn on need a power button replacement?', answer: 'Not necessarily. Battery, charging, display, software, liquid, motherboard or power-management faults can prevent normal startup. We check signs of life and charging response before recommending a side-button replacement.' },
      { question: 'Why does my Google Pixel side button open a different action instead of the power menu?', answer: 'That can be a configured long-press action rather than a broken button. Check the Pixel’s button and gesture settings plus on-screen power controls before assuming a hardware repair is needed.' },
      { question: 'How much does Google Pixel power button replacement cost?', answer: 'Google Pixel power button replacement starts from $50 as a general service price, not a confirmed price for every model. Choose your Pixel for an exact price, From price or Quote on Request; we confirm the final quote before work.' },
      { question: 'How long does Google Pixel power button repair take?', answer: 'A suitable Google Pixel side-button repair is typically scheduled as a 30-minute repair. Diagnosis, frame damage or parts availability can change the final time, which we explain after assessment.' },
      { question: 'What should I do before a Google Pixel power button repair?', answer: 'Back up data while the phone is still accessible, remove a case pressing the button, and tell us whether the fault followed a drop, liquid exposure or another repair. Do not force a jammed key.' },
      { question: 'Is a Google Pixel power button repair warranted?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. We confirm the repaired fault and scope before work.' },
    ],
  },
  'volume-button-replacement': {
    title: 'Google Pixel Volume Button Repair Ringwood | Ali Mobile',
    metadataDescription: 'Google Pixel volume buttons stuck or changing by themselves? We check case pressure, flex and settings at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'Google Pixel volume button replacement addresses confirmed physical Volume Up, Volume Down or button-flex faults—not every sound-level or app-setting change.',
    guidanceIntro: 'One Google Pixel volume key can fail while the other works, and self-changing volume can come from case pressure, routing or settings as well as hardware.',
    cards: [
      { title: 'One key, both keys or self-changing volume?', body: 'A Google Pixel Volume Up or Volume Down key may be stuck, loose, mushy, clickless or intermittent; either one or both can be affected. Repeated unprompted volume changes can indicate a pressed key, but do not prove a flex fault by themselves.', icon: 'volume' },
      { title: 'Safe checks before repair', body: 'Remove a tight case, inspect only visible dry debris and restart the phone. Compare call, media and ringtone volume; disconnect Bluetooth or wired accessories. Different on-screen sliders, apps, accessibility controls or audio routing can change sound without a physical-key failure.', icon: 'clipboard' },
      { title: 'Impact, liquid and internal faults', body: 'A drop can shift the frame or damage a button flex or connector. Liquid or moisture can affect the physical keys, flex, connector or other internal components. We diagnose the affected path rather than assuming every exposure requires button replacement.', icon: 'wrench', link: { href: '/repairs/phone/google/power-button-replacement', label: 'Compare Google Pixel power-button symptoms' } },
      { title: 'What we test', body: 'We check the feel and response of both buttons, on-screen volume changes, case or frame interference and whether other functions are affected. If settings, an app or a broader fault explains the symptom, button replacement may not be suitable.', icon: 'check' },
      { title: 'Price, time, warranty and preparation', body: 'Google Pixel volume button replacement starts from $50 as a general category price. A selected Pixel may show an exact price, From price or Quote on Request. A suitable repair is typically scheduled as a 30-minute repair, subject to diagnosis and parts; eligible completed standard repairs have a 6-month warranty. Back up data when practical and describe intermittent behaviour.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Why does my Google Pixel volume change by itself?', answer: 'A key held down by a case or debris can change volume, but a connected accessory, accessibility control, app, setting or software fault can also be responsible. Remove the case and compare behaviour across sound types before assuming a button fault.' },
      { question: 'Can only one Google Pixel volume button be repaired?', answer: 'Yes, one direction may fail while the other still works. We inspect both keys, frame alignment and the internal flex to confirm which part or connection needs attention.' },
      { question: 'How much does Google Pixel volume button replacement cost?', answer: 'Google Pixel volume button replacement starts from $50 as a service starting price, not every model’s final quote. Choose your Pixel to see exact, From or Quote on Request pricing before booking.' },
      { question: 'How long does Google Pixel volume button repair take?', answer: 'A suitable Google Pixel volume-button repair is typically scheduled for 30 minutes. Diagnosis, parts or related frame damage can change timing; we confirm it before work.' },
      { question: 'Can liquid exposure make Google Pixel volume keys stop working?', answer: 'Yes, moisture can affect a key, flex, connector or other internal parts. We assess the wider device condition before deciding whether button replacement alone is appropriate.' },
      { question: 'Will Google Pixel volume button repair erase data or have a warranty?', answer: 'A standard volume-button repair does not normally erase data; back up important information when practical. Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms.' },
    ],
  },
};

export const GOOGLE_PIXEL_CAMERA_LENS_CONTENT = {
  title: 'Google Pixel Camera Lens Glass Replacement Ringwood | Ali Mobile',
  metadataDescription: 'Cracked Google Pixel exterior camera glass? Fixed $50 repair at Ringwood Square, typically 30 minutes where suitable. We assess focus, housing and moisture risk.',
  intro: 'Google Pixel camera lens replacement repairs damaged protective camera lens glass for $50 where the lens-glass repair is suitable. We inspect the camera area and surrounding housing before work.',
  guidanceIntro: 'Google Pixel exterior camera glass protects the camera opening. Cracks, chips, missing glass or deep scratches need assessment before dust or moisture reaches the camera area.',
  cards: [
    { title: 'Protective camera lens glass, not the camera module', body: 'This $50 Google Pixel service replaces suitable damaged protective camera lens glass. Blurry or hazy photos can come from cracked or scratched exterior glass, but focus failure, shaking, a black image, persistent internal artifacts or sensor failure may need internal camera module diagnosis instead.' },
    { title: 'Damage and contamination checks', body: 'We inspect cracked, chipped, missing or scratched glass, the camera opening and surrounding housing. On Pixel generations with a camera bar, impact around that area may affect more than the exterior glass. Exposed openings raise dust and moisture contamination concerns; replacing outer glass will not necessarily resolve internal liquid damage.' },
    { title: 'Repair and image verification', body: 'Where lens-glass repair is suitable, we confirm model fitment, replace the exterior glass and check photo and video clarity, focus and the cleanliness of the opening. Housing damage or a deeper camera fault is explained before any different repair is approved.' },
    { title: 'Fixed price, timing and preparation', body: 'Google Pixel protective camera lens-glass replacement is fixed at $50 where suitable. It is typically scheduled as a 30-minute repair, subject to fitment, parts and diagnosis. Eligible completed standard repairs include a 6-month warranty. Back up important data when practical, remove accessories and tell us about drops or liquid exposure.' },
  ],
  faqs: [
    { question: 'Do I need Google Pixel camera lens replacement or back camera replacement?', answer: 'Camera lens replacement addresses damaged exterior protective glass. If the Google Pixel camera will not focus, shakes, shows a black image, has persistent internal artifacts or sensor failure, the internal camera module or another component may need diagnosis instead.' },
    { question: 'Can scratched Google Pixel camera glass make photos hazy?', answer: 'Yes, damage or residue on protective camera glass can haze photos or cause glare, especially around lights. Blurring can also come from the internal camera module, so we check image output before confirming lens-glass repair.' },
    { question: 'Is missing Google Pixel camera lens glass urgent?', answer: 'Missing or chipped protective glass leaves the camera opening more exposed to dust and moisture. Avoid adding liquid or pressing into the opening, and arrange an assessment; internal contamination may need a different repair.' },
    { question: 'How much is Google Pixel camera lens glass replacement?', answer: 'Google Pixel protective camera lens-glass replacement is fixed at $50 where the repair is suitable. This is separate from internal camera module replacement; we check model fitment and other damage first.' },
    { question: 'How long does Google Pixel camera lens replacement take?', answer: 'A suitable Google Pixel exterior lens-glass replacement is typically scheduled for 30 minutes. Model fitment, part availability or deeper camera-area damage can change the confirmed timing.' },
    { question: 'Will Google Pixel camera lens repair affect my data or warranty?', answer: 'Exterior lens-glass repair does not normally erase data; back up important information when practical. Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms.' },
  ],
} as const;
