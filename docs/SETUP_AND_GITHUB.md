# Panduan Setup dan GitHub — Second Brain 1.0

Panduan ini adalah urutan kerja. Perintah final akan kita jalankan bersama ketika mulai Milestone 1 agar setiap error dapat diperiksa pada perangkat Andhika.

## 1. Yang perlu disiapkan

- Git.
- Node.js versi LTS dan package manager npm.
- PostgreSQL lokal, atau Docker Desktop bila database ingin dijalankan dengan container.
- Visual Studio Code atau editor pilihan.
- Akun GitHub.
- Akun deployment/database terkelola baru diperlukan mendekati staging.

Verifikasi instalasi:

```bash
git --version
node --version
npm --version
psql --version
```

Jangan lanjut jika Node.js bukan versi LTS yang didukung framework atau jika Git belum mengenali identitas pengguna.

## 2. Konfigurasi Git satu kali

```bash
git config --global user.name "Andhika"
git config --global user.email "EMAIL_GITHUB_KAMU"
git config --global init.defaultBranch main
```

Cek hasil:

```bash
git config --global --list
```

## 3. Inisialisasi aplikasi

Nama folder sementara: `second-brain`.

```bash
npx create-next-app@latest second-brain
cd second-brain
```

Pilihan generator yang disarankan:

| Pertanyaan | Pilihan |
|---|---|
| TypeScript | Yes |
| ESLint | Yes |
| Tailwind CSS | Yes |
| `src/` directory | Yes |
| App Router | Yes |
| Import alias | `@/*` |

Jalankan pemeriksaan awal:

```bash
npm run dev
npm run lint
npm run build
```

## 4. Environment variable

Buat `.env.example` tanpa nilai rahasia:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_SECRET="replace-with-a-random-secret"
OWNER_EMAIL="owner@example.com"
OWNER_PASSWORD_HASH="replace-with-generated-hash"
```

Nilai asli ditempatkan di `.env.local` atau secret manager deployment. Pastikan `.env.local` diabaikan Git.

Aturan penting:

- Jangan menyimpan password plaintext di repository.
- Jangan menyalin connection string production ke screenshot atau issue.
- Commit `.env.example`, jangan commit `.env.local`.

## 5. Setup PostgreSQL dan Prisma

Setelah database local tersedia:

```bash
npm install prisma @prisma/client
npx prisma init
```

Workflow schema selama development:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name init
npx prisma generate
```

Gunakan migration bernama jelas untuk setiap perubahan, misalnya `add_notes`, `add_tags`, atau `add_note_links`. Hindari mengedit migration yang sudah dipakai environment lain.

## 6. Quality tools

Dependency detail dipasang pada Milestone 1. Minimal script yang ingin dicapai:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

Sebelum commit fitur:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 7. Membuat repository GitHub

### Opsi A — GitHub CLI

```bash
git init
git add .
git commit -m "chore: initialize Second Brain project"
gh auth login
gh repo create second-brain --private --source=. --remote=origin --push
```

### Opsi B — melalui website GitHub

1. Buat repository kosong bernama `second-brain`.
2. Jangan tambahkan README atau `.gitignore` dari website bila file lokal sudah ada.
3. Jalankan:

```bash
git init
git add .
git commit -m "chore: initialize Second Brain project"
git remote add origin https://github.com/USERNAME/second-brain.git
git branch -M main
git push -u origin main
```

## 8. Branching dan commit convention

Gunakan alur sederhana:

- `main`: selalu dapat dibuild.
- `feature/<nama-fitur>`: satu fitur atau issue.
- `fix/<nama-bug>`: perbaikan bug.
- Pull request dipakai meskipun dikerjakan sendiri untuk melatih review dan mendokumentasikan keputusan.

Contoh commit:

```text
chore: initialize Next.js project
feat(auth): add owner login
feat(notes): add quick capture
fix(search): preserve tag filter on pagination
test(notes): cover archive and restore rules
docs: update local setup guide
```

## 9. GitHub repository checklist

- [ ] README menjelaskan masalah, fitur, stack, setup, dan screenshot.
- [ ] `.gitignore` mencakup dependency, build output, dan environment file.
- [ ] `.env.example` tersedia tanpa secret.
- [ ] License dipilih sebelum repository menjadi publik.
- [ ] Issue templates tersedia untuk feature dan bug.
- [ ] Pull request template memuat test dan screenshot checklist.
- [ ] GitHub Actions menjalankan lint, typecheck, test, dan build.
- [ ] Branch protection diterapkan ketika workflow stabil.

## 10. Urutan sesi coding bersama

1. **Sesi 1:** cek tools, create-next-app, Git, dan push commit awal.
2. **Sesi 2:** PostgreSQL, Prisma schema awal, migration, dan seed.
3. **Sesi 3:** layout aplikasi, routing, dan komponen UI dasar.
4. **Sesi 4:** authentication owner.
5. **Sesi 5+:** kerjakan milestone fitur satu per satu berdasarkan SRS.

Pada setiap sesi, bagikan output terminal atau screenshot error bila terjadi masalah. Jangan meneruskan banyak langkah setelah satu command gagal; selesaikan penyebabnya terlebih dahulu.
