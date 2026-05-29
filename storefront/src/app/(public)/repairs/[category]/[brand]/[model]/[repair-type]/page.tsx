import React from 'react';
import { REPAIR_TYPES } from '@/data/seo-data';
import { fetchRepairCatalog, fetchRepairDetails } from '@/lib/api';
import { slugify, formatDynamicParam } from '@/lib/inventoryUtils';
import { RepairServiceSchema } from '@/components/seo/SchemaOrg';
import { Zap, ShieldCheck, CheckCircle, Droplet, Battery, Smartphone, Plug, Wrench, ShieldAlert, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import ChatNowButton from '@/components/ChatNowButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReviewsSection from '@/components/ReviewsSection';
import FaqAccordion from '@/components/FaqAccordion';
import TechnicianWorkbenchProcess from './TechnicianWorkbenchProcess';
import { generateFaqs } from './repairFaqs';

export const dynamic = 'force-dynamic';

function getRepairIcon(slug: string, size = 48) {
  if (slug.includes('water')) return <Droplet size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('battery')) return <Battery size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('port')) return <Plug size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('screen') || slug.includes('glass') || slug.includes('display')) return <Smartphone size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  return <Wrench size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
}

interface RepairPageProps {
  params: Promise<{
    category: string;
    brand: string;
    model: string;
    'repair-type': string;
  }>;
}

interface RepairTypeSeoPocket {
  quickAnswer: string;
  workbenchHeadings?: {
    options: string;
    diagnostics: string;
    symptoms: string;
    outcomes: string;
  };
  repairOptions: Array<{
    name: string;
    shortDescription: string;
    bestFor: string;
    notes: string;
  }>;
  commonProblems: Array<{
    title: string;
    description: string;
  }>;
  diagnosticSteps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

const IPHONE_13_SCREEN_REPLACEMENT_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 screen replacement in Ringwood? Ali Mobile & Repair checks cracked glass, OLED faults, touch issues, frame fit, Face ID area condition, and display option availability before quoting.",
  workbenchHeadings: {
    options: "Which screen path fits this iPhone 13?",
    diagnostics: "What do we test before screen replacement?",
    symptoms: "Which display symptoms matter most?",
    outcomes: "What can affect the screen result?",
  },
  repairOptions: [
    {
      name: "Standard display path",
      shortDescription:
        "A cost-conscious iPhone 13 screen replacement option for cracked glass, touch faults, or a display that needs a practical repair.",
      bestFor:
        "Customers who want the phone working again cleanly without choosing the highest display tier.",
      notes:
        "We still test brightness, touch response, speaker mesh alignment, camera area fit, and the frame edge before handover.",
    },
    {
      name: "Premium OLED path",
      shortDescription:
        "A higher-grade OLED option for customers who care about deeper blacks, smoother viewing, and stronger colour consistency.",
      bestFor:
        "Customers who use their iPhone 13 heavily for photos, maps, work apps, videos, and daily messaging.",
      notes:
        "A bent frame can stress a fresh OLED panel, so we inspect the housing before fitting a premium display.",
    },
    {
      name: "Diagnosis before display fitting",
      shortDescription:
        "Bench testing for black screen, green lines, flicker, partial touch failure, pressure marks, or uncertain impact damage.",
      bestFor:
        "Phones where the display fault may be linked to frame damage, liquid exposure, camera area damage, or another internal fault.",
      notes:
        "If a screen assembly will not solve the issue, we explain the next likely fault before any extra work.",
    },
  ],
  commonProblems: [
    {
      title: "Cracked glass with working touch",
      description:
        "The phone may still unlock and swipe, but glass flakes, lifted corners, and pressure on the OLED layer can worsen after continued use.",
    },
    {
      title: "Green lines, flicker, or black screen",
      description:
        "OLED faults can appear after a drop even when the outside glass is not badly shattered. We test display output before quoting.",
    },
    {
      title: "Touch dead zones",
      description:
        "A damaged digitizer can leave parts of the display unresponsive. We test touch across the full panel before and after fitting.",
    },
    {
      title: "Top sensor and Face ID area risk",
      description:
        "Impact around the earpiece, front camera, or sensor area can affect Face ID-related behaviour. We inspect that area before repair.",
    },
    {
      title: "Frame bend or lifted screen edge",
      description:
        "A small housing bend can stop a replacement display from sitting cleanly, so frame fit is checked before the screen is installed.",
    },
    {
      title: "True Tone and display message checks",
      description:
        "Where supported, display data and True Tone behaviour are checked carefully. Some iOS display messages can depend on part type and device pairing.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Inspect glass, OLED, and housing fit",
      description:
        "We check cracks, display lines, pressure marks, lifted corners, frame bends, and whether the device is safe to open.",
    },
    {
      step: "02",
      title: "Test touch, Face ID area, and sensors",
      description:
        "Before quoting, we test touch response, front camera area, proximity behaviour, earpiece mesh, and visible liquid indicators.",
    },
    {
      step: "03",
      title: "Confirm display tier and limitations",
      description:
        "We explain the available screen option, part availability, warranty limits, iOS display message considerations, and expected repair time before work begins.",
    },
    {
      step: "04",
      title: "Final handover checks",
      description:
        "After fitting, we test brightness, colour, touch, charging, cameras, speaker, microphone, buttons, and normal operation before return.",
    },
  ],
  faq: [
    {
      question: "How long does iPhone 13 screen replacement take in Ringwood?",
      answer:
        "If the correct display assembly is in stock and there is no hidden frame or liquid damage, iPhone 13 screen replacement is usually completed in under 1 hour.",
    },
    {
      question: "Can you fix an iPhone 13 with green lines, flicker, or a black screen?",
      answer:
        "Yes. Green lines, flicker, black display, and touch dead zones are common OLED or digitizer symptoms. We test the phone first to confirm whether a screen assembly is the right repair.",
    },
    {
      question: "Do you check Face ID before replacing the iPhone 13 screen?",
      answer:
        "Yes. We check the Face ID area, front camera area, proximity behaviour, and earpiece mesh condition before repair because impact around the top of the display can affect those parts.",
    },
    {
      question: "Will True Tone still work after an iPhone 13 screen replacement?",
      answer:
        "Where supported, we check display data and True Tone behaviour during the repair process. The result can depend on the display option, device condition, and whether the original screen data is readable.",
    },
    {
      question: "Will my iPhone 13 still be water resistant after screen replacement?",
      answer:
        "We clean old adhesive and reseal carefully, but factory water resistance cannot be guaranteed after any phone has been opened. Keep the phone away from water after repair.",
    },
    {
      question: "Do I need to book before visiting for iPhone 13 screen replacement?",
      answer:
        "Booking helps us prepare the right display option and gives you priority at the repair desk. Walk-ins are welcome, but part availability can vary.",
    },
  ],
};

const IPHONE_13_BATTERY_REPLACEMENT_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 battery replacement in Ringwood? Ali Mobile & Repair checks battery health, shutdown behaviour, swelling risk, charge draw, iOS battery message expectations, and post-repair capacity calibration before handover.",
  workbenchHeadings: {
    options: "Which battery service path fits this iPhone 13?",
    diagnostics: "What do we test before battery replacement?",
    symptoms: "Which battery symptoms matter most?",
    outcomes: "What can affect battery calibration?",
  },
  repairOptions: [
    {
      name: "Battery health diagnosis",
      shortDescription:
        "We check Battery Health, cycle behaviour, unexpected shutdowns, heat, swelling signs, and charge acceptance before opening the iPhone 13.",
      bestFor:
        "Customers seeing fast drain, low battery health, sudden power drops, slow charging, or a phone that no longer lasts through the day.",
      notes:
        "A charging-port or board issue can look like battery failure, so we test the power path before quoting the replacement.",
    },
    {
      name: "Model-matched battery replacement",
      shortDescription:
        "We fit a battery matched to the iPhone 13 power requirements and explain realistic capacity expectations before the repair starts.",
      bestFor:
        "Customers who want stable daily runtime without inflated capacity claims or unclear part behaviour.",
      notes:
        "Recent iPhones can show iOS battery messages after replacement depending on part pairing and system history.",
    },
    {
      name: "Calibration and handover testing",
      shortDescription:
        "After fitting, we confirm boot stability, cable charging, charging draw, percentage reporting, and practical calibration guidance.",
      bestFor:
        "Customers who want the phone tested before pickup rather than just having a part installed.",
      notes:
        "Battery percentage and health reporting can settle over the next few charge cycles after service.",
    },
  ],
  commonProblems: [
    {
      title: "Fast drain or low Battery Health",
      description:
        "A worn iPhone 13 battery can drop percentage quickly, struggle under load, or show service messages in Battery Health.",
    },
    {
      title: "Unexpected shutdowns",
      description:
        "If the battery can no longer hold stable voltage, the phone may shut down even when the displayed percentage is not empty.",
    },
    {
      title: "Swelling or lifted display risk",
      description:
        "Battery swelling can press against the display and frame. We check for pressure signs before the phone is opened.",
    },
    {
      title: "Charging fault mimic",
      description:
        "Lint, charging-port wear, cable issues, or board faults can mimic battery failure, so charging behaviour is tested first.",
    },
    {
      title: "iOS battery message behaviour",
      description:
        "An iPhone 13 may show a battery part message after replacement depending on pairing history, even when charging and runtime are normal.",
    },
    {
      title: "Capacity reading settle time",
      description:
        "Battery percentage and health reporting can take a few charge cycles to settle after service, so we explain what to expect at pickup.",
    },
    {
      title: "Heat or board-level power draw",
      description:
        "If the phone still drains quickly after a known-good battery, extra heat or board-level current draw may be the next diagnostic path.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Battery Health and symptom check",
      description:
        "We review Battery Health, service messages, shutdown behaviour, heat, swelling signs, and customer-reported runtime issues.",
    },
    {
      step: "02",
      title: "Charging path validation",
      description:
        "We test cable fit, charge draw, adapter response, and whether the fault points to battery wear or another power-path issue.",
    },
    {
      step: "03",
      title: "iOS message explanation",
      description:
        "Before fitting, we explain how iOS battery part messages can appear on iPhone 13 models depending on part pairing and device history.",
    },
    {
      step: "04",
      title: "Capacity calibration handover",
      description:
        "After replacement, we test stable charging and explain the charge-cycle behaviour customers may see while the battery reading settles.",
    },
  ],
  faq: [
    {
      question: "Will my iPhone 13 show an 'Unknown Part' warning after a battery replacement at Ali Mobile Ringwood?",
      answer:
        "Some iPhone 13 devices can show an iOS battery message after battery replacement because Apple pairs certain parts to the phone. We explain the expected message behaviour before repair. The phone can still charge, run, and be tested normally after service.",
    },
    {
      question: "How does Ali Mobile handle the iPhone 13 battery health percentage calibration?",
      answer:
        "We test charge draw, boot stability, and battery reporting after fitting. Battery percentage and health readings can settle over the next few charge cycles, so we give clear pickup guidance for charging, draining, and rechecking the reading.",
    },
    {
      question: "Do you use high-capacity cells for iPhone 13 battery service in Ringwood?",
      answer:
        "We use premium, model-matched iPhone 13 battery cells selected for stable output and safe fit rather than exaggerated capacity labels. If a higher-capacity option is available, we explain the trade-offs before you approve the repair.",
    },
    {
      question: "Can Ali Mobile replace my iPhone 13 battery the same day in Ringwood?",
      answer:
        "Yes, most iPhone 13 battery replacements are completed the same day at Ringwood Square when the correct battery is in stock and there is no hidden liquid, charging-port, or board damage.",
    },
    {
      question: "What battery symptoms should I check before visiting?",
      answer:
        "Fast drain, sudden shutdowns, heat, swelling, slow charging, and Battery Health service messages are common signs. We still test first because charging-port and board faults can look like battery failure.",
    },
  ],
};

