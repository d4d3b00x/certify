/* ===================== Google Analytics (opcional) ===================== */
(function () {
  try {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=G-DYZ3GCXHEK";
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", "G-DYZ3GCXHEK");
  } catch {}
})();

/* ====================================================================== */
/* =====================  Q GLOBAL (SIMULADOR)  ========================= */
/* ====================================================================== */

(() => {
/* ===================== CONFIG ===================== */
const API_URL       = "https://uougu1cm26.execute-api.eu-central-1.amazonaws.com";
const RESULTS_URL   = `${API_URL}/results`;
let   __PROGRESS_URL_CACHED = null;
const __CANDIDATE_STAGES = [""];

/* ===== Utils de red ===== */
function withTimeout(promise, ms, tag="op"){
  let t;
  const timeout = new Promise((_,rej)=> t=setTimeout(()=>rej(new Error(`[${tag}] timeout ${ms}ms`)), ms));
  return Promise.race([promise.finally(()=>clearTimeout(t)), timeout]);
}

/* ===== Descubrimiento /progress ===== */
async function discoverProgressUrl(samplePayload) {
  if (__PROGRESS_URL_CACHED) return __PROGRESS_URL_CACHED;
  for (const st of __CANDIDATE_STAGES) {
    const url = st ? `${API_URL}/${st}/progress` : `${API_URL}/progress`;
    try {
      const r = await withTimeout(fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify(samplePayload || {probe:true})
      }), 4500, "probe-progress");
      if (r.status === 200 || r.status === 201) {
        __PROGRESS_URL_CACHED = url;
        return url;
      }
    } catch {}
  }
  __PROGRESS_URL_CACHED = `${API_URL}/progress`;
  return __PROGRESS_URL_CACHED;
}

/* ===================== ESTADO ===================== */
const S = {
  quizId: "aws-saa-c03",
  track: "architect",
  mode: "exam",

  qs: [],
  idx: 0,
  answers: {},
  marked: {},
  markTimes: {},

  startedAt: null,
  elapsedSec: 0,
  timerId: null,
  timeLimit: 0,

  certi: "AWS Certified Solutions Architect — Associate (SAA-C03)",
  prefs: { count: 65, explanations: "after", tags: [] },

  sessionId: null,
  loading: false,
  finished: false,
  finishLocked: false,

  _afterRenderScroll: null,

  savingResult: false
};
let __SEQ = 0;

/* ===================== MAPAS ===================== */
const QUIZ_TO_EXAM = { "aws-saa-c03":"SAA-C03","az-104":"AZ-104","az-305":"AZ-305" };
const QUIZZES = {
  "aws-saa-c03": { track:"architect", certi:"AWS Certified Solutions Architect — Associate (SAA-C03)", domNames:{ D1:"Diseño seguro", D2:"Resiliencia", D3:"Alto rendimiento", D4:"Optimización de coste" } },
  "az-104":      { track:"az-104-architect", certi:"Microsoft Azure Administrator — Associate (AZ-104)", domNames:{ D1:"Identidades y gobierno", D2:"Almacenamiento", D3:"Cómputo", D4:"Redes", D5:"Monitorización" } },
  "az-305":      { track:"az-305-architect", certi:"Microsoft Azure Solutions Architect Expert (AZ-305)", domNames:{ D1:"Diseño de infraestructura", D2:"Datos/almacenamiento", D3:"Seguridad/identidad", D4:"BC/DR" } }
};

