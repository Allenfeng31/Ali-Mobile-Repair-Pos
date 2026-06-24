import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Track Repair Status | Ali Mobile & Repair",
  description:
    "Track the current status of your repair with your order ID or phone number through Ali Mobile & Repair's customer repair-status tool.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Track Repair Status | Ali Mobile & Repair",
    description:
      "Track the current status of your repair with your order ID or phone number through Ali Mobile & Repair's customer repair-status tool.",
    url: "https://www.alimobile.com.au/track-status",
    type: "website",
    locale: "en_AU",
    siteName: "Ali Mobile & Repair",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Repair Status | Ali Mobile & Repair",
    description:
      "Track the current status of your repair with your order ID or phone number through Ali Mobile & Repair's customer repair-status tool.",
  },
};

export default function TrackStatusLayout({ children }: { children: ReactNode }) {
  return children;
}
