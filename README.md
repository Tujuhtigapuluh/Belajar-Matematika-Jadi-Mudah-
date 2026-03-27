Markdown
Copy
Code
Preview
# 🧮 MathGenius PRO v3.0

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Kalkulator Matematika Simbolik dengan Penyelesaian Langkah demi Langkah**

MathGenius PRO adalah aplikasi web modern untuk menyelesaikan soal matematika dengan penjelasan detail, lengkap dengan mode kuis interaktif dan berbagai tools pembelajaran.

![MathGenius PRO Screenshot](https://via.placeholder.com/800x400/4c1d95/ffffff?text=MathGenius+PRO+Screenshot)

## ✨ Fitur Utama

### 🔢 Kalkulator Simbolik
- **Aritmatika**: Penjumlahan, pengurangan, perkalian, pembagian, pangkat, akar
- **Persamaan Linear**: `2x + 5 = 15` → solusi lengkap dengan verifikasi
- **Persamaan Kuadrat**: `x² + 5x + 6 = 0` → rumus ABC dengan diskriminan
- **Faktorial & Fungsi**: `5!`, `sqrt(144)`, `sin(30°)`, dll
- **Langkah Detail**: Setiap operasi dijelaskan transparan

### 🎮 Mode Kuis
- Soal random (+, −, ×, ÷)
- Sistem poin dan streak
- Feedback instan (✓/✗)
- Animasi confetti saat benar

### 🛠️ Tools Panel
- 📐 **Rumus**: Bangun datar, ruang, aljabar, trigonometri
- ✖️ **Tabel Perkalian**: 1-10 dengan highlight interaktif
- 💡 **Tips & Trik**: Perkalian cepat, cek habis dibagi, dll
- ✏️ **Papan Coret**: Canvas gambar untuk latihan
- 📜 **Riwayat**: 10 perhitungan terakhir
- 🏆 **Pencapaian**: Sistem achievement (WIP)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn

### Instalasi

```bash
# Clone repository
git clone https://github.com/username/mathgenius-pro.git
cd mathgenius-pro

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build
```
Deploy ke GitHub Pages
```bash
npm run deploy
```
>**Catatan: Pastikan vite.config.ts menggunakan base: './' dan GitHub Actions workflow menggunakan --base=/${{ github.event.repository.name }}/**

📖 Cara Penggunaan

Menyelesaikan Persamaan

1. Ketik soal di input box: 2x + 5 = 15
2. Klik ✨ Selesaikan atau tekan Enter
3. Lihat penyelesaian langkah demi langkah
4. Verifikasi akhir memastikan jawaban benar

Mode Kuis

1. Klik tombol 🎮 Kuis di header
2. Jawab soal yang muncul
3. Dapatkan poin untuk setiap jawaban benar
4. Build streak untuk bonus!

Menggunakan Tools

1. Klik 🛠️ di pojok kanan atas
2. Pilih tool yang diinginkan
3. Gunakan tabel perkalian, lihat rumus, atau coret-coret di papan

## 🧮 Contoh Soal yang Didukung

| Tipe       | Contoh Input       | Output                      |
| ---------- | ------------------ | --------------------------- |
| Aritmatika | `2 + 3 × 4`        | `14` (dengan urutan BODMAS) |
| Pecahan    | `(8/2)^3`          | `64`                        |
| Akar       | `sqrt(144)`        | `12`                        |
| Faktorial  | `5!`               | `120`                       |
| Linear     | `2x + 5 = 15`      | `x = 5` (dengan verifikasi) |
| Kuadrat    | `x^2 + 5x + 6 = 0` | `x₁ = -2, x₂ = -3`          |
| Fungsi     | `sin(30)`          | `0.5`                       |

## 🏗️ Struktur Proyek
```bash
mathgenius-pro/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── src/
│   ├── components/
│   │   ├── MathInput.tsx       # Input dengan keyboard virtual
│   │   ├── MathRenderer.tsx    # LaTeX-like renderer
│   │   ├── SolutionDisplay.tsx   # Tampilan langkah penyelesaian
│   │   └── ToolsPanel.tsx      # Panel tools samping
│   ├── lib/
│   │   └── mathEngine.ts       # Mesin matematika simbolik
│   ├── App.tsx                 # Komponen utama
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind + custom styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```
🛠️ Teknologi

Frontend: React 18 + TypeScript
Styling: Tailwind CSS + Custom CSS
Build Tool: Vite
Math Engine: Custom symbolic parser (tanpa library eksternal)
Deployment: GitHub Pages

🤝 Kontribusi
Kami sangat terbuka untuk kontribusi! Lihat CONTRIBUTING.md untuk panduan lengkap.

Cara cepat berkontribusi:

1. Fork repository
2. Buat branch fitur (git checkout -b fitur-keren)
3. Commit perubahan (git commit -m 'Tambah fitur keren')
4. Push ke branch (git push origin fitur-keren)
5. Buat Pull Request

📄 Lisensi

Proyek ini dilisensikan di bawah MIT License.

🙏 Kredit
- Dibuat dengan ❤️ untuk siswa dan pengajar matematika
- Terinspirasi dari WolframAlpha dan Photomath
- Ikon dari Emoji

<p align="center">
  Made with 💜 for learning math<br>
  <a href="https://github.com/username/mathgenius-pro">GitHub</a> •
  <a href="https://username.github.io/mathgenius-pro">Live Demo</a>
</p>
