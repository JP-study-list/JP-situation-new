/* ============================================================
   app.js — 日語情境學習工具共用引擎
   每個情境頁需在載入本檔前定義：
   VOCAB_DATA, CONFUSE_GROUPS, KANJI_READINGS, PHRASE_DATA, PAGE_CONFIG
   ============================================================ */

const cfg = PAGE_CONFIG;

/* ---------- 頁面骨架注入 ---------- */
document.body.insertAdjacentHTML('afterbegin', `

<header class="topbar">
  <div class="topbar-left">
    <span class="topbar-title">${cfg.title}</span>
  </div>
  <div class="topbar-right">
    <button class="theme-toggle" id="themeToggle" title="切換晝夜模式" aria-label="切換晝夜模式">
      <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4.5"></circle>
        <line x1="12" y1="2.5" x2="12" y2="5"></line>
        <line x1="12" y1="19" x2="12" y2="21.5"></line>
        <line x1="4.2" y1="4.2" x2="6" y2="6"></line>
        <line x1="18" y1="18" x2="19.8" y2="19.8"></line>
        <line x1="2.5" y1="12" x2="5" y2="12"></line>
        <line x1="19" y1="12" x2="21.5" y2="12"></line>
        <line x1="4.2" y1="19.8" x2="6" y2="18"></line>
        <line x1="18" y1="6" x2="19.8" y2="4.2"></line>
      </svg>
    </button>
  </div>
</header>

<nav class="tabbar" id="modeTabbar">
  <div class="tab-item active" data-mode="ref">速查表</div>
  <div class="tab-item" data-mode="study">單字卡</div>
  <div class="tab-item" data-mode="phrase">常用句</div>
</nav>

<nav class="subtabbar" id="catTabbar"></nav>

<main class="main">

  <!-- ============ REF (速査表) VIEW ============ -->
  <section class="view active" id="view-ref">
    <nav class="inner-tabbar" id="refInnerTabbar">
      <div class="inner-tab-item active" data-submode="lookup">查詢</div>
      <div class="inner-tab-item" data-submode="confuse">易混淆</div>
    </nav>

    <!-- 查詢子視圖 -->
    <div class="inner-view active" id="ref-lookup">
      <div class="ref-toolbar-row">
        <p class="section-label" id="refLookupHint">點擊單字查看假名與中文意思</p>
        <div class="phrase-toggle-group">
          <button class="phrase-toggle-btn" id="toggleAutoSpeak" data-on="false">自動發音</button>
          <button class="phrase-toggle-btn" id="toggleRefZh" data-on="false">全顯示</button>
        </div>
      </div>
      <div class="shape-filter-row" id="shapeFilterRow" style="display:none;"></div>
      <div class="ref-grid" id="refGrid"></div>
    </div>

    <!-- 易混淆子視圖 -->
    <div class="inner-view" id="ref-confuse">
      <p class="section-label">容易混淆的單字組</p>
      <div id="confuseList"></div>
    </div>
  </section>

  <!-- ============ STUDY (flashcard) VIEW ============ -->
  <section class="view" id="view-study">
    <div class="study-toolbar-row">
      <nav class="inner-tabbar" id="studyInnerTabbar">
        <div class="inner-tab-item active" data-submode="memorize">記憶</div>
        <div class="inner-tab-item" data-submode="quiz">測驗</div>
      </nav>
      <button class="phrase-toggle-btn" id="favOnlyBtn" data-on="false" type="button">只練收藏</button>
      <button class="direction-toggle-btn" id="directionToggleBtn" type="button" style="display:none;">切換為「中→日」</button>
    </div>

    <!-- 記憶子視圖 -->
    <div class="inner-view active" id="study-memorize">
      <p class="section-label" id="studyHint">點擊卡片查看中文意思</p>
      <div class="study-layout">
        <div class="empty-state" id="studyEmpty" style="display:none;">
          尚未收藏任何單字。在速查表或單字卡上點擊星號即可加入收藏。
        </div>
        <div id="studyBody">
        <div class="card-panel" id="flashcard">
          <span class="card-index-tag" id="cardIndexTag">1 / 10</span>
          <div class="card-tools" id="cardTools"></div>
          <div class="card-jp" id="cardJp"></div>
          <div class="card-kana" id="cardKana"></div>
          <div class="card-zh" id="cardZh"></div>
          <div class="card-hint" id="cardHint">點擊卡片看中文</div>
        </div>
        <div class="card-nav-row">
          <button class="nav-btn" id="prevBtn">‹</button>
          <span class="nav-counter" id="navCounter">1 / 10</span>
          <button class="nav-btn" id="nextBtn">›</button>
          <button class="shuffle-btn" id="shuffleBtn">隨機排序</button>
        </div>
        </div>
      </div>
    </div>

    <!-- 測驗子視圖 -->
    <div class="inner-view" id="study-quiz">
      <div class="quiz-wrap">
        <div class="empty-state" id="quizEmpty" style="display:none;">
          尚未收藏任何單字。在速查表或單字卡上點擊星號即可加入收藏。
        </div>
        <div class="quiz-progress" id="quizProgress">第 1 題 / 共 10 題</div>
        <div id="quizContent">
          <div class="quiz-panel">
            <div class="quiz-question-label" id="quizQuestionLabel">這個單字的中文意思是？</div>
            <div class="quiz-jp" id="quizJp"></div>
            <div class="quiz-kana" id="quizKana"></div>
          </div>
          <div class="quiz-options" id="quizOptions"></div>
          <div class="quiz-feedback" id="quizFeedback"></div>
          <div class="quiz-footer">
            <span class="quiz-score">得分 <strong id="scoreText">0 / 0</strong></span>
            <button class="next-btn" id="nextQuestionBtn" disabled>下一題</button>
          </div>
        </div>
        <div id="quizResultView" style="display:none;">
          <div class="quiz-panel quiz-result">
            <div class="big-score" id="finalScore">0 / 10</div>
            <div class="result-msg" id="resultMsg"></div>
            <button class="restart-btn" id="restartBtn">再測一次</button>
            <button class="restart-btn retest-btn" id="retestWrongBtn" style="display:none;">只重測答錯的</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ PHRASE (常用句) VIEW ============ -->
  <section class="view" id="view-phrase">
    <div class="phrase-toolbar">
      <button class="phrase-toggle-btn scene-select-btn" id="sceneSelectBtn" data-open="false" type="button">選擇情境 ▾</button>
      <div class="phrase-toggle-group">
        <button class="phrase-toggle-btn" id="toggleZh" data-on="false">中文</button>
      </div>
    </div>
    <div class="scene-select-panel" id="sceneSelectPanel" style="display:none;">
      <nav class="scene-tabbar" id="sceneTabbar"></nav>
      <nav class="scenario-tabbar" id="scenarioTabbar"></nav>
      <div class="speaker-filter-row" id="speakerFilterRow">
        <div class="speaker-filter-item active" data-speaker="all">全部</div>
        <div class="speaker-filter-item" data-speaker="staff">只看${cfg.speakerLabels.staff}</div>
        <div class="speaker-filter-item" data-speaker="customer">只看${cfg.speakerLabels.customer}</div>
      </div>
    </div>
    <div class="playall-row">
      <button class="playall-btn" id="playAllBtn" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="playAllIcon">
          <polygon points="6 4 20 12 6 20 6 4"></polygon>
        </svg>
        <span id="playAllLabel">全部播放本情境</span>
      </button>
    </div>
    <div class="phrase-list" id="phraseList"></div>
  </section>

</main>
`);