/* ===================== CSS (quiz) ===================== */
(function injectCSS(){
  const css = `
  :root{
    --bg:#0f1320; --surface:#161b2d; --surface2:#1b2140; --ink:#e8ecff; --muted:#9ca8d9; --stroke:#283056;
    --accent:#6c8bff; --accent-2:#3e64ff; --accent-ring:rgba(108,139,255,.28);
    --ok:#2bdc8c; --ok-bg:#0f2d1f; --ok-ink:#c9ffe6;
    --bad:#ff6b6b; --bad-bg:#3a1518; --bad-ink:#ffd4d4;
    --mark:#ffd24d; --mark-bg:#3a2e12; --mark-ring:rgba(255,210,77,.35);
  }
  #view{ margin-top:16px; }
  .quiz-wrap{ display:grid; grid-template-columns:2fr 1fr; gap:18px; }
  @media(max-width:900px){ .quiz-wrap{ grid-template-columns:1fr } }
  .card{ margin-top:8px; background:linear-gradient(180deg,#111937,#0f1633);
         border:1px solid var(--stroke); border-radius:16px; padding:18px; color:var(--ink) }
  .header-quiz{ display:flex; align-items:center; justify-content:space-between;
                border-bottom:1px solid var(--stroke); padding-bottom:10px; margin-bottom:10px; }
  .title{ font-weight:1000; font-size:1.18rem; letter-spacing:.3px; color:#f0f4ff; text-transform:uppercase; }
  .quiz-meta{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .timer{ font-variant-numeric:tabular-nums; background:var(--surface2); border:1px solid var(--stroke);
          border-radius:12px; padding:8px 12px; font-weight:900; }
  .progress{ display:flex; align-items:center; gap:10px; min-width:220px; }
  .pbar{ position:relative; height:8px; border-radius:999px; background:#0b1024; overflow:hidden; flex:1; }
  .pbar>i{ position:absolute; inset:0; width:0; background:linear-gradient(90deg,var(--accent),var(--accent-2)); }
  .pcount{ font-weight:900; color:#cbd6ff; min-width:70px; text-align:right; }
  .domain{ display:inline-flex; align-items:center; gap:8px; font-weight:800; font-size:.94rem; color:#cfd8ff;
           background:rgba(108,139,255,.06); border:1px solid rgba(108,139,255,.16);
           border-radius:12px; padding:8px 12px; margin:.55rem 0 .7rem; text-transform:lowercase; }
  .domain .dot{ width:10px; height:10px; border-radius:999px; background:var(--accent); opacity:.9; }
  .quiz-question{ margin:.2rem 0 .6rem; font-size:1.06rem; line-height:1.55; }
  .option{ display:flex; gap:12px; align-items:flex-start; border:1px solid var(--stroke); background:var(--surface2);
           border-radius:12px; padding:14px 16px; margin:10px 0; cursor:pointer;
           transition:transform .08s, box-shadow .08s, border-color .08s; }
  .option:hover{ transform:translateY(-1px); box-shadow:0 10px 24px rgba(0,0,0,.25); border-color:#34406f; }
  .option .lead{ min-width:24px; font-weight:900; color:var(--accent); }
  .option.selected.ok{ border-color:var(--ok); background:linear-gradient(0deg,var(--ok-bg),var(--surface2)); color:var(--ok-ink); }
  .option.selected.bad{ border-color:var(--bad); background:linear-gradient(0deg,var(--bad-bg),var(--surface2)); color:var(--bad-ink); }

  .expl{ border:1px dashed var(--stroke); border-radius:12px; padding:12px; margin-top:12px; background:var(--surface); }
  .expl .ttl{ font-weight:900; margin-bottom:8px; }
  .refs{ margin-top:10px; background:var(--surface2); border:1px solid var(--stroke);
         border-radius:12px; padding:12px; }
  .refs h4{ margin:0 0 8px; font-size:.96rem; color:#cbd6ff; font-weight:900; }
  .link-list{ list-style:none; padding:0; margin:0; display:grid; gap:8px; }
  .why-list{ margin:10px 0 0; padding-left:18px; }

  .controls{ display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; justify-content:flex-end; }
  .controls.centered{ justify-content:center; }
  .btn{ appearance:none; border:1px solid var(--stroke); border-radius:12px; padding:12px 16px; font-weight:900; cursor:pointer; background:transparent; color:var(--ink); }
  .btn.lg{ padding:14px 20px; font-size:1.02rem; }
  .btn.primary{ background:linear-gradient(180deg,var(--accent),var(--accent-2)); color:#fff; border-color:transparent; }
  .btn:disabled{ opacity:.6; filter:grayscale(.2); cursor:not-allowed; }

  .side .panel{ background:var(--surface); border:1px solid var(--stroke); border-radius:16px; padding:16px; margin-bottom:14px; }
  .side h3{ margin:.2rem 0 .6rem; }
  .list-dots{ display:grid; grid-template-columns:repeat(auto-fill,minmax(46px,1fr)); gap:10px; }
  .dot{ display:flex; align-items:center; justify-content:center; width:46px; height:46px; border-radius:999px;
        border:2px solid var(--stroke); background:var(--surface2); cursor:pointer; font-weight:900; color:#e8ecff; }
  .dot.current{ outline:3px solid var(--accent-ring); }
  .dot.ok{ background:var(--ok-bg); border-color:#2e7a5a; }
  .dot.bad{ background:#2a1216; border-color:#7a2e38; }
  .dot.marked{ background:var(--mark-bg)!important; border-color:#b49422!important; outline:3px solid var(--mark-ring); }

  .toast{ position:fixed; left:50%; bottom:18px; transform:translateX(-50%); background:#0e1530; color:#fff;
          padding:10px 14px; border-radius:10px; box-shadow:0 10px 24px rgba(0,0,0,.4); opacity:0; pointer-events:none; transition:opacity .2s; z-index:99999; }
  .toast.show{ opacity:1; }

  .kpis-under-quiz{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-top:16px; }
  @media (max-width:700px){ .kpis-under-quiz{ grid-template-columns:1fr; } }
  .kpi-card{ background:var(--surface); border:1px solid var(--stroke); border-radius:14px; padding:14px 16px; }
  .kpi-card h4{ margin:0 0 6px 0; font-size:.9rem; color:#9ca8d9; font-weight:900; text-transform:uppercase; letter-spacing:.4px; }
  .kpi-card .n{ font-size:1.6rem; line-height:1.2; font-weight:1000; color:#fff; }
  `;
  const st = document.createElement("style");
  st.innerHTML = css;
  document.head.appendChild(st);
})();

