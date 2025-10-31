// === Google Analytics (no tocar) ===
(function () {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=G-DYZ3GCXHEK";
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", "G-DYZ3GCXHEK");
})();

/* ===================== SINGLETON ===================== */
if (window.__QGLOBAL_ACTIVE) {
  console.warn("Q_Global already loaded; skipping.");
} else {
  window.__QGLOBAL_ACTIVE = true;

/* ===================== CONFIG ===================== */
const API_URL = "https://uougu1cm26.execute-api.eu-central-1.amazonaws.com";
const PROGRESS_URL = `${API_URL}/progress`;

/* ===================== ESTADO ===================== */
const STATE = {
  quizId: "aws-saa-c03",
  track: "architect",
  mode: "exam",
  qs: [],
  idx: 0,
  answers: {},          // { [index]: optionIndex }
  marked: {},           // { [index]: true }
  markTimes: {},
  startedAt: null,
  elapsedSec: 0,
  timerId: null,
  certi: "AWS Certified Solutions Architect — Associate (SAA-C03)",
  prefs: { count: 65, timeLimit: 0, explanations: "after", tags: [] },
  // progreso remoto
  sessionId: null,
  lastSaveTs: 0,
  saveDebounce: null,
  saveEveryNsec: 15,
  hasInitialUpsert: false,
  finished: false,
  loading: false,
  timeLimit: 0
};
let __START_SEQ = 0;

/* ===================== MAPAS ===================== */
const QUIZ_TO_EXAM = { "aws-saa-c03": "SAA-C03", "az-104": "AZ-104" };
const QUIZZES = {
  "aws-saa-c03": {
    track: "architect",
    certi: "AWS Certified Solutions Architect — Associate (SAA-C03)"
  },
  "az-104": {
    track: "az-104-architect",
    certi: "Microsoft Azure Administrator — Associate (AZ-104)"
  }
};

/* ===================== CSS inyectado ===================== */
(function () {
  const css = `
  :root{
    --bg:#0f1320; --surface:#161b2d; --surface2:#1b2140; --ink:#e8ecff; --muted:#9ca8d9; --stroke:#283056;
    --brand:#6c8bff; --radius:14px; --shadow:0 12px 28px rgba(6,12,40,.45);
    --accent:#6c8bff; --accent-2:#3e64ff; --accent-ring:rgba(108,139,255,.28);
    --ok:#2bdc8c; --ok-ink:#c9ffe6; --ok-bg:#0f2d1f;
    --bad:#ff6b6b; --bad-ink:#ffd4d4; --bad-bg:#3a1518;
    --mark:#ffd24d; --mark-bg:#3a2e12; --mark-ring:rgba(255,210,77,.35);
    --q-ink:#e8ecff; --q-muted:#bac6ff;
  }

  /* ligero hueco extra arriba del área del quiz */
  #view { margin-top: 14px; }

  .quiz-wrap{display:grid;grid-template-columns:2fr 1fr;gap:18px}
  @media (max-width:900px){.quiz-wrap{grid-template-columns:1fr}}

  .card{
    margin-top: 8px;
    background:linear-gradient(180deg,#111937,#0f1633);
    border:1px solid var(--stroke);
    border-radius:16px;padding:18px;box-shadow:var(--shadow);color:var(--ink)
  }

  .header-quiz{
    display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;
    border-bottom:1px solid var(--stroke);padding-bottom:10px
  }
  .title{font-weight:900;color:var(--ink);opacity:.96}
  .quiz-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

  .timer{
    font-variant-numeric:tabular-nums;background:var(--surface2);color:var(--ink);
    border:1px solid var(--stroke);border-radius:12px;padding:8px 12px;font-weight:900
  }
  .progress{display:flex;align-items:center;gap:10px;min-width:220px}
  .pbar{position:relative;height:8px;border-radius:999px;background:#0b1024;overflow:hidden;flex:1}
  .pbar>i{position:absolute;inset:0;width:0;background:linear-gradient(90deg,var(--accent),var(--accent-2))}
  .pcount{font-weight:900;color:#cbd6ff;min-width:70px;text-align:right}

  .domain{
    display:inline-flex;align-items:center;gap:8px;
    font-weight:900;color:#cbd6ff;background:rgba(108,139,255,.08);
    border:1px solid var(--stroke);border-radius:999px;padding:8px 12px;margin:.55rem 0 .7rem
  }
  .domain .dot{width:10px;height:10px;border-radius:999px;background:var(--accent)}

  .question-card p,.question-card li,.question-card div,.question-card span{color:var(--q-ink)}
  .question-card a{color:#bcd9ff;text-decoration:underline}
  .question-card small,.question-card .muted{color:var(--q-muted)}
  .quiz-question{margin:.2rem 0 .6rem;color:var(--ink);font-size:1.06rem;line-height:1.55}

  .option{
    display:flex;gap:12px;align-items:flex-start;
    border:1px solid var(--stroke);background:var(--surface2);color:var(--ink);
    border-radius:12px;padding:14px 16px;margin:10px 0;cursor:pointer;
    transition:transform .08s, box-shadow .08s, border-color .08s
  }
  .option:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,.25);border-color:#34406f}
  .option .lead{min-width:24px;font-weight:900;color:var(--accent)}
  .option.selected.ok{border-color:var(--ok);background:linear-gradient(0deg,var(--ok-bg),var(--surface2)); color:var(--ok-ink)}
  .option.selected.bad{border-color:var(--bad);background:linear-gradient(0deg,var(--bad-bg),var(--surface2)); color:var(--bad-ink)}

  .expl{border:1px dashed var(--stroke);border-radius:12px;padding:12px;margin-top:12px;background:var(--surface);color:var(--ink)}
  .expl .ttl{font-weight:900;margin-bottom:8px}
  .expl a{color:#bcd9ff}

  .controls{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;justify-content:flex-end}
  .controls .btn{appearance:none;border:1px solid var(--stroke);border-radius:12px;padding:12px 16px;font-weight:900;cursor:pointer;background:transparent;color:var(--ink)}
  .controls .btn.primary{background:linear-gradient(180deg,var(--accent),var(--accent-2));color:#fff;border-color:transparent;box-shadow:var(--shadow)}
  .controls .btn:disabled{opacity:.6;cursor:not-allowed;filter:grayscale(.2)}

  .side .panel{background:var(--surface);border:1px solid var(--stroke);border-radius:16px;padding:16px;margin-bottom:14px;color:var(--ink)}
  .side h3{margin:.2rem 0 .6rem}

  .list-dots{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:10px}
  .dot{
    display:flex;align-items:center;justify-content:center;
    width:46px;height:46px;border-radius:999px;
    border:2px solid var(--stroke);background:var(--surface2);cursor:pointer;
    font-weight:900;font-variant-numeric:tabular-nums;
    color:#e8ecff;position:relative;transition:transform .06s, box-shadow .12s, border-color .12s
  }
  .dot:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(0,0,0,.25)}
  .dot.current{outline:3px solid var(--accent-ring)}
  .dot.ok{background:var(--ok-bg);border-color:#2e7a5a;color:var(--ok-ink)}
  .dot.bad{background:#2a1216;border-color:#7a2e38;color:#ffc1c1}
  .dot.marked{background:var(--mark-bg)!important;border-color:#b49422!important;color:#ffeaa3!important;outline:3px solid var(--mark-ring)}
  @keyframes blinkMark{0%{box-shadow:0 0 0 0 rgba(255,210,77,.0)}50%{box-shadow:0 0 0 6px rgba(255,210,77,.15)}100%{box-shadow:0 0 0 0 rgba(255,210,77,.0)}}
  .dot.marked.unanswered{animation:blinkMark 1.5s ease-in-out infinite}

  .toast{
    position:fixed;left:50%;bottom:18px;transform:translateX(-50%);
    background:#0e1530;color:#fff;padding:10px 14px;border-radius:10px;
    box-shadow:0 10px 24px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s;z-index:99999
  }
  .toast.show{opacity:1}

  /* Leyenda de dominios (lateral) */
  .legend{display:flex;flex-wrap:wrap;gap:8px}
  .legend .chip{
    display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-weight:900;
    background:#0f1630;border:1px solid #31407a;color:#cfe0ff
  }
  .legend .chip.on{background:rgba(108,139,255,.14);outline:2px solid var(--accent-ring)}
  .legend .chip .led{width:10px;height:10px;border-radius:999px;background:var(--accent)}
  `;
  const st = document.createElement("style");
  st.innerHTML = css;
  document.head.appendChild(st);
})();

/* ===================== Utils ===================== */
const h = (t, a = {}, k = []) => {
  const el = document.createElement(t);
  for (const [key, v] of Object.entries(a)) {
    if (key === "class") el.className = v;
    else if (key === "html") el.innerHTML = v;
    else el.setAttribute(key, v);
  }
  k.forEach((n) => n && el.appendChild(n));
  return el;
};
const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (s) => { s = Math.max(0, Number(s) || 0); const m = Math.floor(s / 60), x = s % 60; return `${pad(m)}:${pad(x)}`; };
function toast(msg, ms = 1600) { let t = document.querySelector(".toast"); if (!t) { t = h("div", { class: "toast" }); document.body.appendChild(t); } t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), ms); }
function shuffle(a) { const arr = a; const n = arr.length; const buf = new Uint32Array(n); if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(buf); for (let i = n - 1; i > 0; i--) { const r = buf[i] !== undefined ? (buf[i] / 0x100000000) : Math.random(); const j = Math.floor(r * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
const uuid = () => "s-" + Math.random().toString(16).slice(2) + Date.now().toString(36);

/* ===================== Tema ===================== */
function applyTheme(quizId) {
  const r = document.documentElement;
  const isAWS = quizId === "aws-saa-c03";
  const t = isAWS
    ? { "--accent": "#ff9900", "--accent-2": "#ffb84d", "--accent-ring": "rgba(255,153,0,.28)" }
    : { "--accent": "#0078d4", "--accent-2": "#5fb3ff", "--accent-ring": "rgba(0,120,212,.28)" };
  Object.entries(t).forEach(([k, v]) => r.style.setProperty(k, v));
}

/* ===================== Cliente /questions ===================== */
async function fetchQuestionsFromApi({ exam, count, overfetch = 3, domainTags = [], searchQ = "" }) {
  const target = Math.max(count * overfetch, count);
  const all = [];
  let lastKey = null;
  const seen = new Set();
  const pageLimit = 200;

  // Enviar tanto "domains" como "domain" por compatibilidad
  const onlyDn = (domainTags || [])
    .map(normalizeDomainTag)       // D1, D2...
    .filter(Boolean)
    .join(",");

  for (let guard = 0; guard < 25 && all.length < target; guard++) {
    const params = new URLSearchParams({ exam: String(exam), limit: String(pageLimit) });
    if (searchQ) params.set("q", searchQ);
    if (onlyDn) { params.set("domains", onlyDn); params.set("domain", onlyDn); }
    params.set("count", String(count));
    if (lastKey) params.set("lastKey", JSON.stringify(lastKey));
    const url = `${API_URL}/questions?${params.toString()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await res.text();
    if (!res.ok) throw new Error(`GET /questions ${res.status}: ${text}`);
    let data; try { data = JSON.parse(text); } catch { throw new Error("Respuesta no JSON de /questions"); }
    const items = Array.isArray(data.items) ? data.items : [];
    for (const it of items) {
      const qid = it.questionId || `${it.exam || ""}:${it.question || ""}`;
      if (!seen.has(qid)) { seen.add(qid); all.push(it); if (all.length >= target) break; }
    }
    lastKey = data.lastEvaluatedKey || null;
    if (!lastKey) break;
  }
  return all.slice(0, target);
}

/* ===================== Normalización & filtro ===================== */
// Devuelve 'D1', 'D2'... a partir de varias formas: 'D1', 'Domain 1', 'Dominio 1:', etc.
function normalizeDomainTag(tag) {
  if (!tag) return null;
  const s = String(tag).trim();
  const m = s.match(/^(?:d(?:omain|ominio)?)\s*:?\s*(\d+)$/i);
  if (m) return `D${m[1]}`;
  const m2 = s.match(/\bD(\d+)\b/i);
  return m2 ? `D${m2[1]}` : null;
}

function extractDomainFromRecord(it) {
  // prioridad: campo domain
  if (it.domain && normalizeDomainTag(it.domain)) return normalizeDomainTag(it.domain);
  // category: "Domain 1: ..." | "Dominio 1: ..."
  if (it.category) {
    const m = String(it.category).match(/(?:^|\s)(?:domain|dominio)\s*:?\s*(\d+)/i);
    if (m) return `D${m[1]}`;
  }
  // topic u otros
  if (it.topic) {
    const m2 = String(it.topic).match(/(?:domain|dominio)\s*:?\s*(\d+)/i);
    if (m2) return `D${m2[1]}`;
  }
  return null;
}

function transformQuestions(items) {
  return items.map((it) => {
    const domain = extractDomainFromRecord(it); // 'D1' | null
    return {
      questionId: it.questionId || `${it.exam || ""}:${it.question || ""}`,
      question: it.question || "",
      options: Array.isArray(it.options) ? it.options.slice() : [],
      correctAnswer: typeof it.answerIndex === "number" ? it.answerIndex : null,
      explanation: it.explanation || "",
      explanationRich: it.explanationRich || "",
      links: Array.isArray(it.links) ? it.links.slice() : [],
      category: it.category || "General",
      topic: it.topic || it.area || "",
      domain
    };
  });
}

function filterBySelection(all, tags) {
  if (!Array.isArray(tags) || tags.length === 0) return all;
  const want = tags.map(normalizeDomainTag).filter(Boolean); // sólo Dn
  if (want.length === 0) return all;

  return all.filter((q) => {
    const d = q.domain ? q.domain.toUpperCase() : "";
    if (d && want.includes(d)) return true;

    // Reintento por category (por si no se pudo extraer)
    const cat = (q.category || "").toUpperCase();
    const m = cat.match(/DOMAIN\s*:?\s*(\d+)/i);
    if (m && want.includes(`D${m[1]}`)) return true;

    return false;
  });
}

/* ===================== Usuario ===================== */
function getUserAny() {
  let u = null;
  try { u = JSON.parse(localStorage.getItem("currentUser") || "null"); } catch { }
  if (!u) { try { u = JSON.parse(localStorage.getItem("certify_user") || "null"); } catch { } }
  return u;
}

/* ===================== Progreso remoto ===================== */
function persistLocalSessionId(sid) {
  try {
    localStorage.setItem("quiz.session.active", sid);
    localStorage.setItem(`quiz.session.${Date.now()}`, sid);
  } catch { }
}
async function upsertProgress(payload) {
  try {
    const resp = await fetch(PROGRESS_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await resp.text();
    let data = null; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${(data && (data.error || data.message)) || text}`);
    return data;
  } catch (e) {
    console.warn("Progress upsert failed:", e);
    return null;
  }
}
function buildMarkedItems() {
  const items = [];
  const nowIso = new Date().toISOString();
  STATE.qs.forEach((q, idx) => {
    if (!STATE.marked[idx]) return;
    items.push({
      sessionId: STATE.sessionId || "",
      index: idx,
      questionId: q.questionId || null,
      question: q.question || "(no text)",
      category: q.category || null,
      domain: q.domain || null,
      markedAt: STATE.markTimes[idx] || nowIso
    });
  });
  return items;
}
function buildQuestionBank() {
  return STATE.qs.map((q, idx) => ({
    index: idx,
    questionId: q.questionId || null,
    question: q.question || "",
    category: q.category || null,
    domain: q.domain || null,
    optionsShown: (q._options || []).slice(),
    correctShownIndex: typeof q._correct === "number" ? q._correct : null,
    optOrder: Array.isArray(q._optOrder) ? q._optOrder.slice() : null
  }));
}
const questionIdsList = () => STATE.qs.map((q) => q.questionId || null);
function computePct() {
  let c = 0, t = STATE.qs.length;
  for (let i = 0; i < t; i++) { if (STATE.answers[i] === STATE.qs[i]._correct) c++; }
  return t ? Math.round((c / t) * 100) : 0;
}
function baseUser() {
  const u = getUserAny() || {};
  return { userId: u.userId || u.id || "anon", userName: u.name || u.displayName || "anonymous", email: u.email || "" };
}
function computeProgressPayload({ full = false, finished = false } = {}) {
  const nowIso = new Date().toISOString();
  const user = baseUser();
  const payload = {
    sessionId: STATE.sessionId,
    quizId: STATE.quizId,
    mode: STATE.mode || "exam",
    track: STATE.track || "architect",
    ...user,
    startedAt: STATE.startedAt ? new Date(STATE.startedAt).toISOString() : nowIso,
    updatedAt: nowIso,
    elapsedSec: Number(STATE.elapsedSec || 0),
    timeLimit: Number(STATE.timeLimit || 0),
    cursor: Number(STATE.idx || 0),
    total: Number(STATE.qs.length || 0),
    pct: computePct(),
    finished: Boolean(finished),
    answers: STATE.answers,
    marked: STATE.marked,
    questionIds: questionIdsList(),
    markedItems: buildMarkedItems()
  };
  if (full || !STATE.hasInitialUpsert) payload.questionBank = buildQuestionBank();
  return payload;
}
function scheduleSaveProgress({ full = false, finished = false, reason = "auto" } = {}) {
  try { localStorage.setItem("quiz.lastReason", reason); } catch { }
  if (STATE.saveDebounce) clearTimeout(STATE.saveDebounce);
  STATE.saveDebounce = setTimeout(async () => {
    const payload = computeProgressPayload({ full, finished });
    await upsertProgress(payload);
    STATE.hasInitialUpsert = true;
    STATE.lastSaveTs = Date.now();
  }, 400);
}

/* ===================== Finish guards ===================== */
function countMarkedUnanswered() {
  let n = 0;
  for (const [idx, flag] of Object.entries(STATE.marked || {})) {
    if (!flag) continue;
    const i = Number(idx);
    if (typeof STATE.answers[i] === "undefined") n++;
  }
  return n;
}
const canFinish = () => countMarkedUnanswered() === 0;

/* ===================== START ===================== */
async function start(quizId = "aws-saa-c03", overrides = {}) {
  const mySeq = ++__START_SEQ;
  stopTimer();
  STATE.finished = false;

  const cfg = QUIZZES[quizId] || QUIZZES["aws-saa-c03"];
  STATE.quizId = quizId;
  STATE.track = cfg.track;
  STATE.certi = cfg.certi;
  STATE.mode = "exam";

  const desiredCount = Number(overrides.count ?? STATE.prefs.count ?? 65);
  const tagsRaw = Array.isArray(overrides.tags) ? overrides.tags.slice() : [];
  const tags = tagsRaw.map(normalizeDomainTag).filter(Boolean);
  STATE.prefs = { ...STATE.prefs, count: desiredCount, tags };

  STATE.loading = true; showLoading();

  const qp = new URLSearchParams(location.search);
  const resumeId = overrides.resumeId || qp.get("resume");

  try {
    // Reanudar
    if (resumeId) {
      const res = await fetch(`${PROGRESS_URL}?sessionId=${encodeURIComponent(resumeId)}`, { mode: "cors", cache: "no-store" });
      const data = await res.json();
      if (res.ok && data && data.item && Array.isArray(data.item.questionBank)) {
        const it = data.item;
        const bank = it.questionBank;
        STATE.qs = bank.map(row => ({
          questionId: row.questionId || null,
          question: row.question || "",
          category: row.category || "General",
          domain: row.domain || null,
          _options: Array.isArray(row.optionsShown) ? row.optionsShown.slice() : [],
          _optOrder: Array.isArray(row.optOrder) ? row.optOrder.slice() : null,
          _correct: (typeof row.correctShownIndex === "number" ? row.correctShownIndex : null),
          options: [], correctAnswer: null, explanation: "", explanationRich: "", links: []
        }));
        STATE.idx = Number(it.cursor || 0);
        STATE.answers = (typeof it.answers === "object" && it.answers) ? it.answers : {};
        STATE.marked = (typeof it.marked === "object" && it.marked) ? it.marked : {};
        STATE.startedAt = it.startedAt ? new Date(it.startedAt).getTime() : Date.now();
        STATE.elapsedSec = Number(it.elapsedSec || 0);
        STATE.timeLimit = Number(it.timeLimit || 0);
        STATE.sessionId = it.sessionId || resumeId;
        if (Array.isArray(it.markedItems)) {
          it.markedItems.forEach(m => {
            const idx = Number(m.index);
            if (STATE.marked[idx]) STATE.markTimes[idx] = m.markedAt || it.updatedAt || it.startedAt || new Date().toISOString();
          });
        }
        applyTheme(quizId);
        renderQuiz();
        startTimer();
        toast("Sesión reanudada", 2200);
        STATE.loading = false;
        STATE.hasInitialUpsert = true;
        persistLocalSessionId(STATE.sessionId);
        return;
      }
    }

    // Inicio normal
    const exam = QUIZ_TO_EXAM[quizId] || "SAA-C03";
    const raw = await fetchQuestionsFromApi({ exam, count: desiredCount, overfetch: 3, domainTags: tags });

    if (mySeq !== __START_SEQ) return;

    let all = transformQuestions(raw);
    let filtered = filterBySelection(all, tags);

    if (tags.length && filtered.length === 0) {
      // fallback si no hay preguntas para esos tags
      filtered = all;
      toast("No se encontraron preguntas para los dominios elegidos. Mostrando todo el banco.", 2800);
    }

    shuffle(filtered);
    filtered = filtered.slice(0, desiredCount);

    filtered = filtered.map(q => {
      const opts = Array.isArray(q.options) ? q.options.slice() : [];
      const order = shuffle([...Array(opts.length).keys()]);
      const optionsShuffled = order.map(i => opts[i]);
      const correctIndex = (typeof q.correctAnswer === "number" && q.correctAnswer >= 0)
        ? order.indexOf(q.correctAnswer) : null;
      return { ...q, _optOrder: order, _options: optionsShuffled, _correct: correctIndex };
    });

    if (mySeq !== __START_SEQ) return;

    STATE.qs = filtered;
    STATE.idx = 0;
    STATE.answers = {};
    STATE.marked = {};
    STATE.markTimes = {};
    STATE.startedAt = Date.now();
    STATE.elapsedSec = 0;
    STATE.timeLimit = 0;

    STATE.sessionId = uuid();
    persistLocalSessionId(STATE.sessionId);

    applyTheme(quizId);
    renderQuiz();
    startTimer();

    scheduleSaveProgress({ full: true, reason: "start" });

    const label = tags.length ? ` • Dominios: ${tags.join(", ")}` : "";
    toast(`Cargadas ${STATE.qs.length}${label}`, 2000);
  } catch (err) {
    console.error(err);
    showError(err.message || "Error cargando preguntas");
  } finally {
    if (mySeq === __START_SEQ) STATE.loading = false;
  }
}

/* ===================== Loading / Error ===================== */
function showLoading() {
  const root = document.getElementById("view"); if (!root) return;
  root.innerHTML = "";
  root.appendChild(h("div", { class: "loading", html: "Cargando preguntas…" }));
}
function showError(msg) {
  const root = document.getElementById("view"); if (!root) return;
  root.innerHTML = "";
  root.appendChild(h("div", { class: "loading", html: `<b>Error:</b> ${msg}` }));
}

/* ===================== Timer ===================== */
function startTimer() {
  stopTimer();
  STATE.timerId = setInterval(() => {
    STATE.elapsedSec++;
    const t = document.querySelector(".timer");
    if (t) t.textContent = fmtTime(STATE.elapsedSec);
    if (STATE.sessionId && STATE.elapsedSec > 0 && (STATE.elapsedSec % STATE.saveEveryNsec === 0)) {
      scheduleSaveProgress({ reason: "tick" });
    }
  }, 1000);
}
function stopTimer() { if (STATE.timerId) { clearInterval(STATE.timerId); STATE.timerId = null; } }

/* ===================== KPIs ===================== */
function computeLiveStats() {
  const answered = Object.keys(STATE.answers).length;
  let correct = 0;
  for (const [i, v] of Object.entries(STATE.answers)) {
    const idx = Number(i);
    if (STATE.qs[idx] && STATE.qs[idx]._correct === v) correct++;
  }
  const marked = Object.values(STATE.marked || {}).filter(Boolean).length;
  const pct = answered ? Math.round((correct / answered) * 100) : 0;
  return { answered, correct, pct, marked };
}
function renderKpisUnderQuiz(container) {
  if (!container) return;
  let host = document.getElementById("kpis-under-quiz");
  const k = computeLiveStats();
  if (!host) {
    host = h("section", { id: "kpis-under-quiz", class: "kpis-under-quiz" });
    const a = h("div", { class: "kpi-card", html: `<h4>Respondidas</h4><div class="n" id="kpi-ans">0</div>` });
    const b = h("div", { class: "kpi-card", html: `<h4>Aciertos %</h4><div class="n" id="kpi-pct">0%</div>` });
    const c = h("div", { class: "kpi-card", html: `<h4>Marcadas</h4><div class="n" id="kpi-mark">0</div>` });
    host.appendChild(a); host.appendChild(b); host.appendChild(c);
    container.parentNode.insertBefore(host, container.nextSibling);
  }
  const elA = document.getElementById("kpi-ans");
  const elB = document.getElementById("kpi-pct");
  const elC = document.getElementById("kpi-mark");
  if (elA) elA.textContent = String(k.answered);
  if (elB) elB.textContent = `${k.pct}%`;
  if (elC) elC.textContent = String(k.marked);
}

/* ===================== Leyenda dominios (lateral) ===================== */
function domainsPresentInBank() {
  const set = new Set();
  STATE.qs.forEach(q => { if (q.domain) set.add(q.domain); });
  return Array.from(set).sort();
}
function renderDomainLegend(parentPanel) {
  const host = h("div");
  host.appendChild(h("h3", { html: "DOMINIOS" }));
  const wrap = h("div", { class: "legend" });
  const domains = domainsPresentInBank();
  const active = new Set((STATE.prefs.tags || []));
  domains.forEach(dn => {
    const chip = h("span", { class: "chip" });
    if (active.has(dn)) chip.classList.add("on");
    chip.appendChild(h("i", { class: "led" }));
    chip.appendChild(document.createTextNode(` ${dn}`));
    wrap.appendChild(chip);
  });
  if (domains.length === 0) wrap.appendChild(h("div", { class: "muted", html: "—" }));
  host.appendChild(wrap);
  parentPanel.appendChild(host);
}

/* ===================== Render principal ===================== */
function renderQuiz() {
  const root = document.getElementById("view"); if (!root) return;
  root.innerHTML = "";

  const wrap = h("section", { class: "card" }), shell = h("div", { class: "quiz-wrap" });

  const qCard = h("div", { class: "question-card" });
  const head = h("div", { class: "header-quiz" });
  head.appendChild(h("div", { class: "title", html: STATE.certi }));
  const meta = h("div", { class: "quiz-meta" });
  const timer = h("div", { class: "timer", html: fmtTime(STATE.elapsedSec) });
  const progress = h("div", { class: "progress" }), pbar = h("div", { class: "pbar" }), fill = h("i"); pbar.appendChild(fill);
  const pcount = h("div", { class: "pcount", html: `${STATE.idx + 1}/${STATE.qs.length}` });
  progress.appendChild(pbar); progress.appendChild(pcount);
  meta.appendChild(timer); meta.appendChild(progress);
  head.appendChild(meta); qCard.appendChild(head);

  const q = STATE.qs[STATE.idx];
  if (!q) {
    qCard.appendChild(h("div", { html: "No hay preguntas que mostrar." }));
  } else {
    const pct = Math.round((STATE.idx / Math.max(1, STATE.qs.length)) * 100); fill.style.width = `${pct}%`;

    // Insignia de dominio de la pregunta actual
    const dom = q.domain ? ` (${q.domain})` : "";
    const domBadge = h("div", { class: "domain" });
    domBadge.appendChild(h("i", { class: "dot" }));
    domBadge.appendChild(h("span", { html: (q.category || "GENERAL").toUpperCase() + dom }));
    qCard.appendChild(domBadge);

    qCard.appendChild(h("h2", { class: "quiz-question", html: `<b>${STATE.idx + 1}.</b> ${q.question}` }));

    (q._options || []).forEach((txt, i) => {
      const chosen = STATE.answers[STATE.idx], selected = chosen === i, isCorrect = q._correct === i;
      const cls = ["option"]; if (typeof chosen !== "undefined" && selected) cls.push(isCorrect ? "ok" : "bad", "selected");
      const line = h("div", { class: cls.join(" ") }); line.onclick = () => onSelect(i);
      line.appendChild(h("span", { class: "lead", html: String.fromCharCode(65 + i) + "." }));
      line.appendChild(h("span", { html: txt }));
      qCard.appendChild(line);
    });

    const chosen = STATE.answers[STATE.idx];
    if (typeof chosen !== "undefined" && STATE.prefs.explanations === "after") {
      const box = h("div", { class: "expl" });
      const correctLetter = String.fromCharCode(65 + (q._correct ?? 0));
      box.innerHTML = `<div class="ttl">Respuesta correcta: <b>${correctLetter}</b></div><div class="explain">${q.explanationRich || q.explanation || ""}</div>`;
      if (q.links && q.links.length) {
        const ul = h("ul", { class: "learn-more" });
        q.links.forEach(l => { const li = h("li"); const a = h("a", { href: l.url, target: "_blank", rel: "noopener", html: l.title || l.url }); li.appendChild(a); ul.appendChild(li); });
        box.appendChild(h("div", { html: '<div style="font-weight:700;margin-top:6px">Aprende más</div>' })); box.appendChild(ul);
      }
      qCard.appendChild(box);
    }
  }

  // Controles: Back / Mark / Next (spanish) + requisitos
  const ctr = h("div", { class: "controls" });
  const back = h("button", { class: "btn", html: "Atrás" });
  back.disabled = STATE.idx === 0;
  back.onclick = () => { STATE.idx = Math.max(0, STATE.idx - 1); scheduleSaveProgress({ reason: "nav" }); renderQuiz(); };

  const mark = h("button", { class: "btn", html: STATE.marked[STATE.idx] ? "Quitar marca" : "Marcar" });
  mark.onclick = () => {
    STATE.marked[STATE.idx] = !STATE.marked[STATE.idx];
    if (STATE.marked[STATE.idx]) STATE.markTimes[STATE.idx] = new Date().toISOString(); else delete STATE.markTimes[STATE.idx];
    toast(STATE.marked[STATE.idx] ? "Marcada" : "Desmarcada");
    scheduleSaveProgress({ reason: "mark" });
    renderQuiz();
  };

  const next = h("button", { class: "btn primary", html: STATE.idx === STATE.qs.length - 1 ? "Finalizar" : "Siguiente" });
  next.onclick = () => {
    if (STATE.idx === STATE.qs.length - 1) {
      if (!canFinish()) { toast("No puedes finalizar: hay preguntas marcadas sin responder."); return; }
      return finish();
    }
    STATE.idx++; scheduleSaveProgress({ reason: "nav" }); renderQuiz();
  };
  if (STATE.idx === STATE.qs.length - 1 && !canFinish()) next.disabled = true;

  ctr.appendChild(back); ctr.appendChild(mark); ctr.appendChild(next);
  qCard.appendChild(ctr);

  /* ===== Sidebar ===== */
  const side = h("div", { class: "side" });

  // Panel acciones (Salir / Pausar)
  const pBtns = h("div", { class: "panel" });
  const actions = h("div", { class: "controls" });
  const btnQuit = h("button", { class: "btn", html: "🏠 Salir" });
  btnQuit.onclick = () => { scheduleSaveProgress({ reason: "quit" }); location.href = "/index.html"; };
  const btnPause = h("button", { class: "btn", html: "⏸️ Pausar" });
  btnPause.onclick = () => {
    scheduleSaveProgress({ reason: "pause" });
    try { localStorage.setItem("quiz.resumeId", STATE.sessionId); } catch { }
    toast("Progreso guardado. Podrás reanudar.", 2000);
  };
  actions.appendChild(btnQuit); actions.appendChild(btnPause);
  pBtns.appendChild(actions);
  side.appendChild(pBtns);

  // Lista de preguntas
  const pList = h("div", { class: "panel" });
  pList.appendChild(h("h3", { html: "LISTA DE PREGUNTAS" }));
  const dots = h("div", { class: "list-dots", title: "Haz clic para saltar a cualquier pregunta" });
  STATE.qs.forEach((qq, i) => {
    const d = h("div", { class: "dot", html: String(i + 1) });
    if (i === STATE.idx) d.classList.add("current");
    const ans = STATE.answers[i];
    if (typeof ans !== "undefined") { if (ans === qq._correct) d.classList.add("ok"); else d.classList.add("bad"); }
    if (STATE.marked[i]) {
      d.classList.add("marked");
      if (typeof ans === "undefined") d.classList.add("unanswered");
    }
    d.onclick = () => { STATE.idx = i; scheduleSaveProgress({ reason: "jump" }); renderQuiz(); };
    dots.appendChild(d);
  });
  pList.appendChild(dots);
  side.appendChild(pList);

  // Leyenda de dominios (se "iluminan" los seleccionados al iniciar)
  const pLegend = h("div", { class: "panel" });
  renderDomainLegend(pLegend);
  side.appendChild(pLegend);

  // Montaje
  shell.appendChild(qCard); shell.appendChild(side);
  wrap.appendChild(shell); root.appendChild(wrap);

  // KPIs inferiores
  renderKpisUnderQuiz(wrap);

  enableHotkeys();
  try { wrap.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { }
}

function onSelect(i) {
  if (typeof STATE.answers[STATE.idx] !== "undefined") return;
  STATE.answers[STATE.idx] = i;
  scheduleSaveProgress({ reason: "answer" });
  renderQuiz();
}

/* ===================== Resultados (modal) ===================== */
function renderResultModal(r) {
  document.body.classList.add("qg-lock");
  const pass = r.pct >= 70;
  const bd = h("div", { class: "qg-backdrop", role: "dialog", "aria-modal": "true" });
  const m = h("div", { class: "qg-modal" });
  m.appendChild(h("h3", { html: "Resultados del examen" }));
  m.appendChild(h("div", { class: pass ? "qg-badge-pass" : "qg-badge-fail", html: pass ? "✅ Aprobado — ≥70%" : "❌ No aprobado — <70%" }));
  m.appendChild(h("div", { class: "qg-result-row", html: `<strong>Puntuación</strong><span>${r.correct}/${r.total} (${r.pct}%)</span>` }));
  m.appendChild(h("div", { class: "qg-result-row", html: `<strong>Duración</strong><span>${Math.floor(r.durationSec / 60)}m ${r.durationSec % 60}s</span>` }));
  m.appendChild(h("div", { class: "qg-result-row", html: `<strong>Marcadas</strong><span>${r.markedCount || 0}</span>` }));
  const actions = h("div", { class: "qg-actions" });
  const home = h("button", { class: "btn", html: "👤 Perfil" });
  home.onclick = () => { closeModal(); location.href = "/user/profile.html"; };
  const review = h("button", { class: "btn primary", html: "🔁 Revisar" });
  review.onclick = () => { closeModal(); };
  actions.appendChild(home); actions.appendChild(review);
  m.appendChild(actions);
  bd.appendChild(m);

  bd.addEventListener("click", (e) => { if (e.target === bd) closeModal(); });
  const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); closeModal(); } };
  document.addEventListener("keydown", onKey);

  function closeModal() {
    try { document.body.removeChild(bd); } catch { }
    document.body.classList.remove("qg-lock");
    document.removeEventListener("keydown", onKey);
  }
  document.body.appendChild(bd);
}