/* ---------- 假名字典與 furigana ---------- */
KANJI_READINGS.sort((a, b) => b[0].length - a[0].length);

function buildFuriganaHTML(text) {
  let result = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [word, kana] of KANJI_READINGS) {
      if (text.startsWith(word, i) && /[\u4E00-\u9FFF]/.test(word)) {
        result += `<span class="furi" data-kana="${kana}">${word}</span>`;
        i += word.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i += 1;
    }
  }
  return result;
}

const PHRASE_KEYS = Object.keys(PHRASE_DATA);
let currentPhraseScene = cfg.defaultScene || PHRASE_KEYS[0];
let currentScenarioIndex = 0;

const CAT_KEYS = Object.keys(VOCAB_DATA);
let currentCat = cfg.defaultCat || CAT_KEYS[0];
let currentMode = "ref";        // "ref" | "study"
let refSubMode = "lookup";      // "lookup" | "confuse"
let studySubMode = "memorize";  // "memorize" | "quiz"

let studyOrder = [];
let studyIndex = 0;
let isFlipped = false;

let quizQueue = [];
let quizItems = [];
let quizOptionPool = [];
let quizWrongItems = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let quizDirection = "jp2zh"; // "jp2zh" | "zh2jp"
let autoAdvanceTimer = null;
let favOnly = false;         // 只練收藏模式

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function refreshCatTabbarVisibility() {
  const needsCat = (currentMode === 'ref' && refSubMode === 'lookup') ||
                    (currentMode === 'study' && (studySubMode === 'memorize' || studySubMode === 'quiz'));
  document.getElementById('catTabbar').style.display = (needsCat && !favOnly) ? 'flex' : 'none';
}

function refreshDirectionToggleVisibility() {
  const showToggle = currentMode === 'study' && studySubMode === 'quiz';
  document.getElementById('directionToggleBtn').style.display = showToggle ? 'inline-block' : 'none';
  document.getElementById('favOnlyBtn').style.display = currentMode === 'study' ? 'inline-block' : 'none';
}

/* ---------- top-level mode tabs ---------- */
document.querySelectorAll('#modeTabbar .tab-item').forEach(tab => {
  tab.addEventListener('click', () => {
    stopPlayAll();
    document.querySelectorAll('#modeTabbar .tab-item').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentMode = tab.dataset.mode;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + currentMode).classList.add('active');

    refreshCatTabbarVisibility();
    refreshDirectionToggleVisibility();
    enterCurrentMode();
  });
});

/* ---------- inner sub-mode tabs ---------- */
document.getElementById('refInnerTabbar').addEventListener('click', (e) => {
  const item = e.target.closest('.inner-tab-item');
  if (!item) return;
  document.querySelectorAll('#refInnerTabbar .inner-tab-item').forEach(t => t.classList.remove('active'));
  item.classList.add('active');
  refSubMode = item.dataset.submode;
  document.querySelectorAll('#view-ref .inner-view').forEach(v => v.classList.remove('active'));
  document.getElementById('ref-' + refSubMode).classList.add('active');
  refreshCatTabbarVisibility();
  enterCurrentMode();
});

