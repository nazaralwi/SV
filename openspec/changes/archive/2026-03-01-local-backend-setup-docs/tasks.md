# Dokumentasi Setup Lokal Backend - Blog SV

Dokumen ini berisi panduan komprehensif untuk menjalankan backend blog secara lokal sehingga dapat diakses oleh frontend production di https://blog-sv.nazaralwi.com/

---

## 1. Analisis Arsitektur Project

### 1.1 Tech Stack Backend

| Komponen | Teknologi | Versi Minimum |
|----------|------------|----------------|
| Runtime | Python | 3.8+ |
| Framework | Flask | 3.0.0 |
| CORS | flask-cors | 4.0.0 |
| Database Driver | mysql-connector-python | 8.3.0 |
| Production Server | gunicorn | 21.2.0 |
| Database | MySQL | 5.7+ |

### 1.2 Database yang Digunakan

- **Database**: MySQL
- **Nama Database**: `article` (sesuai konfigurasi di .env)
- **Nama Tabel**: `posts`
- **Port Default**: 3306

Struktur tabel `posts`:
```sql
CREATE TABLE posts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200)  NOT NULL,
    content      TEXT          NOT NULL,
    category     VARCHAR(100)  NOT NULL,
    created_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status       VARCHAR(100)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.3 Port yang Digunakan

| Service | Port | Konfigurasi Environment |
|---------|------|------------------------|
| Backend Flask | 8080 | PORT=8080 |
| MySQL | 3306 | DB_PORT=3306 |

### 1.4 Cara Koneksi Frontend ke Backend

Frontend (blog-dashboard) terhubung ke backend melalui BASE_URL yang di-hardcode di `blog-dashboard/src/App.jsx` line 4:

```javascript
const BASE_URL = "http://127.0.0.1:8080";
```

**Catatan**: Untuk akses dari device lain atau frontend production, URL ini perlu diakses melalui IP lokal atau menggunakan tunnel.

### 1.5 Environment Variable yang Dibutuhkan

Buat file `.env` di folder `blog-service/` dengan isi berikut:

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=
export DB_NAME=article
export PORT=8080
```

| Variable | Default | Keterangan |
|----------|---------|------------|
| DB_HOST | localhost | Host MySQL |
| DB_PORT | 3306 | Port MySQL |
| DB_USER | root | Username MySQL |
| DB_PASSWORD | (kosong) | Password MySQL |
| DB_NAME | article | Nama database |
| PORT | 8080 | Port Flask server |

---

## 2. Install Dependency

### 2.1 Install Python

**Windows:**
1. Download Python dari https://www.python.org/downloads/
2. Run installer, centang "Add Python to PATH"
3. Verifikasi dengan command:
   ```cmd
   python --version
   ```

**macOS:**
1. Install via Homebrew (jika belum ada):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install Python:
   ```bash
   brew install python
   ```
3. Verifikasi dengan command:
   ```bash
   python3 --version
   ```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
python3 --version
```

### 2.2 Install Dependency Python

1. Buka terminal, navigasi ke folder project:
   ```bash
   cd /path/ke/blog-service
   ```

2. (Opsional) Buat virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

Expected output:
```
Successfully installed flask-3.0.0 flask-cors-4.0.0 mysql-connector-python-8.3.0 gunicorn-21.2.0
```

---

## 3. Setup MySQL Server

### 3.1 Opsi A: Command Line

#### Windows - Install MySQL via Installer

1. Download MySQL Installer dari https://dev.mysql.com/downloads/installer/
2. Run installer, pilih "Developer Default" atau "Full"
3. Pada konfigurasi, set:
   - Port: 3306
   - Password root: (sesuai keinginan, kosongkan untuk development)
4. Finish installation
5. Verifikasi service berjalan:
   - Buka Services (ketik "services.msc" di Start)
   - Cari "MySQL80" atau "MySQL"
   - Status harus "Running"

#### macOS - Install via Homebrew

1. Install MySQL:
   ```bash
   brew install mysql
   ```

2. Start MySQL service:
   ```bash
   # Start service
   brew services start mysql

   # Atau langsung run
   mysqld_safe --datadir=/usr/local/var/mysql
   ```

3. Set password root (opsional):
   ```bash
   mysql_secure_installation
   ```

#### Linux (Ubuntu/Debian)

1. Install MySQL Server:
   ```bash
   sudo apt update
   sudo apt install mysql-server
   ```

2. Start service:
   ```bash
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