const IPHONE_13_CHARGING_PORT_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 charging port repair in Ringwood? Ali Mobile & Repair checks lint blockage, Lightning tail-plug wear, charge draw, microphone routing, speaker behaviour, data connection, and accessory detection before quoting.",
  workbenchHeadings: {
    options: "Which charging-port path fits this iPhone 13?",
    diagnostics: "What do we test before port repair?",
    symptoms: "Which charging symptoms matter most?",
    outcomes: "What can affect charging-port results?",
  },
  repairOptions: [
    {
      name: "Lint clean and cable-seat check",
      shortDescription:
        "We inspect the Lightning socket for compacted lint, debris, corrosion, or a cable that no longer seats fully.",
      bestFor:
        "Phones that only charge at an angle, feel loose when plugged in, or started failing after pocket lint built up.",
      notes:
        "If cleaning solves the fault, we do not push a full flex replacement.",
    },
    {
      name: "Tail-plug flex replacement",
      shortDescription:
        "If the port pins, flex cable, or internal connector path has failed, we quote a full charging-port assembly repair.",
      bestFor:
        "Phones with worn pins, liquid residue, no wired charging, intermittent data connection, or microphone issues linked to the lower assembly.",
      notes:
        "We handle the lower assembly carefully because charging, microphone, speaker, and accessory behaviour can overlap.",
    },
    {
      name: "Board-level power diagnosis",
      shortDescription:
        "When a new port will not solve the issue, we explain the likely charging IC or board-level path before extra work.",
      bestFor:
        "Phones that do not respond to known-good cables, batteries, or port assemblies.",
      notes:
        "Micro-soldering work is quoted separately after the port-level fault is ruled out.",
    },
  ],
  commonProblems: [
    {
      title: "Cable only works at one angle",
      description:
        "This is often lint or worn Lightning contacts. We inspect the socket before recommending a replacement.",
    },
    {
      title: "No wired charging",
      description:
        "A failed tail-plug flex, battery issue, cable fault, or board-level charging fault can all cause no-charge behaviour.",
    },
    {
      title: "Computer does not detect the phone",
      description:
        "Data connection is validated because a phone can charge while still failing USB data communication.",
    },
    {
      title: "Microphone or accessory faults",
      description:
        "Lower assembly faults can affect microphone routing and compatible Lightning accessory detection.",
    },
    {
      title: "Liquid or corrosion in the port",
      description:
        "Green residue, blackened pins, or moisture history can change the repair from cleaning to replacement or board assessment.",
    },
    {
      title: "Charging IC or board-level failure",
      description:
        "If port and battery tests pass but charging remains unstable, a board-level charging path may need micro-soldering diagnosis.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Inspect socket and cable fit",
      description:
        "We check debris, pin condition, cable seating depth, corrosion, and whether known-good cables behave differently.",
    },
    {
      step: "02",
      title: "Measure charging response",
      description:
        "We test charge draw, adapter response, battery state, and whether the fault follows the port, battery, or board.",
    },
    {
      step: "03",
      title: "Validate audio and data functions",
      description:
        "Microphones, speaker behaviour, data connection, and supported Lightning accessories are checked before handover.",
    },
    {
      step: "04",
      title: "Explain replacement or board path",
      description:
        "If cleaning is not enough, we quote the flex replacement or explain why board-level work is the next step.",
    },
  ],
  faq: [
    {
      question: "Does my iPhone 13 charging port need cleaning or replacement?",
      answer:
        "Not always. Many iPhone 13 charging issues are caused by compacted lint that stops the cable seating. We inspect and clean the port first where safe, then quote flex replacement only if the pins or assembly are damaged.",
    },
    {
      question: "Can you replace an iPhone 13 charging port the same day in Ringwood?",
      answer:
        "Most iPhone 13 charging port repairs can be completed the same day when the part is available and the fault is limited to the lower port assembly.",
    },
    {
      question: "Do you test data connection after iPhone 13 charging port repair?",
      answer:
        "Yes. We test wired charging, cable fit, USB data connection, microphone behaviour, speaker output, and compatible Lightning accessory detection before pickup.",
    },
    {
      question: "What if the iPhone 13 charging fault is board-level?",
      answer:
        "If cleaning or flex replacement will not solve the charging issue, we explain the likely board-level fault and micro-soldering path before any extra work is approved.",
    },
  ],
};

const IPHONE_13_BACK_HOUSING_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 back glass or rear housing repair in Ringwood? Ali Mobile & Repair checks cracked rear glass, camera ring fit, wireless charging coil protection, MagSafe alignment, and frame straightness before bonding.",
  workbenchHeadings: {
    options: "Which rear-housing path fits this iPhone 13?",
    diagnostics: "What do we inspect before rear repair?",
    symptoms: "Which back-glass symptoms matter most?",
    outcomes: "What can affect rear-glass alignment?",
  },
  repairOptions: [
    {
      name: "Rear glass replacement path",
      shortDescription:
        "For cracked rear glass with a usable frame, we focus on controlled removal, adhesive cleanup, and clean rear panel bonding.",
      bestFor:
        "Phones with cracked rear glass but stable side rails, working cameras, and no severe housing bend.",
      notes:
        "We protect the MagSafe and wireless charging coil area throughout the repair.",
    },
    {
      name: "Housing condition assessment",
      shortDescription:
        "If the frame is bent or crushed, we check whether rear glass alone will sit correctly before quoting.",
      bestFor:
        "Phones with corner dents, lifted back glass, camera ring gaps, or frame distortion after impact.",
      notes:
        "A bent frame can cause lifting or uneven bonding if it is ignored.",
    },
    {
      name: "Camera and coil validation",
      shortDescription:
        "After repair, we check camera ring seating, wireless charging, MagSafe alignment, buttons, and frame edges.",
      bestFor:
        "Customers who want a clean cosmetic finish plus functional wireless charging checks.",
      notes:
        "Existing impact damage to the coil or camera area is explained before final repair approval.",
    },
  ],
  commonProblems: [
    {
      title: "Cracked rear glass",
      description:
        "Broken back glass can shed sharp flakes and allow dust or moisture into the rear housing area.",
    },
    {
      title: "Wireless charging inconsistency",
      description:
        "Impact near the MagSafe coil can affect wireless charging, so we test it before and after repair.",
    },
    {
      title: "Camera ring gaps",
      description:
        "Cracks around the camera island need careful cleanup so the replacement panel sits cleanly.",
    },
    {
      title: "Frame bend or crushed corner",
      description:
        "A small housing bend can stop the rear panel from bonding flat or cause later lifting.",
    },
    {
      title: "Adhesive channel contamination",
      description:
        "Old adhesive, glass dust, and impact residue must be cleared for a stable rear bond.",
    },
    {
      title: "MagSafe alignment sensitivity",
      description:
        "Wireless charging and MagSafe behaviour depend on the coil area staying protected and correctly aligned.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Inspect rear glass and frame",
      description:
        "We check cracks, lifted corners, camera area damage, side rail bends, and whether the phone is safe to open.",
    },
    {
      step: "02",
      title: "Protect coil and camera area",
      description:
        "The wireless charging coil, MagSafe area, camera rings, and rear microphone area are handled carefully during removal.",
    },
    {
      step: "03",
      title: "Clean and align before bonding",
      description:
        "We clear adhesive channels and glass residue, then check rear panel fit before final bonding.",
    },
    {
      step: "04",
      title: "Final function checks",
      description:
        "Wireless charging, camera fit, button feel, frame edges, and normal handling are checked before return.",
    },
  ],
  faq: [
    {
      question: "Can you repair cracked iPhone 13 back glass in Ringwood?",
      answer:
        "Yes. We handle iPhone 13 rear glass and back housing repair with controlled removal, adhesive cleanup, camera ring checks, and final frame alignment before handover.",
    },
    {
      question: "Will iPhone 13 back glass repair affect wireless charging?",
      answer:
        "We protect the wireless charging coil and MagSafe area during the repair, then test wireless charging before return. Existing impact damage can still affect the coil, so we inspect first.",
    },
    {
      question: "Do you check frame alignment before iPhone 13 rear glass repair?",
      answer:
        "Yes. A bent frame can stop the rear glass from sitting flush, so we check corners, camera area, and side rails before bonding.",
    },
    {
      question: "How long does iPhone 13 back glass repair take?",
      answer:
        "Timing depends on rear glass damage, frame condition, and part availability. We confirm the expected turnaround after inspecting the phone at Ringwood Square.",
    },
  ],
};

const IPHONE_13_CAMERA_REPAIR_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 camera repair in Ringwood? Ali Mobile & Repair checks rear camera focus, front camera behaviour, lens glass, camera ring impact, Face ID area risk, dust spots, and app-level camera faults before quoting.",
  workbenchHeadings: {
    options: "Which camera repair path fits this iPhone 13?",
    diagnostics: "What do we test before camera repair?",
    symptoms: "Which camera symptoms matter most?",
    outcomes: "What can affect camera repair results?",
  },
  repairOptions: [
    {
      name: "Rear camera module diagnosis",
      shortDescription:
        "We check focus, shaking, black camera view, exposure, lens switching, and whether impact damaged the rear module.",
      bestFor:
        "Phones with blurry photos, vibrating camera, black camera preview, or rear camera failure after a drop.",
      notes:
        "Lens glass and housing damage are checked because they can mimic camera module faults.",
    },
    {
      name: "Front camera and Face ID area check",
      shortDescription:
        "We inspect selfie camera behaviour, proximity area, earpiece mesh condition, and Face ID-related risk before quoting.",
      bestFor:
        "Phones with front camera faults, portrait mode problems, or impact near the top sensor area.",
      notes:
        "Some Face ID-related faults need separate assessment because the sensor area is paired and delicate.",
    },
    {
      name: "Lens glass and dust assessment",
      shortDescription:
        "We check cracked lens glass, dust spots, fogging, and whether cleaning or part replacement is the right path.",
      bestFor:
        "Customers seeing haze, spots, glare, or cracked camera lens glass.",
      notes:
        "If moisture entered through broken lens glass, we explain the extra risk before repair.",
    },
  ],
  commonProblems: [
    {
      title: "Blurry or shaking rear camera",
      description:
        "Impact can damage stabilisation or focus behaviour, causing vibration, clicking, or blurry photos.",
    },
    {
      title: "Black camera preview",
      description:
        "A black screen in the Camera app can come from a module fault, connector issue, or board-level fault.",
    },
    {
      title: "Cracked lens glass",
      description:
        "Broken lens glass can create glare, dust spots, and moisture entry even if the camera still opens.",
    },
    {
      title: "Front camera or Face ID area impact",
      description:
        "Damage near the top sensor area can affect front camera behaviour and Face ID-related functions.",
    },
    {
      title: "Dust, fog, or moisture marks",
      description:
        "Dust or fog inside the camera area can point to cracked glass, seal damage, or prior liquid exposure.",
    },
    {
      title: "Software versus hardware fault",
      description:
        "We test camera behaviour across modes because app glitches and hardware faults can look similar at first.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Test camera modes",
      description:
        "We check photo, video, portrait, zoom, flash, focus, exposure, and lens switching behaviour.",
    },
    {
      step: "02",
      title: "Inspect lens and housing",
      description:
        "Lens glass, camera rings, rear housing damage, dust, fogging, and impact signs are checked before quoting.",
    },
    {
      step: "03",
      title: "Check front camera risk",
      description:
        "For front camera issues, we inspect the top sensor area and explain Face ID-related limitations before work.",
    },
    {
      step: "04",
      title: "Confirm final camera function",
      description:
        "After repair, we retest focus, image clarity, video, flash, front camera, and normal app behaviour.",
    },
  ],
  faq: [
    {
      question: "Can you fix an iPhone 13 camera that is blurry or shaking?",
      answer:
        "Yes. We test focus, stabilisation, lens switching, and camera app behaviour to confirm whether the rear camera module, lens glass, or another fault is causing the issue.",
    },
    {
      question: "Do you repair cracked iPhone 13 camera lens glass?",
      answer:
        "Yes. We inspect the lens glass, camera ring, dust, fogging, and rear housing condition before confirming the repair path.",
    },
    {
      question: "Will front camera repair affect Face ID?",
      answer:
        "The Face ID area is delicate and can be affected by impact or prior damage. We inspect and explain any Face ID-related risk before front camera work begins.",
    },
    {
      question: "Can iPhone 13 camera repair be done same day in Ringwood?",
      answer:
        "Many iPhone 13 camera repairs can be handled the same day when the correct part is available and no hidden board or liquid damage is found.",
    },
  ],
};