document.getElementById('studyInnerTabbar').addEventListener('click', (e) => {
  const item = e.target.closest('.inner-tab-item');
  if (!item) return;
  document.querySelectorAll('#studyInnerTabbar .inner-tab-item').forEach(t => t.classList.remove('active'));
  item.classList.add('active');
  studySubMode = item.dataset.submode;
  document.querySelectorAll('#view-study .inner-view').forEach(v => v.classList.remove('active'));
  document.getElementById('study-' + studySubMode).classList.add('active');
  refreshCatTabbarVisibility();
  refreshDirectionToggleVisibility();
  enterCurrentMode();
});

/* ---------- dispatch ---------- */
function enterCurrentMode() {
  if (currentMode === 'ref') {
    if (refSubMode === 'lookup') renderRef();
    if (refSubMode === 'confuse') renderConfuse();
  } else if (currentMode === 'study') {
    if (studySubMode === 'memorize') initStudy();
    if (studySubMode === 'quiz') initQuiz();
  } else if (currentMode === 'phrase') {
    renderPhrase();
  }
}

/* ---------- category sub-tabs ---------- */
function buildCatTabs() {
  const bar = document.getElementById('catTabbar');
  bar.innerHTML = '';
  CAT_KEYS.forEach(key => {
    const cat = VOCAB_DATA[key];
    const el = document.createElement('div');
    el.className = 'subtab-item' + (key === currentCat ? ' active' : '');
    el.textContent = cat.label;
    el.addEventListener('click', () => {
      currentCat = key;
      buildCatTabs();
      enterCurrentMode();
    });
    bar.appendChild(el);
  });
}

/* ================= 共用元件：星號 / 發音 ================= */
const STAR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2.5 15 9 22 9.8 16.8 14.5 18.3 21.5 12 17.9 5.7 21.5 7.2 14.5 2 9.8 9 9 12 2.5"></polygon></svg>`;
const SPEAK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18 6a8.5 8.5 0 0 1 0 12"></path></svg>`;

/* 等待 common.js 就緒（若未載入則所有收藏功能靜默停用） */
function hub() { return window.JPHub || null; }

/* 單字收藏 id 加上分類前綴，避免同一詞出現在不同分類時互相覆蓋 */
function wordId(catKey, jp) { return `${catKey}::${jp}`; }

function makeStarBtn(type, id, data) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'icon-btn';
  btn.innerHTML = STAR_SVG;
  btn.setAttribute('aria-label', '收藏');
  btn.title = '收藏';

  const sync = () => {
    const h = hub();
    btn.classList.toggle('starred', !!(h && h.isFav(type, id)));
  };
  sync();
  window.addEventListener('jphub-ready', sync);
  window.addEventListener('favs-synced', sync);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const h = hub();
    if (!h) return;
    const on = h.toggleFav(type, id, data);
    btn.classList.toggle('starred', on);
  });
  return btn;
}

function makeSpeakBtn(text) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'icon-btn';
  btn.innerHTML = SPEAK_SVG;
  btn.setAttribute('aria-label', '播放發音');
  btn.title = '播放發音';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    stopPlayAll();
    speakWord(text, btn);
  });
  return btn;
}

