import { useEffect, useRef, useState } from 'react';

/** Jarak tarik (px) yang harus dilewati sebelum halaman dimuat ulang. */
const AMBANG = 72;
/** Jarak maksimum indikator turun, supaya tarikan terasa ada batasnya. */
const MAKS = 110;
/** Tarikan diredam supaya tidak mengikuti jari 1:1. */
const REDAM = 0.5;

/** Aplikasi sedang dijalankan sebagai PWA terpasang, bukan tab browser biasa. */
function modeTerpasang(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

/**
 * Tarik-untuk-muat-ulang ala aplikasi native.
 *
 * Hanya aktif pada PWA terpasang: di tab browser biasa, Chrome/Safari sudah
 * punya gerakan yang sama sendiri, dan menimpanya justru membuat dua perilaku
 * bertabrakan.
 */
export function useTarikSegarkan() {
  const [jarak, setJarak] = useState(0);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const mulaiY = useRef<number | null>(null);
  const jarakRef = useRef(0);
  const sedangSegarkan = useRef(false);

  useEffect(() => {
    if (!modeTerpasang()) return;

    document.documentElement.classList.add('pwa-terpasang');

    const geser = (v: number) => {
      jarakRef.current = v;
      setJarak(v);
    };

    const onStart = (e: TouchEvent) => {
      if (sedangSegarkan.current || e.touches.length !== 1) return;
      // Hanya mulai bila halaman benar-benar sudah di puncak.
      mulaiY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };

    const onMove = (e: TouchEvent) => {
      if (mulaiY.current === null || sedangSegarkan.current) return;
      const delta = e.touches[0].clientY - mulaiY.current;
      if (delta <= 0) {
        // Jari bergerak ke atas — biarkan halaman menggulir seperti biasa.
        if (jarakRef.current !== 0) geser(0);
        mulaiY.current = null;
        return;
      }
      // Tahan gulir bawaan supaya halaman tidak ikut memantul saat ditarik.
      if (e.cancelable) e.preventDefault();
      geser(Math.min(delta * REDAM, MAKS));
    };

    const onEnd = () => {
      if (mulaiY.current === null) return;
      mulaiY.current = null;
      if (jarakRef.current >= AMBANG) {
        sedangSegarkan.current = true;
        setMenyegarkan(true);
        geser(AMBANG);
        // Beri sekejap agar indikator terlihat berputar sebelum halaman hilang.
        window.setTimeout(() => window.location.reload(), 320);
        return;
      }
      geser(0);
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onEnd, { passive: true });

    return () => {
      document.documentElement.classList.remove('pwa-terpasang');
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  return { jarak, menyegarkan, ambang: AMBANG };
}
