import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
  judul: ReactNode;
  /** Ditampilkan di kepala kotak, tetap terlihat walau isinya ditutup. */
  ringkas?: ReactNode;
  bawaanTerbuka?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Kotak yang bisa dibuka-tutup, terbuka ke bawah. Tingginya diukur dari isinya
 * (bukan ditebak) lalu dianimasikan lewat max-height; setelah terbuka penuh
 * batasnya dilepas supaya isi yang berubah tidak terpotong.
 */
export function Kolaps({ judul, ringkas, bawaanTerbuka = false, className = '', children }: Props) {
  const [terbuka, setTerbuka] = useState(bawaanTerbuka);
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;

    if (terbuka) {
      panel.style.maxHeight = `${inner.offsetHeight}px`;
      const lepas = () => {
        panel.style.maxHeight = 'none';
      };
      panel.addEventListener('transitionend', lepas, { once: true });
      const cadangan = window.setTimeout(lepas, 500);
      return () => {
        panel.removeEventListener('transitionend', lepas);
        window.clearTimeout(cadangan);
      };
    }

    // Kunci dulu ke tinggi nyata, paksa reflow, baru turunkan ke nol supaya
    // transisinya punya titik awal yang jelas.
    panel.style.maxHeight = `${inner.offsetHeight}px`;
    void panel.offsetHeight;
    panel.style.maxHeight = '0px';
  }, [terbuka]);

  return (
    <div className={`kolaps ${terbuka ? 'is-open' : ''} ${className}`.trim()}>
      <button
        type="button"
        className="kolaps__toggle"
        aria-expanded={terbuka}
        aria-controls={panelId}
        onClick={() => setTerbuka((o) => !o)}
      >
        <span className="kolaps__teks">
          <span className="kolaps__judul">{judul}</span>
          {ringkas && <span className="kolaps__ringkas">{ringkas}</span>}
        </span>
        <span className="kolaps__chev" aria-hidden>▾</span>
      </button>
      <div className="kolaps__panel" id={panelId} ref={panelRef}>
        <div className="kolaps__inner" ref={innerRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
