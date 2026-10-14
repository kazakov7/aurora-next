import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from './LoadingSpinner';

const SHOW_DELAY_MS = 250;
const MAX_VISIBLE_MS = 10_000;

export const RouteProgressBar: React.FC = () => {
  const router = useRouter();
  const [showCompass, setShowCompass] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
    };

    const handleStop = () => {
      clearTimers();
      setShowCompass(false);
    };

    const handleStart = (url: string) => {
      // Ignore if navigating to the same path
      if (url === router.asPath) return;

      clearTimers();

      // Fast transitions should not flash a fullscreen loader.
      showTimerRef.current = setTimeout(() => {
        showTimerRef.current = null;
        setShowCompass(true);

        // A cancelled route, dev HMR, or a missed router event must never leave
        // the page blocked behind the fullscreen overlay indefinitely.
        safetyTimerRef.current = setTimeout(handleStop, MAX_VISIBLE_MS);
      }, SHOW_DELAY_MS);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);
    window.addEventListener('pageshow', handleStop);

    return () => {
      clearTimers();
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
      window.removeEventListener('pageshow', handleStop);
    };
  }, [router.asPath, router.events]);

  // `asPath` is the final source of truth after a successful navigation. This
  // also recovers from development HMR if the completion event was missed.
  useEffect(() => {
    setShowCompass(false);
  }, [router.asPath]);

  if (!showCompass) return null;

  return (
    <LoadingSpinner
      fullscreen
      size="lg"
      label="MANZIL TAYYORLANMOQDA"
      sublabel="Aurora Travel • Ma'lumotlar yuklanmoqda..."
    />
  );
};

export default RouteProgressBar;
