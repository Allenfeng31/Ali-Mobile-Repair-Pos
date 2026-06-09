import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, PhoneCall, Search, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | Ali Mobile & Repair",
  description: "The page you are looking for is no longer available.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center bg-slate-50">
      <div className="max-w-2xl w-full py-16">
        <div className="mb-8 flex justify-center">
          <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100">
            <Wrench size={40} className="text-slate-400" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          This device path seems broken.
        </h1>
        
        <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto">
          The page you opened is no longer available, but we can help you find the right repair service at Ali Mobile & Repair in Ringwood.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link 
            href="/book-repair" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
          >
            Book a Repair
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
          <Link 
            href="/repairs" 
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
          >
            <Search size={18} strokeWidth={2.5} />
            Browse Repairs
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center border-t border-slate-200 pt-10">
          <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
            Back to Home
          </Link>
          <span className="hidden sm:inline text-slate-300">•</span>
          <a href="tel:0481058514" className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 transition-colors">
            <PhoneCall size={16} strokeWidth={2.5} />
            Call 0481 058 514
          </a>
        </div>

        <div className="mt-16 text-sm text-slate-500">
          Phone, tablet, laptop and Apple Watch repairs in Ringwood Square Shopping Centre.
        </div>
      </div>
    </main>
  );
}
