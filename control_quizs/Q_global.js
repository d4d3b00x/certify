/* ===== Singleton guard (evita doble carga del script) ===== */
if (window.__QGLOBAL_ACTIVE) {
  console.warn("Q_global.js already loaded; skipping second init.");
} else {
window.__QGLOBAL_ACTIVE = true;

/* ========== Telemetry (opcional) ========== */
const TELEM=(n,p)=>{try{window.__telem&&window.__telem.on(n,p)}catch{}};

/* ========== CONFIG remota ========== */
const API_URL="https://uougu1cm26.execute-api.eu-central-1.amazonaws.com";

/* ========== Estado global ========== */
const STATE={
  quizId:'aws-saa-c03',
  track:'architect',
  mode:'exam',
  qs:[],
  idx:0,
  answers:{},
  marked:{},
  startedAt:null,
  elapsedSec:0,
  timerId:null,
  certi:'AWS CERTIFIED SOLUTIONS ARCHITECT — ASSOCIATE (SAA-C03)',
  prefs:{count:65,timeLimit:0,explanations:'after',shuffle:true,sound:false,tags:[]},
  saving:false,
  finished:false,
  loading:false
};

/* Token de arranque para evitar “doble start” */
let __START_SEQ = 0;

/* ========== Mapas de examen y metadatos ========== */
const QUIZ_TO_EXAM = {
  'aws-saa-c03': 'SAA-C03',
  'az-104': 'AZ-104'
};

const QUIZZES={
  'aws-saa-c03':{track:'architect',certi:'AWS CERTIFIED SOLUTIONS ARCHITECT — ASSOCIATE (SAA-C03)'},
  'az-104':{track:'az-104-architect',certi:'Microsoft Azure Administrator - Associate (AZ-104)'}
};
const EXAM_OVERVIEW={
  'aws-saa-c03':{category:"Associate",duration:"130 minutes",format:"65 questions; multiple choice or multiple response",cost:"150 USD (+ taxes/fees)",testing:"Pearson VUE testing center or online proctored exam",languages:"EN, FR (France), IT, JA, KO, PT-BR, ES-LATAM, ES-Spain, ZH-CN, ZH-TW",guideUrl:"https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/pdfs/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf",scheduleUrl:"https://cp.certmetrics.com/amazon"},
  'az-104':{category:"Associate",duration:"120 minutes",format:"65 questions; multiple choice or multiple response",cost:"165 USD (+ taxes/fees)",testing:"Pearson VUE testing center or online proctored exam",languages:"EN, ES, FR, DE, JA, KO, ZH (varies by region)",guideUrl:"#",scheduleUrl:"#"}
};

/* ========== Theme ========== */
function applyTheme(quizId){
  const r=document.documentElement, isAWS=quizId==='aws-saa-c03';
  const t=isAWS?{'--pri':'#ff9900','--pri-2':'#ffb84d','--pri-dk':'#cc7a00','--ring':'rgba(255,153,0,.28)','--ok':'#16794c','--ok-bg':'#f1fff4','--ok-bd':'#b9ebca','--bad':'#b3261e','--bad-bg':'#fff5f4','--bad-bd':'#f0b6b0','--card-subtle':'#fff8ed'}
                 :{'--pri':'#0078d4','--pri-2':'#5fb3ff','--pri-dk':'#0a6cbf','--ring':'rgba(0,120,212,.28)','--ok':'#0b6a3b','--ok-bg':'#ecfff4','--ok-bd':'#b9f1d2','--bad':'#9b1b16','--bad-bg':'#fff2f1','--bad-bd':'#f3b7b2','--card-subtle':'#f4faff'};
  Object.entries(t).forEach(([k,v])=>r.style.setProperty(k,v));
}

/* ========== CSS mínimo UI ========== */
(function(){
  const css=`
  .quiz-wrap{display:grid;grid-template-columns:2fr 1fr;gap:18px}
  @media (max-width:900px){.quiz-wrap{grid-template-columns:1fr}}
  .header-quiz{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;border-bottom:1px solid #e8e6ff;padding-bottom:10px}
  .title{font-weight:900;color:#0f1438}
  .quiz-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .timer{font-variant-numeric:tabular-nums;background:#fff;border:1px solid #e2dcff;border-radius:10px;padding:6px 10px;font-weight:800}
  .progress{display:flex;align-items:center;gap:10px;min-width:220px}
  .pbar{position:relative;height:8px;border-radius:999px;background:#eee;overflow:hidden;flex:1}
  .pbar>i{position:absolute;inset:0;width:0;background:linear-gradient(90deg,var(--pri),var(--pri-2))}
  .pcount{font-weight:800;color:#2a1b51;min-width:70px;text-align:right}
  .domain{font-weight:900;color:var(--pri-dk);margin:.5rem 0 .2rem}
  .quiz-question{margin:.2rem 0 .6rem;color:#0f1438}
  .option{display:flex;gap:12px;align-items:flex-start;border:1px solid #ecebff;background:#fff;border-radius:12px;padding:12px 14px;margin:10px 0;cursor:pointer;transition:.08s}
  .option:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,.06);border-color:#ded9ff}
  .option .lead{min-width:24px;font-weight:900;color:var(--pri-dk)}
  .option.selected.ok{border-color:var(--ok);background:linear-gradient(0deg,var(--ok-bg),#fff)}
  .option.selected.bad{border-color:var(--bad);background:linear-gradient(0deg,var(--bad-bg),#fff)}
  .expl{border:1px dashed #e2dcff;border-radius:12px;padding:12px;margin-top:10px;background:var(--card-subtle)}
  .expl .ttl{font-weight:900;margin-bottom:6px}
  .controls{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:flex-end}
  .controls .btn{appearance:none;border:1px solid #e2dcff;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer;background:#fff;color:#2a1b51}
  .controls .btn.primary{background:var(--pri);color:#fff;border-color:transparent}
  .side .panel{background:#fff;border:1px solid #e8e6ff;border-radius:12px;padding:14px;margin-bottom:14px}
  .side h3{margin:.2rem 0 .6rem}
  .list-dots{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:8px}
  .dot{display:flex;align-items:center;justify-content:center;height:38px;border-radius:10px;border:1px solid #e2dcff;background:#fff;cursor:pointer;font-weight:800;color:#2a1b51;position:relative}
  .dot.current{outline:3px solid var(--ring)}
  .dot.ok{background:var(--ok-bg);border-color:var(--ok-bd)}
  .dot.bad{background:var(--bad-bg);border-color:var(--bad-bd)}
  .dot.marked::after{content:"•";position:absolute;top:2px;right:6px;color:var(--pri);font-size:18px}
  .modal-backdrop{position:fixed;inset:0;background:rgba(15,19,48,.45);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999}
  .modal{background:#fff;border:1px solid #e2dcff;border-radius:16px;max-width:620px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:20px}
  .result-row{display:flex;gap:10px;align-items:center;justify-content:space-between;background:var(--card-subtle);border:1px solid #e8e6ff;border-radius:12px;padding:10px 12px;margin-top:8px}
  .badge-pass,.badge-fail{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;font-weight:900}
  .badge-pass{background:var(--ok-bg);border:1px solid var(--ok-bd);color:var(--ok)}
  .badge-fail{background:var(--bad-bg);border:1px solid var(--bad-bd);color:var(--bad)}
  .toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#2a1b51;color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.2);opacity:0;pointer-events:none;transition:opacity .2s ease;z-index:99999}
  .toast.show{opacity:1}
  .loading{padding:18px;border:1px dashed #e2dcff;border-radius:12px;background:#fff;margin:10px 0}
  `;
  const s=document.createElement('style'); s.innerHTML=css; document.head.appendChild(s);
})();

/* ========== Utils ========== */
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function h(tag,attrs={},kids=[]){const el=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')el.className=v;else if(k==='html')el.innerHTML=v;else el.setAttribute(k,v)}kids.forEach(k=>k&&el.appendChild(k));return el}
function pad(n){return String(n).padStart(2,'0')}
function fmtTime(sec){sec=Math.max(0,Number(sec)||0);const m=Math.floor(sec/60),s=sec%60;return `${pad(m)}:${pad(s)}`}
function toast(msg,ms=1600){let t=document.querySelector('.toast');if(!t){t=h('div',{class:'toast'});document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),ms)}

/* ========== Persistencia local ========== */
const LS_KEY='certify_history';
const LS_RUNNING='certify_running_session';
function getHistory(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'[]')}catch{return[]}}
function saveHistory(item){const arr=getHistory();arr.unshift(item);while(arr.length>50)arr.pop();localStorage.setItem(LS_KEY,JSON.stringify(arr))}
function clearRunningSession(){try{localStorage.removeItem(LS_RUNNING)}catch{}}
function autosave(){
  const data={quizId:STATE.quizId,idx:STATE.idx,answers:STATE.answers,marked:STATE.marked,startedAt:STATE.startedAt,elapsedSec:STATE.elapsedSec,certi:STATE.certi,qsLen:STATE.qs.length,prefs:STATE.prefs};
  try{localStorage.setItem(LS_RUNNING,JSON.stringify(data))}catch{}
}
function tryResume(expectedCount){
  try{
    const raw=localStorage.getItem(LS_RUNNING); if(!raw) return false;
    const data=JSON.parse(raw); if(!data || data.quizId!==STATE.quizId) return false;
    if(Number(data.qsLen)!==Number(expectedCount)) return false;
    Object.assign(STATE,data);
    return true;
  }catch{return false}
}