const IPHONE_13_WATER_DAMAGE_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 water damage assessment in Ringwood? Ali Mobile & Repair prioritises fast triage, safe disassembly, corrosion cleaning, board inspection, data-preservation awareness, and clear reporting before major part replacement.",
  workbenchHeadings: {
    options: "Which water-damage path fits this iPhone 13?",
    diagnostics: "What do we inspect after liquid exposure?",
    symptoms: "Which liquid-damage symptoms matter most?",
    outcomes: "What can affect water-damage recovery?",
  },
  repairOptions: [
    {
      name: "Immediate liquid triage",
      shortDescription:
        "We assess power state, liquid indicators, corrosion risk, charging safety, and whether the phone should stay powered off.",
      bestFor:
        "Phones exposed to water, drinks, rain, pool water, or humidity that now show unstable behaviour.",
      notes:
        "Do not charge a liquid-exposed iPhone before assessment because it can worsen corrosion or shorts.",
    },
    {
      name: "Internal cleaning and drying",
      shortDescription:
        "The phone is opened, inspected, dried, and cleaned where corrosion is visible before part decisions are made.",
      bestFor:
        "Phones that still have data value or uncertain fault spread after liquid exposure.",
      notes:
        "Water damage recovery is unpredictable, so we explain limitations before major replacement work.",
    },
    {
      name: "Part and board assessment",
      shortDescription:
        "After cleaning, we test screen, battery, cameras, charging, speakers, and board stability to identify the next repair path.",
      bestFor:
        "Phones with no power, display faults, charging faults, speaker issues, or random restarts after liquid exposure.",
      notes:
        "Replacement parts can carry their own warranty, but liquid-damaged devices cannot be guaranteed like standard repairs.",
    },
  ],
  commonProblems: [
    {
      title: "No power after liquid exposure",
      description:
        "A no-power iPhone 13 may have battery, screen, connector, or board-level corrosion damage.",
    },
    {
      title: "Charging after water exposure",
      description:
        "Charging a wet phone can create shorts, so we check the port and board before any power testing.",
    },
    {
      title: "Display, speaker, or camera instability",
      description:
        "Liquid can affect multiple functions at once, so each module is tested after cleaning.",
    },
    {
      title: "Corrosion that grows over time",
      description:
        "Even if the phone works today, residue can continue corroding connectors and board areas later.",
    },
    {
      title: "Data recovery priority",
      description:
        "If photos or data matter most, we prioritise stabilising the device enough to back up before cosmetic decisions.",
    },
    {
      title: "Warranty limitations",
      description:
        "Liquid-damaged devices are less predictable than standard repairs, so we separate cleaning labour from any replaced-part warranty.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Confirm exposure and power risk",
      description:
        "We ask what liquid was involved, when it happened, whether it was charged, and what symptoms appeared first.",
    },
    {
      step: "02",
      title: "Open and inspect indicators",
      description:
        "Visible moisture, liquid indicators, corrosion, connector residue, and board areas are inspected before quoting parts.",
    },
    {
      step: "03",
      title: "Clean and stabilise",
      description:
        "Where appropriate, we clean corrosion and dry the device before testing modules and board stability.",
    },
    {
      step: "04",
      title: "Report repair options",
      description:
        "We explain what recovered, what remains risky, and which parts or board work would be needed next.",
    },
  ],
  faq: [
    {
      question: "What should I do first if my iPhone 13 gets wet?",
      answer:
        "Power it off if possible, do not charge it, and bring it in quickly. Charging after liquid exposure can worsen shorts or corrosion.",
    },
    {
      question: "Can Ali Mobile recover data from a water-damaged iPhone 13?",
      answer:
        "If data matters most, we prioritise stabilising the phone enough for backup where possible. Success depends on corrosion level, board condition, and how quickly the device is assessed.",
    },
    {
      question: "Is iPhone 13 water damage repair covered by the normal warranty?",
      answer:
        "Water damage recovery is unpredictable, so the cleaning and rescue work does not carry the same warranty as a standard part replacement. Any specific replaced part may have its own warranty if the rest of the phone remains stable.",
    },
    {
      question: "How long does iPhone 13 water damage assessment take in Ringwood?",
      answer:
        "Initial assessment can often begin the same day. Full recovery timing depends on corrosion, drying, cleaning, and whether parts or board-level work are required.",
    },
  ],
};

const IPHONE_REPAIR_POCKET_TEMPLATE_BY_TYPE: Record<string, RepairTypeSeoPocket> = {
  "screen-replacement": IPHONE_13_SCREEN_REPLACEMENT_SEO_POCKET,
  "battery-replacement": IPHONE_13_BATTERY_REPLACEMENT_SEO_POCKET,
  "charging-port-replacement": IPHONE_13_CHARGING_PORT_SEO_POCKET,
  "charging-port-repair": IPHONE_13_CHARGING_PORT_SEO_POCKET,
  "back-housing-replacement": IPHONE_13_BACK_HOUSING_SEO_POCKET,
  "back-glass-repair": IPHONE_13_BACK_HOUSING_SEO_POCKET,
  "rear-glass-repair": IPHONE_13_BACK_HOUSING_SEO_POCKET,
  "camera-repair": IPHONE_13_CAMERA_REPAIR_SEO_POCKET,
  "water-damage-repair": IPHONE_13_WATER_DAMAGE_SEO_POCKET,
};

const UPPERCASE_IPHONE_MODEL_TOKENS = new Set(["se", "x", "xr", "xs"]);
const TITLECASE_IPHONE_MODEL_TOKENS = new Set(["mini", "plus", "pro", "max", "ultra"]);

interface IPhoneHardwareProfile {
  generation: number | null;
  hasOledDisplay: boolean;
  hasMagSafe: boolean;
  chargingPort: "lightning" | "usb-c";
  hasFaceId: boolean;
}

function replaceText(value: string, from: string, to: string): string {
  return value.split(from).join(to);
}

function deriveIphoneModelNameFromSlug(modelSlug: string): string | null {
  const normalizedModelSlug = slugify(modelSlug);
  if (!normalizedModelSlug.startsWith("iphone-")) return null;

  const modelSuffix = normalizedModelSlug.slice("iphone-".length);
  if (!modelSuffix) return "iPhone";

  const formattedTokens = modelSuffix
    .split("-")
    .filter(Boolean)
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      if (/^\d+(st|nd|rd|th)$/i.test(token)) return token.toLowerCase();
      if (UPPERCASE_IPHONE_MODEL_TOKENS.has(token)) return token.toUpperCase();
      if (TITLECASE_IPHONE_MODEL_TOKENS.has(token)) {
        return token.charAt(0).toUpperCase() + token.slice(1);
      }

      return token.charAt(0).toUpperCase() + token.slice(1);
    });

  return `iPhone ${formattedTokens.join(" ")}`;
}

const LCD_IPHONE_MODEL_SLUGS = new Set([
  "iphone-6",
  "iphone-6-plus",
  "iphone-6s",
  "iphone-6s-plus",
  "iphone-7",
  "iphone-7-plus",
  "iphone-8",
  "iphone-8-plus",
  "iphone-se",
  "iphone-se-2",
  "iphone-se-3",
  "iphone-xr",
  "iphone-11",
]);

const OLED_IPHONE_MODEL_SLUGS = new Set([
  "iphone-x",
  "iphone-xs",
  "iphone-xs-max",
  "iphone-11-pro",
  "iphone-11-pro-max",
]);

const FACE_ID_IPHONE_MODEL_SLUGS = new Set([
  "iphone-x",
  "iphone-xr",
  "iphone-xs",
  "iphone-xs-max",
  "iphone-11",
  "iphone-11-pro",
  "iphone-11-pro-max",
]);

function getIPhoneHardwareProfile(modelSlug: string): IPhoneHardwareProfile {
  const normalizedModelSlug = slugify(modelSlug);
  const numberedMatch = normalizedModelSlug.match(/^iphone-(\d+)/);
  const generation = numberedMatch ? Number(numberedMatch[1]) : null;
  const isSEFamily = normalizedModelSlug.startsWith("iphone-se");
  const inferredModernSeries = generation !== null && generation >= 12;

  const hasOledDisplay = LCD_IPHONE_MODEL_SLUGS.has(normalizedModelSlug)
    ? false
    : OLED_IPHONE_MODEL_SLUGS.has(normalizedModelSlug) || inferredModernSeries;

  const hasMagSafe = inferredModernSeries && !isSEFamily;
  const chargingPort: "lightning" | "usb-c" = generation !== null && generation >= 15 && !isSEFamily
    ? "usb-c"
    : "lightning";

  const hasFaceId = FACE_ID_IPHONE_MODEL_SLUGS.has(normalizedModelSlug) || inferredModernSeries;

  return {
    generation,
    hasOledDisplay,
    hasMagSafe,
    chargingPort,
    hasFaceId,
  };
}

