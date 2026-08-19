import { useMemo, useState } from 'react';
import { buildComparison } from '../lib/finance';
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

/** Tenor baru bawaan = sisa tenor KPR 1 setelah take over. */
export function sisaTenorSetelahTakeOver(tenorKpr1: number, takeOverBulan: number): number {
  return Math.max(tenorKpr1 - takeOverBulan, 0);
}

export function useSimulation() {
  const [kpr1, setKpr1] = useState<KprInput>(DEFAULT_KPR1);
  const [takeOver, setTakeOverState] = useState<TakeOverInput>(DEFAULT_TAKEOVER);
  const [takeOverBulan, setTakeOverBulan] = useState<number>(DEFAULT_TAKEOVER_BULAN);
  // Selama false, tenor Bank 2 mengikuti sisa tenor KPR 1 secara otomatis.
  const [tenorBaruManual, setTenorBaruManual] = useState(false);

  const tenorBaruDefault = sisaTenorSetelahTakeOver(kpr1.tenorBulan, takeOverBulan);

  const takeOverEfektif = useMemo<TakeOverInput>(
    () => ({ ...takeOver, tenorBulan: tenorBaruManual ? takeOver.tenorBulan : tenorBaruDefault }),
    [takeOver, tenorBaruManual, tenorBaruDefault],
  );

  const patchKpr1 = (patch: Partial<KprInput>) => setKpr1((s) => ({ ...s, ...patch }));

  const patchTakeOver = (patch: Partial<TakeOverInput>) => {
    if ('tenorBulan' in patch) setTenorBaruManual(true);
    setTakeOverState((s) => ({ ...s, ...patch }));
  };

  /** Ganti seluruh input Bank 2 (mis. saat membuka simulasi tersimpan) — tenornya dianggap manual. */
  const setTakeOver = (v: TakeOverInput) => {
    setTenorBaruManual(true);
    setTakeOverState(v);
  };

  /** Kembalikan tenor baru ke sisa tenor KPR 1. */
  const resetTenorBaru = () => setTenorBaruManual(false);

  const valid =
    kpr1.pokok > 0 &&
    kpr1.tenorBulan > 0 &&
    kpr1.masaFixBulan >= 0 &&
    kpr1.masaFixBulan <= kpr1.tenorBulan &&
    takeOverBulan >= 1 &&
    takeOverBulan <= kpr1.tenorBulan &&
    takeOverEfektif.tenorBulan > 0 &&
    takeOverEfektif.masaFixBulan >= 0 &&
    takeOverEfektif.masaFixBulan <= takeOverEfektif.tenorBulan;

  const result = useMemo(
    () => (valid ? buildComparison(kpr1, takeOverEfektif, takeOverBulan) : null),
    [kpr1, takeOverEfektif, takeOverBulan, valid],
  );

  return {
    kpr1,
    takeOver: takeOverEfektif,
    takeOverBulan,
    tenorBaruManual,
    tenorBaruDefault,
    setKpr1,
    setTakeOver,
    setTakeOverBulan,
    patchKpr1,
    patchTakeOver,
    resetTenorBaru,
    valid,
    result,
  };
}
