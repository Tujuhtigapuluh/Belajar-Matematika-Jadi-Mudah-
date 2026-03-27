# Panduan Kontribusi MathGenius PRO

Terima kasih atas minat Anda untuk berkontribusi pada MathGenius PRO! 🎉

## Cara Berkontribusi

### 🐛 Melaporkan Bug

Jika Anda menemukan bug, silakan buat issue dengan format berikut:

**Deskripsi Bug**
Deskripsi singkat dan jelas tentang bug.

**Langkah Reproduksi**
1. Buka '...'
2. Klik '....'
3. Scroll ke '....'
4. Lihat error

**Perilaku yang Diharapkan**
Deskripsi apa yang seharusnya terjadi.

**Screenshots**
Jika ada, tambahkan screenshot.

**Environment:**
 - OS: [contoh: Windows 11]
 - Browser: [contoh: Chrome 120]
 - Versi: [contoh: v3.0.1]

**Soal yang bermasalah:**
Contoh: `2x + 5 = 15` menghasilkan error

💡 Mengusulkan Fitur Baru

Untuk mengusulkan fitur baru:

1. Pastikan belum ada issue yang serupa
2. Gunakan label enhancement
3. Jelaskan:
   - Masalah apa yang ingin diselesaikan?
   - Solusi yang diusulkan
   - Alternatif yang sudah dipertimbangkan
     
🔧 Pull Request
Setup Lingkungan Pengembangan
```bash
# Fork dan clone
git clone https://github.com/YOUR_USERNAME/mathgenius-pro.git
cd mathgenius-pro

# Install dependencies
npm install

# Buat branch baru
git checkout -b fitur/nama-fitur
# atau
git checkout -b fix/nama-bug
```

Standar Kode
TypeScript/React:
- Gunakan functional components dengan hooks
- Type semua props dan return values
- Nama komponen: PascalCase (MathInput.tsx)
- Nama fungsi: camelCase (calculateResult())
- Konstanta: UPPER_SNAKE_CASE (MAX_HISTORY)
Styling:
- Gunakan Tailwind CSS untuk styling
- Custom CSS hanya untuk animasi kompleks
- Warna mengikuti tema yang ada (purple, pink, slate)
- 
Commit Message:
```bash
type(scope): deskripsi singkat

[body - penjelasan lebih detail jika perlu]

[footer - referensi issue: Closes #123]
```
Tipe commit:
- feat: Fitur baru
- fix: Perbaikan bug
- docs: Dokumentasi
- style: Formatting, tanpa perubahan kode
- refactor: Restruktur kode
- test: Test
- chore: Maintenance
Contoh:
```bash
feat(mathEngine): tambah dukungan persamaan kubik

Menambahkan solver untuk persamaan derajat 3 menggunakan
metode Cardano. Closes #45
```
Sebelum Submit PR
- [ ] Kode berjalan tanpa error (npm run dev)
- [ ] Build berhasil (npm run build)
- [ ] Tidak ada console error
- [ ] Test manual dilakukan untuk fitur yang diubah
- [ ] Dokumentasi diperbarui jika perlu

Proses Review

1. PR akan direview dalam 3-7 hari
2. Perubahan mungkin diminta
3. Setelah approved, PR akan di-merge oleh maintainer
🎯 Area yang Butuh Kontribusi

Prioritas Tinggi

- [ ] Unit test untuk mathEngine
- [ ] Dukungan persamaan sistem (2 variabel)
- [ ] Mode gelap/terang toggle
- [ ] Export hasil ke PDF/image

Prioritas Sedang

- [ ] Lebih banyak rumus di Tools Panel
- [ ] Animasi transisi yang lebih halus
- [ ] Keyboard shortcut (Ctrl+Enter untuk solve)
- [ ] History yang bisa di-export

Prioritas Rendah

- [ ] Suara efek untuk kuis
- [ ] Tema warna custom
- [ ] Mode offline dengan service worker

📚 Sumber Belajar

- React Docs
- TypeScript Handbook
- Tailwind CSS
- Vite Guide

❓ Butuh Bantuan?

- Diskusi umum: GitHub Discussions
- Chat cepat: [Discord/Slack jika ada]
  
🏆 Hall of Fame
- Kontributor akan dicantumkan di README dan release notes!
  
```bash

File-file ini sudah lengkap dan siap digunakan. Anda tinggal:

1. Buat folder `.github/` di root proyek
2. Simpan `CONTRIBUTING.md` di dalamnya
3. Simpan file lainnya di root

Apakah perlu saya tambahkan file lain seperti `.gitignore`, `vite.config.ts`,
atau GitHub Actions workflow untuk deploy?
```