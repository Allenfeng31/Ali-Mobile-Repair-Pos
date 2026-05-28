const PHONE_EXPLODED_IMAGE = '/images/repair-hero/phone-exploded-workbench.png?v=hero-exploded-1';

export default function PhoneHeroImage() {
  return (
    <img
      src={PHONE_EXPLODED_IMAGE}
      alt="Exploded phone repair parts showing screen, battery, charging assembly, and internal components"
      width={1448}
      height={1086}
      className="repair-phone-float-image"
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  );
}
