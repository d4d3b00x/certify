/* ===========================
   Telemetry helper (opcional)
   =========================== */
const TELEM = (n,p)=>{ try{ window.__telem && window.__telem.on(n,p); }catch(e){} };

/* ===========================
   CONFIG remota (API Gateway)
   =========================== */
const API_URL = "https://uougu1cm26.execute-api.eu-central-1.amazonaws.com"; 

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
  elapsedSec: 0,
  timerId: null,
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
    languages: "EN, FR, IT, JA, KO, PT-BR, ES-LATAM, ES-ES, ZH-CN, ZH-TW",
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
   Theming: tonos AWS (naranja) / Azure (azul)
   =========================== */
function applyTheme(quizId){
  const root = document.documentElement;
  const isAWS = quizId === 'aws-saa-c03';
  const theme = isAWS
    ? {
        '--pri':'#ff9900',
        '--pri-2':'#ffb84d',
        '--pri-dk':'#cc7a00',
        '--ring':'rgba(255,153,0,.28)',
        '--ok':'#16794c',
        '--ok-bg':'#f1fff4',
        '--ok-bd':'#b9ebca',
        '--bad':'#b3261e',
        '--bad-bg':'#fff5f4',
        '--bad-bd':'#f0b6b0',
        '--card-subtle':'#fff8ed'
      }
    : {
        '--pri':'#0078d4',
        '--pri-2':'#5fb3ff',
        '--pri-dk':'#0a6cbf',
        '--ring':'rgba(0,120,212,.28)',
        '--ok':'#0b6a3b',
        '--ok-bg':'#ecfff4',
        '--ok-bd':'#b9f1d2',
        '--bad':'#9b1b16',
        '--bad-bg':'#fff2f1',
        '--bad-bd':'#f3b7b2',
        '--card-subtle':'#f4faff'
      };
  for (const [k,v] of Object.entries(theme)) root.style.setProperty(k,v);
}

/* ===========================
   Estilos visuales inyectados (temeados)
   =========================== */
(function injectStyles(){
  const css = `
  .quiz-wrap{display:grid;grid-template-columns:2fr 1fr;gap:18px}
  @media (max-width:900px){.quiz-wrap{grid-template-columns:1fr}}

  .header-quiz{
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:10px;border-bottom:1px solid #e8e6ff;padding-bottom:10px
  }
  .title{font-weight:900;color:#0f1438}
  .quiz-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

  .timer{
    font-variant-numeric:tabular-nums;background:#fff;border:1px solid #e2dcff;
    border-radius:10px;padding:6px 10px;font-weight:800
  }

  .progress{display:flex;align-items:center;gap:10px;min-width:220px}
  .pbar{position:relative;height:8px;border-radius:999px;background:#eee;overflow:hidden;flex:1}
  .pbar>i{position:absolute;inset:0;width:0%;background:linear-gradient(90deg,var(--pri),var(--pri-2))}

  .pcount{font-weight:800;color:#2a1b51;min-width:70px;text-align:right}

  .domain{font-weight:900;color:var(--pri-dk);margin:.5rem 0 .2rem}
  .quiz-question{margin:.2rem 0 .6rem;color:#0f1438}

  .option{
    display:flex;gap:12px;align-items:flex-start;border:1px solid #ecebff;
    background:#fff;border-radius:12px;padding:12px 14px;margin:10px 0;
    cursor:pointer;transition:transform .08s ease, box-shadow .12s ease, border-color .12s ease
  }
  .option:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,.06);border-color:#ded9ff}
  .option .lead{min-width:24px;font-weight:900;color:var(--pri-dk)}

  .option.selected.ok{border-color:var(--ok);background:linear-gradient(0deg,var(--ok-bg),#ffffff)}
  .option.selected.bad{border-color:var(--bad);background:linear-gradient(0deg,var(--bad-bg),#ffffff)}

  .expl{border:1px dashed #e2dcff;border-radius:12px;padding:12px;margin-top:10px;background:var(--card-subtle)}
  .expl .ttl{font-weight:900;margin-bottom:6px}

  .controls{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
  .controls .btn{appearance:none;border:1px solid #e2dcff;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}
  .controls .btn:focus{outline:3px solid var(--ring);outline-offset:2px}
  .controls .btn.secondary{background:#fff;color:#2a1b51}
  .controls .btn:not(.secondary){background:var(--pri);color:#fff;border-color:transparent}
  .controls .btn:not(.secondary):hover{filter:brightness(1.05)}

  .side .panel{background:#fff;border:1px solid #e8e6ff;border-radius:12px;padding:14px;margin-bottom:14px}
  .side h3{margin:.2rem 0 .6rem}

  .list-dots{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:8px}
  .dot{display:flex;align-items:center;justify-content:center;height:38px;border-radius:10px;
    border:1px solid #e2dcff;background:#fff;cursor:pointer;font-weight:800;color:#2a1b51;position:relative}
  .dot.current{outline:3px solid var(--ring)}
  .dot.ok{background:var(--ok-bg);border-color:var(--ok-bd)}
  .dot.bad{background:var(--bad-bg);border-color:var(--bad-bd)}
  .dot.marked::after{content:"•";position:absolute;top:2px;right:6px;color:var(--pri);font-size:18px}

  .toast{
    position:fixed;left:50%;bottom:18px;transform:translateX(-50%);
    background:#2a1b51;color:#fff;padding:10px 14px;border-radius:10px;
    box-shadow:0 10px 24px rgba(0,0,0,.2);opacity:0;pointer-events:none;
    transition:opacity .2s ease
  }
  .toast.show{opacity:1}

  .modal-backdrop{position:fixed;inset:0;background:rgba(15,19,48,.45);
    display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999}
  .modal{
    background:#fff;border:1px solid #e2dcff;border-radius:16px;max-width:620px;width:100%;
    box-shadow:0 20px 60px rgba(0,0,0,.25);padding:20px
  }
  .modal h3{margin:.2rem 0 .6rem}
  .result-row{display:flex;gap:10px;align-items:center;justify-content:space-between;
    background:var(--card-subtle);border:1px solid #e8e6ff;border-radius:12px;padding:10px 12px;margin-top:8px}
  .badge-pass{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;
    background:var(--ok-bg);border:1px solid var(--ok-bd);color:var(--ok);font-weight:900}
  .badge-fail{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;
    background:var(--bad-bg);border:1px solid var(--bad-bd);color:var(--bad);font-weight:900}
  `;
  const s = document.createElement('style');
  s.innerHTML = css;
  document.head.appendChild(s);
})();

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
  kids.forEach(k=>el && k && el.appendChild(k));
  return el;
}
function pad(n){ return String(n).padStart(2,'0'); }
function fmtTime(sec){ sec = Math.max(0, Number(sec)||0); const m = Math.floor(sec/60), s = sec%60; return `${pad(m)}:${pad(s)}`; }
function showToast(msg, ms=1700){
  let t = document.querySelector('.toast');
  if (!t){ t = h('div',{class:'toast'}); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), ms);
}