function genResultId(result) {
  const base = [result.quizId || "quiz", result.mode || "exam", result.total || 0, result.correct || 0, result.durationSec || 0].join("|");
  const t = Math.floor((new Date(result.ts || Date.now())).getTime() / 10000);
  return `${base}|${t}`;
}
async function postForm(url, payload) {
  const body = new URLSearchParams(); Object.entries(payload).forEach(([k, v]) => body.append(k, String(v)));
  const resp = await fetch(url, { method: "POST", mode: "cors", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body });
  const text = await resp.text(); let data = null; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${(data.error || data.message || text)}`); return data;
}
async function saveResultRemoteOnce(result) {
  if (STATE.saving) return null;
  STATE.saving = true;
  const u = getUserAny() || {};
  const payload = {
    resultId: genResultId(result),
    userId: u.userId || u.id || "anon",
    userName: u.name || u.displayName || "anonymous",
    email: u.email || "",
    quizId: result.quizId, track: result.track || "architect", mode: result.mode || "exam",
    total: Number(result.total || 0), correct: Number(result.correct || 0),
    pct: Number(result.pct || (result.total ? Math.round((result.correct / result.total) * 100) : 0)),
    durationSec: Number(result.durationSec || 0), ts: result.ts || new Date().toISOString()
  };
  try { return await postForm(`${API_URL}/results`, payload); }
  catch (e) { console.warn("Remote save failed:", e); return null; }
  finally { STATE.saving = false; }
}

async function finish() {
  const pending = countMarkedUnanswered();
  if (pending > 0) { STATE.finished = false; toast(`No puedes finalizar: ${pending} marcada(s) sin responder.`); return; }
  if (STATE.finished) return;
  STATE.finished = true;
  stopTimer();
  const total = STATE.qs.length; let correct = 0;
  for (let i = 0; i < total; i++) { if (STATE.answers[i] === STATE.qs[i]._correct) correct++; }
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const result = {
    ts: new Date().toISOString(),
    quizId: STATE.quizId, track: STATE.track || "architect", mode: STATE.mode || "exam",
    total, correct, pct,
    markedCount: Object.values(STATE.marked || {}).filter(Boolean).length,
    durationSec: STATE.startedAt ? Math.round((Date.now() - STATE.startedAt) / 1000) : STATE.elapsedSec || 0
  };
  scheduleSaveProgress({ finished: true, reason: "finish" });
  await saveResultRemoteOnce(result);
  renderResultModal(result);
}

/* ===================== Hotkeys ===================== */
let __hot = false;
function enableHotkeys() {
  if (__hot) return; __hot = true;
  window.addEventListener("keydown", (ev) => {
    const tag = (ev.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || ev.metaKey || ev.ctrlKey) return;
    if (ev.key === "n" || ev.key === "N") {
      ev.preventDefault();
      if (STATE.idx === STATE.qs.length - 1) {
        if (!canFinish()) { toast("No puedes finalizar: hay preguntas marcadas sin responder."); return; }
        finish();
      } else {
        STATE.idx++; scheduleSaveProgress({ reason: "nav-key" }); renderQuiz();
      }
    }
    if (ev.key === "b" || ev.key === "B") { ev.preventDefault(); if (STATE.idx > 0) { STATE.idx--; scheduleSaveProgress({ reason: "nav-key" }); renderQuiz(); } }
    if (ev.key === "m" || ev.key === "M") { ev.preventDefault(); STATE.marked[STATE.idx] = !STATE.marked[STATE.idx]; if (STATE.marked[STATE.idx]) STATE.markTimes[STATE.idx] = new Date().toISOString(); else delete STATE.markTimes[STATE.idx]; toast(STATE.marked[STATE.idx] ? "Marcada" : "Desmarcada"); scheduleSaveProgress({ reason: "mark-key" }); renderQuiz(); }
    const num = parseInt(ev.key, 10);
    if (Number.isInteger(num) && num >= 1 && num <= 9) {
      const q = STATE.qs[STATE.idx];
      if (q && q._options && q._options[num - 1] !== undefined) { ev.preventDefault(); onSelect(num - 1); }
    }
  });
}

/* ===================== Wire ===================== */
document.addEventListener("DOMContentLoaded", () => { /* no-op */ });

/* ===================== API pública ===================== */
window.start = start;

} // fin singleton
