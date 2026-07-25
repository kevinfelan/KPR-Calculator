import type {
  AmortResult,
  AmortRow,
  ComparisonResult,
  KprInput,
  TakeOverInput,
} from './types';

/**
 * Anuitas: cicilan tetap untuk pinjaman `pokok`, bunga per bulan `m`, `n` bulan.
 * cicilan = pokok * m / (1 - (1 + m)^-n)
 */
function anuitas(pokok: number, m: number, n: number): number {
  if (n <= 0) return 0;
  if (m === 0) return pokok / n;
  return (pokok * m) / (1 - Math.pow(1 + m, -n));
}

/**
 * Amortisasi skema fix-lalu-floating, meniru sheet "KPR 1" / "KPR 2" pada Excel.
 *
 * Selama masa fix: cicilan = anuitas atas pokok penuh dengan bunga fix sepanjang
 * TENOR PENUH. Setelah masa fix: sisa pokok di-anuitas ulang dengan bunga floating
 * sepanjang sisa tenor. Bunga tiap bulan = saldo sebelumnya * rate/12.
 */
export function amortize(input: KprInput): AmortResult {
  const { pokok, tenorBulan, masaFixBulan, bungaFix, bungaFloating } = input;
  const n = Math.round(tenorBulan);
  const fBulan = Math.min(Math.round(masaFixBulan), n);
  const mf = bungaFix / 12;
  const ml = bungaFloating / 12;

  const cicilanFix = anuitas(pokok, mf, n);

  const rows: AmortRow[] = [];
  let saldo = pokok;
  let totalBungaFix = 0;

  for (let t = 1; t <= fBulan; t++) {
    const bunga = saldo * mf;
    const pokokBln = cicilanFix - bunga;
    saldo -= pokokBln;
    totalBungaFix += bunga;
    rows.push({ periode: t, cicilan: cicilanFix, bunga, pokok: pokokBln, saldo, fase: 'fix' });
  }

  const sisaPokokSetelahFix = saldo;
  const floatN = n - fBulan;
  const cicilanFloating = anuitas(sisaPokokSetelahFix, ml, floatN);

  let totalBungaFloating = 0;
  for (let t = fBulan + 1; t <= n; t++) {
    const bunga = saldo * ml;
    const pokokBln = cicilanFloating - bunga;
    saldo -= pokokBln;
    totalBungaFloating += bunga;
    rows.push({ periode: t, cicilan: cicilanFloating, bunga, pokok: pokokBln, saldo, fase: 'floating' });
  }

  return {
    cicilanFix,
    cicilanFloating,
    sisaPokokSetelahFix,
    totalBungaFix,
    totalBungaFloating,
    totalBunga: totalBungaFix + totalBungaFloating,
    rows,
  };
}

/**
 * Bangun perbandingan lengkap: KPR tanpa take over vs dengan take over.
 * `takeOverBulan` = bulan saat pindah bank (default: akhir masa fix KPR 1).
 * Meniru sheet "Simulasi Take Over" pada Excel.
 */
export function buildComparison(
  kpr1Input: KprInput,
  takeOver: TakeOverInput,
  takeOverBulan: number = kpr1Input.masaFixBulan,
): ComparisonResult {
  const kpr1 = amortize(kpr1Input);
  const n1 = kpr1.rows.length;

  // Batasi bulan take over ke rentang jadwal KPR 1.
  const toBulan = Math.min(Math.max(Math.round(takeOverBulan), 1), n1);

  // Sisa pokok & total bunga KPR 1 pada saat take over (bulan ke-toBulan).
  const pokokPindah = kpr1.rows[toBulan - 1].saldo;
  let bungaKpr1 = 0;
  for (let i = 0; i < toBulan; i++) bungaKpr1 += kpr1.rows[i].bunga;

  const kpr2 = amortize({
    pokok: pokokPindah,
    tenorBulan: takeOver.tenorBulan,
    masaFixBulan: takeOver.masaFixBulan,
    bungaFix: takeOver.bungaFix,
    bungaFloating: takeOver.bungaFloating,
  });

  const provisi = pokokPindah * takeOver.provisi;
  const asuransi = pokokPindah * takeOver.asuransi;
  const penalti = pokokPindah * takeOver.penalti;
  const biaya = { provisi, asuransi, penalti, total: provisi + asuransi + penalti };

  const bungaKpr2 = kpr2.totalBunga;

  const totalTanpaTakeOver = kpr1.totalBunga;
  const totalDenganTakeOver = bungaKpr1 + bungaKpr2 + biaya.total;
  const selisih = totalTanpaTakeOver - totalDenganTakeOver;
  const selisihPersen = totalTanpaTakeOver !== 0 ? selisih / totalTanpaTakeOver : 0;

  return {
    kpr1,
    kpr2,
    pokokPindah,
    takeOverBulan: toBulan,
    bungaKpr1,
    bungaKpr2,
    biaya,
    totalTanpaTakeOver,
    totalDenganTakeOver,
    selisih,
    selisihPersen,
    hemat: selisih > 0,
  };
}
