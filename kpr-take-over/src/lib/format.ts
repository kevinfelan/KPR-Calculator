const rupiah0 = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const number0 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** Rp 2.000.000.000 */
export function formatRupiah(n: number): string {
  if (!isFinite(n)) return '-';
  return rupiah0.format(Math.round(n));
}

/** Format ringkas: Rp 2,20 M / Rp 594,4 jt / Rp 850 rb */
export function formatRingkas(n: number): string {
  if (!isFinite(n)) return '-';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}Rp ${(abs / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 })} T`;
  if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`;
  if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1e3) return `${sign}Rp ${(abs / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
  return `${sign}Rp ${Math.round(abs)}`;
}

/** 2000000 -> "2.000.000" untuk ditampilkan di input */
export function formatAngka(n: number): string {
  if (!isFinite(n)) return '';
  return number0.format(Math.round(n));
}

/** "2.000.000" / "Rp 2.000.000" -> 2000000 */
export function parseAngka(s: string): number {
  const cleaned = s.replace(/[^\d]/g, '');
  return cleaned === '' ? 0 : parseInt(cleaned, 10);
}

/** 0.035 -> "3,5" */
export function formatPersen(frac: number): string {
  return (frac * 100).toLocaleString('id-ID', { maximumFractionDigits: 3 });
}

/** "3,5" -> 0.035 */
export function parsePersen(s: string): number {
  const cleaned = s.replace(/[^\d,.-]/g, '').replace(',', '.');
  const v = parseFloat(cleaned);
  return isNaN(v) ? 0 : v / 100;
}

/** 0.27006 -> "27%" */
export function formatPersenLabel(frac: number, digits = 0): string {
  return `${(frac * 100).toLocaleString('id-ID', { maximumFractionDigits: digits })}%`;
}

/** 240 -> "20"; 66 -> "5,5" (jumlah tahun dari jumlah bulan) */
export function tahunDariBulan(bulan: number): string {
  return (bulan / 12).toLocaleString('id-ID', { maximumFractionDigits: 1 });
}
