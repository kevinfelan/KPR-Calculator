import { useMemo, useState } from 'react';
import { amortizeBerjenjang } from '../lib/finance';
import type { JenjangBunga, KprBerjenjangInput } from '../lib/types';

/** Batas jumlah jenjang bunga yang bisa dipakai. */
export const MAKS_JENJANG = 10;

export const DEFAULT_BERJENJANG: KprBerjenjangInput = {
  pokok: 2_000_000_000,
  tenorBulan: 240,
  jenjang: [
    { sampaiTahun: 3, bunga: 0.03 },
    { sampaiTahun: 6, bunga: 0.06 },
    { sampaiTahun: 9, bunga: 0.09 },
  ],
  bungaSetelah: 0.12,
};

export function useBerjenjang() {
  const [input, setInput] = useState<KprBerjenjangInput>(DEFAULT_BERJENJANG);

  const patch = (p: Partial<KprBerjenjangInput>) => setInput((s) => ({ ...s, ...p }));

  /** Ganti seluruh input, mis. saat membuka simulasi tersimpan. */
  const gantiInput = (v: KprBerjenjangInput) => setInput(v);

  const patchJenjang = (i: number, p: Partial<JenjangBunga>) =>
    setInput((s) => ({
      ...s,
      jenjang: s.jenjang.map((j, k) => (k === i ? { ...j, ...p } : j)),
    }));

  /** Tambah jenjang baru: 3 tahun setelah jenjang terakhir, bunga mengikutinya. */
  const tambahJenjang = () =>
    setInput((s) => {
      if (s.jenjang.length >= MAKS_JENJANG) return s;
      const terakhir = s.jenjang[s.jenjang.length - 1];
      return {
        ...s,
        jenjang: [
          ...s.jenjang,
          { sampaiTahun: (terakhir?.sampaiTahun ?? 0) + 3, bunga: terakhir?.bunga ?? 0.05 },
        ],
      };
    });

  /** Hapus satu jenjang; minimal satu jenjang harus tersisa. */
  const hapusJenjang = (i: number) =>
    setInput((s) => (s.jenjang.length <= 1 ? s : { ...s, jenjang: s.jenjang.filter((_, k) => k !== i) }));

  /** Tahun mulai tiap jenjang, menyambung dari jenjang sebelumnya. */
  const mulaiTahun = input.jenjang.map((_, i) => (i === 0 ? 1 : input.jenjang[i - 1].sampaiTahun + 1));

  const urutanNaik = input.jenjang.every((j, i) => (i === 0 ? j.sampaiTahun >= 1 : j.sampaiTahun > input.jenjang[i - 1].sampaiTahun));

  const tenorTahun = input.tenorBulan / 12;
  const jenjangTerakhir = input.jenjang[input.jenjang.length - 1]?.sampaiTahun ?? 0;
  /** Ada sisa tenor setelah jenjang terakhir yang memakai bunga lanjutan. */
  const adaSisaTenor = jenjangTerakhir < tenorTahun;

  const valid = input.pokok > 0 && input.tenorBulan > 0 && urutanNaik;

  const hasil = useMemo(() => (valid ? amortizeBerjenjang(input) : null), [input, valid]);

  return {
    input,
    patch,
    gantiInput,
    patchJenjang,
    tambahJenjang,
    hapusJenjang,
    bisaTambah: input.jenjang.length < MAKS_JENJANG,
    mulaiTahun,
    urutanNaik,
    adaSisaTenor,
    tenorTahun,
    valid,
    hasil,
  };
}
