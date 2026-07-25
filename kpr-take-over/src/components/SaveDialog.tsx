import { useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  ringkasText?: string;
  onCancel: () => void;
  onSave: (nama: string) => void;
}

export function SaveDialog({ open, ringkasText, onCancel, onSave }: Props) {
  const [nama, setNama] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNama('');
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(nama.trim() || 'Tanpa nama');
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Simpan simulasi">
      <div className="modal__scrim" onClick={onCancel} />
      <div className="modal__panel modal__panel--sm">
        <div className="modal__head">
          <div>
            <h2 className="modal__title">Simpan simulasi</h2>
            <p className="modal__sub">Beri nama properti agar mudah ditemukan di riwayat.</p>
          </div>
          <button className="iconbtn" aria-label="Tutup" onClick={onCancel}>✕</button>
        </div>

        <form className="savedlg" onSubmit={submit}>
          <label className="field">
            <span className="field__label">Nama properti</span>
            <span className="field__control">
              <input
                ref={inputRef}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="mis. Rumah Bintaro"
                maxLength={60}
              />
            </span>
          </label>

          {ringkasText && (
            <div className="savedlg__summary">
              <span className="i-bulb" aria-hidden />
              {ringkasText}
            </div>
          )}

          <div className="savedlg__actions">
            <button type="button" className="dlgbtn" onClick={onCancel}>Batal</button>
            <button type="submit" className="dlgbtn dlgbtn--primary">
              <span className="i-save" aria-hidden /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
