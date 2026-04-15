import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a specific condition is met (e.g., modal is open).
 * @param lock - Whether to lock the scroll
 */
export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (lock) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [lock]);
}