/* ===========================
   Helpers de sesión / remotos
   =========================== */
function getCurrentUser(){
  try { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
  catch { return null; }
}
async function __postForm(url, obj){
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k,v]) => params.append(k, String(v)));
  const resp = await fetch(url, { method:"POST", body:params, mode:"cors", cache:"no-store", keepalive:true });
  const text = await resp.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw:text }; }
  if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
  return data;
}
async function saveResultRemote(result){
  const u = getCurrentUser();
  if (!u) throw new Error("Debes iniciar sesión para guardar resultados.");
  const total = Number(result.total||0);
  const correct = Number(result.correct||0);
  const pct = total>0? Math.round((correct/total)*100):Number(result.pct||0);
  const payload = { ...result, userId:u.userId, userName:u.name, email:u.email||"", pct };
  try{ return await __postForm(`${API_URL}/results`, payload); }
  catch(err){ console.error("saveResultRemote:", err); throw err; }
}

/* ===========================
   Persistencia local (autosave)
   =========================== */
const LS_KEY = 'certify_history';
const LS_RUNNING = 'certify_running_session';
function getHistory(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch(e){ return []; } }
function saveHistory(item){ const arr = getHistory(); arr.unshift(item); while(arr.length>50) arr.pop(); localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
function autosave(){
  const data = {
    quizId: STATE.quizId,
    idx: STATE.idx,
    answers: STATE.answers,
    marked: STATE.marked,
    startedAt: STATE.startedAt,
    elapsedSec: STATE.elapsedSec,
    certi: STATE.certi,
    qsLen: STATE.qs.length
  };
  try{ localStorage.setItem(LS_RUNNING, JSON.stringify(data)); }catch(e){}
}
function tryResume(){
  try{
    const raw = localStorage.getItem(LS_RUNNING);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || data.quizId!==STATE.quizId) return false;
    Object.assign(STATE, data);
    return true;
  }catch{ return false; }
}

/* ===========================
   Inicio de quiz
   =========================== */