function applyIPhoneAccuracyRules(
  pocket: RepairTypeSeoPocket,
  modelName: string,
  repairType: string,
  modelSlug: string
): RepairTypeSeoPocket {
  const profile = getIPhoneHardwareProfile(modelSlug);
  const normalizedRepairType = slugify(repairType);
  let adjustedPocket = pocket;

  if (normalizedRepairType === "screen-replacement" && !profile.hasOledDisplay) {
    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: adjustedPocket.quickAnswer
        .replace("OLED faults", "display faults")
        .replace("and display option availability", "and LCD option availability"),
      repairOptions: adjustedPocket.repairOptions.map((option, index) => {
        if (index !== 1) return option;

        return {
          ...option,
          name: "Premium LCD path",
          shortDescription:
            `A higher-grade LCD option for customers who care about colour consistency, responsive touch, and a stable display experience on ${modelName}.`,
          bestFor:
            `Customers who use their ${modelName} heavily for photos, maps, work apps, videos, and daily messaging.`,
          notes:
            "A bent frame can stress a fresh display assembly, so we inspect the housing carefully before fitting.",
        };
      }),
      commonProblems: adjustedPocket.commonProblems.map((problem) => {
        if (problem.title !== "Green lines, flicker, or black screen") return problem;

        return {
          title: "Flicker, blank screen, or image issues",
          description:
            "Display faults can appear after a drop even when the outside glass is not badly shattered. We test output, backlight behaviour, and touch response before quoting.",
        };
      }),
      faq: adjustedPocket.faq.map((item) => {
        if (!item.question.includes("green lines, flicker, or a black screen")) return item;

        return {
          ...item,
          question: item.question.replace("green lines, flicker, or a black screen", "flicker, blank display, or touch failure"),
        };
      }),
    };

    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: replaceText(adjustedPocket.quickAnswer, "OLED", "LCD"),
      repairOptions: adjustedPocket.repairOptions.map((option) => ({
        ...option,
        name: replaceText(option.name, "OLED", "LCD"),
        shortDescription: replaceText(
          replaceText(option.shortDescription, "black screen, green lines, flicker, partial touch failure", "blank display, flicker, partial touch failure"),
          "OLED",
          "LCD"
        ),
        bestFor: replaceText(option.bestFor, "OLED", "LCD"),
        notes: replaceText(option.notes, "OLED", "LCD"),
      })),
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        title: replaceText(problem.title, "OLED", "LCD"),
        description: replaceText(problem.description, "OLED layer", "display layer"),
      })),
      diagnosticSteps: adjustedPocket.diagnosticSteps.map((step) => ({
        ...step,
        title: replaceText(step.title, "OLED", "display"),
        description: replaceText(step.description, "OLED", "LCD"),
      })),
      faq: adjustedPocket.faq.map((item) => ({
        question: replaceText(item.question, "OLED", "LCD"),
        answer: replaceText(
          replaceText(
            replaceText(item.answer, "Green lines, flicker, black display, and touch dead zones", "Flicker, blank display, and touch dead zones"),
            "common OLED or digitizer symptoms",
            "common display or digitizer symptoms"
          ),
          "OLED",
          "LCD"
        ),
      })),
    };

    adjustedPocket = JSON.parse(
      JSON.stringify(adjustedPocket)
        .split("Green lines")
        .join("Display lines")
        .split("green lines")
        .join("display lines")
    ) as RepairTypeSeoPocket;
  }

  if (
    (normalizedRepairType === "back-housing-replacement" ||
      normalizedRepairType === "back-glass-repair" ||
      normalizedRepairType === "rear-glass-repair") &&
    !profile.hasMagSafe
  ) {
    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: adjustedPocket.quickAnswer.replace(", MagSafe alignment,", ", wireless charging area alignment,"),
      repairOptions: adjustedPocket.repairOptions.map((option) => ({
        ...option,
        shortDescription: replaceText(option.shortDescription, "MagSafe", "wireless charging"),
        notes: replaceText(option.notes, "MagSafe", "wireless charging"),
      })),
      diagnosticSteps: adjustedPocket.diagnosticSteps.map((step) => ({
        ...step,
        description: step.description.replace("MagSafe", "wireless charging"),
      })),
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        ...problem,
        title: problem.title.replace("MagSafe", "wireless charging"),
        description: problem.description.replace("MagSafe", "wireless charging"),
      })),
      faq: adjustedPocket.faq.map((item) => ({
        ...item,
        question: item.question.replace("MagSafe", "wireless charging"),
        answer: item.answer.replace("MagSafe", "wireless charging"),
      })),
    };

    adjustedPocket = {
      ...adjustedPocket,
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        ...problem,
        description: replaceText(
          problem.description,
          "wireless charging and wireless charging behaviour",
          "wireless charging behaviour"
        ),
      })),
    };
  }

  if (
    (normalizedRepairType === "charging-port-repair" || normalizedRepairType === "charging-port-replacement") &&
    profile.chargingPort === "usb-c"
  ) {
    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: adjustedPocket.quickAnswer.replace("Lightning", "USB-C"),
      repairOptions: adjustedPocket.repairOptions.map((option) => ({
        ...option,
        shortDescription: option.shortDescription.replace("Lightning", "USB-C"),
        notes: option.notes.replace("Lightning", "USB-C"),
      })),
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        ...problem,
        title: problem.title.replace("Lightning", "USB-C"),
        description: problem.description.replace("Lightning", "USB-C"),
      })),
      diagnosticSteps: adjustedPocket.diagnosticSteps.map((step) => ({
        ...step,
        description: step.description.replace("Lightning", "USB-C"),
      })),
      faq: adjustedPocket.faq.map((item) => ({
        ...item,
        question: item.question.replace("charging port", "USB-C port"),
        answer: item.answer.replace("Lightning", "USB-C"),
      })),
    };
  }

  if (!profile.hasFaceId) {
    adjustedPocket = {
      ...adjustedPocket,
      quickAnswer: replaceText(adjustedPocket.quickAnswer, "Face ID area condition", "front sensor area condition"),
      repairOptions: adjustedPocket.repairOptions.map((option) => ({
        ...option,
        shortDescription: replaceText(option.shortDescription, "Face ID", "front sensor"),
        notes: replaceText(option.notes, "Face ID", "front sensor"),
      })),
      commonProblems: adjustedPocket.commonProblems.map((problem) => ({
        title: replaceText(problem.title, "Face ID", "front sensor"),
        description: replaceText(problem.description, "Face ID", "front sensor"),
      })),
      diagnosticSteps: adjustedPocket.diagnosticSteps.map((step) => ({
        ...step,
        title: replaceText(step.title, "Face ID", "front sensor"),
        description: replaceText(step.description, "Face ID", "front sensor"),
      })),
      faq: adjustedPocket.faq.map((item) => ({
        question: replaceText(item.question, "Face ID", "front sensor area"),
        answer: replaceText(item.answer, "Face ID", "front sensor"),
      })),
    };
  }

  return adjustedPocket;
}

function personalizeIphoneRepairPocket(
  pocket: RepairTypeSeoPocket,
  modelName: string,
  repairType: string,
  modelSlug: string
) {
  if (modelName === "iPhone 13") {
    return applyIPhoneAccuracyRules(pocket, modelName, repairType, modelSlug);
  }

  const personalizedPocket = JSON.parse(
    JSON.stringify(pocket).replaceAll("iPhone 13", modelName)
  ) as RepairTypeSeoPocket;

  return applyIPhoneAccuracyRules(personalizedPocket, modelName, repairType, modelSlug);
}

interface SamsungGalaxyHardwareProfile {
  display: string;
  hasSPen: boolean;
  screenForm: "flat" | "edge" | "foldable";
  cameraSummary: string;
  chargingNote: string;
  fingerprintSummary: string;
  fingerprintLabel: string;
  supportsWirelessCharging: boolean;
}

interface AndroidRepairBrandContext {
  brandName: string;
  familyName: string;
}

const SAMSUNG_GALAXY_CONTEXT: AndroidRepairBrandContext = {
  brandName: "Samsung",
  familyName: "Galaxy",
};

const SAMSUNG_NOTE_CONTEXT: AndroidRepairBrandContext = {
  brandName: "Samsung",
  familyName: "Galaxy Note",
};

const SAMSUNG_Z_CONTEXT: AndroidRepairBrandContext = {
  brandName: "Samsung",
  familyName: "Galaxy Z",
};

const GOOGLE_PIXEL_CONTEXT: AndroidRepairBrandContext = {
  brandName: "Google Pixel",
  familyName: "Pixel",
};

const OPPO_CONTEXT: AndroidRepairBrandContext = {
  brandName: "OPPO",
  familyName: "OPPO",
};

function isGalaxySPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return /^galaxy-s\d/.test(normalized);
}

function deriveSamsungGalaxySModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^galaxy-s(\d+)(.*)$/);

  if (!match) return null;

  const generation = match[1];
  const rawSuffix = match[2];
  const compactE = rawSuffix === "e";
  const tokens = rawSuffix.split("-").filter(Boolean);
  let variantLabel = "";

  if (compactE || tokens.includes("e")) {
    variantLabel = "e";
  } else if (tokens.includes("ultra")) {
    variantLabel = " Ultra";
  } else if (tokens.includes("plus")) {
    variantLabel = "+";
  } else if (tokens.includes("fe")) {
    variantLabel = " FE";
  }

  return `Samsung Galaxy S${generation}${variantLabel}`;
}

function getSamsungGalaxySProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^galaxy-s(\d+)(.*)$/);
  if (!match) return null;

  const generation = Number.parseInt(match[1], 10);
  const rawSuffix = match[2];
  const compactE = rawSuffix === "e";
  const tokens = rawSuffix.split("-").filter(Boolean);
  const isUltra = tokens.includes("ultra");
  const isFE = tokens.includes("fe");
  const isCompactE = compactE || tokens.includes("e");
  const isLegacyEdgeSeries = generation >= 8 && generation <= 10;
  const isEdgeModel = isUltra || isLegacyEdgeSeries;
  const hasSPen = isUltra && generation >= 22;
  const hasRearFingerprint = generation <= 9;
  const hasSideFingerprint = isCompactE && generation >= 10;

  let cameraSummary = "main rear camera testing";
  if (isUltra) {
    cameraSummary = "main, ultra-wide, telephoto, and long-zoom camera testing";
  } else if (generation >= 20 || isFE) {
    cameraSummary = "main, ultra-wide, and telephoto camera testing";
  } else if (isCompactE) {
    cameraSummary = "main and ultra-wide rear camera testing";
  } else if (generation >= 10) {
    cameraSummary = "main and supporting rear camera testing";
  }

  return {
    display: hasSPen
      ? "edge Dynamic AMOLED display with S Pen input support"
      : isEdgeModel
        ? "edge AMOLED display"
        : "flat AMOLED display",
    hasSPen,
    screenForm: isEdgeModel ? "edge" : "flat",
    cameraSummary,
    chargingNote: hasSPen
      ? "USB-C charging, fast wireless charging, Wireless PowerShare, and S Pen handover checks"
      : "USB-C charging, fast wireless charging, and Wireless PowerShare checks",
    fingerprintSummary: hasRearFingerprint
      ? "rear fingerprint sensor behaviour"
      : hasSideFingerprint
        ? "side-mounted fingerprint sensor behaviour"
        : "in-display fingerprint behaviour",
    fingerprintLabel: hasRearFingerprint
      ? "rear fingerprint sensor"
      : hasSideFingerprint
        ? "side-mounted fingerprint sensor"
        : "in-display fingerprint",
    supportsWirelessCharging: true,
  };
}

function isGalaxyAPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return /^(galaxy-)?a\d{2,3}[a-z]?(-|$)/.test(normalized);
}

function deriveSamsungGalaxyAModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?a(\d{2,3})([a-z]?)(.*)$/);
  if (!match) return null;

  const generation = match[1];
  const letterSuffix = match[2] ? match[2].toLowerCase() : "";
  const suffixTokens = match[3].split("-").filter(Boolean);
  const is5G = suffixTokens.includes("5g");
  const baseModel = `A${generation}${letterSuffix}`;

  return is5G ? `Samsung Galaxy ${baseModel} 5G` : `Samsung Galaxy ${baseModel}`;
}

function getSamsungGalaxyAProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?a(\d{2,3})([a-z]?)(.*)$/);
  if (!match) return null;

  const generation = Number.parseInt(match[1], 10);
  const suffixLetter = match[2] ? match[2].toLowerCase() : "";
  const compactModelKey = `${generation}${suffixLetter}`;

  const lcdModels = new Set([
    "3", "5", "6", "10", "11", "12", "13", "14", "15", "16",
    "20", "21", "22", "23",
  ]);
  const amoledModels = new Set([
    "24", "25", "30", "31", "32", "33", "34", "35", "36",
    "40", "41", "42",
    "50", "51", "52", "52s", "53", "54", "55", "56",
    "70", "71", "72", "73", "74", "80", "82", "90",
  ]);

  const sideFingerprintModels = new Set([
    "3", "5", "6", "10", "11", "12", "13", "14", "15", "16",
    "22", "23", "24", "25",
  ]);
  const rearFingerprintModels = new Set(["20", "21"]);

  let display = "AMOLED or LCD display (variant dependent)";
  if (amoledModels.has(compactModelKey) || (generation >= 30 && !lcdModels.has(compactModelKey))) {
    display = "flat Super AMOLED display";
  } else if (lcdModels.has(compactModelKey)) {
    display = "flat LCD display";
  }

  let fingerprintSummary = "fingerprint sensor behaviour";
  let fingerprintLabel = "fingerprint sensor";
  if (sideFingerprintModels.has(compactModelKey)) {
    fingerprintSummary = "side-mounted fingerprint sensor behaviour";
    fingerprintLabel = "side-mounted fingerprint sensor";
  } else if (rearFingerprintModels.has(compactModelKey)) {
    fingerprintSummary = "rear fingerprint sensor behaviour";
    fingerprintLabel = "rear fingerprint sensor";
  } else if (amoledModels.has(compactModelKey) || generation >= 30 || generation >= 50) {
    fingerprintSummary = "in-display fingerprint sensor behaviour";
    fingerprintLabel = "in-display fingerprint sensor";
  }

  let cameraSummary = "main rear camera testing";
  if (generation >= 50 || generation >= 70) {
    cameraSummary = "main, ultra-wide, and supporting camera testing";
  } else if (generation >= 30 || generation === 24 || generation === 25) {
    cameraSummary = "main and ultra-wide rear camera testing";
  } else if (generation >= 10) {
    cameraSummary = "main and supporting rear camera testing";
  }

  return {
    display,
    hasSPen: false,
    screenForm: "flat",
    cameraSummary,
    chargingNote: "USB-C charging and handover checks",
    fingerprintSummary,
    fingerprintLabel,
    supportsWirelessCharging: false,
  };
}

