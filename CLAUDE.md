# KPR Calculator

PWA (React + Vite + TypeScript) untuk simulasi dan perbandingan KPR take over —
mesin hitung anuitas fix-lalu-floating, diverifikasi terhadap
`Perhitungan KPR Take Over.xlsx` (sumbernya ada di root repo ini).

**Kode aplikasinya ada di subfolder `kpr-take-over/`, bukan di root.** Root
repo cuma menyimpan Excel sumber dan aset. Semua perintah run/build/test harus
dijalankan dari dalam `kpr-take-over/`.

**Deploy Vercel: Root Directory harus di-set ke `kpr-take-over`**, bukan root
repo — kalau sampai ke-reset ke default, build akan gagal karena tidak
menemukan `package.json`.

## Perintah (dari dalam `kpr-take-over/`)

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Dev server (Vite, port 5173) |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | Vitest — `src/lib/finance.test.ts` memverifikasi rumus terhadap Excel sumber |
| `npm run test:watch` | Test mode watch |

## Siapa usernya

Kevin (kevinfelan@gmail.com). **Sudah memberi izin eksplisit: commit dan push
tanpa perlu tanya dulu tiap kali ada perubahan app** — itu permintaan langsung
darinya untuk project ini, bukan default Claude Code, jadi jangan tanya ulang
izin ini.