/* ========== Usuario + POST helper ========== */
function getUserAny(){let u=null;try{u=JSON.parse(localStorage.getItem("currentUser")||"null")}catch{}if(!u){try{u=JSON.parse(localStorage.getItem("certify_user")||"null")}catch{}}return u}
async function postForm(url,payload){
  const body=new URLSearchParams();Object.entries(payload).forEach(([k,v])=>body.append(k,String(v)));
  const resp=await fetch(url,{method:"POST",mode:"cors",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body});
  const text=await resp.text();let data=null;try{data=JSON.parse(text)}catch{data={raw:text}}
  if(!resp.ok) throw new Error(`HTTP ${resp.status} ${(data.error||data.message||text)}`);
  return data;
}

/* ========== Prefs del simulador (modo, tiempo, shuffle, tags) ========== */
function readSimulatorPrefs(quizId){
  const sim=document.querySelector(`.sim-card[data-quiz="${quizId}"]`);
  const isAWS=quizId==='aws-saa-c03';
  const urlParams=new URLSearchParams(location.search||'');
  const mode=sim?.querySelector(`input[name="${isAWS?'aws':'az'}-mode"]:checked`)?.value||'practice';
  const timeLimit=parseInt(sim?.querySelector(isAWS?'#aws-time':'#az-time')?.value||'0',10);
  const exp=sim?.querySelector(`input[name="${isAWS?'aws':'az'}-exp"]:checked`)?.value||'after';
  const shuffleOn=!!sim?.querySelector(isAWS?'#aws-shuffle':'#az-shuffle')?.checked;
  const sound=!!sim?.querySelector(isAWS?'#aws-sound':'#az-sound')?.checked;
  const tags=[]; sim?.querySelectorAll('.domains .tag.active')?.forEach(t=>tags.push((t.dataset.val||'').toUpperCase()));
  // count lo resolvemos aparte para garantizar valores válidos
  return {mode,timeLimit,explanations:exp,shuffle:shuffleOn,sound,tags, urlCount: urlParams.get('count')};
}

