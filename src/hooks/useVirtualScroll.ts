import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVirtualScrollOptions {
  /** Total number of items in the list */
  totalItems: number;
  /** Estimated height of each item in pixels */
  itemHeight: number;
  /** Number of extra items to render above/below the viewport */
  overscan?: number;
}

interface UseVirtualScrollResult {
  /** The start index of the visible window (inclusive) */
  startIndex: number;
  /** The end index of the visible window (exclusive) */
  endIndex: number;
  /** Total height of the virtual container in pixels */
  totalHeight: number;
  /** Top offset (padding) to position items correctly */
  offsetTop: number;
  /** Callback ref to attach to the scrollable container */
  containerRef: (node: HTMLElement | null) => void;
}

/**
 * Lightweight virtual scroll hook.
 * Only renders items within the visible viewport + overscan buffer.
 * Uses a callback ref pattern so it can be attached to any scrollable container.
 */
export function useVirtualScroll({
  totalItems,
  itemHeight,
  overscan = 5,
}: UseVirtualScrollOptions): UseVirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const nodeRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return; // Already scheduled
    rafRef.current = requestAnimationFrame(() => {
      if (nodeRef.current) {
        setScrollTop(nodeRef.current.scrollTop);
      }
      rafRef.current = null;
    });
  }, []);

  const containerRef = useCallback(
    (node: HTMLElement | null) => {
      // Cleanup previous
      if (nodeRef.current) {
        nodeRef.current.removeEventListener('scroll', handleScroll);
      }

      nodeRef.current = node;

      if (node) {
        setContainerHeight(node.clientHeight);
        setScrollTop(node.scrollTop);
        node.addEventListener('scroll', handleScroll, { passive: true });
      }
    },
    [handleScroll]
  );

  // Track resize
  useEffect(() => {
    if (!nodeRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, []);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const totalHeight = totalItems * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(totalItems, startIndex + visibleCount);
  const offsetTop = startIndex * itemHeight;

  return { startIndex, endIndex, totalHeight, offsetTop, containerRef };
}
