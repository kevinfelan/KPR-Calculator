import type { ComparisonResult } from '../lib/types';
import { formatRingkas, formatRupiah, formatPersenLabel } from '../lib/format';
import { HouseArt } from './HouseArt';
import { AnimatedNumber } from './AnimatedNumber';
import { CicilanCompare } from './CicilanCompare';

export function ResultScreen({ result }: { result: ComparisonResult }) {
  const hemat = result.hemat;
  return (
    <div className={`panel-result ${hemat ? '' : 'panel-result--bad'}`}>
      <div className="pr__hero">
        <span className="pr__cap">Cicilan per bulan</span>
        <span className="pr__subtitle">Sebelum → sesudah take over</span>
        <CicilanCompare result={result} />
        <div className="pr__note">
          <span className="i-bulb" aria-hidden />
          <span>
            {result.kpr2.cicilanFloating < result.kpr1.cicilanFloating
              ? `Saat masuk masa floating, cicilan turun dari ${formatRingkas(result.kpr1.cicilanFloating)} jadi ${formatRingkas(result.kpr2.cicilanFloating)}. `
              : ''}
            Biaya yang dikeluarkan hanya biaya take over saja — sering masih ada cashback asuransi dari KPR pertama.
          </span>
        </div>
      </div>

      <div className="pr__rows">
        <div className="pr__row">
          <span>Bunga KPR 1 (sebelum take over)</span>
          <span><AnimatedNumber value={result.bungaKpr1} format={formatRupiah} /></span>
        </div>
        <div className="pr__row">
          <span>Bunga KPR 2 (fix &amp; floating)</span>
          <span><AnimatedNumber value={result.bungaKpr2} format={formatRupiah} /></span>
        </div>
        <div className="pr__row">
          <span>Biaya take over</span>
          <span><AnimatedNumber value={result.biaya.total} format={formatRupiah} /></span>
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
