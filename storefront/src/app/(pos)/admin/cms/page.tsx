"use client";

import React from 'react';
import { ArrowLeft, Database, Megaphone, Layout } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function StorefrontCMSPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <Link 
            href="/dashboard"
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:shadow-lg transition-all border border-slate-200"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Storefront <span className="text-indigo-600 italic">CMS</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage announcements, banners, and public-facing content.</p>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-indigo-100">
            <Database size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Module Under Construction</h2>
          <p className="text-slate-500 max-w-lg mx-auto mb-10 font-medium leading-relaxed">
            We are currently wiring up the Announcement Bar management and promo carousel tools. 
            Once complete, you'll be able to manage all storefront messages from this premium interface.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <Megaphone className="text-indigo-600 mb-4 mx-auto" size={32} />
              <h3 className="font-bold text-slate-900 mb-2">Promos</h3>
              <p className="text-xs text-slate-500">Manage top announcement bars and rotating alerts.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 opacity-50">
              <Layout className="text-slate-400 mb-4 mx-auto" size={32} />
              <h3 className="font-bold text-slate-400 mb-2">Banners</h3>
              <p className="text-xs text-slate-500">Update hero section images and primary CTAs.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 opacity-50">
              <Database className="text-slate-400 mb-4 mx-auto" size={32} />
              <h3 className="font-bold text-slate-400 mb-2">Blog Posts</h3>
              <p className="text-xs text-slate-500">Manage repair guides and company news.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
