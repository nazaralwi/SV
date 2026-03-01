# Dokumentasi Frontend - Blog Dashboard

Dokumen ini berisi panduan komprehensif untuk frontend blog-dashboard yang mencakup arsitektur, komponen, API, konfigurasi, dan troubleshooting.

---

## 1. Arsitektur Project

### 1.1 Tech Stack

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | React | 19.2.0 |
| Build Tool | Vite | 7.3.1 |
| Language | JavaScript | ES2022 |
| Package Manager | npm | - |

### 1.2 Dependencies

**Dependencies (Runtime):**
- `react`: ^19.2.0 - UI library
- `react-dom`: ^19.2.0 - React DOM rendering

**DevDependencies:**
- `@vitejs/plugin-react`: ^5.1.1 - Vite React plugin
- `vite`: ^7.3.1 - Build tool
- `eslint`: ^9.39.1 - Linting
- `@eslint/js`: ^9.39.1 - ESLint config
- `eslint-plugin-react-hooks`: ^7.0.1 - React hooks linting
- `eslint-plugin-react-refresh`: ^0.4.24 - React refresh linting
- `globals`: ^16.5.0 - Global variables
- `@types/react`: ^19.2.7 - TypeScript types
- `@types/react-dom`: ^19.2.3 - TypeScript types

### 1.3 Struktur Folder

```
blog-dashboard/
├── public/                  # Static assets
│   └── vite.svg            # Favicon
├── src/                    # Source code
│   ├── assets/            # Images, fonts, etc
│   │   └── react.svg
│   ├── App.css           # App styles
│   ├── App.jsx           # Main component
│   ├── index.css         # Global styles
│   └── main.jsx          # Entry point
├── dist/                  # Production build output
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint configuration
└── README.md             # Documentation
```

---

## 2. Komponen Utama

### 2.1 Entry Point (main.jsx)

File `src/main.jsx` adalah entry point aplikasi React:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- Merender `App` component ke element dengan id `root`
- Menggunakan StrictMode untuk development checks
- Import global styles dari `index.css`

### 2.2 Main Component (App.jsx)

File `src/App.jsx` adalah komponen utama yang berisi:

**Konfigurasi:**
- `BASE_URL`: URL backend API (default: `http://127.0.0.1:8080`)
- `ARTICLES_PER_PAGE`: Jumlah artikel per halaman (default: 10)

**API Layer:**
```javascript
const api = {
  getAll: async (limit, offset) => {...},
  create: async (body) => {...},
  update: async (id, body) => {...},
  delete: async (id) => {...},
  health: async () => {...}
};
```

**Constants:**
- `STATUS`: Enum untuk status artikel (PUBLISH, DRAFT, THRASH)
- `CATEGORIES`: Array kategori yang tersedia
- `C`: Color tokens untuk styling

**State:**
- `articles`: Array artikel dari API
- `loading`: Status loading
- `apiError`: Error message
- `page`: Halaman saat ini (posts, add, edit, preview)
- `editArt`: Artikel yang sedang di-edit
- `form`: Form data untuk create/update
- `tab`: Tab yang aktif (publish, draft, thrash)
- `search`: Keyword pencarian

### 2.3 UI Components