/* 單字用發音（中性音色，與對話的 staff/customer 區分開） */
function speakWord(text, btn) {
  if (!('speechSynthesis' in window)) {
    alert('您的瀏覽器不支援語音播放功能');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  const voices = getJaVoices();
  if (voices.length) utter.voice = voices[0];
  utter.pitch = 1.0;
  utter.rate = 0.9;

  document.querySelectorAll('.icon-btn.playing').forEach(b => b.classList.remove('playing'));
  if (btn) btn.classList.add('playing');
  const clear = () => { if (btn) btn.classList.remove('playing'); };
  utter.onend = clear;
  utter.onerror = clear;
  window.speechSynthesis.speak(utter);
}

/* ================= REF (速査表) ================= */
let currentShapeFilter = "all";
let refZhPinned = false;
let autoSpeak = false;
const PAGE_KEY = cfg.pageKey;

const SHAPE_LABELS = cfg.shapeLabels || { all: "全部" };

function getRefItems() {
  const cat = VOCAB_DATA[currentCat];
  if (currentShapeFilter === "all") return cat.items;
  return cat.items.filter(it => it.shape === currentShapeFilter);
}

function renderShapeFilter() {
  const cat = VOCAB_DATA[currentCat];
  const row = document.getElementById('shapeFilterRow');
  const shapesPresent = [...new Set(cat.items.filter(it => it.shape).map(it => it.shape))];

  if (shapesPresent.length === 0) {
    row.style.display = 'none';
    row.innerHTML = '';
    return;
  }

  row.style.display = 'flex';
  row.innerHTML = '';
  const options = ["all", ...shapesPresent];
  options.forEach(key => {
    const pill = document.createElement('div');
    pill.className = 'shape-filter-item' + (key === currentShapeFilter ? ' active' : '');
    pill.textContent = SHAPE_LABELS[key] || key;
    pill.addEventListener('click', () => {
      currentShapeFilter = key;
      renderShapeFilter();
      renderRef(true);
    });
    row.appendChild(pill);
  });
}

function refCellBody(item, revealed) {
  return revealed
    ? `<span class="ref-cell-kana">${item.kana}</span><span class="ref-cell-zh">${item.zh}</span>`
    : `<span class="ref-cell-jp">${item.jp}</span>`;
}

function attachRefTools(cell, item) {
  // 方案A：未翻開的格子保持乾淨，不顯示任何圖示
  if (!cell.classList.contains('revealed')) return;
  const tools = document.createElement('div');
  tools.className = 'ref-cell-tools';
  // 全顯示（掃讀）模式只留星號；翻牌模式提供喇叭重播＋星號
  if (!refZhPinned) tools.appendChild(makeSpeakBtn(item.jp));
  tools.appendChild(makeStarBtn('word', wordId(currentCat, item.jp),
    { jp: item.jp, kana: item.kana, zh: item.zh, cat: VOCAB_DATA[currentCat].label }));
  cell.appendChild(tools);
}

function renderRefCell(cell, item) {
  if (refZhPinned) {
    cell.classList.add('revealed');
    cell.innerHTML = refCellBody(item, true);
  } else {
    cell.classList.remove('revealed');
    cell.innerHTML = refCellBody(item, false);
  }
  attachRefTools(cell, item);
}

function renderRef(keepFilter) {
  if (!keepFilter) currentShapeFilter = "all";
  renderShapeFilter();

  const items = getRefItems();
  const grid = document.getElementById('refGrid');
  grid.classList.toggle('zh-pinned', refZhPinned);
  grid.innerHTML = '';
  items.forEach((item) => {
    const cell = document.createElement('div');
    cell.className = 'ref-cell';
    renderRefCell(cell, item);
    cell.addEventListener('click', () => {
      if (refZhPinned) return; // 中文常駐模式下不需要點擊翻牌
      const revealed = cell.classList.toggle('revealed');
      cell.innerHTML = refCellBody(item, revealed);
      attachRefTools(cell, item);
      // 方案B：開啟自動發音時，翻開即唸一次（喇叭鈕仍可重播）
      if (revealed && autoSpeak) {
        stopPlayAll();
        speakWord(item.jp, cell.querySelector('.ref-cell-tools .icon-btn'));
      }
    });
    grid.appendChild(cell);
  });
}

document.getElementById('toggleRefZh').addEventListener('click', (e) => {
  const isOn = e.target.dataset.on === 'true';
  refZhPinned = !isOn;
  e.target.dataset.on = String(refZhPinned);
  document.getElementById('refLookupHint').textContent = refZhPinned
    ? '已顯示全部假名與中文意思'
    : '點擊單字查看假名與中文意思';
  localStorage.setItem(PAGE_KEY + '-refZh', refZhPinned ? '1' : '0');
  renderRef(true);
});

document.getElementById('toggleAutoSpeak').addEventListener('click', (e) => {
  const isOn = e.target.dataset.on === 'true';
  autoSpeak = !isOn;
  e.target.dataset.on = String(autoSpeak);
  localStorage.setItem(PAGE_KEY + '-autoSpeak', autoSpeak ? '1' : '0');
});

/* ================= STUDY ================= */

/* 目前單字卡／測驗要練的題目來源 */
function getStudyItems() {
  const cat = VOCAB_DATA[currentCat];
  if (!favOnly) return cat.items;
  const h = hub();
  if (!h) return [];
  // 收藏模式：跨分類收集本頁所有收藏單字
  const out = [];
  Object.entries(h.getFavs()).forEach(([, v]) => {
    if (v && v.type === 'word' && v.page === h.PAGE && v.jp) {
      out.push({ jp: v.jp, kana: v.kana, zh: v.zh });
    }
  });
  return out;
}

/* 找出某個單字屬於哪個分類（收藏模式下用來還原正確的 wordId） */
function catOfWord(jp) {
  for (const key of CAT_KEYS) {
    if (VOCAB_DATA[key].items.some(it => it.jp === jp)) return key;
  }
  return currentCat;
}

function updateStudyEmptyState() {
  const items = getStudyItems();
  const empty = favOnly && items.length < 1;
  const quizTooFew = favOnly && items.length < 4;

  document.getElementById('studyEmpty').style.display = empty ? 'block' : 'none';
  document.getElementById('studyBody').style.display = empty ? 'none' : 'block';
  document.getElementById('studyHint').style.display = empty ? 'none' : 'block';

  const qEmpty = document.getElementById('quizEmpty');
  const qContent = document.getElementById('quizContent');
  const qProgress = document.getElementById('quizProgress');
  if (quizTooFew) {
    qEmpty.textContent = items.length
      ? '收藏的單字少於 4 個，無法組成選擇題。請再多收藏幾個單字。'
      : '尚未收藏任何單字。在速查表或單字卡上點擊星號即可加入收藏。';
    qEmpty.style.display = 'block';
    qContent.style.display = 'none';
    document.getElementById('quizResultView').style.display = 'none';
    qProgress.style.display = 'none';
  } else {
    qEmpty.style.display = 'none';
    qProgress.style.display = 'block';
  }
  return { empty, quizTooFew };
}

document.getElementById('favOnlyBtn').addEventListener('click', (e) => {
  const isOn = e.target.dataset.on === 'true';
  favOnly = !isOn;
  e.target.dataset.on = String(favOnly);
  refreshCatTabbarVisibility();
  document.getElementById('studyHint').textContent = favOnly
    ? '只練收藏的單字，點擊卡片查看中文意思'
    : '點擊卡片查看中文意思';
  enterCurrentMode();
});

function initStudy() {
  const { empty } = updateStudyEmptyState();
  if (empty) return;
  const items = getStudyItems();
  studyOrder = items.map((_, i) => i);
  studyIndex = 0;
  isFlipped = false;
  renderStudyCard();
}

function renderStudyCard() {
  const items = getStudyItems();
  if (!items.length) return;
  if (studyIndex >= items.length) studyIndex = 0;
  const item = items[studyOrder[studyIndex]];
  if (!item) return;
  isFlipped = false;

  document.getElementById('cardJp').textContent = item.jp;
  document.getElementById('cardKana').textContent = item.kana;
  document.getElementById('cardZh').textContent = '';
  document.getElementById('cardHint').textContent = '點擊卡片看中文';

  const tools = document.getElementById('cardTools');
  tools.innerHTML = '';
  tools.appendChild(makeSpeakBtn(item.jp));
  tools.appendChild(makeStarBtn('word', wordId(catOfWord(item.jp), item.jp),
    { jp: item.jp, kana: item.kana, zh: item.zh, cat: VOCAB_DATA[catOfWord(item.jp)].label }));

  const pos = studyIndex + 1;
  const total = studyOrder.length;
  document.getElementById('cardIndexTag').textContent = `${pos} / ${total}`;
  document.getElementById('navCounter').textContent = `${pos} / ${total}`;
}

document.getElementById('flashcard').addEventListener('click', () => {
  if (swipeHandled) { swipeHandled = false; return; }
  const items = getStudyItems();
  const item = items[studyOrder[studyIndex]];
  if (!item) return;
  isFlipped = !isFlipped;
  document.getElementById('cardZh').textContent = isFlipped ? item.zh : '';
  document.getElementById('cardHint').textContent = isFlipped ? '點擊卡片隱藏中文' : '點擊卡片看中文';
});

/* 單字卡滑動手勢：左滑下一張、右滑上一張 */
let swipeStartX = 0, swipeStartY = 0, swipeHandled = false;
const flashcardEl = document.getElementById('flashcard');
flashcardEl.addEventListener('touchstart', (e) => {
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
  swipeHandled = false;
}, { passive: true });
flashcardEl.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - swipeStartX;
  const dy = e.changedTouches[0].clientY - swipeStartY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    swipeHandled = true;
    if (dx < 0) {
      document.getElementById('nextBtn').click();
    } else {
      document.getElementById('prevBtn').click();
    }
  }
}, { passive: true });

