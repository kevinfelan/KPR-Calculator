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
  /** Hanya ada bila simulasi memakai take over ke-2. */
  takeOver2?: TakeOverInput;
  takeOverBulan2?: number;
}

const C = {
  ink: '#191510',
  text: '#2c2720',
  muted: '#6e6656',
  faint: '#9b9382',
  gold: '#8a6a12',
  frame: '#16120b',
  goldInk: '#6b5008',
  goldSoft: '#f6ebd2',
  goldLight: '#ebcb79',
  line: '#e9e2d2',
  surface2: '#f7f3e9',
};

/** Kartu ringkasan untuk di-screenshot & dibagikan. Warna dikunci ke tema terang. */
export const ShareCard = forwardRef<HTMLDivElement, Props>(
  ({ result, kpr1, takeOver, takeOverBulan, takeOver2, takeOverBulan2 }, ref) => {
    const hemat = result.hemat;
    const jumlahTahap = result.tahap.length;

    // Kolom perbandingan: Bank 1, Bank 2, dan Bank 3 bila take over dua kali.
    const bank = [
      { nama: 'Bank 1 (lama)', bungaFix: kpr1.bungaFix, bungaFloating: kpr1.bungaFloating },
      { nama: 'Bank 2 (take over)', bungaFix: takeOver.bungaFix, bungaFloating: takeOver.bungaFloating },
      ...(takeOver2 && jumlahTahap > 1
        ? [{ nama: 'Bank 3 (take over 2)', bungaFix: takeOver2.bungaFix, bungaFloating: takeOver2.bungaFloating }]
        : []),
    ];
    const kolom = `1.5fr ${bank.map(() => '1fr').join(' ')}`;

    const row = (label: string, val: string, strong = false) => (
      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.line}`, fontSize: 15 }}>
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color: strong ? C.gold : C.ink, fontWeight: strong ? 700 : 600 }}>{val}</span>
      </div>
    );

    const cmpRow = (label: string, nilai: string[], sorot = false) => (
      <div key={label} style={{ display: 'grid', gridTemplateColumns: kolom, borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
        <div style={{ padding: '9px 14px', color: C.muted }}>{label}</div>
        {nilai.map((v, i) => (
          <div
            key={i}
            style={{
              padding: '9px 14px',
              textAlign: 'right',
              fontWeight: i === 0 ? 600 : 700,
              color: sorot && i === nilai.length - 1 ? C.gold : C.ink,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {v}
          </div>
        ))}
      </div>
    );

    const labelBunga = (i: number) => {
      if (i === result.bungaPerKpr.length - 1) return `Bunga KPR ${i + 1}`;
      return `Bunga KPR ${i + 1} (sblm take over${jumlahTahap > 1 ? ` ke-${i + 1}` : ''})`;
    };

    return (
      <div ref={ref} style={{ width: 720, background: '#ffffff', color: C.text, fontFamily: "'Segoe UI', system-ui, Arial, sans-serif", padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <Logo size={40} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: C.ink, letterSpacing: '-0.01em' }}>Weltown KPR Calculator</div>
            <div style={{ fontSize: 13, color: C.muted }}>Simulasi KPR Take Over{jumlahTahap > 1 ? ' (2x)' : ''}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18 }}>
          <div style={{ flex: 1.1, background: C.frame, borderRadius: 16, padding: '22px 20px', color: '#fff' }}>
            <div style={{ fontSize: 14, color: C.goldLight }}>{hemat ? 'Kamu hemat' : 'Take over lebih mahal'}</div>
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
            <div style={{ background: C.goldSoft, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: C.goldInk }}>Dengan take over</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.goldInk, fontVariantNumeric: 'tabular-nums' }}>{formatRingkas(result.totalDenganTakeOver)}</div>
            </div>
            <div>
              {result.bungaPerKpr.map((b, i) => row(labelBunga(i), formatRupiah(b)))}
              {row(`Biaya take over${jumlahTahap > 1 ? ` (${jumlahTahap}x)` : ''}`, formatRupiah(result.biayaTotal))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Perbandingan bunga &amp; cicilan setelah take over</div>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: kolom, background: C.surface2, fontSize: 12, fontWeight: 700, color: C.muted }}>
              <div style={{ padding: '10px 14px' }} />
              {bank.map((b, i) => (
                <div key={b.nama} style={{ padding: '10px 14px', textAlign: 'right', color: i === bank.length - 1 && i > 0 ? C.gold : C.muted }}>
                  {b.nama}
                </div>
              ))}
            </div>
            {cmpRow('Bunga fix', bank.map((b) => `${formatPersen(b.bungaFix)}%`))}
            {cmpRow(
              'Bunga floating',
              bank.map((b) => `${formatPersen(b.bungaFloating)}%`),
              bank[bank.length - 1].bungaFloating < kpr1.bungaFloating,
            )}
            {cmpRow('Cicilan fix / bln', result.kprList.map((k) => formatRingkas(k.cicilanFix)))}
            {cmpRow(
              'Cicilan floating / bln',
              result.kprList.map((k) => formatRingkas(k.cicilanFloating)),
              result.kprAkhir.cicilanFloating < result.kpr1.cicilanFloating,
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 14, fontSize: 13, color: C.muted, background: C.surface2, borderRadius: 12, padding: '12px 16px' }}>
          <span>Plafon <b style={{ color: C.ink }}>{formatRingkas(kpr1.pokok)}</b></span>
          <span>Tenor <b style={{ color: C.ink }}>{kpr1.tenorBulan} bln ({tahunDariBulan(kpr1.tenorBulan)} th)</b></span>
          <span>Masa fix <b style={{ color: C.ink }}>{kpr1.masaFixBulan} → {takeOver.masaFixBulan}{takeOver2 && jumlahTahap > 1 ? ` → ${takeOver2.masaFixBulan}` : ''} bln</b></span>
          <span>
            Take over bln ke{' '}
            <b style={{ color: C.ink }}>
              {takeOverBulan}
              {jumlahTahap > 1 && takeOverBulan2 !== undefined ? ` lalu ${takeOverBulan2}` : ''}
            </b>
          </span>
        </div>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: C.faint }}>
          Dihitung dengan Weltown KPR Calculator · skema anuitas fix-lalu-floating
        </div>
      </div>
    );
  },
);

ShareCard.displayName = 'ShareCard';
