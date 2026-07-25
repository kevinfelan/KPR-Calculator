import type { AmortResult } from '../lib/types';
import { formatRingkas, formatRupiah } from '../lib/format';

/** Grafik batang angsuran/bulan tiap tahun, dibedakan fase fix vs floating. */
export function AmortChart({ data }: { data: AmortResult }) {
  const years: { tahun: number; cicilan: number; fase: 'fix' | 'floating' }[] = [];
  for (let i = 0; i < data.rows.length; i += 12) {
    const r = data.rows[i];
    years.push({ tahun: i / 12 + 1, cicilan: r.cicilan, fase: r.fase });
  }
  if (years.length === 0) return null;

  const max = Math.max(...years.map((y) => y.cicilan)) || 1;
  const hasFloating = years.some((y) => y.fase === 'floating');

  return (
    <div className="amchart">
      <div className="amchart__legend">
        <span><i className="amdot amdot--fix" aria-hidden />Cicilan fix · {formatRingkas(data.cicilanFix)}/bln</span>
        {hasFloating && (
          <span><i className="amdot amdot--float" aria-hidden />Cicilan floating · {formatRingkas(data.cicilanFloating)}/bln</span>
        )}
      </div>
      <div className="amchart__bars" role="img" aria-label={`Grafik angsuran per bulan tiap tahun, ${years.length} tahun`}>
        {years.map((y) => (
          <div
            className="ambar"
            key={y.tahun}
            title={`Tahun ${y.tahun}: ${formatRupiah(y.cicilan)}/bln (${y.fase === 'fix' ? 'fix' : 'floating'})`}
          >
            <div
              className={`ambar__fill ambar__fill--${y.fase}`}
              style={{ height: `${Math.max((y.cicilan / max) * 100, 3)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="amchart__axis">
        <span>Tahun 1</span>
        <span>Tahun {years.length}</span>
      </div>
    </div>
  );
}