3. Keamanan awal:
   ```bash
   sudo mysql_secure_installation
   ```

#### Cara Pastikan MySQL Running

1. Test koneksi via command line:
   ```bash
   # Dengan password
   mysql -u root -p -h localhost

   # Tanpa password (default lokal)
   mysql -u root -h localhost
   ```

2. Jika berhasil, akan muncul prompt MySQL:
   ```
   Welcome to the MySQL monitor.  Commands end with ; or \g.
   Your MySQL connection id is 8
   ...
   mysql>
   ```

3. Keluar dengan command:
   ```sql
   EXIT;
   ```

### 3.2 Opsi B: XAMPP

#### Install XAMPP

1. Download XAMPP dari https://www.apachefriends.org/ (pilih versi dengan MySQL)
2. Run installer (Windows: next-next-finish, macOS: drag ke Applications)
3. Pada macOS, cukup install XAMPP tanpa perlu membayar untuk fitur premium

#### Cara Aktifkan MySQL di XAMPP

**Windows:**
1. Buka XAMPP Control Panel
2. Klik "Start" pada baris MySQL
3. Indikator akan menjadi hijau jika berhasil
4. MySQL berjalan di port 3306 (atau port lain yang tersedia)

**macOS:**
1. Buka XAMPP Manager (Applications > XAMPP > manager-osx)
2. Klik tab "Manage Servers"
3. Klik "Start" pada "MySQL Database"
4. Tunggu hingga status menjadi "Running"

#### Cara Pastikan MySQL XAMPP Running

1. Buka terminal
2. Test koneksi:
   ```bash
   # Windows (jika PATH belum ada)
   C:\xampp\mysql\bin\mysql -u root -h localhost

   # macOS
   /Applications/XAMPP/bin/mysql -u root -h localhost
   ```

3. Jika berhasil, akan muncul prompt MySQL

---

## 4. Buat Database

### 4.1 Cara Buat Database via Command Line

1. Buka terminal/MySQL client:
   ```bash
   mysql -u root -p
   ```

2. Buat database:
   ```sql
   CREATE DATABASE article CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Verifikasi database dibuat:
   ```sql
   SHOW DATABASES;
   ```

4. Keluar:
   ```sql
   EXIT;
   ```

### 4.2 Cara Buat Database via migrate.py

File `migrate.py` sudah disediakan di `blog-service/migrate.py` untuk membuat database dan tabel secara otomatis.

1. Pastikan environment variable sudah diset (atau gunakan default)
2. Buka terminal, navigasi ke folder `blog-service`:
   ```bash
   cd /path/ke/blog-service
   ```
3. Jalankan migration:
   ```bash
   python migrate.py
   ```

Expected output:
```
⏳ Connecting to localhost:3306 as root ...
✅ Migration selesai. Database 'article' dan tabel 'posts' siap.
```

---

## 5. Seed Database (Jika Diperlukan)

Jika ingin menambahkan sample data, jalankan seed script:

```bash
cd /path/ke/blog-service
python seed.py
```

Expected output:
```
✅ Seeded 8 articles into the 'posts' table.
```

**Catatan**: seed.py menggunakan konfigurasi dari environment variables. Pastikan DB_PASSWORD diset dengan benar jika MySQL memerlukan password.

---

## 6. Menjalankan Backend Server

### 6.1 Cara Menjalankan Flask Development Server

1. Buka terminal, navigasi ke folder `blog-service`:
   ```bash
   cd /path/ke/blog-service
   ```

2. Jalankan server:
   ```bash
   python app.py
   ```

Expected output:
```
 * Serving Flask app 'app'
 * Running on http://0.0.0.0:8080 (Press CTRL+C to quit)
