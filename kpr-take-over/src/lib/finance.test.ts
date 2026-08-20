import { describe, it, expect } from 'vitest';
import {
  amortize,
  amortizeBerjenjang,
  bangunTahunanBerjenjang,
  bangunCicilanTahunan,
  buildComparison,
  seriCicilanDenganTakeOver,
  seriCicilanTanpaTakeOver,
} from './finance';
import type { KprBerjenjangInput, KprInput, TakeOverInput } from './types';

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

describe('cicilan tahunan — simulasi selama tenor', () => {
  const c = buildComparison(kpr1, takeOver);
  const baris = bangunCicilanTahunan(c);

  it('satu baris per tahun, tahun 1 sampai 20', () => {
    expect(baris).toHaveLength(20);
    expect(baris[0].tahun).toBe(1);
    expect(baris[19].tahun).toBe(20);
  });

  it('deret cicilan menutupi seluruh tenor', () => {
    expect(seriCicilanTanpaTakeOver(c)).toHaveLength(240);
    expect(seriCicilanDenganTakeOver(c)).toHaveLength(240);
  });

  it('lima tahun pertama kedua jalur masih sama (masa fix Bank 1)', () => {
    for (let i = 0; i < 5; i++) {
      expect(baris[i].tanpa).toEqual([Math.round(c.kpr1.cicilanFix)]);
      expect(baris[i].dengan).toEqual([Math.round(c.kpr1.cicilanFix)]);
    }
  });

  it('setelah take over, jalur baru memakai cicilan Bank 2', () => {
    // tahun 6-10: Bank 1 sudah floating, Bank 2 masih fix
    expect(baris[5].tanpa).toEqual([Math.round(c.kpr1.cicilanFloating)]);
    expect(baris[5].dengan).toEqual([Math.round(c.kpr2.cicilanFix)]);
    // tahun 11 dan seterusnya: Bank 2 ikut floating
    expect(baris[10].dengan).toEqual([Math.round(c.kpr2.cicilanFloating)]);
  });

  it('tahun terjadinya take over ditandai', () => {
    expect(baris[4].takeOver).toEqual([1]); // take over bulan ke-60 = akhir tahun 5
    expect(baris[0].takeOver).toEqual([]);
  });

  it('cicilan yang berubah di tengah tahun tercatat dua nilai', () => {
    // masa fix 54 bulan: cicilan berubah di pertengahan tahun ke-5
    const tengah = buildComparison({ ...kpr1, masaFixBulan: 54 }, takeOver, 60);
    const b5 = bangunCicilanTahunan(tengah)[4];
    expect(b5.tanpa).toHaveLength(2);
    expect(b5.tanpa[0]).toBeLessThan(b5.tanpa[1]);
  });

  it('jalur yang lunas lebih dulu ditandai daftar kosong', () => {
    const pendek = buildComparison(kpr1, { ...takeOver, tenorBulan: 60, masaFixBulan: 60 }, 60);
    const bp = bangunCicilanTahunan(pendek);
    expect(bp).toHaveLength(20);
    expect(bp[19].dengan).toEqual([]);
    expect(bp[19].tanpa).toEqual([Math.round(pendek.kpr1.cicilanFloating)]);
  });

  it('take over ke-2 ditandai di tahunnya sendiri', () => {
    const dua = buildComparison(kpr1, takeOver, 60, [
      {
        bulan: 60,
        input: { ...takeOver, tenorBulan: 120, masaFixBulan: 36, bungaFix: 0.03, bungaFloating: 0.09 },
      },
    ]);
    const bd = bangunCicilanTahunan(dua);
    expect(bd[4].takeOver).toEqual([1]); // bulan global 60 -> tahun 5
    expect(bd[9].takeOver).toEqual([2]); // bulan global 120 -> tahun 10
  });
});

