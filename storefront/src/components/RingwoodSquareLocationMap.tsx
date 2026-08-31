import RingwoodSquareMapViewer from "./RingwoodSquareMapViewer";

const LOCATION_MAP_SRC = "/images/ali-mobile-repair-ringwood-square-location-map.webp";
const LOCATION_MAP_ALT = "Ali Mobile & Repair location map inside Ringwood Square Shopping Centre showing Coles and Bunnings entrances";

type RingwoodSquareLocationMapProps = {
  heading: string;
  description: string;
  headingLevel?: 2 | 3;
  sizes: string;
  variant?: "homepage" | "booking-confirmation";
};

export default function RingwoodSquareLocationMap({
  heading,
  description,
  headingLevel = 3,
  sizes,
  variant = "homepage",
}: RingwoodSquareLocationMapProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const isBookingConfirmation = variant === "booking-confirmation";

  return (
    <section
      data-testid="location-map-section"
      className={`mx-auto flex w-full max-w-[1152px] flex-col items-center ${isBookingConfirmation ? "mt-6" : "mt-12 md:mt-14"}`}
      aria-labelledby="ringwood-square-location-map-heading"
    >
      <div data-testid="location-map-introduction" className="mx-auto flex w-full max-w-[42rem] flex-col items-center text-center">
        {!isBookingConfirmation && <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Inside Ringwood Square</span>}
        <Heading id="ringwood-square-location-map-heading" className={`font-black tracking-tight text-slate-900 ${isBookingConfirmation ? "text-2xl sm:text-[1.7rem]" : "mt-2 text-[1.75rem] sm:text-[1.95rem]"}`}>
          {heading}
        </Heading>
        <p className={`mx-auto mt-2 max-w-[38rem] text-center text-slate-600 ${isBookingConfirmation ? "text-sm leading-6" : "text-base leading-7 sm:text-[1.0625rem]"}`}>{description}</p>
      </div>

      <RingwoodSquareMapViewer src={LOCATION_MAP_SRC} alt={LOCATION_MAP_ALT} sizes={sizes} />
    </section>
  );
}
