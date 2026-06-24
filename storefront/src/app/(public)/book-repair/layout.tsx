import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Book Repair Appointment | Ali Mobile & Repair Ringwood",
  description:
    "Book a repair appointment with Ali Mobile & Repair in Ringwood Square for phones, tablets, laptops, and Apple Watch devices.",
  alternates: {
    canonical: "/book-repair",
  },
  openGraph: {
    title: "Book Repair Appointment | Ali Mobile & Repair Ringwood",
    description:
      "Book a repair appointment with Ali Mobile & Repair in Ringwood Square for phones, tablets, laptops, and Apple Watch devices.",
    url: "https://www.alimobile.com.au/book-repair",
    type: "website",
    locale: "en_AU",
    siteName: "Ali Mobile & Repair",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Repair Appointment | Ali Mobile & Repair Ringwood",
    description:
      "Book a repair appointment with Ali Mobile & Repair in Ringwood Square for phones, tablets, laptops, and Apple Watch devices.",
  },
};

export default function BookRepairLayout({ children }: { children: ReactNode }) {
  return children;
}
