import React from 'react';
import { REPAIR_TYPES, LSI_KEYWORDS } from '@/data/seo-data';
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

const IPHONE_13_SERIES_MODEL_NAMES: Record<string, string> = {
  "iphone-13": "iPhone 13",
  "iphone-13-mini": "iPhone 13 Mini",
  "iphone-13-pro": "iPhone 13 Pro",
  "iphone-13-pro-max": "iPhone 13 Pro Max",
};

const IPHONE_13_SERIES_REPAIR_POCKETS: Record<string, RepairTypeSeoPocket> = {
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

function personalizeIphone13SeriesPocket(pocket: RepairTypeSeoPocket, modelName: string) {
  if (modelName === "iPhone 13") return pocket;

  return JSON.parse(
    JSON.stringify(pocket).replaceAll("iPhone 13", modelName)
  ) as RepairTypeSeoPocket;
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
    const modelName = IPHONE_13_SERIES_MODEL_NAMES[model];
    const pocket = IPHONE_13_SERIES_REPAIR_POCKETS[repairType];

    if (modelName && pocket) {
      return personalizeIphone13SeriesPocket(pocket, modelName);
    }
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

export function generateFaqs(model: string, repairName: string, repairSlug: string, price: number, modelCode?: string, brand?: string) {
  const lsi = getLSIForRepair(repairSlug);
  const component = lsi.component?.[0] || repairName.toLowerCase();
  const altComponent = lsi.component?.[1] || 'damaged component';
  
  const displayModel = modelCode ? `${model} (${modelCode})` : model;
  const isWaterDamage = repairSlug === 'water-damage-repair';
  
  const priceInfo = isWaterDamage
    ? `Water damage recovery starts from $50 for the intensive cleaning and drying process. If additional parts like a screen or battery are needed, we will provide a comprehensive quote after the internal assessment.`
    : (price > 0
      ? `Starting from $${price}, the exact pricing depends on the specific ${displayModel} variant.`
      : `Pricing depends on the specific ${displayModel} variant and the condition of the ${component}. Use our Live Quote tool or call 0481 058 514 for an instant, accurate price.`);

  const baseFaqs = [
    {
      question: `How long does the ${model} ${repairName} take?`,
      answer: isWaterDamage 
        ? `Water damage recovery typically takes around 1 hour. If the damage is extensive and requires more time for professional drying or component cleaning, our technicians will inform you beforehand.`
        : `Most ${model} ${repairName.toLowerCase()} jobs are completed in under 1 hour at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. Walk-ins are welcome on weekdays for same-day service.`,
    },
    {
      question: `Do you use OEM parts for ${model} ${repairName.toLowerCase()}?`,
      answer: isWaterDamage
        ? `For water damage, our first priority is to rescue your original high-quality boards and components using specialized cleaning. If a component like the screen is beyond saving, we replace it with premium parts that meet or exceed OEM standards.`
        : `We use premium-quality ${component} parts that meet or exceed OEM specifications. All parts come with our 6-month warranty, so you can be confident in the quality of the ${altComponent} replacement.`,
    },
    {
      question: `How much does a ${model} ${repairName.toLowerCase()} cost?`,
      answer: `${priceInfo} ${isWaterDamage ? 'Please note that due to the labor-intensive nature of the drying and cleaning process, a specialized labor fee applies even if the device is ultimately unrepairable.' : 'Our "No Fix, No Charge" policy means you only pay if we successfully complete the repair.'}`,
    },
    {
      question: `What if my ${model} has additional damage beyond the ${isWaterDamage ? 'initial leak' : component}?`,
      answer: `Our technicians perform a free diagnostic assessment on every device. ${isWaterDamage ? 'Water damage often affects multiple areas simultaneously. We will test every function and give you a full report before you commit to any major part replacements.' : `If we discover additional issues such as ${lsi.issue?.[0] || 'internal damage'}, we'll inform you before proceeding with any extra work. You're never charged for repairs you didn't approve.`}`,
    },
    {
      question: `Is there a warranty for ${model} water damage recovery?`,
      answer: isWaterDamage
        ? `Due to the unpredictable nature of liquid-induced corrosion, we do not offer a general warranty on water damage rescue services. However, if we replace a specific part (like a new screen), that specific part will still be covered by our 6-month warranty, provided the rest of the device remains stable.`
        : `Yes, all our standard repairs come with a comprehensive 6-month warranty on both parts and labor at our Ringwood location.`,
    },
  ];

  if ((brand?.toLowerCase() === 'apple' || brand?.toLowerCase() === 'iphone') && repairSlug.includes('screen')) {
    baseFaqs.splice(1, 0, {
      question: "What is the difference between Standard, Premium, and Genuine screens?",
      answer: `We offer three tiers to suit your budget: <br/><br/> 
<b>1. Standard (In-cell LCD):</b> A budget-friendly aftermarket option. It works reliably, but uses LCD technology instead of OLED, meaning colors are slightly cooler and it consumes a bit more battery. Best for a quick, cost-effective fix. <br/><br/>
<b>2. Premium (Soft OLED) - ⭐ Highly Recommended:</b> This is our most popular option and the sweet spot for value. It uses the exact same Soft OLED technology as your original Apple screen. You get the deep blacks, vibrant colors, perfect edge-to-edge touch sensitivity, and original battery efficiency, all at a significantly better price than the Genuine part. <br/><br/>
<b>3. Genuine (OEM):</b> The uncompromised original factory display. It offers maximum quality for purists, but comes with the highest price tag.`
    });
  }

  return baseFaqs;
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

export function getLSIForRepair(slug: string): { component?: string[]; issue?: string[] } {
  if (slug === 'screen-replacement') return { component: LSI_KEYWORDS.components.screen, issue: LSI_KEYWORDS.issues.screenDamage };
  if (slug === 'battery-replacement') return { component: LSI_KEYWORDS.components.battery, issue: LSI_KEYWORDS.issues.batteryDrain };
  if (slug === 'charging-port-repair' || slug === 'charging-port-replacement') return { component: LSI_KEYWORDS.components.chargingPort };
  if (slug === 'water-damage-repair') return { issue: LSI_KEYWORDS.issues.waterDamage };
  if (slug === 'back-glass-repair' || slug === 'back-housing-replacement') return { component: ['back housing', 'rear panel', 'back glass'] };
  if (slug === 'camera-repair' || slug === 'front-camera-replacement' || slug === 'back-camera-replacement') return { component: ['camera module', 'lens assembly'] };
  return {};
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