document.getElementById('nextBtn').addEventListener('click', () => {
  if (!studyOrder.length) return;
  studyIndex = (studyIndex + 1) % studyOrder.length;
  renderStudyCard();
});
document.getElementById('prevBtn').addEventListener('click', () => {
  if (!studyOrder.length) return;
  studyIndex = (studyIndex - 1 + studyOrder.length) % studyOrder.length;
  renderStudyCard();
});
document.getElementById('shuffleBtn').addEventListener('click', () => {
  studyOrder = shuffle(studyOrder);
  studyIndex = 0;
  renderStudyCard();
});

/* ================= QUIZ ================= */
function initQuiz(customItems) {
  const { quizTooFew } = updateStudyEmptyState();
  if (quizTooFew) return;

  quizOptionPool = getStudyItems();
  quizItems = (customItems && customItems.length) ? customItems : quizOptionPool;
  quizQueue = shuffle(quizItems.map((_, i) => i));
  quizWrongItems = [];
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  document.getElementById('quizContent').style.display = 'block';
  document.getElementById('quizResultView').style.display = 'none';
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const items = quizItems;
  const itemIdx = quizQueue[quizIndex];
  const item = items[itemIdx];
  if (!item) return;
  quizAnswered = false;
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }

  const label = document.getElementById('quizQuestionLabel');
  const kanaEl = document.getElementById('quizKana');

  if (quizDirection === 'jp2zh') {
    label.textContent = '這個單字的中文意思是？';
    document.getElementById('quizJp').textContent = item.jp;
    kanaEl.textContent = item.kana;
    kanaEl.style.display = '';
  } else {
    label.textContent = '這個中文對應的日文是？';
    document.getElementById('quizJp').textContent = item.zh;
    kanaEl.textContent = '';
    kanaEl.style.display = 'none';
  }

  document.getElementById('quizFeedback').innerHTML = '';
  document.getElementById('nextQuestionBtn').disabled = true;
  document.getElementById('quizProgress').textContent = `第 ${quizIndex + 1} 題 / 共 ${quizQueue.length} 題`;

  const correctAnswer = quizDirection === 'jp2zh' ? item.zh : item.jp;
  const pool = quizOptionPool
    .filter(x => x.jp !== item.jp)
    .map(x => quizDirection === 'jp2zh' ? x.zh : x.jp);
  const wrongs = shuffle(pool).slice(0, 3);
  const options = shuffle([correctAnswer, ...wrongs]);

  const optWrap = document.getElementById('quizOptions');
  optWrap.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(btn, opt, correctAnswer, item));
    optWrap.appendChild(btn);
  });

  document.getElementById('scoreText').textContent = `${quizScore} / ${quizIndex}`;
}

function handleAnswer(btn, chosen, correct, item) {
  if (quizAnswered) return;
  quizAnswered = true;
  document.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);

  const feedback = document.getElementById('quizFeedback');

  if (chosen === correct) {
    btn.classList.add('correct');
    quizScore++;
    feedback.textContent = '答對了';
  } else {
    btn.classList.add('wrong');
    if (item) quizWrongItems.push(item);
    document.querySelectorAll('.quiz-option').forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });

    // 答錯：顯示正確答案，並提供一鍵收藏這個單字
    feedback.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'quiz-feedback-row';
    const txt = document.createElement('span');
    txt.textContent = `正確答案：${correct}`;
    wrap.appendChild(txt);
    if (item) {
      const cat = catOfWord(item.jp);
      const star = makeStarBtn('word', wordId(cat, item.jp),
        { jp: item.jp, kana: item.kana, zh: item.zh, cat: VOCAB_DATA[cat].label });
      star.title = '收藏這個單字';
      wrap.appendChild(star);
      wrap.appendChild(makeSpeakBtn(item.jp));
    }
    feedback.appendChild(wrap);
  }
  document.getElementById('scoreText').textContent = `${quizScore} / ${quizIndex + 1}`;
  document.getElementById('nextQuestionBtn').disabled = false;

  if (chosen === correct) {
    autoAdvanceTimer = setTimeout(() => {
      autoAdvanceTimer = null;
      goToNextQuestion();
    }, 600);
  }
}

