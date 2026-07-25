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

export interface ComparisonResult {
  /** Amortisasi penuh KPR 1 (skenario tetap di bank lama) */
  kpr1: AmortResult;
  /** Amortisasi KPR 2 (pinjaman baru setelah take over) */
  kpr2: AmortResult;
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
  ringkas: {
    totalTanpaTakeOver: number;
    totalDenganTakeOver: number;
    selisih: number;
    selisihPersen: number;
  };
}
