interface Props {
  open: boolean;
  loading: boolean;
  url: string | null;
  error: boolean;
  canShareFiles: boolean;
  onShare: () => void;
  onDownload: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export function ShareModal({ open, loading, url, error, canShareFiles, onShare, onDownload, onRetry, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Bagikan simulasi">
      <div className="modal__scrim" onClick={onClose} />
      <div className="modal__panel modal__panel--sm">
        <div className="modal__head">
          <div>
            <h2 className="modal__title">Bagikan simulasi</h2>
            <p className="modal__sub">
              {canShareFiles ? 'Kirim gambar ringkasan ke WhatsApp atau app lain.' : 'Unduh gambarnya lalu lampirkan ke WhatsApp.'}
            </p>
          </div>
          <button className="iconbtn" aria-label="Tutup" onClick={onClose}>✕</button>
        </div>

        <div className="sharebody">
          {loading && <div className="share-loading"><span className="spinner" aria-hidden /> Menyiapkan gambar…</div>}
          {error && (
            <div className="share-error">
              Gagal membuat gambar.{' '}
              <button className="linkbtn" onClick={onRetry}>Coba lagi</button>
            </div>
          )}
          {url && <img className="share-preview" src={url} alt="Ringkasan simulasi KPR" />}
        </div>

        {url && (
          <div className="share-actions">
            <button className="dlgbtn dlgbtn--wa" onClick={onShare}>
              <span className="i-whatsapp" aria-hidden /> {canShareFiles ? 'Bagikan' : 'WhatsApp Web'}
            </button>
            <button className="dlgbtn" onClick={onDownload}>
              <span className="i-save" aria-hidden /> Unduh gambar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
