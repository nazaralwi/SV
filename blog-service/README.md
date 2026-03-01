# Article Microservice — Blog Service

REST API untuk use case **Post Article** (Sharing Vision 2023), dibangun dengan Python + Flask + MySQL.

---

## Struktur Project

```
blog-service/
├── app.py              # Flask application & semua route
├── wsgi.py             # WSGI entrypoint untuk PythonAnywhere
├── migrate.py          # Script buat database & tabel
├── seed.py             # Script isi data contoh
├── requirements.txt    # Dependensi Python
├── .env.example        # Template environment variables
└── README.md
```

---

## API Endpoints

| Method | URL | Deskripsi |
|--------|-----|-----------|
| `GET` | `/health` | Health check |
| `POST` | `/article/` | Buat artikel baru |
| `GET` | `/article/<limit>/<offset>` | List artikel (paging) |
| `GET` | `/article/<id>` | Ambil artikel by ID |
| `PUT` / `PATCH` | `/article/<id>` | Update artikel |
| `DELETE` | `/article/<id>` | Hapus artikel |

### Request Body (POST / PUT / PATCH)
```json
{
  "title": "Judul artikel minimal dua puluh karakter",
  "content": "Konten minimal 200 karakter...",
  "category": "Teknologi",
  "status": "publish"
}
```

### Validation Rules
| Field | Rule |
|-------|------|
| `title` | Wajib, minimal 20 karakter |
| `content` | Wajib, minimal 200 karakter |
| `category` | Wajib, minimal 3 karakter |
| `status` | Wajib, salah satu dari: `publish`, `draft`, `thrash` |

---

## 🖥️ Cara Menjalankan Lokal

### 1. Prasyarat
- Python 3.9+
- MySQL 8.0+ berjalan di localhost

### 2. Clone / download project
```bash
cd ~/projects
# letakkan semua file di folder blog-service
```

### 3. Buat virtual environment
```bash
cd blog-service
python3 -m venv venv
source venv/bin/activate          # Linux / macOS
# venv\Scripts\activate           # Windows
```

### 4. Install dependensi
```bash
pip install -r requirements.txt
```

### 5. Set environment variables
```bash
cp .env.example .env
# Edit .env sesuaikan DB_USER dan DB_PASSWORD
source .env
```

Atau export langsung:
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=article
export PORT=8080
```

### 6. Jalankan migration
```bash
python migrate.py
```
Output yang diharapkan:
```
⏳ Connecting to localhost:3306 as root ...
✅ Migration selesai. Database 'article' dan tabel 'posts' siap.
```

### 7. (Opsional) Isi data contoh
```bash
python seed.py
```

### 8. Jalankan server
```bash
python app.py
```
Server berjalan di: `http://localhost:8080`

---

## 🌐 Deploy ke PythonAnywhere (Gratis Selamanya)

### 1. Daftar akun
Buka https://www.pythonanywhere.com → klik **Start running Python online** → pilih **Create a Beginner account** (gratis).

### 2. Buat MySQL database
Di dashboard PythonAnywhere:
1. Klik tab **Databases**
2. Masukkan password database → klik **Create**
3. Di bagian **Your databases**, klik tombol **Create a database**
4. Isi nama database: `article`
5. Catat informasi berikut:
   - **Host:** `YOUR_USERNAME.mysql.pythonanywhere-services.com`
   - **Username:** `YOUR_USERNAME`
   - **Password:** password yang kamu buat tadi
   - **Database name:** `YOUR_USERNAME$article`

### 3. Upload project
Di dashboard → klik tab **Files** → klik **Upload a file** untuk tiap file, atau gunakan Bash console:

```bash
# Buka tab Consoles → Bash
mkdir ~/blog-service
cd ~/blog-service
```

Lalu upload semua file (`app.py`, `wsgi.py`, `migrate.py`, `seed.py`, `requirements.txt`) melalui tab **Files → blog-service**.

### 4. Install dependensi di Bash console
```bash
cd ~/blog-service
pip3 install --user -r requirements.txt
```

### 5. Edit wsgi.py
Buka file `wsgi.py` dan ganti semua placeholder:

```python
PROJECT_PATH = "/home/YOUR_USERNAME/blog-service"
#                        ↑ ganti dengan username PythonAnywhere kamu

os.environ.setdefault("DB_HOST",     "YOUR_USERNAME.mysql.pythonanywhere-services.com")
os.environ.setdefault("DB_USER",     "YOUR_USERNAME")
os.environ.setdefault("DB_PASSWORD", "YOUR_DB_PASSWORD")
os.environ.setdefault("DB_NAME",     "YOUR_USERNAME$article")
```

