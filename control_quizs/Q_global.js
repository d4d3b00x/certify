/* ===========================
   Telemetry helper (opcional)
   =========================== */
const TELEM = (n,p)=>{ try{ window.__telem && window.__telem.on(n,p); }catch(e){} };

/* ===========================
   CONFIG remota (API Gateway)
   =========================== */
const API_URL = "https://uougu1cm26.execute-api.eu-central-1.amazonaws.com"; // ← CAMBIA ESTO

/* ===========================
   Estado global
   =========================== */
const STATE = {
  quizId: 'aws-saa-c03',
  track: 'architect',
  mode: 'exam',
  qs: [],
  idx: 0,
  answers: {},
  marked: {},        // preguntas marcadas (dot amarillo)
  startedAt: null,
  certi: 'AWS CERTIFIED SOLUTIONS ARCHITECT — ASSOCIATE (SAA-C03)'
};

/* ===========================
   Catálogo de quizzes
   =========================== */
const QUIZZES = {
  'aws-saa-c03': {
    track: 'architect',
    certi: 'AWS CERTIFIED SOLUTIONS ARCHITECT — ASSOCIATE (SAA-C03)',
    questions: () => window.questions
  },
  'az-104': {
    track: 'az-104-architect',
    certi: 'Microsoft Azure Administrator - Associate (AZ-104)',
    questions: () => window.questions
  }
};

const QUIZ_LABEL = {
  'aws-saa-c03': 'AWS Solutions Architect – SAA-C03',
  'az-104': 'Microsoft Azure Administrator – AZ-104'
};

/* ===========================
   Exam Overview (por quiz)
   =========================== */
const EXAM_OVERVIEW_BY_QUIZ = {
  'aws-saa-c03': {
    category: "Associate",
    duration: "130 minutes",
    format: "65 questions; multiple choice or multiple response",
    cost: "150 USD (+ taxes/fees)",
    testing: "Pearson VUE testing center or online proctored exam",
    languages: "EN, FR (France), IT, JA, KO, PT-BR, ES-LATAM, ES-Spain, ZH-CN, ZH-TW",
    guideUrl: "https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/pdfs/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf",
    scheduleUrl: "https://cp.certmetrics.com/amazon"
  },
  'az-104': {
    category: "Associate",
    duration: "120 minutes",
    format: "65 questions; multiple choice or multiple response",
    cost: "165 USD (+ taxes/fees)",
    testing: "Pearson VUE testing center or online proctored exam",
    languages: "EN, ES, FR, DE, JA, KO, ZH (varies by region)",
    guideUrl: "#",
    scheduleUrl: "#"
  }
};

/* ===========================
   Utilidades
   =========================== */
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function flattenQuestions(data){
  const arr = [];
  (data||[]).forEach(cat => (cat.questions||[]).forEach(q => arr.push({...q, category: cat.category})));
  return arr;
}

function h(tag, attrs={}, kids=[]){
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)){
    if (k==='class') el.className = v;
    else if (k==='html') el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  kids.forEach(k=>el.appendChild(k));
  return el;
}

/* ===========================
   Helpers de sesión
   =========================== */
function getCurrentUser(){
  try { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
  catch { return null; }
}

/* ===========================
   Helpers remotos
   =========================== */

// Evitar preflight CORS con form-urlencoded
async function __postForm(url, obj){
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k,v]) => params.append(k, String(v)));
  const resp = await fetch(url, {
    method: "POST",
    body: params,      // Content-Type: application/x-www-form-urlencoded (lo pone el navegador)
    mode: "cors",
    cache: "no-store",
    keepalive: true
  });
  const text = await resp.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
  return data;
}

function __genResultId(r){
  const d = new Date(r.ts || Date.now());
  const pad = n => String(n).padStart(2,'0');
  const base = [
    d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate()),
    "-", pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())
  ].join("");
  const suffix = Math.random().toString(36).slice(2,7);
  return `${r.quizId || 'quiz'}-${r.mode || 'exam'}-${base}-${suffix}`;
}

