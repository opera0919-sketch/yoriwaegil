import React, { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Search, Plus, Clock, Check, ShoppingCart, Star, Trash2, X, Play, Pause,
  RotateCcw, ChefHat, Sparkles, Minus, Loader2, Flame, ChevronRight,
  ChevronLeft, Copy, ListChecks, Utensils, Bookmark, Pencil, ChevronDown,
  MessageCircle, Send, Link2, LogIn, LogOut,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  THEME / STYLE                                                      */
/* ------------------------------------------------------------------ */
/* Pretendard 폰트는 web/index.html에서 <link>로 선로딩한다(여기 @import면 JS 실행 후에야 받기 시작). */
const CSS = `
.rb * { box-sizing: border-box; }
.rb {
  /* "장인의 부엌" 팔레트 — 로고(한지·먹·낙관)에서 추출: 종이 #DFD0BF / 먹 #32281D / 도장 #993820 */
  --bg: #F1E9DC;
  --card: #FBF7EF;
  --ink: #32281D;
  --soft: #95876F;
  --accent: #9C3B22;
  --accent-d: #84301B;
  --danger: #C24632;
  --line: #E0D5C2;
  --gold: #C99A2E;
  --accent-soft: #F3E3DB;
  --muted: #E9E0CF;
  --field: #F6F0E4;
  --gold-bg: #F4ECD7;
  --timer-bg: #F6EFE2;
  --body: #5C5142;
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
.rb-brand { display:flex; align-items:center; gap:12px; min-width:0; }
.rb-brand img { width:46px; height:46px; border-radius:12px; flex:none;
  box-shadow:0 2px 8px rgba(94,72,40,.2); }
.rb-brand h1 { font-size:21px; margin:0; line-height:1.15; letter-spacing:-.3px; }
.rb-brand .slogan { font-size:11px; color:var(--soft); letter-spacing:2.5px; }
.rb-top-right { display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
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
  background:var(--card); box-shadow:0 2px 10px rgba(94,72,40,.12);
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
  box-shadow:0 2px 12px rgba(94,72,40,.09); animation:rb-up .5s both; }
.rb-card:hover { transform:translateY(-3px); box-shadow:0 12px 28px rgba(94,72,40,.18); }
/* 상세 화면 영상 썸네일 — 리스트는 썸네일 없이 컴팩트하게, 영상은 상세에서 */
.rb-dthumb { display:block; position:relative; width:100%; aspect-ratio:16/9; border-radius:14px;
  overflow:hidden; background:var(--muted); margin:2px 0 16px; }
.rb-dthumb img { width:100%; height:100%; object-fit:cover; display:block; }
.rb-dthumb .play { position:absolute; inset:0; display:grid; place-items:center; }
.rb-dthumb .play i { width:54px; height:54px; border-radius:999px; background:rgba(43,33,22,.62);
  color:#fff; display:grid; place-items:center; transition:.18s; }
.rb-dthumb:hover .play i { background:var(--accent); transform:scale(1.07); }
.rb-cbody { padding:16px 16px 12px; flex:1; display:flex; flex-direction:column; }
.rb-ctop { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.rb-ctitle { font-size:18px; line-height:1.25; letter-spacing:-.3px; font-weight:700; }
.rb-cdesc { font-size:12.5px; color:var(--soft); margin-top:7px; line-height:1.5;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.rb-meta { display:flex; gap:12px; margin-top:12px; font-size:11.5px; color:var(--soft); flex-wrap:wrap; }
.rb-meta span { display:flex; gap:4px; align-items:center; }
.rb-tags { display:flex; gap:5px; flex-wrap:wrap; margin-top:10px; }
.rb-tag { font-size:10.5px; color:var(--accent); background:var(--accent-soft); border-radius:999px; padding:2px 9px; }
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
.rb-btn.dark { background:var(--ink); color:var(--bg); border-color:transparent; }
.rb-btn.ghost { background:transparent; border-color:transparent; }
.rb-btn:disabled { opacity:.5; cursor:not-allowed; }
.rb-ico { width:34px; height:34px; border-radius:999px; border:1.5px solid var(--line);
  background:var(--card); display:grid; place-items:center; cursor:pointer;
  color:var(--soft); transition:.16s; flex:none; padding:0; font-family:var(--font); }
.rb-ico:hover { color:var(--ink); border-color:var(--accent); }
.rb-ico.on { color:var(--gold); border-color:var(--gold); background:var(--gold-bg); }
.rb-ico.cart { color:var(--accent); border-color:var(--accent); background:var(--accent-soft); }

/* FAB */
.rb-fab { position:fixed; right:22px; bottom:32px; z-index:40;
  width:56px; height:56px; border-radius:999px;
  background:var(--accent); color:#fff; border:none;
  box-shadow:0 6px 20px rgba(156,59,34,.4);
  display:grid; place-items:center; cursor:pointer; transition:.18s; }
.rb-fab:hover { background:var(--accent-d); transform:scale(1.06); }

/* overlay / bottom sheet */
.rb-ov { position:fixed; inset:0; z-index:50; background:rgba(43,33,22,.5);
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
.rb-step-c { font-size:13.5px; color:var(--body); line-height:1.6; }

/* timer */
.rb-timer { margin-top:11px; display:inline-flex; align-items:center; gap:10px;
  background:var(--timer-bg); border:1.5px solid var(--line); border-radius:12px; padding:7px 8px 7px 14px; }
.rb-timer.run { border-color:var(--accent); background:var(--accent-soft); }
.rb-tval { font-size:18px; font-weight:700; letter-spacing:.5px; min-width:62px; }
.rb-tval.warn { color:var(--danger); animation:rb-blink 1s infinite; }
.rb-tbtn { width:30px; height:30px; border-radius:999px; border:0; cursor:pointer;
  display:grid; place-items:center; background:var(--ink); color:var(--bg); }
.rb-tbtn.g { background:transparent; color:var(--soft); border:1.5px solid var(--line); }

/* serving */
.rb-serv { display:inline-flex; align-items:center; border:1.5px solid var(--line);
  border-radius:999px; overflow:hidden; }
.rb-serv button { width:32px; height:32px; border:0; background:transparent; cursor:pointer;
  color:var(--ink); display:grid; place-items:center; }
.rb-serv button:hover { background:var(--muted); }
.rb-serv b { font-weight:700; padding:0 13px; font-size:15px; }

/* fields */
.rb-field { margin-bottom:14px; }
.rb-lab { font-size:12px; color:var(--soft); margin-bottom:6px; display:block;
  font-weight:600; letter-spacing:.3px; }
.rb-in,.rb-ta,.rb-sel { width:100%; border:1.5px solid var(--line); border-radius:12px;
  background:var(--field); padding:11px 13px; font-family:var(--font); font-size:14px;
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
.rb-cook-c { font-size:17px; line-height:1.75; color:var(--body); }
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
  background:var(--field); font-size:22px; cursor:pointer; display:grid; place-items:center; transition:.15s; }
.rb-emoji-btn:hover,.rb-emoji-btn.on { border-color:var(--accent); background:var(--accent-soft); }

/* select custom arrow (테두리 톤에 맞춘 회색) */
.rb-sel { appearance:none; -webkit-appearance:none; -moz-appearance:none; padding-right:34px;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2395876F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat:no-repeat; background-position:right 12px center; cursor:pointer; }
.rb-sel:focus { background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239C3B22' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat:no-repeat; background-position:right 12px center; }

/* comments */
.rb-comment { display:flex; gap:10px; align-items:flex-start; padding:11px 0; border-bottom:1px solid var(--line); }
.rb-comment:last-child { border-bottom:none; }
.rb-comment-body { flex:1; min-width:0; }
.rb-comment-head { display:flex; align-items:center; gap:7px; margin-bottom:3px; }
.rb-comment-name { font-size:12.5px; font-weight:700; }
.rb-comment-date { font-size:11px; color:var(--soft); }
.rb-comment-text { font-size:13.5px; line-height:1.55; white-space:pre-wrap; word-break:break-word; }
.rb-comment-del { font-size:11px; color:var(--soft); cursor:pointer; flex:none; }
.rb-comment-del:hover { color:var(--danger); }

/* shopping recipe rows */
.rb-shop-recipe { display:flex; align-items:center; gap:10px; padding:11px 13px; border-radius:12px;
  background:var(--card); margin-bottom:8px; box-shadow:0 1px 6px rgba(0,0,0,.05); }
.rb-shop-recipe .nm { flex:1; min-width:0; font-size:14px; font-weight:600; cursor:pointer;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rb-shop-recipe .nm:hover { color:var(--accent); }

/* citation */
.rb-citation { display:inline-flex; align-items:center; gap:5px; margin-top:7px; font-size:12px;
  color:var(--accent); text-decoration:none; max-width:100%; }
.rb-citation:hover { text-decoration:underline; }
.rb-citation span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* toast */
.rb-toaster { position:fixed; left:50%; bottom:28px; transform:translateX(-50%); z-index:80;
  display:flex; flex-direction:column; gap:8px; align-items:center; pointer-events:none; }
.rb-toast { background:#32281D; color:#F6F0E4; padding:11px 18px; border-radius:999px;
  font-size:13.5px; font-weight:600; box-shadow:0 6px 24px rgba(0,0,0,.25);
  display:flex; align-items:center; gap:8px; max-width:90vw; animation:rb-toast-in .22s both; }
.rb-toast-act { background:none; border:none; color:#F0A989; font-weight:700; font-size:13px;
  cursor:pointer; padding:0 2px; font-family:inherit; flex:none; }
@keyframes rb-toast-in { from{opacity:0; transform:translateY(12px) scale(.96);} to{opacity:1; transform:none;} }

@keyframes rb-up { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;} }
@keyframes rb-up-sheet { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;} }
@keyframes rb-fade { from{opacity:0;}to{opacity:1;} }
@keyframes rb-blink { 50%{opacity:.4;} }
.rb-spin { animation:rb-spin 1s linear infinite; }
@keyframes rb-spin { to{transform:rotate(360deg);} }

/* 다크 모드 — 시스템 설정 따름 ("먹빛 밤": 따뜻한 차콜 + 한지빛 텍스트) */
@media (prefers-color-scheme: dark) {
  .rb {
    --bg: #161310;
    --card: #211C16;
    --ink: #EAE1D2;
    --soft: #A2937C;
    --accent: #C8593C;
    --accent-d: #B44830;
    --danger: #D9604B;
    --line: #362E23;
    --gold: #D2A53F;
    --accent-soft: #3B241A;
    --muted: #2A241B;
    --field: #131009;
    --gold-bg: #383019;
    --timer-bg: #261F16;
    --body: #C2B6A2;
  }
  .rb-search { box-shadow:0 2px 10px rgba(0,0,0,.35); }
  .rb-card { box-shadow:0 2px 12px rgba(0,0,0,.3); }
  .rb-card:hover { box-shadow:0 12px 28px rgba(0,0,0,.45); }
  .rb-shop-item,.rb-shop-recipe { box-shadow:0 1px 6px rgba(0,0,0,.3); }
}
`;

/* ------------------------------------------------------------------ */
/*  CONSTANTS / HELPERS                                                */
/* ------------------------------------------------------------------ */
const CATS = ["한식", "중식", "양식", "일식", "기타"];
const CAT_COLOR = { 한식: "#BE4329", 중식: "#C98A2B", 양식: "#6F7A52", 일식: "#4A6C7A", 기타: "#8A6D8B" };
/* 별점 색 — SVG fill 속성은 CSS var()를 못 받아 상수로 둔다 */
const GOLD = "#C99A2E";
const STAR_OFF = "#CBBFA8";
const GROUPS = ["채소", "육류·해산물", "양념·소스", "기타"];
const STORE_SHOP_CHECKED_KEY = "recipebox:v1:shopChecked";
const STORE_SHOP_SERVINGS_KEY = "recipebox:v1:shopServings";
const STORE_CACHE_KEY = "recipebox:v1:cache";

const USER_COLORS = ["#9C3B22","#C98A2B","#6F7A52","#4A6C7A","#8A6D8B","#A4543F","#5B7161","#9C7A3C"];

/* Supabase */
const SUPABASE_URL = "https://fbkriifozbwuaoegmmcf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia3JpaWZvemJ3dWFvZWdtbWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTk4MTYsImV4cCI6MjA5NjAzNTgxNn0.YGktdDGIYXVvIqdSrmhkG8um-zjZtHoRhWG4EQV60HU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* 장보기 체크·인분 등 JSON 상태 보존 — 마트에서 새로고침해도 유지 */
const loadJSON = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } };
const saveJSON = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} };

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
  comments: r.comments || [],
  cook_logs: r.cookLogs || [],
  source_url: r.sourceUrl || "",
  source_title: r.sourceTitle || "",
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
  comments: row.comments || [],
  cookLogs: row.cook_logs || [],
  sourceUrl: row.source_url || "",
  sourceTitle: row.source_title || "",
  createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
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
  sourceUrl: "source_url",
  sourceTitle: "source_title",
};
// UPDATE 가능한 실제 컬럼만 허용 (id/createdAt 등 비컬럼·키 제외)
const RECIPE_COLUMNS = new Set([
  "category", "title", "description", "base_servings", "total_minutes",
  "difficulty", "tags", "ingredients", "steps", "created_by", "updated_by",
  "favorites", "in_cart_by", "notes", "comments", "cook_logs",
  "source_url", "source_title", "version",
]);
const patchToRow = (patch) =>
  Object.fromEntries(
    Object.entries(patch)
      .map(([k, v]) => [PATCH_MAP[k] || k, v])
      .filter(([k]) => RECIPE_COLUMNS.has(k))
  );

