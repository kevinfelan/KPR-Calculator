interface Opsi<T extends string> {
  nilai: T;
  label: string;
  /** Warna titik penanda di kiri label. */
  warna: string;
}

interface Props<T extends string> {
  nilai: T;
  opsi: Opsi<T>[];
  onChange: (v: T) => void;
  label: string;
}

/** Sakelar dua posisi bergaya pil — dipakai untuk berpindah jenis kalkulator. */
export function Switch<T extends string>({ nilai, opsi, onChange, label }: Props<T>) {
  return (
    <div className="switch" role="tablist" aria-label={label}>
      {opsi.map((o) => {
        const aktif = o.nilai === nilai;
        return (
          <button
            key={o.nilai}
            type="button"
            role="tab"
            aria-selected={aktif}
            className={`switch__opsi ${aktif ? 'is-aktif' : ''}`}
            onClick={() => onChange(o.nilai)}
          >
            <span className="switch__dot" style={{ background: o.warna }} aria-hidden />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
