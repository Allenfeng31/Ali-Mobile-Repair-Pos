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
    <div className="fixed top-0 left-0 w-full z-[2000] h-[40px] bg-white text-black border-b border-gray-200 dark:bg-black dark:text-white dark:border-gray-800 transition-colors duration-300">
      <div className="relative h-full w-full px-4 flex items-center justify-center">
        {/* Carousel Content */}
        <div className="flex items-center justify-center overflow-hidden h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={announcements[currentIndex].id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-center"
            >
              <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate max-w-[80vw] sm:max-w-none">
                {announcements[currentIndex].message}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Close Icon */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4 text-black/40 dark:text-white/60 hover:text-black dark:hover:text-white" />
        </button>
      </div>
    </div>
  );
}
