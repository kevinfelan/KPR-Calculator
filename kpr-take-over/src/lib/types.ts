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

interface SavedSimDasar {
  id: string;
  nama: string;
  dibuat: number;
}

export interface SavedSimTakeOver extends SavedSimDasar {
  /** Tidak diisi pada data lama — dianggap simulasi take over. */
  jenis?: 'takeover';
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

export interface SavedSimBerjenjang extends SavedSimDasar {
  jenis: 'berjenjang';
  berjenjang: KprBerjenjangInput;
  ringkas: {
    totalBunga: number;
    totalBayar: number;
    cicilanAwal: number;
    cicilanAkhir: number;
  };
}

export type SavedSim = SavedSimTakeOver | SavedSimBerjenjang;

/* ------------------------------ KPR berjenjang ---------------------------- */

/**
 * Satu jenjang bunga. Tahun mulainya tidak diinput — otomatis menyambung dari
 * jenjang sebelumnya, supaya rentangnya tidak mungkin bolong atau tumpang tindih.
 */
export interface JenjangBunga {
  /** Jenjang ini berlaku sampai akhir tahun ke-berapa. */
  sampaiTahun: number;
  /** Bunga per tahun dalam fraksi (0.03 = 3%). */
  bunga: number;
}

export interface KprBerjenjangInput {
  pokok: number;
  tenorBulan: number;
  jenjang: JenjangBunga[];
  /** Bunga untuk sisa tenor setelah jenjang terakhir habis. */
  bungaSetelah: number;
}

export interface FaseBertingkat {
  /** 1..n untuk jenjang yang diinput, 0 berarti sisa tenor setelah jenjang terakhir. */
  urutan: number;
  dariBulan: number;
  sampaiBulan: number;
  bunga: number;
  /** Cicilan per bulan selama fase ini. */
  cicilan: number;
  /** Bunga yang dibayar selama fase ini. */
  totalBunga: number;
}

export interface HasilBerjenjang {
  rows: AmortRow[];
  fase: FaseBertingkat[];
  totalBunga: number;
  /** Pokok + seluruh bunga. */
  totalBayar: number;
  cicilanAwal: number;
  cicilanAkhir: number;
}