/* ===================== Utils ===================== */
const h = (t, a = {}, k = []) => { const el = document.createElement(t); for (const [key, v] of Object.entries(a)) { if (key === "class") el.className = v; else if (key === "html") el.innerHTML = v; else el.setAttribute(key, v); } k.forEach(n => n && el.appendChild(n)); return el; };
const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (s) => { s = Math.max(0, Number(s) || 0); const m = Math.floor(s / 60), x = s % 60; return `${pad(m)}:${pad(x)}`; };
function toast(msg, ms = 1600) { let t = document.querySelector(".toast"); if (!t) { t = h("div", { class: "toast" }); document.body.appendChild(t); } t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), ms); }
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;}
const uuid = () => "s-" + Math.random().toString(16).slice(2) + Date.now().toString(36);
function smartScrollTo(el, align='start'){ if(!el) return; const rect = el.getBoundingClientRect(); const header = document.querySelector('header'); const offset = (header ? header.offsetHeight : 0) + 10; const top = rect.top + window.scrollY - (align==='center' ? window.innerHeight/2 - rect.height/2 : offset); window.scrollTo({ top, behavior: 'smooth' }); }
function stripLetterPrefix(s){ return String(s||'').replace(/^\s*[A-Z]\.\s*/i,'').trim(); }

