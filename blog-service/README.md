# Article Microservice — Sharing Vision 2023

## Stack
- **Database:** MySQL (`article` database, `posts` table)
- **Microservice:** Python 3.11+ with Flask

---

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment variables (optional — defaults shown)
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=article
export PORT=8080
```

### 3. Run database migration
This creates the `article` database (if it doesn't exist) and the `posts` table.
```bash
python migrate.py
```

### 4. Start the server
```bash
python app.py
```

---

## API Endpoints

| # | Method | URL | Description |
|---|--------|-----|-------------|
| 1 | POST | `/article/` | Create a new article |
| 2 | GET | `/article/<limit>/<offset>` | List all articles (paginated) |
| 3 | GET | `/article/<id>` | Get article by ID |
| 4 | PUT / PATCH | `/article/<id>` | Update article by ID |
| 5 | DELETE | `/article/<id>` | Delete article by ID |

### Create / Update Request Body
```json
{
  "title": "Judul artikel minimal dua puluh karakter",
  "content": "Konten artikel harus minimal 200 karakter. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "category": "Teknologi",
  "status": "publish"
}
```

### Validation Rules
| Field | Rules |
|-------|-------|
| title | Required, min 20 characters |
| content | Required, min 200 characters |
| category | Required, min 3 characters |
| status | Required, must be: `publish`, `draft`, or `thrash` |

### Error Response (400)
```json
{
  "errors": [
    "title must be at least 20 characters.",
    "status must be one of: publish, draft, thrash."
  ]
}
```

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS posts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200)  NOT NULL,
    content      TEXT          NOT NULL,
    category     VARCHAR(100)  NOT NULL,
    created_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status       VARCHAR(100)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Postman Collection
Import `postman_collection.json` into Postman.  
Set the `base_url` variable to `http://localhost:8080` (default).
