import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft, BadgeCheck, CheckCircle2, ClipboardCheck, Ear, PhoneCall, Power, ShieldCheck, Volume2, Wrench } from 'lucide-react';
import ReviewsSection from '@/components/ReviewsSection';
import FaqAccordion from '@/components/FaqAccordion';
import CommonRepairProblemsSection from '@/components/services/CommonRepairProblemsSection';
import CameraModuleRepairSelectionExperience from '@/components/services/CameraModuleRepairSelectionExperience';
import SharedRepairBookingControls from '@/components/services/SharedRepairBookingControls';
import SharedRepairPageV2BookingControls, { type SharedRepairPageV2QuickAnswers } from '@/components/services/SharedRepairPageV2BookingControls';
import SharedRepairPageV2ModelSections from '@/components/services/SharedRepairPageV2ModelSections';
import SharedRepairHierarchySections from '@/components/services/SharedRepairHierarchySections';
import SharedRepairSelectedDevice, { type SharedRepairSelectedDeviceViewModel } from '@/components/services/SharedRepairSelectedDevice';
import SharedRepairHeroSelection from '@/components/services/SharedRepairHeroSelection';
import SharedRepairPageResultsSection from '@/components/repair-results/SharedRepairPageResultsSection';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import { getSharedRepairBookingHref } from '@/lib/sharedRepairBooking';
import { getVirtualPhoneRepair, type VirtualPhoneRepair, type VirtualPhoneRepairModelOption, type VirtualPhoneRepairSlug } from '@/lib/virtualPhoneRepairs';
import { formatScopedRepairPriceLabel } from '@/lib/scopedRepairPriceLabel';
import type { SharedRepairPageCandidate, SharedRepairPageSupportedModel } from '@/lib/sharedRepairPageV2';
import type { SharedRepairHierarchyModel } from '@/lib/sharedRepairHierarchy';
import type { RepairResultMatchingItem } from '@/lib/repair-results';

export interface SharedVirtualRepairContent {
  diagnosis: string;
  testing: string;
}

export function getVirtualPhoneRepairHeading({
  brandName,
  brandSlug,
  repairName,
}: {
  brandName?: string;
  brandSlug?: string;
  repairName: string;
}) {
  if (brandSlug === 'samsung' || brandSlug === 'google-pixel' || brandSlug === 'oppo') return `${brandName} ${repairName}`;
  return `${brandName ? `${brandName} ` : 'Phone '}${repairName}`;
}

interface VirtualPhoneRepairLandingPageProps {
  brandName?: string;
  brandSlug?: string;
  repairSlug: VirtualPhoneRepairSlug;
  canonicalPath: string;
  models: VirtualPhoneRepairModelOption[];
  isGeneric?: boolean;
  sharedContent?: SharedVirtualRepairContent;
  sharedPageV2?: {
    supportedModels: SharedRepairPageSupportedModel[];
    priceCandidates: SharedRepairPageCandidate[];
    initialResults: RepairResultMatchingItem[];
    selectedModelSlug: string | null;
    quickAnswers: SharedRepairPageV2QuickAnswers;
  };
  initialResults?: RepairResultMatchingItem[];
  hierarchy?: {
    models: SharedRepairHierarchyModel[];
    selectedBrandSlug: string | null;
    selectedModelSlug: string | null;
    selectedDevice?: SharedRepairSelectedDeviceViewModel | null;
  };
}

type FaqItem = { question: string; answer: string };

type GenericRepairContentConfig = {
  cards: Array<{ title: string; body: string; link?: { href: string; label: string } }>;
  faqs: FaqItem[];
};