function start(quizId='aws-saa-c03'){
  const cfg = QUIZZES[quizId]||QUIZZES['aws-saa-c03'];
  Object.assign(STATE,{quizId,track:cfg.track,certi:cfg.certi,mode:'exam'});

  // 🟨/🔵 aplicar tema
  applyTheme(quizId);

  const src = cfg.questions();
  let all = flattenQuestions(src);

  // Lee número de preguntas desde #studyCount o #studyCount2 si existen
  let n = 65;
  try{
    const el = document.getElementById('studyCount') || document.getElementById('studyCount2');
    if (el && el.value) n = parseInt(el.value,10);
    if (![5,10,15,30,65].includes(n)) n = Math.min(65, Math.max(5, n||65));
  }catch{}

  all = shuffle(all).slice(0, n);

  // Si había sesión previa del mismo quiz y mismo tamaño, restaura
  if (tryResume() && STATE.qsLen === n) {
    showToast('Restored previous session');
  } else {
    STATE.qs = all;
    STATE.idx=0; STATE.answers={}; STATE.marked={};
    STATE.startedAt=Date.now(); STATE.elapsedSec=0;
  }

  location.hash=`#/quiz?quiz=${quizId}`;
  renderQuiz();
  startTimer();
}

/* ===========================
   Timer
   =========================== */
function startTimer(){
  stopTimer();
  STATE.timerId=setInterval(()=>{
    STATE.elapsedSec++;
    const t=document.querySelector('.timer'); if(t) t.textContent=fmtTime(STATE.elapsedSec);
    if(STATE.elapsedSec%5===0) autosave();
  },1000);
}
function stopTimer(){ if(STATE.timerId){ clearInterval(STATE.timerId); STATE.timerId=null; } }

/* ===========================
   Sidebar panels
   =========================== */
function renderExamOverviewTo(side){
  const d = EXAM_OVERVIEW_BY_QUIZ[STATE.quizId]||EXAM_OVERVIEW_BY_QUIZ['aws-saa-c03'];
  const card=h('div',{class:'panel'});
  card.innerHTML=`<h3>OFFICIAL EXAM OVERVIEW</h3>
  <div><b>Category:</b> ${d.category}<br><b>Duration:</b> ${d.duration}<br>
  <b>Format:</b> ${d.format}<br><b>Cost:</b> ${d.cost}<br>
  <b>Testing:</b> ${d.testing}<br><b>Languages:</b> ${d.languages}<br>
  <a target="_blank" href="${d.scheduleUrl}">Schedule Exam</a><br>
  <a target="_blank" href="${d.guideUrl}">Official Guide</a></div>`;
  side.appendChild(card);
}
function renderLastResults(side){
  const arr=getHistory().slice(0,3);
  const panel=h('div',{class:'panel'}); panel.innerHTML='<h3>YOUR LAST QUIZ RESULTS</h3>';
  if(!arr.length){panel.appendChild(h('div',{html:'No attempts yet'}));}
  else arr.forEach(r=>{
    const ok=r.pct>=70; const line=h('div',{class:'result-line'});
    line.innerHTML=`${r.correct}/${r.total} <b style="color:${ok?'var(--ok)':'var(--bad)'}">${ok?'PASS':'FAIL'} ${r.pct}%</b>`;
    panel.appendChild(line);
  });
  side.appendChild(panel);
}

/* ===========================
   Render principal
   =========================== */