**Badge Component:**
Menampilkan status artikel dengan warna berbeda:
- **Published**: Green (#5aaa5a)
- **Draft**: Amber (#d4a853)
- **Trashed**: Red (#cc5555)

**Toast Component:**
Menampilkan notifikasi sukses/error dengan animasi slide-up.

**SVG Icons:**
- Trash, Edit, Restore, Plus, Eye, Rows, Spin, Warn, Ok, Refresh

---

## 3. API Integration

### 3.1 Base URL Configuration

**Lokasi:** `blog-dashboard/src/App.jsx` line 4

```javascript
const BASE_URL = "http://127.0.0.1:8080";
```

**Untuk akses dari device lain:**
Ubah BASE_URL ke IP lokal:
```javascript
const BASE_URL = "http://192.168.1.100:8080"; // Ganti dengan IP lokal Anda
```

### 3.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/article/{limit}/{offset}` | Get all articles with pagination |
| POST | `/article/` | Create new article |
| GET | `/article/{id}` | Get single article |
| PUT | `/article/{id}` | Update article |
| DELETE | `/article/{id}` | Delete article |
| GET | `/health` | Health check |

### 3.3 Request/Response Format

**Create Article (POST /article/):**
```javascript
// Request body
{
  title: string,      // min 20 characters
  content: string,    // min 200 characters
  category: string,   // min 3 characters
  status: string      // "publish", "draft", atau "thrash"
}

// Response
{
  id: number,
  message: "Article created successfully."
}
```

**Update Article (PUT /article/{id}):**
```javascript
// Request body (sama dengan create)
{
  title: string,
  content: string,
  category: string,
  status: string
}

// Response
{
  message: "Article updated successfully."
}
```

**Get Articles (GET /article/{limit}/{offset}):**
```javascript
// Response
[
  {
    id: number,
    title: string,
    content: string,
    category: string,
    created_date: string,  // ISO date
    updated_date: string,  // ISO date
    status: string
  },
  ...
]
```

**Delete Article (DELETE /article/{id}):**
```javascript
// Response
{
  message: "Article deleted successfully."
}
```

### 3.4 Error Handling

**Client-side errors:**
- Network error: Tampilkan error "Tidak dapat terhubung ke {BASE_URL}"
- Validation error: Tampilkan pesan error dari response
- HTTP error: Tampilkan error sesuai status code

---

## 4. Konfigurasi Build

### 4.1 Vite Configuration

File: `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Plugins:**
- `@vitejs/plugin-react`: Enables React Fast Refresh dan JSX transformation

### 4.2 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

### 4.3 Build Output

Setelah running `npm run build`, output akan berada di folder `dist/`:

```
dist/
├── index.html
├── assets/
│   ├── index-xxxxx.js   # Bundled JS
│   └── index-xxxxx.css  # Bundled CSS
└── vite.svg
```

---

## 5. Cara Menjalankan

### 5.1 Install Dependencies

1. Buka terminal
2. Navigasi ke folder project:
   ```bash
   cd blog-dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### 5.2 Development Server

1. Jalankan development server:
   ```bash
   npm run dev
   ```
2. Buka browser ke http://localhost:5173

**Note:** Pastikan backend server juga running di port 8080.

### 5.3 Production Build

1. Build production:
   ```bash
   npm run build
   ```
2. Output berada di folder `dist/`

### 5.4 Preview Production Build

1. Jalankan preview server:
   ```bash
   npm run preview
   ```
2. Buka browser ke http://localhost:4173

---

## 6. Troubleshooting

### 6.1 Connection Refused

**Error:**
```
Tidak dapat terhubung ke http://127.0.0.1:8080
```

**Penyebab:**
- Backend server tidak running

**Solusi:**
1. Pastikan Flask server running: `cd blog-service && python app.py`
2. Cek port 8080 sudah digunakan:
   - Windows: `netstat -ano | findstr :8080`
   - macOS/Linux: `lsof -i :8080`
3. Cek firewall mengizinkan koneksi di port 8080

### 6.2 CORS Error

**Error di Console:**
```
Access to fetch at 'http://localhost:8080/article/200/0' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Penyebab:**
- Backend tidak mengizinkan origin frontend

**Solusi:**
1. Pastikan CORS sudah dikonfigurasi di backend
2. Untuk development, bisa ubah CORS di `blog-service/app.py`:
   ```python
   CORS(app, origins="*")  # Untuk development saja
   ```

### 6.3 Build Error

**Error:**
```
Error: [commonjs--resolver] Cannot find module 'react'
```

**Solusi:**
1. Hapus node_modules dan package-lock.json:
   ```bash
   rm -rf node_modules package-lock.json
   ```
2. Install ulang:
   ```bash
   npm install
   ```

### 6.4 ESLint Error

**Error:**
```
error: 'useState' is defined but never used
```

**Solusi:**
1. Install dependencies eslint:
   ```bash
   npm install
   ```
2. Atau ignore error untuk development di eslint.config.js

### 6.5 Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solusi:**
1. Cari proses yang menggunakan port 5173:
   - Windows: `netstat -ano | findstr :5173`
   - macOS/Linux: `lsof -i :5173`
2. Kill proses tersebut atau gunakan port berbeda:
   ```bash
   npm run dev -- --port 5174
   ```

### 6.6 Module Not Found

**Error:**
```
Cannot find module '@/components/Header'
```

**Solusi:**
1. Pastikan path sudah benar
2. Untuk imports relative, gunakan format:
   ```javascript
   import Component from './components/Header'
   ```

---

## 7. Kategori dan Status

### 7.1 Kategori yang Tersedia

```javascript
const CATEGORIES = [
  "Teknologi",
  "Pemrograman", 
  "Database",
  "DevOps",
  "Arsitektur",
  "Tools",
  "Keamanan",
  "Desain",
  "Tutorial",
  "Lifestyle",
  "Bisnis"
];
```

### 7.2 Status Artikel

| Status | Deskripsi |
|--------|-----------|
| publish | Artikel published dan visible di frontend |
| draft | Artikel disimpan sebagai draft |
| thrash | Artikel dipindahkan ke trash |

---

## 8. Deploy ke Production

### 8.1 Build untuk Production

```bash
npm run build
```

### 8.2 Deploy ke Static Hosting

1. Build selesai, semua file ada di folder `dist/`
2. Upload isi folder `dist/` ke hosting (Netlify, Vercel, dll)
3. Untuk GitHub Pages, push folder `dist/` ke branch `gh-pages`

### 8.3 Konfigurasi BASE_URL untuk Production

Untuk production deployment, ubah BASE_URL di `App.jsx` ke URL backend production:

```javascript
const BASE_URL = "https://your-backend-production.com";
```

**Alternatif: Environment Variable**
Buat file `.env.production`:
```
VITE_API_URL=https://your-backend-production.com
```

Lalu ubah App.jsx:
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";
```

---

## 9. Development Workflow

### 9.1 Typical Development Flow

1. **Start development:**
   ```bash
   # Terminal 1: Start backend
   cd blog-service
   python app.py

   # Terminal 2: Start frontend
   cd blog-dashboard
   npm run dev
   ```

2. **Make changes:**
   - Edit kode di `src/App.jsx`
   - Perubahan akan hot-reload otomatis

3. **Test changes:**
   - Buka http://localhost:5173
   - Test create, update, delete artikel

4. **Build for production:**
   ```bash
   npm run build
   ```

### 9.2 Code Style

- Menggunakan ESLint untuk code quality
- Component names: PascalCase (App, Badge, Toast)
- Constants: UPPER_SNAKE_CASE (STATUS, CATEGORIES)
- Functions: camelCase (getAll, createArticle)

---

## 10. Referensi Tambahan

### 10.1 Links Resmi

- React: https://react.dev/
- Vite: https://vitejs.dev/
- ESLint: https://eslint.org/

### 10.2 File Penting

| File | Deskripsi |
|------|-----------|
| `src/App.jsx` | Main component dengan API layer |
| `src/main.jsx` | Entry point |
| `src/index.css` | Global styles |
| `vite.config.js` | Vite configuration |
| `package.json` | Dependencies dan scripts |
| `index.html` | HTML template |

---

Dokumen ini dibuat untuk membantu developer memahami arsitektur dan cara mengembangkan frontend blog-dashboard.
