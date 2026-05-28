import React from 'react';

export const metadata = {
  title: "Legal Disclaimer | Ali Mobile & Repair",
  description: "Legal disclaimer and trademark notice for Ali Mobile & Repair - third-party device repair service provider.",
};

export default function DisclaimerPage() {
  return (
    <div className="page-container bg-white text-gray-900 min-h-screen" style={{ paddingTop: '160px', paddingBottom: '160px' }}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-black">Legal Disclaimer & Notice</h1>
        <p className="text-base text-gray-800 leading-relaxed font-body">
          Legal Disclaimer: Ali Mobile & Repair is an independent, third-party repair service provider and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Apple Inc., Samsung, or any other device manufacturers. All product names, logos, and brands (including iPad, iPhone, and Apple) are property of their respective owners and are used on this website for identification and descriptive repair service purposes only.
        </p>
      </div>
    </div>
  );
}
