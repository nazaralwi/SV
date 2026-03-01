# Ink & Quill — Blog Admin Dashboard

A modern, dark-themed blog management dashboard built with **React + Vite**, integrated with the Article Microservice API. Built as part of the Frontend Sharing Vision 2023 test.

---

## Features

- **All Posts** — View all articles in tabbed layout (Published, Drafts, Trashed)
- **Add New** — Create articles with title, category, and content
- **Edit Article** — Update any existing article and change its publish status
- **Trash System** — Soft-delete articles; restore or permanently delete from Trash tab
- **Blog Preview** — Public-facing view of published articles with pagination
- **API Integration** — Fully connected to Article Microservice REST API
- **Auto URL Detection** — Automatically probes multiple endpoint formats to find a working one
- **Debug Panel** — Built-in API probe tool to diagnose connection issues
- **Server Status** — Live health check indicator in the sidebar
- **Form Validation** — Enforces API rules (title ≥ 20 chars, content ≥ 200 chars) before sending requests
- **Toast Notifications** — Success/error feedback for every API action

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Native Fetch API | HTTP requests (no Axios) |
| CSS-in-JS (inline styles) | Styling — no external CSS library needed |

---

## Prerequisites

- Node.js v16 or higher
- npm v7 or higher
- Article Microservice backend running (default: `http://localhost:8080`)

---

## Getting Started

### 1. Clone or download the project

```bash
git clone https://github.com/nazaralwi/SV.git
cd SV/blog-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure API URL

Open `src/App.jsx` and update `BASE_URL` to point to your backend:

```js
const BASE_URL = "http://localhost:8080"; // change if needed
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

This frontend consumes the **Article Microservice** API. All endpoints are relative to `BASE_URL`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |
| `GET` | `/article/{limit}/{offset}` | Get all articles (paginated) |
| `GET` | `/article/{id}` | Get single article by ID |
| `POST` | `/article/` | Create new article |
| `PUT` | `/article/{id}` | Update article |
| `DELETE` | `/article/{id}` | Permanently delete article |

### Request Body (POST / PUT)

```json
{
  "title": "Article title (minimum 20 characters)",
  "content": "Article content (minimum 200 characters)...",
  "category": "Teknologi",
  "status": "publish"
}
```

**Valid status values:** `publish` | `draft` | `deleted`

### Article Status Flow

```
[Add New] ──► publish ◄──► draft
                │
                ▼
            deleted (Trash)
                │
                ▼
         DELETE /article/{id}   ← permanent
```

---

## Auto URL Detection

The dashboard automatically tries multiple endpoint formats on startup and uses the first one that returns `200 OK`:

```
/article/10/0
/articles/10/0
/article?limit=10&offset=0
/articles?limit=10&offset=0
/article
/articles
```

Once detected, the working URL is cached for the session.

---

## Debug Panel

If the API is unreachable, click **"Debug API"** in the bottom-left sidebar (or **"Run Debug"** in the error banner). The panel probes all candidate URLs and shows their HTTP status codes, making it easy to identify the correct route or diagnose CORS/networking issues.

---

## Project Structure

```
blog-dashboard/
├── public/
│   └── _redirects          # Netlify redirect rules (if applicable)
├── src/
│   ├── App.jsx             # Main app — all components and API logic
│   └── main.jsx            # React entry point
├── index.html
├── vite.config.js
├── package.json
└── .env                    # API URL config (not committed)
```

> All components are co-located in `App.jsx` for simplicity. For larger projects, split into `components/`, `hooks/`, and `api/` directories.

---

## Building for Production

```bash
npm run build
```

Output is generated in the `dist/` folder. Preview the production build locally:

```bash
npm run preview
```

---

## Deployment

### Netlify (Recommended)

**Option A — CLI:**
```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

**Option B — GitHub Auto-deploy:**
1. Push to GitHub
2. Connect repo at [app.netlify.com](https://app.netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`

**Important:** Update `VITE_API_URL` in Netlify's Environment Variables to your production backend URL (Railway, Render, etc.).

### Other Platforms

Any static hosting works: **Vercel**, **GitHub Pages**, **Cloudflare Pages**, **Firebase Hosting**.

---

## License

MIT — free to use and modify.