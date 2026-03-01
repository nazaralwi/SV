import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "http://127.0.0.1:8080";
const ARTICLES_PER_PAGE = 10;

// ─── API LAYER ────────────────────────────────────────────────────────────────
const api = {
  getAll: async (limit = 200, offset = 0) => {
    const res = await fetch(`${BASE_URL}/article/${limit}/${offset}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
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
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/article/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  },
  health: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  },
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STATUS = { PUBLISH: "publish", DRAFT: "draft", THRASH: "thrash" };
const CATEGORIES = ["Teknologi","Pemrograman","Database","DevOps","Arsitektur","Tools","Keamanan","Desain","Tutorial","Lifestyle","Bisnis"];

const norm   = (s = "") => s.toLowerCase().trim();
const byTab  = (list, s) => list.filter(a => norm(a.status) === s);

// ─── COLOR TOKENS ─────────────────────────────────────────────────────────────
// Background layers
const C = {
  bg:          "#0a0a0a",
  bgSidebar:   "#0d0d0d",
  bgCard:      "#111111",
  bgInput:     "#141414",
  bgHover:     "#181510",

  // Borders
  border:      "#242424",
  borderLight: "#1c1c1c",

  // Text — clear hierarchy
  textPrimary:   "#e8dfc8",   // headings, titles
  textSecondary: "#a89880",   // body, descriptions
  textMuted:     "#6a5e4e",   // meta info, dates, IDs
  textDim:       "#3d3428",   // placeholders, disabled

  // Accent (amber/gold)
  accent:      "#d4a853",
  accentHover: "#e8c070",
  accentDim:   "#4a3a1a",
  accentBg:    "#1e1608",

  // Status colors
  green:       "#5aaa5a",
  greenBg:     "#0d1f0d",
  greenBorder: "#1a3a1a",

  amber:       "#d4a853",
  amberBg:     "#1e1608",
  amberBorder: "#3a2a10",

  red:         "#cc5555",
  redBg:       "#1a0808",
  redBorder:   "#3a1010",

  // Labels / badges
  labelText:   "#c8b896",   // category labels
  labelBg:     "#1c1508",
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Trash   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6M14,11v6M9,6V4h6v2"/></svg>;
const Edit    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11,4H4a2,2,0,0,0-2,2V18a2,2,0,0,0,2,2H16a2,2,0,0,0,2-2V11"/><path d="M18.5,2.5a2.121,2.121,0,0,1,3,3L12,15l-4,1,1-4Z"/></svg>;
const Restore = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10"/><path d="M3.51,15a9,9,0,1,0,.49-4.95"/></svg>;
const Plus    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const Eye     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const Rows    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const Spin    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin .7s linear infinite"}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
const Warn    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const Ok      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>;
const Refresh = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    publish: [C.greenBg, C.greenBorder, C.green,  "Published"],
    draft:   [C.amberBg, C.amberBorder, C.amber,  "Draft"],
    thrash:  [C.redBg,   C.redBorder,   C.red,    "Trashed"],
  };
  const [bg, border, color, label] = map[norm(status)] ?? ["#111", "#222", "#666", status];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:bg, color, padding:"3px 10px", borderRadius:4, fontSize:10, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"inherit", border:`1px solid ${border}` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:color, flexShrink:0 }} />
      {label}
    </span>
  );
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  const err = toast.type === "error";
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background: err ? C.redBg : C.greenBg, border:`1px solid ${err ? C.redBorder : C.greenBorder}`, borderRadius:6, padding:"12px 18px", display:"flex", alignItems:"center", gap:10, color:err ? "#ff9999" : "#88cc88", fontSize:13, fontFamily:"'EB Garamond',Georgia,serif", boxShadow:"0 12px 40px rgba(0,0,0,.75)", maxWidth:400, animation:"slideUp .25s ease" }}>
      {err ? <Warn /> : <Ok />} {toast.message}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function App() {
  const [articles, setArticles]       = useState([]);
  const [loading,  setLoading]        = useState(true);
  const [apiError, setApiError]       = useState(null);
  const [page,     setPage]           = useState("posts");
  const [editArt,  setEditArt]        = useState(null);
  const [form,     setForm]           = useState({ title:"", content:"", category:CATEGORIES[0] });
  const [formErrs, setFormErrs]       = useState({});
  const [busy,     setBusy]           = useState(false);
  const [tab,      setTab]            = useState(STATUS.PUBLISH);
  const [prevPage, setPrevPage]       = useState(1);
  const [prevArt,  setPrevArt]        = useState(null);
  const [toast,    setToast]          = useState(null);
  const [online,   setOnline]         = useState(null);
  const [search,   setSearch]         = useState("");

  const say = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  const toastObj = toast ? { message: toast.msg, type: toast.type } : null;

  const fetchAll = useCallback(async () => {
    setLoading(true); setApiError(null);
    try {
      const raw = await api.getAll();
      setArticles(Array.isArray(raw) ? raw : (raw.data ?? raw.articles ?? []));
    } catch {
      setApiError(`Tidak dapat terhubung ke ${BASE_URL}. Pastikan server Flask sudah berjalan: python app.py`);
      setArticles([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    api.health().then(ok=>setOnline(ok)).catch(()=>setOnline(false));
    fetchAll();
  }, [fetchAll]);

  const published = byTab(articles, STATUS.PUBLISH);
  const totPages  = Math.max(1, Math.ceil(published.length / ARTICLES_PER_PAGE));
  const curCards  = published.slice((prevPage-1)*ARTICLES_PER_PAGE, prevPage*ARTICLES_PER_PAGE);
  const counts    = { [STATUS.PUBLISH]:byTab(articles,STATUS.PUBLISH).length, [STATUS.DRAFT]:byTab(articles,STATUS.DRAFT).length, [STATUS.THRASH]:byTab(articles,STATUS.THRASH).length };
  const listed    = byTab(articles, tab).filter(a => !search.trim() || [a.title,a.category,a.content].join(" ").toLowerCase().includes(search.toLowerCase()));

  const validate = () => {
    const e = {};
    if (!form.title.trim())           e.title   = "Judul wajib diisi.";
    else if (form.title.length < 20)  e.title   = "Judul minimal 20 karakter.";
    if (!form.content.trim())         e.content = "Konten wajib diisi.";
    else if (form.content.length<200) e.content = "Konten minimal 200 karakter.";
    if (!form.category.trim())        e.cat     = "Kategori wajib diisi.";
    return e;
  };

  const doCreate = async (status) => {
    const e = validate(); if (Object.keys(e).length) { setFormErrs(e); return; }
    setBusy(true);
    try {
      await api.create({ ...form, status });
      say(status===STATUS.PUBLISH ? "Artikel berhasil dipublikasikan!" : "Artikel disimpan sebagai draft.");
      setForm({ title:"", content:"", category:CATEGORIES[0] }); setFormErrs({});
      await fetchAll(); setPage("posts"); setTab(status);
    } catch(err) { say(err?.errors?.join(" ") ?? err?.error ?? "Gagal membuat artikel.", "error"); }
    finally { setBusy(false); }
  };

  const doUpdate = async (status) => {
    const e = validate(); if (Object.keys(e).length) { setFormErrs(e); return; }
    setBusy(true);
    try {
      await api.update(editArt.id, { ...form, status });
      say("Artikel berhasil diperbarui."); setFormErrs({});
      await fetchAll(); setPage("posts"); setTab(status);
    } catch(err) { say(err?.errors?.join(" ") ?? err?.error ?? "Gagal update.", "error"); }
    finally { setBusy(false); }
  };

  const doTrash   = async (a) => { try { await api.update(a.id,{...a,status:STATUS.THRASH}); say("Dipindahkan ke Trash."); await fetchAll(); } catch { say("Gagal.","error"); } };
  const doRestore = async (a) => { try { await api.update(a.id,{...a,status:STATUS.DRAFT});  say("Dikembalikan ke Draft."); await fetchAll(); } catch { say("Gagal.","error"); } };
  const doDelete  = async (id) => {
    if (!window.confirm("Hapus permanen? Tidak bisa dibatalkan.")) return;
    try { await api.delete(id); say("Dihapus permanen."); await fetchAll(); } catch { say("Gagal hapus.","error"); }
  };
  const openEdit = (a) => { setEditArt(a); setForm({title:a.title,content:a.content,category:a.category}); setFormErrs({}); setPage("edit"); };

  const nav = (k) => { setPage(k); setFormErrs({}); setSearch(""); if(k==="preview"){setPrevPage(1);setPrevArt(null);} if(k==="add") setForm({title:"",content:"",category:CATEGORIES[0]}); };

  const inp = (err) => ({ width:"100%", padding:"11px 14px", background:C.bgInput, border:`1px solid ${err ? C.redBorder : C.border}`, borderRadius:4, color:C.textPrimary, fontSize:14, fontFamily:"'EB Garamond',Georgia,serif", outline:"none", boxSizing:"border-box", lineHeight:1.6, transition:"border-color .2s" });
  const navBtns = [{ k:"posts",label:"All Posts",I:Rows },{ k:"add",label:"Add New",I:Plus },{ k:"preview",label:"Preview",I:Eye }];
  const tabs    = [{ k:STATUS.PUBLISH,l:"Published" },{ k:STATUS.DRAFT,l:"Drafts" },{ k:STATUS.THRASH,l:"Trashed" }];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadein  { from{opacity:0} to{opacity:1} }
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0a}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0a0a0a}
        ::-webkit-scrollbar-thumb{background:#2a2010;border-radius:4px}
        input::placeholder,textarea::placeholder{color:#3d3428}
        input:focus,textarea:focus,select:focus{border-color:#d4a853!important;outline:none}
        select option{background:#141414;color:#e8dfc8}
        tr:hover td{background:#141210!important}
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'EB Garamond',Georgia,serif", background:C.bg, color:C.textSecondary }}>

        {/* SIDEBAR */}
        <aside style={{ width:215, background:C.bgSidebar, borderRight:`1px solid ${C.borderLight}`, display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh" }}>

          {/* Brand */}
          <div style={{ padding:"26px 20px 22px", borderBottom:`1px solid ${C.borderLight}` }}>
            <div style={{ fontSize:8, letterSpacing:5, color:C.accentDim, textTransform:"uppercase", marginBottom:5 }}>Editorial</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:C.textPrimary, lineHeight:1.1 }}>Ink & Quill</div>
            <div style={{ fontSize:8, letterSpacing:3, color:C.textDim, textTransform:"uppercase", marginTop:4 }}>Dashboard</div>

            {/* Server dot */}
            <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:7, padding:"7px 10px", background:"#111", borderRadius:4, border:`1px solid ${C.borderLight}` }}>
              <span style={{ width:7, height:7, borderRadius:"50%", flexShrink:0,
                background: online===null ? "#6a5428" : online ? C.green : C.red,
                boxShadow: online===null ? "none" : online ? `0 0 6px ${C.green}` : `0 0 6px ${C.red}` }} />
              <span style={{ fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
                color: online===null ? C.textMuted : online ? C.green : C.red }}>
                {online===null ? "Checking…" : online ? "Online" : "Offline"}
              </span>
              <span style={{ marginLeft:"auto", fontSize:9, color:C.textMuted, fontFamily:"monospace" }}>:8080</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding:"8px 0", flex:1 }}>
            {navBtns.map(({ k, label, I }) => {
              const active = page===k || (page==="edit" && k==="posts");
              return (
                <button key={k} onClick={() => nav(k)} style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"10px 20px", background:active ? C.accentBg : "transparent", color:active ? C.accent : C.textMuted, border:"none", borderLeft:`2px solid ${active ? C.accent : "transparent"}`, textAlign:"left", cursor:"pointer", fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"inherit", transition:"all .15s" }}>
                  <I /> {label}
                </button>
              );
            })}
            <div style={{ height:1, background:C.borderLight, margin:"8px 20px" }} />
            <button onClick={fetchAll} style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"10px 20px", background:"transparent", color:C.textMuted, border:"none", borderLeft:"2px solid transparent", cursor:"pointer", fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"inherit", transition:"color .15s" }}
              onMouseEnter={e=>e.currentTarget.style.color=C.textSecondary}
              onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>
              {loading?<Spin />:<Refresh />} Refresh
            </button>
          </nav>

          {/* Stats */}
          <div style={{ padding:"16px 20px", borderTop:`1px solid ${C.borderLight}` }}>
            {[[STATUS.PUBLISH, C.green],[STATUS.DRAFT, C.amber],[STATUS.THRASH, C.red]].map(([s,c])=>(
              <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:9, letterSpacing:1.5, textTransform:"uppercase", color:C.textMuted }}>{s}</span>
                <span style={{ fontSize:14, color:c, fontFamily:"'Playfair Display',serif", fontWeight:700 }}>{counts[s]}</span>
              </div>
            ))}
            <div style={{ marginTop:10, fontSize:9, color:C.textDim, fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{BASE_URL}</div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex:1, padding:"40px 48px", overflowY:"auto", minWidth:0 }}>

          {/* Error banner */}
          {apiError && !loading && (
            <div style={{ background:C.redBg, border:`1px solid ${C.redBorder}`, borderRadius:6, padding:"16px 20px", marginBottom:28, display:"flex", gap:12 }}>
              <div style={{ color:C.red, flexShrink:0, marginTop:2 }}><Warn /></div>
              <div>
                <div style={{ fontSize:13, color:"#ff7777", fontWeight:600, marginBottom:6, fontFamily:"'Playfair Display',serif" }}>Koneksi API Gagal</div>
                <div style={{ fontSize:13, color:"#c07070", lineHeight:1.7 }}>{apiError}</div>
                <button onClick={fetchAll} style={{ marginTop:10, fontSize:10, letterSpacing:2, textTransform:"uppercase", background:"none", border:`1px solid ${C.redBorder}`, color:C.red, cursor:"pointer", padding:"6px 14px", fontFamily:"inherit", borderRadius:4 }}>Coba Lagi</button>
              </div>
            </div>
          )}

          {/* ════ ALL POSTS ════ */}
          {page==="posts" && (
            <div style={{ animation:"fadein .3s ease" }}>
              <div style={{ marginBottom:28, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                <div>
                  <div style={{ fontSize:9, letterSpacing:4, color:C.accentDim, textTransform:"uppercase", marginBottom:5 }}>Kelola</div>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, color:C.textPrimary }}>All Posts</h1>
                  {!loading&&!apiError&&<div style={{ fontSize:12, color:C.textMuted, marginTop:5 }}>{articles.length} artikel</div>}
                </div>
                <button onClick={() => nav("add")} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", background:C.accent, border:"none", color:"#0c0c0c", borderRadius:4, cursor:"pointer", fontFamily:"inherit", fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.accentHover}
                  onMouseLeave={e=>e.currentTarget.style.background=C.accent}>
                  <Plus /> Tambah
                </button>
              </div>

              {/* Tabs + search */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.border}`, marginBottom:20 }}>
                <div style={{ display:"flex" }}>
                  {tabs.map(({ k, l }) => {
                    const active = tab===k;
                    const badgeColor = k===STATUS.PUBLISH ? C.green : k===STATUS.DRAFT ? C.amber : C.red;
                    return (
                      <button key={k} onClick={() => { setTab(k); setSearch(""); }} style={{ padding:"10px 18px", background:"none", border:"none", borderBottom:active ? `2px solid ${C.accent}` : "2px solid transparent", color:active ? C.accent : C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:11, letterSpacing:1.5, textTransform:"uppercase", marginBottom:-1, display:"flex", alignItems:"center", gap:7, transition:"all .15s" }}>
                        {l}
                        <span style={{ fontSize:10, background: active ? C.accent : C.bgCard, color: active ? "#0c0c0c" : badgeColor, borderRadius:10, padding:"1px 7px", border: active ? "none" : `1px solid ${C.border}`, fontWeight:active?700:400 }}>{counts[k]}</span>
                      </button>
                    );
                  })}
                </div>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari artikel…"
                  style={{ width:200, padding:"7px 12px", background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:4, color:C.textPrimary, fontSize:12, fontFamily:"inherit", outline:"none", transition:"border-color .2s" }}
                  onFocus={e=>e.target.style.borderColor=C.accent}
                  onBlur={e=>e.target.style.borderColor=C.border} />
              </div>

              {loading && <div style={{ display:"flex", justifyContent:"center", padding:"80px 0", color:C.textMuted }}><Spin /></div>}

              {!loading && (
                <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:6, overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ borderBottom:`1px solid ${C.border}`, background:"#0f0f0f" }}>
                        {["ID","Judul","Kategori","Status","Tanggal","Aksi"].map(h=>(
                          <th key={h} style={{ padding:"11px 15px", textAlign:"left", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:C.textMuted, fontWeight:600, fontFamily:"inherit", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listed.length===0 ? (
                        <tr><td colSpan={6} style={{ padding:"56px 15px", textAlign:"center", color:C.textMuted, fontSize:13, letterSpacing:1 }}>{search?`Tidak ada hasil untuk "${search}"`:"Tidak ada artikel"}</td></tr>
                      ) : listed.map(a => (
                        <tr key={a.id} style={{ borderBottom:`1px solid ${C.borderLight}` }}>
                          <td style={{ padding:"12px 15px", color:C.textMuted, fontSize:11, fontFamily:"monospace" }}>#{a.id}</td>
                          <td style={{ padding:"12px 15px", maxWidth:260 }}>
                            <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:C.textPrimary, fontSize:14 }}>{a.title}</div>
                            <div style={{ fontSize:11, color:C.textMuted, marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.content.substring(0,65)}…</div>
                          </td>
                          <td style={{ padding:"12px 15px" }}>
                            <span style={{ fontSize:9, letterSpacing:1.5, background:C.labelBg, color:C.accent, padding:"3px 9px", borderRadius:3, textTransform:"uppercase", border:`1px solid ${C.accentDim}` }}>{a.category}</span>
                          </td>
                          <td style={{ padding:"12px 15px" }}><Badge status={a.status} /></td>
                          <td style={{ padding:"12px 15px", fontSize:11, color:C.textMuted, whiteSpace:"nowrap" }}>
                            {a.created_date ? new Date(a.created_date).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                          </td>
                          <td style={{ padding:"12px 15px" }}>
                            <div style={{ display:"flex", gap:5 }}>
                              {tab!==STATUS.THRASH && (
                                <>
                                  <button onClick={()=>openEdit(a)} style={{ padding:"5px 10px", background:C.bgInput, border:`1px solid ${C.border}`, color:C.textSecondary, borderRadius:3, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11, fontFamily:"inherit", transition:"all .15s" }}
                                    onMouseEnter={e=>{e.currentTarget.style.background=C.accentBg;e.currentTarget.style.color=C.accent;e.currentTarget.style.borderColor=C.accentDim;}}
                                    onMouseLeave={e=>{e.currentTarget.style.background=C.bgInput;e.currentTarget.style.color=C.textSecondary;e.currentTarget.style.borderColor=C.border;}}><Edit /> Edit</button>
                                  <button onClick={()=>doTrash(a)} style={{ padding:"5px 10px", background:C.bgInput, border:`1px solid ${C.border}`, color:C.textSecondary, borderRadius:3, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11, fontFamily:"inherit", transition:"all .15s" }}
                                    onMouseEnter={e=>{e.currentTarget.style.background=C.redBg;e.currentTarget.style.color=C.red;e.currentTarget.style.borderColor=C.redBorder;}}
                                    onMouseLeave={e=>{e.currentTarget.style.background=C.bgInput;e.currentTarget.style.color=C.textSecondary;e.currentTarget.style.borderColor=C.border;}}><Trash /> Trash</button>
                                </>
                              )}
                              {tab===STATUS.THRASH && (
                                <>
                                  <button onClick={()=>doRestore(a)} style={{ padding:"5px 10px", background:C.greenBg, border:`1px solid ${C.greenBorder}`, color:C.green, borderRadius:3, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11, fontFamily:"inherit" }}><Restore /> Restore</button>
                                  <button onClick={()=>doDelete(a.id)} style={{ padding:"5px 10px", background:C.redBg, border:`1px solid ${C.redBorder}`, color:C.red, borderRadius:3, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11, fontFamily:"inherit" }}><Trash /> Hapus</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════ FORM ADD / EDIT ════ */}
          {(page==="add"||page==="edit") && (
            <div style={{ maxWidth:660, animation:"fadein .3s ease" }}>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:9, letterSpacing:4, color:C.accentDim, textTransform:"uppercase", marginBottom:5 }}>{page==="add"?"Buat Baru":"Perbarui"}</div>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, color:C.textPrimary }}>{page==="add"?"Tambah Artikel":"Edit Artikel"}</h1>
                {page==="edit"&&<div style={{ fontSize:12, color:C.textMuted, marginTop:5 }}>ID: {editArt?.id}</div>}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                {/* Title */}
                <div>
                  <label style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:C.textMuted, marginBottom:8 }}>
                    <span>Judul</span>
                    <span style={{ color:form.title.length>=20 ? C.green : form.title.length>0 ? C.amber : C.textDim, textTransform:"none", letterSpacing:0, fontSize:11 }}>{form.title.length} / min 20</span>
                  </label>
                  <input value={form.title} onChange={e=>{setForm({...form,title:e.target.value});setFormErrs(p=>({...p,title:""}));}} placeholder="Judul artikel (minimal 20 karakter)…" style={inp(formErrs.title)} />
                  {formErrs.title&&<div style={{ fontSize:12, color:C.red, marginTop:5 }}>{formErrs.title}</div>}
                </div>

                {/* Category */}
                <div>
                  <label style={{ display:"block", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:C.textMuted, marginBottom:8 }}>Kategori</label>
                  <select value={form.category} onChange={e=>{setForm({...form,category:e.target.value});setFormErrs(p=>({...p,cat:""}));}} style={{ ...inp(formErrs.cat), cursor:"pointer" }}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrs.cat&&<div style={{ fontSize:12, color:C.red, marginTop:5 }}>{formErrs.cat}</div>}
                </div>

                {/* Content */}
                <div>
                  <label style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:9, letterSpacing:3, textTransform:"uppercase", color:C.textMuted, marginBottom:8 }}>
                    <span>Konten</span>
                    <span style={{ color:form.content.length>=200 ? C.green : form.content.length>0 ? C.amber : C.textDim, textTransform:"none", letterSpacing:0, fontSize:11 }}>{form.content.length} / min 200</span>
                  </label>
                  <textarea value={form.content} onChange={e=>{setForm({...form,content:e.target.value});setFormErrs(p=>({...p,content:""}));}} placeholder="Tulis konten artikel (minimal 200 karakter)…" rows={11} style={{ ...inp(formErrs.content), resize:"vertical", lineHeight:1.8 }} />
                  {formErrs.content&&<div style={{ fontSize:12, color:C.red, marginTop:5 }}>{formErrs.content}</div>}
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:10, paddingTop:4, flexWrap:"wrap" }}>
                  <button disabled={busy} onClick={()=>page==="add"?doCreate(STATUS.PUBLISH):doUpdate(STATUS.PUBLISH)}
                    style={{ padding:"10px 22px", background:busy?"#6a5428":C.accent, border:"none", color:"#0c0c0c", fontFamily:"inherit", fontSize:11, letterSpacing:2, textTransform:"uppercase", cursor:busy?"not-allowed":"pointer", borderRadius:4, fontWeight:700, display:"flex", alignItems:"center", gap:7 }}>
                    {busy&&<Spin />} Publish
                  </button>
                  <button disabled={busy} onClick={()=>page==="add"?doCreate(STATUS.DRAFT):doUpdate(STATUS.DRAFT)}
                    style={{ padding:"10px 22px", background:"transparent", border:`1px solid ${C.border}`, color:busy?C.textDim:C.textSecondary, fontFamily:"inherit", fontSize:11, letterSpacing:2, textTransform:"uppercase", cursor:busy?"not-allowed":"pointer", borderRadius:4, display:"flex", alignItems:"center", gap:7 }}>
                    {busy&&<Spin />} Draft
                  </button>
                  <button onClick={()=>setPage("posts")} style={{ padding:"10px 14px", background:"transparent", border:"none", color:C.textMuted, fontFamily:"inherit", fontSize:11, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", borderRadius:4 }}>Batal</button>
                </div>
              </div>
            </div>
          )}

          {/* ════ PREVIEW ════ */}
          {page==="preview" && (
            <div style={{ animation:"fadein .3s ease" }}>
              <div style={{ marginBottom:32 }}>
                <div style={{ fontSize:9, letterSpacing:4, color:C.accentDim, textTransform:"uppercase", marginBottom:5 }}>Publik</div>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, color:C.textPrimary }}>Blog Preview</h1>
                <div style={{ fontSize:12, color:C.textMuted, marginTop:5 }}>{published.length} artikel dipublikasikan</div>
              </div>

              {loading ? (
                <div style={{ display:"flex", justifyContent:"center", padding:"80px 0", color:C.textMuted }}><Spin /></div>
              ) : published.length===0 ? (
                <div style={{ textAlign:"center", padding:"80px 0", color:C.textMuted, fontSize:13 }}>Belum ada artikel yang dipublikasikan.</div>
              ) : prevArt ? (
                <div style={{ maxWidth:660 }}>
                  <button onClick={()=>setPrevArt(null)} style={{ background:"none", border:"none", color:C.accent, cursor:"pointer", fontFamily:"inherit", fontSize:11, letterSpacing:2, textTransform:"uppercase", marginBottom:32, padding:0 }}>← Kembali</button>
                  <span style={{ fontSize:9, letterSpacing:3, background:C.labelBg, color:C.accent, padding:"3px 9px", textTransform:"uppercase", borderRadius:3, border:`1px solid ${C.accentDim}` }}>{prevArt.category}</span>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:900, color:C.textPrimary, margin:"16px 0 24px", lineHeight:1.15 }}>{prevArt.title}</h2>
                  <div style={{ height:1, background:`linear-gradient(to right,${C.accent},transparent)`, marginBottom:24 }} />
                  {prevArt.created_date && <div style={{ fontSize:11, color:C.textMuted, letterSpacing:1.5, textTransform:"uppercase", marginBottom:20 }}>{new Date(prevArt.created_date).toLocaleDateString("id-ID",{year:"numeric",month:"long",day:"numeric"})}</div>}
                  <p style={{ fontSize:17, lineHeight:1.95, color:C.textSecondary, whiteSpace:"pre-wrap" }}>{prevArt.content}</p>
                </div>
              ) : (
                <div>
                  {curCards.map(a => (
                    <div key={a.id} onClick={()=>setPrevArt(a)} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:6, padding:"26px 30px", marginBottom:14, cursor:"pointer", transition:"border-color .2s, background .2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accentDim;e.currentTarget.style.background=C.bgHover;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.bgCard;}}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                        <span style={{ fontSize:9, letterSpacing:3, background:C.labelBg, color:C.accent, padding:"3px 8px", textTransform:"uppercase", borderRadius:3, border:`1px solid ${C.accentDim}` }}>{a.category}</span>
                        {a.created_date&&<span style={{ fontSize:11, color:C.textMuted }}>{new Date(a.created_date).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</span>}
                      </div>
                      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:700, color:C.textPrimary, margin:"0 0 10px", lineHeight:1.2 }}>{a.title}</h2>
                      <p style={{ fontSize:14, lineHeight:1.75, color:C.textSecondary, margin:"0 0 14px" }}>{a.content.substring(0,180)}{a.content.length>180?"…":""}</p>
                      <span style={{ fontSize:10, letterSpacing:2, color:C.accent, textTransform:"uppercase" }}>Baca Selengkapnya →</span>
                    </div>
                  ))}
                  {/* Pagination */}
                  {totPages>1 && (
                    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:5, marginTop:36 }}>
                      <button onClick={()=>setPrevPage(p=>Math.max(1,p-1))} disabled={prevPage===1} style={{ padding:"7px 14px", background:prevPage===1?C.bgCard:C.accentBg, border:`1px solid ${C.border}`, color:prevPage===1?C.textDim:C.accent, cursor:prevPage===1?"default":"pointer", fontFamily:"inherit", fontSize:11, borderRadius:4 }}>←</button>
                      {Array.from({length:totPages},(_,i)=>i+1).map(n=>(
                        <button key={n} onClick={()=>setPrevPage(n)} style={{ padding:"7px 12px", background:n===prevPage?C.accent:C.bgCard, border:`1px solid ${n===prevPage?C.accent:C.border}`, color:n===prevPage?"#0c0c0c":C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:n===prevPage?700:400, borderRadius:4 }}>{n}</button>
                      ))}
                      <button onClick={()=>setPrevPage(p=>Math.min(totPages,p+1))} disabled={prevPage===totPages} style={{ padding:"7px 14px", background:prevPage===totPages?C.bgCard:C.accentBg, border:`1px solid ${C.border}`, color:prevPage===totPages?C.textDim:C.accent, cursor:prevPage===totPages?"default":"pointer", fontFamily:"inherit", fontSize:11, borderRadius:4 }}>→</button>
                    </div>
                  )}
                  <div style={{ textAlign:"center", marginTop:10, fontSize:10, color:C.textMuted }}>Halaman {prevPage} dari {totPages} · {published.length} artikel</div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <Toast toast={toastObj} />
    </>
  );
}