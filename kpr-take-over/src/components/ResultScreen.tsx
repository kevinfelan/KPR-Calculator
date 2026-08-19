import type { ComparisonResult } from '../lib/types';
import { formatRingkas, formatRupiah, formatPersenLabel } from '../lib/format';
import { HouseArt } from './HouseArt';
import { AnimatedNumber } from './AnimatedNumber';
import { CicilanCompare } from './CicilanCompare';

/** Label baris bunga untuk tiap KPR pada rantai take over. */
function labelBunga(i: number, jumlahKpr: number, jumlahTahap: number): string {
  const terakhir = i === jumlahKpr - 1;
  if (terakhir) return `Bunga KPR ${i + 1} (fix & floating)`;
  const urutan = jumlahTahap > 1 ? ` ke-${i + 1}` : '';
  return `Bunga KPR ${i + 1} (sebelum take over${urutan})`;
}

export function ResultScreen({ result }: { result: ComparisonResult }) {
  const hemat = result.hemat;
  const jumlahTahap = result.tahap.length;
  const cicilanAkhir = result.kprAkhir.cicilanFloating;
  const cicilanAwal = result.kpr1.cicilanFloating;

  return (
    <div className={`panel-result ${hemat ? '' : 'panel-result--bad'}`}>
      <div className="pr__hero">
        <span className="pr__cap">Cicilan per bulan</span>
        <span className="pr__subtitle">
          {jumlahTahap > 1 ? 'Sebelum → setelah 2x take over' : 'Sebelum → sesudah take over'}
        </span>
        <CicilanCompare result={result} />
        <div className="pr__note">
          <span className="i-bulb" aria-hidden />
          <span>
            {cicilanAkhir < cicilanAwal
              ? `Saat masuk masa floating, cicilan turun dari ${formatRingkas(cicilanAwal)} jadi ${formatRingkas(cicilanAkhir)}. `
              : ''}
            Biaya yang dikeluarkan hanya biaya take over saja — sering masih ada cashback asuransi dari KPR pertama.
          </span>
        </div>
      </div>

      <div className="pr__rows">
        {result.bungaPerKpr.map((bunga, i) => (
          <div className="pr__row" key={i}>
            <span>{labelBunga(i, result.bungaPerKpr.length, jumlahTahap)}</span>
            <span><AnimatedNumber value={bunga} format={formatRupiah} /></span>
          </div>
        ))}
        <div className="pr__row">
          <span>Biaya take over{jumlahTahap > 1 ? ` (${jumlahTahap}x)` : ''}</span>
          <span><AnimatedNumber value={result.biayaTotal} format={formatRupiah} /></span>
        </div>
        <div className="pr__row pr__row--total">
          <span>Total dengan take over</span>
          <span><AnimatedNumber value={result.totalDenganTakeOver} format={formatRupiah} /></span>
        </div>
      </div>

      <div className="pr__summary">
        <HouseArt className="pr__art" />
        <span className="pr__cap">{hemat ? 'Kamu hemat' : 'Take over lebih mahal'}</span>
        <span className="pr__value">
          <AnimatedNumber value={Math.abs(result.selisih)} format={formatRingkas} />
        </span>
        <span className="pr__badge">
          {hemat ? '▼' : '▲'} {formatPersenLabel(Math.abs(result.selisihPersen))} {hemat ? 'lebih hemat' : 'lebih mahal'}
        </span>
        <span className="pr__sub">
          Tanpa take over {formatRingkas(result.totalTanpaTakeOver)} → dengan take over {formatRingkas(result.totalDenganTakeOver)}
        </span>
      </div>
    </div>
  );
}
