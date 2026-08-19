import { useId } from 'react';

/**
 * Lambang Weltown: lingkaran emas dengan huruf "W" serif, dipotong garis miring
 * di sisi kanan atas. Potongannya dibuat transparan (mask) supaya menyatu dengan
 * latar apa pun — terang maupun gelap.
 */
export function Logo({ size = 30 }: { size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `wt-gold-${uid}`;
  const maskId = `wt-cut-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Logo Weltown" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7e6ac" />
          <stop offset="32%" stopColor="#dcb84e" />
          <stop offset="66%" stopColor="#bd9522" />
          <stop offset="100%" stopColor="#8a6a12" />
        </linearGradient>
        <mask id={maskId}>
          <rect width="40" height="40" fill="#fff" />
          <rect x="28" y="-4" width="3.2" height="50" transform="rotate(22.8 28 -4)" fill="#000" />
        </mask>
      </defs>

      <circle cx="20" cy="20" r="19" fill={`url(#${gradId})`} mask={`url(#${maskId})`} />

      <g fill="#14110a">
        <path
          d="M11 13 L15.6 28.5 L20 13 L24.4 28.5 L29 13"
          fill="none"
          stroke="#14110a"
          strokeWidth="3.6"
          strokeLinejoin="miter"
        />
        <rect x="8.2" y="11.3" width="5.8" height="2.7" />
        <rect x="17.2" y="11.3" width="5.6" height="2.7" />
        <rect x="26" y="11.3" width="5.8" height="2.7" />
      </g>
    </svg>
  );
}