/* ========== Resolver COUNT con whitelist estricta ========== */
const ALLOWED_COUNTS = [5,10,15,30,65];

function parseIntOrNull(v){
  const n = parseInt(v,10);
  return Number.isFinite(n) ? n : null;
}
function resolveDesiredCount(quizId){
  const sim=document.querySelector(`.sim-card[data-quiz="${quizId}"]`);
  const isAWS=quizId==='aws-saa-c03';
  const urlParams = new URLSearchParams(location.search||'');

  // 1) URL ?count=...
  let count = parseIntOrNull(urlParams.get('count'));

  // 2) UI: selects/inputs típicos
  if (count==null) {
    const preferred = sim?.querySelector(isAWS?'#studyCount':'#studyCount2') || sim?.querySelector('select[id*="studyCount" i]');
    if (preferred) count = parseIntOrNull(preferred.value);
  }
  if (count==null) {
    const anyCount = sim?.querySelector('input[id*="count" i], select[id*="count" i], input[name*="count" i], select[name*="count" i]');
    if (anyCount) count = parseIntOrNull(anyCount.value);
  }

  // 3) LocalStorage prefs (si existieran)
  if (count==null) {
    try {
      const all = JSON.parse(localStorage.getItem('quiz_prefs')||'{}');
      const pv = all?.[quizId]?.count;
      count = parseIntOrNull(pv);
    } catch {}
  }

  // 4) Default seguro
  if (count==null) count = 65;

  // Si el valor no es uno de los permitidos, usar 65
  if (!ALLOWED_COUNTS.includes(count)) count = 65;

  // Hard clamp por seguridad (evita 1)
  if (count < 5) count = 65;

  return count;
}

