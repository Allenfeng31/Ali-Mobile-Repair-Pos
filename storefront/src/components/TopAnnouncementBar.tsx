"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Announcement {
  id: string;
  message: string;
}

export function TopAnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check session dismissal
    const dismissed = sessionStorage.getItem('announcement_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('storefront_announcements')
        .select('id, message')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching announcements:', error);
        return;
      }

      if (data && data.length > 0) {
        setAnnouncements(data);
        setIsVisible(true);
        // Set height for layout adjustment
        document.documentElement.style.setProperty('--announcement-bar-height', '40px');
      } else {
        document.documentElement.style.setProperty('--announcement-bar-height', '0px');
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [announcements]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('announcement_dismissed', 'true');
    document.documentElement.style.setProperty('--announcement-bar-height', '0px');
  };

  if (!isVisible || announcements.length === 0 || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full z-[2000] h-[40px] bg-slate-950 text-white overflow-hidden border-b border-white/10">
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-center">
        {/* Carousel Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={announcements[currentIndex].id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center gap-2 text-sm font-semibold tracking-wide text-center"
            >
              <Megaphone className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate px-2">
                {announcements[currentIndex].message}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Close Icon */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4 text-white/60 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
