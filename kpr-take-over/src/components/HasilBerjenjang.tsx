import type { HasilBerjenjang } from '../lib/types';
import { bangunTahunanBerjenjang } from '../lib/finance';
import { formatPersen, formatRingkas, formatRupiah } from '../lib/format';
import { AnimatedNumber } from './AnimatedNumber';
import { Kolaps } from './Kolaps';

/** Tabel cicilan per tahun + ringkasan biaya KPR berjenjang. */
export function HasilBerjenjangPanel({ hasil }: { hasil: HasilBerjenjang }) {
  const baris = bangunTahunanBerjenjang(hasil);

  return (
    <>
      <Kolaps
        className="kotak-simulasi"
        judul="Simulasi cicilan per tahun"
        ringkas="cicilan berubah tiap jenjang"
      >
        <div className="tblwrap">
          <table className="tbl tbl--simulasi">
            <thead>
              <tr>
                <th>Tahun</th>
                <th>Bunga</th>
                <th>Cicilan / bln</th>
              </tr>
            </thead>
            <tbody>
              {baris.map((b) => (
                <tr key={b.tahun} className={b.mulaiJenjang.length ? 'is-pindah' : undefined}>
                  <td>
                    Tahun {b.tahun}
                    {b.mulaiJenjang.map((urutan) => (
                      <em key={urutan}>{urutan === 0 ? 'bunga lanjutan' : `jenjang ${urutan}`}</em>
                    ))}
                  </td>
                  <td>{b.bunga.map((x) => `${formatPersen(x)}%`).join(' → ')}</td>
                  <td>{b.cicilan.map(formatRingkas).join(' → ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kolaps>

      <Kolaps
        className="kolaps--hasil"
        judul="Total bunga"
        ringkas={<>{formatRingkas(hasil.totalBunga)}</>}
      >
        <div className="pr__rows">
          <div className="pr__row">
            <span>Cicilan awal (jenjang 1)</span>
            <span><AnimatedNumber value={hasil.cicilanAwal} format={formatRupiah} /></span>
          </div>
          <div className="pr__row">
            <span>Cicilan akhir</span>
            <span><AnimatedNumber value={hasil.cicilanAkhir} format={formatRupiah} /></span>
          </div>
          <div className="pr__row">
            <span>Total bunga</span>
            <span><AnimatedNumber value={hasil.totalBunga} format={formatRupiah} /></span>
          </div>
          <div className="pr__row pr__row--total">
            <span>Total dibayar (pokok + bunga)</span>
            <span><AnimatedNumber value={hasil.totalBayar} format={formatRupiah} /></span>
          </div>
        </div>
        <div className="pr__note">
          <span className="i-bulb" aria-hidden />
          <span>
            Tiap masuk jenjang baru, sisa pokok dihitung ulang sebagai anuitas dengan bunga jenjang
            itu sepanjang sisa tenor — jadi cicilannya berubah di awal tiap jenjang.
          </span>
        </div>
      </Kolaps>
    </>
  );
}
