"""
Database Migration Script
Creates the 'posts' table in the 'article' database.
"""
import mysql.connector
from urllib.parse import urlparse
import os


def _get_db_config():
    # Mode 1: MYSQL_URL connection string (Railway)
    url = os.getenv("MYSQL_URL") or os.getenv("DATABASE_URL")
    if url:
        p = urlparse(url)
        return {
            "host":     p.hostname,
            "port":     p.port or 3306,
            "user":     p.username,
            "password": p.password or "",
        }, p.path.lstrip("/")

    # Mode 2: Railway individual vars
    # Mode 3: Local fallback
    raw_port = (os.getenv("MYSQLPORT") or os.getenv("DB_PORT") or "").strip()
    config = {
        "host":     os.getenv("MYSQLHOST")     or os.getenv("DB_HOST",     "localhost"),
        "port":     int(raw_port) if raw_port else 3306,
        "user":     os.getenv("MYSQLUSER")     or os.getenv("DB_USER",     "root"),
        "password": os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD", ""),
    }
    db_name = os.getenv("MYSQL_DATABASE") or os.getenv("DB_NAME", "article")
    return config, db_name


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS posts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200)  NOT NULL,
    content      TEXT          NOT NULL,
    category     VARCHAR(100)  NOT NULL,
    created_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status       VARCHAR(100)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""


def run_migration():
    config, db_name = _get_db_config()

    print(f"⏳ Connecting to {config['host']}:{config['port']} as {config['user']} ...")
    conn   = mysql.connector.connect(**config)
    cursor = conn.cursor()

    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    cursor.execute(f"USE `{db_name}`;")
    cursor.execute(CREATE_TABLE_SQL)
    conn.commit()

    print(f"✅ Migration complete. Database '{db_name}' and table 'posts' are ready.")
    cursor.close()
    conn.close()


if __name__ == "__main__":
    run_migration()