function renderQuiz(){
  const root=document.getElementById('view'); if(!root)return;
  root.innerHTML=''; const wrap=h('section',{class:'card'}); const shell=h('div',{class:'quiz-wrap'});
  const qCard=h('div',{class:'question-card'});

  // Header (SIN pill de dominio arriba)
  const head=h('div',{class:'header-quiz'});
  head.appendChild(h('div',{class:'title',html:STATE.certi}));
  const meta=h('div',{class:'quiz-meta'});
  const timer=h('div',{class:'timer',html:fmtTime(STATE.elapsedSec)});
  const progress=h('div',{class:'progress'});
  const pbar=h('div',{class:'pbar'}); const fill=h('i'); pbar.appendChild(fill);
  const pcount=h('div',{class:'pcount',html:`${STATE.idx+1}/${STATE.qs.length}`});
  progress.appendChild(pbar); progress.appendChild(pcount);
  meta.appendChild(timer); meta.appendChild(progress);
  head.appendChild(meta); qCard.appendChild(head);

  const q=STATE.qs[STATE.idx];
  if(!q){ qCard.appendChild(h('div',{html:'No questions to display.'})); }
  else{
    const pct=Math.round(((STATE.idx)/Math.max(1,STATE.qs.length))*100); fill.style.width=`${pct}%`;

    // Pregunta + Dominio (debajo de la pregunta)
    const title=h('h2',{class:'quiz-question',html:`<b>${STATE.idx+1}.</b> ${q.question}`});
    qCard.appendChild(title);
    const dom=h('div',{class:'domain',html:(q.category||'').toUpperCase()});
    qCard.appendChild(dom);

    q.options.forEach((txt,i)=>{
      const chosen=STATE.answers[STATE.idx];
      const selected=chosen===i;
      const isCorrect=q.correctAnswer===i;
      const classes=['option'];
      if(typeof chosen!=='undefined'&&selected) classes.push(isCorrect?'ok':'bad','selected');
      const line=h('div',{class:classes.join(' ')});
      line.onclick=()=>onSelect(i);
      line.appendChild(h('span',{class:'lead',html:String.fromCharCode(65+i)+'.'}));
      line.appendChild(h('span',{html:txt}));
      qCard.appendChild(line);
    });

    const chosen=STATE.answers[STATE.idx];
    if(typeof chosen!=='undefined'){
      const box=h('div',{class:'expl'});
      const correctLetter=String.fromCharCode(65+q.correctAnswer);
      box.innerHTML=`<div class="ttl">Correct answer: <b>${correctLetter}</b></div>
      <div class="explain">${q.explanationRich||q.explanation||''}</div>`;
      if(q.links && q.links.length){
        const ul=h('ul',{class:'learn-more'});
        q.links.forEach(l=>{
          const li=h('li');
          const a=h('a',{href:l.url,target:'_blank',rel:'noopener',html:l.title});
          li.appendChild(a); ul.appendChild(li);
        });
        box.appendChild(h('div',{html:'<div style="font-weight:700;margin-top:6px">Learn more</div>'}));
        box.appendChild(ul);
      }
      qCard.appendChild(box);
    }
  }

  // Controles
  const ctr=h('div',{class:'controls'});
  const back=h('button',{class:'btn secondary',html:'Back'}); back.disabled=STATE.idx===0;
  back.onclick=()=>{STATE.idx=Math.max(0,STATE.idx-1);renderQuiz();};

  const mark=h('button',{class:'btn secondary',html:STATE.marked[STATE.idx]?'Unmark':'Mark'});
  mark.onclick=()=>{
    STATE.marked[STATE.idx]=!STATE.marked[STATE.idx];
    showToast(STATE.marked[STATE.idx]?'Marked for review':'Unmarked');
    renderQuiz();
  };

  const next=h('button',{class:'btn',html:STATE.idx===STATE.qs.length-1?'Finish':'Next'});
  next.onclick=()=>{ if(STATE.idx===STATE.qs.length-1) return finish(); STATE.idx++; renderQuiz(); };

  ctr.appendChild(back); ctr.appendChild(mark); ctr.appendChild(next);
  qCard.appendChild(ctr);

  // Right panels
  const side=h('div',{class:'side'});

  const p1=h('div',{class:'panel'});
  p1.appendChild(h('h3',{html:'LIST OF QUESTIONS'}));
  const dots=h('div',{class:'list-dots',title:'Click to jump to any question'});
  STATE.qs.forEach((_,i)=>{
    const d=h('div',{class:'dot',html:String(i+1)});
    if(i===STATE.idx) d.classList.add('current');
    const ans=STATE.answers[i];
    if(typeof ans!=='undefined'){
      if(ans===STATE.qs[i].correctAnswer) d.classList.add('ok');
      else d.classList.add('bad');
    }
    if(STATE.marked[i]) d.classList.add('marked');
    d.onclick=()=>{STATE.idx=i;renderQuiz();};
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

  // Hotkeys
  enableHotkeys();

  try{ wrap.scrollIntoView({behavior:'smooth', block:'start'}); }catch{}
}

/* ===========================
   Selección y fin
   =========================== */
function onSelect(idx){
  // Si ya respondió esta pregunta, no permitir cambiar
  if (typeof STATE.answers[STATE.idx] !== 'undefined') return;
  STATE.answers[STATE.idx] = idx;
  autosave();
  renderQuiz();
}

// Modal de resultados
function renderResultModal(r){
  const pass = r.pct>=70;
  const bd = h('div',{class:'modal-backdrop'});
  const m = h('div',{class:'modal'});
  m.appendChild(h('h3',{html: pass ? '✅ PASSED' : '❌ FAILED'}));
  const badge = h('div',{class: pass ? 'badge-pass' : 'badge-fail', html: pass ? 'Score ≥ 70% required' : 'Score below 70%'});
  m.appendChild(badge);

  const row1 = h('div',{class:'result-row', html:`<strong>Score</strong><span>${r.correct}/${r.total} (${r.pct}%)</span>`});
  const row2 = h('div',{class:'result-row', html:`<strong>Duration</strong><span>${fmtTime(r.durationSec)}</span>`});
  const row3 = h('div',{class:'result-row', html:`<strong>Marked for review</strong><span>${r.markedCount||0}</span>`});
  m.appendChild(row1); m.appendChild(row2); m.appendChild(row3);

  const actions = h('div',{class:'controls'});
  const btnHome = h('button',{class:'btn secondary', html:'🏠 Home'}); btnHome.onclick=()=>location.href='/';
  const btnReview = h('button',{class:'btn secondary', html:'🔁 Review'}); btnReview.onclick=()=>{ document.body.removeChild(bd); };
  const btnRanking = h('a',{class:'btn', html:'🏆 Ranking'}); btnRanking.href='/score/ranking.html';
  actions.appendChild(btnHome); actions.appendChild(btnReview); actions.appendChild(btnRanking);
  m.appendChild(h('div',{style:'height:6px'}));
  m.appendChild(actions);

  bd.appendChild(m);
  bd.addEventListener('click', (e)=>{ if (e.target===bd) document.body.removeChild(bd); });
  document.body.appendChild(bd);
}

/* ===========================
   finish() con guardado remoto/local
   =========================== */
async function finish(){
  stopTimer();

  const total = STATE.qs.length;
  let score = 0;
  for (let i=0;i<total;i++){
    if (STATE.answers[i]===STATE.qs[i].correctAnswer) score++;
  }
  const percent = Math.round((score/total)*100);

  // Recupera usuario logueado de localStorage (lo guardamos en login)
  const currentUser = JSON.parse(localStorage.getItem("certify_user") || "{}");

  const result = {
    ts: new Date().toISOString(),
    quizId: STATE.quizId,
    track: STATE.track || 'architect',
    mode: STATE.mode || 'exam',
    total,
    correct: score,
    pct: percent,
    markedCount: Object.values(STATE.marked || {}).filter(Boolean).length,
    durationSec: STATE.startedAt ? Math.round((Date.now() - STATE.startedAt)/1000) : STATE.elapsedSec || 0,
    userId: currentUser.userId || "anon",
    userName: currentUser.name || "(sin nombre)",
    email: currentUser.email || ""
  };

  // Guardado local y remoto
  saveHistory(result);
  try { await saveResultRemote(result); }
  catch (err) { console.warn("Guardado remoto falló:", err); }

  // Limpia autosave
  try{ localStorage.removeItem(LS_RUNNING); }catch{}

  // Modal en vez de alert
  renderResultModal(result);
}

/* ===========================
   Hotkeys
   =========================== */
let __hotkeysBound = false;
function enableHotkeys(){
  if (__hotkeysBound) return;
  __hotkeysBound = true;
  window.addEventListener('keydown', (ev)=>{
    const tag = (ev.target.tagName||'').toLowerCase();
    if (tag==='input' || tag==='textarea' || tag==='select' || ev.metaKey || ev.ctrlKey) return;

    if (ev.key==='n' || ev.key==='N'){ ev.preventDefault(); const last=STATE.idx===STATE.qs.length-1; if (last) finish(); else { STATE.idx++; renderQuiz(); } }
    if (ev.key==='b' || ev.key==='B'){ ev.preventDefault(); if (STATE.idx>0){ STATE.idx--; renderQuiz(); } }
    if (ev.key==='m' || ev.key==='M'){ ev.preventDefault(); STATE.marked[STATE.idx]=!STATE.marked[STATE.idx]; showToast(STATE.marked[STATE.idx]?'Marked for review':'Unmarked'); renderQuiz(); }

    const num = parseInt(ev.key,10);
    if (Number.isInteger(num) && num>=1 && num<=9){
      const q = STATE.qs[STATE.idx];
      if (q && q.options && q.options[num-1] !== undefined){
        ev.preventDefault();
        onSelect(num-1);
      }
    }
  });
}

/* ===========================
   Auto-arranque por hash
   =========================== */
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    const mHash = location.hash.match(/quiz=([^&]+)/);
    if (mHash) start(decodeURIComponent(mHash[1]));
  }catch(e){}
});

/* ===========================
   API pública
   =========================== */
window.start = start;
