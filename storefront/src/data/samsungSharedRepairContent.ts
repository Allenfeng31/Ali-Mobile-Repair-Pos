import type { VirtualPhoneRepairSlug } from '@/lib/virtualPhoneRepairs';

type Link = Readonly<{ href: string; label: string }>;
type Card = Readonly<{ title: string; body: string; icon: string; link?: Link }>;
type Faq = Readonly<{ question: string; answer: string }>;

type SamsungRepairContent = Readonly<{
  title: string;
  metadataDescription: string;
  intro: string;
  guidanceIntro: string;
  cards: readonly Card[];
  faqs: readonly Faq[];
}>;

export const SAMSUNG_SHARED_REPAIR_CONTENT: Readonly<Record<VirtualPhoneRepairSlug, SamsungRepairContent>> = {
  'loudspeaker-replacement': {
    title: 'Samsung Loudspeaker Replacement Melbourne | Ali Mobile',
    metadataDescription: 'Samsung speaker quiet or crackling for music, ringtones or speakerphone? Diagnosis-led loudspeaker repair at Ringwood Square, typically 30 minutes where suitable.',
    intro: 'Samsung loudspeaker replacement addresses the bottom speaker used for ringtones, music, notifications and speakerphone. We check the audio path before recommending a part.',
    guidanceIntro: 'A quiet or silent Samsung loudspeaker is not always a failed speaker. Compare media, ringtone and speakerphone output before choosing a repair.',
    cards: [
      { title: 'What the Samsung loudspeaker does', body: 'The bottom loudspeaker plays music, video, ringtones, notifications and speakerphone audio. Low volume, muffled sound, crackling, distortion or silence across those uses can indicate a fault in this output path.', icon: 'loudspeaker' },
      { title: 'Loudspeaker, earpiece or microphone?', body: 'Normal call audio at your ear uses the upper earpiece, while the microphone controls what the other person hears. Clear media with quiet normal calls points away from the bottom loudspeaker; we test each path separately.', icon: 'earpiece', link: { href: '/repairs/phone/samsung/earpiece-speaker-replacement', label: 'Compare Samsung earpiece symptoms' } },
      { title: 'Safe checks and other causes', body: 'Test a ringtone and local media with Bluetooth and wired audio disconnected. A blocked grille, dry debris, moisture, recent drop, audio-routing setting, app or software issue can mimic speaker failure; liquid damage or several failed functions may need broader diagnosis.', icon: 'clipboard' },
      { title: 'Inspection and after-repair checks', body: 'We inspect the grille, physical condition and connections, then compare media, ringtone and speakerphone output. If the fault is in a connector or board-level circuit, loudspeaker replacement alone may not solve it. We confirm the suitable path before work.', icon: 'wrench' },
      { title: 'Price, time, warranty and preparation', body: 'Typical price range: $50–$150 for Samsung loudspeaker replacement, depending on the Galaxy model and part required. Your selected model may show a current listed price or Quote on Request; secondary damage can change the repair needed. Suitable repairs are typically scheduled for 30 minutes; diagnosis and parts can change timing. Eligible completed standard repairs carry a 6-month warranty. Back up important data when practical and mention drops or liquid exposure.', icon: 'check' },
    ],
    faqs: [
      { question: 'How do I know if my Samsung loudspeaker is faulty?', answer: 'A fault is more likely when ringtones, local media and speakerphone are all quiet, distorted or silent after audio routing and volume checks. Debris, moisture, software or a board fault can produce similar symptoms, so inspection confirms the cause.' },
      { question: 'Is the Samsung earpiece the same as the loudspeaker?', answer: 'No. The earpiece handles normal calls at your ear; the bottom loudspeaker handles media, ringtones and speakerphone. If only normal calls are affected, start with the earpiece symptoms instead.' },
      { question: 'How much does Samsung loudspeaker replacement cost?', answer: 'Typical Samsung loudspeaker repairs cost $50–$150, depending on the Galaxy model and required part. Select your model to check its current listed price where available. If no fixed price is listed, we confirm a quote before repair; other damage may require different work.' },
      { question: 'How long does a Samsung loudspeaker repair take?', answer: 'A suitable Samsung loudspeaker replacement is typically scheduled as a 30-minute repair. Diagnosis, model-specific parts and other damage can change the final timing, which we confirm before work.' },
      { question: 'Will Samsung loudspeaker repair erase my data?', answer: 'A standard loudspeaker replacement does not normally erase phone data. Back up important data when practical and tell the technician about liquid exposure, drops or previous repairs that may affect diagnosis.' },
      { question: 'Is Samsung loudspeaker repair covered by a warranty?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. We confirm the completed repair scope before work begins.' },
    ],
  },
  'earpiece-speaker-replacement': {
    title: 'Samsung Earpiece Speaker Repair Ringwood | Ali Mobile',
    metadataDescription: 'Samsung calls quiet at your ear while speakerphone works? We check the earpiece and mesh at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'Samsung earpiece speaker replacement concerns the upper call receiver, not the bottom speaker used for music and speakerphone. We compare both audio paths before quoting.',
    guidanceIntro: 'When Samsung normal-call audio is low or absent but speakerphone works, the upper receiver path needs assessment—not an automatic earpiece replacement.',
    cards: [
      { title: 'Normal calls versus speakerphone', body: 'The Samsung earpiece plays a caller’s voice when the phone is held to your ear. Quiet, muffled, distorted or absent normal-call audio with clear speakerphone can point to the upper receiver area. Media and ringtones usually use the separate bottom loudspeaker.', icon: 'earpiece', link: { href: '/repairs/phone/samsung/loudspeaker-replacement', label: 'Compare Samsung loudspeaker symptoms' } },
      { title: 'Safe checks before repair', body: 'During a normal call, raise call volume, disconnect Bluetooth or wired audio, and compare speakerphone. Check whether a case or screen protector covers the top mesh; remove only dry visible debris gently with a soft brush or cloth.', icon: 'clipboard' },
      { title: 'When it is not just the earpiece', body: 'Moisture, a drop, a previous screen repair, receiver mesh blockage, flex or connector damage, proximity-related behaviour, network quality or a board-level fault can affect calls. If callers cannot hear you, the microphone is a different diagnostic path.', icon: 'wrench' },
      { title: 'Diagnosis and verification', body: 'We compare normal-call, speakerphone and media audio, inspect the top opening and device condition, then check the affected functions after a suitable repair. We do not assume every call-audio fault needs a receiver part.', icon: 'check' },
      { title: 'Price, time, warranty and preparation', body: 'Typical price range: $50–$150 for Samsung earpiece speaker replacement, depending on the Galaxy model and part required. Select a model for its current listed price or Quote on Request; secondary damage can change the repair needed. Suitable repairs are typically scheduled for 30 minutes, subject to diagnosis and parts. Eligible completed standard repairs have a 6-month warranty. Back up data when practical and mention recent screen work, drops or moisture.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Why can I hear Samsung calls on speakerphone but not at my ear?', answer: 'Speakerphone and the upper earpiece use different audio paths. Clear speakerphone with poor normal-call audio can point to the receiver, top mesh or its connection, but routing and other faults still need checking.' },
      { question: 'Could a screen repair or drop affect Samsung call audio?', answer: 'Yes. The receiver sits near the display assembly, and impact or previous work can affect its flex, connector or surrounding parts. We inspect the wider symptom pattern before recommending replacement.' },
      { question: 'How much does Samsung earpiece speaker replacement cost?', answer: 'Typical Samsung earpiece speaker repairs cost $50–$150, depending on the Galaxy model and required part. Select your model to check its current listed price where available. If no fixed price is listed, we confirm a quote before repair; other damage may require different work.' },
      { question: 'How long does Samsung earpiece repair take?', answer: 'A suitable Samsung earpiece replacement is typically scheduled for 30 minutes. Model fitment, part availability and any additional fault can alter timing, so we confirm it after assessment.' },
      { question: 'Will earpiece repair affect my Samsung data?', answer: 'A standard earpiece repair does not normally erase data. Back up important information when practical, and provide the device passcode only if functional call testing requires access.' },
      { question: 'Does Samsung earpiece repair have a warranty?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. The confirmed repair scope is explained before work.' },
    ],
  },
  'power-button-replacement': {
    title: 'Samsung Power Button Replacement Melbourne | Ali Mobile',
    metadataDescription: 'Samsung side key stuck or unresponsive? We check button, battery and charging causes at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'Samsung power button replacement is for a confirmed physical side-key or flex fault. A phone that will not turn on does not automatically need a new button.',
    guidanceIntro: 'A Samsung side key can fail physically, but no-power symptoms require battery, charging, display and board checks before a button repair is chosen.',
    cards: [
      { title: 'Physical side-key symptoms', body: 'A stuck, mushy, loose or clickless Samsung side key, intermittent press response, or failure to wake and lock the screen can indicate button, frame or flex damage. Impact can shift the key or damage an internal connection.', icon: 'power' },
      { title: 'No power is not proof of a button fault', body: 'A Samsung phone that will not power on does not automatically need power-button replacement. A depleted battery, charging-port fault, black display, frozen software, liquid damage or board-level fault can look similar. If it starts only while connected to a charger, battery or charging diagnosis matters. We check charging response and signs of life first.', icon: 'clipboard', link: { href: '/repairs/battery-replacement', label: 'Compare battery repair symptoms' } },
      { title: 'Safe checks and related faults', body: 'Remove a case that may hold the key down, use a compatible charger, and note vibration, sound or connection despite a black screen. Long-press actions may be configured to open an assistant instead of the power menu. Do not force or dismantle a stuck button.', icon: 'wrench', link: { href: '/repairs/charging-port-replacement', label: 'Compare charging-port symptoms' } },
      { title: 'What we inspect and test', body: 'We inspect key feel, frame alignment, flex and connection where appropriate, then test wake, lock, power-menu behaviour and charging response. Tell us about drops, moisture and previous repairs so the assessment can include other affected components.', icon: 'check' },
      { title: 'Price, time, warranty and preparation', body: 'Typical price range: $50–$150 for Samsung power button replacement, depending on the Galaxy model and part required. Select a model for its current listed price or Quote on Request; secondary damage can change the repair needed. Suitable repairs are typically scheduled for 30 minutes, subject to diagnosis and parts. Eligible completed standard repairs have a 6-month warranty. Back up accessible data before the battery runs flat.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Does a Samsung phone that will not turn on need a power button?', answer: 'Not necessarily. Battery, charging, display, software, liquid or board-level faults can prevent normal startup. We check signs of life and charging response before recommending a side-key replacement.' },
      { question: 'Why does my Samsung side key open an assistant instead of the power menu?', answer: 'That can be a configured long-press action rather than a broken button. Check the model’s side-key settings and on-screen power controls before assuming a hardware repair is needed.' },
      { question: 'How much does Samsung power button replacement cost?', answer: 'Typical Samsung power button repairs cost $50–$150, depending on the Galaxy model and required part. Select your model to check its current listed price where available. If no fixed price is listed, we confirm a quote before repair; other damage may require different work.' },
      { question: 'How long does Samsung power button repair take?', answer: 'A suitable Samsung side-key repair is typically scheduled for 30 minutes. Diagnosis, frame damage or parts availability can change the final time, which we explain after assessment.' },
      { question: 'What should I do before a Samsung power button repair?', answer: 'Back up data while the phone is still accessible, remove a case pressing the key, and tell us if the fault followed a drop, moisture or another repair. Do not force a jammed button.' },
      { question: 'Is a Samsung power button repair warranted?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms. We confirm the repaired fault and scope before work.' },
    ],
  },
  'volume-button-replacement': {
    title: 'Samsung Volume Button Repair Ringwood | Ali Mobile',
    metadataDescription: 'Samsung volume keys stuck or changing by themselves? We check case pressure, flex and settings at Ringwood Square; suitable repairs are typically 30 minutes.',
    intro: 'Samsung volume button replacement addresses confirmed physical volume-up, volume-down or button-flex faults—not every change in sound level or app setting.',
    guidanceIntro: 'One Samsung volume key can fail while the other works, and self-changing volume can come from case pressure or settings as well as hardware.',
    cards: [
      { title: 'One key, both keys or self-changing volume?', body: 'A Samsung volume-up or volume-down key may be stuck, loose, mushy, clickless or intermittent; either one or both can be affected. Repeated unprompted volume changes can indicate a pressed key, but do not prove a flex fault by themselves.', icon: 'volume' },
      { title: 'Safe checks before repair', body: 'Remove a tight case, inspect only visible dry debris and restart the phone. Compare call, media and ringtone volume; disconnect Bluetooth or wired accessories. Different on-screen sliders, apps, mute or accessibility settings can change sound without a physical-key failure.', icon: 'clipboard' },
      { title: 'Impact, liquid and internal faults', body: 'A drop can shift the frame or damage a button flex or connector. Liquid or moisture can affect the physical keys, flex, connector or other internal components. We diagnose the affected path rather than assuming every exposure requires button replacement.', icon: 'wrench' },
      { title: 'What we test', body: 'We check the feel and response of both buttons, on-screen volume changes, case or frame interference and whether other functions are affected. If settings, an app or a broader fault explains the symptom, button replacement may not be suitable.', icon: 'check' },
      { title: 'Price, time, warranty and preparation', body: 'Typical price range: $50–$150 for Samsung volume button replacement, depending on the Galaxy model and part required. Select a model for its current listed price or Quote on Request; secondary damage can change the repair needed. Suitable repairs are typically scheduled for 30 minutes, subject to diagnosis and parts; eligible completed standard repairs have a 6-month warranty. Back up data when practical and describe intermittent behaviour.', icon: 'clipboard' },
    ],
    faqs: [
      { question: 'Why is my Samsung volume changing by itself?', answer: 'A key held down by a case or debris can change volume, but a connected accessory, app, setting or software fault can also be responsible. Remove the case and compare behaviour across sound types before assuming a button fault.' },
      { question: 'Can only one Samsung volume button be repaired?', answer: 'Yes, one direction may fail while the other still works. We inspect both keys, frame alignment and the internal flex to confirm which part or connection needs attention.' },
      { question: 'How much does Samsung volume button replacement cost?', answer: 'Typical Samsung volume button repairs cost $50–$150, depending on the Galaxy model and required part. Select your model to check its current listed price where available. If no fixed price is listed, we confirm a quote before repair; other damage may require different work.' },
      { question: 'How long does Samsung volume button repair take?', answer: 'A suitable Samsung volume-button repair is typically scheduled for 30 minutes. Diagnosis, parts or related frame damage can change timing; we confirm it before work.' },
      { question: 'Can liquid exposure make Samsung volume keys stop working?', answer: 'Yes, moisture can affect a key, flex, connector or other internal parts. We assess the wider device condition before deciding whether button replacement alone is appropriate.' },
      { question: 'Will Samsung volume button repair erase data or have a warranty?', answer: 'A standard volume-button repair does not normally erase data; back up important information when practical. Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms.' },
    ],
  },
};