describe('amortizeBerjenjang — KPR bunga bertingkat', () => {
  const berjenjang: KprBerjenjangInput = {
    pokok: 2_000_000_000,
    tenorBulan: 240,
    jenjang: [
      { sampaiTahun: 3, bunga: 0.03 },
      { sampaiTahun: 6, bunga: 0.06 },
      { sampaiTahun: 9, bunga: 0.09 },
    ],
    bungaSetelah: 0.12,
  };
  const r = amortizeBerjenjang(berjenjang);

  it('fase menyambung tanpa bolong dan berhenti di akhir tenor', () => {
    expect(r.fase.map((f) => [f.dariBulan, f.sampaiBulan])).toEqual([
      [1, 36],
      [37, 72],
      [73, 108],
      [109, 240],
    ]);
    expect(r.rows).toHaveLength(240);
  });

  it('sisa tenor setelah jenjang terakhir memakai bunga lanjutan', () => {
    const akhir = r.fase[r.fase.length - 1];
    expect(akhir.urutan).toBe(0);
    expect(akhir.bunga).toBe(0.12);
  });

  it('KPR lunas di akhir tenor', () => {
    expect(r.rows[239].saldo).toBeCloseTo(0, 4);
  });

  it('cicilan jenjang 1 = anuitas pokok penuh sepanjang tenor', () => {
    // 2 M, 3% setahun, 240 bulan — dibandingkan dengan mesin anuitas yang sama
    const acuan = amortize({
      pokok: 2_000_000_000,
      tenorBulan: 240,
      masaFixBulan: 240,
      bungaFix: 0.03,
      bungaFloating: 0.03,
    });
    expect(r.fase[0].cicilan).toBeCloseTo(acuan.cicilanFix, 6);
    expect(r.cicilanAwal).toBe(r.fase[0].cicilan);
  });

  it('cicilan naik tiap jenjang karena bunganya naik', () => {
    const cicilan = r.fase.map((f) => f.cicilan);
    for (let i = 1; i < cicilan.length; i++) {
      expect(cicilan[i]).toBeGreaterThan(cicilan[i - 1]);
    }
  });

  it('total bayar = pokok + total bunga', () => {
    expect(r.totalBayar).toBeCloseTo(berjenjang.pokok + r.totalBunga, 2);
    expect(r.totalBunga).toBeCloseTo(
      r.rows.reduce((a, b) => a + b.bunga, 0),
      2,
    );
  });

  it('bunga rata di semua jenjang setara KPR bunga tunggal', () => {
    // Semua jenjang 3% + lanjutan 3% harus sama persis dengan amortize biasa
    // yang masa fix-nya penuh 240 bulan pada 3%.
    const rata = amortizeBerjenjang({
      ...berjenjang,
      jenjang: [
        { sampaiTahun: 3, bunga: 0.03 },
        { sampaiTahun: 6, bunga: 0.03 },
        { sampaiTahun: 9, bunga: 0.03 },
      ],
      bungaSetelah: 0.03,
    });
    const tunggal = amortize({
      pokok: 2_000_000_000,
      tenorBulan: 240,
      masaFixBulan: 240,
      bungaFix: 0.03,
      bungaFloating: 0.03,
    });
    expect(rata.totalBunga).toBeCloseTo(tunggal.totalBunga, 2);
    expect(rata.cicilanAwal).toBeCloseTo(tunggal.cicilanFix, 2);
  });

  it('jenjang yang melewati tenor dipotong, sisanya diabaikan', () => {
    const pendek = amortizeBerjenjang({ ...berjenjang, tenorBulan: 48 });
    expect(pendek.fase.map((f) => [f.dariBulan, f.sampaiBulan])).toEqual([
      [1, 36],
      [37, 48],
    ]);
    expect(pendek.rows).toHaveLength(48);
    expect(pendek.rows[47].saldo).toBeCloseTo(0, 4);
  });

  it('jenjang terakhir tepat di akhir tenor tidak menambah fase lanjutan', () => {
    const pas = amortizeBerjenjang({
      ...berjenjang,
      tenorBulan: 108,
    });
    expect(pas.fase).toHaveLength(3);
    expect(pas.fase[2].sampaiBulan).toBe(108);
  });
});

describe('bangunTahunanBerjenjang — uraian per tahun', () => {
  const input: KprBerjenjangInput = {
    pokok: 2_000_000_000,
    tenorBulan: 240,
    jenjang: [
      { sampaiTahun: 3, bunga: 0.03 },
      { sampaiTahun: 6, bunga: 0.06 },
      { sampaiTahun: 9, bunga: 0.09 },
    ],
    bungaSetelah: 0.12,
  };
  const hasil = amortizeBerjenjang(input);
  const baris = bangunTahunanBerjenjang(hasil);

  it('satu baris per tahun, tahun 1 sampai 20', () => {
    expect(baris).toHaveLength(20);
    expect(baris[0].tahun).toBe(1);
    expect(baris[19].tahun).toBe(20);
  });

  it('bunga tiap tahun mengikuti jenjangnya', () => {
    expect(baris[0].bunga).toEqual([0.03]);
    expect(baris[2].bunga).toEqual([0.03]);
    expect(baris[3].bunga).toEqual([0.06]);
    expect(baris[6].bunga).toEqual([0.09]);
    expect(baris[9].bunga).toEqual([0.12]);
    expect(baris[19].bunga).toEqual([0.12]);
  });

  it('cicilan tetap selama satu jenjang dan berubah di jenjang berikutnya', () => {
    expect(baris[0].cicilan).toEqual([Math.round(hasil.fase[0].cicilan)]);
    expect(baris[1].cicilan).toEqual(baris[0].cicilan);
    expect(baris[3].cicilan).toEqual([Math.round(hasil.fase[1].cicilan)]);
    expect(baris[3].cicilan[0]).toBeGreaterThan(baris[2].cicilan[0]);
  });

  it('tahun awal tiap jenjang ditandai', () => {
    expect(baris[0].mulaiJenjang).toEqual([1]);
    expect(baris[3].mulaiJenjang).toEqual([2]);
    expect(baris[6].mulaiJenjang).toEqual([3]);
    expect(baris[9].mulaiJenjang).toEqual([0]); // fase lanjutan
    expect(baris[1].mulaiJenjang).toEqual([]);
  });

  it('tenor yang tidak genap setahun tetap masuk baris terakhir', () => {
    const ganjil = amortizeBerjenjang({ ...input, tenorBulan: 246 });
    const bg = bangunTahunanBerjenjang(ganjil);
    expect(bg).toHaveLength(21);
    expect(bg[20].cicilan).toHaveLength(1);
  });
});
