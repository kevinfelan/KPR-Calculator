export function Logo({ size = 30, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Logo Kev's KPR Calculator" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="11" fill={color} />
      {/* house */}
      <path d="M9 21.5 20 11l11 10.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 20v9.5h17V20" fill="#fff" />
      <rect x="17.5" y="23.5" width="5" height="6" rx="1" fill={color} />
      <rect x="13.5" y="22" width="3.2" height="3.2" rx="0.6" fill={color} opacity="0.55" />
      {/* transfer / take-over arrows */}
      <g stroke="#f0b93f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M24.5 32.2a5 5 0 0 1 6.7-1.6" />
        <path d="M31.6 27.7l-.2 3.2-3.1-.5" fill="#f0b93f" stroke="none" />
      </g>
      <circle cx="12.5" cy="31.5" r="3.6" fill="#f0b93f" />
      <text x="12.5" y="34" textAnchor="middle" fontSize="6" fontWeight="700" fill={color} fontFamily="Segoe UI, Arial, sans-serif">%</text>
    </svg>
  );
}