export const SAMSUNG_CAMERA_LENS_CONTENT = {
  title: 'Samsung Camera Lens Glass Replacement | Ringwood, Melbourne',
  metadataDescription: 'Cracked Samsung rear camera lens glass? Fixed $50 repair at Ringwood Square, typically 30 minutes where suitable. We check focus, housing and moisture risk.',
  intro: 'Samsung camera lens replacement repairs damaged protective rear-camera glass for $50 where the lens-glass repair is suitable. We check the camera module and surrounding housing before work.',
  guidanceIntro: 'Samsung rear camera lens glass protects the camera opening. Cracks, chips, missing glass or deep scratches need assessment before dust or moisture reaches the camera area.',
  cards: [
    { title: 'Protective lens glass, not the camera module', body: 'This $50 Samsung service replaces suitable damaged outer rear-camera lens glass. Blurry or hazy photos can come from cracked or scratched glass, but focus failure, shaking, a black preview or an internal camera failure may require camera-module diagnosis instead. Camera Lens Replacement is not Back Camera Module Replacement.' },
    { title: 'Damage and contamination checks', body: 'We inspect cracked, chipped, missing or scratched glass, the camera opening and surrounding housing. Exposed openings raise dust and moisture contamination concerns; cleaning or replacing outer glass will not necessarily resolve internal liquid damage.' },
    { title: 'Repair and image verification', body: 'Where lens-glass repair is suitable, we confirm model fitment, replace the outer glass and check photo and video clarity, focus and the cleanliness of the opening. Housing damage or a deeper camera fault is explained before any different repair is approved.' },
    { title: 'Fixed price, timing and preparation', body: 'Samsung protective camera lens-glass replacement is fixed at $50 where suitable. It is typically scheduled as a 30-minute repair, subject to fitment, parts and diagnosis. Eligible completed standard repairs include a 6-month warranty. Back up important data when practical, remove accessories and tell us about drops or liquid exposure.' },
  ],
  faqs: [
    { question: 'Do I need Samsung camera lens replacement or back camera replacement?', answer: 'Camera lens replacement addresses damaged outer protective glass. If the Samsung camera will not focus, shakes, shows a black image or has an internal failure, the back camera module or another component may need diagnosis instead.' },
    { question: 'Can a scratched Samsung rear lens make photos blurry?', answer: 'Yes, damage or residue on the protective glass can haze photos or cause glare, especially around lights. Blurring can also come from the camera module, so we check image output before confirming lens-glass repair.' },
    { question: 'Is missing Samsung camera lens glass urgent?', answer: 'Missing or chipped protective glass leaves the camera opening more exposed to dust and moisture. Avoid adding liquid or pressing into the opening, and arrange an assessment; internal contamination may need a different repair.' },
    { question: 'How much is Samsung camera lens glass replacement?', answer: 'Samsung protective rear-camera lens-glass replacement is fixed at $50 where the repair is suitable. This is separate from back camera module replacement; we check model fitment and other damage first.' },
    { question: 'How long does Samsung camera lens replacement take?', answer: 'A suitable Samsung outer lens-glass replacement is typically scheduled for 30 minutes. Model fitment, part availability or deeper camera-area damage can change the confirmed timing.' },
    { question: 'Will Samsung camera lens repair affect my data or warranty?', answer: 'Outer lens-glass repair does not normally erase data; back up important information when practical. Eligible completed standard repairs include a 6-month warranty under Ali Mobile & Repair’s normal terms.' },
  ],
} as const;
