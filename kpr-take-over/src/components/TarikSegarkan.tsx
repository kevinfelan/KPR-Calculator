interface Props {
  jarak: number;
  menyegarkan: boolean;
  ambang: number;
}

/** Lingkaran penanda yang turun mengikuti tarikan jari. */
export function TarikSegarkan({ jarak, menyegarkan, ambang }: Props) {
  if (jarak <= 0) return null;
  const siap = jarak >= ambang;
  return (
    <div
      className={`ptr ${menyegarkan ? 'is-muat' : ''}`}
      style={{ transform: `translate(-50%, ${jarak}px)`, opacity: Math.min(jarak / ambang, 1) }}
      aria-hidden
    >
      <span className={`ptr__ikon ${siap ? 'is-siap' : ''}`} style={{ rotate: `${jarak * 3}deg` }}>
        ↻
      </span>
    </div>
  );
}
