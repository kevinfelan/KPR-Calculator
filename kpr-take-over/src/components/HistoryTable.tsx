import type { SavedSim } from '../lib/types';
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
                    <th>Sisa plafon</th>
                    <th>Bunga fix / float</th>
                    <th>Tanpa TO</th>
                    <th>Dengan TO</th>
                    <th>Hemat</th>
                    <th aria-label="Aksi"></th>
                  </tr>
                </thead>
                <tbody>
                  {sims.map((s) => (
                    <tr key={s.id}>
                      <td className="cell-name">{s.nama}</td>
                      <td className="cell-muted">{fmtTanggal(s.dibuat)}</td>
                      <td>{formatRingkas(s.kpr1.pokok)}</td>
                      <td className="cell-muted">
                        {formatPersen(s.takeOver.bungaFix)}% / {formatPersen(s.takeOver.bungaFloating)}%
                      </td>
                      <td>{formatRingkas(s.ringkas.totalTanpaTakeOver)}</td>
                      <td>{formatRingkas(s.ringkas.totalDenganTakeOver)}</td>
                      <td className={s.ringkas.selisih >= 0 ? 'good' : 'bad'}>
                        {formatRingkas(s.ringkas.selisih)}
                        <span className="cell-pct">{formatPersenLabel(Math.abs(s.ringkas.selisihPersen))}</span>
                      </td>
                      <td className="cell-actions">
                        <button className="minibtn" onClick={() => onOpenSim(s)}>Buka</button>
                        <button className="minibtn minibtn--danger" onClick={() => onDelete(s.id)} aria-label={`Hapus ${s.nama}`}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kartu — layar mobile */}
            <div className="history-cards">
              {sims.map((s) => (
                <div className="simcard" key={s.id}>
                  <div className="simcard__top">
                    <span className="simcard__name">{s.nama}</span>
                    <span className="simcard__date">{fmtTanggal(s.dibuat)}</span>
                  </div>
                  <div className="simcard__grid">
                    <div><span>Sisa plafon</span><strong>{formatRingkas(s.kpr1.pokok)}</strong></div>
                    <div><span>Bunga fix / float</span><strong>{formatPersen(s.takeOver.bungaFix)}% / {formatPersen(s.takeOver.bungaFloating)}%</strong></div>
                    <div><span>Tanpa take over</span><strong>{formatRingkas(s.ringkas.totalTanpaTakeOver)}</strong></div>
                    <div><span>Dengan take over</span><strong>{formatRingkas(s.ringkas.totalDenganTakeOver)}</strong></div>
                  </div>
                  <div className={`simcard__hemat ${s.ringkas.selisih >= 0 ? '' : 'simcard__hemat--bad'}`}>
                    <span>{s.ringkas.selisih >= 0 ? 'Hemat' : 'Lebih mahal'}</span>
                    <strong>
                      {formatRingkas(Math.abs(s.ringkas.selisih))}
                      <em>{formatPersenLabel(Math.abs(s.ringkas.selisihPersen))}</em>
                    </strong>
                  </div>
                  <div className="simcard__actions">
                    <button className="minibtn" onClick={() => onOpenSim(s)}>Buka</button>
                    <button className="minibtn minibtn--danger" onClick={() => onDelete(s.id)} aria-label={`Hapus ${s.nama}`}>
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
