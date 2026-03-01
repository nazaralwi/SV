## Why

Frontend blog sudah di-hosting di https://blog-sv.nazaralwi.com/, tetapi backend service belum memiliki hosting karena keterbatasan resource VPS. Solusi sementara adalah menjalankan backend secara lokal di mesin developer, sementara frontend production mengakses service dari device lokal. Perubahan ini diperlukan untuk membuat dokumentasi setup lokal yang komprehensif agar developer non-DevOps dapat menjalankan backend dengan benar dan mengaksesnya dari frontend production.

## What Changes

- Membuat dokumentasi analisis arsitektur project (tech stack, database, port, environment variable)
- Membuat panduan step-by-step instalasi dependency backend
- Membuat panduan konfigurasi dan menjalankan MySQL server (command line dan XAMPP)
- Membuat panduan cara import schema database (migration)
- Membuat panduan cara seed data jika diperlukan
- Membuat panduan konfigurasi CORS untuk mengizinkan akses dari frontend production
- Membuat dokumentasi troubleshooting error umum (database connection, CORS, mixed content, firewall)
- Membuat diagram arsitektur sederhana
- Membuat checklist akhir sebelum digunakan

## Capabilities

### New Capabilities
- `local-setup-docs`: Dokumentasi komprehensif setup lokal backend yang mencakup semua aspek dari instalasi hingga troubleshooting

### Modified Capabilities
- Tidak ada

## Impact

- File dokumentasi baru: `openspec/changes/local-backend-setup-docs/proposal.md`, `design.md`, `tasks.md`
- Tidak ada perubahan pada kode aplikasi
- Tidak ada perubahan pada API atau dependencies
