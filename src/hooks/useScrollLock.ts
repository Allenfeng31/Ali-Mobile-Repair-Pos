import { useEffect } from 'react';

// Module-level state to track active scroll locks across all components
let lockCount = 0;
let originalStyle = '';

/**
 * Hook to lock body scroll when a specific condition is met (e.g., modal is open).
 * Multi-lock aware: only captures style on first lock and restores on last unlock.
 * @param lock - Whether to lock the scroll
 */
export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    // Engaged: capture original style only if this is the first lock
    if (lockCount === 0) {
      originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
    }
    
    lockCount++;

    // Cleanup: release lock when component unmounts or 'lock' turns false
    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = originalStyle || 'auto';
        originalStyle = '';
      }
    };
  }, [lock]);
}
