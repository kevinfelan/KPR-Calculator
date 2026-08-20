import type {
  AmortResult,
  AmortRow,
  ComparisonResult,
  KprInput,
  TahapTakeOver,
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

/** Satu tahap take over yang diminta pengguna: bulan pindah + syarat KPR barunya. */
export interface TakeOverTahapInput {
  /** Bulan take over, dihitung dari awal KPR yang sedang berjalan. */
  bulan: number;
  input: TakeOverInput;
}

/**
 * Bangun perbandingan lengkap: KPR tanpa take over vs dengan take over.
 * `takeOverBulan` = bulan saat pindah bank (default: akhir masa fix KPR 1).
 * `tahapLanjutan` = take over berikutnya (mis. take over ke-2), dihitung dengan
 * rumus yang sama tapi berbasis sisa pokok & sisa tenor KPR sebelumnya.
 * Meniru sheet "Simulasi Take Over" pada Excel.
 */
export function buildComparison(
  kpr1Input: KprInput,
  takeOver: TakeOverInput,
  takeOverBulan: number = kpr1Input.masaFixBulan,
  tahapLanjutan: TakeOverTahapInput[] = [],
): ComparisonResult {
  const kpr1 = amortize(kpr1Input);

  const antrian: TakeOverTahapInput[] = [{ bulan: takeOverBulan, input: takeOver }, ...tahapLanjutan];

  const tahap: TahapTakeOver[] = [];
  const kprList: AmortResult[] = [kpr1];
  const bungaPerKpr: number[] = [];

  let berjalan = kpr1;
  let bulanGlobal = 0;
  let biayaTotal = 0;

  antrian.forEach((t, i) => {
    const n = berjalan.rows.length;
    // Batasi bulan take over ke rentang jadwal KPR yang sedang berjalan.
    const toBulan = Math.min(Math.max(Math.round(t.bulan), 1), n);

    const pokokPindah = berjalan.rows[toBulan - 1].saldo;
    let bungaSebelum = 0;
    for (let k = 0; k < toBulan; k++) bungaSebelum += berjalan.rows[k].bunga;

    const kprBaru = amortize({
      pokok: pokokPindah,
      tenorBulan: t.input.tenorBulan,
      masaFixBulan: t.input.masaFixBulan,
      bungaFix: t.input.bungaFix,
      bungaFloating: t.input.bungaFloating,
    });

    const provisi = pokokPindah * t.input.provisi;
    const asuransi = pokokPindah * t.input.asuransi;
    const penalti = pokokPindah * t.input.penalti;
    const biaya = { provisi, asuransi, penalti, total: provisi + asuransi + penalti };

    bulanGlobal += toBulan;
    biayaTotal += biaya.total;

    tahap.push({
      urutan: i + 1,
      bulan: toBulan,
      bulanGlobal,
      pokokPindah,
      bungaSebelum,
      biaya,
      kpr: kprBaru,
    });
    kprList.push(kprBaru);
    bungaPerKpr.push(bungaSebelum);

    berjalan = kprBaru;
  });

  // KPR terakhir dijalankan sampai lunas, jadi seluruh bunganya ikut dibayar.
  const kprAkhir = berjalan;
  bungaPerKpr.push(kprAkhir.totalBunga);

  const tahap1 = tahap[0];
  const totalTanpaTakeOver = kpr1.totalBunga;
  const totalDenganTakeOver = bungaPerKpr.reduce((a, b) => a + b, 0) + biayaTotal;
  const selisih = totalTanpaTakeOver - totalDenganTakeOver;
  const selisihPersen = totalTanpaTakeOver !== 0 ? selisih / totalTanpaTakeOver : 0;

  return {
    kpr1,
    kpr2: tahap1.kpr,
    tahap,
    kprList,
    bungaPerKpr,
    kprAkhir,
    pokokPindah: tahap1.pokokPindah,
    takeOverBulan: tahap1.bulan,
    bungaKpr1: tahap1.bungaSebelum,
    bungaKpr2: tahap1.kpr.totalBunga,
    biaya: tahap1.biaya,
    biayaTotal,
    totalTanpaTakeOver,
    totalDenganTakeOver,
    selisih,
    selisihPersen,
    hemat: selisih > 0,
  };
}

/** Satu potongan waktu dengan besaran cicilan yang tetap di kedua skenario. */
export interface SegmenCicilan {
  /** Bulan awal segmen, dihitung dari sekarang (1 = bulan depan). */
  dari: number;
  /** Bulan akhir segmen. */
  sampai: number;
  /** Cicilan per bulan bila tetap di Bank 1; null bila KPR sudah lunas. */
  tanpa: number | null;
  /** Cicilan per bulan bila take over; null bila KPR sudah lunas. */
  dengan: number | null;
}

/** Deret cicilan per bulan bila tetap di Bank 1 sampai lunas. */
export function seriCicilanTanpaTakeOver(hasil: ComparisonResult): number[] {
  return hasil.kpr1.rows.map((r) => r.cicilan);
}

/** Deret cicilan per bulan pada jalur take over, menyambung antar tahap. */
export function seriCicilanDenganTakeOver(hasil: ComparisonResult): number[] {
  const seri: number[] = [];
  let berjalan = hasil.kpr1;
  for (const tahap of hasil.tahap) {
    for (let i = 0; i < tahap.bulan; i++) seri.push(berjalan.rows[i].cicilan);
    berjalan = tahap.kpr;
  }
  for (const r of berjalan.rows) seri.push(r.cicilan);
  return seri;
}

/**
 * Ringkas kedua deret cicilan jadi segmen — bulan-bulan berurutan dengan
 * besaran cicilan yang sama digabung, supaya tabelnya cukup beberapa baris
 * alih-alih ratusan.
 */
export function bangunSegmenCicilan(hasil: ComparisonResult): SegmenCicilan[] {
  const tanpa = seriCicilanTanpaTakeOver(hasil);
  const dengan = seriCicilanDenganTakeOver(hasil);
  const n = Math.max(tanpa.length, dengan.length);

  const ambil = (seri: number[], i: number): number | null =>
    i < seri.length ? Math.round(seri[i]) : null;

  const segmen: SegmenCicilan[] = [];
  for (let i = 0; i < n; i++) {
    const a = ambil(tanpa, i);
    const b = ambil(dengan, i);
    const terakhir = segmen[segmen.length - 1];
    if (terakhir && terakhir.tanpa === a && terakhir.dengan === b) {
      terakhir.sampai = i + 1;
    } else {
      segmen.push({ dari: i + 1, sampai: i + 1, tanpa: a, dengan: b });
    }
  }
  return segmen;
}
