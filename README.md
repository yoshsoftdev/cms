# CMS Admin (Vite + React)

Panel admin untuk Headless CMS (backend Go), berbasis Vite.

## Persyaratan

- Node.js 18+
- Backend CMS berjalan (default `http://localhost:8080`)

## Setup

```bash
cp .env.local.example .env.local
pnpm install
```

Konfigurasi environment:

- `VITE_CMS_BASE_URL=/api/cms` (disarankan untuk dev, lewat proxy Vite)
- `VITE_CMS_BACKEND_URL=http://localhost:8080` (target proxy)

Atau langsung ke backend:

- `VITE_CMS_BASE_URL=http://localhost:8080` (backend harus mengizinkan CORS)

## Menjalankan

```bash
pnpm dev
```

Buka `http://localhost:3000`.

## Build produksi

```bash
pnpm build
pnpm preview
```

## Fitur

- Login JWT
- CRUD Postingan & Halaman
- Navigasi bertingkat + reorder root dengan drag-drop
- Upload media
- UI Bahasa Indonesia