/* normaliza texto para firma */
function normTxt(s){
  return String(s||"")
    .toLowerCase()
    .replace(/\s+/g," ")
    .replace(/[‘’ʼ´`]/g,"'")
    .replace(/[“”]/g,'"')
    .trim();
}
/* firma por contenido: pregunta + opciones (sin letras A./B.) */
function qSignature(q){
  const qn = normTxt(q.question||"");
  const opts = Array.isArray(q.options)? q.options.map(stripLetterPrefix).map(normTxt).join(" | "):"";
  return `${qn} :: ${opts}`;
}

/* ===================== Tema ===================== */
function applyTheme(quizId){
  const r=document.documentElement;
  const isAWS = quizId === "aws-saa-c03";
  const t = isAWS
    ? {"--accent":"#ff9900","--accent-2":"#ffb84d","--accent-ring":"rgba(255,153,0,.28)"}
    : {"--accent":"#0078d4","--accent-2":"#5fb3ff","--accent-ring":"rgba(0,120,212,.28)"};
  Object.entries(t).forEach(([k,v])=>r.style.setProperty(k,v));
}

/* ===================== Questions ===================== */
function normalizeDomainTag(tag){
  if(!tag) return null;
  const s=String(tag).trim();
  const m = s.match(/^(?:d(?:omain|dominio)?)\s*:?\s*(\d+)$/i);
  if(m) return `D${m[1]}`;
  const m2 = s.match(/\bD(\d+)\b/i);
  return m2 ? `D${m2[1]}` : null;
}
function extractDomainFromRecord(it){
  if (it.domain && normalizeDomainTag(it.domain)) return normalizeDomainTag(it.domain);
  if (it.category){ const m = String(it.category).match(/(?:^|\s)(?:domain|dominio)\s*:?\s*(\d+)/i); if (m) return `D${m[1]}`; }
  return null;
}
async function fetchQuestionsFromApi({exam,count,overfetch=3,domainTags=[],searchQ=""}){
  const target=Math.max(count*overfetch, count);
  const all=[]; let lastKey=null; const seen=new Set(); const pageLimit=200;
  const onlyDn=(domainTags||[]).map(normalizeDomainTag).filter(Boolean).join(',');
  for(let guard=0; guard<25 && all.length<target; guard++){
    const params=new URLSearchParams({exam:String(exam),limit:String(pageLimit)});
    if(searchQ) params.set('q',searchQ);
    if(onlyDn){ params.set('domains',onlyDn); params.set('domain',onlyDn); }
    params.set('count',String(count));
    if(lastKey) params.set('lastKey', JSON.stringify(lastKey));
    const res=await fetch(`${API_URL}/questions?${params.toString()}`,{headers:{Accept:'application/json'}});
    const txt=await res.text();
    if(!res.ok) throw new Error(`GET /questions ${res.status}: ${txt}`);
    let data; try{data=JSON.parse(txt);}catch{ throw new Error('Respuesta no JSON'); }
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

/* ===================== Transform + Dedupe ===================== */
function transformQuestions(items){
  return (Array.isArray(items)?items:[]).map(it=>{
    const domain=extractDomainFromRecord(it);
    const perOpt =
      (Array.isArray(it.explanationsByOption) && it.explanationsByOption) ||
      (Array.isArray(it.reasonsByOption) && it.reasonsByOption) ||
      (Array.isArray(it.optionExplanations) && it.optionExplanations) ||
      null;

    return {
      questionId: it.questionId || `${it.exam||''}:${it.question||''}`,
      question: it.question || '',
      options: Array.isArray(it.options) ? it.options.slice() : [],
      correctAnswer: (typeof it.answerIndex==='number'?it.answerIndex:null),
      explanation: it.explanation || '',
      explanationRich: it.explanationRich || '',
      links: Array.isArray(it.links) ? it.links.slice() : [],
      category: it.category || 'General',
      domain,
      perOption: perOpt ? perOpt.map(stripLetterPrefix) : null
    };
  });
}

/* elimina duplicados por id y por firma de contenido */
function uniqQuestions(arr){
  const byId = new Set();
  const bySig = new Set();
  const out = [];
  for(const q of arr){
    if(!q) continue;
    const id = q.questionId || "";
    const sig = qSignature(q);
    if((id && byId.has(id)) || bySig.has(sig)) continue;
    if(id) byId.add(id);
    bySig.add(sig);
    out.push(q);
  }
  return out;
}

function filterByDomains(all, tags){
  const want = (tags||[]).map(normalizeDomainTag).filter(Boolean);
  if(want.length===0) return all;
  return all.filter(q=>{
    const d = (q.domain||'').toUpperCase();
    if(d && want.includes(d)) return true;
    const cat=(q.category||'').toUpperCase();
    const m=cat.match(/DOMAIN\s*:?\s*(\d+)/i);
    return !!(m && want.includes('D'+m[1]));
  });
}

/* ===================== Usuario ===================== */
function getUserAny(){ try{ return JSON.parse(localStorage.getItem("currentUser")||"null"); }catch{ return null; } }

/* ===================== RESULTADOS ===================== */
function genResultId(r){
  const base=[r.quizId||'quiz', r.mode||'exam', r.total||0, r.correct||0, r.durationSec||0].join('|');
  const t=Math.floor(Date.now()/10000);
  return `${base}|${t}`;
}
async function saveResultRemoteOnce(result){
  if (S.savingResult) return { ok:false, skipped:true };
  S.savingResult = true;

  const u=getUserAny()||{};
  const payload={
    resultId: genResultId(result),
    userId: u.userId||u.id||"anon",
    userName: u.name||u.displayName||"anonymous",
    email: u.email||"",
    quizId: result.quizId,
    track: result.track||"architect",
    mode: result.mode||"exam",
    total: Number(result.total||0),
    correct: Number(result.correct||0),
    pct: Number(result.pct||(result.total?Math.round((result.correct/result.total)*100):0)),
    durationSec: Number(result.durationSec||0),
    ts: result.ts || new Date().toISOString(),
    sessionId: S.sessionId || ""
  };

  try {
    const body = new URLSearchParams();
    Object.entries(payload).forEach(([k,v])=>body.append(k,String(v)));
    let r = await withTimeout(fetch(RESULTS_URL, {
      method:"POST", mode:"cors", keepalive:true,
      headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","Accept":"application/json"},
      body
    }), 7000, "results-form");
    if (r.ok) return { ok:true, via:"form" };

    r = await withTimeout(fetch(RESULTS_URL, {
      method:"POST", mode:"cors", keepalive:true,
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body: JSON.stringify(payload)
    }), 7000, "results-json");
    if (r.ok) return { ok:true, via:"json" };

    return { ok:false };
  } catch(e){
    return { ok:false, error:String(e?.message||e) };
  } finally { S.savingResult=false; }
}

/* ===================== Timer ===================== */
function startTimer(){
  stopTimer();
  S.timerId=setInterval(()=> {
    S.elapsedSec++;
    const t=document.querySelector('.timer'); if(t) t.textContent=fmtTime(S.elapsedSec);
  }, 1000);
}
function stopTimer(){ if(S.timerId){ clearInterval(S.timerId); S.timerId=null; } }

/* ===================== Fallback local AZ-305 ===================== */
function localAz305Fallback(){
  return [
    { question:"¿Cuál es el servicio de Azure más adecuado para ejecutar contenedores sin administrar infraestructura?", options:["AKS","Azure Container Instances","App Service","Service Fabric"], correctAnswer:1, explanation:"ACI ejecuta contenedores sin orquestación ni VMs." },
    { question:"¿Qué usarías para IaC nativo en Azure?", options:["ARM Templates","Terraform","Bicep","Todas las anteriores"], correctAnswer:3, explanation:"ARM, Bicep y Terraform son válidos." },
    { question:"¿Qué componente permite acceso condicional basado en riesgo?", options:["PIM","Conditional Access","Azure Policy","Defender"], correctAnswer:1, explanation:"Se gestiona con políticas de Conditional Access." },
    { question:"¿Dónde almacenar secretos de forma segura?", options:["Storage","Key Vault","ConfigMap","App Settings"], correctAnswer:1, explanation:"Key Vault." },
    { question:"¿Qué solución monitoriza rendimiento de apps?", options:["Application Insights","Azure Monitor","Log Analytics","Todas"], correctAnswer:3, explanation:"AI y LA dentro del marco de Azure Monitor." },
  ];
}

/* ===================== START ===================== */
async function start(quizId="aws-saa-c03", overrides={}){
  const seq=++__SEQ; stopTimer(); S.finished=false; S.finishLocked=false;

  const cfg = QUIZZES[quizId] || QUIZZES["aws-saa-c03"];
  S.quizId=quizId; S.track=cfg.track; S.certi=cfg.certi; S.mode="exam";

  const desiredCount = Number(overrides.count ?? S.prefs.count ?? 65);
  const tags = Array.isArray(overrides.tags) ? overrides.tags.map(normalizeDomainTag).filter(Boolean) : [];
  S.prefs = { ...S.prefs, count: desiredCount, tags };

  S.loading=true; showLoading();

  try{
    const exam=QUIZ_TO_EXAM[quizId] || "SAA-C03";

    let raw = await fetchQuestionsFromApi({ exam, count: desiredCount, overfetch: 4, domainTags: tags });
    if ((!raw || raw.length === 0) && quizId === "az-305") {
      raw = localAz305Fallback().map((q,i)=>({
        exam:"AZ-305", questionId:`AZ-305-local-${i}`, question:q.question, options:q.options,
        answerIndex:q.correctAnswer, explanation:q.explanation, category:"General"
      }));
    }
    if(__SEQ!==seq) return;

    let all = transformQuestions(raw);
    all = uniqQuestions(all);                       // <-- dedupe fuerte
    let filtered = filterByDomains(all, tags);
    if (tags.length && filtered.length===0){
      filtered = all;
      toast("No hay preguntas para esos dominios. Mostrando todas.", 2300);
    }
    if (filtered.length===0) throw new Error("No se encontraron preguntas para este quiz.");

    filtered = uniqQuestions(filtered);             // <-- por si tras filtrar reaparece algún igual
    filtered = shuffle(filtered).slice(0, Math.min(desiredCount, filtered.length)).map(q=>{
      const opts = Array.isArray(q.options)? q.options.slice(): [];
      const order = [...Array(opts.length).keys()];
      const correctIndex = (typeof q.correctAnswer==='number' && q.correctAnswer>=0) ? q.correctAnswer : null;
      const perOptionSameOrder = Array.isArray(q.perOption) ? q.perOption.map(stripLetterPrefix) : null;

      return { ...q, _optOrder: order, _options: opts, _correct: correctIndex, _perOption: perOptionSameOrder };
    });

    if(__SEQ!==seq) return;

    S.qs = filtered; S.idx=0; S.answers={}; S.marked={}; S.markTimes={};
    S.startedAt = Date.now(); S.elapsedSec=0; S.timeLimit=0;
    S.sessionId = uuid();

    applyTheme(quizId);
    S._afterRenderScroll = 'question';
    renderQuiz();
    startTimer();

    // Warmup descubrimiento /progress (no bloquea)
    discoverProgressUrl({sessionId:S.sessionId, quizId:S.quizId, probe:true}).catch(()=>{});

    const qCard = document.querySelector('#view .question-card') || document.getElementById('view');
    smartScrollTo(qCard,'start');

    toast(`Cargadas ${S.qs.length}${tags.length?` • Dominios: ${tags.join(', ')}`:''}`, 1800);
  }catch(e){
    console.error(e);
    showError(e.message||"Error cargando preguntas");
  }finally{
    if(__SEQ===seq) S.loading=false;
  }
}

/* ===================== Loading / Error ===================== */
function showLoading(){ const root=document.getElementById('view'); if(!root) return; root.innerHTML=''; root.appendChild(h('div',{class:'loading',html:'Cargando preguntas…'})); }
function showError(msg){ const root=document.getElementById('view'); if(!root) return; root.innerHTML=''; root.appendChild(h('div',{class:'loading',html:`<b>Error:</b> ${msg}`})); }

/* ===================== KPIs ===================== */
function renderKpisBelow(container){
  if(!container || !container.parentNode) return;
  const answered = Object.keys(S.answers).length;
  let correct = 0; for(const [i,v] of Object.entries(S.answers)){ const idx = +i; if(S.qs[idx] && S.qs[idx]._correct === v) correct++; }
  const marked = Object.values(S.marked||{}).filter(Boolean).length;
  const pct = answered ? Math.round((correct/answered)*100) : 0;

  const old = document.getElementById('kpis-under-quiz'); if(old && old.parentNode) old.parentNode.removeChild(old);
  const host = h('section',{id:'kpis-under-quiz',class:'kpis-under-quiz'});
  host.appendChild(h('div',{class:'kpi-card',html:`<h4>Respondidas</h4><div class="n" id="kA">${answered}</div>`}));
  host.appendChild(h('div',{class:'kpi-card',html:`<h4>Aciertos %</h4><div class="n" id="kP">${pct}%</div>`}));
  host.appendChild(h('div',{class:'kpi-card',html:`<h4>Marcadas</h4><div class="n" id="kM">${marked}</div>`}));
  container.insertAdjacentElement('afterend', host);
}

/* ===================== Render principal ===================== */
function renderLinksBox(links){
  const list = Array.isArray(links) ? links.filter(Boolean) : [];
  if(!list.length) return null;
  const ul = h('ul', { class: 'link-list' });
  for(const it of list){
    let url='', label='';
    if(typeof it === 'string'){ url = it; }
    else if (it && typeof it === 'object'){ url = it.url || it.href || ''; label = it.title || it.text || ''; }
    if(!url) continue;
    try{
      const u = new URL(url, location.origin);
      const host = u.hostname.replace(/^www\./,''); if(!label) label = host;
      const li = h('li', { class: 'link-item' });
      const titleEl = document.createElement('div'); titleEl.className = 'link-title'; titleEl.textContent = `🔗 ${label}`;
      const small = document.createElement('small'); const a = document.createElement('a');
      a.href = u.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = u.href;
      small.appendChild(a); li.appendChild(titleEl); li.appendChild(small); ul.appendChild(li);
    }catch{}
  }
  if(!ul.children.length) return null;
  const box = h('div', { class: 'refs' }); box.appendChild(h('h4', { html: 'Recursos y enlaces' })); box.appendChild(ul);
  return box;
}

function renderQuiz(){
  const root=document.getElementById('view'); if(!root) return;
  root.innerHTML='';
  const wrap=h('section',{class:'card'}), shell=h('div',{class:'quiz-wrap'});
  const qCard=h('div',{class:'question-card'});

  // Cabecera
  const head=h('div',{class:'header-quiz'});
  head.appendChild(h('div',{class:'title',html:S.certi.toUpperCase()}));
  const meta=h('div',{class:'quiz-meta'});
  const timer=h('div',{class:'timer',html:fmtTime(S.elapsedSec)});
  const progress=h('div',{class:'progress'}), pbar=h('div',{class:'pbar'}), fill=h('i'); pbar.appendChild(fill);
  const pcount=h('div',{class:'pcount',html:`${S.idx+1}/${S.qs.length}`});
  progress.appendChild(pbar); progress.appendChild(pcount);
  meta.appendChild(timer); meta.appendChild(progress);
  head.appendChild(meta); qCard.appendChild(head);

  const q=S.qs[S.idx];
  let expBox = null;
  if(!q){
    qCard.appendChild(h('div',{html:'No hay preguntas que mostrar.'}));
  }else{
    const pct=Math.round((S.idx/Math.max(1,S.qs.length))*100); fill.style.width=`${pct}%`;
    const domLabel = (q.category||'general') + (q.domain?` (${String(q.domain).toLowerCase()})`:``);
    qCard.appendChild(h('div',{class:'domain',html:`<i class="dot"></i><span>${domLabel}</span>`}));
    qCard.appendChild(h('h2',{class:'quiz-question',html:`<b>${S.idx+1}.</b> ${q.question}`}));

    (q._options||[]).forEach((txt,i)=>{
      const chosen=S.answers[S.idx], selected=chosen===i, isCorrect=q._correct===i;
      const cls=['option']; if(typeof chosen!=='undefined' && selected) cls.push(isCorrect?'ok':'bad','selected');
      const line=h('div',{class:cls.join(' ')}); line.onclick=()=>onSelect(i);
      line.appendChild(h('span',{class:'lead',html:String.fromCharCode(65+i)+'.'}));
      line.appendChild(h('span',{html:txt}));
      qCard.appendChild(line);
    });

    const chosen=S.answers[S.idx];
    if(typeof chosen!=='undefined' && S.prefs.explanations==='after'){
      expBox=h('div',{class:'expl'});
      const correctLetter=String.fromCharCode(65+(q._correct ?? 0));
      expBox.innerHTML=`<div class="ttl">Respuesta correcta: <b>${correctLetter}</b></div><div>${q.explanationRich||q.explanation||''}</div>`;

      if (Array.isArray(q._perOption) && q._perOption.length === (q._options||[]).length) {
        const others = q._perOption.map((txt,i)=>({i,txt:stripLetterPrefix(txt)})).filter(x=>x.i!==q._correct);
        if (others.length){
          const ul = h('ul',{class:'why-list'});
          expBox.appendChild(h('div',{class:'ttl',html:'Por qué las otras son incorrectas:'}));
          others.forEach(({i,txt})=>{
            const li = document.createElement('li');
            const letter = String.fromCharCode(65+i);
            li.innerHTML = `<b>${letter}.</b> ${txt}`;
            ul.appendChild(li);
          });
          expBox.appendChild(ul);
        }
      }

      const linksBox = renderLinksBox(q.links); if(linksBox) expBox.appendChild(linksBox);
      qCard.appendChild(expBox);
    }
  }

  // Controles
  const ctr=h('div',{class:'controls'});
  const back=h('button',{class:'btn',html:`← Atrás <span class="keycap">B</span>`}); back.disabled=S.idx===0;
  back.onclick=()=>{ S.idx=Math.max(0,S.idx-1); S._afterRenderScroll='question'; renderQuiz(); };

  const mark=h('button',{class:'btn',html:`${S.marked[S.idx]?'Quitar marca':'Marcar'} <span class="keycap">M</span>`});
  mark.onclick=()=>{ S.marked[S.idx]=!S.marked[S.idx]; if(S.marked[S.idx]) S.markTimes[S.idx]=new Date().toISOString(); else delete S.markTimes[S.idx]; renderQuiz(); };

  const isLast = S.idx===S.qs.length-1;
  const nextLabel = isLast ? `Finalizar <span class="keycap">N</span>` : `Siguiente <span class="keycap">N</span>`;
  const next=h('button',{class:'btn primary',html:nextLabel});

  if(isLast && (hasPendingMarked() || S.finishLocked)) next.disabled = true;

  next.onclick=()=>{
    if(!isLast){
      S.idx++; S._afterRenderScroll='question'; renderQuiz(); return;
    }
    if(hasPendingMarked()){ toast('No puedes finalizar: hay preguntas marcadas sin responder.'); return; }
    if(S.finishLocked) return;
    S.finishLocked = true; next.disabled = true; try { next.innerHTML = 'Finalizando…'; } catch {}
    finish();
  };

  ctr.appendChild(back); ctr.appendChild(mark); ctr.appendChild(next);
  qCard.appendChild(ctr);

  // Sidebar
  const side=h('div',{class:'side'});
  const pBtns=h('div',{class:'panel'});
  const actions=h('div',{class:'controls centered'});
  const btnQuit=h('button',{class:'btn lg',html:'🏠 Salir'}); btnQuit.onclick=()=>{ location.href='/user/profile.html'; };
  const btnPause=h('button',{class:'btn lg',html:`⏸️ Pausar/Reanudar <span class="keycap">P</span>`}); btnPause.onclick=()=>{ doPause(); };
  actions.appendChild(btnQuit); actions.appendChild(btnPause); pBtns.appendChild(actions); side.appendChild(pBtns);

  const pList=h('div',{class:'panel'});
  pList.appendChild(h('h3',{html:'LISTA DE PREGUNTAS'}));
  const dots=h('div',{class:'list-dots',title:'Haz clic para saltar'});
  S.qs.forEach((qq,i)=>{
    const d=h('div',{class:'dot',html:String(i+1)});
    if(i===S.idx) d.classList.add('current');
    const ans=S.answers[i];
    if(typeof ans!=='undefined'){ if(ans===qq._correct) d.classList.add('ok'); else d.classList.add('bad'); }
    if(S.marked[i]){ d.classList.add('marked'); if(typeof ans==='undefined') d.classList.add('unanswered'); }
    d.onclick=()=>{ S.idx=i; S._afterRenderScroll='question'; renderQuiz(); };
    dots.appendChild(d);
  });
  pList.appendChild(dots); side.appendChild(pList);

  shell.appendChild(qCard); shell.appendChild(side);
  wrap.appendChild(shell); root.appendChild(wrap);

  renderKpisBelow(wrap);
  enableHotkeys();

  if (S._afterRenderScroll === 'explanation') smartScrollTo(expBox || ctr, 'start');
  else if (S._afterRenderScroll === 'question') smartScrollTo(qCard, 'start');
  S._afterRenderScroll = null;

  window.dispatchEvent(new CustomEvent('quiz:render', { detail: { idx:S.idx }}));
}

/* ===================== Helpers ===================== */
function hasPendingMarked(){
  for(const [idx,flag] of Object.entries(S.marked||{})){
    if(!flag) continue;
    if(typeof S.answers[Number(idx)]==='undefined') return true;
  }
  return false;
}
function onSelect(i){
  if(typeof S.answers[S.idx]!=='undefined') return;
  S.answers[S.idx]=i;
  S._afterRenderScroll='question';
  renderQuiz();
}
function doPause(){
  if (S.timerId) { stopTimer(); toast('⏸️ Pausado', 1200); }
  else { startTimer(); toast('▶️ Reanudado', 1200); }
}

/* ===================== Sesión completa → /progress ===================== */
function buildFullSessionPayload({finished=false} = {}){
  const u=getUserAny()||{};
  const nowIso = new Date().toISOString();
  const startedIso = S.startedAt ? new Date(S.startedAt).toISOString() : nowIso;

  const questions = S.qs.map((q, index) => {
    const chosenIndex = typeof S.answers[index] !== 'undefined' ? S.answers[index] : null;
    const isCorrect   = (typeof q._correct==='number' && chosenIndex!==null) ? (chosenIndex === q._correct) : null;
    return {
      index,
      questionId: q.questionId,
      questionText: q.question,
      domain: q.domain || null,
      category: q.category || 'General',
      optionsShown: (q._options||[]).slice(),
      correctShownIndex: (typeof q._correct==='number'? q._correct : null),
      chosenIndex,
      isCorrect,
      perOption: Array.isArray(q._perOption) ? q._perOption.slice() : null,
      links: Array.isArray(q.links) ? q.links.slice() : [],
      optOrder: Array.isArray(q._optOrder) ? q._optOrder.slice() : null
    };
  });

  const total = S.qs.length;
  const correct = questions.reduce((a, it)=> a + (it.isCorrect?1:0), 0);
  const pct = total ? Math.round((correct/total)*100) : 0;

  return {
    sessionId: S.sessionId,
    quizId: S.quizId,
    mode: S.mode,
    track: S.track,

    userId: u?.userId || u?.id || "anon",
    userName: u?.name || "anonymous",
    email: u?.email || "",

    startedAt: startedIso,
    finishedAt: finished ? nowIso : null,
    elapsedSec: S.elapsedSec,
    timeLimit: S.timeLimit,

    idx: S.idx,
    total,
    pct,
    finished: Boolean(finished),
    status: finished ? "finished" : "in_progress",

    questions,
    marked: S.marked,
    markedItems: Object.entries(S.marked||{}).filter(([,v])=>v).map(([i])=>({index:+i,questionId:S.qs[+i]?.questionId||null,markedAt:S.markTimes[+i]||null}))
  };
}

/* ----- Guardar /progress con beacon → form → json ----- */
async function postSessionToProgress(payload){
  const PROGRESS_URL = await discoverProgressUrl(payload);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "text/plain;charset=UTF-8" });
      const ok = navigator.sendBeacon(PROGRESS_URL, blob);
      if (ok) return { ok:true, via:"beacon" };
    }
  } catch {}

  try {
    const form = new URLSearchParams();
    Object.entries(payload).forEach(([k,v]) => {
      form.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    });
    await fetch(PROGRESS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: form.toString(),
      keepalive: true
    });
    return { ok:true, via:"no-cors-form" };
  } catch {}

  try {
    const r = await fetch(PROGRESS_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    });
    if (r.ok) return { ok:true, via:"json" };
  } catch {}

  return { ok:false, error:"All progress send modes failed" };
}

/* ===================== Finalizar ===================== */
async function finish(){
  if(hasPendingMarked()){ toast('No puedes finalizar: hay marcadas sin responder.'); return; }
  if (S.finished) return;
  S.finished=true; stopTimer();

  const total=S.qs.length;
  let correct=0; for(let i=0;i<total;i++){ if(S.answers[i]===S.qs[i]._correct) correct++; }
  const pct = total? Math.round((correct/total)*100) : 0;

  const sessionPayload = buildFullSessionPayload({ finished:true });
  const resultPayload = {
    ts:new Date().toISOString(),
    quizId:S.quizId, track:S.track||'architect', mode:S.mode||'exam',
    total, correct, pct,
    durationSec: S.startedAt ? Math.round((Date.now()-S.startedAt)/1000) : S.elapsedSec||0
  };

  // Guardar (esperamos un corto máximo y luego redirigimos sí o sí)
  await Promise.race([
    (async()=>{
      await postSessionToProgress(sessionPayload);
      await saveResultRemoteOnce(resultPayload);
    })(),
    new Promise(res=>setTimeout(res, 1500))
  ]);

  // Redirección inmediata tras intentar guardar
  location.href = '/user/profile.html';
}

/* ===================== Hotkeys ===================== */
let HOT=false;
function enableHotkeys(){
  if(HOT) return; HOT=true;
  window.addEventListener('keydown', ev=>{
    const tag=(ev.target.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea'||tag==='select'||ev.metaKey||ev.ctrlKey) return;

    if(ev.key==='p'||ev.key==='P'){ ev.preventDefault(); doPause(); }

    if(ev.key==='n'||ev.key==='N'){
      ev.preventDefault();
      if(S.idx===S.qs.length-1){
        if(S.finishLocked) return;
        if(hasPendingMarked()) { toast('No puedes finalizar: marcadas sin responder.'); return; }
        S.finishLocked = true;
        const btn = document.querySelector('.controls .btn.primary');
        if(btn) btn.disabled = true;
        finish();
      } else {
        S.idx++; S._afterRenderScroll='question'; renderQuiz();
      }
    }
    if(ev.key==='b'||ev.key==='B'){ ev.preventDefault(); if(S.idx>0){ S.idx--; S._afterRenderScroll='question'; renderQuiz(); } }
    if(ev.key==='m'||ev.key==='M'){ ev.preventDefault(); S.marked[S.idx]=!S.marked[S.idx]; if(S.marked[S.idx]) S.markTimes[S.idx]=new Date().toISOString(); else delete S.markTimes[S.idx]; renderQuiz(); }
    const n=parseInt(ev.key,10);
    if(Number.isInteger(n)&&n>=1&&n<=9){ const q=S.qs[S.idx]; if(q&&q._options&&q._options[n-1]!==undefined){ ev.preventDefault(); onSelect(n-1); } }
  });
}

/* ===================== API PÚBLICA ===================== */
window.start = start;
})();