/* ========== Cliente /questions (Lambda DynamoDB) ========== */
async function fetchQuestionsFromApi(exam, desiredCount=65, searchQ=''){
  const all=[]; let lastKey=null;
  const seen=new Set();
  const pageLimit = 200;

  for (let guard=0; guard<25 && all.length<desiredCount; guard++){
    const params = new URLSearchParams({ exam: exam, limit: String(pageLimit) });
    if (searchQ) params.set('q', searchQ);
    if (lastKey) {
      // NO doble-codificar. URLSearchParams ya maneja el encoding.
      params.set('lastKey', JSON.stringify(lastKey));
    }

    const url = `${API_URL}/questions?${params.toString()}`;
    const res = await fetch(url, { headers: { 'Accept':'application/json' }});
    const text = await res.text();
    if (!res.ok){
      throw new Error(`GET /questions failed ${res.status}: ${text}`);
    }
    let data; try{ data = JSON.parse(text); } catch{ throw new Error('Respuesta no JSON de /questions: '+text); }

    const items = Array.isArray(data.items) ? data.items : [];
    for (const it of items){
      const qid = it.questionId || `${it.exam||''}:${it.question||''}`;
      if (!seen.has(qid)){
        seen.add(qid);
        all.push(it);
        if (all.length>=desiredCount) break;
      }
    }
    lastKey = data.lastEvaluatedKey || null;
    if (!lastKey) break;
  }

  return all.slice(0, desiredCount);
}

/* ========== Transformación al modelo del motor ========== */
function transformQuestions(items) {
  return items.map(it => ({
    question: it.question || '',
    options: Array.isArray(it.options) ? it.options.slice() : [],
    correctAnswer: (typeof it.answerIndex === 'number' ? it.answerIndex : null),
    explanation: it.explanation || '',
    explanationRich: it.explanationRich || '',
    links: Array.isArray(it.links) ? it.links.slice() : [],
    category: it.category || 'General'
  }));
}

