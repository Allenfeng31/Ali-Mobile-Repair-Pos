import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopAnnouncementBar } from "@/components/TopAnnouncementBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ali Mobile Repair Storefront",
  description: "Premium mobile repair services in Melbourne",
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