function goToNextQuestion() {
  quizIndex++;
  if (quizIndex >= quizQueue.length) {
    showQuizResult();
  } else {
    renderQuizQuestion();
  }
}

document.getElementById('nextQuestionBtn').addEventListener('click', () => {
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  goToNextQuestion();
});

document.getElementById('directionToggleBtn').addEventListener('click', (e) => {
  quizDirection = quizDirection === 'jp2zh' ? 'zh2jp' : 'jp2zh';
  e.target.textContent = quizDirection === 'jp2zh' ? '切換為「中→日」' : '切換為「日→中」';
  initQuiz();
});

function showQuizResult() {
  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('quizResultView').style.display = 'block';
  const total = quizQueue.length;
  document.getElementById('finalScore').textContent = `${quizScore} / ${total}`;
  let msg = '繼續加油，多複習幾次吧';
  const ratio = quizScore / total;
  if (ratio === 1) msg = '完美，這個分類已經記熟了';
  else if (ratio >= 0.8) msg = '很不錯，幾乎全對';
  else if (ratio >= 0.5) msg = '還可以，再複習一輪會更熟練';
  document.getElementById('resultMsg').textContent = msg;
  document.getElementById('retestWrongBtn').style.display = quizWrongItems.length ? 'inline-block' : 'none';
}

document.getElementById('restartBtn').addEventListener('click', () => initQuiz());
document.getElementById('retestWrongBtn').addEventListener('click', () => initQuiz(quizWrongItems.slice()));

/* ================= CONFUSE ================= */
function renderConfuse() {
  const wrap = document.getElementById('confuseList');
  wrap.innerHTML = '';
  CONFUSE_GROUPS.forEach(group => {
    const row = document.createElement('div');
    row.className = 'confuse-row';
    const itemsHtml = group.items.map(it =>
      `<div class="confuse-pill"><span class="k">${it.jp}（${it.kana}）</span><span class="z">${it.zh}</span></div>`
    ).join('');
    row.innerHTML = `<div class="confuse-title">${group.title}</div><div class="confuse-items">${itemsHtml}</div>`;
    wrap.appendChild(row);
  });
}

/* ================= PHRASE (常用句) ================= */
const SPEAKER_LABELS = cfg.speakerLabels;
let speakerFilter = "all";

/* 目前情境中，套用說話者篩選後的句子 */
function getPhraseItems() {
  const scene = PHRASE_DATA[currentPhraseScene];
  const scenario = scene.scenarios[currentScenarioIndex];
  const items = scenario.items.map((it, i) => ({ ...it, _idx: i }));
  if (speakerFilter === "all") return items;
  return items.filter(it => it.speaker === speakerFilter);
}

document.getElementById('speakerFilterRow').addEventListener('click', (e) => {
  const item = e.target.closest('.speaker-filter-item');
  if (!item) return;
  stopPlayAll();
  document.querySelectorAll('#speakerFilterRow .speaker-filter-item').forEach(el => el.classList.remove('active'));
  item.classList.add('active');
  speakerFilter = item.dataset.speaker;
  renderPhraseList();
});

/* ---------- 選擇情境收合面板 ---------- */
function setScenePanelOpen(open) {
  document.getElementById('sceneSelectPanel').style.display = open ? 'block' : 'none';
  document.getElementById('sceneSelectBtn').dataset.open = String(open);
}

function updateSceneSelectBtn() {
  const scene = PHRASE_DATA[currentPhraseScene];
  const scenario = scene.scenarios[currentScenarioIndex];
  document.getElementById('sceneSelectBtn').textContent = `${scene.label} ・ ${scenario.label} ▾`;
}

document.getElementById('sceneSelectBtn').addEventListener('click', () => {
  const open = document.getElementById('sceneSelectBtn').dataset.open === 'true';
  setScenePanelOpen(!open);
});

function buildSceneTabs() {
  const bar = document.getElementById('sceneTabbar');
  bar.innerHTML = '';
  PHRASE_KEYS.forEach(key => {
    const scene = PHRASE_DATA[key];
    const el = document.createElement('div');
    el.className = 'scene-tab-item' + (key === currentPhraseScene ? ' active' : '');
    el.textContent = scene.label;
    el.addEventListener('click', () => {
      stopPlayAll();
      currentPhraseScene = key;
      currentScenarioIndex = 0;
      buildSceneTabs();
      buildScenarioTabs();
      renderPhraseList();
      updateSceneSelectBtn();
    });
    bar.appendChild(el);
  });
}

