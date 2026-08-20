import { forwardRef } from 'react';
import type { ComparisonResult, KprInput, TakeOverInput } from '../lib/types';
import { bangunCicilanTahunan } from '../lib/finance';
import { formatRingkas, formatPersen, formatPersenLabel } from '../lib/format';
import { Logo } from './Logo';

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
  goldSoft: '#f6efdd',
  goldLight: '#eecf7c',
  line: '#e6e1d3',
  surface2: '#f6f3ec',
};

/** Kartu ringkasan untuk di-screenshot & dibagikan. Warna dikunci ke tema terang. */
export const ShareCard = forwardRef<HTMLDivElement, Props>(
  ({ result, kpr1, takeOver, takeOverBulan, takeOver2, takeOverBulan2 }, ref) => {
    const hemat = result.hemat;
    const jumlahTahap = result.tahap.length;

    const bank = [
      { nama: 'Bank 1 (lama)', bungaFix: kpr1.bungaFix, bungaFloating: kpr1.bungaFloating },
      { nama: 'Bank 2 (take over)', bungaFix: takeOver.bungaFix, bungaFloating: takeOver.bungaFloating },
      ...(takeOver2 && jumlahTahap > 1
        ? [{ nama: 'Bank 3 (take over 2)', bungaFix: takeOver2.bungaFix, bungaFloating: takeOver2.bungaFloating }]
        : []),
    ];
    const kolom = `1.5fr ${bank.map(() => '1fr').join(' ')}`;

    // Sorotan utama: cicilan per tahun, dipecah dua kolom agar kartunya tidak memanjang.
    const tahunan = bangunCicilanTahunan(result);
    const separuh = Math.ceil(tahunan.length / 2);
    const kolomTahun = tahunan.length > 12 ? [tahunan.slice(0, separuh), tahunan.slice(separuh)] : [tahunan];

    const nilaiTahun = (v: number[]) => (v.length === 0 ? 'lunas' : v.map(formatRingkas).join(' → '));

    const tabelTahun = (baris: typeof tahunan, i: number) => (
      <div key={i} style={{ flex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '46px 1fr 1fr',
            fontSize: 10.5,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.6)',
            padding: '0 8px 4px',
          }}
        >
          <div>Tahun</div>
          <div style={{ textAlign: 'right' }}>Tanpa TO</div>
          <div style={{ textAlign: 'right' }}>Dengan TO</div>
        </div>
        {baris.map((b) => {
          const turun =
            b.tanpa.length === 1 && b.dengan.length === 1 && b.dengan[0] < b.tanpa[0];
          return (
            <div
              key={b.tahun}
              style={{
                display: 'grid',
                gridTemplateColumns: '46px 1fr 1fr',
                fontSize: 12,
                padding: '4px 8px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.72)' }}>{b.tahun}</div>
              <div style={{ textAlign: 'right', color: '#fff' }}>{nilaiTahun(b.tanpa)}</div>
              <div style={{ textAlign: 'right', color: turun ? C.goldLight : '#fff', fontWeight: 700 }}>
                {nilaiTahun(b.dengan)}
              </div>
            </div>
          );
        })}
      </div>
    );

    const kotakAngka = (judul: string, nilai: string, gelap = false) => (
      <div
        style={{
          flex: 1,
          background: gelap ? C.goldSoft : C.surface2,
          borderRadius: 12,
          padding: '10px 14px',
        }}
      >
        <div style={{ fontSize: 11.5, color: gelap ? C.goldInk : C.muted }}>{judul}</div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: gelap ? C.goldInk : C.ink,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {nilai}
        </div>
      </div>
    );

    const cmpRow = (label: string, nilai: string[], sorot = false) => (
      <div key={label} style={{ display: 'grid', gridTemplateColumns: kolom, borderTop: `1px solid ${C.line}`, fontSize: 13.5 }}>
        <div style={{ padding: '8px 14px', color: C.muted }}>{label}</div>
        {nilai.map((v, i) => (
          <div
            key={i}
            style={{
              padding: '8px 14px',
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

    return (
      <div ref={ref} style={{ width: 720, background: '#ffffff', color: C.text, fontFamily: "'Segoe UI', system-ui, Arial, sans-serif", padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Logo size={40} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: C.ink, letterSpacing: '-0.01em' }}>Pindah KPR Calculator</div>
            <div style={{ fontSize: 13, color: C.muted }}>Simulasi KPR Take Over{jumlahTahap > 1 ? ' (2x)' : ''}</div>
          </div>
        </div>

        {/* Sorotan utama: perbandingan cicilan */}
        <div style={{ background: C.frame, borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ textAlign: 'center', fontSize: 13, color: C.goldLight }}>Cicilan per bulan</div>
          <div style={{ textAlign: 'center', fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
            Sebelum → sesudah take over
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>{kolomTahun.map(tabelTahun)}</div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Perbandingan bunga &amp; cicilan setelah take over</div>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: kolom, background: C.surface2, fontSize: 12, fontWeight: 700, color: C.muted }}>
              <div style={{ padding: '9px 14px' }} />
              {bank.map((b, i) => (
                <div key={b.nama} style={{ padding: '9px 14px', textAlign: 'right', color: i === bank.length - 1 && i > 0 ? C.gold : C.muted }}>
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
            {cmpRow('Bunga dibayar', result.bungaPerKpr.map((b) => formatRingkas(b)))}
          </div>
        </div>

        {/* Ringkasan biaya — pendukung, ditaruh di bawah karena sorotannya tabel cicilan */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Total yang dibayar sampai lunas</div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1, marginBottom: 8 }}>
            Tiap kotak = pokok + seluruh bunga{jumlahTahap > 0 ? ' + biaya take over' : ''}, beserta selisih penghematannya.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {kotakAngka('Tanpa take over', formatRingkas(kpr1.pokok + result.totalTanpaTakeOver))}
            {kotakAngka('Dengan take over', formatRingkas(kpr1.pokok + result.totalDenganTakeOver))}
            {kotakAngka(
              hemat ? 'Hemat' : 'Lebih mahal',
              `${formatRingkas(Math.abs(result.selisih))} · ${formatPersenLabel(Math.abs(result.selisihPersen))}`,
              true,
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 14px', marginTop: 12, fontSize: 11.5, color: C.muted, background: C.surface2, borderRadius: 12, padding: '10px 14px', whiteSpace: 'nowrap' }}>
          <span>Plafon <b style={{ color: C.ink }}>{formatRingkas(kpr1.pokok)}</b></span>
          <span>Tenor <b style={{ color: C.ink }}>{kpr1.tenorBulan} bln</b></span>
          <span>Fix <b style={{ color: C.ink }}>{kpr1.masaFixBulan} → {takeOver.masaFixBulan}{takeOver2 && jumlahTahap > 1 ? ` → ${takeOver2.masaFixBulan}` : ''} bln</b></span>
          <span>
            TO bulan{' '}
            <b style={{ color: C.ink }}>
              {takeOverBulan}
              {jumlahTahap > 1 && takeOverBulan2 !== undefined ? ` & ${takeOverBulan2}` : ''}
            </b>
          </span>
          <span>Biaya <b style={{ color: C.ink }}>{formatRingkas(result.biayaTotal)}</b></span>
        </div>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: C.faint }}>
          Dihitung dengan Pindah KPR Calculator · skema anuitas fix-lalu-floating
        </div>
      </div>
    );
  },
);

ShareCard.displayName = 'ShareCard';
