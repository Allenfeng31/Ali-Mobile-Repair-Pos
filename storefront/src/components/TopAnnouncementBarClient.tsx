"use client";

import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';

interface Announcement {
  id: string;
  message: string;
}

interface TopAnnouncementBarClientProps {
  announcements: Announcement[];
}

export function TopAnnouncementBarClient({ announcements }: TopAnnouncementBarClientProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement_dismissed');
    const shouldShow = !dismissed && announcements.length > 0;
    setIsVisible(shouldShow);
    document.documentElement.style.setProperty('--announcement-bar-height', shouldShow ? '40px' : '0px');

    return () => {
      document.documentElement.style.setProperty('--announcement-bar-height', '0px');
    };
  }, [announcements.length]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement_dismissed', 'true');
    document.documentElement.style.setProperty('--announcement-bar-height', '0px');
  };

  if (!isVisible || announcements.length === 0) {
    return null;
  }

  const announcement = announcements[0];

  return (
    <div className="fixed top-0 left-0 w-full z-[2000] h-[40px] bg-white text-black border-b border-gray-200 dark:bg-black dark:text-white dark:border-gray-800 transition-colors duration-300">
      <div className="relative h-full w-full px-4 flex items-center justify-center">
        <div className="flex items-center justify-center overflow-hidden h-full">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-center">
            <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate max-w-[80vw] sm:max-w-none">
              {announcement.message}
            </span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
        </button>
      </div>
    </div>
  );
}
