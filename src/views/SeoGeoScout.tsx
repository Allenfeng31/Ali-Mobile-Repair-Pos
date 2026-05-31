import React from 'react';
import { Radar, ShieldAlert, ShieldCheck } from 'lucide-react';

type SeoGeoScoutViewProps = {
  isSuperAdmin: boolean;
  permissionsLoading: boolean;
};

export function SeoGeoScoutView({ isSuperAdmin, permissionsLoading }: SeoGeoScoutViewProps) {
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center p-8 bg-neu-bg shadow-neu-pressed rounded-[2rem] max-w-xl">
          <Radar className="mx-auto mb-4 text-cyan-500" size={44} />
          <h2 className="text-2xl font-black text-neu-text-primary mb-2">SEO &amp; GEO Scout</h2>
          <p className="text-neu-text-secondary">Checking Super Admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center p-8 bg-neu-bg shadow-neu-pressed rounded-[2rem] max-w-xl">
          <ShieldAlert className="mx-auto mb-4 text-red-500" size={44} />
          <h2 className="text-2xl font-black text-neu-text-primary mb-2">Super Admin Access Required</h2>
          <p className="text-neu-text-secondary">
            You are not authorized to access SEO campaign review data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-8 bg-neu-bg">
      <div className="max-w-4xl mx-auto bg-neu-bg rounded-[2rem] p-8 shadow-neu-flat border border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-neu-bg shadow-neu-pressed flex items-center justify-center text-cyan-600">
            <Radar size={30} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neu-text-primary tracking-tight">SEO &amp; GEO Scout</h1>
            <p className="mt-2 text-neu-text-secondary font-medium">
              Campaign review module route is now bound to <code>/admin/seo</code> inside POS.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-neu-bg shadow-neu-pressed p-6">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <ShieldCheck size={18} />
            <span className="text-sm font-black uppercase tracking-wider">Security Boundary Active</span>
          </div>
          <p className="text-sm text-neu-text-secondary leading-relaxed">
            Super Admin access confirmed. Campaign review module will load here in the POS-native flow.
          </p>
        </div>
      </div>
    </div>
  );
}