const GENERIC_REPAIR_CONTENT: Record<VirtualPhoneRepairSlug, GenericRepairContentConfig> = {
  'loudspeaker-replacement': {
    cards: [
      { title: 'Quick checks before repair', body: 'Test a ringtone, local media and speakerphone, then disconnect Bluetooth, wired headphones and USB-C audio accessories. Confirm the relevant volume level, remove a case only if it covers an opening, and use a clean dry soft brush or cloth around the grille—never liquid or sharp tools.' },
      { title: 'Loudspeaker, earpiece or microphone?', body: 'The bottom loudspeaker normally handles media, ringtones and speakerphone. The upper earpiece handles normal call audio, while the microphone controls what the other person hears. If only normal calls are quiet, the symptom may suit a different repair path.', link: { href: '/repairs/phone/earpiece-speaker-replacement', label: 'Compare earpiece speaker symptoms' } },
      { title: 'When it may be another fault', body: 'Dust, moisture, an audio-routing setting, one app or media file, a recent screen repair, a drop, a loose connector or a board-level fault can all look like a failed loudspeaker. Persistent crackling, silence after liquid exposure, or several affected functions need diagnosis before replacement.' },
      { title: 'What we test, timing and preparation', body: 'Ali Mobile checks output across media, calls and speakerphone, the speaker opening, routing and the device condition before recommending a part. Choose your model for its current repair option; final timing and quote follow diagnosis. Back up important data first as a sensible precaution.' },
    ],
    faqs: [
      { question: 'Why is my phone speaker quiet, distorted, crackling or silent?', answer: 'A blocked grille, moisture, physical impact, a loose internal connection, software or audio routing can cause these symptoms. A persistent fault across several media sources is a reason to have the phone assessed.' },
      { question: 'Why does sound work through headphones or Bluetooth but not the phone speaker?', answer: 'That pattern can mean the phone is routing sound to an accessory or that the built-in loudspeaker path needs attention. Disconnect accessories, check the output destination and test local media before assuming the speaker needs replacement.' },
      { question: 'Can dust or moisture affect the loudspeaker?', answer: 'Yes. Dry debris can reduce output and moisture can make sound muffled or distorted. Do not add liquid or use sharp tools in the grille; seek assessment after liquid exposure or continuing distortion.' },
      { question: 'Why did the issue start after a drop, screen repair or other repair?', answer: 'Impact can affect the speaker, connector or surrounding assembly. After another repair, the symptom may relate to an internal connection or a separate pre-existing fault, so diagnosis is safer than assuming the loudspeaker alone is responsible.' },
      { question: 'When is loudspeaker replacement not the right repair?', answer: 'Replacement may not be suitable when the problem is a volume or routing setting, Bluetooth or wired output, an app, blocked openings, moisture damage or a broader board-level issue. We test the phone before confirming the repair path.' },
    ],
  },
  'earpiece-speaker-replacement': {
    cards: [
      { title: 'Earpiece speaker or loudspeaker?', body: 'The earpiece is the small upper receiver used for normal calls. The lower loudspeaker handles media, ringtones and speakerphone. If speakerphone is clear but a normal call is quiet or muffled, the earpiece path is the more relevant place to assess.', link: { href: '/repairs/phone/loudspeaker-replacement', label: 'Compare loudspeaker symptoms' } },
      { title: 'Quick checks before repair', body: 'During a normal call, raise call volume and compare it with speakerphone and local media. Disconnect Bluetooth or wired accessories, check that a case or protector is not blocking the upper opening, and gently clear only dry visible debris with a soft brush or cloth.' },
      { title: 'When it may be another fault', body: 'Audio routing, call settings, network quality, a blocked receiver mesh, moisture, a recent screen repair, flex or connector damage, a proximity-related issue or a board fault can affect call audio. After a drop or impact, low, muffled or distorted earpiece audio can come from damage to the earpiece, flex, connector or other internal components, so we diagnose before recommending replacement. If the other person cannot hear you, that points more toward the microphone than the earpiece.' },
      { title: 'What we test, timing and preparation', body: 'Ali Mobile compares normal-call, speakerphone and media audio, then checks the upper receiver area and device condition before recommending repair. Choose your model for current options; final timing and quote follow inspection. Back up important data first as a precaution.' },
    ],
    faqs: [
      { question: 'Why are phone calls very quiet even at maximum volume?', answer: 'The earpiece can be affected by a blocked mesh, moisture, physical damage, its flex or connector, but call settings, Bluetooth routing and network conditions can also make calls sound quiet. Comparing a normal call with speakerphone helps narrow it down.' },
      { question: 'Why can I hear callers on speakerphone but not through the earpiece?', answer: 'Speakerphone and the earpiece use different audio paths. Clear speakerphone with poor normal-call audio can point to the upper receiver area, but the phone still needs diagnosis before replacement is confirmed.' },
      { question: 'Can cleaning the earpiece grille help?', answer: 'Dry lint, dust or makeup on the receiver opening can reduce call volume. Use only a soft dry brush or cloth on the outside; do not push objects or liquid into the mesh. Continuing crackle or low sound needs assessment.' },
      { question: 'Could a screen repair or liquid exposure affect call audio?', answer: 'Yes. The upper receiver area is close to display assemblies and connectors, while liquid can affect several components. We check the full symptom pattern rather than assuming one replacement will solve it.' },
      { question: 'When is earpiece replacement not the right repair?', answer: 'The issue may instead be the loudspeaker, microphone, routing, network, settings, a proximity-related behaviour or a board fault. We test the relevant audio path before recommending a repair.' },
    ],
  },
  'volume-button-replacement': {
    cards: [
      { title: 'Quick checks before repair', body: 'Remove a case that may press the keys, check for dry debris around the buttons, restart the phone and test media, call and ring volume separately. The on-screen volume panel can control different sound types, so one slider changing does not prove the physical key is faulty.' },
      { title: 'What the symptom can mean', body: 'One key not responding, a stuck, mushy, loose or clickless button, random volume changes, or a fault after impact can indicate the button, frame or internal flex. Liquid or moisture exposure can affect the physical button, button flex, connector or other internal components, so diagnosis is needed before treating it as a volume-button replacement. If keys work after a restart but fail later, apps, settings or software may also be involved.' },
      { title: 'When it may not be a button fault', body: 'Accessibility controls, focus or mute modes, an app-specific problem, Bluetooth routing or different call/media/ring settings can change volume without a hardware fault. Temporary on-screen sliders, Quick Settings or supported voice controls can help while the device is assessed.' },
      { title: 'What we test, timing and preparation', body: 'Ali Mobile checks the feel and response of both keys, the surrounding frame, relevant settings and whether the fault affects more than one function before recommending hardware repair. Choose your model for current options; final timing and quote follow diagnosis. Back up important data first.' },
    ],
    faqs: [
      { question: 'Why does one volume button work but the other does not?', answer: 'Each direction can fail differently because of the external button, flex, frame alignment or debris. We check both keys and the phone’s response before deciding whether a replacement is appropriate.' },
      { question: 'Why does my phone volume change by itself?', answer: 'A stuck or compressed key can cause changes, but a tight case, accessibility setting, connected accessory, app or software issue can also be involved. Remove the case and compare behaviour across apps before assuming a hardware fault.' },
      { question: 'What can I do while my volume button is not working?', answer: 'Use the on-screen volume controls, Quick Settings or supported voice controls where available. Those are temporary workarounds; avoid forcing a stuck key or inserting objects around it.' },
      { question: 'Can a drop or previous repair damage the volume-button flex?', answer: 'Impact, frame damage and an internal connection can affect button response. A symptom that starts after another repair may also involve a connector or separate fault, so inspection is important.' },
      { question: 'When is volume-button replacement not necessary?', answer: 'Replacement may not be needed when the key works normally and the issue is a sound category, mute or focus setting, Bluetooth output, app behaviour or software. We rule out these causes before recommending hardware work.' },
    ],
  },
  'power-button-replacement': {
    cards: [
      { title: 'Quick checks before repair', body: 'Remove a case that presses the side key, allow a compatible charger time to work, and look for signs the phone is alive such as vibration, sound or a connection despite a black display. Use the model’s documented on-screen or button restart options rather than forcing or disassembling the device.' },
      { title: 'Power button or a configured side key?', body: 'On many current phones, a long press can launch an assistant or another shortcut instead of the power menu. That can be a setting, not a failed button. A physically stuck, mushy, loose or intermittent key—especially after impact—still needs inspection.' },
      { title: 'No power is not proof of a bad button', body: 'A phone that will not start can have a depleted battery, charging fault, frozen software, display problem, liquid damage or board-level issue as well as a side-button fault. If several functions fail or the symptom follows liquid exposure, diagnosis must look beyond the button.', link: { href: '/repairs/phone/logic-board-repair', label: 'Learn when a logic board assessment may be relevant' } },
      { title: 'What we test, timing and preparation', body: 'Ali Mobile checks the physical key, wake/lock and power-menu behaviour, charging response and signs of life before recommending a repair path. Choose your model for current options; final timing and quote follow diagnosis. Back up important data first whenever the phone can still be accessed.' },
    ],
    faqs: [
      { question: 'Why does my power button open an assistant instead of the power menu?', answer: 'Many recent phones let the side or power key open an assistant or shortcut. Check the model’s button or gesture settings and available on-screen power controls before treating this behaviour as a hardware failure.' },
      { question: 'Why does the button wake the screen but not show the power menu?', answer: 'The physical key may work while its long-press action is configured differently. Settings, software and model-specific shortcuts can change the result, so we distinguish behaviour from a damaged button.' },
      { question: 'Why does my phone only turn on when the charger is connected?', answer: 'That can point to battery, charging, software or other power-management issues rather than the side button alone. We assess the charging response and device condition before recommending a button repair.' },
      { question: 'What if the phone dies while the power button is broken?', answer: 'If the phone is still accessible, back it up and arrange assessment before the battery runs flat. Charging or restart behaviour varies by model, so avoid relying on a universal button combination or forcing a stuck key.' },
      { question: 'Can a drop, liquid exposure or previous repair affect the power button?', answer: 'Yes. Impact can affect the key, flex or frame, while liquid or an internal connection can affect multiple functions. We assess the wider symptom pattern before confirming the repair.' },
      { question: 'When is power-button replacement not the right repair?', answer: 'Replacement may not be suitable when the issue is a side-key setting, depleted battery, charging fault, frozen software, display failure, liquid damage or a board-level problem. “No power” alone is not enough to identify the failed part.' },
    ],
  },
};

