import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { formatAngka, parseAngka, formatPersen, parsePersen, tahunDariBulan } from '../lib/format';

function Info({ text }: { text?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  if (!text) return null;
  return (
    <span className={`info-wrap${open ? ' is-open' : ''}`} ref={ref}>
      <button
        type="button"
        className="info"
        aria-label={text}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        i
      </button>
      <span className="info-pop" role="tooltip">{text}</span>
    </span>
  );
}

interface MoneyProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  info?: string;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  subLabel?: string;
}

export function MoneyField({ label, value, onChange, info, sliderMin, sliderMax, sliderStep, subLabel }: MoneyProps) {
  const hasSlider = sliderMin !== undefined && sliderMax !== undefined;
  return (
    <div className="field">
      <span className="field__label">
        {label}
        <Info text={info} />
        {subLabel && <span className="field__sub">{subLabel}</span>}
      </span>
      <span className="field__control">
        <span className="field__prefix">Rp</span>
        <input
          inputMode="numeric"
          value={value === 0 ? '' : formatAngka(value)}
          onChange={(e) => onChange(parseAngka(e.target.value))}
          onFocus={(e) => e.target.select()}
        />
      </span>
      {hasSlider && (
        <input
          className="slider"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep ?? 1}
          value={Math.min(Math.max(value, sliderMin!), sliderMax!)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
    </div>
  );
}

interface MonthProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  info?: string;
  presets?: number[];
  /** Keterangan tambahan di bawah input, mis. penanda nilai otomatis. */
  hintExtra?: ReactNode;
}

/** Input jangka waktu dalam bulan: ketik manual + dropdown ringkas, dengan keterangan tahun. */
export function MonthField({ label, value, onChange, info, presets, hintExtra }: MonthProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="field monthfield" ref={ref}>
      <span className="field__label">
        {label}
        <Info text={info} />
      </span>
      <span className="field__control">
        <input
          inputMode="numeric"
          value={value === 0 ? '' : String(value)}
          onChange={(e) => {
            const d = e.target.value.replace(/[^\d]/g, '');
            onChange(d === '' ? 0 : parseInt(d, 10));
          }}
          onFocus={(e) => e.target.select()}
        />
        <span className="field__suffix">bln</span>
        {presets && presets.length > 0 && (
          <button
            type="button"
            className="monthfield__toggle"
            aria-label="Pilih preset jangka waktu"
            onClick={() => setOpen((o) => !o)}
          >
            ▾
          </button>
        )}
      </span>
      <span className="field__hint">
        {value > 0 ? `${tahunDariBulan(value)} tahun` : 'isi jumlah bulan'}
        {hintExtra}
      </span>
      {open && presets && (
        <div className="monthfield__menu" role="menu">
          {presets.map((m) => (
            <button
              key={m}
              type="button"
              className="monthfield__opt"
              onClick={() => {
                onChange(m);
                setOpen(false);
              }}
            >
              {m} bulan <span>({tahunDariBulan(m)} tahun)</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SelectProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
  info?: string;
}

export function SelectField({ label, value, onChange, options, info }: SelectProps) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        <Info text={info} />
      </span>
      <span className="field__control field__control--select">
        <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="field__chev" aria-hidden>▾</span>
      </span>
    </label>
  );
}

interface UnitProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  max?: number;
  info?: string;
}

export function NumberField({ label, value, onChange, suffix, max, info }: UnitProps) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        <Info text={info} />
      </span>
      <span className="field__control">
        <input
          inputMode="numeric"
          value={value === 0 || !Number.isFinite(value) ? '' : String(value)}
          onChange={(e) => {
            const d = e.target.value.replace(/[^\d]/g, '');
            const n = d === '' ? 0 : parseInt(d, 10);
            onChange(max !== undefined ? Math.min(n, max) : n);
          }}
          onFocus={(e) => e.target.select()}
        />
        <span className="field__suffix">{suffix}</span>
      </span>
    </label>
  );
}

interface PercentProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  info?: string;
}

export function PercentField({ label, value, onChange, info }: PercentProps) {
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? formatPersen(value);
  return (
    <label className="field">
      <span className="field__label">
        {label}
        <Info text={info} />
      </span>
      <span className="field__control">
        <input
          inputMode="decimal"
          value={shown}
          onChange={(e) => {
            setText(e.target.value);
            onChange(parsePersen(e.target.value));
          }}
          onFocus={(e) => e.target.select()}
          onBlur={() => setText(null)}
        />
        <span className="field__suffix">%</span>
      </span>
    </label>
  );
}
