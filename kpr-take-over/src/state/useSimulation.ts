import { useMemo, useState } from 'react';
import { buildComparison } from '../lib/finance';
import type { TakeOverTahapInput } from '../lib/finance';
import type { KprInput, TakeOverInput } from '../lib/types';

export const DEFAULT_KPR1: KprInput = {
  pokok: 2_000_000_000,
  tenorBulan: 240,
  masaFixBulan: 60,
  bungaFix: 0.035,
  bungaFloating: 0.12,
};

export const DEFAULT_TAKEOVER: TakeOverInput = {
  pokok: 0,
  tenorBulan: 180,
  masaFixBulan: 60,
  bungaFix: 0.0475,
  bungaFloating: 0.12,
  provisi: 0.01,
  asuransi: 0.01,
  penalti: 0.03,
};

export const DEFAULT_TAKEOVER_BULAN = 60;

/** Tenor baru bawaan = sisa tenor KPR sebelumnya setelah take over. */
export function sisaTenorSetelahTakeOver(tenorSebelum: number, takeOverBulan: number): number {
  return Math.max(tenorSebelum - takeOverBulan, 0);
}

export function useSimulation() {
  const [kpr1, setKpr1] = useState<KprInput>(DEFAULT_KPR1);
  const [takeOver, setTakeOverState] = useState<TakeOverInput>(DEFAULT_TAKEOVER);
  const [takeOverBulan, setTakeOverBulan] = useState<number>(DEFAULT_TAKEOVER_BULAN);
  // Selama false, tenor Bank 2 mengikuti sisa tenor KPR 1 secara otomatis.
  const [tenorBaruManual, setTenorBaruManual] = useState(false);

  // --- Take over ke-2 (opsional) ---
  const [takeOver2Aktif, setTakeOver2Aktif] = useState(false);
  const [takeOver2, setTakeOver2State] = useState<TakeOverInput>(DEFAULT_TAKEOVER);
  const [takeOverBulan2, setTakeOverBulan2State] = useState<number>(DEFAULT_TAKEOVER_BULAN);
  const [bulan2Manual, setBulan2Manual] = useState(false);
  const [tenorBaru2Manual, setTenorBaru2Manual] = useState(false);

  const tenorBaruDefault = sisaTenorSetelahTakeOver(kpr1.tenorBulan, takeOverBulan);

  const takeOverEfektif = useMemo<TakeOverInput>(
    () => ({ ...takeOver, tenorBulan: tenorBaruManual ? takeOver.tenorBulan : tenorBaruDefault }),
    [takeOver, tenorBaruManual, tenorBaruDefault],
  );

  // Bawaan take over ke-2: di akhir masa fix Bank 2, sepanjang masih dalam tenornya.
  const bulan2Default = Math.max(1, Math.min(takeOverEfektif.masaFixBulan, takeOverEfektif.tenorBulan));
  const bulan2Efektif = bulan2Manual ? takeOverBulan2 : bulan2Default;
  const tenorBaru2Default = sisaTenorSetelahTakeOver(takeOverEfektif.tenorBulan, bulan2Efektif);

  const takeOver2Efektif = useMemo<TakeOverInput>(
    () => ({ ...takeOver2, tenorBulan: tenorBaru2Manual ? takeOver2.tenorBulan : tenorBaru2Default }),
    [takeOver2, tenorBaru2Manual, tenorBaru2Default],
  );

  const patchKpr1 = (patch: Partial<KprInput>) => setKpr1((s) => ({ ...s, ...patch }));

  const patchTakeOver = (patch: Partial<TakeOverInput>) => {
    if ('tenorBulan' in patch) setTenorBaruManual(true);
    setTakeOverState((s) => ({ ...s, ...patch }));
  };

  const patchTakeOver2 = (patch: Partial<TakeOverInput>) => {
    if ('tenorBulan' in patch) setTenorBaru2Manual(true);
    setTakeOver2State((s) => ({ ...s, ...patch }));
  };

  const setTakeOverBulan2 = (v: number) => {
    setBulan2Manual(true);
    setTakeOverBulan2State(v);
  };

  /** Ganti seluruh input Bank 2 (mis. saat membuka simulasi tersimpan) — tenornya dianggap manual. */
  const setTakeOver = (v: TakeOverInput) => {
    setTenorBaruManual(true);
    setTakeOverState(v);
  };

  /** Pulihkan take over ke-2 dari simulasi tersimpan; null = simulasi tanpa take over ke-2. */
  const setTakeOver2 = (v: TakeOverInput | null | undefined, bulan?: number) => {
    if (!v) {
      setTakeOver2Aktif(false);
      setBulan2Manual(false);
      setTenorBaru2Manual(false);
      setTakeOver2State(DEFAULT_TAKEOVER);
      return;
    }
    setTakeOver2Aktif(true);
    setTenorBaru2Manual(true);
    setTakeOver2State(v);
    if (bulan !== undefined) {
      setBulan2Manual(true);
      setTakeOverBulan2State(bulan);
    }
  };

  const aktifkanTakeOver2 = () => setTakeOver2Aktif(true);

  const hapusTakeOver2 = () => {
    setTakeOver2Aktif(false);
    setBulan2Manual(false);
    setTenorBaru2Manual(false);
    setTakeOver2State(DEFAULT_TAKEOVER);
  };

  /** Kembalikan tenor baru ke sisa tenor KPR sebelumnya. */
  const resetTenorBaru = () => setTenorBaruManual(false);
  const resetTenorBaru2 = () => setTenorBaru2Manual(false);
  const resetBulan2 = () => setBulan2Manual(false);

  const validTahap1 =
    kpr1.pokok > 0 &&
    kpr1.tenorBulan > 0 &&
    kpr1.masaFixBulan >= 0 &&
    kpr1.masaFixBulan <= kpr1.tenorBulan &&
    takeOverBulan >= 1 &&
    takeOverBulan <= kpr1.tenorBulan &&
    takeOverEfektif.tenorBulan > 0 &&
    takeOverEfektif.masaFixBulan >= 0 &&
    takeOverEfektif.masaFixBulan <= takeOverEfektif.tenorBulan;

  const validTahap2 =
    !takeOver2Aktif ||
    (bulan2Efektif >= 1 &&
      bulan2Efektif <= takeOverEfektif.tenorBulan &&
      takeOver2Efektif.tenorBulan > 0 &&
      takeOver2Efektif.masaFixBulan >= 0 &&
      takeOver2Efektif.masaFixBulan <= takeOver2Efektif.tenorBulan);

  const valid = validTahap1 && validTahap2;

  const tahapLanjutan = useMemo<TakeOverTahapInput[]>(
    () => (takeOver2Aktif ? [{ bulan: bulan2Efektif, input: takeOver2Efektif }] : []),
    [takeOver2Aktif, bulan2Efektif, takeOver2Efektif],
  );

  const result = useMemo(
    () => (valid ? buildComparison(kpr1, takeOverEfektif, takeOverBulan, tahapLanjutan) : null),
    [kpr1, takeOverEfektif, takeOverBulan, tahapLanjutan, valid],
  );

  return {
    kpr1,
    takeOver: takeOverEfektif,
    takeOverBulan,
    tenorBaruManual,
    tenorBaruDefault,
    takeOver2: takeOver2Efektif,
    takeOver2Aktif,
    takeOverBulan2: bulan2Efektif,
    bulan2Manual,
    bulan2Default,
    tenorBaru2Manual,
    tenorBaru2Default,
    setKpr1,
    setTakeOver,
    setTakeOverBulan,
    setTakeOver2,
    setTakeOverBulan2,
    patchKpr1,
    patchTakeOver,
    patchTakeOver2,
    aktifkanTakeOver2,
    hapusTakeOver2,
    resetTenorBaru,
    resetTenorBaru2,
    resetBulan2,
    valid,
    result,
  };
}
