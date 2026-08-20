import type { ComparisonResult } from '../lib/types';
import { bangunSegmenCicilan } from '../lib/finance';
import { formatRingkas, tahunDariBulan } from '../lib/format';

function nilai(n: number | null): string {
  return n === null ? 'lunas' : formatRingkas(n);
}

/**
 * Simulasi cicilan sepanjang tenor: tiap baris satu rentang bulan dengan
 * besaran cicilan yang tetap, dibandingkan antara tetap di Bank 1 dan
 * jalur take over.
 */
export function TabelCicilan({ result }: { result: ComparisonResult }) {
  const segmen = bangunSegmenCicilan(result);

  return (
    <div className="tblwrap">
      <table className="tbl tbl--simulasi">
        <thead>
          <tr>
            <th>Periode</th>
            <th>Tanpa take over</th>
            <th>Dengan take over</th>
          </tr>
        </thead>
        <tbody>
          {segmen.map((s) => {
            const lebihRingan = s.tanpa !== null && s.dengan !== null && s.dengan < s.tanpa;
            const selisih = s.tanpa !== null && s.dengan !== null ? s.tanpa - s.dengan : null;
            return (
              <tr key={s.dari}>
                <td>
                  Bln {s.dari}–{s.sampai}
                  <em>{s.sampai - s.dari + 1} bln · {tahunDariBulan(s.sampai - s.dari + 1)} th</em>
                </td>
                <td>{nilai(s.tanpa)}</td>
                <td className={lebihRingan ? 'good' : undefined}>
                  {nilai(s.dengan)}
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
