import { useId } from 'react';

/**
 * Lambang aplikasi: rumah + panah pindah KPR, memakai warna Weltown —
 * ubin emas bergradasi dengan siluet hitam hangat. Jendela dilubangi lewat
 * mask supaya gradasi di belakangnya tetap terlihat.
 */
export function Logo({ size = 30 }: { size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `wt-gold-${uid}`;
  const maskId = `wt-house-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Logo Pindah KPR Calculator" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7e6ac" />
          <stop offset="32%" stopColor="#dcb84e" />
          <stop offset="66%" stopColor="#bd9522" />
          <stop offset="100%" stopColor="#8a6a12" />
        </linearGradient>
        <mask id={maskId}>
          <rect width="40" height="40" fill="#fff" />
          {/* jendela & pintu dilubangi */}
          <rect x="17.5" y="23.5" width="5" height="6" rx="1" fill="#000" />
          <rect x="13.5" y="22" width="3.2" height="3.2" rx="0.6" fill="#000" />
        </mask>
      </defs>

      <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />

      <g mask={`url(#${maskId})`}>
        {/* rumah */}
        <path d="M9 21.5 20 11l11 10.5" fill="none" stroke="#14110a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.5 20v9.5h17V20" fill="#14110a" />
      </g>

      {/* panah pindah / take over */}
      <g stroke="#14110a" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M24.5 32.2a5 5 0 0 1 6.7-1.6" />
      </g>
      <path d="M31.6 27.7l-.2 3.2-3.1-.5" fill="#14110a" />
      <circle cx="12.5" cy="31.5" r="3.6" fill="#14110a" />
      <text x="12.5" y="34" textAnchor="middle" fontSize="6" fontWeight="700" fill="#e3c163" fontFamily="Segoe UI, Arial, sans-serif">%</text>
    </svg>
  );
}
