"""
Article Microservice
POST   /article/               - Buat artikel baru
GET    /article/<limit>/<offset> - List artikel dengan paging
GET    /article/<id>           - Ambil artikel by ID
PUT    /article/<id>           - Update artikel
DELETE /article/<id>           - Hapus artikel
GET    /health                 - Health check
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import urlparse
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

# ─── Database Configuration ───────────────────────────────────────────────────
# Priority (urutan cek):
#   1. MYSQL_URL / DATABASE_URL    — Railway / connection string
#   2. MYSQLHOST, MYSQLPORT, ...   — Railway individual vars
#   3. DB_HOST, DB_PORT, ...       — file .env / lokal
#   4. Hardcoded localhost         — fallback terakhir (lokal tanpa .env)

def _get_db_config() -> dict:
    # Mode 1: connection string
    url = os.getenv("MYSQL_URL") or os.getenv("DATABASE_URL")
    if url:
        p = urlparse(url)
        return {
            "host":     p.hostname,
            "port":     p.port or 3306,
            "user":     p.username,
            "password": p.password or "",
            "database": p.path.lstrip("/"),
        }

    # Mode 2 & 3: individual env vars dengan fallback localhost
    raw_port = (
        os.getenv("MYSQLPORT") or
        os.getenv("DB_PORT") or
        "3306"
    ).strip()

    return {
        "host":     os.getenv("MYSQLHOST")      or os.getenv("DB_HOST",     "localhost"),
        "port":     int(raw_port),
        "user":     os.getenv("MYSQLUSER")      or os.getenv("DB_USER",     "root"),
        "password": os.getenv("MYSQLPASSWORD")  or os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("MYSQL_DATABASE") or os.getenv("DB_NAME",     "article"),
    }

DB_CONFIG = _get_db_config()

VALID_STATUSES = {"publish", "draft", "thrash"}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


# ─── Validation ───────────────────────────────────────────────────────────────

def validate_article(data: dict) -> list:
    errors = []
    title    = data.get("title", "")
    content  = data.get("content", "")
    category = data.get("category", "")
    status   = data.get("status", "")

    if not title:
        errors.append("title is required.")
    elif len(title) < 20:
        errors.append("title must be at least 20 characters.")

    if not content:
        errors.append("content is required.")
    elif len(content) < 200:
        errors.append("content must be at least 200 characters.")

    if not category:
        errors.append("category is required.")
    elif len(category) < 3:
        errors.append("category must be at least 3 characters.")

    if not status:
        errors.append("status is required.")
    elif status.lower() not in VALID_STATUSES:
        errors.append("status must be one of: publish, draft, thrash.")

    return errors


def row_to_dict(row) -> dict:
    return {
        "id":           row[0],
        "title":        row[1],
        "content":      row[2],
        "category":     row[3],
        "created_date": row[4].isoformat() if row[4] else None,
        "updated_date": row[5].isoformat() if row[5] else None,
        "status":       row[6],
    }


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/article/", methods=["POST"])
def create_article():
    data   = request.get_json(silent=True) or {}
    errors = validate_article(data)
    if errors:
        return jsonify({"errors": errors}), 400

    conn   = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO posts (title, content, category, status) VALUES (%s, %s, %s, %s)",
            (data["title"], data["content"], data["category"], data["status"].lower()),
        )
        conn.commit()
        return jsonify({"id": cursor.lastrowid, "message": "Article created successfully."}), 201
    finally:
        cursor.close()
        conn.close()


@app.route("/article/<int:limit>/<int:offset>", methods=["GET"])
def list_articles(limit, offset):
    conn   = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, title, content, category, created_date, updated_date, status "
            "FROM posts ORDER BY id DESC LIMIT %s OFFSET %s",
            (limit, offset),
        )
        return jsonify([row_to_dict(r) for r in cursor.fetchall()]), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/article/<int:article_id>", methods=["GET"])
def get_article(article_id):
    conn   = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, title, content, category, created_date, updated_date, status "
            "FROM posts WHERE id = %s",
            (article_id,),
        )
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Article not found."}), 404
        return jsonify(row_to_dict(row)), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/article/<int:article_id>", methods=["PUT", "PATCH"])
def update_article(article_id):
    data   = request.get_json(silent=True) or {}
    errors = validate_article(data)
    if errors:
        return jsonify({"errors": errors}), 400

    conn   = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM posts WHERE id = %s", (article_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Article not found."}), 404

        cursor.execute(
            "UPDATE posts SET title=%s, content=%s, category=%s, status=%s WHERE id=%s",
            (data["title"], data["content"], data["category"], data["status"].lower(), article_id),
        )
        conn.commit()
        return jsonify({"message": "Article updated successfully."}), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/article/<int:article_id>", methods=["DELETE"])
def delete_article(article_id):
    conn   = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM posts WHERE id = %s", (article_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Article not found."}), 404

        cursor.execute("DELETE FROM posts WHERE id = %s", (article_id,))
        conn.commit()
        return jsonify({"message": "Article deleted successfully."}), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# ─── Entry Point ──────────────────────────────────────────────────────────────
# Dipakai saat run lokal: python app.py
# PythonAnywhere menggunakan wsgi.py, bukan __main__

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8080)), debug=False)