function GenericRepairContent({ repair }: { repair: VirtualPhoneRepair }) {
  const content = GENERIC_REPAIR_CONTENT[repair.slug];
  const faqs: FaqItem[] = [
    ...content.faqs,
    { question: `How much does ${repair.name.toLowerCase()} cost?`, answer: 'Choose your supported model to see an exact trusted price, a From price for legitimate repair variants, or Quote on Request when a confirmed price is not available. We confirm the final quote before work begins.' },
    { question: 'How long will the repair take?', answer: 'Timing depends on the confirmed fault, the correct part and device condition. We explain the expected timing after inspection.' },
    { question: 'Will the repair affect my data?', answer: 'A standard hardware repair does not normally require data erasure, but backing up important information before any repair is sensible, especially after impact or liquid exposure.' },
    { question: 'Does the repair include a warranty?', answer: 'Eligible completed standard repairs include a 6-month warranty under Ali Mobile’s normal warranty terms.' },
  ];

  return <>
    <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="repair-guidance-heading">
      <div className="repair-workbench-heading"><span>Repair guidance</span><h2 id="repair-guidance-heading" className="scroll-mt-32">{repair.name}, explained clearly</h2><p>{repair.summary}</p></div>
      <div className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6">
        {content.cards.map((card) => <article key={card.title} className="flex h-full min-h-[188px] flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 text-center md:p-[50px]"><h3 className="text-[1rem] font-black text-slate-950">{card.title}</h3><p className="mt-4 text-[0.95rem] font-medium leading-[1.62] text-slate-500">{card.body}</p>{card.link ? <Link href={card.link.href} className="mt-4 text-sm font-bold text-blue-700 underline underline-offset-4 transition-colors hover:text-blue-800">{card.link.label}</Link> : null}</article>)}
      </div>
    </section>
    <FaqAccordion faqs={faqs} density="comfortable" layout="repair-detail" />
  </>;
}

