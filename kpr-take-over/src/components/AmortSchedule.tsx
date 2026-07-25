import { useMemo, useState } from 'react';
import type { AmortResult } from '../lib/types';
import { formatRupiah, formatRingkas } from '../lib/format';
import { AmortChart } from './AmortChart';

interface Props {
  title: string;
  data: AmortResult;
}

/** Ringkasan jadwal angsuran per tahun (bisa dibuka-tutup). */
export function AmortSchedule({ title, data }: Props) {
  const [open, setOpen] = useState(false);

  const perTahun = useMemo(() => {
    const groups: { tahun: number; cicilan: number; bunga: number; pokok: number; saldo: number; fase: string }[] = [];
    data.rows.forEach((r, i) => {
      const tahun = Math.floor(i / 12) + 1;
      let g = groups[tahun - 1];
      if (!g) {
        g = { tahun, cicilan: 0, bunga: 0, pokok: 0, saldo: 0, fase: r.fase };
        groups[tahun - 1] = g;
      }
      g.bunga += r.bunga;
      g.pokok += r.pokok;
      g.cicilan += r.cicilan;
      g.saldo = r.saldo;
      g.fase = r.fase;
    });
    return groups;
  }, [data]);

  return (
    <div className="accordion">
      <button type="button" className="accordion__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{title}</span>
        <span className="accordion__chev" aria-hidden>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="accordion__body">
          <AmortChart data={data} />
          <table className="tbl tbl--sched">
            <thead>
              <tr>
                <th>Tahun</th>
                <th>Bunga</th>
                <th>Pokok</th>
                <th>Sisa saldo</th>
              </tr>
            </thead>
            <tbody>
              {perTahun.map((g) => (
                <tr key={g.tahun} className={g.fase === 'floating' ? 'row--float' : undefined}>
                  <td>
                    {g.tahun}
                    <span className={`tag tag--${g.fase}`}>{g.fase === 'fix' ? 'fix' : 'float'}</span>
                  </td>
                  <td title={formatRupiah(g.bunga)}>{formatRingkas(g.bunga)}</td>
                  <td title={formatRupiah(g.pokok)}>{formatRingkas(g.pokok)}</td>
                  <td title={formatRupiah(g.saldo)}>{formatRingkas(g.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
