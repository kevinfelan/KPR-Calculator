import type { KprInput, TakeOverInput } from '../lib/types';
import { MoneyField, PercentField, MonthField } from './Fields';
import { formatRupiah } from '../lib/format';

interface Props {
  kpr1: KprInput;
  takeOver: TakeOverInput;
  takeOverBulan: number;
  patchKpr1: (p: Partial<KprInput>) => void;
  patchTakeOver: (p: Partial<TakeOverInput>) => void;
  setTakeOverBulan: (v: number) => void;
  pokokPindah?: number;
  totalTanpaTakeOver?: number;
}

const TENOR_PRESETS = [60, 120, 180, 240, 300, 360];
const FIX_PRESETS = [12, 24, 36, 48, 60, 84, 120];

export function InputScreen(props: Props) {
  const { kpr1, takeOver, takeOverBulan, patchKpr1, patchTakeOver, setTakeOverBulan, pokokPindah, totalTanpaTakeOver } = props;

  return (
    <div className="panel-input">
      <div className="section">
        <div className="section__head">
          <span className="section__title"><span className="i-home" aria-hidden />KPR saat ini · Bank 1</span>
        </div>

        <MoneyField
          label="Sisa plafon / pokok"
          info="Sisa pokok pinjaman KPR kamu saat ini di bank lama."
          value={kpr1.pokok}
          onChange={(v) => patchKpr1({ pokok: v })}
          sliderMin={100_000_000}
          sliderMax={5_000_000_000}
          sliderStep={10_000_000}
        />
        <div className="grid2">
          <MonthField label="Tenor" info="Sisa jangka waktu KPR (dalam bulan)." value={kpr1.tenorBulan} onChange={(v) => patchKpr1({ tenorBulan: v })} presets={TENOR_PRESETS} />
          <MonthField label="Masa fix" info="Lama bunga tetap sebelum floating (dalam bulan)." value={kpr1.masaFixBulan} onChange={(v) => patchKpr1({ masaFixBulan: v })} presets={FIX_PRESETS} />
        </div>
        <div className="grid2">
          <PercentField label="Bunga fix" value={kpr1.bungaFix} onChange={(v) => patchKpr1({ bungaFix: v })} />
          <PercentField label="Bunga floating" info="Perkiraan bunga setelah masa fix." value={kpr1.bungaFloating} onChange={(v) => patchKpr1({ bungaFloating: v })} />
        </div>
        {kpr1.masaFixBulan > kpr1.tenorBulan && <p className="warn">Masa fix tidak boleh melebihi tenor.</p>}

        {totalTanpaTakeOver ? (
          <div className="pokok-pindah pokok-pindah--baseline">
            <span>Total bunga tanpa take over</span>
            <strong>{formatRupiah(totalTanpaTakeOver)}</strong>
            <em>bunga yang dibayar bila tetap di Bank 1 sampai lunas</em>
          </div>
        ) : null}

        <MonthField
          label="Take over di bulan ke"
          info="Bulan saat pindah ke Bank 2. Menentukan sisa pokok yang dipindah & bunga KPR 1 yang sudah dibayar. Umumnya di akhir masa fix."
          value={takeOverBulan}
          onChange={setTakeOverBulan}
          presets={FIX_PRESETS}
        />
        {takeOverBulan > kpr1.tenorBulan && <p className="warn">Bulan take over tidak boleh melebihi tenor KPR 1.</p>}
      </div>

      <div className="section">
        <div className="section__head">
          <span className="section__title"><span className="i-swap" aria-hidden />Penawaran take over · Bank 2</span>
        </div>

        <div className="pokok-pindah">
          <span>Pokok yang dipindah</span>
          <strong>{pokokPindah ? formatRupiah(pokokPindah) : '—'}</strong>
          <em>otomatis dari sisa pokok KPR 1 di bulan ke-{takeOverBulan}</em>
        </div>

        <div className="grid2">
          <MonthField label="Tenor baru" info="Jangka waktu KPR baru (dalam bulan)." value={takeOver.tenorBulan} onChange={(v) => patchTakeOver({ tenorBulan: v })} presets={TENOR_PRESETS} />
          <MonthField label="Masa fix baru" info="Masa bunga fix KPR baru (dalam bulan)." value={takeOver.masaFixBulan} onChange={(v) => patchTakeOver({ masaFixBulan: v })} presets={FIX_PRESETS} />
        </div>
        <div className="grid2">
          <PercentField label="Bunga fix" value={takeOver.bungaFix} onChange={(v) => patchTakeOver({ bungaFix: v })} />
          <PercentField label="Bunga floating" value={takeOver.bungaFloating} onChange={(v) => patchTakeOver({ bungaFloating: v })} />
        </div>

        <div className="subhead">Biaya take over (% dari pokok dipindah)</div>
        <div className="grid3">
          <PercentField label="Provisi" value={takeOver.provisi} onChange={(v) => patchTakeOver({ provisi: v })} />
          <PercentField label="Asuransi" value={takeOver.asuransi} onChange={(v) => patchTakeOver({ asuransi: v })} />
          <PercentField label="Penalti" value={takeOver.penalti} onChange={(v) => patchTakeOver({ penalti: v })} />
        </div>
        {takeOver.masaFixBulan > takeOver.tenorBulan && <p className="warn">Masa fix tidak boleh melebihi tenor.</p>}
      </div>
    </div>
  );
}