function RepairIcon({ icon, size, strokeWidth }: { icon: string; size: number; strokeWidth: number }) {
  const props = { size, strokeWidth, 'aria-hidden': true } as const;

  if (icon === 'earpiece') return <Ear {...props} />;
  if (icon === 'power') return <Power {...props} />;
  if (icon === 'clipboard') return <ClipboardCheck {...props} />;
  if (icon === 'wrench') return <Wrench {...props} />;
  if (icon === 'check') return <CheckCircle2 {...props} />;
  return <Volume2 {...props} />;
}

export default function VirtualPhoneRepairLandingPage({
  brandName,
  brandSlug,
  repairSlug,
  canonicalPath,
  models,
  isGeneric,
  sharedContent,
  sharedPageV2,
  initialResults,
  hierarchy,
}: VirtualPhoneRepairLandingPageProps) {
  const repair = getVirtualPhoneRepair(repairSlug);
  if (!repair) return null;

  const isGenericHierarchy = Boolean(isGeneric && hierarchy);
  const priceLabel = formatScopedRepairPriceLabel(repair.slug, 50, 'From $50', 'virtual');
  const repairHubHref = brandSlug ? `/repairs/phone/${brandSlug === 'google-pixel' ? 'google-pixel' : brandSlug}` : '/repairs/phone';
  const repairHubLabel = brandName ? `${brandName} Repairs` : null;
  const pageTitle = getVirtualPhoneRepairHeading({ brandName, brandSlug, repairName: repair.name });
  const relatedRepair = repair.slug === 'loudspeaker-replacement'
    ? 'earpiece-speaker-replacement'
    : repair.slug === 'earpiece-speaker-replacement'
      ? 'loudspeaker-replacement'
      : repair.slug === 'power-button-replacement'
        ? 'volume-button-replacement'
        : 'power-button-replacement';
  const related = getVirtualPhoneRepair(relatedRepair)!;
  const relatedHref = brandSlug ? `/repairs/phone/${brandSlug === 'google-pixel' ? 'google' : brandSlug}/${related.slug}` : `/repairs/phone/${related.slug}`;
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Phone Repairs', href: '/repairs/phone' },
    ...(repairHubLabel ? [{ label: repairHubLabel, href: repairHubHref }] : []),
    { label: repair.name },
  ];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alimobile.com.au';
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href ?? canonicalPath}`,
    })),
  };
  const contentCards = [
    { title: 'What this repair covers', body: repair.summary, icon: repair.icon },
    { title: 'Common signs', body: repair.signs, icon: repair.icon },
    { title: 'Hardware problem or another cause?', body: repair.diagnosis, icon: 'clipboard' },
    { title: 'Inspection and repair', body: 'We inspect the device, confirm the suitable repair path and quote before work begins. Repair time depends on diagnosis and part availability.', icon: 'wrench' },
    ...(sharedContent ? [
      { title: 'Checks before repair', body: sharedContent.diagnosis, icon: 'clipboard' },
      { title: 'Testing after suitable repair', body: sharedContent.testing, icon: 'check' },
    ] : []),
  ];
  const fallbackBookingHref = getSharedRepairBookingHref({
    repairName: repair.name,
    fallbackBrandName: sharedContent ? brandName : undefined,
  });
  const selectedPriceLabel = hierarchy?.selectedDevice
    ? hierarchy.models.find((model) => model.brandSlug === hierarchy.selectedDevice?.selectedDevice.brandSlug && model.modelSlug === hierarchy.selectedDevice?.selectedDevice.modelSlug)?.priceLabel ?? null
    : null;

  return (
    <>
      {isGenericHierarchy ? <ServiceSchema serviceName={`Phone ${repair.name}`} description={`${repair.summary} Choose a supported model for current repair options and an inspection-led quote.`} url={`https://www.alimobile.com.au${canonicalPath}`} /> : null}
      <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell" style={{ paddingBottom: 0 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <nav aria-label="Breadcrumb" className="mb-8 flex justify-center text-center text-sm text-slate-600">
          <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
            {breadcrumbs.map((item, index) => (
              <li key={item.label} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">›</span>}
                {item.href ? <Link href={item.href} className="font-semibold transition-colors hover:text-blue-700 hover:underline">{item.label}</Link> : <span aria-current="page" className="font-bold text-blue-600">{item.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <div className="repair-detail-topbar">
          <Link href={repairHubHref} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <ArrowLeft size={17} aria-hidden="true" />Back to {brandName ? `${brandName} repairs` : 'phone repairs'}
          </Link>
        </div>
        {isGenericHierarchy ? <CameraModuleRepairSelectionExperience
          title={pageTitle}
          description={`${repair.summary} Choose a supported model to view its current repair option before booking.`}
          eyebrow={repair.eyebrow}
          icon={repair.icon === 'earpiece' || repair.icon === 'power' || repair.icon === 'volume' || repair.icon === 'loudspeaker' ? repair.icon : undefined}
          bookingService={repair.name}
          canonicalPath={canonicalPath}
          hierarchy={hierarchy!}
        /> : <section className="repair-hero repair-detail-hero relative" aria-labelledby="virtual-phone-repair-heading">
          <span className="repair-detail-icon text-blue-600"><RepairIcon icon={repair.icon} size={34} strokeWidth={2.4} /></span>
          <span className="repair-kicker mx-auto mb-5"><RepairIcon icon={repair.icon} size={14} strokeWidth={2.6} />{repair.eyebrow}</span>
          <h1 id="virtual-phone-repair-heading">{pageTitle}</h1>
          <p className="repair-detail-subtitle">{repair.summary} Ali Mobile & Repair in Ringwood confirms final pricing after inspection if additional damage or parts are involved.</p>
          {sharedPageV2 ? (
            <SharedRepairPageV2BookingControls
              basePath={canonicalPath}
              brandSlug={brandSlug ?? ''}
              brandName={brandName ?? 'Phone'}
              repairName={repair.name}
              repairSlug={repair.slug}
              supportedModels={sharedPageV2.supportedModels}
              priceCandidates={sharedPageV2.priceCandidates}
              quickAnswers={sharedPageV2.quickAnswers}
            />
          ) : <div className="mt-8 flex w-full flex-col items-center">
            <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6 md:p-8">
              <span className="w-full text-center text-xs font-black uppercase tracking-[0.16em] text-blue-600">Inspection first</span>
              <h2 className="mt-3 w-full text-center text-xl font-black leading-tight text-slate-950">{repair.name}</h2>
              <p className="mt-4 w-full text-center text-3xl font-extrabold text-blue-600">{priceLabel}</p>
              <p className="mt-3 w-full max-w-[32rem] text-center text-pretty text-sm font-semibold leading-6 text-slate-500">Final quote depends on parts, model and device condition.</p>
            </div>
            {hierarchy ? <SharedRepairHeroSelection selectedDevice={hierarchy.selectedDevice} priceLabel={selectedPriceLabel} changeModelHref="#shared-repair-model-selection" /> : <div className="mt-6 flex w-full max-w-sm flex-col items-center justify-center gap-4">
              <Suspense fallback={<Link href={fallbackBookingHref} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-center text-lg font-bold !text-white shadow-lg shadow-blue-200">Book Repair Now</Link>}>
                <SharedRepairBookingControls
                  basePath={canonicalPath}
                  brandSlug={brandSlug}
                  fallbackBookingBrand={sharedContent ? brandName : undefined}
                  models={models}
                  repairName={repair.name}
                  showModelControls={Boolean(sharedContent)}
                />
              </Suspense>
              <a href="tel:0481058514" className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-lg font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><PhoneCall size={19} strokeWidth={2.6} aria-hidden="true" />Call 0481 058 514</a>
            </div>}
          </div>}
          {sharedPageV2 && hierarchy?.selectedDevice ? <SharedRepairSelectedDevice selection={hierarchy.selectedDevice} changeModelHref="#shared-repair-model-selection" /> : null}
          {!sharedPageV2 ? <div className="trust-badges mt-8">
            <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Inspection Before Work</div>
            <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" /></span>Clear Quote First</div>
            <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Repair Warranty</div>
            <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><BadgeCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Ringwood Repair Desk</div>
          </div> : null}
        </section>}
        {isGenericHierarchy ? <SharedRepairPageResultsSection key={`${hierarchy!.selectedBrandSlug ?? 'all-brands'}-${hierarchy!.selectedModelSlug ?? 'all-models'}`} initialResults={initialResults ?? []} repairName={repair.name} /> : null}
        {isGenericHierarchy ? <GenericRepairContent repair={repair} /> : <>
        {sharedPageV2 ? <SharedRepairPageV2ModelSections supportedModels={sharedPageV2.supportedModels} priceCandidates={sharedPageV2.priceCandidates} repairName={repair.name} repairSlug={repair.slug} selectedModelSlug={sharedPageV2.selectedModelSlug} /> : null}
        {hierarchy ? <SharedRepairHierarchySections models={hierarchy.models} selectedBrandSlug={hierarchy.selectedBrandSlug} selectedModelSlug={hierarchy.selectedModelSlug} ariaLabel={`Supported ${repair.name} models`} /> : null}
        <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="repair-guidance-heading">
          <div className="repair-workbench-heading"><span>Repair guidance</span><h2 id="repair-guidance-heading" className="scroll-mt-32">{repair.name}, explained clearly</h2><p>We inspect the device condition first, then provide a clear quote for the suitable repair path.</p></div>
          <div className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:gap-6">{contentCards.map(({ title, body, icon }) => <article key={title} className="flex h-full min-h-[188px] flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center"><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><RepairIcon icon={icon} size={20} strokeWidth={2.5} /></span><h3 className="mt-5 text-balance text-[1rem] font-black leading-[1.14] tracking-normal text-slate-950">{title}</h3><p className="mt-4 text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500">{body}</p></article>)}</div>
        </section>
        <CommonRepairProblemsSection modelName={brandName ?? 'Phone'} repairType={repair.slug} problems={[{ title: 'Inspection before replacement', description: 'We check the relevant speaker or button area and explain the repair options before work begins.' }, { title: 'Clear quote first', description: sharedPageV2 ? 'Model-specific pricing depends on the current repair option, device condition and suitable repair path.' : 'The $50 figure is a starting price. Final pricing depends on the device condition and suitable repair path.' }]} />
        <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="why-heading">
          <div className="repair-workbench-heading"><span>Why choose us</span><h2 id="why-heading" className="scroll-mt-32">Why choose Ali Mobile & Repair</h2><p>Our Ringwood repair desk keeps phone repairs inspection-led, quote-first and focused on supported models.</p>{sharedContent ? <p className="mx-auto mt-4 max-w-3xl text-pretty">Warranty applies to eligible standard repairs and the completed repair scope. We confirm the suitable repair path before work begins.</p> : null}</div>
          <div className="grid w-full grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-3 lg:gap-6">{['Clear quote before work begins.', 'Available for supported phone models.', 'Repair time depends on diagnosis and part availability.'].map((item) => <article key={item} className="rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center text-sm font-semibold leading-6 text-slate-700">{item}</article>)}</div>
        </section>
        {sharedPageV2 ? <SharedRepairPageResultsSection key={sharedPageV2.selectedModelSlug ?? 'all-models'} initialResults={sharedPageV2.initialResults} repairName={repair.name} /> : null}
        </>}
        <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="links-heading">
          <div className="mx-auto flex w-full flex-col gap-6 rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 md:p-[50px] text-center"><div className="repair-workbench-heading"><span>Helpful links</span><h2 id="links-heading" className="scroll-mt-32">Explore related repair pages</h2><p>{isGenericHierarchy ? 'Compare relevant phone repairs or visit our Ringwood repair desk for an inspection-led quote.' : 'Compare relevant phone repairs or return to the appropriate repair hub.'}</p></div><div className="flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="/repairs/phone" className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold !text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Phone Repair Services</Link><Link href={relatedHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{related.name}</Link><Link href={repairHubHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{brandName ? `${brandName} Repair Hub` : 'Phone Repair Hub'}</Link>{isGeneric && [['Samsung repair', '/repairs/phone/samsung'], ['Google Pixel repair', '/repairs/phone/google-pixel'], ['OPPO repair', '/repairs/phone/oppo']].map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{label}</Link>)}</div></div>
        </section>
      </main>
      <ReviewsSection />
    </>
  );
}
