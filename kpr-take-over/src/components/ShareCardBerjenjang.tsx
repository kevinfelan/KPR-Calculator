import { forwardRef } from 'react';
import type { HasilBerjenjang, KprBerjenjangInput } from '../lib/types';
import { formatPersen, formatRingkas, formatRupiah, tahunDariBulan } from '../lib/format';
import { Logo } from './Logo';

interface Props {
  hasil: HasilBerjenjang;
  input: KprBerjenjangInput;
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

const tahunDari = (bulan: number) => Math.ceil(bulan / 12);

/** Kartu share untuk kalkulator KPR berjenjang. Warna dikunci ke tema terang. */
export const ShareCardBerjenjang = forwardRef<HTMLDivElement, Props>(({ hasil, input }, ref) => {
  const jenjangDipakai = hasil.fase.filter((f) => f.urutan !== 0).length;
  // Kartu jenjang disusun rata: maksimal 5 per baris, dan bila perlu dua baris
  // isinya dibagi seimbang (7 jenjang jadi 4 + 3, bukan 5 + 2).
  const barisKartu = Math.ceil(hasil.fase.length / 5);
  const kolomKartu = Math.ceil(hasil.fase.length / barisKartu);
  const kotakAngka = (judul: string, nilai: string, sorot = false) => (
    <div style={{ flex: 1, background: sorot ? C.goldSoft : C.surface2, borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ fontSize: 11.5, color: sorot ? C.goldInk : C.muted }}>{judul}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: sorot ? C.goldInk : C.ink, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {nilai}
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{ width: 720, background: '#ffffff', color: C.text, fontFamily: "'Segoe UI', system-ui, Arial, sans-serif", padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Logo size={40} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, color: C.ink, letterSpacing: '-0.01em' }}>Pindah KPR Calculator</div>
          <div style={{ fontSize: 13, color: C.muted }}>Simulasi KPR Berjenjang</div>
        </div>
      </div>

      {/* Sorotan utama: cicilan tiap jenjang */}
      <div style={{ background: C.frame, borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: C.goldLight }}>Cicilan per bulan</div>
        <div style={{ textAlign: 'center', fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
          Berubah tiap jenjang bunga
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kolomKartu}, 1fr)`, gap: 10, marginTop: 14 }}>
          {hasil.fase.map((f) => (
            <div
              key={f.dariBulan}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 12,
                padding: '10px 10px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>
                {f.urutan === 0 ? 'Lanjutan' : `Jenjang ${f.urutan}`}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.62)' }}>
                Th {tahunDari(f.dariBulan)}–{tahunDari(f.sampaiBulan)} · {formatPersen(f.bunga)}%
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: C.goldLight, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                {formatRingkas(f.cicilan)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        {kotakAngka('Cicilan awal', formatRingkas(hasil.cicilanAwal))}
        {kotakAngka('Cicilan akhir', formatRingkas(hasil.cicilanAkhir))}
        {kotakAngka('Total bunga', formatRingkas(hasil.totalBunga), true)}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Rincian tiap jenjang</div>
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', background: C.surface2, fontSize: 12, fontWeight: 700, color: C.muted }}>
            <div style={{ padding: '9px 14px' }}>Jenjang</div>
            <div style={{ padding: '9px 14px', textAlign: 'right' }}>Periode</div>
            <div style={{ padding: '9px 14px', textAlign: 'right' }}>Bunga</div>
            <div style={{ padding: '9px 14px', textAlign: 'right' }}>Cicilan / bln</div>
          </div>
          {hasil.fase.map((f) => (
            <div key={f.dariBulan} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', borderTop: `1px solid ${C.line}`, fontSize: 13.5 }}>
              <div style={{ padding: '8px 14px', color: C.muted }}>
                {f.urutan === 0 ? 'Bunga lanjutan' : `Jenjang ${f.urutan}`}
              </div>
              <div style={{ padding: '8px 14px', textAlign: 'right', color: C.ink }}>
                Th {tahunDari(f.dariBulan)}–{tahunDari(f.sampaiBulan)}
              </div>
              <div style={{ padding: '8px 14px', textAlign: 'right', color: C.ink, fontWeight: 600 }}>{formatPersen(f.bunga)}%</div>
              <div style={{ padding: '8px 14px', textAlign: 'right', color: C.gold, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {formatRupiah(f.cicilan)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 14px', marginTop: 12, fontSize: 11.5, color: C.muted, background: C.surface2, borderRadius: 12, padding: '10px 14px', whiteSpace: 'nowrap' }}>
        <span>Plafon <b style={{ color: C.ink }}>{formatRingkas(input.pokok)}</b></span>
        <span>Tenor <b style={{ color: C.ink }}>{input.tenorBulan} bln ({tahunDariBulan(input.tenorBulan)} th)</b></span>
        <span>
          Jenjang{' '}
          <b style={{ color: C.ink }}>
            {jenjangDipakai}
            {jenjangDipakai < input.jenjang.length ? ` dari ${input.jenjang.length}` : ''}
          </b>
        </span>
        <span>Total dibayar <b style={{ color: C.ink }}>{formatRingkas(hasil.totalBayar)}</b></span>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: C.faint }}>
        Dihitung dengan Pindah KPR Calculator · anuitas dihitung ulang tiap jenjang
      </div>
    </div>
  );
});

ShareCardBerjenjang.displayName = 'ShareCardBerjenjang';
