import { describe, it, expect } from 'vitest';
import {
  amortize,
  bangunSegmenCicilan,
  buildComparison,
  seriCicilanDenganTakeOver,
  seriCicilanTanpaTakeOver,
} from './finance';
import type { KprInput, TakeOverInput } from './types';

// Skenario referensi persis dari file "Perhitungan KPR Take Over.xlsx".
const kpr1: KprInput = {
  pokok: 2_000_000_000,
  tenorBulan: 240,
  masaFixBulan: 60,
  bungaFix: 0.035,
  bungaFloating: 0.12,
};

const takeOver: TakeOverInput = {
  pokok: 0, // diisi otomatis dari sisa pokok KPR 1
  tenorBulan: 180,
  masaFixBulan: 60,
  bungaFix: 0.0475,
  bungaFloating: 0.12,
  provisi: 0.01,
  asuransi: 0.01,
  penalti: 0.03,
};

// Toleransi Rp 2: sheet KPR 2 Excel membulatkan pokok pindah ke bilangan bulat,
// menimbulkan selisih < Rp 1 pada bunga KPR 2 vs perhitungan presisi penuh.
const TOL = 2;

describe('amortize — KPR 1 (tanpa take over)', () => {
  const r = amortize(kpr1);

  it('cicilan fix cocok dengan Excel', () => {
    expect(r.cicilanFix).toBeCloseTo(11_599_194.36, 0);
  });
  it('cicilan floating cocok dengan Excel', () => {
    expect(r.cicilanFloating).toBeCloseTo(19_473_104.76, 0);
  });
  it('sisa pokok setelah masa fix cocok dengan Excel', () => {
    expect(Math.abs(r.sisaPokokSetelahFix - 1_622_531_491.38)).toBeLessThan(TOL);
  });
  it('total bunga fix cocok dengan Excel', () => {
    expect(Math.abs(r.totalBungaFix - 318_483_152.96)).toBeLessThan(TOL);
  });
  it('total bunga (tanpa take over) cocok dengan Excel', () => {
    expect(Math.abs(r.totalBunga - 2_201_110_517.82)).toBeLessThan(TOL);
  });
  it('jumlah baris jadwal = tenor bulan', () => {
    expect(r.rows).toHaveLength(240);
    expect(r.rows[239].saldo).toBeCloseTo(0, 4);
  });
});

describe('buildComparison — take over', () => {
  const c = buildComparison(kpr1, takeOver);

  it('pokok yang dipindah = sisa pokok KPR 1', () => {
    expect(Math.abs(c.pokokPindah - 1_622_531_491.38)).toBeLessThan(TOL);
  });
  it('bunga KPR 1 (sebelum take over)', () => {
    expect(Math.abs(c.bungaKpr1 - 318_483_152.96)).toBeLessThan(TOL);
  });
  it('bunga KPR 2 (fix & floating)', () => {
    expect(Math.abs(c.bungaKpr2 - 1_207_061_724.46)).toBeLessThan(TOL);
  });
  it('biaya take over total', () => {
    expect(Math.abs(c.biaya.total - 81_126_574.57)).toBeLessThan(TOL);
    expect(Math.abs(c.biaya.penalti - 48_675_944.74)).toBeLessThan(TOL);
  });
  it('total dengan take over', () => {
    expect(Math.abs(c.totalDenganTakeOver - 1_606_671_451.98)).toBeLessThan(TOL);
  });
  it('selisih (penghematan)', () => {
    expect(Math.abs(c.selisih - 594_439_065.84)).toBeLessThan(TOL);
  });
  it('selisih persen ≈ 27%', () => {
    expect(c.selisihPersen).toBeCloseTo(0.2700632526, 5);
  });
  it('cicilan Bank 2 fix & floating', () => {
    expect(c.kpr2.cicilanFix).toBeCloseTo(12_620_567.81, 0);
    expect(c.kpr2.cicilanFloating).toBeCloseTo(17_269_659.56, 0);
  });
});

