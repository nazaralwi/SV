import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "http://127.0.0.1:8080";
const ARTICLES_PER_PAGE = 10;

// ─── API LAYER ────────────────────────────────────────────────────────────────
const api = {
  // GET /article/{limit}/{offset}
  getAll: async (limit = 100, offset = 0) => {
    const res = await fetch(`${BASE_URL}/article/${limit}/${offset}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  // GET /article/{id}
  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/article/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  // POST /article/
  create: async (body) => {
    const res = await fetch(`${BASE_URL}/article/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
  // PUT /article/{id}
  update: async (id, body) => {
    const res = await fetch(`${BASE_URL}/article/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  },
  // DELETE /article/{id}
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/article/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  },
  // GET /health
  health: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  },
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/>
    <path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11,4H4a2,2,0,0,0-2,2V18a2,2,0,0,0,2,2H16a2,2,0,0,0,2-2V11"/>
    <path d="M18.5,2.5a2.121,2.121,0,0,1,3,3L12,15l-4,1,1-4,9.5-9.5Z"/>
  </svg>
);
const RestoreIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="1,4 1,10 7,10"/><path d="M3.51,15a9,9,0,1,0,.49-4.95"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "spin 0.8s linear infinite" }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const categories = ["Teknologi", "Pemrograman", "Database", "DevOps", "Arsitektur", "Tools", "Keamanan", "Desain", "Tutorial", "Lifestyle", "Bisnis"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// The backend uses: "publish", "draft", "thrash"
// "thrash" (as-per spec) is what we treat as the trash tab.
const STATUS = {
  PUBLISH: "publish",
  DRAFT:   "draft",
  THRASH:  "thrash",   // backend spelling from the spec
};

const normaliseStatus = (s = "") => s.toLowerCase().trim();

const byStatus = (articles, status) =>
  articles.filter(a => normaliseStatus(a.status) === status);

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: isError ? "#3a1010" : "#0f1f0f",
      border: `1px solid ${isError ? "#cc4444" : "#449944"}`,
      borderRadius: 4, padding: "13px 18px",
      display: "flex", alignItems: "center", gap: 10,
      color: isError ? "#ff8888" : "#88cc88",
      fontSize: 13, fontFamily: "Georgia, serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      maxWidth: 420, animation: "fadeIn 0.25s ease",
    }}>
      {isError ? <AlertIcon /> : <CheckIcon />}
      <span>{toast.message}</span>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [articles, setArticles]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [apiError, setApiError]             = useState(null);
  const [page, setPage]                     = useState("posts");
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm]                     = useState({ title: "", content: "", category: categories[0] });
  const [formErrors, setFormErrors]         = useState({});
  const [submitting, setSubmitting]         = useState(false);
  const [tab, setTab]                       = useState(STATUS.PUBLISH);
  const [previewPage, setPreviewPage]       = useState(1);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [toast, setToast]                   = useState(null);
  const [serverOnline, setServerOnline]     = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch all articles ────────────────────────────────────────────────────
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await api.getAll(100, 0);
      // Backend returns a plain array
      const list = Array.isArray(data) ? data : (data.data ?? data.articles ?? []);
      setArticles(list);
    } catch {
      setApiError(`Cannot reach the server at ${BASE_URL}. Make sure it is running.`);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.health()
      .then(ok => setServerOnline(ok))
      .catch(() => setServerOnline(false));
    fetchArticles();
  }, [fetchArticles]);

  // ── Derived counts ────────────────────────────────────────────────────────
  const publishedArticles = byStatus(articles, STATUS.PUBLISH);
  const totalPreviewPages = Math.max(1, Math.ceil(publishedArticles.length / ARTICLES_PER_PAGE));
  const currentPreview    = publishedArticles.slice(
    (previewPage - 1) * ARTICLES_PER_PAGE,
    previewPage * ARTICLES_PER_PAGE
  );
  const tabCounts = {
    [STATUS.PUBLISH]: byStatus(articles, STATUS.PUBLISH).length,
    [STATUS.DRAFT]:   byStatus(articles, STATUS.DRAFT).length,
    [STATUS.THRASH]:  byStatus(articles, STATUS.THRASH).length,
  };

  // ── Form validation (mirrors backend rules) ───────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.title.trim())             errs.title    = "Title is required.";
    else if (form.title.length < 20)    errs.title    = "Title must be at least 20 characters.";
    if (!form.content.trim())           errs.content  = "Content is required.";
    else if (form.content.length < 200) errs.content  = "Content must be at least 200 characters.";
    if (!form.category.trim())          errs.category = "Category is required.";
    else if (form.category.length < 3)  errs.category = "Category must be at least 3 characters.";
    return errs;
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const addArticle = async (status) => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.create({ ...form, status });
      showToast(status === STATUS.PUBLISH ? "Article published!" : "Article saved as draft.");
      setForm({ title: "", content: "", category: categories[0] });
      setFormErrors({});
      await fetchArticles();
      setPage("posts");
      setTab(status);
    } catch (err) {
      // Surface backend validation errors if any
      const msg = err?.errors?.join(" ") ?? err?.message ?? err?.error ?? "Failed to create article.";
      showToast(msg, "error");
    } finally { setSubmitting(false); }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const saveEdit = async (status) => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await api.update(editingArticle.id, { ...form, status });
      showToast("Article updated successfully.");
      setFormErrors({});
      await fetchArticles();
      setPage("posts");
      setTab(status);
    } catch (err) {
      const msg = err?.errors?.join(" ") ?? err?.message ?? err?.error ?? "Failed to update article.";
      showToast(msg, "error");
    } finally { setSubmitting(false); }
  };

  // ── Move to trash (PUT status=thrash) ─────────────────────────────────────
  // Backend spec says status must be "publish" | "draft" | "thrash"
  const trashArticle = async (article) => {
    try {
      await api.update(article.id, {
        title:    article.title,
        content:  article.content,
        category: article.category,
        status:   STATUS.THRASH,
      });
      showToast("Article moved to Trash.");
      await fetchArticles();
    } catch { showToast("Failed to trash article.", "error"); }
  };

  // ── Restore (PUT status=draft) ────────────────────────────────────────────
  const restoreArticle = async (article) => {
    try {
      await api.update(article.id, {
        title:    article.title,
        content:  article.content,
        category: article.category,
        status:   STATUS.DRAFT,
      });
      showToast("Article restored to Drafts.");
      await fetchArticles();
    } catch { showToast("Failed to restore article.", "error"); }
  };

  // ── Permanent delete ──────────────────────────────────────────────────────
  const deleteArticle = async (id) => {
    if (!window.confirm("Permanently delete this article? This cannot be undone.")) return;
    try {
      await api.delete(id);
      showToast("Article permanently deleted.");
      await fetchArticles();
    } catch { showToast("Failed to delete article.", "error"); }
  };

  // ── Open edit ─────────────────────────────────────────────────────────────
  const openEdit = (article) => {
    setEditingArticle(article);
    setForm({ title: article.title, content: article.content, category: article.category });
    setFormErrors({});
    setPage("edit");
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigateTo = (key) => {
    setPage(key);
    setFormErrors({});
    if (key === "preview") { setPreviewPage(1); setPreviewArticle(null); }
    if (key === "add") setForm({ title: "", content: "", category: categories[0] });
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputStyle = (hasError) => ({
    width: "100%", padding: "13px 16px",
    background: "#141414", border: `1px solid ${hasError ? "#cc4444" : "#252525"}`,
    borderRadius: 2, color: "#e8e0d4", fontSize: 15,
    fontFamily: "Georgia, serif", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  });

  const navItems = [
    { key: "posts",   label: "All Posts" },
    { key: "add",     label: "Add New" },
    { key: "preview", label: "Preview" },
  ];

  const tabDefs = [
    { key: STATUS.PUBLISH, label: "Published" },
    { key: STATUS.DRAFT,   label: "Drafts" },
    { key: STATUS.THRASH,  label: "Trashed" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #2e2416; border-radius: 3px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Georgia, serif", background: "#0c0c0c", color: "#e0d8cc" }}>

        {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside style={{ width: 224, background: "#111", borderRight: "1px solid #1e1e1e", flexShrink: 0, display: "flex", flexDirection: "column" }}>

          {/* Logo */}
          <div style={{ padding: "30px 24px 22px", borderBottom: "1px solid #1e1e1e" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#7a6340", textTransform: "uppercase", marginBottom: 3 }}>The</div>
            <div style={{ fontSize: 21, fontWeight: 700, color: "#e0d8cc", lineHeight: 1.1 }}>Ink & Quill</div>
            <div style={{ fontSize: 9, color: "#3a3020", letterSpacing: 2, marginTop: 3 }}>DASHBOARD</div>

            {/* Server pill */}
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: serverOnline === null ? "#7a6340" : serverOnline ? "#44aa44" : "#cc4444" }} />
              <span style={{ fontSize: 9, letterSpacing: 1,
                color: serverOnline === null ? "#7a6340" : serverOnline ? "#44aa44" : "#cc4444" }}>
                {serverOnline === null ? "CHECKING…" : serverOnline ? "SERVER ONLINE" : "SERVER OFFLINE"}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "10px 0", flex: 1 }}>
            {navItems.map(item => {
              const active = page === item.key || (page === "edit" && item.key === "posts");
              return (
                <button key={item.key} onClick={() => navigateTo(item.key)}
                  style={{ display: "block", width: "100%", padding: "11px 24px", background: active ? "#1c1710" : "transparent", color: active ? "#d4a853" : "#6a5c48", border: "none", borderLeft: active ? "3px solid #d4a853" : "3px solid transparent", textAlign: "left", cursor: "pointer", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "inherit", transition: "all 0.2s" }}>
                  {item.label}
                </button>
              );
            })}
            <button onClick={fetchArticles}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "11px 24px", background: "transparent", color: "#3a3020", border: "none", borderLeft: "3px solid transparent", cursor: "pointer", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "inherit", marginTop: 6, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#7a6340"}
              onMouseLeave={e => e.currentTarget.style.color = "#3a3020"}>
              {loading ? <SpinnerIcon /> : "↺"} Refresh
            </button>
          </nav>

          <div style={{ padding: "12px 24px", borderTop: "1px solid #1e1e1e", fontSize: 9, color: "#252015", letterSpacing: 1 }}>
            {BASE_URL}
          </div>
        </aside>

        {/* ─── MAIN ────────────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto", minWidth: 0 }}>

          {/* API error banner */}
          {apiError && !loading && (
            <div style={{ background: "#1e0a0a", border: "1px solid #3a1a1a", borderRadius: 3, padding: "16px 20px", marginBottom: 28, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ color: "#cc4444", marginTop: 1, flexShrink: 0 }}><AlertIcon /></div>
              <div>
                <div style={{ fontSize: 13, color: "#ff7777", fontWeight: 600, marginBottom: 4 }}>API Connection Error</div>
                <div style={{ fontSize: 12, color: "#885555", lineHeight: 1.6 }}>{apiError}</div>
                <div style={{ fontSize: 11, color: "#664444", marginTop: 6, lineHeight: 1.5 }}>
                  Make sure the Flask server is running: <code style={{ background: "#2a1010", padding: "1px 6px", borderRadius: 2 }}>python app.py</code>
                  <br/>Then check that CORS is enabled or use a browser extension to allow cross-origin requests.
                </div>
                <button onClick={fetchArticles}
                  style={{ marginTop: 10, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", background: "none", border: "1px solid #3a1a1a", color: "#cc4444", cursor: "pointer", padding: "5px 12px", fontFamily: "inherit", borderRadius: 2 }}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* ════════════ ALL POSTS ════════════ */}
          {page === "posts" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#7a6340", textTransform: "uppercase" }}>Manage</div>
                <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#e0d8cc" }}>All Posts</h1>
                {!loading && !apiError && (
                  <div style={{ fontSize: 11, color: "#3a3020", marginTop: 4 }}>{articles.length} total articles in database</div>
                )}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", marginBottom: 28, borderBottom: "1px solid #1e1e1e" }}>
                {tabDefs.map(({ key, label }) => (
                  <button key={key} onClick={() => setTab(key)}
                    style={{ padding: "10px 22px", background: "none", border: "none", borderBottom: tab===key ? "2px solid #d4a853" : "2px solid transparent", color: tab===key ? "#d4a853" : "#4a3c2a", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: -1, transition: "all 0.2s" }}>
                    {label}
                    <span style={{ marginLeft: 8, fontSize: 10, background: tab===key ? "#d4a853" : "#1a1a1a", color: tab===key ? "#0c0c0c" : "#4a3c2a", borderRadius: 10, padding: "2px 7px" }}>
                      {tabCounts[key] ?? 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div style={{ display:"flex", justifyContent:"center", padding:"60px 0", color:"#3a3020" }}>
                  <SpinnerIcon />
                </div>
              )}

              {/* Table */}
              {!loading && (
                <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 2, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
                        {["ID","Title","Category","Status","Action"].map(h => (
                          <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#4a3c2a", fontWeight: 600, fontFamily: "inherit" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {byStatus(articles, tab).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "44px 18px", textAlign: "center", color: "#2a2018", fontSize: 12, letterSpacing: 1 }}>
                            No articles in this tab
                          </td>
                        </tr>
                      ) : (
                        byStatus(articles, tab).map(article => (
                          <tr key={article.id} style={{ borderBottom: "1px solid #181818", transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#141210"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "12px 18px", color: "#2e2416", fontSize: 12 }}>{article.id}</td>
                            <td style={{ padding: "12px 18px", color: "#c0b49a", fontSize: 14, maxWidth: 260 }}>
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.title}</div>
                            </td>
                            <td style={{ padding: "12px 18px" }}>
                              <span style={{ fontSize: 9, letterSpacing: 1.5, background: "#1c1710", color: "#d4a853", padding: "3px 9px", borderRadius: 2, textTransform: "uppercase" }}>
                                {article.category}
                              </span>
                            </td>
                            <td style={{ padding: "12px 18px" }}>
                              <span style={{ fontSize: 9, letterSpacing: 1.5,
                                background: article.status===STATUS.PUBLISH ? "#0a1f0a" : article.status===STATUS.DRAFT ? "#1a1a0a" : "#1f0a0a",
                                color: article.status===STATUS.PUBLISH ? "#44aa44" : article.status===STATUS.DRAFT ? "#aaaa44" : "#aa4444",
                                padding: "3px 9px", borderRadius: 2, textTransform: "uppercase" }}>
                                {article.status}
                              </span>
                            </td>
                            <td style={{ padding: "12px 18px" }}>
                              <div style={{ display: "flex", gap: 7 }}>
                                {tab !== STATUS.THRASH && (
                                  <>
                                    <button onClick={() => openEdit(article)}
                                      style={{ padding:"6px 11px", background:"#1e1e1e", border:"1px solid #2a2a2a", color:"#7a6c5a", borderRadius:2, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:11, fontFamily:"inherit", transition:"all 0.2s" }}
                                      onMouseEnter={e => { e.currentTarget.style.background="#1c1710"; e.currentTarget.style.color="#d4a853"; }}
                                      onMouseLeave={e => { e.currentTarget.style.background="#1e1e1e"; e.currentTarget.style.color="#7a6c5a"; }}>
                                      <EditIcon /> Edit
                                    </button>
                                    <button onClick={() => trashArticle(article)}
                                      style={{ padding:"6px 11px", background:"#1e1e1e", border:"1px solid #2a2a2a", color:"#7a6c5a", borderRadius:2, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:11, fontFamily:"inherit", transition:"all 0.2s" }}
                                      onMouseEnter={e => { e.currentTarget.style.background="#2a1010"; e.currentTarget.style.color="#cc5555"; }}
                                      onMouseLeave={e => { e.currentTarget.style.background="#1e1e1e"; e.currentTarget.style.color="#7a6c5a"; }}>
                                      <TrashIcon /> Trash
                                    </button>
                                  </>
                                )}
                                {tab === STATUS.THRASH && (
                                  <>
                                    <button onClick={() => restoreArticle(article)}
                                      style={{ padding:"6px 11px", background:"#1e1e1e", border:"1px solid #2a2a2a", color:"#7a6c5a", borderRadius:2, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:11, fontFamily:"inherit", transition:"all 0.2s" }}
                                      onMouseEnter={e => { e.currentTarget.style.background="#0e1e0e"; e.currentTarget.style.color="#44aa44"; }}
                                      onMouseLeave={e => { e.currentTarget.style.background="#1e1e1e"; e.currentTarget.style.color="#7a6c5a"; }}>
                                      <RestoreIcon /> Restore
                                    </button>
                                    <button onClick={() => deleteArticle(article.id)}
                                      style={{ padding:"6px 11px", background:"#2a1010", border:"1px solid #3a1a1a", color:"#cc5555", borderRadius:2, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:11, fontFamily:"inherit" }}>
                                      <TrashIcon /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════════════ ADD NEW / EDIT ════════════ */}
          {(page === "add" || page === "edit") && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#7a6340", textTransform: "uppercase" }}>{page==="add" ? "Create" : "Update"}</div>
                <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#e0d8cc" }}>{page==="add" ? "Add New Article" : "Edit Article"}</h1>
                {page==="edit" && <div style={{ fontSize: 11, color:"#3a3020", marginTop:4 }}>ID: {editingArticle?.id}</div>}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

                {/* Title */}
                <div>
                  <label style={{ display:"block", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"#7a6340", marginBottom:8 }}>
                    Title{" "}
                    <span style={{ color: form.title.length >= 20 ? "#44aa44" : form.title.length > 0 ? "#aa8844" : "#4a3c2a", textTransform:"none", letterSpacing:0 }}>
                      ({form.title.length}/min 20)
                    </span>
                  </label>
                  <input value={form.title}
                    onChange={e => { setForm({...form, title:e.target.value}); setFormErrors(p=>({...p,title:""})); }}
                    placeholder="Enter article title (minimum 20 characters)…"
                    style={inputStyle(formErrors.title)}
                    onFocus={e => { if(!formErrors.title) e.target.style.borderColor="#d4a853"; }}
                    onBlur={e =>  { if(!formErrors.title) e.target.style.borderColor="#252525"; }} />
                  {formErrors.title && <div style={{ fontSize:12, color:"#cc4444", marginTop:5 }}>{formErrors.title}</div>}
                </div>

                {/* Category */}
                <div>
                  <label style={{ display:"block", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"#7a6340", marginBottom:8 }}>Category</label>
                  <select value={form.category}
                    onChange={e => { setForm({...form, category:e.target.value}); setFormErrors(p=>({...p,category:""})); }}
                    style={{ ...inputStyle(formErrors.category), cursor:"pointer" }}>
                    {categories.map(c => <option key={c} value={c} style={{ background:"#141414" }}>{c}</option>)}
                  </select>
                  {formErrors.category && <div style={{ fontSize:12, color:"#cc4444", marginTop:5 }}>{formErrors.category}</div>}
                </div>

                {/* Content */}
                <div>
                  <label style={{ display:"block", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:"#7a6340", marginBottom:8 }}>
                    Content{" "}
                    <span style={{ color: form.content.length >= 200 ? "#44aa44" : form.content.length > 0 ? "#aa8844" : "#4a3c2a", textTransform:"none", letterSpacing:0 }}>
                      ({form.content.length}/min 200)
                    </span>
                  </label>
                  <textarea value={form.content}
                    onChange={e => { setForm({...form, content:e.target.value}); setFormErrors(p=>({...p,content:""})); }}
                    placeholder="Write your article content here (minimum 200 characters)…"
                    rows={13}
                    style={{ ...inputStyle(formErrors.content), resize:"vertical", lineHeight:1.75 }}
                    onFocus={e => { if(!formErrors.content) e.target.style.borderColor="#d4a853"; }}
                    onBlur={e =>  { if(!formErrors.content) e.target.style.borderColor="#252525"; }} />
                  {formErrors.content && <div style={{ fontSize:12, color:"#cc4444", marginTop:5 }}>{formErrors.content}</div>}
                </div>

                {/* Action buttons */}
                <div style={{ display:"flex", gap:12, paddingTop:4 }}>
                  <button disabled={submitting}
                    onClick={() => page==="add" ? addArticle(STATUS.PUBLISH) : saveEdit(STATUS.PUBLISH)}
                    style={{ padding:"12px 28px", background:submitting?"#7a5c28":"#d4a853", border:"none", color:"#0c0c0c", fontFamily:"inherit", fontSize:10, letterSpacing:2, textTransform:"uppercase", cursor:submitting?"not-allowed":"pointer", borderRadius:2, fontWeight:700, display:"flex", alignItems:"center", gap:8, transition:"all 0.2s" }}>
                    {submitting && <SpinnerIcon />} Publish
                  </button>
                  <button disabled={submitting}
                    onClick={() => page==="add" ? addArticle(STATUS.DRAFT) : saveEdit(STATUS.DRAFT)}
                    style={{ padding:"12px 28px", background:"transparent", border:"1px solid #2e2e2e", color:submitting?"#3a3020":"#8a7c6a", fontFamily:"inherit", fontSize:10, letterSpacing:2, textTransform:"uppercase", cursor:submitting?"not-allowed":"pointer", borderRadius:2, display:"flex", alignItems:"center", gap:8, transition:"all 0.2s" }}>
                    {submitting && <SpinnerIcon />} Save as Draft
                  </button>
                  <button onClick={() => setPage("posts")}
                    style={{ padding:"12px 18px", background:"transparent", border:"none", color:"#3a3020", fontFamily:"inherit", fontSize:10, letterSpacing:2, textTransform:"uppercase", cursor:"pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ PREVIEW ════════════ */}
          {page === "preview" && (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#7a6340", textTransform: "uppercase" }}>Published</div>
                <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#e0d8cc" }}>Blog Preview</h1>
                <div style={{ fontSize: 11, color: "#3a3020", marginTop: 4 }}>{publishedArticles.length} published articles</div>
              </div>

              {loading ? (
                <div style={{ display:"flex", justifyContent:"center", padding:"60px 0", color:"#3a3020" }}><SpinnerIcon /></div>
              ) : publishedArticles.length === 0 ? (
                <div style={{ textAlign:"center", padding:"80px 0", color:"#2a2018", fontSize:12, letterSpacing:1 }}>No published articles yet.</div>
              ) : previewArticle ? (
                /* ── Full article ── */
                <div style={{ maxWidth: 680 }}>
                  <button onClick={() => setPreviewArticle(null)}
                    style={{ background:"none", border:"none", color:"#7a6340", cursor:"pointer", fontFamily:"inherit", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:32, padding:0 }}>
                    ← Back to List
                  </button>
                  <div style={{ marginBottom:10 }}>
                    <span style={{ fontSize:9, letterSpacing:3, background:"#1c1710", color:"#d4a853", padding:"3px 10px", textTransform:"uppercase" }}>{previewArticle.category}</span>
                  </div>
                  <h2 style={{ fontSize:32, fontWeight:700, color:"#e0d8cc", margin:"14px 0 24px", lineHeight:1.2 }}>{previewArticle.title}</h2>
                  <div style={{ height:1, background:"linear-gradient(to right,#d4a853,transparent)", marginBottom:32 }} />
                  {previewArticle.created_date && (
                    <div style={{ fontSize:10, color:"#3a3020", letterSpacing:1, textTransform:"uppercase", marginBottom:20 }}>
                      {new Date(previewArticle.created_date).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}
                    </div>
                  )}
                  <p style={{ fontSize:16, lineHeight:1.9, color:"#a09070", whiteSpace:"pre-wrap" }}>{previewArticle.content}</p>
                </div>
              ) : (
                /* ── Card list ── */
                <div>
                  {currentPreview.map(article => (
                    <div key={article.id}
                      onClick={() => setPreviewArticle(article)}
                      style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:2, padding:"28px 30px", marginBottom:18, cursor:"pointer", transition:"border-color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor="#2a2010"}
                      onMouseLeave={e => e.currentTarget.style.borderColor="#1e1e1e"}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                        <span style={{ fontSize:9, letterSpacing:3, background:"#1c1710", color:"#d4a853", padding:"3px 9px", textTransform:"uppercase" }}>{article.category}</span>
                        {article.created_date && (
                          <span style={{ fontSize:10, color:"#2e2416", letterSpacing:0.5 }}>
                            {new Date(article.created_date).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize:22, fontWeight:700, color:"#e0d8cc", margin:"0 0 10px", lineHeight:1.2 }}>{article.title}</h2>
                      <p style={{ fontSize:14, lineHeight:1.7, color:"#4a3c2a", margin:"0 0 14px" }}>
                        {article.content.substring(0,160)}{article.content.length>160?"…":""}
                      </p>
                      <span style={{ fontSize:10, letterSpacing:2, color:"#d4a853", textTransform:"uppercase" }}>Read More →</span>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPreviewPages > 1 && (
                    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6, marginTop:36 }}>
                      <button onClick={() => setPreviewPage(p=>Math.max(1,p-1))} disabled={previewPage===1}
                        style={{ padding:"8px 16px", background:previewPage===1?"#111":"#1c1710", border:"1px solid #1e1e1e", color:previewPage===1?"#1e1810":"#d4a853", cursor:previewPage===1?"default":"pointer", fontFamily:"inherit", fontSize:11, borderRadius:2 }}>
                        ← Prev
                      </button>
                      {Array.from({length:totalPreviewPages},(_,i)=>i+1).map(n=>(
                        <button key={n} onClick={()=>setPreviewPage(n)}
                          style={{ padding:"8px 13px", background:n===previewPage?"#d4a853":"#111", border:"1px solid #1e1e1e", color:n===previewPage?"#0c0c0c":"#4a3c2a", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:n===previewPage?700:400, borderRadius:2 }}>
                          {n}
                        </button>
                      ))}
                      <button onClick={()=>setPreviewPage(p=>Math.min(totalPreviewPages,p+1))} disabled={previewPage===totalPreviewPages}
                        style={{ padding:"8px 16px", background:previewPage===totalPreviewPages?"#111":"#1c1710", border:"1px solid #1e1e1e", color:previewPage===totalPreviewPages?"#1e1810":"#d4a853", cursor:previewPage===totalPreviewPages?"default":"pointer", fontFamily:"inherit", fontSize:11, borderRadius:2 }}>
                        Next →
                      </button>
                    </div>
                  )}
                  <div style={{ textAlign:"center", marginTop:12, fontSize:10, color:"#2a2018" }}>
                    Page {previewPage} of {totalPreviewPages} · {publishedArticles.length} articles
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <Toast toast={toast} />
    </>
  );
}