// ⬇️ AHORA GUARDA EN /results usando el usuario logueado
async function saveResultRemote(result){
  const u = getCurrentUser();
  if (!u) throw new Error("Debes iniciar sesión para guardar resultados.");

  // Calcula/normaliza números
  const total = Number(result.total || 0);
  const correct = Number(result.correct || 0);
  const pct = total > 0 ? Math.round((correct/total)*100) : Number(result.pct || 0);
  const durationSec = Number(result.durationSec || 0);

  // Payload que espera tu Lambda /results
  const payload = {
    userId: u.userId,
    userName: u.name,
    email: u.email || "",
    quizId: result.quizId,
    track: result.track || 'architect',
    mode: result.mode || 'exam',
    total,
    correct,
    pct,
    durationSec,
    ts: result.ts || new Date().toISOString()
  };

  TELEM('save_remote_start', { quizId: payload.quizId, pct: payload.pct });

  try{
    const res = await __postForm(`${API_URL}/results`, payload);
    TELEM('save_remote_ok', { ok: true });
    return res;
  }catch(err){
    console.error("saveResultRemote ERROR:", err);
    TELEM('save_remote_err', { message: err.message });
    throw err;
  }
}

/* ===========================
   Inicio de un quiz
   =========================== */
function start(quizId = 'aws-saa-c03'){
  const cfg = QUIZZES[quizId] || QUIZZES['aws-saa-c03'];

  STATE.quizId = quizId;
  STATE.track  = cfg.track;
  STATE.certi  = cfg.certi;
  STATE.mode   = 'exam';

  TELEM('quiz_start', { quizId });

  // Fuente de preguntas -> a plano
  const src = cfg.questions();
  STATE.qs = flattenQuestions(src);

  // Número de preguntas (lee #studyCount si existe)
  let n = 65;
  try{
    const el = document.getElementById('studyCount');
    if (el && el.value) n = parseInt(el.value, 10);
    if (![5,10,15,30,65].includes(n)) n = 65;
  }catch(e){ n = 65; }

  // Mezcla y recorta
  STATE.qs = shuffle(STATE.qs).slice(0, n);

  // Reset estado
  STATE.idx = 0;
  STATE.answers = {};
  STATE.marked = {};
  STATE.startedAt = Date.now();

  // Hash navegable
  location.hash = `#/quiz?quiz=${quizId}`;
  renderQuiz();
}

/* ===========================
   Render del overview
   =========================== */
function renderExamOverviewTo(sideEl){
  const d = EXAM_OVERVIEW_BY_QUIZ[STATE.quizId] || EXAM_OVERVIEW_BY_QUIZ['aws-saa-c03'];
  const card = h('div', {class:'panel'});
  card.appendChild(h('h3', {html:'OFFICIAL EXAM OVERVIEW'}));
  const body = h('div', {class:'exam-overview'});
  body.innerHTML = `
    <div class="ov-row"><span class="ov-key">Category</span><span class="ov-val">${d.category}</span></div>
    <div class="ov-row"><span class="ov-key">Duration</span><span class="ov-val">${d.duration}</span></div>
    <div class="ov-row"><span class="ov-key">Format</span><span class="ov-val">${d.format}</span></div>
    <div class="ov-row"><span class="ov-key">Cost</span><span class="ov-val">${d.cost}</span></div>
    <div class="ov-row"><span class="ov-key">Testing options</span><span class="ov-val">${d.testing}</span></div>
    <div class="ov-row"><span class="ov-key">Languages</span><span class="ov-val">${d.languages}</span></div>
    <a class="ov-link" target="_blank" href="${d.scheduleUrl}">
      <svg class="ov-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V7l-6-4z"></path></svg>
      Schedule an Exam (URL)
    </a>
     <a class="ov-link" target="_blank" href="${d.guideUrl}">
      <svg class="ov-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a 2 2 0 0 0-2 2v14l4-4h10a 2 2 0 0 0 2-2V7l-6-4z"></path></svg>
      Official Exam Guide (PDF)
    </a>
  `;
  card.appendChild(body);
  sideEl.appendChild(card);
}

/* ===========================
   Últimos resultados (sidebar)
   =========================== */
function __getHistory(){ try { return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); } catch(e){ return []; } }
function renderLastResults(side){
  const hist = __getHistory().slice(0,3);
  const panel = h('div', {class:'panel'});
  panel.appendChild(h('h3', {html:'YOUR LAST QUIZ RESULTS'}));
  const box = h('div', {});
  if (!hist.length){
    box.appendChild(h('div', {html:'No attempts yet'}));
  } else {
    hist.forEach(r=>{
      const dt = new Date(r.ts);
      const ok = (r.pct>=70);
      const line = h('div', {class:'result-line'});
      const label = QUIZ_LABEL[r.quizId] || r.quizId || r.track || '—';
      line.innerHTML = `+ ${r.correct}/${r.total} &nbsp; <b style="color:${ok?'#1a7f37':'#c62828'}">${ok?'PASS':'FAIL'} ${r.pct}%</b> &nbsp; ${dt.toLocaleDateString()}`;
      box.appendChild(line);
    });
  }
  panel.appendChild(box);
  side.appendChild(panel);
}

