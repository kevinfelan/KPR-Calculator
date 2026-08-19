# Pindah KPR Calculator

**Live: https://pindah-kpr.vercel.app**

Aplikasi (PWA — web + mobile) untuk menghitung dan membandingkan biaya **KPR tanpa take over vs dengan take over**. Tampilan gaya kalkulator yang bersih, bekerja offline, dan dapat di-install di HP.

Mesin hitung mereplikasi persis file `Perhitungan KPR Take Over.xlsx` (skema anuitas *fix-lalu-floating*) dan diverifikasi lewat unit test.

## Fitur

- **Perbandingan otomatis** — hasil dihitung real-time sambil mengetik, dengan animasi perubahan angka (tanpa tombol "hitung").
- **Input dalam bulan** — tenor & masa fix pakai satuan bulan; bisa ketik manual atau pilih dari dropdown ringkas ("60 bulan (5 tahun)"), lengkap dengan keterangan tahun.
- **Titik take over fleksibel** — atur "take over di bulan ke berapa"; sisa pokok yang dipindah & bunga KPR 1 dihitung otomatis pada bulan tersebut.
- **Tenor baru otomatis** — tenor Bank 2 (dan Bank 3) mengikuti sisa tenor KPR sebelumnya setelah take over, tetap bisa diubah manual dan dikembalikan ke nilai otomatis.
- **Take over dua kali** — tombol "Tambah take over ke-2" merantai pindah lagi dari Bank 2 ke Bank 3, dihitung dari sisa pokok & sisa tenor Bank 2 dengan rumus yang sama.
- **Bunga fix & floating manual** untuk Bank 1 dan Bank 2, sehingga bisa membandingkan bunga sebelum vs sesudah take over.
- **Panel hasil bersorot cicilan** — perbandingan cicilan masa fix & floating sebelum → sesudah take over tampil paling atas, disusul rincian bunga tiap KPR dan biaya take over, lalu ringkasan penghematan di bawah.
- **Riwayat simulasi** — simpan (dengan nama properti) dan buka kembali; disimpan lokal di perangkat (localStorage, tanpa server).
- **Tema terang/gelap** dengan toggle, pilihan tersimpan.
- **Bagikan simulasi** — tombol share membuat gambar ringkasan (termasuk tabel perbandingan bunga & cicilan Bank 1 vs Bank 2), menampilkannya di pratinjau, lalu bisa dibagikan lewat share sheet HP (WhatsApp / simpan ke galeri) atau **diunduh sebagai PNG**.
- **Keterangan field** — ikon "i" di tiap label; muncul saat hover di PC dan saat di-tap di HP.
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
- `src/components/` — layar Input & Hasil, kontrol input (`Fields.tsx`), perbandingan cicilan (`CicilanCompare.tsx`), grafik & jadwal angsuran (sementara disembunyikan lewat `TAMPILKAN_JADWAL_ANGSURAN` di `App.tsx`), tabel/kartu riwayat, dialog simpan, kartu share, ilustrasi & logo.
- `src/storage/db.ts` — riwayat simulasi (localStorage).
- `src/App.tsx` · `src/theme.css` — kerangka aplikasi, tema light/dark, tokens desain.

## Cara pakai

1. Isi data **KPR saat ini (Bank 1)**: sisa plafon, tenor & masa fix (bulan), bunga fix & floating.
2. Atur **take over di bulan ke** — titik saat pindah ke bank baru (umumnya di akhir masa fix).
3. Isi **penawaran take over (Bank 2)**: tenor, masa fix, bunga, serta biaya (provisi, asuransi, penalti).
4. Opsional: tekan **Tambah take over ke-2** untuk merantai pindah lagi ke Bank 3.
5. Hasil tampil otomatis: perbandingan cicilan, rincian bunga & biaya, lalu penghematan total.
6. **Simpan simulasi** untuk membuka kembali dari ikon riwayat, atau **bagikan** (ikon share di kanan atas) → pratinjau gambar → kirim ke WhatsApp / unduh PNG.

## Model perhitungan

- **Cicilan = anuitas.** Selama masa fix memakai bunga fix atas plafon penuh sepanjang tenor; setelah masa fix, sisa pokok di-anuitas ulang dengan bunga floating sepanjang sisa tenor.
- **Take over.** Pokok yang dipindah = sisa pokok KPR sebelumnya pada bulan take over. Total biaya dengan take over = bunga tiap KPR sampai bulan take over-nya + seluruh bunga KPR terakhir + biaya semua tahap take over (provisi + asuransi + penalti, masing-masing % dari pokok yang dipindah di tahap itu).
- **Perbandingan.** Selisih total bunga tanpa take over vs dengan take over = penghematan (atau kerugian) beserta persentasenya.

## Deploy

Live di **https://pindah-kpr.vercel.app** (Vercel). Aplikasi 100% frontend, cocok untuk Vercel/Netlify. Jika di-deploy dari repo ini yang berisi subfolder, set **Root Directory = `kpr-take-over`**. Framework terdeteksi otomatis sebagai **Vite** (build `npm run build`, output `dist`). Tidak perlu environment variable.
