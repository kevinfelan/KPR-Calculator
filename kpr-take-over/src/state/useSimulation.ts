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

export function useSimulation() {
  const [kpr1, setKpr1] = useState<KprInput>(DEFAULT_KPR1);
  const [takeOver, setTakeOver] = useState<TakeOverInput>(DEFAULT_TAKEOVER);
  const [takeOverBulan, setTakeOverBulan] = useState<number>(DEFAULT_TAKEOVER_BULAN);

  const patchKpr1 = (patch: Partial<KprInput>) => setKpr1((s) => ({ ...s, ...patch }));
  const patchTakeOver = (patch: Partial<TakeOverInput>) => setTakeOver((s) => ({ ...s, ...patch }));

  const valid =
    kpr1.pokok > 0 &&
    kpr1.tenorBulan > 0 &&
    kpr1.masaFixBulan >= 0 &&
    kpr1.masaFixBulan <= kpr1.tenorBulan &&
    takeOverBulan >= 1 &&
    takeOverBulan <= kpr1.tenorBulan &&
    takeOver.tenorBulan > 0 &&
    takeOver.masaFixBulan >= 0 &&
    takeOver.masaFixBulan <= takeOver.tenorBulan;

  const result = useMemo(
    () => (valid ? buildComparison(kpr1, takeOver, takeOverBulan) : null),
    [kpr1, takeOver, takeOverBulan, valid],
  );

  return {
    kpr1,
    takeOver,
    takeOverBulan,
    setKpr1,
    setTakeOver,
    setTakeOverBulan,
    patchKpr1,
    patchTakeOver,
    valid,
    result,
  };
}
