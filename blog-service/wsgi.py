"""
WSGI entrypoint untuk PythonAnywhere.

PythonAnywhere akan otomatis membaca file ini.
Pastikan path di bawah sesuai dengan username PythonAnywhere kamu.
Ganti 'YOUR_USERNAME' dengan username PythonAnywhere kamu yang sebenarnya.
"""
import sys
import os

# ── Sesuaikan path ini dengan username PythonAnywhere kamu ────────────────────
PROJECT_PATH = "/home/YOUR_USERNAME/blog-service"

# Tambahkan project ke sys.path agar Python bisa menemukan app.py
if PROJECT_PATH not in sys.path:
    sys.path.insert(0, PROJECT_PATH)

# Set environment variables database (PythonAnywhere MySQL)
# Ganti nilai di bawah sesuai credentials PythonAnywhere kamu
os.environ.setdefault("DB_HOST",     "YOUR_USERNAME.mysql.pythonanywhere-services.com")
os.environ.setdefault("DB_PORT",     "3306")
os.environ.setdefault("DB_USER",     "YOUR_USERNAME")
os.environ.setdefault("DB_PASSWORD", "YOUR_DB_PASSWORD")
os.environ.setdefault("DB_NAME",     "YOUR_USERNAME$article")

# Import Flask app — PythonAnywhere mencari variabel bernama 'application'
from app import app as application  # noqa: E402
