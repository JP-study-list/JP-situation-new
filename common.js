/* =========================================================
   common.js — 日文情境學習工具 共用模組
   提供：收藏資料層、Firebase 同步、回首頁按鈕
   使用方式：<script type="module" src="./common.js"></script>
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------------- Firebase ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBB0uniuOE0OFG_xj9Ld8eM64PpNO2M3Vk",
  authDomain: "jpsituations.firebaseapp.com",
  projectId: "jpsituations",
  storageBucket: "jpsituations.firebasestorage.app",
  messagingSenderId: "52165806961",
  appId: "1:52165806961:web:59fc91bb40645eb37844d0"
};

let db = null;
try {
  db = getFirestore(initializeApp(firebaseConfig));
} catch (e) {
  console.warn("[common] Firebase 初始化失敗，改用本機模式", e);
}

/* ---------------- 儲存鍵 ---------------- */
const LS_FAVS = "jp-hub-favs";
const LS_DAYS = "jp-hub-days";
const LS_VISITS = "jp-hub-visits";
const LS_RECENT = "jp-hub-recent";
const LS_CODE = "jp-hub-synccode";

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

let favs = loadJSON(LS_FAVS, {});
let syncCode = localStorage.getItem(LS_CODE) || null;
let pushTimer = null;

/* 目前頁面檔名，例如 "hotel.html" */
const PAGE = (location.pathname.split("/").pop() || "index.html");

/* ---------------- 收藏核心 ---------------- */
/* key 格式：
     單字   → "hotel.html::word::チェックイン"
     例句   → "hotel.html::phrase::checkin-0-3"
   value  → { type, jp, kana, zh, page, ts }                    */

function favKey(type, id, page) {
  return `${page || PAGE}::${type}::${id}`;
}

function isFav(type, id, page) {
  return !!favs[favKey(type, id, page)];
}

function toggleFav(type, id, data, page) {
  const k = favKey(type, id, page);
  if (favs[k]) delete favs[k];
  else favs[k] = { type, page: page || PAGE, ts: Date.now(), ...data };
  localStorage.setItem(LS_FAVS, JSON.stringify(favs));
  schedulePush();
  window.dispatchEvent(new CustomEvent("favs-changed", { detail: { key: k, on: !!favs[k] } }));
  return !!favs[k];
}

function getFavs() { return favs; }

/* ---------------- 雲端同步 ---------------- */
function mergeCount(a, b) {
  const out = { ...a };
  for (const k in b) out[k] = Math.max(out[k] || 0, b[k]);
  return out;
}

/* 收藏合併：以 ts 較新者為準；一邊有一邊無時，取有的那邊 */
function mergeFavs(local, remote) {
  const out = { ...remote };
  for (const k in local) {
    if (!out[k] || (local[k].ts || 0) > (out[k].ts || 0)) out[k] = local[k];
  }
  return out;
}

async function pullCloud() {
  if (!db || !syncCode) return null;
  try {
    const snap = await getDoc(doc(db, "learners", syncCode));
    if (!snap.exists()) return {};
    const d = snap.data();
    favs = mergeFavs(favs, d.favs || {});
    localStorage.setItem(LS_FAVS, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent("favs-synced"));
    return d;
  } catch (e) {
    console.warn("[common] 雲端讀取失敗", e);
    return null;
  }
}

async function pushCloud(extra = {}) {
  if (!db || !syncCode) return false;
  try {
    await setDoc(doc(db, "learners", syncCode), {
      favs,
      days: loadJSON(LS_DAYS, {}),
      visits: loadJSON(LS_VISITS, {}),
      recent: loadJSON(LS_RECENT, []),
      updated: new Date().toISOString(),
      ...extra
    }, { merge: true });
    return true;
  } catch (e) {
    console.warn("[common] 雲端寫入失敗", e);
    return false;
  }
}

/* 收藏連點時避免每次都打雲端 */
function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushCloud(), 800);
}

function setSyncCode(code) {
  syncCode = code;
  localStorage.setItem(LS_CODE, code);
}
function getSyncCode() { return syncCode; }
function hasCloud() { return !!(db && syncCode); }

/* ---------------- 主題偏好（與 hub 共用） ---------------- */
const LS_THEME = "hub-dark";

function getThemePref() {
  const v = localStorage.getItem(LS_THEME);
  if (v === "1") return "dark";
  if (v === "0") return "light";
  return null; // 未設定過
}
function setThemePref(theme) {
  localStorage.setItem(LS_THEME, theme === "dark" ? "1" : "0");
}

/* ---------------- 回首頁按鈕（僅 standalone 模式） ---------------- */
function mountHomeButton() {
  if (PAGE === "index.html" || PAGE === "") return;
  const standalone = window.navigator.standalone ||
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
  if (!standalone) return;

  const btn = document.createElement("a");
  btn.href = "./index.html";
  btn.setAttribute("aria-label", "回首頁");
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10h14V10"/></svg>';
  btn.style.cssText =
    "position:fixed;bottom:18px;left:18px;z-index:9999;" +
    "width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;" +
    "background:rgba(28,28,26,.85);color:#d4a94e;text-decoration:none;" +
    "box-shadow:0 2px 10px rgba(0,0,0,.25);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);";
  document.body.appendChild(btn);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountHomeButton);
} else {
  mountHomeButton();
}

/* 進站時先拉一次雲端收藏 */
pullCloud();

/* ---------------- 對外介面 ---------------- */
const JPHub = {
  PAGE,
  favKey, isFav, toggleFav, getFavs,
  pullCloud, pushCloud,
  setSyncCode, getSyncCode, hasCloud,
  getThemePref, setThemePref,
  loadJSON,
  LS: { FAVS: LS_FAVS, DAYS: LS_DAYS, VISITS: LS_VISITS, RECENT: LS_RECENT, CODE: LS_CODE, THEME: LS_THEME }
};

window.JPHub = JPHub;
window.dispatchEvent(new Event("jphub-ready"));

export default JPHub;