/* ------------------------------------------------------------------ */
/*  TOAST BUS  (전역 — prop drilling 없이 어디서든 toast() 호출)        */
/* ------------------------------------------------------------------ */
const toastListeners = new Set();
/* toast(msg) 또는 toast(msg, { actionLabel, action, duration }) — action 버튼 지원(실행취소 등) */
const toast = (msg, opts) => toastListeners.forEach((fn) => fn(msg, opts));

const uid = () => Math.random().toString(36).slice(2, 9);

/* 초성 검색: "ㄱㅊㅉㄱ" → "김치찌개" 매칭 */
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const toCho = (s) => [...s].map((ch) => {
  const c = ch.charCodeAt(0) - 0xac00;
  return c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : ch;
}).join("");
const matchKo = (text, query) => {
  const t = text.toLowerCase(), q = query.toLowerCase().trim();
  if (!q) return true;
  if (t.includes(q)) return true;
  // 검색어가 초성으로만 이뤄졌으면 본문의 초성열과 비교
  if (/^[ㄱ-ㅎ\s]+$/.test(q)) return toCho(t).includes(q.replace(/\s/g, ""));
  return false;
};
const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
const fmt = (n) => {
  if (n == null || isNaN(n)) return "";
  const r = Math.round(n * 100) / 100;
  return String(r);
};
const mmss = (s) => {
  const m = Math.floor(s / 60), x = s % 60;
  return `${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`;
};

/* 유튜브 출처 레시피 → 썸네일 URL (별도 저장 없이 sourceUrl에서 파생) */
const youtubeThumb = (url) => {
  const m = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?[^\s]*\bv=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{11})/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
};