```

3. Server berjalan di http://0.0.0.0:8080

### 6.2 Cara Menjalankan dengan Gunicorn (Production)

```bash
cd /path/ke/blog-service
gunicorn -w 4 -b 0.0.0.0:8080 app:app
```

- `-w 4`: 4 worker processes
- `-b 0.0.0.0:8080`: bind ke semua interface

### 6.3 Cara Pastikan Server Berjalan di Port yang Benar

1. Buka browser, akses:
   ```
   http://localhost:8080/health
   ```

2. Jika berhasil, akan menampilkan:
   ```json
   {"status": "ok"}
   ```

3. Atau via curl:
   ```bash
   curl http://localhost:8080/health
   ```

4. Untuk melihat proses yang menggunakan port 8080:
   ```bash
   # Windows
   netstat -ano | findstr :8080

   # macOS/Linux
   lsof -i :8080
   ```

---

## 7. Konfigurasi CORS untuk Frontend Production

### 7.1 Penjelasan Masalah CORS

CORS (Cross-Origin Resource Sharing) adalah mekanisme keamanan browser yang membatasi halaman web untuk membuat request ke domain lain kecuali explicitly diizinkan.

Karena:
- Frontend: https://blog-sv.nazaralwi.com (production, HTTPS)
- Backend: http://localhost:8080 (local, HTTP)

Browser akan memblokir request dari frontend production ke backend lokal kecuali CORS dikonfigurasi dengan benar.

### 7.2 Konfigurasi CORS di Backend

Buka file `blog-service/app.py` dan ubah konfigurasi CORS:

**Opsi 1: Allow Specific Origin (Disarankan)**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Ganti baris ini:
# CORS(app)

# Dengan:
CORS(app, origins=["https://blog-sv.nazaralwi.com"])
```

**Opsi 2: Allow All Origins (Development Saja - TIDAK AMAN)**
```python
CORS(app, origins="*")
```

**Opsi 3: Allow with Credentials**
```python
CORS(app, 
     origins=["https://blog-sv.nazaralwi.com"],
     supports_credentials=True)
```

### 7.3 Cara Uji CORS

1. Restart Flask server setelah perubahan:
   ```bash
   # Ctrl+C untuk stop, lalu
   python app.py
   ```

2. Test dengan curl:
   ```bash
   curl -I -X OPTIONS -H "Origin: https://blog-sv.nazaralwi.com" http://localhost:8080/health
   ```

3. Response harus包含:
   ```
   Access-Control-Allow-Origin: https://blog-sv.nazaralwi.com
   ```

---

## 8. Konfigurasi untuk Akses dari Device Lain

### 8.1 Masalah Chrome "Apps on device" Permission

Ketika mengakses backend lokal dari device lain (bukan tempat Flask berjalan), Chrome mungkin menampilkan dialog "Apps on device" yang meminta permission.

**Kapan Muncul:**
- Saat mengakses HTTP (bukan HTTPS) dari Chrome di Android
- Saat Chrome mendeteksi potensi keamanan

**Kenapa Perlu Diizinkan:**
- Browser memblokir akses ke HTTP sites di beberapa kondisi
- Tanpa izin, request tidak akan sampai ke backend

**Cara Memastikan Request Tidak Diblokir:**

1. **Android Chrome:**
   - Ketuk "Details" > "Visit anyway" saat ada warning
   - Atau: Buka chrome://flags > cari "Insecure origins treated as secure" > tambahkan `http://YOUR_LOCAL_IP:8080`

2. **Desktop Chrome:**
   - Biasanya tidak perlu izin khusus untuk localhost
   - Untuk akses dari device lain, gunakan Chrome flags jika diperlukan

### 8.2 Cara Mengetahui IP Lokal

**Windows:**
```cmd
ipconfig
```
Cari IPv4 Address, contoh: `192.168.1.100`

**macOS:**
```bash
ipconfig getifaddr en0
```
Atau:
```bash
ifconfig | grep "inet "
```

**Linux:**
```bash
hostname -I
```

### 8.3 Konfigurasi dengan IP Lokal

Update `.env`:
```bash
export PORT=8080
export FLASK_RUN_HOST=0.0.0.0
```

Akses dari device lain via:
```
http://192.168.1.100:8080
```

---

## 9. Troubleshooting

### 9.1 Error Koneksi Database

**Error:**
```
mysql.connector.errors.DatabaseError: 2003: Can't connect to MySQL server on 'localhost:3306'
```

**Penyebab:**
- MySQL tidak berjalan
- Port salah
- Firewall memblokir

