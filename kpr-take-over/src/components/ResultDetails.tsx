import type { ComparisonResult } from '../lib/types';
import { AmortSchedule } from './AmortSchedule';

export function ResultDetails({ result }: { result: ComparisonResult }) {
  return (
    <section className="card card--flush">
      <AmortSchedule title="Jadwal angsuran KPR 1 (tanpa take over)" data={result.kpr1} />
      <AmortSchedule title="Jadwal angsuran KPR 2 (setelah take over)" data={result.kpr2} />
    </section>
  );
}
