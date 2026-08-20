import type { HasilBerjenjang } from '../lib/types';
import { formatPersen, formatRingkas, formatRupiah } from '../lib/format';
import { AnimatedNumber } from './AnimatedNumber';
import { Kolaps } from './Kolaps';

function tahunDari(bulan: number): number {
  return Math.ceil(bulan / 12);
}

/** Tabel cicilan tiap jenjang + ringkasan biaya KPR berjenjang. */
export function HasilBerjenjangPanel({ hasil }: { hasil: HasilBerjenjang }) {
  return (
    <>
      <Kolaps
        className="kotak-simulasi"
        judul="Simulasi cicilan per jenjang"
        ringkas="cicilan berubah tiap jenjang"
      >
        <div className="tblwrap">
          <table className="tbl tbl--simulasi">
            <thead>
              <tr>
                <th>Jenjang</th>
                <th>Bunga</th>
                <th>Cicilan / bln</th>
              </tr>
            </thead>
            <tbody>
              {hasil.fase.map((f) => (
                <tr key={f.dariBulan}>
                  <td>
                    {f.urutan === 0 ? 'Lanjutan' : `Jenjang ${f.urutan}`}
                    <em>
                      Tahun {tahunDari(f.dariBulan)} – {tahunDari(f.sampaiBulan)}
                    </em>
                  </td>
                  <td>{formatPersen(f.bunga)}%</td>
                  <td>
                    {formatRingkas(f.cicilan)}
                    <em>bunga {formatRingkas(f.totalBunga)}</em>
                  </td>
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
