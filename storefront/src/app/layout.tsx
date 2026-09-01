import "./globals.css";
import { Inter } from "next/font/google";
import { TopAnnouncementBar } from "@/components/TopAnnouncementBar";
import { Analytics } from "@vercel/analytics/next";
import { ROOT_SOCIAL_DESCRIPTION } from "@/lib/siteMetadata";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getValidatedGoogleAnalyticsId } from "@/lib/googleAnalytics";

const inter = Inter({ subsets: ["latin"] });

import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.alimobile.com.au"),
  title: "Ali Mobile & Repair | Electronics Repair in Ringwood, Melbourne",
  description: "Expert phone, tablet, and laptop repair in Ringwood Square, Melbourne. Specializing in micro-soldering, Face ID repair, and screen replacements with OEM parts.",
  openGraph: {
    title: "Ali Mobile & Repair | Electronics Repair in Ringwood",
    description: "Expert phone, tablet, and laptop repair in Ringwood Square, Melbourne. Specializing in micro-soldering, Face ID repair, and screen replacements.",
    siteName: "Ali Mobile & Repair",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali Mobile & Repair | Ringwood, Melbourne",
    description: ROOT_SOCIAL_DESCRIPTION,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = getValidatedGoogleAnalyticsId(
    process.env.VERCEL_ENV,
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  );

  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body className="antialiased min-h-screen bg-slate-50">
        <TopAnnouncementBar />
        {children}
        <Analytics />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