**Solusi:**
1. Pastikan MySQL berjalan (lihat section 3)
2. Verifikasi port MySQL:
   ```sql
   SHOW VARIABLES LIKE 'port';
   ```
3. Cek firewall:
   - Windows: Allow MySQL melalui Windows Firewall
   - macOS: sudo firewall-cmd --add-service=mysql

### 9.2 Port Already in Use

**Error:**
```
OSError: [Errno 48] Address already in use
```

**Solusi:**
1. Cari proses yang menggunakan port 8080:
   ```bash
   # macOS/Linux
   lsof -i :8080

   # Windows
   netstat -ano | findstr :8080
   ```

2. Kill proses tersebut:
   ```bash
   # macOS/Linux
   kill -9 <PID>

   # Windows
   taskkill /PID <PID> /F
   ```

3. Atau gunakan port berbeda:
   ```bash
   export PORT=8081
   python app.py
   ```

### 9.3 CORS Blocked

**Error di Browser Console:**
```
Access to fetch at 'http://localhost:8080/article/200/0' from origin 'https://blog-sv.nazaralwi.com' has been blocked by CORS policy
```

**Solusi:**
1. Pastikan CORS dikonfigurasi dengan benar (lihat section 7.2)
2. Restart Flask server setelah perubahan
3. Verify header:
   ```bash
   curl -I -H "Origin: https://blog-sv.nazaralwi.com" http://localhost:8080/health
   ```

### 9.4 Mixed Content Error

**Error:**
- Tidak terjadi error jika backend HTTP dan frontend HTTPS berbeda domain
- Browser memblokir jika keduanya di domain sama tapi protocol berbeda

**Solusi:**
- Untuk setup ini, tidak perlu khawatir karena berbeda domain
- Frontend: https://blog-sv.nazaralwi.com
- Backend: http://localhost:8080 (atau IP lokal)

### 9.5 Firewall Blocking Connection

**Windows:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Pastikan Python diizinkan
4. Atau sementara matikan firewall untuk test:
   ```cmd
   netsh advfirewall set allprofiles state off
   ```
5. Setelah test, hidupkan kembali:
   ```cmd
   netsh advfirewall set allprofiles state on
   ```

**macOS:**
1. System Preferences > Security & Privacy > Firewall
2. Atau sementara matikan:
   ```bash
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
   ```

### 9.6 MySQL Access Denied

**Error:**
```
mysql.connector.errors.DatabaseError: 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)
```

**Solusi:**
1. Jika menggunakan password, set di .env:
   ```bash
   export DB_PASSWORD=your_password
   ```

2. Reset password root MySQL (jika lupa):
   ```bash
   # Stop MySQL dulu
   # macOS
   brew services stop mysql

   # Start MySQL skip-grant-tables
   mysqld_safe --skip-grant-tables

   # Di terminal lain
   mysql -u root
   ```

   ```sql
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   EXIT;
   ```

3. Restart MySQL normal

---

