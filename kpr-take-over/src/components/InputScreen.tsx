import type { KprInput, TakeOverInput } from '../lib/types';
import { MoneyField, PercentField, MonthField } from './Fields';
import { formatRupiah } from '../lib/format';
import { TAMPILKAN_POKOK_PINDAH, TAMPILKAN_TOTAL_BUNGA_TANPA_TAKE_OVER } from '../tampilan';

interface Props {
  kpr1: KprInput;
  takeOver: TakeOverInput;
  takeOverBulan: number;
  patchKpr1: (p: Partial<KprInput>) => void;
  patchTakeOver: (p: Partial<TakeOverInput>) => void;
  setTakeOverBulan: (v: number) => void;
  /** true bila tenor Bank 2 sudah diubah manual, jadi tidak lagi mengikuti sisa tenor KPR 1. */
  tenorBaruManual: boolean;
  /** Sisa tenor KPR 1 setelah take over — nilai bawaan untuk tenor Bank 2. */
  tenorBaruDefault: number;
  resetTenorBaru: () => void;
  pokokPindah?: number;
  totalTanpaTakeOver?: number;

  /* --- take over ke-2 --- */
  takeOver2: TakeOverInput;
  takeOver2Aktif: boolean;
  takeOverBulan2: number;
  bulan2Manual: boolean;
  tenorBaru2Manual: boolean;
  tenorBaru2Default: number;
  patchTakeOver2: (p: Partial<TakeOverInput>) => void;
  setTakeOverBulan2: (v: number) => void;
  aktifkanTakeOver2: () => void;
  hapusTakeOver2: () => void;
  resetTenorBaru2: () => void;
  resetBulan2: () => void;
  pokokPindah2?: number;
}

const TENOR_PRESETS = [60, 120, 180, 240, 300, 360];
const FIX_PRESETS = [12, 24, 36, 48, 60, 84, 120];

