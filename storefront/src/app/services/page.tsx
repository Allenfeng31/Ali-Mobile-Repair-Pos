import Link from "next/link";
import { Smartphone, Tablet, Laptop, Watch, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Repair Services | Ali Mobile & Repair Ringwood',
  description: 'Professional repair services for phones, tablets, MacBooks, and smart watches in Melbourne. Fast turnaround and premium parts.',
};

const serviceCategories = [
  {
    title: "Phone Repair",
    description: "iPhone, Samsung, Oppo, and Pixel screen and battery replacements.",
    icon: Smartphone,
    href: "/services/phone-repair",
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Tablet Repair",
    description: "Expert glass and LCD replacement for all iPad and Samsung Tab models.",
    icon: Tablet,
    href: "/services/tablet-repair",
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Computer & MacBook",
    description: "Logic board, screen, and battery repairs for MacBooks and laptops.",
    icon: Laptop,
    href: "/services/computer-repair",
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Smart Watch Repair",
    description: "Apple Watch screen and battery fixes for all Series and Ultra models.",
    icon: Watch,
    href: "/services/smart-watch-repair",
    color: "bg-rose-50 text-rose-600"
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-4 tracking-tight">
            Our Repair Services
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Professional solutions for all your tech troubles. Most repairs completed in under 45 minutes by our expert technicians in Melbourne.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceCategories.map((service, index) => (
            <Link 
              key={index} 
              href={service.href}
              className="group bg-surface-container-lowest border border-outline-variant/10 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <service.icon size={32} />
              </div>
              
              <h3 className="text-xl font-black text-on-surface mb-4 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              
              <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-8">
                {service.description}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                Learn More <ArrowRight size={14} />
              </div>
              
              {/* Subtle background glow on hover */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>

        {/* Generic CTA Section */}
        <div className="mt-24 p-12 bg-surface-container-low rounded-[3rem] border border-outline-variant/5 text-center">
          <h2 className="text-3xl font-black text-on-surface mb-4">Not sure what you need?</h2>
          <p className="text-on-surface-variant font-medium mb-8 max-w-xl mx-auto">
            Bring your device in for a free diagnosis. Our technicians will inspect it and provide a transparent quote.
          </p>
          <Link 
            href="/book-repair"
            className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Book Free Inspection
          </Link>
        </div>
      </div>
    </div>
  );
}