### 6. Jalankan migration
Di **Bash console**:
```bash
cd ~/blog-service

# Set env vars sementara untuk migration
export DB_HOST=YOUR_USERNAME.mysql.pythonanywhere-services.com
export DB_USER=YOUR_USERNAME
export DB_PASSWORD=YOUR_DB_PASSWORD
export DB_NAME=YOUR_USERNAME$article

python migrate.py
```

Output yang diharapkan:
```
⏳ Connecting to YOUR_USERNAME.mysql.pythonanywhere-services.com:3306 ...
✅ Migration selesai. Database 'YOUR_USERNAME$article' dan tabel 'posts' siap.
```

### 7. Setup Web App
1. Klik tab **Web** di dashboard
2. Klik **Add a new web app** → klik **Next**
3. Pilih **Manual configuration** → pilih **Python 3.10** → klik **Next**
4. Di halaman konfigurasi web app:
   - **Source code:** `/home/YOUR_USERNAME/blog-service`
   - **Working directory:** `/home/YOUR_USERNAME/blog-service`
5. Scroll ke bagian **WSGI configuration file** → klik link file wsgi (contoh: `/var/www/YOUR_USERNAME_pythonanywhere_com_wsgi.py`)
6. **Hapus semua isi file tersebut**, ganti dengan:

```python
import sys
import os

sys.path.insert(0, '/home/YOUR_USERNAME/blog-service')

# Variabel ini sudah ada di wsgi.py project kamu
# File ini hanya sebagai bridge ke wsgi.py project
exec(open('/home/YOUR_USERNAME/blog-service/wsgi.py').read())
```

Atau lebih simpel, langsung isi environment dan import di sini:

```python
import sys
import os

sys.path.insert(0, '/home/YOUR_USERNAME/blog-service')

os.environ['DB_HOST']     = 'YOUR_USERNAME.mysql.pythonanywhere-services.com'
os.environ['DB_PORT']     = '3306'
os.environ['DB_USER']     = 'YOUR_USERNAME'
os.environ['DB_PASSWORD'] = 'YOUR_DB_PASSWORD'
os.environ['DB_NAME']     = 'YOUR_USERNAME$article'

from app import app as application
```

### 8. Reload dan akses
1. Scroll ke atas → klik tombol hijau **Reload YOUR_USERNAME.pythonanywhere.com**
2. Akses API di: `https://YOUR_USERNAME.pythonanywhere.com/health`

---

## ☁️ Deploy ke Railway

### 1. Push ke GitHub terlebih dahulu
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/username/blog-service.git
git push -u origin main
```

### 2. Deploy di Railway
1. Buka https://railway.app → login dengan GitHub
2. **New Project → Deploy from GitHub repo** → pilih repo
3. Tambahkan MySQL: **+ New → Database → MySQL**
4. Di Flask service → tab **Variables**, tambahkan:
   ```
   MYSQL_URL = ${{MySQL.MYSQL_URL}}
   ```
5. Jalankan migration sekali via **Settings → Start Command**:
   ```
   python migrate.py && gunicorn app:app --bind 0.0.0.0:$PORT
   ```
6. Setelah migration berhasil, kembalikan ke:
   ```
   gunicorn app:app --bind 0.0.0.0:$PORT
   ```

---

## 🔧 Urutan Priority Database Config

App membaca konfigurasi database dengan urutan berikut:

```
1. MYSQL_URL atau DATABASE_URL   ← Railway (connection string lengkap)
2. MYSQLHOST, MYSQLPORT, ...     ← Railway (individual vars)
3. DB_HOST, DB_PORT, ...         ← PythonAnywhere / .env lokal
4. localhost:3306                ← fallback default lokal
```

---

## Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Can't connect to MySQL server on 'localhost'` | Env vars belum di-set | Jalankan `source .env` atau edit `wsgi.py` |
| `ValueError: invalid literal for int()` | `DB_PORT` bernilai string kosong | Sudah diperbaiki di versi ini |
| `ModuleNotFoundError: flask` | Dependensi belum install | Jalankan `pip install -r requirements.txt` |
| `Table 'article.posts' doesn't exist` | Migration belum dijalankan | Jalankan `python migrate.py` |
| `gunicorn: command not found` | gunicorn belum install | Sudah ada di `requirements.txt`, jalankan `pip install -r requirements.txt` |
