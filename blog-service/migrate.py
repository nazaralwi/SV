"""
Database Migration Script
Creates the 'posts' table in the 'article' database.
"""
import mysql.connector
import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
}

DB_NAME = os.getenv("DB_NAME", "article")

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
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Create database if not exists
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    cursor.execute(f"USE `{DB_NAME}`;")

    # Create table
    cursor.execute(CREATE_TABLE_SQL)
    conn.commit()

    print(f"✅ Migration complete. Database '{DB_NAME}' and table 'posts' are ready.")
    cursor.close()
    conn.close()


if __name__ == "__main__":
    run_migration()
