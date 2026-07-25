import { forwardRef } from 'react';
import type { ComparisonResult, KprInput, TakeOverInput } from '../lib/types';
import { formatRingkas, formatRupiah, formatPersen, formatPersenLabel, tahunDariBulan } from '../lib/format';
import { Logo } from './Logo';
import { HouseArt } from './HouseArt';

interface Props {
  result: ComparisonResult;
  kpr1: KprInput;
  takeOver: TakeOverInput;
  takeOverBulan: number;
}

const C = {
  ink: '#15232e',
  text: '#24313b',
  muted: '#64707a',
  faint: '#97a1a9',
  green: '#1f7e67',
  greenDeep: '#14574a',
  greenInk: '#0e4a3e',
  greenSoft: '#e0f1eb',
  mint: '#a6e7d3',
  line: '#e4eae8',
  surface2: '#f2f6f5',
};

/** Kartu ringkasan untuk di-screenshot & dibagikan. Warna dikunci ke tema terang. */
export const ShareCard = forwardRef<HTMLDivElement, Props>(({ result, kpr1, takeOver, takeOverBulan }, ref) => {
  const hemat = result.hemat;

  const row = (label: string, val: string, strong = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.line}`, fontSize: 15 }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color: strong ? C.green : C.ink, fontWeight: strong ? 700 : 600 }}>{val}</span>
    </div>
  );

  const cmpRow = (label: string, b1: string, b2: string, highlight = false) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
      <div style={{ padding: '9px 14px', color: C.muted }}>{label}</div>
      <div style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{b1}</div>
      <div style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: highlight ? C.green : C.ink, fontVariantNumeric: 'tabular-nums' }}>{b2}</div>
    </div>
  );

  return (
    <div ref={ref} style={{ width: 720, background: '#ffffff', color: C.text, fontFamily: "'Segoe UI', system-ui, Arial, sans-serif", padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Logo size={40} color="#1f7e67" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, color: C.ink, letterSpacing: '-0.01em' }}>Kev's KPR Calculator</div>
          <div style={{ fontSize: 13, color: C.muted }}>Simulasi KPR Take Over</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: 1.1, background: C.greenDeep, borderRadius: 16, padding: '22px 20px', color: '#fff' }}>
          <div style={{ fontSize: 14, color: C.mint }}>{hemat ? 'Kamu hemat' : 'Take over lebih mahal'}</div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
            {formatRingkas(Math.abs(result.selisih))}
          </div>
          <div style={{ display: 'inline-block', marginTop: 8, fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.16)', borderRadius: 999, padding: '4px 14px' }}>
            {hemat ? '▼' : '▲'} {formatPersenLabel(Math.abs(result.selisihPersen))} {hemat ? 'lebih hemat' : 'lebih mahal'}
          </div>
          <HouseArt />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: C.surface2, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: C.muted }}>Tanpa take over</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{formatRingkas(result.totalTanpaTakeOver)}</div>
          </div>
          <div style={{ background: C.greenSoft, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: C.greenInk }}>Dengan take over</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.greenInk, fontVariantNumeric: 'tabular-nums' }}>{formatRingkas(result.totalDenganTakeOver)}</div>
          </div>
          <div>
            {row('Bunga KPR 1 (sblm take over)', formatRupiah(result.bungaKpr1))}
            {row('Bunga KPR 2', formatRupiah(result.bungaKpr2))}
            {row('Biaya take over', formatRupiah(result.biaya.total))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Perbandingan bunga &amp; cicilan setelah take over</div>
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', background: C.surface2, fontSize: 12, fontWeight: 700, color: C.muted }}>
            <div style={{ padding: '10px 14px' }} />
            <div style={{ padding: '10px 14px', textAlign: 'right' }}>Bank 1 (lama)</div>
            <div style={{ padding: '10px 14px', textAlign: 'right', color: C.green }}>Bank 2 (take over)</div>
          </div>
          {cmpRow('Bunga fix', `${formatPersen(kpr1.bungaFix)}%`, `${formatPersen(takeOver.bungaFix)}%`)}
          {cmpRow('Bunga floating', `${formatPersen(kpr1.bungaFloating)}%`, `${formatPersen(takeOver.bungaFloating)}%`, takeOver.bungaFloating < kpr1.bungaFloating)}
          {cmpRow('Cicilan fix / bln', formatRingkas(result.kpr1.cicilanFix), formatRingkas(result.kpr2.cicilanFix))}
          {cmpRow('Cicilan floating / bln', formatRingkas(result.kpr1.cicilanFloating), formatRingkas(result.kpr2.cicilanFloating), result.kpr2.cicilanFloating < result.kpr1.cicilanFloating)}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 14, fontSize: 13, color: C.muted, background: C.surface2, borderRadius: 12, padding: '12px 16px' }}>
        <span>Plafon <b style={{ color: C.ink }}>{formatRingkas(kpr1.pokok)}</b></span>
        <span>Tenor <b style={{ color: C.ink }}>{kpr1.tenorBulan} bln ({tahunDariBulan(kpr1.tenorBulan)} th)</b></span>
        <span>Masa fix <b style={{ color: C.ink }}>{kpr1.masaFixBulan} → {takeOver.masaFixBulan} bln</b></span>
        <span>Take over bln ke <b style={{ color: C.ink }}>{takeOverBulan}</b></span>
      </div>

      <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: C.faint }}>
        Dihitung dengan Kev's KPR Calculator · skema anuitas fix-lalu-floating
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
