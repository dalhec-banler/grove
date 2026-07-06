import { useRef, useEffect, useState, useCallback } from 'react';

const THRESHOLD = 64;
const MAX_PULL = 120;
const INDICATOR_H = 72;
const MOBILE_MAX_WIDTH = 768;

interface PullToRefreshResult {
  // Attach to the indicator container; the hook drives it imperatively via
  // `transform` (compositor-only) so pull visuals never re-render React or
  // animate height — per the repo scroll rule.
  indicatorRef: React.RefObject<HTMLDivElement>;
  // Attach to the "pull / release" label span; text is updated imperatively.
  labelRef: React.RefObject<HTMLSpanElement>;
  // The one and only React state transition.
  isRefreshing: boolean;
}

export function usePullToRefresh(
  scrollRef: React.RefObject<HTMLElement | null>,
  onRefresh: () => Promise<void>,
): PullToRefreshResult {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // Reveal is a translateY on a container that sits hidden above the fold
  // (negative margin). No layout, no state — just a transform.
  const reveal = useCallback((px: number) => {
    const el = indicatorRef.current;
    if (el) el.style.transform = `translateY(${Math.min(px, INDICATOR_H)}px)`;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.innerWidth >= MOBILE_MAX_WIDTH) return;
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [scrollRef]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling.current || window.innerWidth >= MOBILE_MAX_WIDTH) return;
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) {
      pulling.current = false;
      pullRef.current = 0;
      reveal(0);
      return;
    }
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      const dampened = Math.min(dy * 0.4, MAX_PULL);
      pullRef.current = dampened;
      reveal(dampened);
      const label = labelRef.current;
      if (label) label.textContent = dampened >= THRESHOLD ? '↑ Release to refresh' : '↓ Pull to refresh';
    }
  }, [scrollRef, reveal]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    const dist = pullRef.current;
    pullRef.current = 0;
    if (dist >= THRESHOLD) {
      setIsRefreshing(true);
      reveal(INDICATOR_H);
      try {
        await onRefreshRef.current();
      } finally {
        setIsRefreshing(false);
        reveal(0);
      }
    } else {
      reveal(0);
    }
  }, [reveal]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { indicatorRef, labelRef, isRefreshing };
}
