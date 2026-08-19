import type { ComparisonResult } from '../lib/types';
import { formatRupiah, formatPersenLabel } from '../lib/format';
import { AnimatedNumber } from './AnimatedNumber';

interface Baris {
  label: string;
  ket: string;
  sebelum: number;
  sesudah: number;
}

/** Sorotan utama panel hasil: cicilan per bulan sebelum vs sesudah take over. */
export function CicilanCompare({ result }: { result: ComparisonResult }) {
  const baris: Baris[] = [
    {
      label: 'Masa fix',
      ket: 'selama bunga masih tetap',
      sebelum: result.kpr1.cicilanFix,
      sesudah: result.kpr2.cicilanFix,
    },
    {
      label: 'Masa floating',
      ket: 'setelah masa fix habis',
      sebelum: result.kpr1.cicilanFloating,
      sesudah: result.kpr2.cicilanFloating,
    },
  ];

  return (
    <div className="cmp">
      {baris.map((b) => {
        const delta = b.sesudah - b.sebelum;
        const sama = Math.abs(delta) < 1;
        const turun = delta < 0;
        const persen = b.sebelum > 0 ? Math.abs(delta) / b.sebelum : 0;
        const arah = sama ? '' : turun ? 'is-down' : 'is-up';
        return (
          <div className="cmp__item" key={b.label}>
            <div className="cmp__head">
              <span className="cmp__label">{b.label}</span>
              <span className="cmp__ket">{b.ket}</span>
            </div>
            <div className="cmp__pair">
              <div className="cmp__side">
                <span className="cmp__cap">Sebelum · Bank 1</span>
                <span className="cmp__num">
                  <AnimatedNumber value={b.sebelum} format={formatRupiah} />
                </span>
              </div>
              <span className="cmp__arrow" aria-hidden>→</span>
              <div className="cmp__side cmp__side--after">
                <span className="cmp__cap">Sesudah · Bank 2</span>
                <span className={`cmp__num ${arah}`}>
                  <AnimatedNumber value={b.sesudah} format={formatRupiah} />
                </span>
              </div>
            </div>
            <div className={`cmp__delta ${arah}`}>
              {sama
                ? 'cicilan praktis sama'
                : `${turun ? '▼' : '▲'} ${formatRupiah(Math.abs(delta))}/bln (${formatPersenLabel(persen)}) ${
                    turun ? 'lebih ringan' : 'lebih berat'
                  }`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