/* ========== Start quiz (con token anti-solape y COUNT resuelto) ========== */
async function start(quizId='aws-saa-c03'){
  const mySeq = ++__START_SEQ;
  stopTimer();
  STATE.finished = false;

  const cfg = QUIZZES[quizId]||QUIZZES['aws-saa-c03'];
  Object.assign(STATE,{quizId,track:cfg.track,certi:cfg.certi,mode:'exam'});

  const simPrefsAll = (window.__simPrefs||{});
  const localPrefs = (()=>{ try { return JSON.parse(localStorage.getItem('quiz_prefs')||'{}'); } catch { return {}; }})();
  const uiPrefs = readSimulatorPrefs(quizId);
  const prefs = simPrefsAll[quizId] || localPrefs[quizId] || {};
  if (prefs.mode) STATE.mode = prefs.mode;
  // COUNT ya no viene de aquí; lo resolvemos aparte
  STATE.prefs = { ...STATE.prefs, ...prefs, ...uiPrefs };

  // --- COUNT robusto ---
  const desiredCount = resolveDesiredCount(quizId); // SIEMPRE dentro de [5,10,15,30,65]

  STATE.loading = true;
  showLoading();

  try{
    const exam = QUIZ_TO_EXAM[quizId] || 'SAA-C03';

    // 1) Traer preguntas
    const raw = await fetchQuestionsFromApi(exam, desiredCount, '');
    if (mySeq !== __START_SEQ) return;

    // 2) Transformar
    let all = transformQuestions(raw);

    // 3) Filtro por tags/domains (si hay)
    if (Array.isArray(STATE.prefs.tags) && STATE.prefs.tags.length){
      const tagsUpper = STATE.prefs.tags.map(t=>String(t).toUpperCase());
      all = all.filter(q=>{
        const cat = (q.category||'').toUpperCase();
        const matchesD = tagsUpper.some(t=>{
          if (/^D[1-4]$/.test(t)){
            const num = t.slice(1);
            return cat.includes(`DOMAIN ${num}`);
          }
          return false;
        });
        if (matchesD) return true;
        return tagsUpper.some(t=> cat.includes(t));
      });
    }

    // 4) Shuffle + recorte exacto al desiredCount
    if (STATE.prefs.shuffle) shuffle(all);
    all = all.slice(0, Math.min(desiredCount, all.length));

    // 5) Shuffle de opciones recalculando índice correcto
    all = all.map(q=>{
      const opts = Array.isArray(q.options)? q.options.slice():[];
      const order = shuffle([...Array(opts.length).keys()]);
      const optionsShuffled = order.map(i=>opts[i]);
      const correctIndex = (typeof q.correctAnswer==='number' && q.correctAnswer>=0) ? order.indexOf(q.correctAnswer) : null;
      return { ...q, _optOrder: order, _options: optionsShuffled, _correct: correctIndex };
    });

    // 6) Reset y render
    if (mySeq !== __START_SEQ) return;
    STATE.qs = all;
    STATE.idx=0; STATE.answers={}; STATE.marked={};
    STATE.startedAt=Date.now(); STATE.elapsedSec=0;
    STATE.timeLimit = typeof STATE.prefs.timeLimit === 'number' ? STATE.prefs.timeLimit : 0;

    applyTheme(quizId);
    renderQuiz();
    startTimer();

    toast(`Loaded ${STATE.qs.length} / Requested ${desiredCount} (resolved)`, 2000);
  } catch (err){
    console.error(err);
    showError(err.message||'Error cargando preguntas');
  } finally {
    if (mySeq === __START_SEQ) STATE.loading=false;
  }
}

/* ========== Loading / Error views ========== */
function showLoading(){
  const root=document.getElementById('view'); if(!root) return;
  root.innerHTML='';
  const box=h('div',{class:'loading',html:'Cargando preguntas del examen…'});
  root.appendChild(box);
}
function showError(msg){
  const root=document.getElementById('view'); if(!root) return;
  root.innerHTML='';
  const box=h('div',{class:'loading',html:`<b>Error:</b> ${msg}`});
  root.appendChild(box);
}

/* ========== Timer ========== */
function startTimer(){
  stopTimer();
  STATE.timerId=setInterval(()=>{
    STATE.elapsedSec++;
    const t=document.querySelector('.timer'); if(t) t.textContent=fmtTime(STATE.elapsedSec);
    if(STATE.elapsedSec%5===0) autosave();
  },1000);
}
function stopTimer(){if(STATE.timerId){clearInterval(STATE.timerId);STATE.timerId=null}}

