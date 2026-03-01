"""
Article Microservice
POST /article/                  - Create a new article
GET  /article/<limit>/<offset>  - Get paginated list of articles
GET  /article/<id>              - Get single article by ID
PUT  /article/<id>              - Update article by ID
DELETE /article/<id>            - Delete article by ID
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)  # Allow browser frontends to call this API

# ─── Database Configuration ────────────────────────────────────────────────────

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", 3306)),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "article"),
}

VALID_STATUSES = {"publish", "draft", "thrash"}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


# ─── Validation ────────────────────────────────────────────────────────────────

def validate_article(data: dict) -> list[str]:
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
        errors.append(f"status must be one of: {', '.join(VALID_STATUSES)}.")

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


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.route("/article/", methods=["POST"])
def create_article():
    data = request.get_json(silent=True) or {}
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
        new_id = cursor.lastrowid
        return jsonify({"id": new_id, "message": "Article created successfully."}), 201
    finally:
        cursor.close()
        conn.close()


@app.route("/article/<int:limit>/<int:offset>", methods=["GET"])
def list_articles(limit: int, offset: int):
    conn   = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, title, content, category, created_date, updated_date, status "
            "FROM posts ORDER BY id DESC LIMIT %s OFFSET %s",
            (limit, offset),
        )
        rows = cursor.fetchall()
        return jsonify([row_to_dict(r) for r in rows]), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/article/<int:article_id>", methods=["GET"])
def get_article(article_id: int):
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


@app.route("/article/<int:article_id>", methods=["PUT", "PATCH", "POST"])
def update_article(article_id: int):
    # Allow POST with ?_method=PUT workaround if needed
    data = request.get_json(silent=True) or {}
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
def delete_article(article_id: int):
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


# ─── Health Check ──────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# ─── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8080)), debug=False)
