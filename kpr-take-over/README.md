# Kev's KPR Calculator

Aplikasi (PWA — web + mobile) untuk menghitung dan membandingkan biaya **KPR tanpa take over vs dengan take over**. Tampilan gaya kalkulator yang bersih, bekerja offline, dan dapat di-install di HP.

Mesin hitung mereplikasi persis file `Perhitungan KPR Take Over.xlsx` (skema anuitas *fix-lalu-floating*) dan diverifikasi lewat unit test.

## Fitur

- **Perbandingan otomatis** — hasil dihitung real-time sambil mengetik, dengan animasi perubahan angka (tanpa tombol "hitung").
- **Input dalam bulan** — tenor & masa fix pakai satuan bulan; bisa ketik manual atau pilih dari dropdown ringkas ("60 bulan (5 tahun)"), lengkap dengan keterangan tahun.
- **Titik take over fleksibel** — atur "take over di bulan ke berapa"; sisa pokok yang dipindah & bunga KPR 1 dihitung otomatis pada bulan tersebut.
- **Bunga fix & floating manual** untuk Bank 1 dan Bank 2, sehingga bisa membandingkan bunga sebelum vs sesudah take over.
- **Panel hasil lengkap** — penghematan, rincian biaya (bunga KPR 1, bunga KPR 2, biaya take over), perbandingan cicilan Bank 1 vs Bank 2, serta jadwal angsuran per tahun + grafik batang fix/floating.
- **Riwayat simulasi** — simpan (dengan nama properti) dan buka kembali; disimpan lokal di perangkat (localStorage, tanpa server).
- **Tema terang/gelap** dengan toggle, pilihan tersimpan.
- **Bagikan ke WhatsApp** — buat gambar ringkasan simulasi (termasuk tabel perbandingan bunga) lalu share via Web Share API (HP) atau unduh + WhatsApp Web (desktop).
- **PWA** — installable & offline (service worker).

## Menjalankan

```bash
npm install
npm run dev        # buka http://localhost:5173
```

Perintah lain:

```bash
npm test           # unit test engine terhadap angka Excel (15 test)
npm run build      # build produksi + service worker PWA ke dist/
npm run preview    # pratinjau hasil build
```

> Node.js belum terpasang? Install dulu (mis. `winget install OpenJS.NodeJS.LTS`).

## Struktur

- `src/lib/finance.ts` — engine amortisasi & perbandingan (pure functions).
- `src/lib/finance.test.ts` — verifikasi terhadap angka Excel (Vitest).
- `src/lib/format.ts` · `src/lib/types.ts` — util format Rupiah/persen/bulan & tipe data.
- `src/state/useSimulation.ts` — state input + hasil terkomputasi.
- `src/components/` — layar Input & Hasil, kontrol input (`Fields.tsx`), grafik & jadwal angsuran, tabel/kartu riwayat, dialog simpan, kartu share, ilustrasi & logo.
- `src/storage/db.ts` — riwayat simulasi (localStorage).
- `src/App.tsx` · `src/theme.css` — kerangka aplikasi, tema light/dark, tokens desain.

## Cara pakai

1. Isi data **KPR saat ini (Bank 1)**: sisa plafon, tenor & masa fix (bulan), bunga fix & floating.
2. Atur **take over di bulan ke** — titik saat pindah ke bank baru (umumnya di akhir masa fix).
3. Isi **penawaran take over (Bank 2)**: tenor, masa fix, bunga, serta biaya (provisi, asuransi, penalti).
4. Hasil tampil otomatis: penghematan, rincian biaya, perbandingan cicilan, dan jadwal angsuran.
5. **Simpan simulasi** untuk membuka kembali dari ikon riwayat, atau **bagikan ke WhatsApp** lewat tombol di kanan atas.

## Model perhitungan

- **Cicilan = anuitas.** Selama masa fix memakai bunga fix atas plafon penuh sepanjang tenor; setelah masa fix, sisa pokok di-anuitas ulang dengan bunga floating sepanjang sisa tenor.
- **Take over.** Pokok yang dipindah = sisa pokok KPR 1 pada bulan take over. Total biaya dengan take over = bunga KPR 1 sampai bulan take over + seluruh bunga KPR 2 + biaya take over (provisi + asuransi + penalti, masing-masing % dari pokok yang dipindah).
- **Perbandingan.** Selisih total bunga tanpa take over vs dengan take over = penghematan (atau kerugian) beserta persentasenya.

## Deploy

Aplikasi 100% frontend, cocok untuk Vercel/Netlify. Jika di-deploy dari repo ini yang berisi subfolder, set **Root Directory = `kpr-take-over`**. Framework terdeteksi otomatis sebagai **Vite** (build `npm run build`, output `dist`). Tidak perlu environment variable.
