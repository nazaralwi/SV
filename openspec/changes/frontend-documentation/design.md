## Context

Project blog ini memiliki dua komponen utama: frontend (blog-dashboard) dan backend (blog-service). Frontend sudah di-hosting di https://blog-sv.nazaralwi.com/ menggunakan React + Vite. Dokumentasi frontend diperlukan untuk membantu developer memahami cara kerja aplikasi frontend, bagaimana integrasi dengan backend, dan cara menjalankan development server secara lokal.

Kondisi saat ini:
- Frontend menggunakan React 19.2.0 dengan Vite 7.3.1
- Single-page application dengan dashboard admin untuk manajemen artikel
- Backend API di-hardcode di `App.jsx` line 4 sebagai `BASE_URL = "http://127.0.0.1:8080"`

Constraints:
- Developer perlu memahami arsitektur frontend untuk melakukan pengembangan
- Perlu ada dokumentasi cara setup development environment
- Perlu ada troubleshooting untuk error umum

## Goals / Non-Goals

**Goals:**
1. Dokumentasi arsitektur project (tech stack, struktur folder, dependencies)
2. Dokumentasi komponen utama dan API layer
3. Dokumentasi API integration (endpoint, request/response format)
4. Dokumentasi konfigurasi Vite dan build production
5. Panduan cara menjalankan development server
6. Troubleshooting error umum

**Non-Goals:**
- Tidak mengubah kode aplikasi (hanya dokumentasi)
- Tidak mengimplementasikan fitur baru
- Tidak menambahkan authentication/authorization

## Decisions

### Decision 1: React sebagai frontend framework
**Alternatives considered:** Vue, Angular, Svelte
**Decision:** Menggunakan React sesuai dengan codebase existing
**Rationale:** React sudah ada di package.json, developer familiar dengan React

### Decision 2: Vite sebagai build tool
**Alternatives considered:** Create React App, Webpack
**Decision:** Menggunakan Vite sesuai dengan codebase existing
**Rationale:** Vite lebih cepat dari CRA, konfigurasi lebih sederhana

### Decision 3: Inline CSS dengan color tokens
**Alternatives considered:** CSS Modules, Styled Components, Tailwind CSS
**Decision:** Menggunakan inline styles dengan color constants di App.jsx
**Rationale:** Simplifies setup tanpa perlu CSS preprocessor atau library tambahan

### Decision 4: Hardcoded BASE_URL
**Alternatives considered:** Environment variable, Config file, API proxy
**Decision:** BASE_URL hardcoded di App.jsx
**Rationale:** Simplest approach untuk development, tapi perlu diubah untuk production

## Risks / Trade-offs

- **Risk: BASE_URL hardcoded** → Mitigation: Jelaskan cara mengubah BASE_URL untuk akses dari device lain
- **Risk: No environment-based config** → Mitigation: Sediakan panduan cara ubah konfigurasi di dokumentasi
- **Risk: CORS issues saat development** → Mitigation: Jelaskan bahwa backend perlu running dan CORS perlu dikonfigurasi
- **Risk: No build optimization** → Mitigation: Vite sudah menyediakan optimization, cukup jalankan `npm run build`

## Open Questions

1. Apakah perlu dynamic BASE_URL configuration?
2. Apakah perlu tambahkan environment variable untuk konfigurasi?