describe('buildComparison — take over di bulan berbeda', () => {
  it('take over lebih awal (bulan 36) → sisa pokok lebih besar, bunga KPR 1 lebih kecil', () => {
    const c60 = buildComparison(kpr1, takeOver, 60);
    const c36 = buildComparison(kpr1, takeOver, 36);
    expect(c36.takeOverBulan).toBe(36);
    expect(c36.pokokPindah).toBeGreaterThan(c60.pokokPindah);
    expect(c36.bungaKpr1).toBeLessThan(c60.bungaKpr1);
    // saldo di bulan 36 = saldo baris ke-36 pada jadwal KPR 1
    expect(c36.pokokPindah).toBeCloseTo(c60.kpr1.rows[35].saldo, 2);
  });
});

describe('buildComparison — take over dua kali', () => {
  const satuTahap = buildComparison(kpr1, takeOver);

  // Take over ke-2 di bulan 24 KPR 2 dengan syarat identik & tanpa biaya:
  // anuitas ulang atas sisa pokok dengan bunga yang sama menghasilkan jadwal
  // yang sama, jadi totalnya harus tidak berubah.
  const netral = buildComparison(kpr1, takeOver, 60, [
    {
      bulan: 24,
      input: { ...takeOver, tenorBulan: 156, masaFixBulan: 36, provisi: 0, asuransi: 0, penalti: 0 },
    },
  ]);

  it('rantai netral tidak mengubah total', () => {
    expect(Math.abs(netral.totalDenganTakeOver - satuTahap.totalDenganTakeOver)).toBeLessThan(TOL);
  });

  it('menghasilkan 2 tahap & 3 KPR pada rantai', () => {
    expect(netral.tahap).toHaveLength(2);
    expect(netral.kprList).toHaveLength(3);
    expect(netral.bungaPerKpr).toHaveLength(3);
  });

  it('pokok pindah tahap 2 = sisa pokok KPR 2 di bulan take over ke-2', () => {
    expect(netral.tahap[1].pokokPindah).toBeCloseTo(satuTahap.kpr2.rows[23].saldo, 6);
  });

  it('bunga tahap 2 dihitung dari bunga KPR 2 sampai bulan take over', () => {
    const bunga24 = satuTahap.kpr2.rows.slice(0, 24).reduce((a, r) => a + r.bunga, 0);
    expect(netral.tahap[1].bungaSebelum).toBeCloseTo(bunga24, 6);
    expect(netral.bungaPerKpr[1]).toBeCloseTo(bunga24, 6);
  });

  it('bulan global tahap 2 dihitung dari awal KPR 1', () => {
    expect(netral.tahap[0].bulanGlobal).toBe(60);
    expect(netral.tahap[1].bulanGlobal).toBe(84);
  });

  it('biaya tahap 2 dihitung dari pokok yang dipindah di tahap itu', () => {
    const c = buildComparison(kpr1, takeOver, 60, [
      { bulan: 24, input: { ...takeOver, tenorBulan: 156, masaFixBulan: 36 } },
    ]);
    const p = c.tahap[1].pokokPindah;
    expect(c.tahap[1].biaya.provisi).toBeCloseTo(p * takeOver.provisi, 6);
    expect(c.tahap[1].biaya.penalti).toBeCloseTo(p * takeOver.penalti, 6);
    expect(c.biayaTotal).toBeCloseTo(c.tahap[0].biaya.total + c.tahap[1].biaya.total, 6);
  });

  it('bunga lebih murah di tahap 2 membuat total lebih hemat', () => {
    const lebihMurah = buildComparison(kpr1, takeOver, 60, [
      {
        bulan: 24,
        input: { ...takeOver, tenorBulan: 156, masaFixBulan: 36, bungaFix: 0.03, bungaFloating: 0.09, provisi: 0, asuransi: 0, penalti: 0 },
      },
    ]);
    expect(lebihMurah.totalDenganTakeOver).toBeLessThan(satuTahap.totalDenganTakeOver);
    expect(lebihMurah.selisih).toBeGreaterThan(satuTahap.selisih);
  });

  it('field lama tetap merujuk ke tahap pertama', () => {
    expect(netral.pokokPindah).toBeCloseTo(satuTahap.pokokPindah, 6);
    expect(netral.bungaKpr1).toBeCloseTo(satuTahap.bungaKpr1, 6);
    expect(netral.kpr2.cicilanFix).toBeCloseTo(satuTahap.kpr2.cicilanFix, 6);
  });
});

