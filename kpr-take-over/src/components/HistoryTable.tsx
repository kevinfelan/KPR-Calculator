import type { SavedSim } from '../lib/types';
import { simBerjenjang } from '../storage/db';
import { formatRingkas, formatPersenLabel, formatPersen } from '../lib/format';

const fmtTanggal = (ts: number) =>
  new Date(ts).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface Props {
  open: boolean;
  sims: SavedSim[];
  onClose: () => void;
  onOpenSim: (s: SavedSim) => void;
  onDelete: (id: string) => void;
}

/** Ringkasan tiap simulasi, disamakan bentuknya supaya muat di satu tabel. */
function ringkasan(s: SavedSim) {
  if (simBerjenjang(s)) {
    const b = s.berjenjang;
    return {
      jenis: 'Berjenjang',
      pokok: b.pokok,
      bunga: [...b.jenjang.map((j) => `${formatPersen(j.bunga)}%`), `${formatPersen(b.bungaSetelah)}%`].join(' → '),
      totalLabel: 'Total bunga',
      total: s.ringkas.totalBunga,
      hasil: `${formatRingkas(s.ringkas.cicilanAwal)} → ${formatRingkas(s.ringkas.cicilanAkhir)}`,
      hasilLabel: 'Cicilan awal → akhir',
      baik: null as boolean | null,
    };
  }
  return {
    jenis: s.takeOver2 ? 'Take over 2x' : 'Take over',
    pokok: s.kpr1.pokok,
    bunga: `${formatPersen(s.takeOver.bungaFix)}% / ${formatPersen(s.takeOver.bungaFloating)}%`,
    totalLabel: 'Dengan take over',
    total: s.ringkas.totalDenganTakeOver,
    hasil: `${formatRingkas(Math.abs(s.ringkas.selisih))} · ${formatPersenLabel(Math.abs(s.ringkas.selisihPersen))}`,
    hasilLabel: s.ringkas.selisih >= 0 ? 'Hemat' : 'Lebih mahal',
    baik: s.ringkas.selisih >= 0,
  };
}

export function HistoryTable({ open, sims, onClose, onOpenSim, onDelete }: Props) {
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-label="Simulasi tersimpan" aria-modal="true">
      <div className="modal__scrim" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__head">
          <div>
            <h2 className="modal__title">Simulasi tersimpan</h2>
            <p className="modal__sub">{sims.length} simulasi tersimpan di perangkat ini</p>
          </div>
          <button className="iconbtn" aria-label="Tutup" onClick={onClose}>✕</button>
        </div>

        {sims.length === 0 ? (
          <p className="empty">Belum ada simulasi tersimpan. Hitung lalu tekan “Simpan simulasi”.</p>
        ) : (
          <div className="modal__scroll">
            {/* Tabel — layar lebar */}
            <div className="history-table">
              <table className="tbl tbl--history">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Sisa plafon</th>
                    <th>Bunga</th>
                    <th>Total bunga</th>
                    <th>Hasil</th>
                    <th aria-label="Aksi"></th>
                  </tr>
                </thead>
                <tbody>
                  {sims.map((s) => {
                    const r = ringkasan(s);
                    return (
                      <tr key={s.id}>
                        <td className="cell-name">{s.nama}</td>
                        <td className="cell-muted">{fmtTanggal(s.dibuat)}</td>
                        <td><span className="tag-jenis">{r.jenis}</span></td>
                        <td>{formatRingkas(r.pokok)}</td>
                        <td className="cell-muted">{r.bunga}</td>
                        <td>{formatRingkas(r.total)}</td>
                        <td className={r.baik === null ? undefined : r.baik ? 'good' : 'bad'}>{r.hasil}</td>
                        <td className="cell-actions">
                          <button className="minibtn" onClick={() => onOpenSim(s)}>Buka</button>
                          <button className="minibtn minibtn--danger" onClick={() => onDelete(s.id)} aria-label={`Hapus ${s.nama}`}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Kartu — layar mobile */}
            <div className="history-cards">
              {sims.map((s) => {
                const r = ringkasan(s);
                return (
                  <div className="simcard" key={s.id}>
                    <div className="simcard__top">
                      <span className="simcard__name">{s.nama}</span>
                      <span className="simcard__date">{fmtTanggal(s.dibuat)}</span>
                    </div>
                    <div className="simcard__grid">
                      <div><span>Jenis</span><strong>{r.jenis}</strong></div>
                      <div><span>Sisa plafon</span><strong>{formatRingkas(r.pokok)}</strong></div>
                      <div><span>Bunga</span><strong>{r.bunga}</strong></div>
                      <div><span>{r.totalLabel}</span><strong>{formatRingkas(r.total)}</strong></div>
                    </div>
                    <div className={`simcard__hemat ${r.baik === false ? 'simcard__hemat--bad' : ''}`}>
                      <span>{r.hasilLabel}</span>
                      <strong>{r.hasil}</strong>
                    </div>
                    <div className="simcard__actions">
                      <button className="minibtn" onClick={() => onOpenSim(s)}>Buka</button>
                      <button className="minibtn minibtn--danger" onClick={() => onDelete(s.id)} aria-label={`Hapus ${s.nama}`}>
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
