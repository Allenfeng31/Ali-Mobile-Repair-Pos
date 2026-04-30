import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopAnnouncementBar } from "@/components/TopAnnouncementBar";

const inter = Inter({ subsets: ["latin"] });

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ali Mobile & Repair | Electronics Repair in Ringwood, Melbourne",
  description: "Expert phone, tablet, and laptop repair in Ringwood Square, Melbourne. Specializing in micro-soldering, Face ID repair, and screen replacements with OEM parts.",
  openGraph: {
    title: "Ali Mobile & Repair | Electronics Repair in Ringwood",
    description: "Expert phone, tablet, and laptop repair in Ringwood Square, Melbourne. Specializing in micro-soldering, Face ID repair, and screen replacements.",
    url: "https://alimobile.com.au",
    siteName: "Ali Mobile & Repair",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali Mobile & Repair | Ringwood, Melbourne",
    description: "Expert mobile phone and electronics repair in Ringwood Square. Fast, reliable, with a 6-month warranty.",
  },
  alternates: {
    canonical: "https://alimobile.com.au",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50">
        <ThemeProvider>
          <TopAnnouncementBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