describe('segmen cicilan — simulasi selama tenor', () => {
  const c = buildComparison(kpr1, takeOver);
  const segmen = bangunSegmenCicilan(c);

  it('deret cicilan menutupi seluruh tenor', () => {
    expect(seriCicilanTanpaTakeOver(c)).toHaveLength(240);
    expect(seriCicilanDenganTakeOver(c)).toHaveLength(240);
  });

  it('sebelum take over kedua jalur masih sama', () => {
    expect(segmen[0]).toMatchObject({ dari: 1, sampai: 60 });
    expect(segmen[0].tanpa).toBe(segmen[0].dengan);
  });

  it('terpecah di titik take over & akhir masa fix Bank 2', () => {
    expect(segmen.map((s) => [s.dari, s.sampai])).toEqual([
      [1, 60],
      [61, 120],
      [121, 240],
    ]);
  });

  it('nilai tiap segmen cocok dengan cicilan fix/floating masing-masing KPR', () => {
    expect(segmen[1].tanpa).toBe(Math.round(c.kpr1.cicilanFloating));
    expect(segmen[1].dengan).toBe(Math.round(c.kpr2.cicilanFix));
    expect(segmen[2].tanpa).toBe(Math.round(c.kpr1.cicilanFloating));
    expect(segmen[2].dengan).toBe(Math.round(c.kpr2.cicilanFloating));
  });

  it('segmen bersambung tanpa bolong', () => {
    for (let i = 1; i < segmen.length; i++) {
      expect(segmen[i].dari).toBe(segmen[i - 1].sampai + 1);
    }
    expect(segmen[segmen.length - 1].sampai).toBe(240);
  });

  it('take over ke-2 dengan bunga berbeda menambah titik pecah', () => {
    const dua = buildComparison(kpr1, takeOver, 60, [
      {
        bulan: 60,
        input: { ...takeOver, tenorBulan: 120, masaFixBulan: 36, bungaFix: 0.03, bungaFloating: 0.09 },
      },
    ]);
    const s2 = bangunSegmenCicilan(dua);
    expect(s2.length).toBeGreaterThan(segmen.length);
    expect(s2[0]).toMatchObject({ dari: 1, sampai: 60 });
    expect(s2[s2.length - 1].sampai).toBe(240);
  });

  it('take over ke-2 dengan syarat identik tidak memecah segmen', () => {
    // Anuitas ulang atas sisa pokok dengan bunga yang sama menghasilkan cicilan
    // yang sama persis, jadi segmennya memang harus menyatu.
    const netral = buildComparison(kpr1, takeOver, 60, [
      { bulan: 60, input: { ...takeOver, tenorBulan: 120, masaFixBulan: 36 } },
    ]);
    const sn = bangunSegmenCicilan(netral);
    expect(sn[1].dengan).toBe(Math.round(c.kpr2.cicilanFix));
    expect(sn[1].sampai).toBe(156);
  });

  it('jalur yang lunas lebih dulu ditandai null', () => {
    // Tenor baru dipendekkan manual jadi 60 bulan: jalur take over lunas di
    // bulan ke-120, sementara tanpa take over masih jalan sampai 240.
    const pendek = buildComparison(kpr1, { ...takeOver, tenorBulan: 60, masaFixBulan: 60 }, 60);
    const sp = bangunSegmenCicilan(pendek);
    const akhir = sp[sp.length - 1];
    expect(akhir.dengan).toBeNull();
    expect(akhir.sampai).toBe(240);
    expect(akhir.tanpa).toBe(Math.round(pendek.kpr1.cicilanFloating));
  });
});