function formatModelVariantToken(token: string): string {
  if (token === "xl") return "XL";
  if (token === "fe") return "FE";
  if (token === "pro") return "Pro";
  if (token === "plus") return "Plus";
  if (token === "ultra") return "Ultra";
  if (token === "lite") return "Lite";
  if (token === "flip") return "Flip";
  if (token === "fold") return "Fold";
  if (token === "neo") return "Neo";
  if (token === "zoom") return "Zoom";
  if (token === "5g") return "5G";
  return token.charAt(0).toUpperCase() + token.slice(1);
}

function isGalaxyNotePhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return /^(galaxy-)?note\d+/.test(normalized);
}

function deriveSamsungGalaxyNoteModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?note(\d+)(.*)$/);
  if (!match) return null;

  const generation = match[1];
  const suffixTokens = match[2].split("-").filter(Boolean).map(formatModelVariantToken);
  const suffix = suffixTokens.length ? ` ${suffixTokens.join(" ")}` : "";
  return `Samsung Galaxy Note ${generation}${suffix}`;
}

function getSamsungGalaxyNoteProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?note(\d+)(.*)$/);
  if (!match) return null;

  const generation = Number.parseInt(match[1], 10);
  const suffixTokens = match[2].split("-").filter(Boolean);
  const isUltra = suffixTokens.includes("ultra");
  const isPlus = suffixTokens.includes("plus");
  const isLite = suffixTokens.includes("lite");
  const hasRearFingerprint = generation <= 9;
  const isEdgeModel = !isLite && (isUltra || isPlus || generation >= 8);

  return {
    display: isEdgeModel
      ? "edge AMOLED display with S Pen input support"
      : "flat AMOLED display with S Pen input support",
    hasSPen: true,
    screenForm: isEdgeModel ? "edge" : "flat",
    cameraSummary: generation >= 20
      ? "main, ultra-wide, and telephoto camera testing"
      : generation >= 10
        ? "main and supporting rear camera testing"
        : "main rear camera testing",
    chargingNote: "USB-C charging, fast wireless charging, Wireless PowerShare, and S Pen handover checks",
    fingerprintSummary: hasRearFingerprint
      ? "rear fingerprint sensor behaviour"
      : "in-display fingerprint sensor behaviour",
    fingerprintLabel: hasRearFingerprint ? "rear fingerprint sensor" : "in-display fingerprint sensor",
    supportsWirelessCharging: true,
  };
}

function isGalaxyZPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return /^(galaxy-)?z-(fold|flip)-?\d+/.test(normalized) || /^(galaxy-)?z(fold|flip)\d+/.test(normalized);
}

function deriveSamsungGalaxyZModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?z-?(fold|flip)-?(\d+)(.*)$/);
  if (!match) return null;

  const family = formatModelVariantToken(match[1]);
  const generation = match[2];
  const suffixTokens = match[3].split("-").filter(Boolean).map(formatModelVariantToken);
  const suffix = suffixTokens.length ? ` ${suffixTokens.join(" ")}` : "";
  return `Samsung Galaxy Z ${family} ${generation}${suffix}`;
}

function getSamsungGalaxyZProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug);
  const match = normalized.match(/^(?:galaxy-)?z-?(fold|flip)-?(\d+)(.*)$/);
  if (!match) return null;

  const family = match[1];
  const generation = Number.parseInt(match[2], 10);
  const isFold = family === "fold";
  const hasSPen = isFold && generation >= 3;

  return {
    display: hasSPen
      ? "foldable Dynamic AMOLED display with cover screen and S Pen support"
      : "foldable AMOLED display with cover screen",
    hasSPen,
    screenForm: "foldable",
    cameraSummary: isFold
      ? "main, ultra-wide, and telephoto camera testing"
      : "main and ultra-wide rear camera testing",
    chargingNote: hasSPen
      ? "USB-C charging, fast wireless charging, Wireless PowerShare, and S Pen handover checks"
      : "USB-C charging, fast wireless charging, and Wireless PowerShare checks",
    fingerprintSummary: "side-mounted fingerprint sensor behaviour",
    fingerprintLabel: "side-mounted fingerprint sensor",
    supportsWirelessCharging: true,
  };
}

function isGooglePixelPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return normalized.startsWith("pixel-") || normalized.startsWith("google-pixel-");
}

function deriveGooglePixelModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug).replace(/^google-/, "");
  if (!normalized.startsWith("pixel-")) return null;

  const tokens = normalized.replace(/^pixel-/, "").split("-").filter(Boolean).map(formatModelVariantToken);
  if (tokens.length === 0) return "Google Pixel";
  return `Google Pixel ${tokens.join(" ")}`;
}

function getGooglePixelProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug).replace(/^google-/, "");
  if (!normalized.startsWith("pixel-")) return null;

  const tokens = normalized.replace(/^pixel-/, "").split("-").filter(Boolean);
  const generationMatch = normalized.match(/pixel-(\d+)/);
  const generation = generationMatch ? Number.parseInt(generationMatch[1], 10) : 0;
  const isFold = tokens.includes("fold");
  const isPro = tokens.includes("pro");
  const isXL = tokens.includes("xl");
  const isA = tokens.includes("a");
  const hasRearFingerprint = !isFold && generation > 0 && generation <= 5;
  const supportsWirelessCharging = isFold
    ? true
    : isA
      ? generation >= 7
      : generation >= 4;

  return {
    display: isFold ? "foldable OLED display with cover screen" : "flat OLED display",
    hasSPen: false,
    screenForm: isFold ? "foldable" : "flat",
    cameraSummary: isFold || isPro || isXL
      ? "main, ultra-wide, and telephoto camera testing"
      : generation >= 6
        ? "main and ultra-wide rear camera testing"
        : "main rear camera testing",
    chargingNote: supportsWirelessCharging
      ? "USB-C charging, wireless charging, and battery-share checks"
      : "USB-C charging and handover checks",
    fingerprintSummary: hasRearFingerprint
      ? "rear fingerprint sensor behaviour"
      : isFold
        ? "side-mounted fingerprint sensor behaviour"
        : "in-display fingerprint sensor behaviour",
    fingerprintLabel: hasRearFingerprint
      ? "rear fingerprint sensor"
      : isFold
        ? "side-mounted fingerprint sensor"
        : "in-display fingerprint sensor",
    supportsWirelessCharging,
  };
}

function isOppoPhoneSlug(modelSlug: string): boolean {
  const normalized = slugify(modelSlug);
  return normalized.startsWith("find-") || normalized.startsWith("reno-") || /^a\d{2,3}/.test(normalized) || normalized.startsWith("oppo-");
}

function deriveOppoModelName(modelSlug: string): string | null {
  const normalized = slugify(modelSlug).replace(/^oppo-/, "");
  if (!normalized) return null;

  const tokens = normalized.split("-").filter(Boolean);
  if (tokens.length === 0) return "OPPO";

  const modelName = tokens.map((token, idx) => {
    if (idx === 0 && token === "find") return "Find";
    if (idx === 0 && token === "reno") return "Reno";
    if (idx === 0 && /^a\d{2,3}$/.test(token)) return token.toUpperCase();
    return formatModelVariantToken(token);
  }).join(" ");

  return `OPPO ${modelName}`;
}

function getOppoProfile(modelSlug: string): SamsungGalaxyHardwareProfile | null {
  const normalized = slugify(modelSlug).replace(/^oppo-/, "");
  if (!normalized) return null;

  const tokens = normalized.split("-").filter(Boolean);
  const isFind = tokens.includes("find");
  const isReno = tokens.includes("reno");
  const aMatch = normalized.match(/^a(\d{2,3})/);
  const aGeneration = aMatch ? Number.parseInt(aMatch[1], 10) : 0;
  const supportsWirelessCharging = isFind;
  const hasInDisplayFingerprint = isFind || isReno;

  return {
    display: hasInDisplayFingerprint ? "flat AMOLED display" : "flat LCD display",
    hasSPen: false,
    screenForm: "flat",
    cameraSummary: isFind
      ? "main, ultra-wide, and telephoto camera testing"
      : isReno
        ? "main and ultra-wide rear camera testing"
        : "main and supporting rear camera testing",
    chargingNote: supportsWirelessCharging
      ? "USB-C charging, wireless charging, and fast-charge checks"
      : "USB-C charging and fast-charge checks",
    fingerprintSummary: hasInDisplayFingerprint
      ? "in-display fingerprint sensor behaviour"
      : aGeneration > 0 && aGeneration <= 25
        ? "side-mounted fingerprint sensor behaviour"
        : "fingerprint sensor behaviour",
    fingerprintLabel: hasInDisplayFingerprint
      ? "in-display fingerprint sensor"
      : aGeneration > 0 && aGeneration <= 25
        ? "side-mounted fingerprint sensor"
        : "fingerprint sensor",
    supportsWirelessCharging,
  };
}

function buildSamsungS23ScreenPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  const edgeNote = profile.screenForm === "edge"
    ? profile.hasSPen
      ? "The curved edge glass and S Pen digitizer path are checked before fitting so the display sits cleanly and pen input remains stable."
      : "The curved edge glass and side-bond tension are checked before fitting so the display sits cleanly and touch remains stable."
    : profile.screenForm === "foldable"
      ? "Inner display and cover-screen seating are checked before fitting so fold movement, crease area behaviour, and frame pressure stay stable."
      : "The flat frame edge is checked before fitting so the display sits cleanly without corner lift or pressure stress.";
  const panelTerm = profile.display.toLowerCase().includes("lcd") ? "display panel" : "AMOLED panel";

  return {
    quickAnswer:
      `Need ${modelName} screen replacement in Ringwood? Ali Mobile & Repair checks cracked glass, ${profile.display}, touch response, ${profile.fingerprintSummary}, frame alignment, and moisture indicators before quoting.`,
    workbenchHeadings: {
      options: `Which screen path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.brandName} screen replacement?`,
      symptoms: `Which ${context.familyName} display symptoms matter most?`,
      outcomes: `What can affect the ${context.brandName} display result?`,
    },
    repairOptions: [
      {
        name: "Display assembly diagnosis",
        shortDescription:
          `We test the ${profile.display}, touch layer, brightness, ${profile.fingerprintLabel}, and frame condition before opening the phone.`,
        bestFor:
          "Cracked glass, black display, display lines, flicker, touch dead zones, or a phone that still vibrates but shows no image.",
        notes: edgeNote,
      },
      {
        name: `${context.brandName} display replacement path`,
        shortDescription:
          "A model-matched display assembly path focused on clean fit, stable touch response, and normal daily viewing.",
        bestFor:
          `Customers who want their ${modelName} restored with ${context.brandName}-specific display checks instead of generic phone copy.`,
        notes:
          "We avoid promising factory water resistance after opening, but adhesive cleanup and resealing are handled carefully.",
      },
      {
        name: profile.hasSPen ? "S Pen and sensor validation" : "Fingerprint and sensor validation",
        shortDescription:
          profile.hasSPen
            ? "After display work, we check touch, S Pen input, fingerprint behaviour, cameras, speaker mesh, and charging."
            : "After display work, we check touch, fingerprint behaviour, cameras, speaker mesh, and charging.",
        bestFor:
          "Phones where impact damage may have affected more than the visible glass.",
        notes:
          "If the frame, liquid indicators, or board behaviour point beyond a display assembly, we explain that before extra work.",
      },
    ],
    commonProblems: [
      {
        title: "Cracked glass with working image",
        description:
          "The phone may still work, but glass flakes, lifted edges, or pressure marks can worsen if the display is kept in use.",
      },
      {
        title: "Display lines, flicker, or black screen",
        description:
          `A damaged ${panelTerm} can show lines, flashes, tint shift, or no image after impact. We test output before quoting.`,
      },
      {
        title: "Touch or fingerprint faults",
        description:
          `Touch dead zones and ${profile.fingerprintSummary} are checked before and after display replacement.`,
      },
      {
        title: profile.hasSPen ? "S Pen input faults" : "Frame pressure risk",
        description:
          profile.hasSPen
            ? "The Ultra display path includes S Pen digitizer checks because pen input depends on the display assembly and frame condition."
            : "A bent frame can stress a replacement display, so the frame is inspected before fitting.",
      },
    ],
    diagnosticSteps: [
      {
        step: "01",
        title: "Inspect display and frame",
        description:
          "We check cracks, display output, touch response, pressure marks, corner lift, and frame distortion.",
      },
      {
        step: "02",
        title: profile.hasSPen ? "Test touch, S Pen, and sensors" : `Test touch, ${profile.fingerprintLabel}, and sensors`,
        description:
          profile.hasSPen
            ? "Touch, S Pen input, fingerprint behaviour, front camera area, speaker mesh, and visible moisture indicators are checked."
            : "Touch, fingerprint behaviour, front camera area, speaker mesh, and visible moisture indicators are checked.",
      },
      {
        step: "03",
        title: "Confirm display path",
        description:
          "We explain display availability, frame limitations, adhesive expectations, warranty scope, and expected turnaround before work begins.",
      },
      {
        step: "04",
        title: `Final ${context.brandName} handover checks`,
        description:
          "Brightness, touch, fingerprint, cameras, charging, speaker, microphone, buttons, and normal operation are checked before return.",
      },
    ],
    faq: [
      {
        question: `How long does ${modelName} screen replacement take in Ringwood?`,
        answer:
          `Most ${context.brandName} screen repairs can be handled same day when the correct display assembly is available and there is no hidden frame, liquid, or board damage.`,
      },
      {
        question: `Do you test fingerprint and touch after ${modelName} screen repair?`,
        answer:
          profile.hasSPen
            ? "Yes. We test touch, S Pen input, in-display fingerprint behaviour, brightness, cameras, charging, and normal phone functions before pickup."
            : `Yes. We test touch response, ${profile.fingerprintSummary}, brightness, cameras, charging, and normal phone functions before pickup.`,
      },
      {
        question: `Will my ${modelName} stay water resistant after screen replacement?`,
        answer:
          "We clean old adhesive and reseal carefully, but factory water resistance cannot be guaranteed after any opened phone repair.",
      },
    ],
  };
}

