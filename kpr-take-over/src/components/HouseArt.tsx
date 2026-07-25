export function HouseArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 200" role="img" aria-label="Ilustrasi rumah" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="ha-round"><rect x="0" y="0" width="320" height="200" rx="16" /></clipPath>
      </defs>
      <g clipPath="url(#ha-round)">
        {/* backdrop */}
        <circle cx="160" cy="120" r="118" fill="#3f9e86" opacity="0.5" />
        <circle cx="160" cy="205" r="150" fill="#2f8570" opacity="0.55" />

        {/* sun + clouds */}
        <circle cx="54" cy="44" r="15" fill="#f6c25b" />
        <g stroke="#f6c25b" strokeWidth="2.4" strokeLinecap="round">
          <path d="M54 20v-7M54 75v-6M30 44h-7M85 44h-6M36 26l-4-4M76 26l4-4" opacity="0.7" />
        </g>
        <g fill="#ffffff" opacity="0.4">
          <ellipse cx="240" cy="40" rx="26" ry="10" />
          <ellipse cx="222" cy="44" rx="14" ry="8" />
          <ellipse cx="108" cy="30" rx="18" ry="7" />
        </g>

        {/* left trees */}
        <g>
          <rect x="30" y="128" width="7" height="34" rx="2" fill="#7a5a3a" />
          <circle cx="33.5" cy="118" r="20" fill="#2f8570" />
          <circle cx="24" cy="128" r="14" fill="#347d68" />
          <circle cx="44" cy="128" r="14" fill="#347d68" />
        </g>

        {/* garage wing */}
        <g>
          <rect x="206" y="112" width="52" height="52" fill="#e7edea" />
          <path d="M200 114 232 88 264 114Z" fill="#37455a" />
          <path d="M200 114 232 88 264 114" fill="none" stroke="#2b3648" strokeWidth="2" strokeLinejoin="round" />
          <rect x="216" y="126" width="34" height="38" rx="2" fill="#c9d4cf" />
          <line x1="216" y1="136" x2="250" y2="136" stroke="#aeb9b4" strokeWidth="1.6" />
          <line x1="216" y1="146" x2="250" y2="146" stroke="#aeb9b4" strokeWidth="1.6" />
          <line x1="216" y1="156" x2="250" y2="156" stroke="#aeb9b4" strokeWidth="1.6" />
        </g>

        {/* main house */}
        <g>
          {/* chimney + smoke */}
          <rect x="180" y="70" width="12" height="24" fill="#455063" />
          <g fill="#ffffff" opacity="0.5">
            <circle cx="186" cy="62" r="4" />
            <circle cx="191" cy="54" r="5" />
            <circle cx="197" cy="46" r="6" />
          </g>
          {/* roof */}
          <path d="M104 100 158 60 212 100Z" fill="#2b3648" />
          <path d="M104 100 158 60 212 100" fill="none" stroke="#1f2836" strokeWidth="2" strokeLinejoin="round" />
          <path d="M120 100 158 72 196 100" fill="none" stroke="#3a465a" strokeWidth="1.6" opacity="0.7" />
          {/* dormer */}
          <path d="M146 82 158 71 170 82Z" fill="#37455a" />
          <rect x="150" y="82" width="16" height="12" fill="#f6c25b" />
          <line x1="158" y1="82" x2="158" y2="94" stroke="#c99a3f" strokeWidth="1.4" />
          {/* walls */}
          <rect x="110" y="98" width="96" height="66" fill="#f7faf9" />
          <rect x="110" y="98" width="96" height="6" fill="#e7ece9" />
          {/* windows with shutters + flower box */}
          <g>
            <rect x="122" y="112" width="22" height="22" rx="2" fill="#f6c25b" />
            <line x1="133" y1="112" x2="133" y2="134" stroke="#c99a3f" strokeWidth="1.6" />
            <line x1="122" y1="123" x2="144" y2="123" stroke="#c99a3f" strokeWidth="1.6" />
            <rect x="116" y="112" width="4" height="22" fill="#5b8f7d" />
            <rect x="146" y="112" width="4" height="22" fill="#5b8f7d" />
            <rect x="120" y="134" width="26" height="5" rx="1.5" fill="#3a8f78" />
          </g>
          <g>
            <rect x="172" y="112" width="22" height="22" rx="2" fill="#f6c25b" />
            <line x1="183" y1="112" x2="183" y2="134" stroke="#c99a3f" strokeWidth="1.6" />
            <line x1="172" y1="123" x2="194" y2="123" stroke="#c99a3f" strokeWidth="1.6" />
            <rect x="166" y="112" width="4" height="22" fill="#5b8f7d" />
            <rect x="196" y="112" width="4" height="22" fill="#5b8f7d" />
            <rect x="170" y="134" width="26" height="5" rx="1.5" fill="#3a8f78" />
          </g>
          {/* door + steps */}
          <rect x="148" y="136" width="20" height="28" rx="2" fill="#2b3648" />
          <path d="M150 140h16M158 138v26" stroke="#3f4b60" strokeWidth="1.2" />
          <circle cx="163" cy="151" r="1.8" fill="#f6c25b" />
          <rect x="144" y="160" width="28" height="4" rx="1" fill="#d4dbd7" />
        </g>

        {/* right bush */}
        <g fill="#347d68">
          <circle cx="272" cy="156" r="13" />
          <circle cx="286" cy="158" r="10" />
          <circle cx="260" cy="159" r="9" />
        </g>

        {/* pathway */}
        <path d="M150 164 h20 l10 30 h-40Z" fill="#d8ded9" />
        <line x1="158" y1="170" x2="158" y2="192" stroke="#c3ccc7" strokeWidth="2" strokeDasharray="4 5" />

        {/* fence */}
        <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9">
          <line x1="70" y1="168" x2="70" y2="182" />
          <line x1="82" y1="168" x2="82" y2="182" />
          <line x1="94" y1="168" x2="94" y2="182" />
          <line x1="106" y1="168" x2="106" y2="182" />
          <line x1="64" y1="174" x2="112" y2="174" strokeWidth="2.4" />
        </g>

        {/* grass foreground */}
        <rect x="0" y="182" width="320" height="18" fill="#3a8f78" />
        <g stroke="#2f8570" strokeWidth="2" strokeLinecap="round">
          <path d="M40 182v-6M48 182v-8M56 182v-5M300 182v-7M292 182v-5" />
        </g>
      </g>
    </svg>
  );
}