/* 타이머 종료 알림 — 화면을 보고 있지 않을 때만 브라우저 알림(보는 중엔 비프음으로 충분) */
const notifyTimerDone = (label) => {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return;
    new Notification("⏰ 타이머 완료", { body: label ? `'${label}' 단계가 끝났어요.` : "조리 단계 타이머가 끝났어요." });
  } catch (e) {}
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
/*  TOASTER                                                            */
/* ------------------------------------------------------------------ */
function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const fn = (msg, opts = {}) => {
      const id = uid();
      setItems((s) => [...s, { id, msg, actionLabel: opts.actionLabel, action: opts.action }]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), opts.duration || 2200);
    };
    toastListeners.add(fn);
    return () => toastListeners.delete(fn);
  }, []);
  return (
    <div className="rb-toaster">
      {items.map((t) => (
        <div key={t.id} className="rb-toast" style={t.actionLabel ? { pointerEvents: "auto" } : {}}>
          <Check size={15} /> {t.msg}
          {t.actionLabel && (
            <button className="rb-toast-act"
              onClick={() => { setItems((s) => s.filter((x) => x.id !== t.id)); t.action?.(); }}>
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  USER AVATAR                                                        */
/* ------------------------------------------------------------------ */
function UserAvatar({ user, size = 36 }) {
  if (!user) return null;
  const url = user.avatar_url || user.avatarUrl;
  return (
    <div className="rb-avatar" style={{ width: size, height: size, fontSize: size * 0.5, padding: 0, overflow: "hidden" }}>
      {url
        ? <img src={url} alt="" referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
        : (user.emoji || "🧑")}
    </div>
  );
}

const EMOJIS = ["🧑‍🍳","👩‍🍳","🧑","👦","👧","👩","👨","🧒","🧓","👴","👵","🍳","🐰","🐱","🐶","🦊"];

/* ------------------------------------------------------------------ */
/*  GOOGLE ICON                                                        */
/* ------------------------------------------------------------------ */
function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  LOGIN SHEET                                                        */
/* ------------------------------------------------------------------ */
function LoginSheet({ onClose, onSignIn }) {
  return (
    <div className="rb-ov" onClick={onClose}>
      <div className="rb-sheet" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="rb-sh-head">
          <b style={{ fontSize: 17 }}>로그인</b>
          <button className="rb-ico" aria-label="닫기" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="rb-sh-body" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--soft)", fontSize: 14, lineHeight: 1.6, marginTop: 4, marginBottom: 20 }}>
            구글 계정으로 로그인하면 즐겨찾기·장보기·댓글·조리 기록을 남길 수 있어요.<br />
            로그인 없이도 레시피 둘러보기는 자유롭게 가능합니다.
          </p>
          <button className="rb-btn" style={{ width: "100%", justifyContent: "center", padding: 13, fontWeight: 700 }}
            onClick={onSignIn}>
            <GoogleIcon /> Google로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ACCOUNT MENU                                                       */
/* ------------------------------------------------------------------ */
function AccountMenu({ user, email, onSignOut, onClose, onSaveProfile, initialEditing = false, firstSetup = false }) {
  const [editing, setEditing] = useState(initialEditing);
  const [name, setName] = useState(user.name || "");
  const [emoji, setEmoji] = useState(user.emoji || "🧑‍🍳");

  const save = () => {
    if (!name.trim()) return;
    // 이모지 프로필 사용 → 구글 사진(avatar_url) 비움
    onSaveProfile({ name: name.trim(), emoji, avatar_url: "" });
    if (firstSetup) onClose(); else setEditing(false);
  };

  return (
    <div className="rb-ov" onClick={firstSetup ? undefined : onClose}>
      <div className="rb-sheet" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="rb-sh-head">
          <b style={{ fontSize: 17 }}>{firstSetup ? "프로필 설정" : editing ? "프로필 수정" : "내 계정"}</b>
          {!firstSetup && <button className="rb-ico" aria-label="닫기" onClick={onClose}><X size={17} /></button>}
        </div>
        <div className="rb-sh-body">
          {editing ? (
            <>
              {firstSetup && (
                <p style={{ color: "var(--soft)", fontSize: 13.5, lineHeight: 1.6, marginTop: 0, marginBottom: 16, textAlign: "center" }}>
                  처음 오셨네요! 프로필 이모지와 닉네임을 설정해 주세요.
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <UserAvatar user={{ emoji, avatar_url: "" }} size={72} />
              </div>
              <div className="rb-field">
                <label className="rb-lab">닉네임</label>
                <input className="rb-in" value={name} autoFocus
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  placeholder="예) 요리하는 유나" />
              </div>
              <label className="rb-lab">프로필 이모지</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6, marginTop: 8 }}>
                {EMOJIS.map((em) => (
                  <button key={em} className={`rb-emoji-btn ${emoji === em ? "on" : ""}`}
                    style={{ width: "100%", height: "auto", aspectRatio: "1", fontSize: 19 }}
                    onClick={() => setEmoji(em)}>{em}</button>
                ))}
              </div>
              <div className="rb-row" style={{ marginTop: 18, gap: 8 }}>
                <button className="rb-btn acc" style={{ flex: 1, justifyContent: "center" }}
                  disabled={!name.trim()} onClick={save}>
                  <Check size={16} /> 저장
                </button>
                {!firstSetup && <button className="rb-btn" onClick={() => setEditing(false)}>취소</button>}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <UserAvatar user={user} size={48} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
                  {email && <div style={{ fontSize: 12.5, color: "var(--soft)", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>}
                </div>
              </div>
              <button className="rb-btn" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
                onClick={() => { setName(user.name || ""); setEmoji(user.emoji || "🧑‍🍳"); setEditing(true); }}>
                <Pencil size={15} /> 프로필 수정
              </button>
              <button className="rb-btn" style={{ width: "100%", justifyContent: "center" }} onClick={onSignOut}>
                <LogOut size={15} /> 로그아웃
              </button>
            </>
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
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("box");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState("created"); // 기본: 최근 추가순 (DB 반환 순서는 사실상 무작위였음)
  const [detailId, setDetailId] = useState(null);
  const [cookId, setCookId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [timers, setTimers] = useState({});
  const [checked, setChecked] = useState(() => loadJSON(STORE_SHOP_CHECKED_KEY, {}));
  useEffect(() => { saveJSON(STORE_SHOP_CHECKED_KEY, checked); }, [checked]);

  const [dbError, setDbError] = useState(null);

  /* 로그인한 구글 사용자 = 현재 사용자 (비로그인 시 null → 읽기 전용) */
  const currentUserId = session?.user?.id || null;

  /* ── 해시 라우팅: 상세(#/recipe/:id)·요리모드(#/cook/:id)를 URL과 동기화 ──
     레시피를 링크로 공유할 수 있고, 모바일 뒤로가기가 앱 이탈 대신 화면을 닫는다. */
  const deepLinkRef = useRef(false); // 딥링크 직접 진입이면 back이 사이트 밖으로 가므로 구분
  useEffect(() => {
    deepLinkRef.current = /^#\//.test(window.location.hash);
    const apply = () => {
      const m = window.location.hash.match(/^#\/(recipe|cook)\/(.+)$/);
      if (m && m[1] === "recipe") { setDetailId(decodeURIComponent(m[2])); setCookId(null); }
      else if (m && m[1] === "cook") { setCookId(decodeURIComponent(m[2])); setDetailId(null); }
      else { setDetailId(null); setCookId(null); }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  const navigate = (hash) => { deepLinkRef.current = false; window.location.hash = hash; };

  /* ESC로 최상단 화면 닫기 (첫 프로필 설정은 제외) */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showAdd) setShowAdd(false);
      else if (showLogin) setShowLogin(false);
      else if (showAccountMenu) setShowAccountMenu(false);
      else if (cookId || detailId) closeTop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const closeTop = () => {
    if (/^#\//.test(window.location.hash)) {
      if (deepLinkRef.current) {
        deepLinkRef.current = false;
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        setDetailId(null); setCookId(null);
      } else {
        window.history.back(); // hashchange 핸들러가 상태를 정리
      }
    } else { setDetailId(null); setCookId(null); }
  };

  /* load from Supabase — 실패(오프라인 등) 시 마지막으로 본 데이터를 localStorage 캐시에서 복원 */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [
          { data: dbUsers, error: usersErr },
          { data: dbRecipes, error: recipesErr },
        ] = await Promise.all([
          supabase.from("app_users").select("*"),
          supabase.from("recipes").select("*"),
        ]);
        if (cancelled) return;
        if (usersErr || recipesErr) throw new Error((usersErr || recipesErr).message);
        const users2 = dbUsers || [];
        const recipes2 = (dbRecipes || []).map(fromRow);
        saveJSON(STORE_CACHE_KEY, { users: users2, recipes: recipes2 });
        setUsers(users2);
        setRecipes(recipes2);
      } catch (e) {
        if (cancelled) return;
        const cached = loadJSON(STORE_CACHE_KEY, null);
        if (cached && cached.recipes?.length) {
          setUsers(cached.users || []);
          setRecipes(cached.recipes);
          toast("오프라인 — 마지막 데이터를 보여드려요");
        } else {
          setDbError(String(e?.message || e));
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── 구글 OAuth 세션 ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  /* 로그인 시 프로필 보장 (loaded 이후 실행 → 로드 setUsers 경합으로 덮어쓰이는 문제 방지) */
  useEffect(() => {
    const u = session?.user;
    if (!u || !loaded) return;
    let cancelled = false;
    (async () => {
      const { data: rows } = await supabase.from("app_users").select("*").eq("id", u.id);
      if (cancelled) return;
      let row = rows && rows[0];
      if (!row) {
        const meta = u.user_metadata || {};
        row = {
          id: u.id,
          name: meta.full_name || meta.name || (u.email || "").split("@")[0] || "사용자",
          emoji: "🧑‍🍳",
          color: USER_COLORS[Math.abs(hashStr(u.id)) % USER_COLORS.length],
          avatar_url: "",
          profile_set: false,
        };
        await supabase.from("app_users").insert(row);
        if (cancelled) return;
      }
      setUsers((list) => list.some((x) => x.id === u.id)
        ? list.map((x) => (x.id === u.id ? row : x))
        : [...list, row]);
      // 아직 프로필을 직접 설정하지 않았으면 설정 창을 먼저 표시
      if (!row.profile_set) setNeedsProfileSetup(true);
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id, loaded]);

  /* Supabase Realtime — 다른 기기/탭의 변경을 실시간 반영 */
  useEffect(() => {
    const ch = supabase
      .channel("recipebox-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "recipes" }, ({ new: row }) => {
        setRecipes((r) => r.some((x) => x.id === row.id) ? r : [fromRow(row), ...r]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "recipes" }, ({ new: row }) => {
        setRecipes((r) => r.map((x) => x.id === row.id ? fromRow(row) : x));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "recipes" }, ({ old: row }) => {
        setRecipes((r) => r.filter((x) => x.id !== row.id));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "app_users" }, ({ new: row }) => {
        setUsers((u) => u.some((x) => x.id === row.id) ? u : [...u, row]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "app_users" }, ({ new: row }) => {
        setUsers((u) => u.map((x) => x.id === row.id ? row : x));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "app_users" }, ({ old: row }) => {
        setUsers((u) => u.filter((x) => x.id !== row.id));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  /* timer tick — endAt(절대시각) 기준으로 남은 시간을 계산.
     setInterval 감산 방식은 백그라운드 탭/화면 꺼짐에서 스로틀돼 시간이 밀렸음. */
  const running = Object.values(timers).some((t) => t.running);
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      setTimers((prev) => {
        const now = Date.now();
        const next = { ...prev }; let ch = false;
        for (const k in next) {
          const t = next[k];
          if (!t.running) continue;
          const rem = Math.max(0, Math.ceil((t.endAt - now) / 1000));
          if (rem !== t.remaining) {
            next[k] = { ...t, remaining: rem, running: rem > 0 }; ch = true;
            if (rem === 0) { beep(); notifyTimerDone(t.label); }
          }
        }
        return ch ? next : prev;
      });
    };
    const iv = setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick); // 화면 복귀 시 즉시 보정
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", tick); };
  }, [running]);

  /* auth */
  const signIn = () => supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      queryParams: { prompt: "select_account" },
    },
  });
  const signOut = async () => {
    await supabase.auth.signOut();
    setShowAccountMenu(false);
    toast("로그아웃되었어요");
  };
  const updateProfile = async (patch) => {
    if (!currentUserId) return;
    const full = { ...patch, profile_set: true };
    setUsers((list) => list.some((x) => x.id === currentUserId)
      ? list.map((x) => (x.id === currentUserId ? { ...x, ...full } : x))
      : [...list, { id: currentUserId, color: USER_COLORS[0], ...full }]);
    const { error } = await supabase.from("app_users").update(full).eq("id", currentUserId);
    if (error) {
      console.error("프로필 저장 실패:", error);
      toast("프로필 저장에 실패했어요");
      return;
    }
    setNeedsProfileSetup(false);
    toast("프로필을 저장했어요");
  };
  /* 로그인 필요 동작 가드 — 비로그인 시 로그인 시트를 띄우고 false 반환 */
  const requireLogin = () => {
    if (currentUserId) return true;
    setShowLogin(true);
    return false;
  };

  /* helpers */
  const update = async (id, patch) => {
    let prev;
    setRecipes((r) => { prev = r.find((x) => x.id === id); return r.map((x) => (x.id === id ? { ...x, ...patch } : x)); });
    const { error } = await supabase.from("recipes").update(patchToRow(patch)).eq("id", id);
    if (error) {
      console.error("레시피 수정 실패:", error);
      if (prev) setRecipes((r) => r.map((x) => (x.id === id ? prev : x)));
      toast("변경 저장에 실패했어요");
    }
  };
  const remove = async (id) => {
    if (!requireLogin()) return;
    let removed;
    setRecipes((r) => { removed = r.find((x) => x.id === id); return r.filter((x) => x.id !== id); });
    closeTop();
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) {
      console.error("레시피 삭제 실패:", error);
      if (removed) setRecipes((r) => r.some((x) => x.id === id) ? r : [removed, ...r]);
      toast("삭제에 실패했어요");
      return;
    }
    toast("레시피를 삭제했어요", {
      actionLabel: "실행취소", duration: 6000,
      action: async () => {
        if (!removed) return;
        setRecipes((r) => (r.some((x) => x.id === removed.id) ? r : [removed, ...r]));
        const { error: e2 } = await supabase.from("recipes").insert(toRow(removed));
        if (e2) {
          console.error("레시피 복구 실패:", e2);
          setRecipes((r) => r.filter((x) => x.id !== removed.id));
          toast("복구에 실패했어요");
        } else {
          toast("레시피를 복구했어요");
        }
      },
    });
  };
  const addRecipe = async (r) => {
    if (!requireLogin()) return;
    const recipe = {
      ...r, id: uid(),
      createdBy: currentUserId, updatedBy: currentUserId,
      favorites: [], inCartBy: [], notes: {}, comments: [], cookLogs: [],
      createdAt: Date.now(),
    };
    setRecipes((prev) => [recipe, ...prev]);
    const { error } = await supabase.from("recipes").insert(toRow(recipe));
    if (error) {
      console.error("레시피 추가 실패:", error);
      setRecipes((prev) => prev.filter((x) => x.id !== recipe.id));
      toast("저장에 실패했어요");
      return;
    }
    toast(`'${recipe.title}' 저장됨`);
  };
  const toggleFav = (r) => {
    if (!requireLogin()) return;
    const isFav = r.favorites?.includes(currentUserId);
    update(r.id, {
      favorites: isFav
        ? (r.favorites || []).filter((id) => id !== currentUserId)
        : [...(r.favorites || []), currentUserId],
    });
    toast(isFav ? "즐겨찾기 해제" : "즐겨찾기에 추가 ⭐");
  };
  const toggleCart = (r) => {
    if (!requireLogin()) return;
    const inCart = r.inCartBy?.includes(currentUserId);
    update(r.id, {
      inCartBy: inCart
        ? (r.inCartBy || []).filter((id) => id !== currentUserId)
        : [...(r.inCartBy || []), currentUserId],
    });
    toast(inCart ? "장보기에서 뺐어요" : "장보기에 담았어요 🛒");
  };

  const startTimer = (key, total, label) => {
    // 첫 타이머 시작(사용자 제스처) 시 알림 권한 요청 — 백그라운드 종료 알림용
    try { if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission(); } catch (e) {}
    setTimers((t) => {
      const rem = t[key]?.remaining ?? total;
      return { ...t, [key]: { remaining: rem, total, label, running: true, endAt: Date.now() + rem * 1000 } };
    });
  };
  const pauseTimer = (key) =>
    setTimers((t) => t[key]?.running
      ? { ...t, [key]: { ...t[key], running: false, remaining: Math.max(0, Math.ceil((t[key].endAt - Date.now()) / 1000)) } }
      : t);
  const resetTimer = (key, total) =>
    setTimers((t) => ({ ...t, [key]: { ...t[key], remaining: total, total, running: false } }));

  const markCooked = (id, extra = {}) => {
    if (!requireLogin()) return;
    const r = recipes.find((x) => x.id === id);
    if (!r) return;
    const logs = r.cookLogs || [];
    const idx = logs.findIndex((l) => l.userId === currentUserId);
    const rate = extra.rating ? { rating: extra.rating } : {};
    let newLogs;
    if (idx >= 0) {
      newLogs = logs.map((l, i) =>
        i === idx ? { ...l, count: l.count + 1, lastCookedAt: Date.now(), ...rate } : l
      );
    } else {
      newLogs = [...logs, { userId: currentUserId, count: 1, lastCookedAt: Date.now(), ...rate }];
    }
    update(id, { cookLogs: newLogs, updatedBy: currentUserId });
    toast("조리 기록을 추가했어요 🍳");
  };

  /* derived */
  const meta = session?.user?.user_metadata || {};
  const currentUser = currentUserId
    ? (users.find((u) => u.id === currentUserId) || {
        id: currentUserId,
        name: meta.full_name || meta.name || (session.user.email || "").split("@")[0] || "사용자",
        emoji: "🧑‍🍳",
        avatar_url: "",  // 구글 사진 대신 이모지 프로필 사용
      })
    : null;

  const filtered = useMemo(() => {
    let list = recipes.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (favOnly && !r.favorites?.includes(currentUserId)) return false;
      if (q.trim()) {
        const t = r.title + " " + r.description + " " + (r.tags || []).join(" ") + " " + r.ingredients.map((i) => i.name).join(" ");
        if (!matchKo(t, q)) return false;
      }
      return true;
    });
    if (sort === "recent") {
      list = [...list].sort((a, b) => {
        const la = a.cookLogs?.find((l) => l.userId === currentUserId)?.lastCookedAt || 0;
        const lb = b.cookLogs?.find((l) => l.userId === currentUserId)?.lastCookedAt || 0;
        return lb - la;
      });
    } else if (sort === "created") {
      list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, "ko"));
    }
    return list;
  }, [recipes, cat, q, favOnly, sort, currentUserId]);

  const cartRecipes = recipes.filter((r) => r.inCartBy?.includes(currentUserId));
  const triedCount = recipes.filter((r) => r.cookLogs?.some((l) => l.userId === currentUserId && l.count > 0)).length;

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
                <div style={{ color: "var(--soft)", fontSize: 13.5, lineHeight: 1.7, marginBottom: 20 }}>{dbError}</div>
                <div style={{ background: "var(--muted)", borderRadius: 12, padding: "14px 18px", textAlign: "left", fontSize: 13, lineHeight: 1.8 }}>
                  Supabase 대시보드에서 <b>recipes</b>·<b>app_users</b> 테이블의 RLS 정책을 확인하세요.<br />
                  필요한 정책: 읽기는 <code style={{ fontSize: 12, color: "var(--accent)" }}>anon</code> 허용,
                  쓰기는 <code style={{ fontSize: 12, color: "var(--accent)" }}>authenticated</code> 허용
                  (<code style={{ fontSize: 12 }}>supabase/migrations</code>의 RLS 마이그레이션 참고).
                </div>
              </div>
            )
            : (
              <div style={{ textAlign: "center" }}>
                <img src={`${import.meta.env.BASE_URL || "./"}icon-192.png`} alt="요리외길"
                  style={{ width: 84, height: 84, borderRadius: 20, boxShadow: "0 4px 16px rgba(94,72,40,.22)", marginBottom: 18 }} />
                <div style={{ display: "grid", placeItems: "center", color: "var(--soft)" }}>
                  <Loader2 className="rb-spin" />
                </div>
              </div>
            )}
        </div>
      </div>
    );

  return (
    <div className="rb">
      <style>{CSS}</style>
      <div className="rb-wrap">
        {/* header */}
        <header className="rb-top">
          <div className="rb-brand">
            <img src={`${import.meta.env.BASE_URL || "./"}icon-192.png`} alt="요리외길 로고" />
            <div>
              <h1>요리외길</h1>
              <span className="slogan">장인의 길을 걷다</span>
            </div>
          </div>
          <div className="rb-top-right">
            <div className="rb-stats">
              <div className="rb-stat"><b>{recipes.length}</b><span>저장한 레시피</span></div>
              <div className="rb-stat"><b>{triedCount}</b><span>만들어 본 요리</span></div>
              <div className="rb-stat"><b>{cartRecipes.length}</b><span>장보기 담음</span></div>
            </div>
            {currentUser ? (
              <div className="rb-user-btn" onClick={() => setShowAccountMenu(true)}>
                <UserAvatar user={currentUser} size={32} />
                <b>{currentUser.name}</b>
                <ChevronDown size={14} style={{ color: "var(--soft)" }} />
              </div>
            ) : (
              <button className="rb-btn acc" onClick={signIn}>
                <LogIn size={15} /> 로그인
              </button>
            )}
          </div>
        </header>

        {/* tabs */}
        <div className="rb-tabs">
          <button className={`rb-tab ${tab === "box" ? "on" : ""}`} onClick={() => setTab("box")}>
            <Bookmark size={15} /> 저장된 레시피
          </button>
          <button className={`rb-tab ${tab === "cart" ? "on" : ""}`} onClick={() => setTab("cart")}>
            <ShoppingCart size={15} /> 장보기 목록
            {cartRecipes.length > 0 && <span className="pill">{cartRecipes.length}</span>}
          </button>
        </div>

        {tab === "box" && (
          <>
            <div className="rb-bar" style={{ flexWrap: "nowrap" }}>
              <div className="rb-search" style={{ flex: "1 1 auto", minWidth: 100 }}>
                <Search size={17} style={{ color: "var(--soft)" }} />
                <input placeholder="요리·재료·태그 검색…" value={q} onChange={(e) => setQ(e.target.value)} />
                {q && <X size={16} style={{ cursor: "pointer", color: "var(--soft)" }} onClick={() => setQ("")} />}
              </div>
              <button className="rb-ico" title={favOnly ? "전체 보기" : "즐겨찾기만 보기"}
                onClick={() => setFavOnly((v) => !v)}
                style={{ flex: "none", width: 42, height: 42,
                  ...(favOnly ? { borderColor: "var(--gold)", color: "var(--gold)", background: "var(--gold-bg)" } : {}) }}>
                <Star size={17} fill={favOnly ? GOLD : "none"} />
              </button>
              <select className="rb-sel" value={sort} onChange={(e) => setSort(e.target.value)}
                style={{ width: 116, flex: "none" }}>
                <option value="created">최근 추가순</option>
                <option value="recent">최근 조리순</option>
                <option value="name">이름순</option>
              </select>
            </div>
            <div className="rb-cats-scroll">
              <button
                className={`rb-cat ${cat === "all" ? "on" : ""}`}
                style={cat === "all" ? { background: "#32281D" } : {}}
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
                    <article key={r.id} className="rb-card"
                      style={{ animationDelay: q ? "0s" : `${Math.min(i * 0.04, 0.5)}s` }}
                      onClick={() => navigate(`#/recipe/${r.id}`)}>
                      <div className="rb-cbody">
                        <div className="rb-ctop">
                          <div style={{ flex: 1 }}>
                            <span className="rb-cat-badge"
                              style={{ color: CAT_COLOR[r.category], background: CAT_COLOR[r.category] + "18" }}>
                              {r.category}
                            </span>
                            <div className="rb-ctitle">{r.title}</div>
                          </div>
                          <button
                            className={`rb-ico ${isFav ? "on" : ""}`}
                            aria-label={isFav ? "즐겨찾기 해제" : "즐겨찾기"}
                            onClick={(e) => { e.stopPropagation(); toggleFav(r); }}>
                            <Star size={16} fill={isFav ? GOLD : "none"} />
                          </button>
                        </div>
                        <div className="rb-cdesc">{r.description}</div>
                        {r.sourceUrl && (
                          <a className="rb-citation" href={r.sourceUrl} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, marginTop: 5 }}>
                            <Link2 size={11} /> <span>출처: {r.sourceTitle || "원문 보기"}</span>
                          </a>
                        )}
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
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <label className="rb-chk" onClick={() => { if (requireLogin()) markCookedToggle(r, update, currentUserId); }}>
                            <span className={`rb-box ${tried ? "on" : ""}`}>{tried && <Check size={14} />}</span>
                            만들어 봄
                          </label>
                          {tried && (
                            <div style={{ display: "flex", gap: 1 }} title="별점">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star key={n} size={15} style={{ cursor: "pointer" }}
                                  fill={n <= (myLog?.rating || 0) ? GOLD : "none"}
                                  color={n <= (myLog?.rating || 0) ? GOLD : STAR_OFF}
                                  onClick={() => { if (!requireLogin()) return; update(r.id, {
                                    cookLogs: (r.cookLogs || []).map((l) =>
                                      l.userId === currentUserId ? { ...l, rating: n } : l),
                                  }); }} />
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          className={`rb-ico ${inCart ? "cart" : ""}`}
                          title="장보기 목록에 담기" aria-label="장보기 담기"
                          onClick={() => toggleCart(r)}>
                          <ShoppingCart size={16} />
                        </button>
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
            cartRecipes={cartRecipes} checked={checked} setChecked={setChecked}
            onRemove={(id) => {
              const r = recipes.find((x) => x.id === id);
              if (!r) return;
              update(id, { inCartBy: (r.inCartBy || []).filter((uid) => uid !== currentUserId) });
              toast("장보기에서 뺐어요");
            }}
            onClear={() => {
              cartRecipes.forEach((r) =>
                update(r.id, { inCartBy: (r.inCartBy || []).filter((uid) => uid !== currentUserId) }));
              setChecked({});
              toast("장보기 목록을 비웠어요");
            }}
            onOpen={(id) => navigate(`#/recipe/${id}`)}
          />
        )}
      </div>

      {/* FAB */}
      <button className="rb-fab" onClick={() => { if (requireLogin()) setShowAdd(true); }}>
        <Plus size={24} />
      </button>

      {/* detail overlay */}
      {detail && (
        <Detail
          r={detail} timers={timers} users={users} currentUserId={currentUserId}
          startTimer={startTimer} pauseTimer={pauseTimer} resetTimer={resetTimer}
          onClose={closeTop} update={update} remove={remove}
          markCooked={markCooked} onCook={() => navigate(`#/cook/${detail.id}`)}
          toggleFav={toggleFav} toggleCart={toggleCart} requireLogin={requireLogin}
        />
      )}

      {/* cook mode */}
      {cookRecipe && (
        <CookMode
          r={cookRecipe} timers={timers}
          startTimer={startTimer} pauseTimer={pauseTimer} resetTimer={resetTimer}
          onClose={closeTop}
          onFinish={(rating) => { markCooked(cookRecipe.id, { rating }); closeTop(); }}
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

      {/* login sheet */}
      {showLogin && !currentUserId && (
        <LoginSheet onClose={() => setShowLogin(false)} onSignIn={signIn} />
      )}

      {/* account menu / 첫 로그인 프로필 설정 */}
      {(showAccountMenu || needsProfileSetup) && currentUser && (
        <AccountMenu user={currentUser} email={session?.user?.email}
          initialEditing={needsProfileSetup} firstSetup={needsProfileSetup}
          onSignOut={signOut} onSaveProfile={updateProfile}
          onClose={() => { setShowAccountMenu(false); setNeedsProfileSetup(false); }} />
      )}

      <Toaster />
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
function Detail({ r, timers, startTimer, pauseTimer, resetTimer, onClose, update, remove, markCooked, onCook, currentUserId, users, toggleFav, toggleCart, requireLogin }) {
  const [servings, setServings] = useState(r.baseServings);
  const [editing, setEditing] = useState(false);
  const factor = servings / r.baseServings;

  const isFav = r.favorites?.includes(currentUserId);
  const inCart = r.inCartBy?.includes(currentUserId);
  const myLog = r.cookLogs?.find((l) => l.userId === currentUserId);
  const thumb = youtubeThumb(r.sourceUrl);

  const grouped = useMemo(() => {
    const g = {}; r.ingredients.forEach((i) => (g[i.group || "기타"] = g[i.group || "기타"] || []).push(i)); return g;
  }, [r]);

  if (editing) {
    return (
      <div className="rb-ov" onClick={onClose}>
        <div className="rb-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
          <div className="rb-sh-head">
            <b style={{ fontSize: 17 }}>레시피 편집</b>
            <button className="rb-ico" aria-label="편집 닫기" onClick={() => setEditing(false)}><X size={17} /></button>
          </div>
          <div className="rb-sh-body">
            <ManualForm
              currentUserId={currentUserId} initial={r} submitLabel="변경 저장"
              onSubmit={(updated) => { update(r.id, updated); setEditing(false); toast("레시피를 수정했어요"); }}
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
            <button className="rb-ico" title="편집" aria-label="레시피 편집" onClick={() => { if (requireLogin()) setEditing(true); }}><Pencil size={15} /></button>
            <button
              className={`rb-ico ${isFav ? "on" : ""}`}
              aria-label={isFav ? "즐겨찾기 해제" : "즐겨찾기"}
              onClick={() => toggleFav(r)}>
              <Star size={16} fill={isFav ? GOLD : "none"} />
            </button>
            <button className="rb-ico" aria-label="닫기" onClick={onClose}><X size={17} /></button>
          </div>
        </div>

        <div className="rb-sh-body">
          {thumb && (
            <a className="rb-dthumb" href={r.sourceUrl} target="_blank" rel="noopener noreferrer" title="원본 영상 보기">
              <img src={thumb} alt=""
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }} />
              <span className="play"><i><Play size={22} fill="#fff" /></i></span>
            </a>
          )}
          <p style={{ color: "var(--soft)", fontSize: 14, lineHeight: 1.6, marginTop: 0, marginBottom: 4 }}>{r.description}</p>
          {r.sourceUrl && (
            <a className="rb-citation" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">
              <Link2 size={13} /> <span>출처: {r.sourceTitle || r.sourceUrl}</span>
            </a>
          )}

          <div className="rb-meta" style={{ fontSize: 13, marginTop: 12 }}>
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
                    fill={n <= myLog.rating ? GOLD : "none"}
                    color={n <= myLog.rating ? GOLD : STAR_OFF} />
                ))}
              </span>
            </div>
          )}

          <div className="rb-row" style={{ marginTop: 18, gap: 10, flexWrap: "wrap" }}>
            <button className="rb-btn dark" onClick={() => { if (requireLogin()) onCook(); }}><Play size={15} /> 요리 모드 시작</button>
            <button className="rb-btn" onClick={() => markCooked(r.id)}><Check size={15} /> 만들었어요 +1</button>
            <button className={`rb-btn ${inCart ? "acc" : ""}`} onClick={() => toggleCart(r)}>
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
                        : <button className="rb-tbtn" onClick={() => startTimer(key, total, s.title)}><Play size={15} /></button>}
                      <button className="rb-tbtn g" onClick={() => resetTimer(key, total)}><RotateCcw size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* comments */}
          <CommentSection r={r} users={users} currentUserId={currentUserId} update={update} requireLogin={requireLogin} />

          <div style={{ marginTop: 26, textAlign: "right" }}>
            <button className="rb-btn ghost" style={{ color: "var(--danger)" }}
              onClick={() => { if (!requireLogin()) return; if (confirm("이 레시피를 삭제할까요?")) remove(r.id); }}>
              <Trash2 size={15} /> 레시피 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COMMENT SECTION                                                    */
/* ------------------------------------------------------------------ */
function CommentSection({ r, users, currentUserId, update, requireLogin }) {
  const [text, setText] = useState("");
  const comments = r.comments || [];

  const addComment = () => {
    if (!requireLogin()) return;
    const t = text.trim();
    if (!t) return;
    const next = [...comments, { id: uid(), userId: currentUserId, text: t, createdAt: Date.now() }];
    update(r.id, { comments: next });
    setText("");
    toast("댓글을 등록했어요");
  };
  const delComment = (cid) => {
    update(r.id, { comments: comments.filter((c) => c.id !== cid) });
    toast("댓글을 삭제했어요");
  };

  return (
    <>
      <div className="rb-sec-h"><MessageCircle size={16} /> 댓글
        {comments.length > 0 && <span style={{ color: "var(--soft)", fontWeight: 400, fontSize: 13 }}>{comments.length}</span>}
      </div>

      {comments.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          {comments.slice().sort((a, b) => a.createdAt - b.createdAt).map((c) => {
            const u = users.find((x) => x.id === c.userId);
            return (
              <div key={c.id} className="rb-comment">
                <UserAvatar user={u || { emoji: "🧑" }} size={30} />
                <div className="rb-comment-body">
                  <div className="rb-comment-head">
                    <span className="rb-comment-name">{u?.name || "알 수 없음"}</span>
                    <span className="rb-comment-date">{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
                  </div>
                  <div className="rb-comment-text">{c.text}</div>
                </div>
                {c.userId === currentUserId && (
                  <span className="rb-comment-del" onClick={() => delComment(c.id)}>삭제</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {currentUserId ? (
        <div style={{ position: "relative", marginTop: 8 }}>
          <textarea className="rb-ta" value={text} onChange={(e) => setText(e.target.value)}
            placeholder="댓글 입력…" style={{ minHeight: 48, paddingRight: 52 }}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addComment(); }} />
          <button className="rb-btn acc" title="댓글 등록"
            style={{ position: "absolute", right: 8, bottom: 8, padding: 0, width: 36, height: 36,
              borderRadius: 999, justifyContent: "center" }}
            disabled={!text.trim()} onClick={addComment}>
            <Send size={16} />
          </button>
        </div>
      ) : (
        <button className="rb-btn" style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
          onClick={() => requireLogin()}>
          <LogIn size={15} /> 로그인하고 댓글 남기기
        </button>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  COOK MODE                                                          */
/* ------------------------------------------------------------------ */
function CookMode({ r, timers, startTimer, pauseTimer, resetTimer, onClose, onFinish }) {
  const [i, setI] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [rating, setRating] = useState(0);

  /* 요리 중 화면 꺼짐 방지 (Wake Lock — 미지원 브라우저는 조용히 무시) */
  useEffect(() => {
    let lock = null;
    const acquire = () => navigator.wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => {});
    acquire();
    const onVis = () => { if (document.visibilityState === "visible") acquire(); }; // 탭 복귀 시 재획득
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); lock?.release().catch(() => {}); };
  }, []);
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
        <button className="rb-ico" aria-label="요리 모드 닫기" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="rb-cook-b">
        {finishing ? (
          <>
            <div className="rb-cook-step">요리 완료</div>
            <div className="rb-cook-t">오늘 요리는 어땠나요?</div>
            <div style={{ display: "flex", gap: 6, margin: "10px 0 18px" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={38} style={{ cursor: "pointer" }}
                  fill={n <= rating ? GOLD : "none"}
                  color={n <= rating ? GOLD : STAR_OFF}
                  onClick={() => setRating(n)} />
              ))}
            </div>
            <div style={{ fontSize: 13.5, color: "var(--soft)", lineHeight: 1.6 }}>
              남기고 싶은 이야기는 레시피 댓글로 적어주세요.
            </div>
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
                    : <button className="rb-btn acc" onClick={() => startTimer(key, total, s.title)}><Play size={16} /> 타이머 시작</button>}
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
            <button className="rb-btn acc" onClick={() => onFinish(rating)}>
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
function ShoppingView({ cartRecipes, checked, setChecked, onRemove, onClear, onOpen }) {
  // 요리별 인분 설정 (기본: 각 레시피 baseServings) — 새로고침·탭 이동에도 유지
  const [servingsMap, setServingsMap] = useState(() => loadJSON(STORE_SHOP_SERVINGS_KEY, {}));
  useEffect(() => { saveJSON(STORE_SHOP_SERVINGS_KEY, servingsMap); }, [servingsMap]);
  const getServings = (r) => servingsMap[r.id] ?? r.baseServings;
  const bumpServings = (r, delta) => setServingsMap((m) => {
    const cur = m[r.id] ?? r.baseServings;
    return { ...m, [r.id]: Math.max(1, cur + delta) };
  });

  const shopList = useMemo(() => {
    const map = {};
    cartRecipes.forEach((r) => {
      const factor = (servingsMap[r.id] ?? r.baseServings) / r.baseServings;
      r.ingredients.forEach((ing) => {
        const key = `${ing.name}|${ing.unit}`;
        if (!map[key]) map[key] = { name: ing.name, unit: ing.unit, group: ing.group || "기타", amount: 0, from: [] };
        map[key].amount += (Number(ing.amount) || 0) * factor;
        if (!map[key].from.includes(r.title)) map[key].from.push(r.title);
      });
    });
    const byGroup = {};
    Object.entries(map).forEach(([k, v]) => {
      (byGroup[v.group] = byGroup[v.group] || []).push({ key: k, ...v });
    });
    return byGroup;
  }, [cartRecipes, servingsMap]);

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
        저장된 레시피에서 <ShoppingCart size={13} style={{ verticalAlign: "middle" }} /> 아이콘을 눌러 레시피를 담으면<br />
        필요한 재료가 자동으로 합산됩니다.
      </div>
    );

  return (
    <div>
      {/* 담긴 요리 리스트 + 요리별 인분 설정 */}
      <div className="rb-grp" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
        담은 요리 {cartRecipes.length}개
      </div>
      <div style={{ marginBottom: 22 }}>
        {cartRecipes.map((r) => (
          <div key={r.id} className="rb-shop-recipe">
            <span className="rb-dot" style={{ background: CAT_COLOR[r.category], flex: "none" }} />
            <span className="nm" onClick={() => onOpen(r.id)}>{r.title}</span>
            <div className="rb-serv" style={{ flex: "none" }}>
              <button onClick={() => bumpServings(r, -1)}><Minus size={14} /></button>
              <b style={{ fontSize: 14 }}>{getServings(r)}인분</b>
              <button onClick={() => bumpServings(r, 1)}><Plus size={14} /></button>
            </div>
            <button className="rb-ico" style={{ width: 28, height: 28, flex: "none" }} title="빼기" aria-label="장보기에서 빼기" onClick={() => onRemove(r.id)}>
              <X size={14} />
            </button>
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
                  <span style={{ fontSize: 10.5, color: "var(--soft)", background: "var(--accent-soft)", padding: "2px 7px", borderRadius: 999 }}>
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
  const [draft, setDraft] = useState(null); // AI 미리보기 → '수정해서 등록'으로 넘어온 초안
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
          <button className="rb-ico" aria-label="닫기" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="rb-sh-body">
          {mode === "ai"
            ? <AIImport onAdd={onAdd} currentUserId={currentUserId}
                onEdit={(r) => { setDraft(r); setMode("manual"); }} />
            : <ManualForm onSubmit={onAdd} currentUserId={currentUserId} initial={draft} />}
        </div>
      </div>
    </div>
  );
}

function AIImport({ onAdd, onEdit, currentUserId }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  /* 진행 경과 — 영상 분석은 30초+ 걸릴 수 있어 단계별 안내를 보여준다 */
  useEffect(() => {
    if (!busy) { setElapsed(0); return; }
    const t0 = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [busy]);
  const isYoutube = /youtu\.be\/|youtube\.com\//.test(input);
  const busyMsg =
    elapsed < 5 ? "레시피를 가져오는 중…"
    : elapsed < 25 ? (isYoutube ? "영상을 보고 재료·단계를 정리하는 중… (보통 20~40초)" : "검색하고 정리하는 중…")
    : "거의 다 됐어요 — 조금만 기다려 주세요";

  const run = async () => {
    if (!input.trim()) return;
    setBusy(true); setErr("");

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 90000); // 90초 타임아웃
    try {
      // 자막 추출·AI 호출은 Supabase Edge Function(import-recipe)에서 서버사이드로 처리.
      // 유튜브 링크면 영상을 분석해 레시피화하고, 그 외엔 검색 그라운딩을 사용한다.
      // 서버가 로그인 사용자만 받도록 사용자 액세스 토큰을 보낸다(Gemini 무단 호출 차단).
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || SUPABASE_ANON_KEY;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/import-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ input: input.trim() }),
        signal: ctrl.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (data?.needsManualInput) {
        setErr("이 영상은 자동으로 분석할 수 없어요(비공개·삭제됐거나 분석이 불가한 영상). '직접 입력'을 이용하거나, 영상 설명란의 레시피 텍스트를 붙여넣어 주세요.");
        setBusy(false);
        return;
      }
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `서버 오류 ${res.status}`);
      }

      const text = data.text || "";
      if (!text.trim()) throw new Error("응답이 비어있습니다.");
      const source = data.source || { url: "", title: "" };

      const clean = text.replace(/```json|```/g, "").trim();
      const m = clean.match(/\{[\s\S]*\}/);
      let jsonStr = m ? m[0] : clean;
      // 안전망: amount의 비정상 값(분수 1/2·범위 2~3·"적당히" 등)은 문자열로 감싸 JSON 유효화 → parseAmount가 복원
      jsonStr = jsonStr
        .replace(/("amount"\s*:\s*)([^,}\]]+)/g, (_m, p, val) => {
          const t = val.trim();
          if (/^-?\d*\.?\d+$/.test(t) || t === "null" || (t.startsWith('"') && t.endsWith('"'))) return p + t;
          return p + JSON.stringify(t);
        })
        .replace(/("(?:baseServings|totalMinutes|timerSeconds)"\s*:\s*)(?!-?\d|null|")([^,}\]]+)/g, "$1null");
      const obj = JSON.parse(jsonStr);
      const recipe = normalize(obj, currentUserId, source);
      setPreview(recipe);
    } catch (e) {
      console.error(e);
      setErr(e?.name === "AbortError"
        ? "시간이 너무 오래 걸려 중단했어요. 잠시 후 다시 시도해 주세요."
        : "검색 또는 레시피 생성에 실패했어요. 입력 내용을 확인하거나 잠시 후 다시 시도해 주세요.");
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!preview) return;
    setSaving(true);
    try { await onAdd(preview); }
    finally { setSaving(false); }
  };

  if (preview) {
    return (
      <RecipePreview recipe={preview} saving={saving}
        onConfirm={confirm} onEdit={onEdit ? () => onEdit(preview) : null}
        onRetry={() => { setPreview(null); setErr(""); }} />
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13.5, color: "var(--soft)", lineHeight: 1.6, marginBottom: 14 }}>
        요리 이름(예: <b>편스토랑 어남선생 닭볶음탕</b>), <b>유튜브 링크</b>, <b>URL</b>, 또는 레시피 <b>텍스트</b>를 넣으세요.
        유튜브는 <b>영상(화면+음성)을 직접 분석</b>하고, 그 외엔 <b>웹 검색</b>으로 재료·단계·타이머까지 자동으로 정리해 줍니다.
      </p>
      <textarea className="rb-ta" value={input} onChange={(e) => setInput(e.target.value)}
        placeholder={"예) 백종원 김치찌개\n또는 https://youtu.be/...\n또는 레시피 텍스트 붙여넣기"} style={{ minHeight: 130 }} />
      {err && <div style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 8 }}>{err}</div>}
      <button className="rb-btn acc" style={{ marginTop: 14, width: "100%", justifyContent: "center", padding: 13 }}
        disabled={busy || !input.trim()} onClick={run}>
        {busy
          ? <><Loader2 size={16} className="rb-spin" /> {busyMsg} ({elapsed}초)</>
          : <><Sparkles size={16} /> AI로 검색 및 정리하기</>}
      </button>
    </div>
  );
}

function RecipePreview({ recipe, saving, onConfirm, onRetry, onEdit }) {
  const c = CAT_COLOR[recipe.category] || "var(--soft)";
  return (
    <div>
      <p style={{ fontSize: 12.5, color: "var(--soft)", marginBottom: 12 }}>
        가져온 레시피예요. 내용을 확인하고 등록하세요.
      </p>
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 16 }}>
        <div className="rb-row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>{recipe.title}</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: c, background: c + "18", borderRadius: 999, padding: "2px 10px" }}>{recipe.category}</span>
        </div>
        {recipe.sourceUrl && (
          <a className="rb-citation" href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
            <Link2 size={12} /> <span>출처: {recipe.sourceTitle || "원문 보기"}</span>
          </a>
        )}
        {recipe.description && (
          <p style={{ fontSize: 13, color: "var(--soft)", lineHeight: 1.6, marginTop: 10 }}>{recipe.description}</p>
        )}
        <div className="rb-meta">
          <span><Utensils size={12} /> {recipe.baseServings}인분</span>
          <span><Clock size={12} /> {recipe.totalMinutes}분</span>
          <span><Flame size={12} /> {recipe.difficulty}</span>
        </div>
        {recipe.tags.length > 0 && (
          <div className="rb-tags">{recipe.tags.map((t) => <span key={t} className="rb-tag">#{t}</span>)}</div>
        )}

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>재료 {recipe.ingredients.length}가지</div>
          {recipe.ingredients.map((i) => (
            <div key={i.id} className="rb-row" style={{ justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 13, color: "var(--ink)" }}>{i.name}</span>
              <span style={{ fontSize: 13, color: "var(--soft)" }}>{i.amount > 0 ? `${i.amount} ${i.unit}` : (i.unit || "-")}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>조리 {recipe.steps.length}단계</div>
          {recipe.steps.map((s, idx) => (
            <div key={s.id} className="rb-row" style={{ gap: 10, alignItems: "flex-start", padding: "6px 0" }}>
              <span style={{ flex: "none", width: 22, height: 22, borderRadius: 999, background: "var(--ink)", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
              <div style={{ flex: 1 }}>
                {s.title && <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{s.title}</div>}
                <div style={{ fontSize: 12.5, color: "var(--soft)", lineHeight: 1.5 }}>{s.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rb-row" style={{ gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button className="rb-btn" style={{ flex: 1, justifyContent: "center" }} onClick={onRetry} disabled={saving}>
          <RotateCcw size={15} /> 다시 가져오기
        </button>
        {onEdit && (
          <button className="rb-btn" style={{ flex: 1, justifyContent: "center" }} onClick={onEdit} disabled={saving}>
            <Pencil size={14} /> 수정해서 등록
          </button>
        )}
        <button className="rb-btn acc" style={{ flex: 2, justifyContent: "center" }} onClick={onConfirm} disabled={saving}>
          {saving ? <><Loader2 size={15} className="rb-spin" /> 등록 중…</> : <><Check size={16} /> 등록하기</>}
        </button>
      </div>
    </div>
  );
}

// 분량 파싱: 숫자/분수("1/2")/범위("2~3","2-3")/혼합("1과 1/2")/문자열 안 숫자 추출
function parseAmount(v) {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  if (v == null) return 0;
  let s = String(v).trim().replace(/\s+/g, " ");
  if (!s) return 0;
  // 범위(2~3, 2-3, 2.5-3)는 하한값 사용
  const range = s.match(/^(-?\d*\.?\d+(?:\/\d+)?)\s*[~\-–]\s*(-?\d*\.?\d+(?:\/\d+)?)/);
  if (range) s = range[1];
  const toNum = (str) => {
    str = str.trim();
    let total = 0, matched = false;
    // "1과 1/2", "1 1/2" 같은 정수+분수 혼합 및 단일 분수/소수
    for (const tok of str.split(/\s*과\s*|\s+/)) {
      const frac = tok.match(/^(-?\d+)\/(\d+)$/);
      if (frac) { total += Number(frac[1]) / Number(frac[2]); matched = true; continue; }
      const num = tok.match(/^-?\d*\.?\d+$/);
      if (num) { total += Number(tok); matched = true; }
    }
    return matched ? total : NaN;
  };
  let n = toNum(s);
  if (!isFinite(n)) {
    // 마지막 안전망: 문자열 어디든 첫 숫자/분수 추출
    const m = s.match(/(\d+\/\d+|\d*\.?\d+)/);
    n = m ? toNum(m[1]) : 0;
  }
  return isFinite(n) ? n : 0;
}

function normalize(obj, createdBy, source = {}) {
  return {
    title: obj.title || "제목 없는 레시피",
    category: CATS.includes(obj.category) ? obj.category : "기타",
    description: obj.description || "",
    baseServings: Number(obj.baseServings) || 2,
    totalMinutes: Number(obj.totalMinutes) || 30,
    difficulty: ["쉬움", "보통", "어려움"].includes(obj.difficulty) ? obj.difficulty : "보통",
    tags: Array.isArray(obj.tags) ? obj.tags.slice(0, 6) : [],
    createdBy, updatedBy: createdBy,
    sourceUrl: source.url || "", sourceTitle: source.title || "",
    favorites: [], inCartBy: [], notes: {}, comments: [], cookLogs: [],
    ingredients: (obj.ingredients || []).map((i) => ({
      id: uid(), name: i.name || "", amount: parseAmount(i.amount),
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
    sourceUrl: initial.sourceUrl || "", sourceTitle: initial.sourceTitle || "",
  } : {
    title: "", category: "한식", description: "", baseServings: 2, totalMinutes: 30, difficulty: "보통", tags: "",
    sourceUrl: "", sourceTitle: "",
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
    if (initial && initial.id) {
      // 기존 레시피 편집
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
      {initial && (
        <div className="rb-row" style={{ gap: 12 }}>
          <div className="rb-field" style={{ flex: 2 }}><label className="rb-lab">출처 링크 (citation)</label>
            <input className="rb-in" value={f.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} placeholder="https://..." /></div>
          <div className="rb-field" style={{ flex: 1 }}><label className="rb-lab">출처 제목</label>
            <input className="rb-in" value={f.sourceTitle} onChange={(e) => set("sourceTitle", e.target.value)} placeholder="원문 제목" /></div>
        </div>
      )}

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
          <button className="rb-ico" aria-label="재료 삭제" onClick={() => setIngs((p) => p.filter((x) => x.id !== it.id))}><X size={14} /></button>
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
            <button className="rb-ico" aria-label="단계 삭제" onClick={() => setSteps((p) => p.filter((x) => x.id !== st.id))}><X size={14} /></button>
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