## 10. Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                         │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                  FRONTEND (Production)                         │   │
│   │                                                                  │   │
│   │   https://blog-sv.nazaralwi.com                                │   │
│   │                                                                  │   │
│   │   ┌─────────────────────────────────────────────────────────┐   │   │
│   │   │  App.jsx (BASE_URL = http://<IP>:8080)                 │   │   │
│   │   └─────────────────────────────────────────────────────────┘   │   │
│   │                                                                  │   │
│   └──────────────────────────┬──────────────────────────────────────┘   │
│                              │                                            │
│                              │ HTTP Request                                │
│                              │ https://blog-sv.nazaralwi.com →            │
│                              │ http://192.168.1.x:8080                    │
│                              │                                            │
└──────────────────────────────┼────────────────────────────────────────────┘
                               │
                               │ LOCAL NETWORK (LAN)
                               │
┌──────────────────────────────┼────────────────────────────────────────────┐
│                              │                                            │
│   ┌──────────────────────────┴──────────────────────────────────────┐   │
│   │                    DEVICE LOKAL (Developer)                     │   │
│   │                                                                    │   │
│   │   ┌───────────────────────────────────────────────────────────┐  │   │
│   │   │                    FLASK BACKEND                         │  │   │
│   │   │                                                           │  │   │
│   │   │   Port: 8080                                              │  │   │
│   │   │   CORS: https://blog-sv.nazaralwi.com                    │  │   │
│   │   │   Routes: /article/*, /health                            │  │   │
│   │   │                                                           │  │   │
│   │   └────────────────────────┬──────────────────────────────────┘  │   │
│   │                            │                                       │   │
│   │                            │ MySQL Connection                     │   │
│   │                            │                                       │   │
│   │   ┌────────────────────────┴──────────────────────────────────┐  │   │
│   │   │                      MYSQL                               │  │   │
│   │   │                                                           │  │   │
│   │   │   Port: │  │   │
│   │   │   Database: article                                      │  │   3306                                            │
│   │   │   Table: posts                                          │  │   │
│   │   │                                                           │  │   │
│   │   └───────────────────────────────────────────────────────────┘  │   │
│   │                                                                    │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                         LOCAL MACHINE                                    │
└────────────────────────────────────────────────────────────────────────────┘

FLOW REQUEST:
1. User mengakses https://blog-sv.nazaralwi.com
2. Browser melakukan fetch ke http://<IP_LAKI>:8080/article/...
3. Request melewati LAN ke device lokal
4. Flask menerima request, cek CORS origin
5. Flask konek ke MySQL untuk query data
6. Response dikembalikan ke browser dengan CORS header
```

---

## 11. Checklist Akhir

Sebelum menggunakan sistem, pastikan semua item di bawah ini sudah dicek:

### 11.1 Environment & Dependency

- [ ] Python 3.8+ terinstall (`python --version`)
- [ ] Semua dependency terinstall (`pip list` - cek flask, flask-cors, mysql-connector-python, gunicorn)
- [ ] File `.env` sudah dibuat di folder `blog-service`

### 11.2 Database

- [ ] MySQL server berjalan (test: `mysql -u root -h localhost`)
- [ ] Database `article` sudah dibuat
- [ ] Tabel `posts` sudah dibuat (test: `python migrate.py`)
- [ ] (Opsional) Sample data sudah di-seed (`python seed.py`)

### 11.3 Backend Server

- [ ] Flask server berjalan di port 8080 (`python app.py`)
- [ ] Health check berhasil (`curl http://localhost:8080/health`)

### 11.4 Network & CORS

- [ ] IP lokal diketahui (`ipconfig` atau `ifconfig`)
- [ ] CORS sudah dikonfigurasi untuk https://blog-sv.nazaralwi.com
- [ ] Firewall mengizinkan koneksi di port 8080

### 11.5 Test dari Frontend

- [ ] Buka https://blog-sv.nazaralwi.com di browser
- [ ] Jika menggunakan IP lokal, pastikan BASE_URL di App.jsx sesuai
- [ ] Coba load data - harusnya tidak ada error CORS
- [ ] coba create, edit, delete artikel berfungsi

### 11.6 Catatan Penting

1. **Server harus tetap running** selama menggunakan aplikasi
2. **IP lokal mungkin berubah** - cek ulang jika koneksi gagal
3. **Tidak ada authentication** - siapa pun yang tahu IP dan port bisa akses API
4. **Hanya untuk development** - untuk production perlu hosting backend yang proper

---

## 12. Rekomendasi Pengembangan

Berdasarkan analisis repo, berikut rekomendasi tambahan:

1. **Dynamic BASE_URL**: Pertimbangkan untuk membuat BASE_URL dapat dikonfigurasi melalui environment variable atau config file, agar tidak perlu mengubah kode saat deployment.

2. **Authentication**: API saat ini tidak memiliki authentication. Untuk environment production, perlu ditambahkan JWT atau API key.

3. **HTTPS untuk Backend**: Saat ini backend menggunakan HTTP. Untuk production yang proper, pertimbangkan menggunakan HTTPS dengan Let's Encrypt.

4. **Deployment Options**: Selain lokal, bisa dipertimbangkan:
   - Railway (free tier available)
   - PythonAnywhere (free untuk Python)
   - Render (free tier available)

Dokumentasi ini dibuat untuk setup development lokal. Untuk deployment production yang sebenarnya, diperlukan VPS atau cloud hosting.