/* ========== Sidebar ========== */
function renderExamOverviewTo(side){
  const d=EXAM_OVERVIEW[STATE.quizId]||EXAM_OVERVIEW['aws-saa-c03'];
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
  if(!arr.length){panel.appendChild(h('div',{html:'No attempts yet'}))}
  else arr.forEach(r=>{
    const ok=r.pct>=70, dt=new Date(r.ts||Date.now());
    const line=h('div',{class:'result-line'});
    line.innerHTML=`${r.correct}/${r.total} &nbsp; <b style="color:${ok?'var(--ok)':'var(--bad)'}">${ok?'PASS':'FAIL'} ${r.pct}%</b> &nbsp; ${dt.toLocaleDateString()}`;
    panel.appendChild(line);
  });
  side.appendChild(panel);
}

/* ========== Render principal ========== */
function renderQuiz(){
  const root=document.getElementById('view'); if(!root) return;
  root.innerHTML='';
  const wrap=h('section',{class:'card'}), shell=h('div',{class:'quiz-wrap'});

  const qCard=h('div',{class:'question-card'});
  const head=h('div',{class:'header-quiz'});
  head.appendChild(h('div',{class:'title',html:STATE.certi}));
  const meta=h('div',{class:'quiz-meta'});
  const timer=h('div',{class:'timer',html:fmtTime(STATE.elapsedSec)});
  const progress=h('div',{class:'progress'}), pbar=h('div',{class:'pbar'}), fill=h('i');
  pbar.appendChild(fill);
  const pcount=h('div',{class:'pcount',html:`${STATE.idx+1}/${STATE.qs.length}`});
  progress.appendChild(pbar); progress.appendChild(pcount);
  meta.appendChild(timer); meta.appendChild(progress);
  head.appendChild(meta); qCard.appendChild(head);

  const q=STATE.qs[STATE.idx];
  if(!q){ qCard.appendChild(h('div',{html:'No questions to display.'})) }
  else{
    const pct=Math.round((STATE.idx/Math.max(1,STATE.qs.length))*100); fill.style.width=`${pct}%`;
    qCard.appendChild(h('div',{class:'domain',html:(q.category||'').toUpperCase()}));
    qCard.appendChild(h('h2',{class:'quiz-question',html:`<b>${STATE.idx+1}.</b> ${q.question}`}));

    (q._options||[]).forEach((txt,i)=>{
      const chosen=STATE.answers[STATE.idx], selected=chosen===i, isCorrect=q._correct===i;
      const cls=['option']; if(typeof chosen!=='undefined'&&selected) cls.push(isCorrect?'ok':'bad','selected');
      const line=h('div',{class:cls.join(' ')}); line.onclick=()=>onSelect(i);
      line.appendChild(h('span',{class:'lead',html:String.fromCharCode(65+i)+'.'}));
      line.appendChild(h('span',{html:txt})); qCard.appendChild(line);
    });

    const chosen=STATE.answers[STATE.idx];
    if(typeof chosen!=='undefined' && STATE.prefs.explanations==='after'){
      const box=h('div',{class:'expl'}), correctLetter=String.fromCharCode(65+(q._correct ?? 0));
      box.innerHTML=`<div class="ttl">Correct answer: <b>${correctLetter}</b></div><div class="explain">${q.explanationRich||q.explanation||''}</div>`;
      if(q.links&&q.links.length){
        const ul=h('ul',{class:'learn-more'});
        q.links.forEach(l=>{const li=h('li'); const a=h('a',{href:l.url,target:'_blank',rel:'noopener',html:l.title||l.url}); li.appendChild(a); ul.appendChild(li)});
        box.appendChild(h('div',{html:'<div style="font-weight:700;margin-top:6px">Learn more</div>'})); box.appendChild(ul);
      }
      qCard.appendChild(box);
    }
  }

  const ctr=h('div',{class:'controls'});
  const back=h('button',{class:'btn',html:'Back'}); back.disabled=STATE.idx===0; back.onclick=()=>{STATE.idx=Math.max(0,STATE.idx-1);renderQuiz()};
  const mark=h('button',{class:'btn',html:STATE.marked[STATE.idx]?'Unmark':'Mark'}); mark.onclick=()=>{STATE.marked[STATE.idx]=!STATE.marked[STATE.idx];toast(STATE.marked[STATE.idx]?'Marked':'Unmarked');renderQuiz()};
  const next=h('button',{class:'btn primary',html:STATE.idx===STATE.qs.length-1?'Finish':'Next'}); next.onclick=()=>{if(STATE.idx===STATE.qs.length-1)return finish();STATE.idx++;renderQuiz()};
  ctr.appendChild(back); ctr.appendChild(mark); ctr.appendChild(next); qCard.appendChild(ctr);

  const side=h('div',{class:'side'});
  const p1=h('div',{class:'panel'}); p1.appendChild(h('h3',{html:'LIST OF QUESTIONS'}));
  const dots=h('div',{class:'list-dots',title:'Click to jump to any question'});
  STATE.qs.forEach((qq,i)=>{
    const d=h('div',{class:'dot',html:String(i+1)});
    if(i===STATE.idx)d.classList.add('current');
    const ans=STATE.answers[i]; if(typeof ans!=='undefined'){ if(ans===qq._correct)d.classList.add('ok'); else d.classList.add('bad'); }
    if(STATE.marked[i]) d.classList.add('marked');
    d.onclick=()=>{STATE.idx=i;renderQuiz()}; dots.appendChild(d);
  });
  p1.appendChild(dots); side.appendChild(p1);

  shell.appendChild(qCard); shell.appendChild(side);
  wrap.appendChild(shell); root.appendChild(wrap);
  enableHotkeys(); try{wrap.scrollIntoView({behavior:'smooth',block:'start'})}catch{}
}

