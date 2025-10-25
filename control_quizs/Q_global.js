



/* ===== Singleton guard ===== */
if (window.__QGLOBAL_ACTIVE) {
  console.warn("Q_Global.js already loaded; skipping second init.");
} else {
window.__QGLOBAL_ACTIVE = true;

/* ========== CONFIG ========== */
const API_URL = "https://uougu1cm26.execute-api.eu-central-1.amazonaws.com";

/* ========== Estado global ========== */
const STATE = {
  quizId: 'aws-saa-c03',
  track: 'architect',
  mode: 'exam',
  qs: [],
  idx: 0,
  answers: {},
  marked: {},
  startedAt: null,
  elapsedSec: 0,
  timerId: null,
  certi: 'AWS CERTIFIED SOLUTIONS ARCHITECT — ASSOCIATE (SAA-C03)',
  prefs: { count: 65, timeLimit: 0, explanations: 'after', tags: [] },
  saving: false,
  finished: false,
  loading: false,
  timeLimit: 0
};
let __START_SEQ = 0;

/* ========== Mapas de examen ========== */
const QUIZ_TO_EXAM = { 'aws-saa-c03':'SAA-C03', 'az-104':'AZ-104' };
const QUIZZES = {
  'aws-saa-c03': { track:'architect',        certi:'AWS CERTIFIED SOLUTIONS ARCHITECT — ASSOCIATE (SAA-C03)' },
  'az-104'     : { track:'az-104-architect', certi:'Microsoft Azure Administrator - Associate (AZ-104)' }
};

/* ========== CSS inyectado (incluye modal aislado) ========== */
(function(){
  const css = `
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
  .domain{font-weight:900;color:#0a4a7b;margin:.5rem 0 .2rem}
  .quiz-question{margin:.2rem 0 .6rem;color:#0f1438}
  .option{display:flex;gap:12px;align-items:flex-start;border:1px solid #ecebff;background:#fff;border-radius:12px;padding:12px 14px;margin:10px 0;cursor:pointer;transition:.08s}
  .option:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,0,0,.06);border-color:#ded9ff}
  .option .lead{min-width:24px;font-weight:900;color:#0a4a7b}
  .option.selected.ok{border-color:#16794c;background:linear-gradient(0deg,#f1fff4,#fff)}
  .option.selected.bad{border-color:#b3261e;background:linear-gradient(0deg,#fff5f4,#fff)}
  .expl{border:1px dashed #e2dcff;border-radius:12px;padding:12px;margin-top:10px;background:#f4faff}
  .controls{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:flex-end}
  .controls.centered{justify-content:center}
  .controls .btn{appearance:none;border:1px solid #e2dcff;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer;background:#fff;color:#2a1b51}
  .controls .btn.primary{background:#0078d4;color:#fff;border-color:transparent}
  .side .panel{background:#fff;border:1px solid #e8e6ff;border-radius:12px;padding:14px;margin-bottom:14px}
  .side h3{margin:.2rem 0 .6rem}
  .list-dots{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:8px}
  .dot{display:flex;align-items:center;justify-content:center;height:38px;border-radius:10px;border:1px solid #e2dcff;background:#fff;cursor:pointer;font-weight:800;color:#2a1b51;position:relative}
  .dot.current{outline:3px solid rgba(0,120,212,.28)}
  .dot.ok{background:#ecfff4;border-color:#b9f1d2}
  .dot.bad{background:#fff2f1;border-color:#f3b7b2}
  .dot.marked::after{content:"•";position:absolute;top:2px;right:6px;color:#0078d4;font-size:18px}
  .toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#2a1b51;color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.2);opacity:0;pointer-events:none;transition:opacity .2s ease;z-index:99999}
  .toast.show{opacity:1}
  .loading{padding:18px;border:1px dashed #e2dcff;border-radius:12px;background:#fff;margin:10px 0}

  /* === Modal Aislado === */
  .qg-lock{overflow:hidden}
  .qg-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,19,48,.45);z-index:2147483000}
  .qg-modal{max-width:680px;width:100%;background:#ffffff;border:1px solid #e2dcff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.35);padding:20px}
  .qg-modal h3{margin:.2rem 0 .6rem}
  .qg-result-row{display:flex;gap:10px;align-items:center;justify-content:space-between;background:#f7f9ff;border:1px solid #e8e6ff;border-radius:12px;padding:10px 12px;margin-top:8px}
  .qg-badge-pass,.qg-badge-fail{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;font-weight:900;margin:.2rem 0}
  .qg-badge-pass{background:#ecfff4;border:1px solid #b9f1d2;color:#16794c}
  .qg-badge-fail{background:#fff2f1;border:1px solid #f3b7b2;color:#9b1b16}
  .qg-actions{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:flex-end}
  .qg-actions .btn{appearance:none;border:1px solid #e2dcff;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer;background:#fff;color:#2a1b51}
  .qg-actions .btn.primary{background:#0078d4;color:#fff;border-color:transparent}
  `;
  const s=document.createElement('style'); s.innerHTML=css; document.head.appendChild(s);
})();

/* ========== Utils ========== */
function h(tag,attrs={},kids=[]){const el=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')el.className=v;else if(k==='html')el.innerHTML=v;else el.setAttribute(k,v)}kids.forEach(k=>k&&el.appendChild(k));return el}
function pad(n){return String(n).padStart(2,'0')}
function fmtTime(sec){sec=Math.max(0,Number(sec)||0);const m=Math.floor(sec/60),s=sec%60;return `${pad(m)}:${pad(s)}`}
function toast(msg,ms=1600){let t=document.querySelector('.toast');if(!t){t=h('div',{class:'toast'});document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),ms)}
function shuffle(a){const arr=a;const n=arr.length;const buf=new Uint32Array(n);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(buf);for(let i=n-1;i>0;i--){const r=buf[i]!==undefined?(buf[i]/0x100000000):Math.random();const j=Math.floor(r*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}

/* ========== Tema ========== */
function applyTheme(quizId){
  const r=document.documentElement;
  const isAWS=quizId==='aws-saa-c03';
  const t=isAWS?
    {'--pri':'#ff9900','--pri-2':'#ffb84d','--pri-dk':'#cc7a00','--ring':'rgba(255,153,0,.28)'}:
    {'--pri':'#0078d4','--pri-2':'#5fb3ff','--pri-dk':'#0a6cbf','--ring':'rgba(0,120,212,.28)'};
  Object.entries(t).forEach(([k,v])=>r.style.setProperty(k,v));
}

/* ========== Cliente /questions ========== */
async function fetchQuestionsFromApi({exam,count,overfetch=3,domainTags=[],searchQ=''}) {
  const target=Math.max(count*overfetch, count);
  const all=[]; let lastKey=null; const seen=new Set(); const pageLimit=200;
  const onlyDn=(domainTags||[]).filter(t=>/^D\d+$/i.test(t)).join(',');
  for(let guard=0; guard<25 && all.length<target; guard++){
    const params=new URLSearchParams({exam:String(exam),limit:String(pageLimit)});
    if(searchQ) params.set('q',searchQ);
    if(onlyDn) params.set('domains',onlyDn);
    params.set('count',String(count));
    if(lastKey) params.set('lastKey', JSON.stringify(lastKey));
    const url=`${API_URL}/questions?${params.toString()}`;
    const res=await fetch(url,{headers:{'Accept':'application/json'}});
    const text=await res.text();
    if(!res.ok) throw new Error(`GET /questions ${res.status}: ${text}`);
    let data; try{data=JSON.parse(text)}catch{ throw new Error('Respuesta no JSON de /questions'); }
    const items=Array.isArray(data.items)?data.items:[];
    for(const it of items){
      const qid=it.questionId || `${it.exam||''}:${it.question||''}`;
      if(!seen.has(qid)){ seen.add(qid); all.push(it); if(all.length>=target) break; }
    }
    lastKey=data.lastEvaluatedKey||null;
    if(!lastKey) break;
  }
  return all.slice(0,target);
}

/* ========== Transformación / filtros ========== */
function normalizeDomain(it){
  if (it.domain && /^D\d+$/i.test(it.domain)) return it.domain.toUpperCase();
  const s=String(it.category||it.domain||''); const m=s.match(/\bD(?:OMAIN)?\s*(\d+)\b/i);
  return m?('D'+m[1]):null;
}
function transformQuestions(items){
  return items.map(it=>{
    const domain=normalizeDomain(it);
    return {
      question: it.question || '',
      options: Array.isArray(it.options) ? it.options.slice() : [],
      correctAnswer: (typeof it.answerIndex==='number'?it.answerIndex:null),
      explanation: it.explanation || '',
      explanationRich: it.explanationRich || '',
      links: Array.isArray(it.links) ? it.links.slice() : [],
      category: it.category || 'General',
      topic: it.topic || it.area || '',
      domain
    };
  });
}
function filterBySelection(all,tags){
  if(!Array.isArray(tags)||tags.length===0) return all;
  const want=tags.map(s=>String(s).toUpperCase().trim());
  const wantsDomains=want.some(t=>/^D\d+$/.test(t));
  const wantsTopics=want.some(t=>!/^D\d+$/.test(t));
  return all.filter(q=>{
    const d=(q.domain||'').toUpperCase();
    const cat=(q.category||'').toUpperCase();
    const topic=(q.topic||'').toUpperCase();
    if(wantsDomains){
      if(d && want.includes(d)) return true;
      const m=cat.match(/\bD(?:OMAIN)?\s*(\d+)\b/);
      if(m && want.includes('D'+m[1])) return true;
    }
    if(wantsTopics){
      if(want.some(t=>cat.includes(t)||topic.includes(t))) return true;
    }
    return false;
  });
}

/* ========== START (acepta overrides: {count, tags}) ========== */
async function start(quizId='aws-saa-c03', overrides={}){
  const mySeq=++__START_SEQ;
  stopTimer();
  STATE.finished=false;

  const cfg=QUIZZES[quizId] || QUIZZES['aws-saa-c03'];
  STATE.quizId=quizId;
  STATE.track=cfg.track;
  STATE.certi=cfg.certi;
  STATE.mode='exam';

  const desiredCount = Number(overrides.count ?? STATE.prefs.count ?? 65);
  const tags = Array.isArray(overrides.tags) ? overrides.tags.slice() : [];
  STATE.prefs = { ...STATE.prefs, count: desiredCount, tags };

  STATE.loading=true;
  showLoading();

  try{
    const exam=QUIZ_TO_EXAM[quizId] || 'SAA-C03';

    // 1) Fetch con sobre-muestreo
    const raw = await fetchQuestionsFromApi({ exam, count: desiredCount, overfetch: 3, domainTags: tags });
    if (mySeq !== __START_SEQ) return;

    // 2) Normaliza y filtra
    let all = transformQuestions(raw);
    if (tags.length) all = filterBySelection(all, tags);

    // 3) Mezcla y recorta EXACTO
    shuffle(all);
    all = all.slice(0, desiredCount);

    // 4) Shuffle de opciones
    all = all.map(q=>{
      const opts = Array.isArray(q.options)? q.options.slice():[];
      const order = shuffle([...Array(opts.length).keys()]);
      const optionsShuffled = order.map(i=>opts[i]);
      const correctIndex = (typeof q.correctAnswer==='number' && q.correctAnswer>=0) ? order.indexOf(q.correctAnswer) : null;
      return { ...q, _optOrder: order, _options: optionsShuffled, _correct: correctIndex };
    });

    if (mySeq !== __START_SEQ) return;

    // 5) Estado y render
    STATE.qs = all;
    STATE.idx = 0;
    STATE.answers = {};
    STATE.marked = {};
    STATE.startedAt = Date.now();
    STATE.elapsedSec = 0;
    STATE.timeLimit = 0;

    applyTheme(quizId);
    renderQuiz();
    startTimer();

    toast(`Loaded ${STATE.qs.length}${tags.length?` • Domains: ${tags.join(', ')}`:''}`, 2000);
  }catch(err){
    console.error(err);
    showError(err.message||'Error loading questions');
  }finally{
    if (mySeq === __START_SEQ) STATE.loading=false;
  }
}

/* ========== Loading / Error ========== */
function showLoading(){ const root=document.getElementById('view'); if(!root) return; root.innerHTML=''; root.appendChild(h('div',{class:'loading',html:'Loading exam questions…'})); }
function showError(msg){ const root=document.getElementById('view'); if(!root) return; root.innerHTML=''; root.appendChild(h('div',{class:'loading',html:`<b>Error:</b> ${msg}`})); }

/* ========== Timer ========== */
function startTimer(){ stopTimer(); STATE.timerId=setInterval(()=>{ STATE.elapsedSec++; const t=document.querySelector('.timer'); if(t) t.textContent=fmtTime(STATE.elapsedSec); },1000); }
function stopTimer(){ if(STATE.timerId){ clearInterval(STATE.timerId); STATE.timerId=null; } }

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
  const progress=h('div',{class:'progress'}), pbar=h('div',{class:'pbar'}), fill=h('i'); pbar.appendChild(fill);
  const pcount=h('div',{class:'pcount',html:`${STATE.idx+1}/${STATE.qs.length}`});
  progress.appendChild(pbar); progress.appendChild(pcount);
  meta.appendChild(timer); meta.appendChild(progress);
  head.appendChild(meta); qCard.appendChild(head);

  const q=STATE.qs[STATE.idx];
  if(!q){ qCard.appendChild(h('div',{html:'No questions to display.'})) }
  else{
    const pct=Math.round((STATE.idx/Math.max(1,STATE.qs.length))*100); fill.style.width=`${pct}%`;
    const dom = q.domain ? ` (${q.domain})` : '';
    qCard.appendChild(h('div',{class:'domain',html:(q.category||'GENERAL').toUpperCase()+dom}));
    qCard.appendChild(h('h2',{class:'quiz-question',html:`<b>${STATE.idx+1}.</b> ${q.question}`}));

    (q._options||[]).forEach((txt,i)=>{
      const chosen=STATE.answers[STATE.idx], selected=chosen===i, isCorrect=q._correct===i;
      const cls=['option']; if(typeof chosen!=='undefined'&&selected) cls.push(isCorrect?'ok':'bad','selected');
      const line=h('div',{class:cls.join(' ')}); line.onclick=()=>onSelect(i);
      line.appendChild(h('span',{class:'lead',html:String.fromCharCode(65+i)+'.'}));
      line.appendChild(h('span',{html:txt}));
      qCard.appendChild(line);
    });

    const chosen=STATE.answers[STATE.idx];
    if(typeof chosen!=='undefined' && STATE.prefs.explanations==='after'){
      const box=h('div',{class:'expl'});
      const correctLetter=String.fromCharCode(65+(q._correct ?? 0));
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

  /* ===== Sidebar (BOTONES arriba, LISTA abajo) ===== */
  const side=h('div',{class:'side'});

  // 1) PANEL DE BOTONES (centrados y sin título) — AHORA ARRIBA
  const pBtns=h('div',{class:'panel'});
  const actions=h('div',{class:'controls centered'});
  const btnHome=h('button',{class:'btn',html:'🏠 Home'}); btnHome.onclick=()=>{ location.href='/'; };
  const btnStop=h('button',{class:'btn',html:'⏸️ Stop for later'}); btnStop.onclick=()=>{};
  actions.appendChild(btnHome); actions.appendChild(btnStop);
  pBtns.appendChild(actions);
  side.appendChild(pBtns);

  // 2) LIST OF QUESTIONS — AHORA DEBAJO
  const pList=h('div',{class:'panel'});
  pList.appendChild(h('h3',{html:'LIST OF QUESTIONS'}));
  const dots=h('div',{class:'list-dots',title:'Click to jump to any question'});
  STATE.qs.forEach((qq,i)=>{
    const d=h('div',{class:'dot',html:String(i+1)});
    if(i===STATE.idx)d.classList.add('current');
    const ans=STATE.answers[i];
    if(typeof ans!=='undefined'){ if(ans===qq._correct)d.classList.add('ok'); else d.classList.add('bad'); }
    if(STATE.marked[i]) d.classList.add('marked');
    d.onclick=()=>{STATE.idx=i;renderQuiz()};
    dots.appendChild(d);
  });
  pList.appendChild(dots);
  side.appendChild(pList);

  // Montaje
  shell.appendChild(qCard); shell.appendChild(side);
  wrap.appendChild(shell); root.appendChild(wrap);
  enableHotkeys();
  try{wrap.scrollIntoView({behavior:'smooth',block:'start'})}catch{}
}

function onSelect(i){ if(typeof STATE.answers[STATE.idx]!=='undefined')return; STATE.answers[STATE.idx]=i; renderQuiz(); }

/* ===== Resultados (modal aislado) ===== */
function renderResultModal(r){
  document.body.classList.add('qg-lock');
  const pass=r.pct>=70;
  const bd=h('div',{class:'qg-backdrop', role:'dialog', 'aria-modal':'true'});
  const m =h('div',{class:'qg-modal'});
  m.appendChild(h('h3',{html:'Exam results'}));
  m.appendChild(h('div',{class:pass?'qg-badge-pass':'qg-badge-fail',html:pass?'✅ PASS — ≥70%':'❌ FAIL — <70%'}));
  m.appendChild(h('div',{class:'qg-result-row',html:`<strong>Score</strong><span>${r.correct}/${r.total} (${r.pct}%)</span>`}));
  m.appendChild(h('div',{class:'qg-result-row',html:`<strong>Duration</strong><span>${Math.floor(r.durationSec/60)}m ${r.durationSec%60}s</span>`}));
  m.appendChild(h('div',{class:'qg-result-row',html:`<strong>Marked</strong><span>${r.markedCount||0}</span>`}));
  const actions=h('div',{class:'qg-actions'});
  const home=h('button',{class:'btn',html:'🏠 Home'});  home.onclick=()=>{closeModal(); location.href='/';};
  const review=h('button',{class:'btn primary',html:'🔁 Review'}); review.onclick=()=>{ closeModal(); };
  actions.appendChild(home); actions.appendChild(review);
  m.appendChild(actions);
  bd.appendChild(m);
  bd.addEventListener('click',(e)=>{ if(e.target===bd) closeModal(); });
  const onKey=(e)=>{ if(e.key==='Escape'){ e.preventDefault(); closeModal(); } };
  document.addEventListener('keydown', onKey);
  function closeModal(){
    try{ document.body.removeChild(bd); }catch{}
    document.body.classList.remove('qg-lock');
    document.removeEventListener('keydown', onKey);
  }
  document.body.appendChild(bd);
}

function genResultId(result){
  const base=[result.quizId||'quiz',result.mode||'exam',result.total||0,result.correct||0,result.durationSec||0].join('|');
  const t=Math.floor((new Date(result.ts||Date.now())).getTime()/10000);
  return `${base}|${t}`;
}
async function postForm(url,payload){
  const body=new URLSearchParams();Object.entries(payload).forEach(([k,v])=>body.append(k,String(v)));
  const resp=await fetch(url,{method:"POST",mode:"cors",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body});
  const text=await resp.text();let data=null;try{data=JSON.parse(text)}catch{data={raw:text}}
  if(!resp.ok) throw new Error(`HTTP ${resp.status} ${(data.error||data.message||text)}`); return data;
}
function getUserAny(){let u=null;try{u=JSON.parse(localStorage.getItem("currentUser")||"null")}catch{}if(!u){try{u=JSON.parse(localStorage.getItem("certify_user")||"null")}catch{}}return u}

async function saveResultRemoteOnce(result){
  if(STATE.saving) return null;
  STATE.saving=true;
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
  catch(e){ console.warn("Remote save failed:", e); return null; }
  finally { STATE.saving=false; }
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
  await saveResultRemoteOnce(result);
  renderResultModal(result);
}

/* ========== Hotkeys ========== */
let __hot=false;
function enableHotkeys(){
  if(__hot) return; __hot=true;
  window.addEventListener('keydown',(ev)=>{
    const tag=(ev.target.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea'||tag==='select'||ev.metaKey||ev.ctrlKey) return;
    if(ev.key==='n'||ev.key==='N'){ev.preventDefault(); if(STATE.idx===STATE.qs.length-1) finish(); else { STATE.idx++; renderQuiz(); }}
    if(ev.key==='b'||ev.key==='B'){ev.preventDefault(); if(STATE.idx>0){ STATE.idx--; renderQuiz(); }}
    if(ev.key==='m'||ev.key==='M'){ev.preventDefault(); STATE.marked[STATE.idx]=!STATE.marked[STATE.idx]; toast(STATE.marked[STATE.idx]?'Marked':'Unmarked'); renderQuiz(); }
    const num=parseInt(ev.key,10);
    if(Number.isInteger(num)&&num>=1&&num<=9){
      const q=STATE.qs[STATE.idx];
      if(q&&q._options&&q._options[num-1]!==undefined){ ev.preventDefault(); onSelect(num-1); }
    }
  });
}

/* ========== Wire mínimo ========== */
document.addEventListener('DOMContentLoaded', ()=>{ /* listeners externos ya en index */ });

/* ========== API pública ========== */
window.start = start;

} // end singleton

(function(){
  function start(quiz, opts){ /* ...engine... */ }
  window.start = start; // <- imprescindible en producción
})();