function buildScenarioTabs() {
  const scene = PHRASE_DATA[currentPhraseScene];
  const bar = document.getElementById('scenarioTabbar');
  bar.innerHTML = '';
  scene.scenarios.forEach((scenario, i) => {
    const el = document.createElement('div');
    el.className = 'scenario-tab-item' + (i === currentScenarioIndex ? ' active' : '');
    el.textContent = scenario.label;
    el.addEventListener('click', () => {
      stopPlayAll();
      currentScenarioIndex = i;
      buildScenarioTabs();
      renderPhraseList();
      updateSceneSelectBtn();
      setScenePanelOpen(false);
    });
    bar.appendChild(el);
  });
}

const SPEAKER_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.5 8.5a5 5 0 0 1 0 7"></path>
    <path d="M18 6a8.5 8.5 0 0 1 0 12"></path>
  </svg>
`;

function renderPhraseList() {
  const scene = PHRASE_DATA[currentPhraseScene];
  const scenario = scene.scenarios[currentScenarioIndex];
  const items = getPhraseItems();
  const list = document.getElementById('phraseList');
  list.innerHTML = '';
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'phrase-row ' + item.speaker;
    row.dataset.index = item._idx;
    row.innerHTML = `
      <span class="speaker-tag">${SPEAKER_LABELS[item.speaker]}</span>
      <div class="phrase-bubble">
        <div class="phrase-jp-row">
          <span class="phrase-jp">${buildFuriganaHTML(item.jp)}</span><span class="jp-tools-spacer"></span>
          <span class="phrase-jp-tools">
            <button class="speak-btn" type="button" aria-label="播放發音" title="播放發音">${SPEAKER_ICON_SVG}</button>
          </span>
        </div>
        <div class="phrase-zh">${item.zh}</div>
      </div>
    `;

    // 長按（觸控裝置）顯示該漢字詞的假名提示
    row.querySelectorAll('.furi').forEach(furiEl => {
      let pressTimer = null;
      furiEl.addEventListener('touchstart', () => {
        pressTimer = setTimeout(() => furiEl.classList.add('show-tooltip'), 350);
      });
      furiEl.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
        setTimeout(() => furiEl.classList.remove('show-tooltip'), 1200);
      });
    });

    // 喇叭按鈕：播放日文發音（單句，會中斷全部播放模式）
    const speakBtn = row.querySelector('.speak-btn');
    speakBtn.addEventListener('click', () => {
      stopPlayAll();
      speakJapanese(item.jp, item.speaker, speakBtn, row);
    });

    // 收藏星號：標記不熟悉的句子
    const phraseId = `${currentPhraseScene}-${currentScenarioIndex}-${item._idx}`;
    const starBtn = makeStarBtn('phrase', phraseId, {
      jp: item.jp, kana: item.kana, zh: item.zh,
      scene: scene.label, scenario: scenario.label
    });
    row.querySelector('.phrase-jp-tools').appendChild(starBtn);

    list.appendChild(row);
  });
}

/* ---------- 語音設定：店員 / 客人音色區分 ---------- */
let cachedJaVoices = null;

function getJaVoices() {
  if (cachedJaVoices && cachedJaVoices.length) return cachedJaVoices;
  if (!('speechSynthesis' in window)) return [];
  const all = window.speechSynthesis.getVoices();
  cachedJaVoices = all.filter(v => v.lang && v.lang.toLowerCase().startsWith('ja'));
  return cachedJaVoices;
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { cachedJaVoices = null; };
}

// 依說話者套用不同音色／音調／語速，盡量挑選不同的日文語音；
// 若瀏覽器只提供一種日文語音，則用 pitch 與 rate 製造區別
function configureUtteranceForSpeaker(utter, speaker) {
  const voices = getJaVoices();
  if (voices.length >= 2) {
    const femaleHint = voices.find(v => /female|女|f\b/i.test(v.name));
    const maleHint = voices.find(v => /male|男|m\b/i.test(v.name) && v !== femaleHint);
    if (speaker === 'staff') {
      utter.voice = femaleHint || voices[0];
    } else {
      utter.voice = maleHint || voices[1] || voices[0];
    }
  } else if (voices.length === 1) {
    utter.voice = voices[0];
  }

  if (speaker === 'staff') {
    utter.pitch = 1.15;
    utter.rate = 0.95;
  } else {
    utter.pitch = 0.85;
    utter.rate = 0.97;
  }
}

function speakJapanese(text, speaker, btn, row) {
  if (!('speechSynthesis' in window)) {
    alert('您的瀏覽器不支援語音播放功能');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  configureUtteranceForSpeaker(utter, speaker);

  document.querySelectorAll('.speak-btn.playing').forEach(b => b.classList.remove('playing'));
  if (btn) btn.classList.add('playing');
  if (row) row.classList.add('speaking');

  utter.onend = () => {
    if (btn) btn.classList.remove('playing');
    if (row) row.classList.remove('speaking');
  };
  utter.onerror = () => {
    if (btn) btn.classList.remove('playing');
    if (row) row.classList.remove('speaking');
  };

  window.speechSynthesis.speak(utter);
}

/* ---------- 全部播放（依序播放整個情境） ---------- */
let playAllActive = false;
let playAllQueueIndex = 0;
let playAllAbort = false;

function setPlayAllButtonState(isPlaying) {
  const btn = document.getElementById('playAllBtn');
  const icon = document.getElementById('playAllIcon');
  const label = document.getElementById('playAllLabel');
  btn.classList.toggle('active', isPlaying);
  label.textContent = isPlaying ? '停止播放' : '全部播放本情境';
  icon.innerHTML = isPlaying
    ? '<rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect>'
    : '<polygon points="6 4 20 12 6 20 6 4"></polygon>';
}

function stopPlayAll() {
  if (!playAllActive) return;
  playAllAbort = true;
  playAllActive = false;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  document.querySelectorAll('.phrase-row.speaking').forEach(r => r.classList.remove('speaking'));
  document.querySelectorAll('.speak-btn.playing').forEach(b => b.classList.remove('playing'));
  setPlayAllButtonState(false);
}

function playAllScenario() {
  const items = getPhraseItems();
  const rows = Array.from(document.querySelectorAll('#phraseList .phrase-row'));

  if (!items.length) return;

  playAllActive = true;
  playAllAbort = false;
  playAllQueueIndex = 0;
  setPlayAllButtonState(true);

  function playNext() {
    if (playAllAbort) return;
    if (playAllQueueIndex >= items.length) {
      playAllActive = false;
      setPlayAllButtonState(false);
      return;
    }
    const item = items[playAllQueueIndex];
    const row = rows[playAllQueueIndex];
    const speakBtn = row ? row.querySelector('.speak-btn') : null;

    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!('speechSynthesis' in window)) {
      alert('您的瀏覽器不支援語音播放功能');
      stopPlayAll();
      return;
    }

    const utter = new SpeechSynthesisUtterance(item.jp);
    utter.lang = 'ja-JP';
    configureUtteranceForSpeaker(utter, item.speaker);

    document.querySelectorAll('.speak-btn.playing').forEach(b => b.classList.remove('playing'));
    document.querySelectorAll('.phrase-row.speaking').forEach(r => r.classList.remove('speaking'));
    if (speakBtn) speakBtn.classList.add('playing');
    if (row) row.classList.add('speaking');

    utter.onend = () => {
      if (speakBtn) speakBtn.classList.remove('playing');
      if (row) row.classList.remove('speaking');
      playAllQueueIndex++;
      if (!playAllAbort) {
        setTimeout(playNext, 350);
      }
    };
    utter.onerror = () => {
      if (speakBtn) speakBtn.classList.remove('playing');
      if (row) row.classList.remove('speaking');
      playAllQueueIndex++;
      if (!playAllAbort) {
        setTimeout(playNext, 350);
      }
    };

    window.speechSynthesis.speak(utter);
  }

  playNext();
}

document.getElementById('playAllBtn').addEventListener('click', () => {
  if (playAllActive) {
    stopPlayAll();
  } else {
    playAllScenario();
  }
});

function renderPhrase() {
  buildSceneTabs();
  buildScenarioTabs();
  renderPhraseList();
  updateSceneSelectBtn();
}

document.getElementById('toggleZh').addEventListener('click', (e) => {
  const isOn = e.target.dataset.on === 'true';
  e.target.dataset.on = String(!isOn);
  document.body.classList.toggle('show-zh', !isOn);
  localStorage.setItem(PAGE_KEY + '-showZh', !isOn ? '1' : '0');
});

/* ---------- theme toggle ---------- */
const SUN_PATH = `
  <circle cx="12" cy="12" r="4.5"></circle>
  <line x1="12" y1="2.5" x2="12" y2="5"></line>
  <line x1="12" y1="19" x2="12" y2="21.5"></line>
  <line x1="4.2" y1="4.2" x2="6" y2="6"></line>
  <line x1="18" y1="18" x2="19.8" y2="19.8"></line>
  <line x1="2.5" y1="12" x2="5" y2="12"></line>
  <line x1="19" y1="12" x2="21.5" y2="12"></line>
  <line x1="4.2" y1="19.8" x2="6" y2="18"></line>
  <line x1="18" y1="6" x2="19.8" y2="4.2"></line>