/* ========== Selección y finalización ========== */
function onSelect(i){ if(typeof STATE.answers[STATE.idx]!=='undefined')return; STATE.answers[STATE.idx]=i; autosave(); renderQuiz(); }

/* Idempotency: genera resultId estable para un intento */
function genResultId(result){
  const base = [
    result.quizId||'quiz',
    result.mode||'exam',
    result.total||0,
    result.correct||0,
    result.durationSec||0
  ].join('|');
  const t = Math.floor((new Date(result.ts||Date.now())).getTime()/10000);
  return `${base}|${t}`;
}

async function saveResultRemoteOnce(result){
  if (STATE.saving) return null;
  STATE.saving = true;
  const u=getUserAny()||{};
  const payload={
    resultId: genResultId(result),
    userId:u.userId||u.id||"anon",
    userName:u.name||u.displayName||"anonymous",
    email:u.email||"",
    quizId:result.quizId, track:result.track||"architect", mode:result.mode||"exam",
    total:Number(result.total||0), correct:Number(result.correct||0),
    pct:Number(result.pct||(result.total?Math.round((result.correct/result.total)*100):0)),
    durationSec:Number(result.durationSec||0), ts:result.ts||new Date().toISOString()
  };
  try { return await postForm(`${API_URL}/results`, payload); }
  catch (e){ console.warn("Remote save failed:", e); return null; }
  finally { STATE.saving = false; }
}