export function InputScreen(props: Props) {
  const {
    kpr1,
    takeOver,
    takeOverBulan,
    patchKpr1,
    patchTakeOver,
    setTakeOverBulan,
    tenorBaruManual,
    tenorBaruDefault,
    resetTenorBaru,
    pokokPindah,
    totalTanpaTakeOver,
    takeOver2,
    takeOver2Aktif,
    takeOverBulan2,
    bulan2Manual,
    tenorBaru2Manual,
    tenorBaru2Default,
    patchTakeOver2,
    setTakeOverBulan2,
    aktifkanTakeOver2,
    hapusTakeOver2,
    resetTenorBaru2,
    resetBulan2,
    pokokPindah2,
  } = props;

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

        {TAMPILKAN_TOTAL_BUNGA_TANPA_TAKE_OVER && totalTanpaTakeOver ? (
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

        {TAMPILKAN_POKOK_PINDAH && (
          <div className="pokok-pindah">
            <span>Pokok yang dipindah</span>
            <strong>{pokokPindah ? formatRupiah(pokokPindah) : '—'}</strong>
            <em>otomatis dari sisa pokok KPR 1 di bulan ke-{takeOverBulan}</em>
          </div>
        )}

        <div className="grid2">
          <MonthField
            label="Tenor baru"
            info="Bawaannya mengikuti sisa tenor KPR 1 setelah take over (tenor KPR 1 − bulan take over). Bisa diubah manual bila Bank 2 menawarkan tenor berbeda."
            value={takeOver.tenorBulan}
            onChange={(v) => patchTakeOver({ tenorBulan: v })}
            presets={TENOR_PRESETS}
            hintExtra={
              tenorBaruManual ? (
                <button type="button" className="hint-reset" onClick={resetTenorBaru}>
                  pakai sisa tenor ({tenorBaruDefault} bln)
                </button>
              ) : (
                <span className="hint-auto">otomatis · sisa tenor KPR 1</span>
              )
            }
          />
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

      {takeOver2Aktif ? (
        <div className="section section--to2">
          <div className="section__head">
            <span className="section__title"><span className="i-swap" aria-hidden />Take over ke-2 · Bank 3</span>
            <button type="button" className="linkbtn" onClick={hapusTakeOver2}>
              Hapus
            </button>
          </div>

          <MonthField
            label="Take over ke-2 di bulan ke"
            info="Dihitung dari awal KPR di Bank 2. Menentukan sisa pokok Bank 2 yang dipindah ke Bank 3 & bunga Bank 2 yang sudah dibayar."
            value={takeOverBulan2}
            onChange={setTakeOverBulan2}
            presets={FIX_PRESETS}
            hintExtra={
              bulan2Manual ? (
                <button type="button" className="hint-reset" onClick={resetBulan2}>
                  pakai akhir masa fix Bank 2
                </button>
              ) : (
                <span className="hint-auto">otomatis · akhir masa fix Bank 2</span>
              )
            }
          />
          {takeOverBulan2 > takeOver.tenorBulan && <p className="warn">Bulan take over ke-2 tidak boleh melebihi tenor Bank 2.</p>}

          {TAMPILKAN_POKOK_PINDAH && (
            <div className="pokok-pindah">
              <span>Pokok yang dipindah</span>
              <strong>{pokokPindah2 ? formatRupiah(pokokPindah2) : '—'}</strong>
              <em>otomatis dari sisa pokok Bank 2 di bulan ke-{takeOverBulan2}</em>
            </div>
          )}

          <div className="grid2">
            <MonthField
              label="Tenor baru"
              info="Bawaannya mengikuti sisa tenor Bank 2 setelah take over ke-2 (tenor Bank 2 − bulan take over ke-2). Bisa diubah manual."
              value={takeOver2.tenorBulan}
              onChange={(v) => patchTakeOver2({ tenorBulan: v })}
              presets={TENOR_PRESETS}
              hintExtra={
                tenorBaru2Manual ? (
                  <button type="button" className="hint-reset" onClick={resetTenorBaru2}>
                    pakai sisa tenor ({tenorBaru2Default} bln)
                  </button>
                ) : (
                  <span className="hint-auto">otomatis · sisa tenor Bank 2</span>
                )
              }
            />
            <MonthField label="Masa fix baru" info="Masa bunga fix di Bank 3 (dalam bulan)." value={takeOver2.masaFixBulan} onChange={(v) => patchTakeOver2({ masaFixBulan: v })} presets={FIX_PRESETS} />
          </div>
          <div className="grid2">
            <PercentField label="Bunga fix" value={takeOver2.bungaFix} onChange={(v) => patchTakeOver2({ bungaFix: v })} />
            <PercentField label="Bunga floating" value={takeOver2.bungaFloating} onChange={(v) => patchTakeOver2({ bungaFloating: v })} />
          </div>

          <div className="subhead">Biaya take over ke-2 (% dari pokok dipindah)</div>
          <div className="grid3">
            <PercentField label="Provisi" value={takeOver2.provisi} onChange={(v) => patchTakeOver2({ provisi: v })} />
            <PercentField label="Asuransi" value={takeOver2.asuransi} onChange={(v) => patchTakeOver2({ asuransi: v })} />
            <PercentField label="Penalti" value={takeOver2.penalti} onChange={(v) => patchTakeOver2({ penalti: v })} />
          </div>
          {takeOver2.masaFixBulan > takeOver2.tenorBulan && <p className="warn">Masa fix tidak boleh melebihi tenor.</p>}
        </div>
      ) : (
        <button type="button" className="addbtn" onClick={aktifkanTakeOver2}>
          <span className="addbtn__plus" aria-hidden>+</span>
          <span className="addbtn__text">
            Tambah take over ke-2
            <em>pindah lagi dari Bank 2 ke Bank 3 — dihitung dari sisa pokok &amp; sisa tenor Bank 2</em>
          </span>
        </button>
      )}
    </div>
  );
}
