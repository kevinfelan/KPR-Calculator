export interface KprInput {
  /** Pokok / sisa plafon pinjaman (Rupiah) */
  pokok: number;
  /** Tenor total dalam bulan */
  tenorBulan: number;
  /** Masa bunga fix dalam bulan */
  masaFixBulan: number;
  /** Bunga fix per tahun, dalam fraksi (0.035 = 3,5%) */
  bungaFix: number;
  /** Bunga floating per tahun, dalam fraksi (0.12 = 12%) */
  bungaFloating: number;
}

export interface TakeOverInput extends KprInput {
  /** Biaya provisi sebagai fraksi dari pokok yang dipindah */
  provisi: number;
  /** Biaya asuransi sebagai fraksi dari pokok yang dipindah */
  asuransi: number;
  /** Biaya penalti/penalty pelunasan dipercepat sebagai fraksi dari pokok yang dipindah */
  penalti: number;
}

export interface AmortRow {
  periode: number;
  cicilan: number;
  bunga: number;
  pokok: number;
  saldo: number;
  fase: 'fix' | 'floating';
}

export interface AmortResult {
  cicilanFix: number;
  cicilanFloating: number;
  sisaPokokSetelahFix: number;
  totalBungaFix: number;
  totalBungaFloating: number;
  totalBunga: number;
  rows: AmortRow[];
}

export interface BiayaTakeOver {
  provisi: number;
  asuransi: number;
  penalti: number;
  total: number;
}

/** Satu tahap take over: pindah dari KPR yang sedang berjalan ke KPR baru. */
export interface TahapTakeOver {
  /** 1 = take over pertama, 2 = take over kedua, dst. */
  urutan: number;
  /** Bulan take over, dihitung dari awal KPR yang sedang berjalan. */
  bulan: number;
  /** Bulan take over dihitung dari awal KPR 1. */
  bulanGlobal: number;
  /** Sisa pokok KPR sebelumnya yang dipindah ke KPR baru. */
  pokokPindah: number;
  /** Bunga yang sudah dibayar di KPR sebelumnya sampai bulan take over ini. */
  bungaSebelum: number;
  biaya: BiayaTakeOver;
  /** Amortisasi KPR baru hasil take over ini. */
  kpr: AmortResult;
}

export interface ComparisonResult {
  /** Amortisasi penuh KPR 1 (skenario tetap di bank lama) */
  kpr1: AmortResult;
  /** Amortisasi KPR 2 (pinjaman baru setelah take over pertama) */
  kpr2: AmortResult;
  /** Semua tahap take over (1 tahap = take over sekali, 2 tahap = take over dua kali). */
  tahap: TahapTakeOver[];
  /** Seluruh KPR pada rantai: [KPR 1, KPR 2, (KPR 3)]. */
  kprList: AmortResult[];
  /** Bunga yang benar-benar dibayar di tiap KPR pada rantai (searah kprList). */
  bungaPerKpr: number[];
  /** KPR terakhir pada rantai — yang dijalankan sampai lunas. */
  kprAkhir: AmortResult;
  /** Total biaya seluruh tahap take over. */
  biayaTotal: number;
  pokokPindah: number;
  /** Bulan saat take over dilakukan */
  takeOverBulan: number;
  /** Total bunga KPR 1 yang dibayar sebelum take over (bulan 1..takeOverBulan) */
  bungaKpr1: number;
  bungaKpr2: number;
  biaya: BiayaTakeOver;
  totalTanpaTakeOver: number;
  totalDenganTakeOver: number;
  selisih: number;
  selisihPersen: number;
  hemat: boolean;
}

export interface BankPreset {
  id: string;
  namaBank: string;
  produk: string;
  bungaFix: number;
  masaFixTahun: number;
  bungaFloating: number;
  provisi: number;
  asuransi: number;
  penalti: number;
  bawaan?: boolean;
}

export interface SavedSim {
  id: string;
  nama: string;
  dibuat: number;
  kpr1: KprInput;
  takeOver: TakeOverInput;
  takeOverBulan: number;
  /** Take over kedua — hanya ada bila simulasi memakainya. */
  takeOver2?: TakeOverInput;
  takeOverBulan2?: number;
  ringkas: {
    totalTanpaTakeOver: number;
    totalDenganTakeOver: number;
    selisih: number;
    selisihPersen: number;
  };
}
