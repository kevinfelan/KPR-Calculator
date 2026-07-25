import { describe, it, expect } from 'vitest';
import { amortize, buildComparison } from './finance';
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
