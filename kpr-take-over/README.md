# Simulasi KPR Take Over

Aplikasi (PWA — web + mobile) untuk menghitung dan membandingkan biaya **KPR tanpa take over vs dengan take over**. Tampilan gaya kalkulator, bekerja offline, dan dapat di-install di HP.

Mesin hitung mereplikasi persis file `Perhitungan KPR Take Over.xlsx` (skema anuitas *fix-lalu-floating*).

## Menjalankan

```bash
npm install
npm run dev        # buka http://localhost:5173
```

Perintah lain:

```bash
npm test           # unit test engine terhadap angka Excel (14 test)
npm run build      # build produksi + service worker PWA ke dist/
npm run preview    # pratinjau hasil build
```

> Node.js belum terpasang? Install dulu (mis. `winget install OpenJS.NodeJS.LTS`).

## Struktur

- `src/lib/finance.ts` — engine amortisasi & perbandingan (pure functions).
- `src/lib/finance.test.ts` — verifikasi terhadap angka Excel.
- `src/components/` — layar Input & Hasil, tabel cicilan, jadwal angsuran, preset bank, riwayat.
- `src/storage/db.ts` — preset bank & riwayat simulasi (localStorage, tanpa server).
- `src/data/bankPresets.ts` — preset bank bawaan (bisa ditambah user).

## Cara pakai

1. Isi data **KPR saat ini (Bank 1)** dan **penawaran take over (Bank 2)** — semua bisa diedit, atau pilih preset bank.
2. Tekan **Hitung simulasi** untuk melihat penghematan, rincian biaya, perbandingan cicilan, dan jadwal angsuran.
3. **Simpan simulasi** untuk membuka kembali dari ikon riwayat.

## Model perhitungan

- Cicilan = anuitas. Selama masa fix memakai bunga fix atas plafon penuh sepanjang tenor; setelah masa fix, sisa pokok di-anuitas ulang dengan bunga floating sepanjang sisa tenor.
- Take over: bunga yang dihitung hanya masa fix KPR 1 + seluruh bunga KPR 2 + biaya take over (provisi + asuransi + penalti, masing-masing % dari pokok yang dipindah).