/* ===========================
   Render principal del quiz
   =========================== */
function renderQuiz(){
  const root = document.getElementById('view');
  if (!root) return;
  root.innerHTML = '';

  const wrap = h('section', {class:'card'});
  const shell = h('div', {class:'quiz-wrap'});

  // Left: question
  const qCard = h('div', {class:'question-card'});
  const head = h('div', {class:'header-quiz'});
  head.appendChild(h('div', {class:'title', html: STATE.certi}));
  qCard.appendChild(head);

  const q = STATE.qs[STATE.idx];
  if (!q){
    qCard.appendChild(h('div', {class:'empty', html:'No questions to display.'}));
  } else {
    const dom = h('div', {class:'domain', html: (q.category||'').toUpperCase()});
    qCard.appendChild(dom);
    const title = h('h2', {class:'quiz-question', html: `<b>${STATE.idx+1}.</b> ${q.question}`});
    qCard.appendChild(title);

    q.options.forEach((txt, i) => {
      const chosen = STATE.answers[STATE.idx];
      const selected = chosen === i;
      const isCorrect = q.correctAnswer === i;
      const classes = ['option'];
      if (typeof chosen !== 'undefined'){
        if (selected){
          classes.push('selected');
          classes.push(isCorrect ? 'ok':'bad');
        }
      }
      const line = h('div', {class: classes.join(' ')});
      line.onclick = () => onSelect(i);
      line.appendChild(h('span', {class:'lead', html: String.fromCharCode(65+i)+'.'}));
      line.appendChild(h('span', {html: txt}));
      qCard.appendChild(line);
    });

    // Explicación (tras responder)
    const chosen = STATE.answers[STATE.idx];
    if (typeof chosen !== 'undefined'){
      const box = h('div', {class:'expl'});
      const correctLetter = String.fromCharCode(65 + q.correctAnswer);
      box.appendChild(h('div', {class:'ttl', html:`Correct answer: <strong>${correctLetter}</strong></br>`}));
      box.appendChild(h('div', {class:'explain', html: q.explanationRich || q.explanation || ''}));
      if (q.links && q.links.length){
        const ul = h('ul', {class:'learn-more'});
        q.links.forEach(l => {
          const li = h('li');
          const a = h('a', {href:l.url, target:'_blank', rel:'noopener', html:l.title});
          li.appendChild(a); ul.appendChild(li);
        });
        box.appendChild(h('div',{html:'<div style="font-weight:700;margin-top:6px">Learn more</div>'}));
        box.appendChild(ul);
      }
      qCard.appendChild(box);
    }
  }

  // Controles
  const ctr = h('div', {class:'controls'});
  const back = h('button', {class:'btn secondary', html:'Back'});
  if (STATE.idx===0){ back.disabled = true; back.classList.add('disabled'); }
  back.onclick = () => { STATE.idx=Math.max(0,STATE.idx-1); renderQuiz(); };

  // Botón Mark / Unmark
  const mark = h('button', {class:'btn secondary', html: STATE.marked[STATE.idx] ? 'Unmark' : 'Mark'});
  mark.onclick = () => {
    STATE.marked[STATE.idx] = !STATE.marked[STATE.idx];
    renderQuiz();
  };

  const next = h('button', {class:'btn', html: STATE.idx===STATE.qs.length-1 ? 'Finish' : 'Next'});
  next.onclick = () => {
    if (STATE.idx===STATE.qs.length-1) return finish();
    STATE.idx++; renderQuiz();
  };
  ctr.appendChild(back);
  ctr.appendChild(mark);
  ctr.appendChild(next);
  qCard.appendChild(ctr);

  // Right panels
  const side = h('div', {class:'side'});

  const p1 = h('div', {class:'panel'});
  p1.appendChild(h('h3', {html: 'LIST OF QUESTIONS'}));
  const dots = h('div', {class:'list-dots'});
  STATE.qs.forEach((_, i) => {
    const d = h('div', {class:'dot', html:String(i+1)});
    if (i===STATE.idx) d.classList.add('current');
    const ans = STATE.answers[i];
    if (typeof ans !== 'undefined'){
      if (ans===STATE.qs[i].correctAnswer) d.classList.add('ok');
      else d.classList.add('bad');
    }
    if (STATE.marked[i]) d.classList.add('marked');
    d.onclick = () => { STATE.idx=i; renderQuiz(); };
    dots.appendChild(d);
  });
  p1.appendChild(dots);
  side.appendChild(p1);

  renderLastResults(side);
  renderExamOverviewTo(side);

  shell.appendChild(qCard);
  shell.appendChild(side);
  wrap.appendChild(shell);
  root.appendChild(wrap);
}

