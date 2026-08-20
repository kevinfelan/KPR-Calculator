import type { ComparisonResult } from '../lib/types';
import { bangunCicilanTahunan } from '../lib/finance';
import { formatRingkas } from '../lib/format';

/** "Rp 11,6 jt" atau "Rp 11,6 jt → Rp 19,5 jt" bila berubah di tengah tahun. */
function nilai(nilaiTahun: number[]): string {
  if (nilaiTahun.length === 0) return 'lunas';
  return nilaiTahun.map(formatRingkas).join(' → ');
}

/**
 * Simulasi cicilan per tahun sepanjang tenor — tetap di Bank 1 dibanding
 * jalur take over.
 */
export function TabelCicilan({ result }: { result: ComparisonResult }) {
  const baris = bangunCicilanTahunan(result);

  return (
    <div className="tblwrap">
      <table className="tbl tbl--simulasi">
        <thead>
          <tr>
            <th>Tahun</th>
            <th>Tanpa take over</th>
            <th>Dengan take over</th>
          </tr>
        </thead>
        <tbody>
          {baris.map((b) => {
            const tunggal = b.tanpa.length === 1 && b.dengan.length === 1;
            const selisih = tunggal ? b.tanpa[0] - b.dengan[0] : null;
            const lebihRingan = selisih !== null && selisih >= 1;
            return (
              <tr key={b.tahun} className={b.takeOver.length ? 'is-pindah' : undefined}>
                <td>
                  Tahun {b.tahun}
                  {b.takeOver.map((urutan) => (
                    <em key={urutan}>{urutan === 1 ? 'take over' : `take over ke-${urutan}`}</em>
                  ))}
                </td>
                <td>{nilai(b.tanpa)}</td>
                <td className={lebihRingan ? 'good' : undefined}>
                  {nilai(b.dengan)}
                  {selisih !== null && Math.abs(selisih) >= 1 && (
                    <em>
                      {selisih > 0 ? '▼' : '▲'} {formatRingkas(Math.abs(selisih))}
                    </em>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