`;
const MOON_PATH = `<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"></path>`;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeIcon').innerHTML = theme === 'dark' ? MOON_PATH : SUN_PATH;
}

/* 主題偏好與 hub 共用同一個 localStorage 鍵，從首頁點進來不會跳色 */
const THEME_KEY = 'hub-dark';
const savedPref = localStorage.getItem(THEME_KEY);
const savedTheme = savedPref === '1' ? 'dark'
  : savedPref === '0' ? 'light'
  : ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');
applyTheme(savedTheme);

document.getElementById('themeToggle').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next === 'dark' ? '1' : '0');
});

/* 收藏變動時，若正在「只練收藏」模式，重新整理題目來源 */
window.addEventListener('favs-changed', () => {
  if (favOnly && currentMode === 'study') {
    if (studySubMode === 'memorize') updateStudyEmptyState();
    // 測驗中途不重建題庫，避免打斷作答
  }
});
window.addEventListener('favs-synced', () => {
  if (favOnly && currentMode === 'study') enterCurrentMode();
});

/* ---------- 還原上次的開關狀態 ---------- */
if (localStorage.getItem(PAGE_KEY + '-refZh') === '1') {
  refZhPinned = true;
  document.getElementById('toggleRefZh').dataset.on = 'true';
  document.getElementById('refLookupHint').textContent = '已顯示全部假名與中文意思';
}
if (localStorage.getItem(PAGE_KEY + '-autoSpeak') === '1') {
  autoSpeak = true;
  document.getElementById('toggleAutoSpeak').dataset.on = 'true';
}
if (localStorage.getItem(PAGE_KEY + '-showZh') === '1') {
  document.getElementById('toggleZh').dataset.on = 'true';
  document.body.classList.add('show-zh');
}

/* ---------- init ---------- */
buildCatTabs();
renderRef();
refreshDirectionToggleVisibility();