/* ===========================
   Selección y fin
   =========================== */
function onSelect(idx){
  // Si ya respondió esta pregunta, no permitir cambiar
  if (typeof STATE.answers[STATE.idx] !== 'undefined') return;
  STATE.answers[STATE.idx] = idx;
  renderQuiz();
}

// Hacemos finish() asíncrona para esperar el guardado remoto
async function finish(){
  const total = STATE.qs.length;
  let score = 0;
  for (let i=0;i<total;i++){
    if (STATE.answers[i]===STATE.qs[i].correctAnswer) score++;
  }
  const percent = Math.round((score/total)*100);

  const result = {
    ts: new Date().toISOString(),
    quizId: STATE.quizId,
    track: STATE.track || 'architect',
    mode: STATE.mode || 'exam',
    total,
    correct: score,
    pct: percent,
    markedCount: Object.values(STATE.marked || {}).filter(Boolean).length,
    // 👇 importante: número, no null
    durationSec: STATE.startedAt ? Math.round((Date.now() - STATE.startedAt)/1000) : 0
  };

  // 1) Guardado local inmediato
  saveHistory(result);

  // 2) Guardado remoto (espera breve con timeout)
  const saveWithTimeout = (p, ms=2000) => Promise.race([
    p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
  ]);

  try {
    await saveWithTimeout(saveResultRemote(result), 2500); // espera hasta 2.5s
    console.log("Resultado guardado en DynamoDB");
  } catch (err) {
    console.warn("Guardado remoto falló (continuo):", err.message);
  }

  // 3) Navega después del intento de guardado (éxito o timeout)
  location.hash = '';
  alert(`Quiz finished! ${score}/${total} (${percent}%)`);
  window.location.href = "/history.html";
}

/* ===========================
   Historial (localStorage)
   =========================== */
const LS_KEY = 'certify_history';
function getHistory(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch(e){ return []; } }
function saveHistory(item){ const arr = getHistory(); arr.unshift(item); while(arr.length>50) arr.pop(); localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
function computeStats(){
  const arr = getHistory();
  if (arr.length===0) return {totalAttempts:0, overall:0};
  const overall = Math.round(arr.reduce((s,r)=>s + (typeof r.pct==='number'? r.pct : (r.percent||0)),0)/arr.length);
  return {totalAttempts:arr.length, overall};
}
function __setHistory(arr){ try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch(e){} }
function saveAttempt(){
  if (!window.STATE || !STATE.qs || !STATE.answers) return;
  const total = STATE.qs.length;
  let correct = 0;
  for (let i=0;i<STATE.answers.length;i++){
    const q = STATE.qs[i]; const ans = STATE.answers[i];
    const right = (typeof q.answer==='number') ? q.answer : q.correctAnswer;
    if (ans === right) correct++;
  }
  const pct = total ? Math.round((correct/total)*100) : 0;
  const rec = { ts:new Date().toISOString(), quizId: STATE.quizId, track: STATE.track || 'architect', total, correct, pct };
  const hist = __getHistory(); hist.unshift(rec); while (hist.length>50) hist.pop(); __setHistory(hist);
}

function refreshLastResultsDOM(){
  const side = document.querySelector('#view .side') || document.querySelector('.side');
  if (!side) return;
  // Remove panel existente
  const panels = side.querySelectorAll('.panel');
  panels.forEach(p=>{
    const h3 = p.querySelector('h3'); 
    if (h3 && /YOUR LAST QUIZ RESULTS/i.test(h3.textContent)) p.remove();
  });
  // Re-render
  try { renderLastResults({appendChild: (el)=> side.appendChild(el)}); } catch(e){}
}

/* ===========================
   Auto-arranque por hash
   =========================== */
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    // Deep link: #/quiz?quiz=az-104 (o aws-saa-c03)
    const mHash = location.hash.match(/quiz=([^&]+)/);
    if (mHash) start(decodeURIComponent(mHash[1]));
    // Ocultaciones opcionales en landing:
    // document.querySelectorAll('*').forEach(el=>{
    //   if (/practitioner/i.test((el.textContent||''))) { el.style.display='none'; }
    // });
  }catch(e){}
});

/* ===========================
   API pública (botones HTML)
   =========================== */
// <button onclick="start('aws-saa-c03')">AWS SAA-C03</button>
// <button onclick="start('az-104')">Azure AZ-104</button>
window.start = start;