function buildSamsungS23BatteryPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  const wirelessContext = profile.supportsWirelessCharging ? ", wireless charging response," : ",";
  const wirelessPath = profile.supportsWirelessCharging ? " and wireless charging response are tested." : " are tested.";
  const wirelessProblem = profile.supportsWirelessCharging
    ? "USB-C port wear, adapter issues, wireless charging faults, or board faults can mimic battery wear."
    : "USB-C port wear, adapter issues, or board faults can mimic battery wear.";
  const wirelessHandover = profile.supportsWirelessCharging
    ? "Charging, wireless charging behaviour, boot stability, heat, and runtime expectations are checked before return."
    : "Charging, boot stability, heat, and runtime expectations are checked before return.";
  const wirelessFaq = profile.supportsWirelessCharging
    ? "Yes. We test USB-C charging, wireless charging response, charge draw, boot stability, and heat before pickup."
    : "Yes. We test USB-C charging, charge draw, boot stability, and heat before pickup.";

  return {
    quickAnswer:
      `Need ${modelName} battery replacement in Ringwood? Ali Mobile & Repair checks battery health behaviour, heat, swelling risk, USB-C charging draw${wirelessContext} and post-repair runtime stability before handover.`,
    workbenchHeadings: {
      options: `Which battery path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.familyName} battery service?`,
      symptoms: `Which ${context.brandName} battery symptoms matter most?`,
      outcomes: "What can affect battery results?",
    },
    repairOptions: [
      {
        name: "Battery and charging diagnosis",
        shortDescription:
          `We test drain behaviour, heat, shutdowns, swelling signs, USB-C charging draw${wirelessContext} before quoting.`,
        bestFor:
          "Fast drain, slow charging, sudden shutdowns, swelling, heat, or a phone that no longer lasts through the day.",
        notes:
          profile.supportsWirelessCharging
            ? "A USB-C port, adapter, cable, wireless coil, or board fault can look like battery failure, so we test the power path first."
            : "A USB-C port, adapter, cable, or board fault can look like battery failure, so we test the power path first.",
      },
      {
        name: "Model-matched battery replacement",
        shortDescription:
          `We fit a battery matched to the ${modelName} power requirements and check stable charging before pickup.`,
        bestFor:
          "Customers who want practical daily runtime restored with clear expectations.",
        notes:
          `${context.brandName} battery service focuses on function, safety, charging behaviour, and practical runtime rather than unrelated part-pairing messages.`,
      },
      {
        name: "Runtime and heat validation",
        shortDescription:
          profile.supportsWirelessCharging
            ? "After fitting, we confirm boot stability, charge acceptance, wireless charging behaviour, and heat under normal use."
            : "After fitting, we confirm boot stability, charge acceptance, and heat under normal use.",
        bestFor:
          "Phones where battery wear may be mixed with charging or board-level symptoms.",
        notes:
          "If drain remains abnormal after a known-good battery, board-level current draw may need further diagnosis.",
      },
    ],
    commonProblems: [
      { title: "Fast drain", description: "A worn battery can drop percentage quickly or struggle under load." },
      { title: "Heat or swelling", description: "Heat and swelling are handled carefully because pressure can affect the display and frame." },
      { title: "Slow or unstable charging", description: wirelessProblem },
      { title: "Unexpected shutdowns", description: "Voltage instability can cause shutdowns even when the displayed percentage is not empty." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Check battery symptoms", description: "We review drain, heat, swelling, shutdowns, and customer-reported runtime." },
      { step: "02", title: "Test charging paths", description: `USB-C charging, adapter response, and charge draw${wirelessPath}` },
      { step: "03", title: "Inspect safety risk", description: "Swelling, frame pressure, and liquid indicators are checked before opening." },
      { step: "04", title: "Handover validation", description: wirelessHandover },
    ],
    faq: [
      { question: `Can Ali Mobile replace my ${modelName} battery same day?`, answer: "Usually yes when the correct battery is available and no hidden liquid, charging, or board fault is found." },
      { question: `Do you test charging after ${modelName} battery service?`, answer: wirelessFaq },
      { question: `What if my ${modelName} still drains quickly after battery replacement?`, answer: "If drain continues after a known-good battery, we explain the next diagnostic path, such as app load, charging-port faults, or board-level current draw." },
    ],
  };
}

function buildSamsungS23ChargingPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${modelName} USB-C charging port repair in Ringwood? Ali Mobile & Repair checks lint, port wear, moisture alerts, charge draw, data transfer, microphone routing, ${profile.chargingNote} before quoting.`,
    workbenchHeadings: {
      options: `Which USB-C charging path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.brandName} port repair?`,
      symptoms: "Which USB-C symptoms matter most?",
      outcomes: "What can affect charging-port results?",
    },
    repairOptions: [
      { name: "USB-C clean and cable-seat check", shortDescription: "We inspect compacted lint, debris, corrosion, and whether a known-good cable seats correctly.", bestFor: "Loose cables, charging only at one angle, or intermittent cable detection.", notes: "If cleaning solves the issue, we do not push a full port replacement." },
      { name: "USB-C sub-board or flex replacement", shortDescription: "If pins, the port assembly, or lower board path has failed, we quote the correct replacement path.", bestFor: "No wired charging, data failure, moisture-damaged pins, or microphone symptoms linked to the lower assembly.", notes: `${context.brandName} USB-C charging, microphone, speaker, and data functions can overlap in the lower assembly.` },
      { name: "Board-level charging diagnosis", shortDescription: "If a port replacement will not solve the issue, we explain the likely board-level path.", bestFor: "Phones that fail with known-good cables, adapters, batteries, and port assemblies.", notes: "Board work is quoted separately after port-level faults are ruled out." },
    ],
    commonProblems: [
      { title: "Cable only works at one angle", description: "Lint, worn USB-C contacts, or corrosion can stop the cable seating properly." },
      { title: "Moisture or debris warning", description: `${context.brandName} devices can report moisture or debris in the USB-C port; we inspect before charging attempts.` },
      { title: "No data transfer", description: "A phone may charge but still fail USB data connection to a computer or accessory." },
      { title: profile.supportsWirelessCharging ? "Wireless charging still works" : "USB-C-only charging path fault", description: profile.supportsWirelessCharging ? "If wireless charging works but USB-C does not, the wired charging path gets priority diagnosis." : "If USB-C charging fails while battery condition is normal, we isolate the wired charging path first." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect USB-C socket", description: "We check cable seating, debris, corrosion, moisture alerts, and pin condition." },
      { step: "02", title: "Measure charging response", description: profile.supportsWirelessCharging ? "Charge draw, adapter response, battery condition, and wireless charging are tested." : "Charge draw, adapter response, and battery condition are tested." },
      { step: "03", title: "Validate data and audio", description: "USB data transfer, microphones, speaker behaviour, and accessory detection are checked." },
      { step: "04", title: "Confirm repair path", description: "We explain whether cleaning, port replacement, or board-level diagnosis is the right next step." },
    ],
    faq: [
      { question: `Does my ${modelName} USB-C port need cleaning or replacement?`, answer: "Not always. Many faults are caused by lint or debris, so we inspect and clean where safe before quoting replacement." },
      { question: `Do you test data transfer after ${modelName} charging port repair?`, answer: profile.supportsWirelessCharging ? "Yes. We test USB-C charging, data connection, cable fit, microphone behaviour, speaker output, wireless charging, and normal operation." : "Yes. We test USB-C charging, data connection, cable fit, microphone behaviour, speaker output, and normal operation." },
      { question: `Can a ${modelName} charging fault be board-level?`, answer: "Yes. If known-good cables, batteries, and port assemblies do not solve the issue, we explain the board-level charging path before extra work." },
    ],
  };
}

function buildSamsungS23BackHousingPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  const coilCopy = profile.supportsWirelessCharging
    ? "wireless charging coil, NFC area, antenna lines, and frame straightness"
    : "NFC area, antenna lines, and frame straightness";
  const coilNotes = profile.supportsWirelessCharging
    ? "Wireless charging coil, NFC area, antenna lines, and camera rings are protected during repair."
    : "NFC area, antenna lines, and camera rings are protected during repair.";
  const coilRisk = profile.supportsWirelessCharging
    ? "Impact near the coil can affect wireless charging or Wireless PowerShare."
    : "Impact near the rear housing can affect NFC or antenna performance.";
  const coilStep = profile.supportsWirelessCharging
    ? "Wireless charging, NFC/payment area, antenna lines, camera rings, and rear microphone areas are handled carefully."
    : "NFC/payment area, antenna lines, camera rings, and rear microphone areas are handled carefully.";
  const coilFinal = profile.supportsWirelessCharging
    ? "Wireless charging, cameras, buttons, frame edges, and normal handling are checked before return."
    : "NFC/payment response, cameras, buttons, frame edges, and normal handling are checked before return.";

  return {
    quickAnswer:
      `Need ${modelName} back glass or rear housing repair in Ringwood? Ali Mobile & Repair checks cracked rear glass, camera ring fit, ${coilCopy} before bonding.`,
    workbenchHeadings: {
      options: `Which rear-housing path fits this ${modelName}?`,
      diagnostics: `What do we inspect before ${context.brandName} rear repair?`,
      symptoms: "Which rear-glass symptoms matter most?",
      outcomes: "What can affect rear-housing alignment?",
    },
    repairOptions: [
      { name: "Rear glass replacement path", shortDescription: "For cracked back glass with a usable frame, we focus on controlled removal, cleanup, and clean rear panel bonding.", bestFor: "Cracked rear glass, lifted corners, or cosmetic damage without severe frame bend.", notes: coilNotes },
      { name: "Housing condition assessment", shortDescription: "If the side frame is bent or crushed, we check whether rear glass alone will sit correctly.", bestFor: "Corner dents, camera ring gaps, lifted back glass, or frame distortion after impact.", notes: "A bent frame can cause lifting or uneven bonding if ignored." },
      { name: profile.supportsWirelessCharging ? "Wireless charging and camera validation" : "Rear function and camera validation", shortDescription: profile.supportsWirelessCharging ? "After repair, we check rear camera fit, wireless charging, NFC/payment awareness, buttons, and frame edges." : "After repair, we check rear camera fit, NFC/payment awareness, buttons, and frame edges.", bestFor: "Customers who want cosmetic repair plus functional checks before pickup.", notes: "Existing coil or camera-area impact damage is explained before final approval." },
    ],
    commonProblems: [
      { title: "Cracked rear glass", description: "Broken glass can shed sharp flakes and allow dust or moisture into the rear housing area." },
      { title: profile.supportsWirelessCharging ? "Wireless charging inconsistency" : "Rear housing signal risk", description: coilRisk },
      { title: "Camera ring gaps", description: "Cracks around the camera rings need careful cleanup so the replacement panel sits cleanly." },
      { title: "Frame bend", description: "Frame distortion can stop the rear panel from bonding flat." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Inspect glass and frame", description: "We check cracks, lifted corners, camera ring damage, side rail bends, and safety to open." },
      { step: "02", title: "Protect rear functional areas", description: coilStep },
      { step: "03", title: "Clean and align", description: "Glass residue and adhesive channels are cleared before panel fit is checked." },
      { step: "04", title: "Final function checks", description: coilFinal },
    ],
    faq: [
      { question: `Can you repair cracked ${modelName} back glass in Ringwood?`, answer: `Yes. We handle ${context.brandName} rear glass and housing repair with controlled removal, adhesive cleanup, camera ring checks, and frame alignment before handover.` },
      { question: profile.supportsWirelessCharging ? `Will ${modelName} back glass repair affect wireless charging?` : `Can rear glass damage affect ${modelName} NFC or signal behaviour?`, answer: profile.supportsWirelessCharging ? "We protect the wireless charging coil and test wireless charging before return. Existing impact damage can still affect the coil, so we inspect first." : "Yes, impact around the rear housing can also affect NFC or antenna paths. We inspect those areas before and after repair." },
      { question: `Do you check NFC or payment-related areas during ${modelName} rear repair?`, answer: "We handle the rear housing, antenna, and NFC/payment areas carefully and explain any impact-related risk found during inspection." },
    ],
  };
}

function buildSamsungS23CameraPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${modelName} camera repair in Ringwood? Ali Mobile & Repair checks lens glass, focus, stabilisation, ${profile.cameraSummary}, app behaviour, and rear housing impact before quoting.`,
    workbenchHeadings: {
      options: `Which camera repair path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.brandName} camera repair?`,
      symptoms: `Which ${context.familyName} camera symptoms matter most?`,
      outcomes: "What can affect camera repair results?",
    },
    repairOptions: [
      { name: "Camera app diagnosis", shortDescription: "We test focus, zoom switching, stabilisation, flash, camera app behaviour, and visible lens damage.", bestFor: "Blurry photos, shaking image, camera failed warnings, black preview, or inconsistent zoom.", notes: "Software and app-level faults are checked before quoting hardware work." },
      { name: "Lens glass repair path", shortDescription: "For cracked outer lens glass, we check dust risk, camera ring fit, and whether the camera module is still clear.", bestFor: "Cracked lens glass where the camera still opens and focuses.", notes: "Dust inside the camera path can affect the result even after lens glass repair." },
      { name: "Camera module replacement path", shortDescription: `For module-level faults, we validate ${profile.cameraSummary} before and after repair.`, bestFor: "Failed focus, shaking image, black camera, damaged module, or impact around the camera island.", notes: "If impact damaged the board or connector path, we explain that separately." },
    ],
    commonProblems: [
      { title: "Blurry or shaking camera", description: "Impact can damage focus or stabilisation, especially around the camera island." },
      { title: "Cracked lens glass", description: "Lens glass damage can let dust in and reduce photo clarity." },
      { title: "Camera failed message", description: `${context.brandName} camera app faults can be software, module, connector, or board related.` },
      { title: "Zoom or lens switching failure", description: "Multi-camera models need each lens path tested, not just the main camera." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Test camera modes", description: "Photo, video, zoom switching, focus, stabilisation, flash, and app launch are checked." },
      { step: "02", title: "Inspect lens and housing", description: "Lens glass, camera rings, rear housing impact, and dust entry are inspected." },
      { step: "03", title: "Confirm module or glass path", description: "We explain whether lens glass, module replacement, or deeper diagnosis is needed." },
      { step: "04", title: "Final image checks", description: "Focus, zoom, video, flash, and normal app behaviour are checked before return." },
    ],
    faq: [
      { question: `Can you fix a blurry or shaking ${modelName} camera?`, answer: "Yes. We test lens glass, focus, stabilisation, camera app behaviour, and module response before quoting the repair path." },
      { question: `Do you repair cracked ${modelName} camera lens glass?`, answer: "Yes, if the camera module is still healthy. We inspect for dust, focus issues, and impact around the camera ring first." },
      { question: `Do you test all ${modelName} camera lenses?`, answer: `Yes. We test ${profile.cameraSummary} so the phone is checked beyond just the main camera.` },
    ],
  };
}

