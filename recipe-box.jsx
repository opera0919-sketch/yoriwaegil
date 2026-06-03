import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, Plus, Clock, Check, ShoppingCart, Star, Trash2, X, Play, Pause,
  RotateCcw, ChefHat, Sparkles, Minus, Loader2, Flame, ChevronRight,
  ChevronLeft, Copy, ListChecks, Utensils, Bookmark, Pencil, ChevronDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  THEME / STYLE                                                      */
/* ------------------------------------------------------------------ */
const CSS = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.rb * { box-sizing: border-box; }
.rb {
  --bg: #F9FAFB;
  --card: #FFFFFF;
  --ink: #191F28;
  --soft: #8B95A1;
  --accent: #3182F6;
  --accent-d: #1A6EE0;
  --danger: #F04452;
  --line: #E5E8EB;
  --gold: #F8C83A;
  --font: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-family: var(--font);
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.rb h1,.rb h2,.rb h3 { font-family: var(--font); font-weight: 700; }
.rb-wrap { position:relative; z-index:1; max-width:1120px; margin:0 auto; padding:0 18px 120px; }

/* header */
.rb-top { display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:24px 0 18px; border-bottom:1px solid var(--line); margin-bottom:22px; flex-wrap:wrap; }
.rb-user-btn { display:flex; align-items:center; gap:10px; cursor:pointer;
  padding:6px 14px 6px 6px; border-radius:999px; border:1.5px solid var(--line);
  background:var(--card); transition:.16s; user-select:none; }
.rb-user-btn:hover { border-color:var(--accent); }
.rb-user-btn b { font-size:15px; font-weight:700; }
.rb-stats { display:flex; gap:22px; }
.rb-stat { text-align:right; }
.rb-stat b { font-size:22px; font-weight:700; display:block; line-height:1; }
.rb-stat span { font-size:11px; color:var(--soft); }

/* tabs */
.rb-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
.rb-tab { border:1.5px solid var(--line); background:var(--card); color:var(--soft);
  padding:9px 18px; border-radius:999px; font-size:13.5px; cursor:pointer; display:flex; gap:7px;
  align-items:center; font-family:var(--font); transition:.18s; }
.rb-tab:hover { border-color:var(--accent); color:var(--ink); }
.rb-tab.on { background:var(--accent); color:#fff; border-color:var(--accent); }
.rb-tab .pill { background:var(--danger); color:#fff; border-radius:999px; font-size:10.5px;
  padding:1px 7px; line-height:1.5; }

/* search + filter */
.rb-bar { display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
.rb-search { flex:1; min-width:200px; display:flex; align-items:center; gap:9px;
  background:var(--card); box-shadow:0 2px 10px rgba(0,0,0,.08);
  border:none; border-radius:14px; padding:0 14px; }
.rb-search input { border:0; outline:0; background:transparent; font-family:var(--font); font-size:14px;
  padding:13px 0; width:100%; color:var(--ink); }
.rb-cats-scroll { display:flex; gap:7px; overflow-x:auto; flex-wrap:nowrap;
  padding-bottom:4px; scrollbar-width:none; margin-bottom:20px; }
.rb-cats-scroll::-webkit-scrollbar { display:none; }
.rb-cat { border:1.5px solid var(--line); background:var(--card); padding:8px 14px;
  border-radius:999px; font-size:13px; cursor:pointer; transition:.16s;
  font-family:var(--font); display:flex; gap:6px; align-items:center; white-space:nowrap; }
.rb-cat:hover { border-color:var(--accent); }
.rb-cat.on { color:#fff; border-color:transparent; }
.rb-dot { width:7px; height:7px; border-radius:99px; }

/* grid */
.rb-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
.rb-card { background:var(--card); border:none; border-radius:16px; overflow:hidden;
  cursor:pointer; transition:.2s; display:flex; flex-direction:column;
  box-shadow:0 2px 12px rgba(0,0,0,.06); animation:rb-up .5s both; }
.rb-card:hover { transform:translateY(-3px); box-shadow:0 12px 28px rgba(0,0,0,.12); }
.rb-cbody { padding:16px 16px 12px; flex:1; display:flex; flex-direction:column; }
.rb-ctop { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.rb-ctitle { font-size:18px; line-height:1.25; letter-spacing:-.3px; font-weight:700; }
.rb-cdesc { font-size:12.5px; color:var(--soft); margin-top:7px; line-height:1.5;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.rb-meta { display:flex; gap:12px; margin-top:12px; font-size:11.5px; color:var(--soft); flex-wrap:wrap; }
.rb-meta span { display:flex; gap:4px; align-items:center; }
.rb-tags { display:flex; gap:5px; flex-wrap:wrap; margin-top:10px; }
.rb-tag { font-size:10.5px; color:var(--accent); background:#EBF2FF; border-radius:999px; padding:2px 9px; }
.rb-cfoot { display:flex; align-items:center; justify-content:space-between;
  padding:10px 14px; border-top:1px solid var(--line); }
.rb-cat-badge { display:inline-block; font-size:11px; font-weight:700;
  border-radius:999px; padding:2px 9px; margin-bottom:6px; }
.rb-creator { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--soft); margin-top:8px; }

/* buttons */
.rb-btn { border:1.5px solid var(--line); background:var(--card); border-radius:999px;
  padding:9px 16px; font-size:13.5px; font-family:var(--font); cursor:pointer;
  display:inline-flex; gap:7px; align-items:center; color:var(--ink); transition:.16s; }
.rb-btn:hover { border-color:var(--accent); }
.rb-btn.acc { background:var(--accent); color:#fff; border-color:transparent; }
.rb-btn.acc:hover { background:var(--accent-d); }
.rb-btn.dark { background:var(--ink); color:#F9FAFB; border-color:transparent; }
.rb-btn.ghost { background:transparent; border-color:transparent; }
.rb-btn:disabled { opacity:.5; cursor:not-allowed; }
.rb-ico { width:34px; height:34px; border-radius:999px; border:1.5px solid var(--line);
  background:var(--card); display:grid; place-items:center; cursor:pointer;
  color:var(--soft); transition:.16s; flex:none; }
.rb-ico:hover { color:var(--ink); border-color:var(--accent); }
.rb-ico.on { color:var(--gold); border-color:var(--gold); background:#FFFBE6; }
.rb-ico.cart { color:var(--accent); border-color:var(--accent); background:#EBF2FF; }

/* FAB */
.rb-fab { position:fixed; right:22px; bottom:32px; z-index:40;
  width:56px; height:56px; border-radius:999px;
  background:var(--accent); color:#fff; border:none;
  box-shadow:0 6px 20px rgba(49,130,246,.45);
  display:grid; place-items:center; cursor:pointer; transition:.18s; }
.rb-fab:hover { background:var(--accent-d); transform:scale(1.06); }

/* overlay / bottom sheet */
.rb-ov { position:fixed; inset:0; z-index:50; background:rgba(25,31,40,.45);
  backdrop-filter:blur(3px); display:flex; justify-content:center; align-items:flex-end;
  padding:0; animation:rb-fade .2s; }
.rb-sheet { background:var(--card); border-radius:24px 24px 0 0; width:100%;
  max-width:720px; margin:0 auto; box-shadow:0 -4px 40px rgba(0,0,0,.18);
  animation:rb-up-sheet .3s both; overflow:hidden; max-height:92vh;
  display:flex; flex-direction:column; }
.rb-sh-head { display:flex; justify-content:space-between; align-items:center;
  padding:18px 22px; border-bottom:1px solid var(--line); flex-shrink:0; }
.rb-sh-body { padding:22px; overflow-y:auto; flex:1; }

/* detail */
.rb-detail-top { padding:20px 22px 0; display:flex; align-items:flex-start;
  justify-content:space-between; gap:10px; }
.rb-sec-h { font-size:16px; font-weight:700; margin:24px 0 12px;
  display:flex; gap:8px; align-items:center; color:var(--ink); }
.rb-ing { display:flex; justify-content:space-between; gap:12px; padding:9px 0;
  border-bottom:1px dashed var(--line); font-size:14px; }
.rb-ing .amt { color:var(--accent); font-weight:600; white-space:nowrap; }
.rb-grp { font-size:11px; color:var(--soft); letter-spacing:.5px; margin:14px 0 2px; text-transform:uppercase; }
.rb-step { display:flex; gap:13px; padding:14px 0; border-bottom:1px solid var(--line); }
.rb-num { width:27px; height:27px; flex:none; border-radius:9px; background:var(--accent);
  color:#fff; display:grid; place-items:center; font-size:13px; font-weight:700; margin-top:1px; }
.rb-step-t { font-weight:700; font-size:15px; margin-bottom:3px; }
.rb-step-c { font-size:13.5px; color:#4A5568; line-height:1.6; }

/* timer */
.rb-timer { margin-top:11px; display:inline-flex; align-items:center; gap:10px;
  background:#F8FAFF; border:1.5px solid var(--line); border-radius:12px; padding:7px 8px 7px 14px; }
.rb-timer.run { border-color:var(--accent); background:#EBF2FF; }
.rb-tval { font-size:18px; font-weight:700; letter-spacing:.5px; min-width:62px; }
.rb-tval.warn { color:var(--danger); animation:rb-blink 1s infinite; }
.rb-tbtn { width:30px; height:30px; border-radius:999px; border:0; cursor:pointer;
  display:grid; place-items:center; background:var(--ink); color:#F9FAFB; }
.rb-tbtn.g { background:transparent; color:var(--soft); border:1.5px solid var(--line); }

/* serving */
.rb-serv { display:inline-flex; align-items:center; border:1.5px solid var(--line);
  border-radius:999px; overflow:hidden; }
.rb-serv button { width:32px; height:32px; border:0; background:transparent; cursor:pointer;
  color:var(--ink); display:grid; place-items:center; }
.rb-serv button:hover { background:#F2F4F6; }
.rb-serv b { font-weight:700; padding:0 13px; font-size:15px; }

/* fields */
.rb-field { margin-bottom:14px; }
.rb-lab { font-size:12px; color:var(--soft); margin-bottom:6px; display:block;
  font-weight:600; letter-spacing:.3px; }
.rb-in,.rb-ta,.rb-sel { width:100%; border:1.5px solid var(--line); border-radius:12px;
  background:#F9FAFB; padding:11px 13px; font-family:var(--font); font-size:14px;
  color:var(--ink); outline:0; }
.rb-in:focus,.rb-ta:focus,.rb-sel:focus { border-color:var(--accent); background:var(--card); }
.rb-ta { resize:vertical; min-height:96px; line-height:1.6; }
.rb-row { display:flex; gap:8px; align-items:center; }

/* cook mode */
.rb-cook { position:fixed; inset:0; z-index:60; background:var(--card);
  display:flex; flex-direction:column; animation:rb-fade .25s; }
.rb-cook-h { display:flex; justify-content:space-between; align-items:center;
  padding:18px 22px; border-bottom:1px solid var(--line); }
.rb-cook-b { flex:1; display:flex; flex-direction:column; justify-content:center;
  align-items:center; text-align:center; padding:24px;
  max-width:680px; margin:0 auto; width:100%; }
.rb-cook-step { font-size:12px; font-weight:700; color:var(--accent);
  letter-spacing:1.5px; text-transform:uppercase; }
.rb-cook-t { font-size:28px; font-weight:700; margin:10px 0 18px; line-height:1.2; }
.rb-cook-c { font-size:17px; line-height:1.75; color:#4A5568; }
.rb-bigtimer { font-size:62px; font-weight:700; letter-spacing:2px; margin:26px 0 10px; }
.rb-bigtimer.warn { color:var(--danger); animation:rb-blink 1s infinite; }
.rb-cook-f { display:flex; justify-content:space-between; align-items:center;
  padding:18px 22px; border-top:1px solid var(--line); }
.rb-prog { height:4px; background:var(--line); border-radius:9px; overflow:hidden; }
.rb-prog i { display:block; height:100%; background:var(--accent); transition:.4s; border-radius:9px; }

/* checkbox */
.rb-chk { display:flex; gap:9px; align-items:center; cursor:pointer; font-size:13.5px; user-select:none; }
.rb-box { width:21px; height:21px; border-radius:7px; border:1.5px solid var(--line);
  display:grid; place-items:center; background:var(--card); flex:none; transition:.15s; }
.rb-box.on { background:var(--accent); border-color:var(--accent); color:#fff; }

/* shopping */
.rb-empty { text-align:center; padding:70px 20px; color:var(--soft); }
.rb-shop-item { display:flex; align-items:center; gap:11px; padding:12px 14px;
  border-radius:12px; background:var(--card); margin-bottom:8px; transition:.15s;
  box-shadow:0 1px 6px rgba(0,0,0,.05); cursor:pointer; }
.rb-shop-item.done { opacity:.5; }
.rb-shop-item.done .nm { text-decoration:line-through; }
.rb-srcpill { display:inline-flex; align-items:center; gap:8px; background:var(--card);
  border:1.5px solid var(--line); border-radius:999px; padding:7px 8px 7px 13px; font-size:13px; }

.rb-note { background:#F2F4F6; border-radius:13px; padding:13px; }
.rb-other-notes { background:#F2F4F6; border-radius:12px; padding:12px 14px; margin-top:8px; }
.rb-other-note-item { display:flex; gap:10px; align-items:flex-start; padding:8px 0;
  border-bottom:1px solid rgba(0,0,0,.06); }
.rb-other-note-item:last-child { border-bottom:none; }

/* avatar */
.rb-avatar { width:36px; height:36px; border-radius:999px;
  display:grid; place-items:center; font-size:18px;
  border:2px solid var(--line); background:var(--card); flex:none; user-select:none; }

/* user switcher */
.rb-user-row { display:flex; align-items:center; gap:12px;
  padding:14px 0; border-bottom:1px solid var(--line); cursor:pointer; transition:.15s; }
.rb-user-row:last-child { border-bottom:none; }
.rb-user-row:hover { opacity:.75; }
.rb-user-row.active .rb-avatar { border-color:var(--accent); }

/* emoji picker */
.rb-emoji-grid { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
.rb-emoji-btn { width:42px; height:42px; border-radius:12px; border:1.5px solid var(--line);
  background:#F9FAFB; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:.15s; }
.rb-emoji-btn:hover,.rb-emoji-btn.on { border-color:var(--accent); background:#EBF2FF; }

@keyframes rb-up { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;} }
@keyframes rb-up-sheet { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;} }
@keyframes rb-fade { from{opacity:0;}to{opacity:1;} }
@keyframes rb-blink { 50%{opacity:.4;} }
.rb-spin { animation:rb-spin 1s linear infinite; }
@keyframes rb-spin { to{transform:rotate(360deg);} }
`;

/* ------------------------------------------------------------------ */
/*  CONSTANTS / HELPERS                                                */
/* ------------------------------------------------------------------ */
const CATS = ["한식", "중식", "양식", "일식", "기타"];
const CAT_COLOR = { 한식: "#BE4329", 중식: "#C98A2B", 양식: "#6F7A52", 일식: "#4A6C7A", 기타: "#8A6D8B" };
const GROUPS = ["채소", "육류·해산물", "양념·소스", "기타"];
const STORE_CURUSER_KEY = "recipebox:v1:currentUser";

const DEFAULT_USER_ID = "user_chaeyuna";
const DEFAULT_USER = { id: DEFAULT_USER_ID, name: "채유나", emoji: "🧑‍🍳", color: "#3182F6" };
const USER_COLORS = ["#3182F6","#F04452","#00B493","#F8971D","#8B5CF6","#EC4899","#14B8A6","#F59E0B"];

/* Supabase REST API (no SDK — works in all environments) */
const SUPABASE_URL = "https://fbkriifozbwuaoegmmcf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia3JpaWZvemJ3dWFvZWdtbWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTk4MTYsImV4cCI6MjA5NjAzNTgxNn0.YGktdDGIYXVvIqdSrmhkG8um-zjZtHoRhWG4EQV60HU";
const SB_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};
const sbFetch = (path, opts = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { ...SB_HEADERS, ...(opts.headers || {}) },
  });
const db = {
  select: (table) => sbFetch(table).then((r) => r.json()),
  insert: (table, data) =>
    sbFetch(table, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(data) }),
  upsert: (table, data) =>
    sbFetch(table, { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=minimal" }, body: JSON.stringify(data) }),
  update: (table, patch, id) =>
    sbFetch(`${table}?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(patch) }),
  del: (table, id) =>
    sbFetch(`${table}?id=eq.${id}`, { method: "DELETE" }),
};

/* localStorage — currentUserId만 탭별로 유지 */
const localStore = {
  loadCurrentUser: () => { try { return localStorage.getItem(STORE_CURUSER_KEY); } catch (e) { return null; } },
  saveCurrentUser: (id) => { try { localStorage.setItem(STORE_CURUSER_KEY, id); } catch (e) {} },
};

/* DB row ↔ JS object 변환 */
const toRow = (r) => ({
  id: r.id,
  category: r.category,
  title: r.title,
  description: r.description || "",
  base_servings: r.baseServings,
  total_minutes: r.totalMinutes,
  difficulty: r.difficulty,
  tags: r.tags || [],
  ingredients: r.ingredients || [],
  steps: r.steps || [],
  created_by: r.createdBy || "",
  updated_by: r.updatedBy || "",
  favorites: r.favorites || [],
  in_cart_by: r.inCartBy || [],
  notes: r.notes || {},
  cook_logs: r.cookLogs || [],
  version: r.version || 1,
});

const fromRow = (row) => ({
  id: row.id,
  category: row.category,
  title: row.title,
  description: row.description || "",
  baseServings: row.base_servings,
  totalMinutes: row.total_minutes,
  difficulty: row.difficulty,
  tags: row.tags || [],
  ingredients: row.ingredients || [],
  steps: row.steps || [],
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  favorites: row.favorites || [],
  inCartBy: row.in_cart_by || [],
  notes: row.notes || {},
  cookLogs: row.cook_logs || [],
  version: row.version || 1,
});

/* camelCase patch → snake_case DB columns */
const PATCH_MAP = {
  baseServings: "base_servings",
  totalMinutes: "total_minutes",
  createdBy: "created_by",
  updatedBy: "updated_by",
  inCartBy: "in_cart_by",
  cookLogs: "cook_logs",
};
const patchToRow = (patch) =>
  Object.fromEntries(Object.entries(patch).map(([k, v]) => [PATCH_MAP[k] || k, v]));

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => {
  if (n == null || isNaN(n)) return "";
  const r = Math.round(n * 100) / 100;
  return String(r);
};
const mmss = (s) => {
  const m = Math.floor(s / 60), x = s % 60;
  return `${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`;
};

let audioCtx = null;
const beep = () => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.28, 0.56].forEach((t) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.type = "sine"; o.frequency.value = 880;
      const now = audioCtx.currentTime + t;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.32, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      o.start(now); o.stop(now + 0.24);
    });
  } catch (e) {}
};

/* ------------------------------------------------------------------ */
/*  DATA MIGRATION                                                     */
/* ------------------------------------------------------------------ */
function migrateRecipes(recipes, uid) {
  return recipes.map((r) => {
    if (r.favorites !== undefined) return r;
    return {
      ...r,
      createdBy: uid,
      updatedBy: uid,
      favorites: r.favorite ? [uid] : [],
      inCartBy: r.inCart ? [uid] : [],
      notes: { [uid]: r.note || "" },
      cookLogs:
        r.cookCount > 0 || r.tried
          ? [{ userId: uid, count: Math.max(r.tried ? 1 : 0, r.cookCount || 0), lastCookedAt: r.lastCookedAt || null }]
          : [],
      favorite: undefined,
      inCart: undefined,
      note: undefined,
      tried: undefined,
      cookCount: undefined,
      lastCookedAt: undefined,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  SAMPLE DATA                                                        */
/* ------------------------------------------------------------------ */
const seed = () => [
  {
    id: uid(), category: "한식", title: "두찜 스타일 실비 한우곱 찜닭",
    description: "매콤한 실비 양념에 쫄깃한 한우곱창과 닭, 당면을 넣어 졸인 집밥 찜닭.",
    baseServings: 3, totalMinutes: 50, difficulty: "보통", tags: ["매운맛", "곱창", "당면"],
    createdBy: DEFAULT_USER_ID, updatedBy: DEFAULT_USER_ID,
    favorites: [DEFAULT_USER_ID], inCartBy: [],
    notes: { [DEFAULT_USER_ID]: "다음엔 청양고추 8개, 치즈 마무리." },
    cookLogs: [{ userId: DEFAULT_USER_ID, count: 2, lastCookedAt: Date.now() - 86400000 * 4 }],
    ingredients: [
      { id: uid(), name: "닭볶음탕용 닭", amount: 800, unit: "g", group: "육류·해산물" },
      { id: uid(), name: "손질된 한우곱창", amount: 300, unit: "g", group: "육류·해산물" },
      { id: uid(), name: "당면", amount: 120, unit: "g", group: "기타" },
      { id: uid(), name: "양파", amount: 1, unit: "개", group: "채소" },
      { id: uid(), name: "대파", amount: 2, unit: "대", group: "채소" },
      { id: uid(), name: "청양고추", amount: 6, unit: "개", group: "채소" },
      { id: uid(), name: "진간장", amount: 7, unit: "큰술", group: "양념·소스" },
      { id: uid(), name: "고춧가루", amount: 4, unit: "큰술", group: "양념·소스" },
      { id: uid(), name: "다진 마늘", amount: 2, unit: "큰술", group: "양념·소스" },
      { id: uid(), name: "설탕", amount: 1.5, unit: "큰술", group: "양념·소스" },
    ],
    steps: [
      { id: uid(), title: "곱창 손질·데치기", content: "밀가루·굵은소금으로 주물러 씻고, 끓는 물에 생강 한 쪽 넣어 데친 뒤 찬물에 헹군다.", timerSeconds: 240 },
      { id: uid(), title: "닭 데치기", content: "닭을 끓는 물에 데쳐 핏물·불순물을 제거하면 국물이 깔끔해진다.", timerSeconds: 180 },
      { id: uid(), title: "당면 불리기", content: "미지근한 물에 당면을 담가 부드럽게 불린다.", timerSeconds: 1800 },
      { id: uid(), title: "실비 양념 만들기", content: "간장·고춧가루·다진마늘·설탕을 섞어 매콤달콤한 양념장을 만든다.", timerSeconds: null },
      { id: uid(), title: "끓이기", content: "닭·감자·양념·물 600ml를 붓고 센 불에 끓이다 중불로 졸인다.", timerSeconds: 900 },
      { id: uid(), title: "곱창·채소 넣기", content: "곱창·양파·청양고추를 넣고 더 끓여 양념이 배게 한다.", timerSeconds: 600 },
      { id: uid(), title: "당면·마무리", content: "불린 당면과 대파를 넣고 졸인 뒤 통깨·참기름으로 마무리.", timerSeconds: 300 },
    ],
  },
  {
    id: uid(), category: "중식", title: "마파두부",
    description: "두반장과 화자오의 얼얼한 맛, 부드러운 두부의 클래식 쓰촨 요리.",
    baseServings: 2, totalMinutes: 25, difficulty: "쉬움", tags: ["매운맛", "밥도둑", "간단"],
    createdBy: DEFAULT_USER_ID, updatedBy: DEFAULT_USER_ID,
    favorites: [], inCartBy: [], notes: {}, cookLogs: [],
    ingredients: [
      { id: uid(), name: "두부", amount: 1, unit: "모", group: "기타" },
      { id: uid(), name: "다진 돼지고기", amount: 150, unit: "g", group: "육류·해산물" },
      { id: uid(), name: "대파", amount: 1, unit: "대", group: "채소" },
      { id: uid(), name: "두반장", amount: 1.5, unit: "큰술", group: "양념·소스" },
      { id: uid(), name: "굴소스", amount: 1, unit: "큰술", group: "양념·소스" },
      { id: uid(), name: "전분물", amount: 2, unit: "큰술", group: "양념·소스" },
    ],
    steps: [
      { id: uid(), title: "두부 데치기", content: "깍둑썬 두부를 소금물에 살짝 데쳐 단단하게 한다.", timerSeconds: 120 },
      { id: uid(), title: "고기 볶기", content: "기름에 다진고기와 두반장을 볶아 고소한 향을 낸다.", timerSeconds: null },
      { id: uid(), title: "조리기", content: "물과 굴소스를 넣고 두부를 넣어 끓인 뒤 전분물로 농도를 잡는다.", timerSeconds: 300 },
    ],
  },
  {
    id: uid(), category: "양식", title: "관자 베이컨 까르보나라",
    description: "달걀노른자와 페코리노로 만든 정통 크림 없는 까르보나라.",
    baseServings: 2, totalMinutes: 20, difficulty: "보통", tags: ["파스타", "면"],
    createdBy: DEFAULT_USER_ID, updatedBy: DEFAULT_USER_ID,
    favorites: [], inCartBy: [], notes: {},
    cookLogs: [{ userId: DEFAULT_USER_ID, count: 1, lastCookedAt: Date.now() - 86400000 * 12 }],
    ingredients: [
      { id: uid(), name: "스파게티", amount: 200, unit: "g", group: "기타" },
      { id: uid(), name: "베이컨(관찰레)", amount: 80, unit: "g", group: "육류·해산물" },
      { id: uid(), name: "달걀노른자", amount: 3, unit: "개", group: "기타" },
      { id: uid(), name: "페코리노 치즈", amount: 50, unit: "g", group: "기타" },
      { id: uid(), name: "통후추", amount: 1, unit: "작은술", group: "양념·소스" },
    ],
    steps: [
      { id: uid(), title: "면 삶기", content: "소금 넣은 물에 스파게티를 알덴테로 삶는다. 면수를 남겨둔다.", timerSeconds: 480 },
      { id: uid(), title: "베이컨 굽기", content: "팬에 베이컨을 바삭하게 구워 기름을 낸다.", timerSeconds: null },
      { id: uid(), title: "유화·마무리", content: "불을 끄고 노른자·치즈·면수를 섞어 크림처럼 유화시킨다.", timerSeconds: null },
    ],
  },
  {
    id: uid(), category: "일식", title: "연어 사케동",
    description: "간장에 절인 연어를 따뜻한 밥에 올린 간단한 덮밥.",
    baseServings: 1, totalMinutes: 15, difficulty: "쉬움", tags: ["덮밥", "간단", "회"],
    createdBy: DEFAULT_USER_ID, updatedBy: DEFAULT_USER_ID,
    favorites: [], inCartBy: [], notes: {}, cookLogs: [],
    ingredients: [
      { id: uid(), name: "생연어(횟감)", amount: 150, unit: "g", group: "육류·해산물" },
      { id: uid(), name: "따뜻한 밥", amount: 1, unit: "공기", group: "기타" },
      { id: uid(), name: "간장", amount: 2, unit: "큰술", group: "양념·소스" },
      { id: uid(), name: "미림", amount: 1, unit: "큰술", group: "양념·소스" },
      { id: uid(), name: "쪽파", amount: 2, unit: "대", group: "채소" },
    ],
    steps: [
      { id: uid(), title: "절임장 재우기", content: "간장·미림에 슬라이스한 연어를 넣어 냉장고에서 재운다.", timerSeconds: 600 },
      { id: uid(), title: "담기", content: "밥 위에 연어를 올리고 쪽파·깨·와사비를 곁들인다.", timerSeconds: null },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  USER AVATAR                                                        */
/* ------------------------------------------------------------------ */
function UserAvatar({ user, size = 36 }) {
  if (!user) return null;
  return (
    <div className="rb-avatar" style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {user.emoji}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  USER SWITCHER                                                      */
/* ------------------------------------------------------------------ */
const EMOJIS = ["🧑‍🍳","👩‍🍳","🧑","👦","👧","👩","👨","🧒","🧓","👴","👵","🍳"];

function UserForm({ initialName = "", initialEmoji = "🧑‍🍳", submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const handle = () => { if (name.trim()) onSubmit(name.trim(), emoji); };

  return (
    <div style={{ marginTop: 16 }}>
      <div className="rb-field">
        <label className="rb-lab">이름</label>
        <input
          className="rb-in" value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예) 민준" autoFocus
          onKeyDown={(e) => e.key === "Enter" && handle()}
        />
      </div>
      <label className="rb-lab">이모지</label>
      <div className="rb-emoji-grid">
        {EMOJIS.map((em) => (
          <button
            key={em}
            className={`rb-emoji-btn ${emoji === em ? "on" : ""}`}
            onClick={() => setEmoji(em)}
          >{em}</button>
        ))}
      </div>
      <div className="rb-row" style={{ marginTop: 16, gap: 8 }}>
        <button
          className="rb-btn acc" style={{ flex: 1, justifyContent: "center" }}
          disabled={!name.trim()} onClick={handle}
        >
          <Check size={16} /> {submitLabel}
        </button>
        <button className="rb-btn" onClick={onCancel}>취소</button>
      </div>
    </div>
  );
}

function UserSwitcher({ users, currentUserId, onSwitch, onAdd, onEdit, onDelete, onClose }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleAdd = (name, emoji) => {
    const color = USER_COLORS[users.length % USER_COLORS.length];
    onAdd({ id: uid(), name, emoji, color });
    setAdding(false);
  };
  const handleEdit = (id, name, emoji) => {
    onEdit(id, { name, emoji });
    setEditingId(null);
  };
  const handleDelete = (u) => {
    if (users.length <= 1) {
      alert("마지막 사용자는 삭제할 수 없어요.");
      return;
    }
    if (confirm(`'${u.name}' 사용자를 삭제할까요?\n공유 레시피는 그대로 남고, 이 사용자의 즐겨찾기·메모·조리 기록만 사라집니다.`))
      onDelete(u.id);
  };

  return (
    <div className="rb-ov" onClick={onClose}>
      <div className="rb-sheet" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="rb-sh-head">
          <b style={{ fontSize: 17 }}>사용자 관리</b>
          <div className="rb-ico" onClick={onClose}><X size={17} /></div>
        </div>
        <div className="rb-sh-body">
          {users.map((u) =>
            editingId === u.id ? (
              <UserForm
                key={u.id}
                initialName={u.name} initialEmoji={u.emoji} submitLabel="변경 저장"
                onSubmit={(name, emoji) => handleEdit(u.id, name, emoji)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={u.id}
                className={`rb-user-row ${u.id === currentUserId ? "active" : ""}`}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, cursor: "pointer" }}
                  onClick={() => onSwitch(u.id)}
                >
                  <UserAvatar user={u} size={44} />
                  <span style={{ flex: 1, fontWeight: u.id === currentUserId ? 700 : 400, fontSize: 15,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.name}
                  </span>
                  {u.id === currentUserId && <Check size={18} color="var(--accent)" />}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <div className="rb-ico" title="수정"
                    style={{ width: 30, height: 30 }}
                    onClick={(e) => { e.stopPropagation(); setAdding(false); setEditingId(u.id); }}>
                    <Pencil size={14} />
                  </div>
                  <div className="rb-ico" title="삭제"
                    style={{ width: 30, height: 30 }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(u); }}>
                    <Trash2 size={14} />
                  </div>
                </div>
              </div>
            )
          )}

          {adding ? (
            <UserForm
              submitLabel="추가"
              onSubmit={handleAdd}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              className="rb-btn"
              style={{ marginTop: 16, width: "100%", justifyContent: "center" }}
              onClick={() => { setEditingId(null); setAdding(true); }}
            >
              <Plus size={15} /> 새 사용자 추가
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN                                                               */
/* ------------------------------------------------------------------ */
export default function RecipeBox() {
  const [recipes, setRecipes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [tab, setTab] = useState("box");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState("default");
  const [detailId, setDetailId] = useState(null);
  const [cookId, setCookId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [timers, setTimers] = useState({});
  const [checked, setChecked] = useState({});

  const [dbError, setDbError] = useState(null);

  /* load from Supabase */
  const loadFromDb = async () => {
    try {
      const dbUsers = await db.select("app_users");
      let resolvedUsers;
      if (!Array.isArray(dbUsers) || !dbUsers.length) {
        const localUsers = (() => { try { const v = localStorage.getItem("recipebox:v1:users"); return v ? JSON.parse(v) : null; } catch { return null; } })();
        resolvedUsers = (localUsers && localUsers.length) ? localUsers : [DEFAULT_USER];
        await db.upsert("app_users", resolvedUsers);
      } else {
        resolvedUsers = dbUsers;
      }

      const resolvedCurUser = localStore.loadCurrentUser() || DEFAULT_USER_ID;

      const dbRecipes = await db.select("recipes");
      let rawRecipes;
      if (!Array.isArray(dbRecipes) || !dbRecipes.length) {
        const localData = (() => { try { const v = localStorage.getItem("recipebox:v1:recipes"); return v ? JSON.parse(v) : null; } catch { return null; } })();
        rawRecipes = (localData && localData.length) ? migrateRecipes(localData, resolvedCurUser) : seed();
        await db.upsert("recipes", rawRecipes.map(toRow));
      } else {
        rawRecipes = dbRecipes.map(fromRow);
      }

      return { resolvedUsers, resolvedCurUser, rawRecipes };
    } catch (e) {
      throw new Error(e.message || "DB 연결 실패");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { resolvedUsers, resolvedCurUser, rawRecipes } = await loadFromDb();
        if (cancelled) return;
        setUsers(resolvedUsers);
        setCurrentUserId(resolvedCurUser);
        setRecipes(rawRecipes);
      } catch (e) {
        if (!cancelled) setDbError(e.message);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* currentUserId는 탭별로 localStorage에만 저장 */
  useEffect(() => {
    if (!loaded) return;
    localStore.saveCurrentUser(currentUserId);
  }, [currentUserId, loaded]);

  /* timer tick */
  const running = Object.values(timers).some((t) => t.running);
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev }; let ch = false;
        for (const k in next) {
          if (next[k].running && next[k].remaining > 0) {
            next[k] = { ...next[k], remaining: next[k].remaining - 1 }; ch = true;
            if (next[k].remaining === 0) { next[k].running = false; beep(); }
          }
        }
        return ch ? next : prev;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [running]);

  /* helpers */
  const update = (id, patch) => {
    setRecipes((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    db.update("recipes", patchToRow(patch), id);
  };
  const remove = (id) => {
    setRecipes((r) => r.filter((x) => x.id !== id));
    setDetailId(null);
    db.del("recipes", id);
  };
  const addRecipe = (r) => {
    const recipe = {
      ...r, id: uid(),
      createdBy: currentUserId, updatedBy: currentUserId,
      favorites: [], inCartBy: [], notes: {}, cookLogs: [],
    };
    setRecipes((prev) => [recipe, ...prev]);
    db.insert("recipes", toRow(recipe));
  };
  const addUser = (user) => {
    setUsers((u) => [...u, user]);
    setCurrentUserId(user.id);
    db.insert("app_users", user);
  };
  const editUser = (id, patch) => {
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    db.update("app_users", patch, id);
  };
  const deleteUser = (id) => {
    setUsers((prev) => {
      const next = prev.filter((x) => x.id !== id);
      if (id === currentUserId) setCurrentUserId(next[0]?.id || DEFAULT_USER_ID);
      return next;
    });
    db.del("app_users", id);
  };
  const refresh = async () => {
    setLoaded(false);
    try {
      const { resolvedUsers, resolvedCurUser, rawRecipes } = await loadFromDb();
      setUsers(resolvedUsers);
      setCurrentUserId(resolvedCurUser);
      setRecipes(rawRecipes);
    } catch (e) {
      setDbError(e.message);
    } finally {
      setLoaded(true);
    }
  };

  const startTimer = (key, total) =>
    setTimers((t) => ({ ...t, [key]: { remaining: t[key]?.remaining ?? total, total, running: true } }));
  const pauseTimer = (key) =>
    setTimers((t) => (t[key] ? { ...t, [key]: { ...t[key], running: false } } : t));
  const resetTimer = (key, total) =>
    setTimers((t) => ({ ...t, [key]: { remaining: total, total, running: false } }));

  const markCooked = (id, extra = {}) => {
    const r = recipes.find((x) => x.id === id);
    if (!r) return;
    const logs = r.cookLogs || [];
    const idx = logs.findIndex((l) => l.userId === currentUserId);
    const rate = extra.rating ? { rating: extra.rating } : {};
    const memo = extra.memo ? { memo: extra.memo } : {};
    let newLogs;
    if (idx >= 0) {
      newLogs = logs.map((l, i) =>
        i === idx ? { ...l, count: l.count + 1, lastCookedAt: Date.now(), ...rate, ...memo } : l
      );
    } else {
      newLogs = [...logs, { userId: currentUserId, count: 1, lastCookedAt: Date.now(), ...rate, ...memo }];
    }
    update(id, { cookLogs: newLogs, updatedBy: currentUserId });
  };

  /* derived */
  const currentUser = users.find((u) => u.id === currentUserId) || DEFAULT_USER;

  const filtered = useMemo(() => {
    let list = recipes.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (favOnly && !r.favorites?.includes(currentUserId)) return false;
      if (q.trim()) {
        const t = (r.title + r.description + (r.tags || []).join(" ") + r.ingredients.map((i) => i.name).join(" ")).toLowerCase();
        if (!t.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    if (sort === "recent") {
      list = [...list].sort((a, b) => {
        const la = a.cookLogs?.find((l) => l.userId === currentUserId)?.lastCookedAt || 0;
        const lb = b.cookLogs?.find((l) => l.userId === currentUserId)?.lastCookedAt || 0;
        return lb - la;
      });
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, "ko"));
    }
    return list;
  }, [recipes, cat, q, favOnly, sort, currentUserId]);

  const cartRecipes = recipes.filter((r) => r.inCartBy?.includes(currentUserId));
  const triedCount = recipes.filter((r) => r.cookLogs?.some((l) => l.userId === currentUserId && l.count > 0)).length;

  const shopList = useMemo(() => {
    const map = {};
    cartRecipes.forEach((r) => {
      r.ingredients.forEach((ing) => {
        const key = `${ing.name}|${ing.unit}`;
        if (!map[key]) map[key] = { name: ing.name, unit: ing.unit, group: ing.group || "기타", amount: 0, from: [] };
        map[key].amount += Number(ing.amount) || 0;
        if (!map[key].from.includes(r.title)) map[key].from.push(r.title);
      });
    });
    const byGroup = {};
    Object.entries(map).forEach(([k, v]) => {
      (byGroup[v.group] = byGroup[v.group] || []).push({ key: k, ...v });
    });
    return byGroup;
  }, [cartRecipes]);

  const detail = recipes.find((r) => r.id === detailId);
  const cookRecipe = recipes.find((r) => r.id === cookId);

  const catCounts = useMemo(() => {
    const c = {}; recipes.forEach((r) => (c[r.category] = (c[r.category] || 0) + 1)); return c;
  }, [recipes]);

  if (!loaded)
    return (
      <div className="rb"><style>{CSS}</style>
        <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
          {dbError
            ? (
              <div style={{ textAlign: "center", padding: 32, maxWidth: 480 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Supabase 연결 오류</div>
                <div style={{ color: "#8B95A1", fontSize: 13.5, lineHeight: 1.7, marginBottom: 20 }}>{dbError}</div>
                <div style={{ background: "#F2F4F6", borderRadius: 12, padding: "14px 18px", textAlign: "left", fontSize: 13, lineHeight: 1.8 }}>
                  Supabase SQL Editor에서 아래를 실행하세요:<br />
                  <code style={{ fontSize: 12, color: "#3182F6" }}>
                    alter table recipes disable row level security;<br />
                    alter table app_users disable row level security;
                  </code>
                </div>
              </div>
            )
            : <Loader2 className="rb-spin" />}
        </div>
      </div>
    );

  return (
    <div className="rb">
      <style>{CSS}</style>
      <div className="rb-wrap">
        {/* header */}
        <header className="rb-top">
          <div className="rb-user-btn" onClick={() => setShowUserSwitcher(true)}>
            <UserAvatar user={currentUser} size={32} />
            <b>{currentUser.name}</b>
            <ChevronDown size={14} color="#8B95A1" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="rb-stats">
              <div className="rb-stat"><b>{recipes.length}</b><span>저장한 레시피</span></div>
              <div className="rb-stat"><b>{triedCount}</b><span>만들어 본 요리</span></div>
              <div className="rb-stat"><b>{cartRecipes.length}</b><span>장보기 담음</span></div>
            </div>
            <div className="rb-ico" title="새로고침" onClick={refresh}>
              <RotateCcw size={16} />
            </div>
          </div>
        </header>

        {/* tabs */}
        <div className="rb-tabs">
          <button className={`rb-tab ${tab === "box" ? "on" : ""}`} onClick={() => setTab("box")}>
            <Bookmark size={15} /> 보관함
          </button>
          <button className={`rb-tab ${tab === "cart" ? "on" : ""}`} onClick={() => setTab("cart")}>
            <ShoppingCart size={15} /> 장보기 목록
            {cartRecipes.length > 0 && <span className="pill">{cartRecipes.length}</span>}
          </button>
        </div>

        {tab === "box" && (
          <>
            <div className="rb-bar">
              <div className="rb-search">
                <Search size={17} color="#8B95A1" />
                <input placeholder="요리 이름, 재료, 태그로 검색…" value={q} onChange={(e) => setQ(e.target.value)} />
                {q && <X size={16} style={{ cursor: "pointer", color: "#8B95A1" }} onClick={() => setQ("")} />}
              </div>
              <button className="rb-btn" onClick={() => setFavOnly((v) => !v)}
                style={favOnly ? { borderColor: "var(--gold)", color: "var(--gold)" } : {}}>
                <Star size={15} fill={favOnly ? "#F8C83A" : "none"} /> 즐겨찾기
              </button>
              <select className="rb-sel" value={sort} onChange={(e) => setSort(e.target.value)}
                style={{ width: 130, flex: "none" }}>
                <option value="default">기본순</option>
                <option value="recent">최근 조리순</option>
                <option value="name">이름순</option>
              </select>
            </div>
            <div className="rb-cats-scroll">
              <button
                className={`rb-cat ${cat === "all" ? "on" : ""}`}
                style={cat === "all" ? { background: "#191F28" } : {}}
                onClick={() => setCat("all")}
              >
                전체 <span style={{ opacity: .6 }}>{recipes.length}</span>
              </button>
              {CATS.map((c) => (
                <button key={c} className={`rb-cat ${cat === c ? "on" : ""}`}
                  style={cat === c ? { background: CAT_COLOR[c] } : {}} onClick={() => setCat(c)}>
                  <span className="rb-dot" style={{ background: CAT_COLOR[c] }} /> {c}
                  <span style={{ opacity: .6 }}>{catCounts[c] || 0}</span>
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="rb-empty">
                <Utensils size={34} style={{ opacity: .4 }} /><br /><br />
                조건에 맞는 레시피가 없어요. <b>+ 버튼</b>으로 채워보세요.
              </div>
            ) : (
              <div className="rb-grid">
                {filtered.map((r, i) => {
                  const isFav = r.favorites?.includes(currentUserId);
                  const inCart = r.inCartBy?.includes(currentUserId);
                  const tried = r.cookLogs?.some((l) => l.userId === currentUserId && l.count > 0);
                  const myLog = r.cookLogs?.find((l) => l.userId === currentUserId);
                  const creator = users.find((u) => u.id === r.createdBy);
                  return (
                    <article key={r.id} className="rb-card" style={{ animationDelay: `${i * 0.04}s` }}
                      onClick={() => setDetailId(r.id)}>
                      <div className="rb-cbody">
                        <div className="rb-ctop">
                          <div style={{ flex: 1 }}>
                            <span className="rb-cat-badge"
                              style={{ color: CAT_COLOR[r.category], background: CAT_COLOR[r.category] + "18" }}>
                              {r.category}
                            </span>
                            <div className="rb-ctitle">{r.title}</div>
                          </div>
                          <div
                            className={`rb-ico ${isFav ? "on" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              update(r.id, {
                                favorites: isFav
                                  ? (r.favorites || []).filter((id) => id !== currentUserId)
                                  : [...(r.favorites || []), currentUserId],
                              });
                            }}>
                            <Star size={16} fill={isFav ? "#F8C83A" : "none"} />
                          </div>
                        </div>
                        <div className="rb-cdesc">{r.description}</div>
                        <div className="rb-meta">
                          <span><Clock size={13} /> {r.totalMinutes}분</span>
                          <span><Flame size={13} /> {r.difficulty}</span>
                          <span><Utensils size={13} /> {r.baseServings}인분</span>
                        </div>
                        {r.tags?.length > 0 && (
                          <div className="rb-tags">{r.tags.slice(0, 4).map((t) => <span key={t} className="rb-tag">#{t}</span>)}</div>
                        )}
                        {creator && creator.id !== currentUserId && (
                          <div className="rb-creator">
                            <UserAvatar user={creator} size={16} />
                            <span>{creator.name} 추가</span>
                          </div>
                        )}
                      </div>
                      <div className="rb-cfoot" onClick={(e) => e.stopPropagation()}>
                        <label className="rb-chk" onClick={() => markCookedToggle(r, update, currentUserId)}>
                          <span className={`rb-box ${tried ? "on" : ""}`}>{tried && <Check size={14} />}</span>
                          만들어 봄{myLog && myLog.count > 0 ? ` ·${myLog.count}회` : ""}
                        </label>
                        <div
                          className={`rb-ico ${inCart ? "cart" : ""}`}
                          title="장보기 목록에 담기"
                          onClick={() => update(r.id, {
                            inCartBy: inCart
                              ? (r.inCartBy || []).filter((id) => id !== currentUserId)
                              : [...(r.inCartBy || []), currentUserId],
                          })}>
                          <ShoppingCart size={16} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "cart" && (
          <ShoppingView
            cartRecipes={cartRecipes} shopList={shopList} checked={checked} setChecked={setChecked}
            onRemove={(id) => {
              const r = recipes.find((x) => x.id === id);
              if (!r) return;
              update(id, { inCartBy: (r.inCartBy || []).filter((uid) => uid !== currentUserId) });
            }}
            onClear={() => cartRecipes.forEach((r) =>
              update(r.id, { inCartBy: (r.inCartBy || []).filter((uid) => uid !== currentUserId) })
            )}
            onOpen={(id) => setDetailId(id)}
          />
        )}
      </div>

      {/* FAB */}
      <button className="rb-fab" onClick={() => setShowAdd(true)}>
        <Plus size={24} />
      </button>

      {/* detail overlay */}
      {detail && (
        <Detail
          r={detail} timers={timers} users={users} currentUserId={currentUserId}
          startTimer={startTimer} pauseTimer={pauseTimer} resetTimer={resetTimer}
          onClose={() => setDetailId(null)} update={update} remove={remove}
          markCooked={markCooked} onCook={() => { setCookId(detail.id); setDetailId(null); }}
        />
      )}

      {/* cook mode */}
      {cookRecipe && (
        <CookMode
          r={cookRecipe} timers={timers}
          startTimer={startTimer} pauseTimer={pauseTimer} resetTimer={resetTimer}
          onClose={() => setCookId(null)}
          onFinish={(rating, memo) => { markCooked(cookRecipe.id, { rating, memo }); setCookId(null); }}
        />
      )}

      {/* add modal */}
      {showAdd && (
        <AddModal
          currentUserId={currentUserId}
          onClose={() => setShowAdd(false)}
          onAdd={(r) => { addRecipe(r); setShowAdd(false); }}
        />
      )}

      {/* user switcher */}
      {showUserSwitcher && (
        <UserSwitcher
          users={users} currentUserId={currentUserId}
          onSwitch={(id) => { setCurrentUserId(id); setShowUserSwitcher(false); }}
          onAdd={addUser}
          onEdit={editUser}
          onDelete={deleteUser}
          onClose={() => setShowUserSwitcher(false)}
        />
      )}
    </div>
  );
}

function markCookedToggle(r, update, currentUserId) {
  const log = r.cookLogs?.find((l) => l.userId === currentUserId);
  const tried = log && log.count > 0;
  if (tried) {
    update(r.id, {
      cookLogs: (r.cookLogs || []).map((l) =>
        l.userId === currentUserId ? { ...l, count: 0, lastCookedAt: null } : l
      ),
    });
  } else {
    const existing = (r.cookLogs || []).filter((l) => l.userId !== currentUserId);
    update(r.id, {
      cookLogs: [...existing, { userId: currentUserId, count: Math.max(1, log?.count || 0), lastCookedAt: Date.now() }],
    });
  }
}

/* ------------------------------------------------------------------ */
/*  DETAIL                                                             */
/* ------------------------------------------------------------------ */
function Detail({ r, timers, startTimer, pauseTimer, resetTimer, onClose, update, remove, markCooked, onCook, currentUserId, users }) {
  const [servings, setServings] = useState(r.baseServings);
  const [note, setNote] = useState(r.notes?.[currentUserId] || "");
  const [editNote, setEditNote] = useState(false);
  const [showOtherNotes, setShowOtherNotes] = useState(false);
  const [editing, setEditing] = useState(false);
  const factor = servings / r.baseServings;

  const isFav = r.favorites?.includes(currentUserId);
  const inCart = r.inCartBy?.includes(currentUserId);
  const myLog = r.cookLogs?.find((l) => l.userId === currentUserId);

  const otherNotes = Object.entries(r.notes || {})
    .filter(([uid, txt]) => uid !== currentUserId && txt.trim());

  const grouped = useMemo(() => {
    const g = {}; r.ingredients.forEach((i) => (g[i.group || "기타"] = g[i.group || "기타"] || []).push(i)); return g;
  }, [r]);

  if (editing) {
    return (
      <div className="rb-ov" onClick={onClose}>
        <div className="rb-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
          <div className="rb-sh-head">
            <b style={{ fontSize: 17 }}>레시피 편집</b>
            <div className="rb-ico" onClick={() => setEditing(false)}><X size={17} /></div>
          </div>
          <div className="rb-sh-body">
            <ManualForm
              currentUserId={currentUserId} initial={r} submitLabel="변경 저장"
              onSubmit={(updated) => { update(r.id, updated); setEditing(false); }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rb-ov" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        {/* sheet header */}
        <div className="rb-sh-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <span className="rb-cat-badge"
              style={{ color: CAT_COLOR[r.category], background: CAT_COLOR[r.category] + "18", flexShrink: 0 }}>
              {r.category}
            </span>
            <b style={{ fontSize: 18, lineHeight: 1.25, letterSpacing: "-.3px", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</b>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <div className="rb-ico" title="편집" onClick={() => setEditing(true)}><Pencil size={15} /></div>
            <div
              className={`rb-ico ${isFav ? "on" : ""}`}
              onClick={() => update(r.id, {
                favorites: isFav
                  ? (r.favorites || []).filter((id) => id !== currentUserId)
                  : [...(r.favorites || []), currentUserId],
              })}>
              <Star size={16} fill={isFav ? "#F8C83A" : "none"} />
            </div>
            <div className="rb-ico" onClick={onClose}><X size={17} /></div>
          </div>
        </div>

        <div className="rb-sh-body">
          <p style={{ color: "var(--soft)", fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>{r.description}</p>

          <div className="rb-meta" style={{ fontSize: 13 }}>
            <span><Clock size={14} /> 약 {r.totalMinutes}분</span>
            <span><Flame size={14} /> {r.difficulty}</span>
            {myLog && myLog.count > 0 && <span><Check size={14} /> {myLog.count}회 요리함</span>}
            {myLog?.lastCookedAt && (
              <span style={{ color: "var(--accent)" }}>
                최근 {new Date(myLog.lastCookedAt).toLocaleDateString("ko-KR")}
              </span>
            )}
          </div>

          {myLog?.rating > 0 && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ display: "flex", gap: 1 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={15}
                    fill={n <= myLog.rating ? "#F8C83A" : "none"}
                    color={n <= myLog.rating ? "#F8C83A" : "#D0D5DD"} />
                ))}
              </span>
              {myLog.memo && <span style={{ color: "var(--soft)" }}>“{myLog.memo}”</span>}
            </div>
          )}

          <div className="rb-row" style={{ marginTop: 18, gap: 10, flexWrap: "wrap" }}>
            <button className="rb-btn dark" onClick={onCook}><Play size={15} /> 요리 모드 시작</button>
            <button className="rb-btn" onClick={() => markCooked(r.id)}><Check size={15} /> 만들었어요 +1</button>
            <button className={`rb-btn ${inCart ? "acc" : ""}`}
              onClick={() => update(r.id, {
                inCartBy: inCart
                  ? (r.inCartBy || []).filter((id) => id !== currentUserId)
                  : [...(r.inCartBy || []), currentUserId],
              })}>
              <ShoppingCart size={15} /> {inCart ? "장보기 담김" : "장보기 담기"}
            </button>
          </div>

          {/* ingredients */}
          <div className="rb-sec-h"><ListChecks size={17} /> 재료
            <div className="rb-serv" style={{ marginLeft: "auto" }}>
              <button onClick={() => setServings((s) => Math.max(1, s - 1))}><Minus size={15} /></button>
              <b>{servings}인분</b>
              <button onClick={() => setServings((s) => s + 1)}><Plus size={15} /></button>
            </div>
          </div>
          {GROUPS.filter((g) => grouped[g]).map((g) => (
            <div key={g}>
              <div className="rb-grp">{g}</div>
              {grouped[g].map((ing) => (
                <div className="rb-ing" key={ing.id}>
                  <span>{ing.name}</span>
                  <span className="amt">{fmt(ing.amount * factor)}{ing.unit}</span>
                </div>
              ))}
            </div>
          ))}

          {/* steps */}
          <div className="rb-sec-h"><ChefHat size={17} /> 조리 순서</div>
          {r.steps.map((s, i) => {
            const key = `${r.id}::${s.id}`;
            const t = timers[key];
            const total = s.timerSeconds || 0;
            const remaining = t ? t.remaining : total;
            const warn = t && t.running && remaining <= 10;
            return (
              <div className="rb-step" key={s.id}>
                <div className="rb-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="rb-step-t">{s.title}</div>
                  <div className="rb-step-c">{s.content}</div>
                  {s.timerSeconds && (
                    <div className={`rb-timer ${t?.running ? "run" : ""}`}>
                      <Clock size={15} color={t?.running ? "var(--accent)" : "var(--soft)"} />
                      <span className={`rb-tval ${warn ? "warn" : ""}`}>{mmss(remaining)}</span>
                      {t?.running
                        ? <button className="rb-tbtn" onClick={() => pauseTimer(key)}><Pause size={15} /></button>
                        : <button className="rb-tbtn" onClick={() => startTimer(key, total)}><Play size={15} /></button>}
                      <button className="rb-tbtn g" onClick={() => resetTimer(key, total)}><RotateCcw size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* note */}
          <div className="rb-sec-h"><Pencil size={16} /> 나의 메모</div>
          {editNote ? (
            <div>
              <textarea className="rb-ta" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="다음에 만들 때 바꿀 점, 가족 반응 등을 적어두세요." />
              <button className="rb-btn acc" style={{ marginTop: 8 }}
                onClick={() => {
                  update(r.id, { notes: { ...(r.notes || {}), [currentUserId]: note } });
                  setEditNote(false);
                }}>저장</button>
            </div>
          ) : (
            <div className="rb-note" onClick={() => setEditNote(true)}
              style={{ cursor: "text", color: note ? "var(--ink)" : "var(--soft)" }}>
              {note || "탭하여 메모 추가…"}
            </div>
          )}

          {/* other users' notes */}
          {otherNotes.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button
                className="rb-btn ghost" style={{ padding: "6px 0", fontSize: 12.5, color: "var(--soft)" }}
                onClick={() => setShowOtherNotes((x) => !x)}
              >
                <ChevronDown size={14} style={{ transform: showOtherNotes ? "rotate(180deg)" : "none", transition: ".2s" }} />
                다른 사용자 메모 {otherNotes.length}개
              </button>
              {showOtherNotes && (
                <div className="rb-other-notes">
                  {otherNotes.map(([uid, txt]) => {
                    const u = users.find((x) => x.id === uid);
                    return (
                      <div key={uid} className="rb-other-note-item">
                        <UserAvatar user={u || { emoji: "🧑" }} size={28} />
                        <div>
                          <div style={{ fontSize: 11, color: "var(--soft)", marginBottom: 3 }}>
                            {u?.name || "알 수 없음"}
                          </div>
                          <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{txt}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 26, textAlign: "right" }}>
            <button className="rb-btn ghost" style={{ color: "var(--danger)" }}
              onClick={() => { if (confirm("이 레시피를 삭제할까요?")) remove(r.id); }}>
              <Trash2 size={15} /> 레시피 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COOK MODE                                                          */
/* ------------------------------------------------------------------ */
function CookMode({ r, timers, startTimer, pauseTimer, resetTimer, onClose, onFinish }) {
  const [i, setI] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [rating, setRating] = useState(0);
  const [memo, setMemo] = useState("");
  const s = r.steps[i];
  const key = `${r.id}::${s.id}`;
  const t = timers[key];
  const total = s.timerSeconds || 0;
  const remaining = t ? t.remaining : total;
  const warn = t && t.running && remaining <= 10;
  const last = i === r.steps.length - 1;

  return (
    <div className="rb-cook">
      <div className="rb-cook-h">
        <div className="rb-row" style={{ gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent)",
            display: "grid", placeItems: "center", color: "#fff" }}>
            <ChefHat size={17} />
          </div>
          <b style={{ fontSize: 16 }}>{r.title}</b>
        </div>
        <div className="rb-ico" onClick={onClose}><X size={18} /></div>
      </div>

      <div className="rb-cook-b">
        {finishing ? (
          <>
            <div className="rb-cook-step">요리 완료</div>
            <div className="rb-cook-t">오늘 요리는 어땠나요?</div>
            <div style={{ display: "flex", gap: 6, margin: "10px 0 18px" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={38} style={{ cursor: "pointer" }}
                  fill={n <= rating ? "#F8C83A" : "none"}
                  color={n <= rating ? "#F8C83A" : "#D0D5DD"}
                  onClick={() => setRating(n)} />
              ))}
            </div>
            <textarea className="rb-ta" value={memo} onChange={(e) => setMemo(e.target.value)}
              placeholder="한 줄 기록 (선택) — 간 조절, 가족 반응 등을 남겨두세요."
              style={{ maxWidth: 420, minHeight: 80 }} />
          </>
        ) : (
          <>
            <div className="rb-cook-step">STEP {i + 1} / {r.steps.length}</div>
            <div className="rb-cook-t">{s.title}</div>
            <div className="rb-cook-c">{s.content}</div>

            {s.timerSeconds && (
              <>
                <div className={`rb-bigtimer ${warn ? "warn" : ""}`}>{mmss(remaining)}</div>
                <div className="rb-row" style={{ gap: 10, justifyContent: "center" }}>
                  {t?.running
                    ? <button className="rb-btn dark" onClick={() => pauseTimer(key)}><Pause size={16} /> 일시정지</button>
                    : <button className="rb-btn acc" onClick={() => startTimer(key, total)}><Play size={16} /> 타이머 시작</button>}
                  <button className="rb-btn" onClick={() => resetTimer(key, total)}><RotateCcw size={15} /> 리셋</button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {!finishing && (
        <div style={{ padding: "0 22px" }}>
          <div className="rb-prog"><i style={{ width: `${((i + 1) / r.steps.length) * 100}%` }} /></div>
        </div>
      )}
      <div className="rb-cook-f">
        {finishing ? (
          <>
            <button className="rb-btn" onClick={() => setFinishing(false)}>
              <ChevronLeft size={16} /> 뒤로
            </button>
            <button className="rb-btn acc" onClick={() => onFinish(rating, memo)}>
              <Check size={16} /> 기록하고 완료
            </button>
          </>
        ) : (
          <>
            <button className="rb-btn" disabled={i === 0} onClick={() => setI((x) => x - 1)}>
              <ChevronLeft size={16} /> 이전
            </button>
            {last
              ? <button className="rb-btn acc" onClick={() => setFinishing(true)}><Check size={16} /> 요리 완료!</button>
              : <button className="rb-btn dark" onClick={() => setI((x) => x + 1)}>다음 <ChevronRight size={16} /></button>}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SHOPPING VIEW                                                      */
/* ------------------------------------------------------------------ */
function ShoppingView({ cartRecipes, shopList, checked, setChecked, onRemove, onClear, onOpen }) {
  const total = Object.values(shopList).reduce((a, b) => a + b.length, 0);
  const doneCount = Object.values(shopList).flat().filter((x) => checked[x.key]).length;

  const copy = () => {
    let txt = "🛒 장보기 목록\n";
    GROUPS.filter((g) => shopList[g]).forEach((g) => {
      txt += `\n[${g}]\n`;
      shopList[g].forEach((x) => (txt += `- ${x.name} ${fmt(x.amount)}${x.unit}\n`));
    });
    navigator.clipboard?.writeText(txt);
  };

  if (cartRecipes.length === 0)
    return (
      <div className="rb-empty">
        <ShoppingCart size={36} style={{ opacity: .4 }} /><br /><br />
        장보기 목록이 비어 있어요.<br />
        보관함에서 <ShoppingCart size={13} style={{ verticalAlign: "middle" }} /> 아이콘을 눌러 레시피를 담으면<br />
        필요한 재료가 자동으로 합산됩니다.
      </div>
    );

  return (
    <div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 20 }}>
        {cartRecipes.map((r) => (
          <div key={r.id} className="rb-srcpill">
            <span className="rb-dot" style={{ background: CAT_COLOR[r.category] }} />
            <span style={{ cursor: "pointer" }} onClick={() => onOpen(r.id)}>{r.title}</span>
            <div className="rb-ico" style={{ width: 24, height: 24, borderRadius: 999 }} onClick={() => onRemove(r.id)}>
              <X size={13} />
            </div>
          </div>
        ))}
      </div>

      <div className="rb-row" style={{ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 22 }}>
          필요한 재료 <span style={{ color: "var(--soft)", fontSize: 14, fontFamily: "var(--font)" }}>{doneCount}/{total} 담음</span>
        </h2>
        <div className="rb-row" style={{ gap: 8 }}>
          <button className="rb-btn" onClick={copy}><Copy size={15} /> 복사</button>
          <button className="rb-btn ghost" style={{ color: "var(--danger)" }} onClick={onClear}>전체 비우기</button>
        </div>
      </div>

      {GROUPS.filter((g) => shopList[g]).map((g) => (
        <div key={g} style={{ marginBottom: 20 }}>
          <div className="rb-grp" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{g}</div>
          {shopList[g].map((x) => {
            const on = !!checked[x.key];
            return (
              <div key={x.key} className={`rb-shop-item ${on ? "done" : ""}`}
                onClick={() => setChecked((c) => ({ ...c, [x.key]: !c[x.key] }))}>
                <span className={`rb-box ${on ? "on" : ""}`}>{on && <Check size={14} />}</span>
                <span className="nm" style={{ flex: 1, fontSize: 14 }}>{x.name}</span>
                <span style={{ fontWeight: 600, color: "var(--accent)" }}>{fmt(x.amount)}{x.unit}</span>
                {x.from.length > 1 && (
                  <span style={{ fontSize: 10.5, color: "var(--soft)", background: "#EBF2FF", padding: "2px 7px", borderRadius: 999 }}>
                    {x.from.length}개 레시피
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ADD MODAL  (AI import + manual)                                    */
/* ------------------------------------------------------------------ */
function AddModal({ onClose, onAdd, currentUserId }) {
  const [mode, setMode] = useState("ai");
  return (
    <div className="rb-ov" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="rb-sh-head">
          <div className="rb-row" style={{ gap: 8 }}>
            <button className={`rb-tab ${mode === "ai" ? "on" : ""}`} onClick={() => setMode("ai")}>
              <Sparkles size={15} /> AI로 가져오기
            </button>
            <button className={`rb-tab ${mode === "manual" ? "on" : ""}`} onClick={() => setMode("manual")}>
              <Pencil size={14} /> 직접 입력
            </button>
          </div>
          <div className="rb-ico" onClick={onClose}><X size={17} /></div>
        </div>
        <div className="rb-sh-body">
          {mode === "ai"
            ? <AIImport onAdd={onAdd} currentUserId={currentUserId} />
            : <ManualForm onSubmit={onAdd} currentUserId={currentUserId} />}
        </div>
      </div>
    </div>
  );
}

function AIImport({ onAdd, currentUserId }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const run = async () => {
    if (!input.trim()) return;
    setBusy(true); setErr("");
    const sys = `너는 요리 레시피를 구조화된 JSON으로 변환하는 도구다. 사용자가 준 URL, 요리 이름, 또는 붙여넣은 레시피 텍스트를 바탕으로 레시피를 작성한다. URL이나 요리 이름만 주어지면 web_search로 신뢰할 수 있는 정보를 찾아 한국식 가정 레시피로 재구성한다. 반드시 아래 JSON만 출력하고 그 외 설명·마크다운·백틱은 절대 출력하지 마라.
{"title":string,"category":"한식"|"중식"|"양식"|"일식"|"기타","description":string(한문장),"baseServings":number,"totalMinutes":number,"difficulty":"쉬움"|"보통"|"어려움","tags":string[],"ingredients":[{"name":string,"amount":number,"unit":string,"group":"채소"|"육류·해산물"|"양념·소스"|"기타"}],"steps":[{"title":string(짧게),"content":string,"timerSeconds":number|null}]}
규칙: amount는 숫자, unit은 "g"·"개"·"큰술"·"작은술"·"대"·"모"·"공기"·"ml" 등 짧은 한국어. timerSeconds는 끓이기·삶기·재우기 등 기다림 단계에만 넣고 나머지는 null. content는 한국어로 친절하게.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: sys,
          messages: [{ role: "user", content: input }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const m = clean.match(/\{[\s\S]*\}/);
      const obj = JSON.parse(m ? m[0] : clean);
      const recipe = normalize(obj, currentUserId);
      onAdd(recipe);
    } catch (e) {
      setErr("레시피를 불러오지 못했어요. 요리 이름을 더 구체적으로 적거나, 레시피 텍스트를 붙여넣거나, '직접 입력'을 사용해 보세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: 13.5, color: "var(--soft)", lineHeight: 1.6, marginBottom: 14 }}>
        요리 이름(예: <b>알리오 올리오</b>), 레시피 <b>URL</b>, 또는 레시피 <b>전체 텍스트</b>를 붙여넣으세요.
        AI가 웹에서 찾아 재료·단계·타이머까지 자동으로 정리해 줍니다.
      </p>
      <textarea className="rb-ta" value={input} onChange={(e) => setInput(e.target.value)}
        placeholder={"예) 백종원 김치찌개\n또는 https://...\n또는 레시피 텍스트 붙여넣기"} style={{ minHeight: 130 }} />
      {err && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 8 }}>{err}</div>}
      <button className="rb-btn acc" style={{ marginTop: 14, width: "100%", justifyContent: "center", padding: 13 }}
        disabled={busy || !input.trim()} onClick={run}>
        {busy ? <><Loader2 size={16} className="rb-spin" /> 가져오는 중…</> : <><Sparkles size={16} /> AI로 정리하기</>}
      </button>
    </div>
  );
}

function normalize(obj, createdBy) {
  return {
    title: obj.title || "제목 없는 레시피",
    category: CATS.includes(obj.category) ? obj.category : "기타",
    description: obj.description || "",
    baseServings: Number(obj.baseServings) || 2,
    totalMinutes: Number(obj.totalMinutes) || 30,
    difficulty: ["쉬움", "보통", "어려움"].includes(obj.difficulty) ? obj.difficulty : "보통",
    tags: Array.isArray(obj.tags) ? obj.tags.slice(0, 6) : [],
    createdBy, updatedBy: createdBy,
    favorites: [], inCartBy: [], notes: {}, cookLogs: [],
    ingredients: (obj.ingredients || []).map((i) => ({
      id: uid(), name: i.name || "", amount: Number(i.amount) || 0,
      unit: i.unit || "", group: GROUPS.includes(i.group) ? i.group : "기타",
    })),
    steps: (obj.steps || []).map((s) => ({
      id: uid(), title: s.title || "", content: s.content || "",
      timerSeconds: s.timerSeconds ? Number(s.timerSeconds) : null,
    })),
  };
}

function ManualForm({ onSubmit, currentUserId, initial, submitLabel = "레시피 저장" }) {
  const [f, setF] = useState(initial ? {
    title: initial.title, category: initial.category, description: initial.description || "",
    baseServings: initial.baseServings, totalMinutes: initial.totalMinutes,
    difficulty: initial.difficulty, tags: (initial.tags || []).join(", "),
  } : {
    title: "", category: "한식", description: "", baseServings: 2, totalMinutes: 30, difficulty: "보통", tags: "",
  });
  const [ings, setIngs] = useState(initial && initial.ingredients?.length
    ? initial.ingredients.map((i) => ({ id: i.id || uid(), name: i.name, amount: String(i.amount), unit: i.unit, group: i.group }))
    : [{ id: uid(), name: "", amount: "", unit: "", group: "기타" }]);
  const [steps, setSteps] = useState(initial && initial.steps?.length
    ? initial.steps.map((s) => ({ id: s.id || uid(), title: s.title, content: s.content, min: s.timerSeconds ? String(Math.round(s.timerSeconds / 60)) : "" }))
    : [{ id: uid(), title: "", content: "", min: "" }]);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.title.trim()) return;
    const base = {
      ...f, baseServings: Number(f.baseServings) || 2, totalMinutes: Number(f.totalMinutes) || 30,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      ingredients: ings.filter((i) => i.name.trim()).map((i) => ({
        id: i.id, name: i.name, amount: Number(i.amount) || 0, unit: i.unit, group: i.group,
      })),
      steps: steps.filter((s) => s.content.trim() || s.title.trim()).map((s) => ({
        id: s.id, title: s.title, content: s.content, timerSeconds: s.min ? Math.round(Number(s.min) * 60) : null,
      })),
    };
    if (initial) {
      onSubmit({ ...initial, ...base, version: (initial.version || 1) + 1, updatedBy: currentUserId });
    } else {
      onSubmit({
        ...base, createdBy: currentUserId, updatedBy: currentUserId,
        favorites: [], inCartBy: [], notes: {}, cookLogs: [], version: 1,
      });
    }
  };

  return (
    <div>
      <div className="rb-field"><label className="rb-lab">요리 이름</label>
        <input className="rb-in" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="예) 엄마표 김치찌개" /></div>
      <div className="rb-row" style={{ gap: 12 }}>
        <div className="rb-field" style={{ flex: 1 }}><label className="rb-lab">카테고리</label>
          <select className="rb-sel" value={f.category} onChange={(e) => set("category", e.target.value)}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select></div>
        <div className="rb-field" style={{ width: 90 }}><label className="rb-lab">인분</label>
          <input className="rb-in" type="number" value={f.baseServings} onChange={(e) => set("baseServings", e.target.value)} /></div>
        <div className="rb-field" style={{ width: 90 }}><label className="rb-lab">분</label>
          <input className="rb-in" type="number" value={f.totalMinutes} onChange={(e) => set("totalMinutes", e.target.value)} /></div>
      </div>
      <div className="rb-field"><label className="rb-lab">난이도</label>
        <select className="rb-sel" value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
          {["쉬움","보통","어려움"].map((d) => <option key={d}>{d}</option>)}
        </select></div>
      <div className="rb-field"><label className="rb-lab">한 줄 설명</label>
        <input className="rb-in" value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="rb-field"><label className="rb-lab">태그 (쉼표로 구분)</label>
        <input className="rb-in" value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="매운맛, 간단" /></div>

      <label className="rb-lab" style={{ marginTop: 6 }}>재료</label>
      {ings.map((it) => (
        <div className="rb-row" key={it.id} style={{ gap: 6, marginBottom: 6 }}>
          <input className="rb-in" style={{ flex: 2 }} placeholder="이름" value={it.name}
            onChange={(e) => setIngs((p) => p.map((x) => x.id === it.id ? { ...x, name: e.target.value } : x))} />
          <input className="rb-in" style={{ width: 64 }} placeholder="양" value={it.amount}
            onChange={(e) => setIngs((p) => p.map((x) => x.id === it.id ? { ...x, amount: e.target.value } : x))} />
          <input className="rb-in" style={{ width: 60 }} placeholder="단위" value={it.unit}
            onChange={(e) => setIngs((p) => p.map((x) => x.id === it.id ? { ...x, unit: e.target.value } : x))} />
          <select className="rb-sel" style={{ width: 100 }} value={it.group}
            onChange={(e) => setIngs((p) => p.map((x) => x.id === it.id ? { ...x, group: e.target.value } : x))}>
            {GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
          <div className="rb-ico" onClick={() => setIngs((p) => p.filter((x) => x.id !== it.id))}><X size={14} /></div>
        </div>
      ))}
      <button className="rb-btn" style={{ marginBottom: 16 }}
        onClick={() => setIngs((p) => [...p, { id: uid(), name: "", amount: "", unit: "", group: "기타" }])}>
        <Plus size={14} /> 재료 추가</button>

      <label className="rb-lab">조리 단계</label>
      {steps.map((st, idx) => (
        <div key={st.id} style={{ marginBottom: 8, border: "1.5px solid var(--line)", borderRadius: 12, padding: 10 }}>
          <div className="rb-row" style={{ gap: 6, marginBottom: 6 }}>
            <b style={{ fontWeight: 700, minWidth: 18 }}>{idx + 1}</b>
            <input className="rb-in" placeholder="단계 제목" value={st.title}
              onChange={(e) => setSteps((p) => p.map((x) => x.id === st.id ? { ...x, title: e.target.value } : x))} />
            <input className="rb-in" style={{ width: 90 }} placeholder="타이머(분)" value={st.min}
              onChange={(e) => setSteps((p) => p.map((x) => x.id === st.id ? { ...x, min: e.target.value } : x))} />
            <div className="rb-ico" onClick={() => setSteps((p) => p.filter((x) => x.id !== st.id))}><X size={14} /></div>
          </div>
          <input className="rb-in" placeholder="설명" value={st.content}
            onChange={(e) => setSteps((p) => p.map((x) => x.id === st.id ? { ...x, content: e.target.value } : x))} />
        </div>
      ))}
      <button className="rb-btn" onClick={() => setSteps((p) => [...p, { id: uid(), title: "", content: "", min: "" }])}>
        <Plus size={14} /> 단계 추가</button>

      <button className="rb-btn acc" style={{ marginTop: 18, width: "100%", justifyContent: "center", padding: 13 }}
        disabled={!f.title.trim()} onClick={submit}>
        <Check size={16} /> {submitLabel}
      </button>
    </div>
  );
}
