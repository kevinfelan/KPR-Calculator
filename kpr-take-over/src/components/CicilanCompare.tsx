import type { ComparisonResult } from '../lib/types';
import { formatRupiah, formatPersenLabel } from '../lib/format';
import { AnimatedNumber } from './AnimatedNumber';

interface Bank {
  nama: string;
  ket: string;
  fix: number;
  floating: number;
}

function arahDari(sesudah: number, sebelum: number): string {
  if (Math.abs(sesudah - sebelum) < 1) return '';
  return sesudah < sebelum ? 'is-down' : 'is-up';
}

function deltaLabel(sesudah: number, sebelum: number, ringkas = false): string {
  const delta = sesudah - sebelum;
  if (Math.abs(delta) < 1) return ringkas ? 'sama' : 'cicilan praktis sama';
  const turun = delta < 0;
  const persen = sebelum > 0 ? Math.abs(delta) / sebelum : 0;
  const panah = turun ? '▼' : '▲';
  if (ringkas) return `${panah} ${formatPersenLabel(persen)}`;
  return `${panah} ${formatRupiah(Math.abs(delta))}/bln (${formatPersenLabel(persen)}) ${turun ? 'lebih ringan' : 'lebih berat'}`;
}

/** Sorotan utama panel hasil: cicilan per bulan sebelum vs sesudah take over. */
export function CicilanCompare({ result }: { result: ComparisonResult }) {
  const bank: Bank[] = result.kprList.map((k, i) => ({
    nama: `Bank ${i + 1}`,
    ket: i === 0 ? 'sekarang' : `setelah take over ke-${i}`,
    fix: k.cicilanFix,
    floating: k.cicilanFloating,
  }));

  const fase: { label: string; ket: string; key: 'fix' | 'floating' }[] = [
    { label: 'Masa fix', ket: 'selama bunga masih tetap', key: 'fix' },
    { label: 'Masa floating', ket: 'setelah masa fix habis', key: 'floating' },
  ];

  // Dua bank cukup ditampilkan berdampingan; tiga bank atau lebih dirantai ke bawah
  // supaya angkanya tetap terbaca di layar HP.
  const rantai = bank.length > 2;

  return (
    <div className="cmp">
      {fase.map((f) => {
        const nilai = bank.map((b) => b[f.key]);
        const awal = nilai[0];
        const akhir = nilai[nilai.length - 1];
        return (
          <div className="cmp__item" key={f.key}>
            <div className="cmp__head">
              <span className="cmp__label">{f.label}</span>
              <span className="cmp__ket">{f.ket}</span>
            </div>

            {rantai ? (
              <div className="cmp__list">
                {bank.map((b, i) => (
                  <div className="cmp__step" key={b.nama}>
                    <span className="cmp__steplabel">
                      {b.nama} · {b.ket}
                    </span>
                    <span className="cmp__stepval">
                      <span className={`cmp__num ${i === 0 ? '' : arahDari(nilai[i], awal)}`}>
                        <AnimatedNumber value={nilai[i]} format={formatRupiah} />
                      </span>
                      {i > 0 && (
                        <span className={`cmp__deltamini ${arahDari(nilai[i], awal)}`}>{deltaLabel(nilai[i], awal, true)}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cmp__pair">
                <div className="cmp__side">
                  <span className="cmp__cap">Sebelum · Bank 1</span>
                  <span className="cmp__num">
                    <AnimatedNumber value={awal} format={formatRupiah} />
                  </span>
                </div>
                <span className="cmp__arrow" aria-hidden>→</span>
                <div className="cmp__side cmp__side--after">
                  <span className="cmp__cap">Sesudah · Bank 2</span>
                  <span className={`cmp__num ${arahDari(akhir, awal)}`}>
                    <AnimatedNumber value={akhir} format={formatRupiah} />
                  </span>
                </div>
              </div>
            )}

            <div className={`cmp__delta ${arahDari(akhir, awal)}`}>
              {rantai ? `Bank 1 → Bank ${bank.length}: ` : ''}
              {deltaLabel(akhir, awal)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
