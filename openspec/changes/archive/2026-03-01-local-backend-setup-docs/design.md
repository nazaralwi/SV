## Context

Project blog ini terdiri dari dua komponen utama:
- **Frontend** (blog-dashboard): React + Vite application, sudah di-hosting di https://blog-sv.nazaralwi.com/
- **Backend** (blog-service): Flask Python application, berjalan secara lokal

Kondisi saat ini:
- Frontend production mengakses backend di `http://127.0.0.1:8080` (hardcoded di App.jsx line 4)
- Backend service belum di-hosting karena tidak ada VPS
- Solusi sementara: backend dijalankan di localhost, diakses dari device lokal melalui network

Constraints:
- Developer non-DevOps harus dapat mengikuti panduan dengan mudah
- Perlu menangani CORS untuk akses cross-origin dari frontend production
- MySQL server harus berjalan secara lokal

## Goals / Non-Goals

**Goals:**
1. Dokumentasi analisis arsitektur project lengkap (tech stack, database, port, env vars)
2. Panduan step-by-step instalasi dependency backend
3. Panduan konfigurasi dan menjalankan MySQL server (CLI dan XAMPP)
4. Panduan migration dan seed database
5. Konfigurasi CORS untuk mengizinkan origin https://blog-sv.nazaralwi.com
6. Troubleshooting untuk error umum
7. Diagram arsitektur dan checklist akhir

**Non-Goals:**
- Tidak mengubah kode aplikasi (hanya dokumentasi)
- Tidak menyediakan hosting backend
- Tidak mengimplementasikan authentication/authorization

## Decisions

### Decision 1: Python sebagai runtime backend
**Alternatives considered:** Node.js, Go
**Decision:** Menggunakan Python (Flask) sesuai dengan codebase existing
**Rationale:** Sesuai dengan requirements.txt dan app.py yang sudah ada di repository

### Decision 2: MySQL sebagai database
**Alternatives considered:** PostgreSQL, SQLite
**Decision:** Menggunakan MySQL sesuai dengan codebase existing
**Rationale:** mysql-connector-python sudah di-requirements.txt, app.py menggunakan MySQL

### Decision 3: CORS menggunakan flask-cors
**Alternatives considered:** Manual CORS headers, nginx reverse proxy
**Decision:** Konfigurasi CORS langsung di Flask menggunakan flask-cors
**Rationale:** flask-cors sudah ada di requirements.txt (flask-cors>=4.0.0), tinggal perlu add configuration untuk mengizinkan specific origin

### Decision 4: Dua opsi MySQL installation
**Alternatives considered:** Hanya satu opsi
**Decision:** Menyediakan dua opsi - command line dan XAMPP
**Rationale:** Developer mungkin lebih familiar dengan XAMPP yang menyediakan GUI, atau command line untuk yang lebih teknis

## Risks / Trade-offs

- **Risk: Chrome "Apps on device" permission** → Mitigation: Jelaskan kapan muncul dan cara mengizinkan
- **Risk: Mixed content error (HTTPS frontend vs HTTP backend)** → Mitigation: Gunakan HTTP untuk backend, frontend production sudah HTTPS tidak masalah karena request dari browser ke localhost adalah例外
- **Risk: Firewall memblokir koneksi** → Mitigation: Sediakan troubleshooting untuk Windows Firewall dan macOS
- **Risk: Port 8080 sudah digunakan** → Mitigation: Sediakan cara cek dan cara ubah port
- **Risk: CORS blocked** → Mitigation: Jelaskan konfigurasi CORS yang tepat di backend
- **Risk: Akses database denied** → Mitigation: Berikan panduan buat user MySQL dengan privileges yang tepat

## Open Questions

1. Apakah perlu menambahkan dynamic BASE_URL configuration di frontend untuk production?
2. Apakah perlu dokumentasi untuk deployment ke platform lain (Railway, PythonAnywhere)?
