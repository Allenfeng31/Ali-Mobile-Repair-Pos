import { LSI_KEYWORDS } from '@/data/seo-data';

export function getLSIForRepair(slug: string): { component?: string[]; issue?: string[] } {
  if (slug === 'screen-replacement') return { component: LSI_KEYWORDS.components.screen, issue: LSI_KEYWORDS.issues.screenDamage };
  if (slug === 'battery-replacement') return { component: LSI_KEYWORDS.components.battery, issue: LSI_KEYWORDS.issues.batteryDrain };
  if (slug === 'charging-port-repair' || slug === 'charging-port-replacement') return { component: LSI_KEYWORDS.components.chargingPort };
  if (slug === 'water-damage-repair') return { issue: LSI_KEYWORDS.issues.waterDamage };
  if (slug === 'back-glass-repair' || slug === 'back-housing-replacement') return { component: ['back housing', 'rear panel', 'back glass'] };
  if (slug === 'camera-repair' || slug === 'front-camera-replacement' || slug === 'back-camera-replacement') return { component: ['camera module', 'lens assembly'] };
  return {};
}

export function generateFaqs(model: string, repairName: string, repairSlug: string, price: number, modelCode?: string, brand?: string) {
  const lsi = getLSIForRepair(repairSlug);
  const component = lsi.component?.[0] || repairName.toLowerCase();
  const altComponent = lsi.component?.[1] || 'damaged component';

  const displayModel = modelCode ? `${model} (${modelCode})` : model;
  const isWaterDamage = repairSlug === 'water-damage-repair';
  const isLogicBoard = repairSlug === 'logic-board-repair';
  const isDataRecovery = repairSlug === 'data-recovery';
  const isNoPower = repairSlug === 'no-power';
  const isComplexDiagnostic = isLogicBoard || isDataRecovery || isNoPower;
  const isBackGlass = repairSlug.includes('back-glass') || repairSlug.includes('back-housing');

  const priceInfo = isWaterDamage
    ? `Water damage recovery starts from $50 for the intensive cleaning and drying process. If additional parts like a screen or battery are needed, we will provide a comprehensive quote after the internal assessment.`
    : (price > 0
      ? `Starting from $${price}, the exact pricing depends on the specific ${displayModel} variant.`
      : `Pricing depends on the specific ${displayModel} variant and the condition of the ${component}. Use our Live Quote tool or call 0481 058 514 for an instant, accurate price.`);

  let q1 = { question: "", answer: "" };
  if (isLogicBoard) {
    q1 = {
      question: `How long does ${model} logic board repair take?`,
      answer: `Board-level repairs need inspection first. Timing depends on fault location, parts availability and testing results. We confirm the repair path and quote after diagnosis.`
    };
  } else if (isDataRecovery) {
    q1 = {
      question: `Can you recover data from my ${model}?`,
      answer: `Data recovery depends on device condition and storage damage. We inspect the phone first and explain the safest available recovery option before starting.`
    };
  } else if (isNoPower) {
    q1 = {
      question: `Why won't my ${model} turn on?`,
      answer: `No-power faults can be caused by battery, charging port, board-level issues or liquid damage. We inspect the device first before confirming the repair path.`
    };
  } else {
    q1 = {
      question: `How long does the ${model} ${repairName} take?`,
      answer: isWaterDamage
        ? `Water damage recovery typically takes around 1 hour for the initial assessment and cleaning. If the damage is extensive, our technicians will inform you beforehand.`
        : isBackGlass
        ? `Time depends on the specific ${model} variant and parts availability. Many back glass repairs need more time than simple screen or battery repairs, usually taking longer to ensure a safe, clean removal and precise bonding. We confirm the timeframe after checking the device at our Ringwood location.`
        : `Most ${model} ${repairName.toLowerCase()} jobs are completed quickly at Ringwood Square Shopping Centre, often in under 1 hour for common parts. Walk-ins are welcome on weekdays for fast service.`
    };
  }

  let q2 = { question: "", answer: "" };
  if (isLogicBoard || isNoPower) {
    q2 = {
      question: `What do you check before a board-level or no-power repair?`,
      answer: `We check power behaviour, charging response, short circuits, liquid damage signs and visible connector damage before recommending board-level work.`
    };
  } else if (isDataRecovery) {
    q2 = {
      question: `Do you replace parts for data recovery?`,
      answer: `Data recovery focuses on safely accessing your data. Some cases may need board-level work or temporary repair steps, but the final method depends on inspection.`
    };
  } else {
    q2 = {
      question: `What part option will be used for ${model} ${repairName.toLowerCase()}?`,
      answer: isWaterDamage
        ? `For water damage, our first priority is to assess and clean the original boards and components where practical. If a component like the screen is beyond saving, any replacement part is selected to match the repair option confirmed in your quote before the repair begins.`
        : `We confirm the available ${component} option, model compatibility, price and repair requirements before work begins. The quote explains which part option is being used, and eligible fitted parts include our 6-month warranty.`
    };
  }

  const baseFaqs = [
    q1,
    q2,
    {
      question: `How much does a ${model} ${repairName.toLowerCase()} cost?`,
      answer: `${priceInfo} ${isWaterDamage ? 'Please note that due to the labor-intensive nature of the drying and cleaning process, a specialized labor fee applies even if the device is ultimately unrepairable.' : 'Our "No Fix, No Charge" policy means you only pay if we successfully complete the repair.'}`,
    },
    {
      question: `What if my ${model} has additional damage beyond the ${isWaterDamage ? 'initial leak' : component}?`,
      answer: `Our technicians perform a free diagnostic assessment on every device. ${isWaterDamage ? 'Water damage often affects multiple areas simultaneously. We will test every function and give you a full report before you commit to any major part replacements.' : `If we discover additional issues such as ${lsi.issue?.[0] || 'internal damage'}, we'll inform you before proceeding with any extra work. You're never charged for repairs you didn't approve.`}`,
    },
    {
      question: `Is there a warranty for ${model} ${isWaterDamage ? 'water damage recovery' : repairName.toLowerCase()}?`,
      answer: isWaterDamage
        ? `Due to the unpredictable nature of liquid-induced corrosion, we do not offer a general warranty on water damage rescue services. However, if we replace a specific part (like a new screen), that specific part will still be covered by our 6-month warranty, provided the rest of the device remains stable.`
        : isComplexDiagnostic
        ? `Warranty coverage depends on the final repair path. If parts are replaced to restore function, they are covered by our standard 6-month warranty.`
        : `Yes, all our standard repairs come with a comprehensive 6-month warranty on both parts and labor at our Ringwood location.`,
    },
  ];

  if ((brand?.toLowerCase() === 'apple' || brand?.toLowerCase() === 'iphone') && repairSlug.includes('screen')) {
    baseFaqs.splice(1, 0, {
      question: "What is the difference between Standard, Premium, and Genuine screen options?",
      answer: `Screen options can vary by model and current availability. We explain which option your quote is based on before proceeding.<br/><br/>
<b>1. Standard aftermarket:</b> A budget-friendly aftermarket screen option. It may differ from the original display in colour, brightness, thickness, touch feel or power use depending on the model.<br/><br/>
<b>2. Premium aftermarket / Soft OLED:</b> A higher-grade option where available. Soft OLED options can provide display behaviour closer to the original OLED style than basic LCD options, but the exact result depends on the model and selected part.<br/><br/>
<b>3. Genuine or pulled genuine option where available:</b> Some models may have genuine, pulled genuine, refurbished genuine or service pack options depending on stock and quote confirmation. If available, we explain the condition, price and expected display behaviour before repair. Lower starting prices may refer to selected aftermarket options unless a genuine or pulled genuine option is clearly confirmed in the quote.`
    });
  }

  return baseFaqs;
}
