# Second Brain 1.0

Second Brain 1.0 adalah aplikasi web pribadi untuk menangkap, merapikan, menghubungkan, dan menemukan kembali pengetahuan. Fokus versi pertama adalah **knowledge hub**, bukan aplikasi manajemen tugas atau chatbot AI.

## Keputusan proyek

| Area | Keputusan |
|---|---|
| Target pengguna | Satu pengguna/pribadi |
| Fokus MVP | Knowledge hub |
| Frontend dan backend | Next.js App Router + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS + komponen UI yang aksesibel |
| Autentikasi | Login owner; registrasi publik tidak tersedia |
| Format isi catatan | Markdown |
| Deployment target | Vercel + PostgreSQL terkelola |

## Dokumen proyek

- [SRS](docs/SRS.md): kebutuhan perangkat lunak dan acceptance criteria.
- [Arsitektur](docs/ARCHITECTURE.md): komponen sistem, model data, dan rancangan API.
- [Desain UI/UX](docs/UI_UX.md): navigasi, halaman, alur pengguna, dan design system awal.
- [Roadmap](docs/ROADMAP.md): urutan pengerjaan dari nol sampai rilis.
- [Setup dan GitHub](docs/SETUP_AND_GITHUB.md): instalasi, inisialisasi proyek, dan workflow Git.

## Definisi MVP selesai

MVP dinyatakan selesai ketika owner dapat login, membuat catatan dari Inbox, mengedit isi Markdown, memberi tag, menghubungkan dua catatan, mencari catatan, memproses Inbox, mengarsipkan atau memulihkan catatan, dan menggunakan aplikasi secara nyaman di desktop maupun ponsel.

## Urutan kerja yang disarankan

1. Baca dan setujui batas MVP pada SRS.
2. Siapkan perangkat pengembangan mengikuti panduan setup.
3. Inisialisasi repository dan push commit awal.
4. Bangun database dan autentikasi.
5. Bangun fitur notes, tags, links, search, lalu review dashboard.
6. Tambahkan pengujian, deployment, dan dokumentasi portofolio.

Keputusan yang belum final dicatat sebagai `TBD` dan harus diselesaikan sebelum modul terkait mulai dibuat.
