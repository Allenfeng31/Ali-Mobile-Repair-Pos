export type ServiceArea = {
  name: string;
  slug: string;
  driveTime: string;
  transitAdvice: string;
  landmarks: string[];
  route: string;
  localReason: string;
};

export const SERVICE_AREAS: ServiceArea[] = [
  {
    name: "Ringwood",
    slug: "ringwood",
    driveTime: "Local store",
    transitAdvice: "Walk directly into Ringwood Square from Maroondah Highway.",
    landmarks: ["Ringwood Square", "Eastland", "Ringwood Station"],
    route: "We are based at Kiosk C1 inside Ringwood Square Shopping Centre.",
    localReason: "Ringwood customers can usually combine a repair quote with shopping or errands nearby.",
  },
  {
    name: "Ringwood East",
    slug: "ringwood-east",
    driveTime: "About 5 minutes",
    transitAdvice: "A simple trip along Maroondah Highway or through Ringwood East Village.",
    landmarks: ["Ringwood East Station", "Maroondah Highway", "Ringwood Lake"],
    route: "Head west toward Ringwood Square and use the centre parking near Maroondah Highway.",
    localReason: "Close enough for quick diagnostics, model checks, and same-day collection on common repairs.",
  },
  {
    name: "Ringwood North",
    slug: "ringwood-north",
    driveTime: "About 7 minutes",
    transitAdvice: "Drive via Warrandyte Road toward Ringwood Square.",
    landmarks: ["Warrandyte Road", "Ringwood North Shopping Centre", "EastLink"],
    route: "Come down Warrandyte Road, then enter Ringwood Square from the Maroondah Highway side.",
    localReason: "A practical nearby option when you want specialist device repair without heading into the CBD.",
  },
  {
    name: "Heathmont",
    slug: "heathmont",
    driveTime: "About 5 minutes",
    transitAdvice: "Travel via Canterbury Road or Heathmont Road toward Ringwood.",
    landmarks: ["Heathmont Station", "Canterbury Road", "Dandenong Creek Trail"],
    route: "Drive north toward Maroondah Highway and park at Ringwood Square Shopping Centre.",
    localReason: "Heathmont customers can get a quick quote before committing to screen, battery, or charging repairs.",
  },
  {
    name: "Croydon",
    slug: "croydon",
    driveTime: "About 10 minutes",
    transitAdvice: "Use Mt Dandenong Road or Maroondah Highway toward Ringwood.",
    landmarks: ["Croydon Central", "Croydon Station", "Mt Dandenong Road"],
    route: "Head west toward Ringwood, then turn into Ringwood Square for easy centre parking.",
    localReason: "Worth the short trip for careful diagnostics, transparent quoting, and No Fix No Charge on eligible jobs.",
  },
  {
    name: "Mitcham",
    slug: "mitcham",
    driveTime: "About 6 minutes",
    transitAdvice: "Use Maroondah Highway or EastLink depending on traffic.",
    landmarks: ["Mitcham Station", "EastLink", "Mitcham Shopping Centre"],
    route: "Follow Maroondah Highway east toward Ringwood Square.",
    localReason: "Mitcham residents can reach us quickly for priority booking, phone checks, and warranty-backed repair work.",
  },
  {
    name: "Nunawading",
    slug: "nunawading",
    driveTime: "About 10 minutes",
    transitAdvice: "Maroondah Highway gives a direct route toward Ringwood.",
    landmarks: ["Brand Smart", "Nunawading Station", "Whitehorse Road"],
    route: "Continue east along Maroondah Highway until Ringwood Square.",
    localReason: "A convenient repair stop for customers comparing quick local service against larger shopping-centre queues.",
  },
  {
    name: "Box Hill",
    slug: "boxhill",
    driveTime: "About 12 minutes by train",
    transitAdvice: "Use the Lilydale or Belgrave line from Box Hill Station to Ringwood Station.",
    landmarks: ["Box Hill Central", "Box Hill Station", "Maroondah Highway"],
    route: "Take the Lilydale or Belgrave line to Ringwood Station, then walk to Ringwood Square Shopping Centre.",
    localReason: "Box Hill customers can use a direct train corridor to reach our Ringwood Square repair bench for clear quotes and warranty-backed service.",
  },
  {
    name: "Wantirna",
    slug: "wantirna",
    driveTime: "About 12 minutes",
    transitAdvice: "EastLink is usually the cleanest drive toward Ringwood.",
    landmarks: ["Knox Private Hospital", "EastLink", "Stud Road"],
    route: "Take EastLink north, exit toward Ringwood, then park at Ringwood Square.",
    localReason: "Good for customers who want to call first, confirm pricing, then visit only when the repair path is clear.",
  },
  {
    name: "Bayswater",
    slug: "bayswater",
    driveTime: "About 12 minutes",
    transitAdvice: "Mountain Highway connects Bayswater to Ringwood efficiently.",
    landmarks: ["Bayswater Station", "Mountain Highway", "Bayswater Village"],
    route: "Travel west along Mountain Highway and continue toward Ringwood Square.",
    localReason: "A short drive for battery, screen, charging port, and tablet repairs with clear quote options.",
  },
  {
    name: "Vermont",
    slug: "vermont",
    driveTime: "About 12 minutes",
    transitAdvice: "Canterbury Road is the most direct route toward Ringwood.",
    landmarks: ["Vermont South Shopping Centre", "Canterbury Road", "Terrara Park"],
    route: "Follow Canterbury Road east, then connect toward Ringwood Square.",
    localReason: "Customers from Vermont can phone ahead for a model check and avoid unnecessary travel if parts are unavailable.",
  },
  {
    name: "Mooroolbark",
    slug: "mooroolbark",
    driveTime: "About 15 minutes",
    transitAdvice: "Use Manchester Road or Maroondah Highway depending on traffic.",
    landmarks: ["Mooroolbark Station", "Manchester Road", "Brice Avenue"],
    route: "Head toward Ringwood via Manchester Road and use Ringwood Square parking.",
    localReason: "Helpful when you want a specialist repair bench close by without sending the device away.",
  },
  {
    name: "Warranwood",
    slug: "warranwood",
    driveTime: "About 10 minutes",
    transitAdvice: "Use Wonga Road toward Ringwood North, then continue to Ringwood Square.",
    landmarks: ["Wonga Road", "Warranwood Reserve", "Yarra Valley Grammar"],
    route: "Drive south along Wonga Road and connect into Ringwood Square via Maroondah Highway.",
    localReason: "A nearby option for families and commuters who want quick assessment, honest pricing, and warranty support.",
  },
];

export function getServiceAreaBySlug(slug: string) {
  return SERVICE_AREAS.find((area) => area.slug === slug);
}