function renderResultModal(r){
  const pass=r.pct>=70, bd=h('div',{class:'modal-backdrop'}), m=h('div',{class:'modal'});
  m.appendChild(h('h3',{html:'Exam results'}));
  m.appendChild(h('div',{class:pass?'badge-pass':'badge-fail',html:pass?'✅ PASS — ≥70%':'❌ FAIL — <70%'}));
  m.appendChild(h('div',{class:'result-row',html:`<strong>Score</strong><span>${r.correct}/${r.total} (${r.pct}%)</span>`}));
  m.appendChild(h('div',{class:'result-row',html:`<strong>Duration</strong><span>${Math.floor(r.durationSec/60)}m ${r.durationSec%60}s</span>`}));
  m.appendChild(h('div',{class:'result-row',html:`<strong>Marked</strong><span>${r.markedCount||0}</span>`}));
  const actions=h('div',{class:'controls',style:'margin-top:10px'});
  const home=h('button',{class:'btn',html:'🏠 Home'}); home.onclick=()=>{document.body.removeChild(bd);location.href='/'};
  const review=h('button',{class:'btn primary',html:'🔁 Review'}); review.onclick=()=>{document.body.removeChild(bd)};
  actions.appendChild(home); actions.appendChild(review); m.appendChild(actions);
  bd.appendChild(m); bd.addEventListener('click',(e)=>{if(e.target===bd)document.body.removeChild(bd)}); document.body.appendChild(bd);
}

async function finish(){
  if (STATE.finished) return;
  STATE.finished = true;
  stopTimer();

  const total=STATE.qs.length; let correct=0;
  for(let i=0;i<total;i++){ if(STATE.answers[i]===STATE.qs[i]._correct) correct++; }
  const pct= total? Math.round((correct/total)*100):0;

  const result={
    ts:new Date().toISOString(),
    quizId:STATE.quizId, track:STATE.track||'architect', mode:STATE.mode||'exam',
    total, correct, pct,
    markedCount:Object.values(STATE.marked||{}).filter(Boolean).length,
    durationSec:STATE.startedAt?Math.round((Date.now()-STATE.startedAt)/1000):STATE.elapsedSec||0
  };

  saveHistory(result);
  await saveResultRemoteOnce(result);

  clearRunningSession();
  renderResultModal(result);
}

/* ========== Hotkeys (una sola vez) ========== */
let __hot=false;
function enableHotkeys(){
  if(__hot) return; __hot=true;
  window.addEventListener('keydown',(ev)=>{
    const tag=(ev.target.tagName||'').toLowerCase(); if(tag==='input'||tag==='textarea'||tag==='select'||ev.metaKey||ev.ctrlKey)return;
    if(ev.key==='n'||ev.key==='N'){ev.preventDefault(); if(STATE.idx===STATE.qs.length-1)finish(); else{STATE.idx++;renderQuiz();}}
    if(ev.key==='b'||ev.key==='B'){ev.preventDefault(); if(STATE.idx>0){STATE.idx--;renderQuiz();}}
    if(ev.key==='m'||ev.key==='M'){ev.preventDefault(); STATE.marked[STATE.idx]=!STATE.marked[STATE.idx]; toast(STATE.marked[STATE.idx]?'Marked':'Unmarked'); renderQuiz();}
    const num=parseInt(ev.key,10); 
    if(Number.isInteger(num)&&num>=1&&num<=9){
      const q=STATE.qs[STATE.idx]; 
      if(q&&q._options&&q._options[num-1]!==undefined){ev.preventDefault(); onSelect(num-1);}
    }
  });
}

/* ========== Wire UI (Start / Resume) ========== */
document.addEventListener('DOMContentLoaded',()=>{
  // Si tienes botones .start-btn dentro de .sim-card[data-quiz="..."], ya funcionan:
  document.querySelectorAll('.sim-card .start-btn').forEach(btn=>{
    btn.addEventListener('click',async ()=>{
      const quizId=btn.closest('.sim-card')?.dataset.quiz||'aws-saa-c03';
      await start(quizId);
    });
  });

  // Si NO tienes esos botones, puedes iniciar manualmente:
  //   window.start('az-104')  o  window.start('aws-saa-c03')

  // Opcionales
  document.getElementById('aws-restore')?.addEventListener('click',()=>start('aws-saa-c03'));
  document.getElementById('az-restore')?.addEventListener('click',()=>start('az-104'));

  // (No arrancamos por hash para evitar dobles inicios accidentales)
});

/* ========== API pública ========== */
window.start=start;

} // end singleton
