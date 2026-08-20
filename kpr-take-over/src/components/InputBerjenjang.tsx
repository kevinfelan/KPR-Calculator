import type { JenjangBunga, KprBerjenjangInput } from '../lib/types';
import { MoneyField, MonthField, NumberField, PercentField } from './Fields';
import { tahunDariBulan } from '../lib/format';

interface Props {
  input: KprBerjenjangInput;
  mulaiTahun: number[];
  urutanNaik: boolean;
  adaSisaTenor: boolean;
  tenorTahun: number;
  patch: (p: Partial<KprBerjenjangInput>) => void;
  patchJenjang: (i: number, p: Partial<JenjangBunga>) => void;
}

const TENOR_PRESETS = [60, 120, 180, 240, 300, 360];

export function InputBerjenjang(props: Props) {
  const { input, mulaiTahun, urutanNaik, adaSisaTenor, tenorTahun, patch, patchJenjang } = props;
  const jenjangTerakhir = input.jenjang[input.jenjang.length - 1]?.sampaiTahun ?? 0;

  return (
    <div className="panel-input">
      <div className="section">
        <div className="section__head">
          <span className="section__title"><span className="i-home" aria-hidden />KPR berjenjang</span>
        </div>

        <MoneyField
          label="Sisa plafon / pokok"
          info="Sisa pokok pinjaman yang dihitung dengan skema bunga bertingkat."
          value={input.pokok}
          onChange={(v) => patch({ pokok: v })}
          sliderMin={100_000_000}
          sliderMax={5_000_000_000}
          sliderStep={10_000_000}
        />

        <MonthField
          label="Tenor"
          info="Jangka waktu KPR (dalam bulan)."
          value={input.tenorBulan}
          onChange={(v) => patch({ tenorBulan: v })}
          presets={TENOR_PRESETS}
        />
      </div>

      <div className="section">
        <div className="section__head">
          <span className="section__title"><span className="i-swap" aria-hidden />Jenjang bunga</span>
        </div>
        <p className="section__ket">
          Isi bunga tiap jenjang dan sampai tahun ke berapa berlakunya. Tahun mulainya menyambung
          otomatis dari jenjang sebelumnya.
        </p>

        {input.jenjang.map((j, i) => {
          const dari = mulaiTahun[i];
          const rentangValid = j.sampaiTahun >= dari;
          return (
            <div className="jenjang" key={i}>
              <div className="jenjang__head">
                <span className="jenjang__nama">Jenjang Bunga {i + 1}</span>
                <span className={`jenjang__rentang ${rentangValid ? '' : 'is-salah'}`}>
                  {rentangValid ? `Tahun ${dari} – ${j.sampaiTahun}` : 'rentang tidak valid'}
                </span>
              </div>
              <div className="grid2">
                <NumberField
                  label="Sampai tahun ke"
                  value={j.sampaiTahun}
                  onChange={(v) => patchJenjang(i, { sampaiTahun: v })}
                  suffix="th"
                  max={100}
                />
                <PercentField label="Bunga" value={j.bunga} onChange={(v) => patchJenjang(i, { bunga: v })} />
              </div>
            </div>
          );
        })}

        {!urutanNaik && <p className="warn">Tahun tiap jenjang harus lebih besar dari jenjang sebelumnya.</p>}

        <div className="subhead">Setelah jenjang terakhir</div>
        <PercentField
          label="Bunga lanjutan"
          info="Bunga untuk sisa tenor setelah jenjang terakhir habis — biasanya bunga floating."
          value={input.bungaSetelah}
          onChange={(v) => patch({ bungaSetelah: v })}
        />
        <p className="section__ket">
          {adaSisaTenor
            ? `Berlaku Tahun ${jenjangTerakhir + 1} – ${tahunDariBulan(input.tenorBulan)} (sisa tenor).`
            : `Tidak terpakai — jenjang sudah menutup seluruh tenor ${tahunDariBulan(input.tenorBulan)} tahun.`}
        </p>
        {tenorTahun > 0 && jenjangTerakhir > tenorTahun && (
          <p className="warn">Jenjang melewati tenor — kelebihannya tidak dihitung.</p>
        )}
      </div>
    </div>
  );
}
