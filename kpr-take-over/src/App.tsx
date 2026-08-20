import { useEffect, useMemo, useRef, useState } from 'react';
import { useSimulation } from './state/useSimulation';
import { useBerjenjang } from './state/useBerjenjang';
import { Logo } from './components/Logo';
import { InputScreen } from './components/InputScreen';
import { ResultScreen } from './components/ResultScreen';
import { TabelCicilan } from './components/TabelCicilan';
import { Kolaps } from './components/Kolaps';
import { Switch } from './components/Switch';
import { InputBerjenjang } from './components/InputBerjenjang';
import { HasilBerjenjangPanel } from './components/HasilBerjenjang';
import { ResultDetails } from './components/ResultDetails';
import { HistoryTable } from './components/HistoryTable';
import { SaveDialog } from './components/SaveDialog';
import { ShareCard } from './components/ShareCard';
import { ShareCardBerjenjang } from './components/ShareCardBerjenjang';
import { ShareModal } from './components/ShareModal';
import { loadSims, saveSim, deleteSim, genId, simBerjenjang } from './storage/db';
import { formatRingkas, formatPersenLabel } from './lib/format';
import type { SavedSim } from './lib/types';
import { TAMPILKAN_JADWAL_ANGSURAN } from './tampilan';

export default function App() {
  const sim = useSimulation();
  const bj = useBerjenjang();
  const [mode, setMode] = useState<'takeover' | 'berjenjang'>('takeover');
  const adaHasil = mode === 'takeover' ? !!sim.result : !!bj.hasil;
  const [sims, setSims] = useState<SavedSim[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [share, setShare] = useState<{ open: boolean; loading: boolean; url: string | null; blob: Blob | null; error: boolean }>({
    open: false,
    loading: false,
    url: null,
    blob: null,
    error: false,
  });
  const shareRef = useRef<HTMLDivElement>(null);

  const canShareFiles = useMemo(() => {
    try {
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      const f = new File([new Blob([''], { type: 'image/png' })], 'a.png', { type: 'image/png' });
      return !!(nav.canShare && nav.canShare({ files: [f] }));
    } catch {
      return false;
    }
  }, []);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'),
  );
  const resultRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('kpr.theme', next);
    } catch {
      /* abaikan */
    }
  };

  useEffect(() => {
    setSims(loadSims());
  }, []);

  const scrollToResult = () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const shareTeks = () => {
    if (mode === 'berjenjang') {
      const h = bj.hasil;
      if (!h) return '';
      return (
        `Simulasi KPR Berjenjang — cicilan ${formatRingkas(h.cicilanAwal)} di jenjang awal lalu ` +
        `${formatRingkas(h.cicilanAkhir)} di akhir. Total bunga ${formatRingkas(h.totalBunga)}. ` +
        `Dihitung dengan Pindah KPR Calculator.`
      );
    }
    const r = sim.result;
    if (!r) return '';
    return (
      `Simulasi KPR Take Over — cicilan masa floating ${formatRingkas(r.kpr1.cicilanFloating)} jadi ` +
      `${formatRingkas(r.kprAkhir.cicilanFloating)} per bulan. ${r.hemat ? 'Hemat' : 'Selisih'} bunga ` +
      `${formatRingkas(Math.abs(r.selisih))} (${formatPersenLabel(Math.abs(r.selisihPersen))}). ` +
      `Dihitung dengan Pindah KPR Calculator.`
    );
  };

  // Buat gambar dulu lalu tampilkan di modal — share dilakukan dari tap berikutnya
  // (menghindari html2canvas gagal & user-activation kedaluwarsa di HP).
  const buatGambar = async () => {
    if (!shareRef.current) return;
    setShare({ open: true, loading: true, url: null, blob: null, error: false });
    try {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* abaikan */
        }
      }
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(shareRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) throw new Error('no blob');
      const url = URL.createObjectURL(blob);
      setShare({ open: true, loading: false, url, blob, error: false });
    } catch {
      setShare({ open: true, loading: false, url: null, blob: null, error: true });
    }
  };

  const openShare = () => {
    if (adaHasil) buatGambar();
  };

  const closeShare = () =>
    setShare((s) => {
      if (s.url) URL.revokeObjectURL(s.url);
      return { open: false, loading: false, url: null, blob: null, error: false };
    });

  const shareToWhatsApp = async () => {
    if (!share.blob) return;
    const file = new File([share.blob], 'simulasi-kpr.png', { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'Simulasi KPR Take Over', text: shareTeks() });
      } catch {
        /* dibatalkan pengguna */
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareTeks())}`, '_blank');
    }
  };

  const downloadShare = () => {
    if (!share.url) return;
    const a = document.createElement('a');
    a.href = share.url;
    a.download = 'simulasi-kpr.png';
    a.click();
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const handleSave = (nama: string) => {
    let saved: SavedSim;
    if (mode === 'berjenjang') {
      if (!bj.hasil) return;
      saved = {
        id: genId(),
        nama,
        dibuat: Date.now(),
        jenis: 'berjenjang',
        berjenjang: bj.input,
        ringkas: {
          totalBunga: bj.hasil.totalBunga,
          totalBayar: bj.hasil.totalBayar,
          cicilanAwal: bj.hasil.cicilanAwal,
          cicilanAkhir: bj.hasil.cicilanAkhir,
        },
      };
    } else {
      if (!sim.result) return;
      saved = {
        id: genId(),
        nama,
        dibuat: Date.now(),
        jenis: 'takeover',
        kpr1: sim.kpr1,
        takeOver: sim.takeOver,
        takeOverBulan: sim.takeOverBulan,
        ...(sim.takeOver2Aktif ? { takeOver2: sim.takeOver2, takeOverBulan2: sim.takeOverBulan2 } : {}),
        ringkas: {
          totalTanpaTakeOver: sim.result.totalTanpaTakeOver,
          totalDenganTakeOver: sim.result.totalDenganTakeOver,
          selisih: sim.result.selisih,
          selisihPersen: sim.result.selisihPersen,
        },
      };
    }
    saveSim(saved);
    setSims(loadSims());
    setSaveOpen(false);
    showToast(`“${nama}” tersimpan di riwayat`);
  };

  const openSim = (s: SavedSim) => {
    if (simBerjenjang(s)) {
      bj.gantiInput(s.berjenjang);
      setMode('berjenjang');
    } else {
      sim.setKpr1(s.kpr1);
      sim.setTakeOver(s.takeOver);
      sim.setTakeOverBulan(s.takeOverBulan ?? s.kpr1.masaFixBulan);
      sim.setTakeOver2(s.takeOver2, s.takeOverBulan2);
      setMode('takeover');
    }
    setDrawer(false);
    scrollToResult();
  };

  const removeSim = (id: string) => {
    deleteSim(id);
    setSims(loadSims());
  };

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__bar">
          <div className="logo">
            <Logo size={32} />
            <span className="logo__name">Pindah KPR Calculator</span>
          </div>
          <div className="masthead__actions">
            <button
              className="iconround"
              onClick={openShare}
              disabled={!adaHasil}
              aria-label="Bagikan simulasi"
              title="Bagikan simulasi"
            >
              <span className="i-share" aria-hidden />
            </button>
            <button
              className="iconround"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
              title={theme === 'dark' ? 'Tema terang' : 'Tema gelap'}
            >
              <span className={theme === 'dark' ? 'i-sun' : 'i-moon'} aria-hidden />
            </button>
            <button className="ghostbtn" onClick={() => setDrawer(true)} aria-label="Riwayat simulasi">
              <span className="i-history" aria-hidden /> <span className="ghostbtn__label">Riwayat</span>
            </button>
          </div>
        </div>
        <h1 className="masthead__title">
          Hitung Simulasi Cicilan <span className="hl">Rumah</span> mu!
        </h1>
        <p className="masthead__sub">Kalkulator KPR gratis — bandingkan biaya, lihat hasilnya secara instan!</p>
      </header>

      <main className="wrap">
        <div className="maincard">
          <div className="maincard__head">
            <Switch
              label="Jenis kalkulator"
              nilai={mode}
              onChange={setMode}
              opsi={[
                { nilai: 'takeover', label: 'KPR Take Over', warna: '#2fa36b' },
                { nilai: 'berjenjang', label: 'KPR Berjenjang', warna: '#e0a92b' },
              ]}
            />
          </div>
          {mode === 'takeover' ? (
            <div className="maincard__body">
              <InputScreen
                kpr1={sim.kpr1}
                takeOver={sim.takeOver}
                takeOverBulan={sim.takeOverBulan}
                patchKpr1={sim.patchKpr1}
                patchTakeOver={sim.patchTakeOver}
                setTakeOverBulan={sim.setTakeOverBulan}
                tenorBaruManual={sim.tenorBaruManual}
                tenorBaruDefault={sim.tenorBaruDefault}
                resetTenorBaru={sim.resetTenorBaru}
                pokokPindah={sim.result?.pokokPindah}
                totalTanpaTakeOver={sim.result?.totalTanpaTakeOver}
                takeOver2={sim.takeOver2}
                takeOver2Aktif={sim.takeOver2Aktif}
                takeOverBulan2={sim.takeOverBulan2}
                bulan2Manual={sim.bulan2Manual}
                tenorBaru2Manual={sim.tenorBaru2Manual}
                tenorBaru2Default={sim.tenorBaru2Default}
                patchTakeOver2={sim.patchTakeOver2}
                setTakeOverBulan2={sim.setTakeOverBulan2}
                aktifkanTakeOver2={sim.aktifkanTakeOver2}
                hapusTakeOver2={sim.hapusTakeOver2}
                resetTenorBaru2={sim.resetTenorBaru2}
                resetBulan2={sim.resetBulan2}
                pokokPindah2={sim.result?.tahap[1]?.pokokPindah}
              />
              <div className="maincard__result" ref={resultRef}>
                {sim.result ? (
                  <>
                    <Kolaps
                      className="kotak-simulasi"
                      judul="Simulasi cicilan per tahun"
                      ringkas="sebelum vs sesudah take over"
                    >
                      <TabelCicilan result={sim.result} />
                    </Kolaps>
                    <ResultScreen result={sim.result} />
                  </>
                ) : (
                  <div className="panel-result panel-result--empty">
                    Lengkapi data yang valid untuk melihat hasil simulasi.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="maincard__body">
              <InputBerjenjang
                input={bj.input}
                mulaiTahun={bj.mulaiTahun}
                urutanNaik={bj.urutanNaik}
                adaSisaTenor={bj.adaSisaTenor}
                tenorTahun={bj.tenorTahun}
                patch={bj.patch}
                patchJenjang={bj.patchJenjang}
              />
              <div className="maincard__result">
                {bj.hasil ? (
                  <HasilBerjenjangPanel hasil={bj.hasil} />
                ) : (
                  <div className="panel-result panel-result--empty">
                    Lengkapi data yang valid untuk melihat hasil simulasi.
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="trust">
            <div className="trust__item"><span className="i-shield" aria-hidden />Tanpa daftar</div>
            <div className="trust__item"><span className="i-bolt" aria-hidden />Hasil instan</div>
            <div className="trust__item"><span className="i-lock" aria-hidden />Privat &amp; aman</div>
          </div>
        </div>

        <div className="cta-row">
          <button className="cta" onClick={() => setSaveOpen(true)} disabled={!adaHasil}>
            <span className="i-save" aria-hidden /> Simpan simulasi
          </button>
        </div>

        {TAMPILKAN_JADWAL_ANGSURAN && sim.result && <ResultDetails result={sim.result} />}

        <footer className="foot">Data tersimpan lokal di perangkat ini · dihitung sesuai skema anuitas fix-lalu-floating</footer>
      </main>

      <HistoryTable
        open={drawer}
        sims={sims}
        onClose={() => setDrawer(false)}
        onOpenSim={openSim}
        onDelete={removeSim}
      />

      <SaveDialog
        open={saveOpen}
        ringkasText={
          mode === 'berjenjang'
            ? bj.hasil
              ? `Cicilan ${formatRingkas(bj.hasil.cicilanAwal)} → ${formatRingkas(bj.hasil.cicilanAkhir)} · bunga ${formatRingkas(bj.hasil.totalBunga)}`
              : undefined
            : sim.result
              ? `Hemat ${formatRingkas(sim.result.selisih)} · ${formatPersenLabel(Math.abs(sim.result.selisihPersen))}`
              : undefined
        }
        onCancel={() => setSaveOpen(false)}
        onSave={handleSave}
      />

      {toast && (
        <div className="toast" role="status">
          <span className="i-check" aria-hidden /> {toast}
        </div>
      )}

      <ShareModal
        open={share.open}
        loading={share.loading}
        url={share.url}
        error={share.error}
        canShareFiles={canShareFiles}
        onShare={shareToWhatsApp}
        onDownload={downloadShare}
        onRetry={buatGambar}
        onClose={closeShare}
      />

      {/* Kartu sumber screenshot: off-screen tapi tetap opaque agar html2canvas bisa merender */}
      <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, width: 720, pointerEvents: 'none' }}>
        {mode === 'berjenjang' && bj.hasil && <ShareCardBerjenjang ref={shareRef} hasil={bj.hasil} input={bj.input} />}
        {mode === 'takeover' && sim.result && <ShareCard
            ref={shareRef}
            result={sim.result}
            kpr1={sim.kpr1}
            takeOver={sim.takeOver}
            takeOverBulan={sim.takeOverBulan}
            takeOver2={sim.takeOver2Aktif ? sim.takeOver2 : undefined}
            takeOverBulan2={sim.takeOver2Aktif ? sim.takeOverBulan2 : undefined}
          />}
      </div>
    </div>
  );
}