function buildSamsungS23WaterPocket(
  modelName: string,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${modelName} water damage assessment in Ringwood? Ali Mobile & Repair prioritises power safety, USB-C moisture risk, corrosion inspection, screen and battery checks, data-preservation awareness, and clear reporting before major part replacement.`,
    workbenchHeadings: {
      options: `Which water-damage path fits this ${modelName}?`,
      diagnostics: "What do we inspect after liquid exposure?",
      symptoms: `Which ${context.brandName} liquid symptoms matter most?`,
      outcomes: "What can affect recovery?",
    },
    repairOptions: [
      { name: "Do-not-charge triage", shortDescription: "We start with safe handling, moisture indicators, USB-C port inspection, and no-charge guidance.", bestFor: "Phones exposed to water, rain, spills, or moisture warnings.", notes: "Charging a wet USB-C phone can worsen corrosion or shorts." },
      { name: "Corrosion cleaning assessment", shortDescription: "Where appropriate, we open, inspect connectors, clean corrosion, and stabilise before testing modules.", bestFor: "Phones with no power, boot loops, charging faults, screen faults, speaker issues, or camera fog after liquid exposure.", notes: "Water recovery is unpredictable, so we report what is recovered and what remains risky." },
      { name: "Data-first recovery path", shortDescription: "If photos or files matter most, we prioritise safe stabilisation for backup where possible.", bestFor: "Customers who care more about data than cosmetic or full functional repair.", notes: "Success depends on corrosion level, board condition, and how quickly the device is assessed." },
    ],
    commonProblems: [
      { title: "USB-C moisture warning", description: `${context.brandName} devices can detect moisture or debris in the USB-C port. Do not keep testing chargers before assessment.` },
      { title: "No power or boot loop", description: "Liquid can affect battery, display, connectors, or board-level power paths." },
      { title: "Screen, speaker, or camera faults", description: "Moisture can reach display connectors, speaker mesh, camera lenses, and board areas." },
      { title: "Corrosion delay", description: "A phone can appear fine at first, then fail later as corrosion develops." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Power safety check", description: "We avoid charging, check symptoms, and inspect the USB-C port and visible liquid indicators." },
      { step: "02", title: "Open and inspect", description: "Connectors, board areas, corrosion, residue, battery, and display paths are inspected before quoting parts." },
      { step: "03", title: "Clean and stabilise", description: "Where appropriate, corrosion is cleaned and the phone is dried before module testing." },
      { step: "04", title: "Report next steps", description: "We explain what recovered, what remains risky, and which parts or board work would be needed next." },
    ],
    faq: [
      { question: `What should I do first if my ${modelName} gets wet?`, answer: "Power it off if possible, do not charge it, and bring it in quickly. Charging after liquid exposure can worsen shorts or corrosion." },
      { question: `Can Ali Mobile recover data from a water-damaged ${modelName}?`, answer: "If data matters most, we prioritise stabilising the phone enough for backup where possible. Success depends on corrosion level and board condition." },
      { question: `Is ${modelName} water damage repair covered by the normal warranty?`, answer: "Water damage recovery is unpredictable, so cleaning and rescue work does not carry the same warranty as a standard part replacement." },
    ],
  };
}

function buildSamsungS23LogicBoardPocket(
  modelName: string,
  profile: SamsungGalaxyHardwareProfile,
  context: AndroidRepairBrandContext = SAMSUNG_GALAXY_CONTEXT
): RepairTypeSeoPocket {
  return {
    quickAnswer:
      `Need ${modelName} logic board diagnosis in Ringwood? Ali Mobile & Repair checks no-power faults, USB-C charging paths, display connector behaviour, corrosion risk, short detection, and data-preservation priorities before quoting board work.`,
    workbenchHeadings: {
      options: `Which board diagnosis path fits this ${modelName}?`,
      diagnostics: `What do we test before ${context.brandName} board work?`,
      symptoms: "Which board-level symptoms matter most?",
      outcomes: "What can affect board repair results?",
    },
    repairOptions: [
      {
        name: "No-power board triage",
        shortDescription:
          "We test battery response, USB-C current draw, display output, heat signatures, and visible corrosion before quoting board-level work.",
        bestFor:
          "Phones that will not power on, boot loop, heat quickly, or do not respond to known-good charging parts.",
        notes:
          "We separate battery, screen, port, and board symptoms before recommending micro-soldering.",
      },
      {
        name: "Charging-path diagnosis",
        shortDescription:
          "When USB-C port and battery checks pass but charging still fails, we inspect the board-level charging path.",
        bestFor:
          "Phones with no wired charging, unstable charging, or current draw that points beyond the lower port assembly.",
        notes:
          profile.supportsWirelessCharging
            ? "Wireless charging behaviour is also checked because it can help isolate the failed path."
            : "Wired charging behaviour is checked to isolate the failed power route.",
      },
      {
        name: "Data-first board recovery",
        shortDescription:
          "If data matters most, we prioritise stabilising the board enough for backup where possible.",
        bestFor:
          "Phones with photos, messages, work files, or account data that matter more than full cosmetic restoration.",
        notes:
          "Recovery depends on board condition, corrosion, previous repair attempts, and whether storage-related circuits remain healthy.",
      },
    ],
    commonProblems: [
      { title: "No power or boot loop", description: "Board-level faults can mimic battery, display, or USB-C charging failure." },
      { title: "Short or heat under load", description: "Rapid heat, abnormal current draw, or shutdowns can point to board-level damage." },
      { title: "Liquid corrosion", description: "Moisture can corrode connectors and board paths even after the phone appears dry." },
      { title: "Data access risk", description: "When storage or power rails are affected, diagnosis should prioritise data-preservation goals." },
    ],
    diagnosticSteps: [
      { step: "01", title: "Rule out modular parts", description: "Battery, screen, USB-C port, cables, and visible connector issues are checked first." },
      { step: "02", title: "Measure board behaviour", description: "Current draw, heat, charging response, and boot behaviour are assessed before quoting." },
      { step: "03", title: "Inspect corrosion and impact", description: "Liquid indicators, board residue, connector damage, and previous repair marks are reviewed." },
      { step: "04", title: "Report repair or recovery path", description: "We explain whether board repair, data-first recovery, or part-level repair is the practical next step." },
    ],
    faq: [
      { question: `Can Ali Mobile diagnose a no-power ${modelName}?`, answer: "Yes. We check battery, screen, USB-C charging, current draw, heat, corrosion, and board behaviour before quoting." },
      { question: `Is ${modelName} logic board repair always worth doing?`, answer: "Not always. We explain the risk, cost, data priority, and likely outcome before any board-level work is approved." },
      { question: `Can you recover data from a ${modelName} with board damage?`, answer: "Sometimes. If data matters most, we prioritise stabilising the device enough for backup where the board condition allows it." },
    ],
  };
}

function getSamsungGalaxySRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGalaxySPhoneSlug(normalizedModel)) return null;

  const modelName = deriveSamsungGalaxySModelName(normalizedModel);
  const profile = getSamsungGalaxySProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile);
    default:
      return null;
  }
}

function getSamsungGalaxyARepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGalaxyAPhoneSlug(normalizedModel)) return null;

  const modelName = deriveSamsungGalaxyAModelName(normalizedModel);
  const profile = getSamsungGalaxyAProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile);
    default:
      return null;
  }
}

function getSamsungGalaxyNoteRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGalaxyNotePhoneSlug(normalizedModel)) return null;

  const modelName = deriveSamsungGalaxyNoteModelName(normalizedModel);
  const profile = getSamsungGalaxyNoteProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName, SAMSUNG_NOTE_CONTEXT);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile, SAMSUNG_NOTE_CONTEXT);
    default:
      return null;
  }
}

function getSamsungGalaxyZRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGalaxyZPhoneSlug(normalizedModel)) return null;

  const modelName = deriveSamsungGalaxyZModelName(normalizedModel);
  const profile = getSamsungGalaxyZProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName, SAMSUNG_Z_CONTEXT);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile, SAMSUNG_Z_CONTEXT);
    default:
      return null;
  }
}

function getGooglePixelRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isGooglePixelPhoneSlug(normalizedModel)) return null;

  const modelName = deriveGooglePixelModelName(normalizedModel);
  const profile = getGooglePixelProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName, GOOGLE_PIXEL_CONTEXT);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile, GOOGLE_PIXEL_CONTEXT);
    default:
      return null;
  }
}

function getOppoRepairPocket(modelSlug: string, repairType: string): RepairTypeSeoPocket | null {
  const normalizedModel = slugify(modelSlug);
  const normalizedRepairType = slugify(repairType);

  if (!isOppoPhoneSlug(normalizedModel)) return null;

  const modelName = deriveOppoModelName(normalizedModel);
  const profile = getOppoProfile(normalizedModel);

  if (!modelName || !profile) return null;

  switch (normalizedRepairType) {
    case "screen-replacement":
    case "screen-repair":
      return buildSamsungS23ScreenPocket(modelName, profile, OPPO_CONTEXT);
    case "battery-replacement":
    case "battery-service":
      return buildSamsungS23BatteryPocket(modelName, profile, OPPO_CONTEXT);
    case "charging-port":
    case "charging-port-replacement":
    case "charging-port-repair":
      return buildSamsungS23ChargingPocket(modelName, profile, OPPO_CONTEXT);
    case "back-glass":
    case "back-housing-replacement":
    case "back-housing":
    case "back-glass-repair":
    case "rear-glass-repair":
      return buildSamsungS23BackHousingPocket(modelName, profile, OPPO_CONTEXT);
    case "camera-repair":
    case "front-camera-replacement":
    case "back-camera-replacement":
      return buildSamsungS23CameraPocket(modelName, profile, OPPO_CONTEXT);
    case "water-damage":
    case "water-damage-repair":
      return buildSamsungS23WaterPocket(modelName, OPPO_CONTEXT);
    case "logic-board":
    case "logic-board-repair":
      return buildSamsungS23LogicBoardPocket(modelName, profile, OPPO_CONTEXT);
    default:
      return null;
  }
}

function getRepairTypeSeoPocket(params: {
  category: string;
  brand: string;
  model: string;
  repairType: string;
}): RepairTypeSeoPocket | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);
  const repairType = slugify(params.repairType);

  if (category === "phone" && (brand === "iphone" || brand === "apple")) {
    const modelName = deriveIphoneModelNameFromSlug(model);
    const pocket = IPHONE_REPAIR_POCKET_TEMPLATE_BY_TYPE[repairType];

    if (modelName && pocket) {
      return personalizeIphoneRepairPocket(pocket, modelName, repairType, model);
    }
  }

  if (category === "phone" && (brand === "samsung" || brand === "galaxy")) {
    const sPocket = getSamsungGalaxySRepairPocket(model, repairType);
    if (sPocket) return sPocket;

    const aPocket = getSamsungGalaxyARepairPocket(model, repairType);
    if (aPocket) return aPocket;

    const notePocket = getSamsungGalaxyNoteRepairPocket(model, repairType);
    if (notePocket) return notePocket;

    const zPocket = getSamsungGalaxyZRepairPocket(model, repairType);
    if (zPocket) return zPocket;
  }

  if (category === "phone" && (brand === "google" || brand === "google-pixel" || brand === "pixel")) {
    const googlePocket = getGooglePixelRepairPocket(model, repairType);
    if (googlePocket) return googlePocket;
  }

  if (category === "phone" && brand === "oppo") {
    const oppoPocket = getOppoRepairPocket(model, repairType);
    if (oppoPocket) return oppoPocket;
  }

  return null;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  const params: { category: string; brand: string; model: string; 'repair-type': string }[] = [];

  for (const brand of catalog.brands) {
    for (const model of brand.models) {
      for (const repair of REPAIR_TYPES) {
        params.push({
          category: brand.category,
          brand: brand.slug,
          model: model.slug,
          'repair-type': repair.slug
        });
      }
    }
  }

  return params;
}

/** Stable hash: deterministic index from a string (sum of char codes mod length). */
function stableHash(str: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash + str.charCodeAt(i) * (i + 1)) % 1_000_000;
  }
  return hash % modulo;
}

const META_DESCRIPTION_TEMPLATES = [
  (m: string, r: string) =>
    `Fast, professional ${m} ${r.toLowerCase()} in Ringwood, Melbourne. Under 1 hour, 6-month warranty, No Fix No Charge. Book now.`,
  (m: string, r: string) =>
    `Need a ${m} ${r.toLowerCase()}? Our Ringwood experts complete most jobs in under 60 minutes with premium-quality parts and a 6-month guarantee.`,
  (m: string, r: string) =>
    `Walk-in ${m} ${r.toLowerCase()} at Ali Mobile Ringwood. Same-day turnaround, transparent pricing, and a No Fix No Charge promise. Call or book online.`,
  (m: string, r: string) =>
    `Expert ${m} ${r.toLowerCase()} service near you in Ringwood. Quick turnaround, 6-month warranty on all parts, and free diagnostics. Get started today.`,
];

export async function generateMetadata({ params }: RepairPageProps) {
  const resolvedParams = await params;
  const details = await fetchRepairDetails(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );

  const model = details?.model || formatDynamicParam(resolvedParams.model);
  const repairName = details?.repairType || formatDynamicParam(resolvedParams['repair-type']);
  const priceStr = details?.price ? ` from $${details.price}` : '';
  const modelCode = details?.modelCode;

  const title = modelCode
    ? `${model} ${repairName} | Ringwood${priceStr} | ${modelCode}`
    : `${model} ${repairName} in Ringwood${priceStr} | Ali Mobile`;
    
  const templateIdx = stableHash(`${model}${repairName}`, META_DESCRIPTION_TEMPLATES.length);
  const description = META_DESCRIPTION_TEMPLATES[templateIdx](model, repairName);

  return { title, description };
}

function WaterDamagePolicySection() {
  return (
    <div className="page-container" style={{ paddingTop: '0', paddingBottom: '0' }}>
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fee2e2',
        borderRadius: '1rem',
        padding: '2rem',
        marginTop: '0rem',
        marginBottom: '3rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <ShieldAlert size={28} color="#dc2626" />
          <h2 style={{ margin: 0, color: '#991b1b', fontSize: '1.5rem', fontWeight: 700 }}>
            Special Policy: Water Damage Recovery
          </h2>
        </div>
        <div style={{ color: '#b91c1c', lineHeight: '1.6', fontSize: '1.05rem' }}>
          <p style={{ margin: 0 }}>
            While our general motto is "No Fix, No Charge," water damage is a special case. 
            Liquid damage requires immediate intervention: we must completely disassemble your phone, dry every component, 
            and perform professional alcohol cleaning to stop corrosion. Because this specialized labor is required regardless 
            of the final outcome, a labor fee applies even if the phone is not successfully repaired. 
            Furthermore, due to the complexity of motherboard corrosion, we do not provide a general warranty for 
            water damage rescue. <em>Exception:</em> If a specific part (e.g., a screen) is replaced, that part will carry 
            our standard warranty.
          </p>
        </div>
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import RepairTypeClient from '@/components/services/RepairTypeClient';
import RepairPricingAndCTA from '@/components/services/RepairPricingAndCTA';

export default async function RepairServicePage({ params }: RepairPageProps) {
  const resolvedParams = await params;
  const details = await fetchRepairDetails(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );

  if (!details && !resolvedParams.model) {
    notFound();
  }

  // Use POS data if available, otherwise derive from URL params
  const displayBrand = details?.brand || formatDynamicParam(resolvedParams.brand);
  const displayModel = details?.model || formatDynamicParam(resolvedParams.model);
  const repairTypeDerived = details?.repairType || formatDynamicParam(resolvedParams['repair-type']);
  const price = details?.price || 0;
  const modelCode = details?.modelCode;
  const seoPocket = getRepairTypeSeoPocket({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: resolvedParams['repair-type'],
  });

  // Validate repair type exists in our known list, or accept POS-provided name
  const knownRepair = REPAIR_TYPES.find(r => r.slug === resolvedParams['repair-type']);
  const finalRepairName = knownRepair?.name || repairTypeDerived;

  const faqs = seoPocket?.faq || generateFaqs(displayModel, finalRepairName, resolvedParams['repair-type'], price, modelCode, displayBrand);

  return (
    <>
      <RepairServiceSchema
        serviceName={`${displayModel} ${finalRepairName} in Ringwood`}
        description={`Professional ${finalRepairName} for ${displayModel} in Ringwood. Expert technicians, fast turnaround, 6-month warranty.`}
        price={price > 0 ? String(price) : undefined}
        modelCode={modelCode}
      />

      <RepairTypeClient 
        deviceModel={displayModel}
        repairType={finalRepairName}
        price={price}
      />

      {/* Repair detail hero */}
      <main className="repair-page-shell repair-page-shell-narrow" style={{ paddingBottom: '0' }}>
        <Breadcrumbs category={resolvedParams.category} brand={resolvedParams.brand} model={resolvedParams.model} service={resolvedParams['repair-type']} />

        <section className="repair-hero repair-detail-hero relative" aria-labelledby="repair-detail-heading">
          <span className="repair-detail-icon">{getRepairIcon(resolvedParams['repair-type'])}</span>
          <h1>{displayModel} {finalRepairName} in Ringwood</h1>
          <p className="repair-detail-subtitle">Choose a quality tier, confirm the quote, then book the repair path that fits your device and budget.</p>

          <RepairPricingAndCTA 
            brandName={displayBrand}
            modelName={displayModel}
            repairName={finalRepairName}
            variants={details?.variants || []}
          />

          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-badge-icon"><Zap size={20} strokeWidth={2.5} aria-hidden="true" /></span>
              Under 1 Hour
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon">
                {resolvedParams['repair-type'] === 'water-damage-repair' ? <ShieldAlert size={20} strokeWidth={2.5} aria-hidden="true" /> : <ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" />}
              </span>
              {resolvedParams['repair-type'] === 'water-damage-repair' ? 'Specialist Rescue' : 'No Fix, No Charge'}
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon"><CheckCircle size={20} strokeWidth={2.5} aria-hidden="true" /></span>
              6-Month Warranty
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
              Clear Quote First
            </div>
          </div>
        </section>
      </main>

      {/* ─── SOCIAL PROOF ─────────────────────────────── */}
      <ReviewsSection />

      {/* ─── WATER DAMAGE POLICY ──────────────────────── */}
      {resolvedParams['repair-type'] === 'water-damage-repair' && <WaterDamagePolicySection />}

      {seoPocket && <TechnicianWorkbenchProcess pocket={seoPocket} />}

      {/* ─── FAQ SECTION ──────────────────────────────── */}
      <FaqAccordion faqs={faqs} />
    </>
  );
}
