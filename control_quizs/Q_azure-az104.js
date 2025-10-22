

/* telemetry helper */
const TELEM = (n,p)=>{ try{ window.__telem && window.__telem.on(n,p); }catch(e){} };

const STATE = {
  mode: 'exam',          // exam only
  qs: [],
  idx: 0,
  answers: {},
  startedAt: null,
  certi: 'Microsoft Azure Administrator - Associate (AZ-104)'
};

function start(){
  STATE.track = 'az-104-architect';
  TELEM('quiz_start');
  STATE.mode = 'exam';
  STATE.qs = flattenQuestions(window.questions);
  // pick first 10 deterministically to keep URLs stable when you build
  // determine number of questions from dropdown if present
  let n = 65;
  try{
    const el = document.getElementById('studyCount');
    if (el && el.value) n = parseInt(el.value, 65);
    if (![5,10,15,30].includes(n)) n = el.value;
  }catch(e){ n = 65; }
  
STATE.qs = flattenQuestions(window.questions);
STATE.qs = shuffle(STATE.qs);   // mezcla todo
STATE.qs = STATE.qs.slice(0, n); // toma las primeras n (ya aleatorias)

  STATE.idx = 0;
  STATE.answers = {};
  STATE.startedAt = Date.now();
  location.hash = '#/quiz';
  renderQuiz();
}

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function flattenQuestions(data){
  const arr = [];
  data.forEach(cat => cat.questions.forEach(q => arr.push({...q, category: cat.category})));
  return arr;
}


// === Exam Overview helper (dynamic per course) ===
function __getTrack(){
  try{
    if (typeof STATE!=='undefined' && STATE.track) return STATE.track;
    if (location.hash.includes('track=')) {
      const q = (location.hash.split('?')[1]||'').split('&').reduce((a,s)=>{const [k,v]=s.split('=');if(k)a[k]=v;return a;},{});
      return q.track || 'az-104-architect';
    }
  }catch(e){}
  return 'az-104-architect';
}
const __EXAM_OVERVIEW = {
  architect: {
    category: "Associate",
    duration: "130 minutes",
    format: "65 questions; multiple choice or multiple response",
    cost: "150 USD (+ taxes/fees)",
    testing: "Pearson VUE testing center or online proctored exam",
    languages: "EN, FR (France), IT, JA, KO, PT-BR, ES-LATAM, ES-Spain, ZH-CN, ZH-TW",
    guideUrl: "https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/pdfs/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf"
  },
  practitioner: {
    category: "Foundational",
    duration: "90 minutes",
    format: "65 questions; multiple choice or multiple response",
    cost: "100 USD (+ taxes/fees)",
    testing: "Pearson VUE testing center or online proctored exam",
    languages: "EN, FR (France), IT, JA, KO, PT-BR, ES-LATAM, ES-Spain, ZH-CN, ZH-TW",
    guideUrl: "https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/certification/approved/pdfs/docs-clf/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf"
  }
};
function renderExamOverviewTo(sideEl){
  const d = __EXAM_OVERVIEW[__getTrack()] || __EXAM_OVERVIEW.architect;
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
    <a class="ov-link" target="_blank" href="https://cp.certmetrics.com/amazon">
      <svg class="ov-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V7l-6-4z"></path></svg>
      Schedule an Exam (URL)
    </a>
  `;
card.appendChild(body);
sideEl.appendChild(card);
}
// === /Exam Overview helper ===


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
      line.innerHTML = `${r.correct}/${r.total} &nbsp; <b style="color:${ok?'#1a7f37':'#c62828'}">${ok?'PASS':'FAIL'} ${r.pct}%</b> &nbsp; ${dt.toLocaleString()}`;
      box.appendChild(line);
    });
  }
  panel.appendChild(box);
  side.appendChild(panel);
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

function renderQuiz(){
  const root = document.getElementById('view');
  root.innerHTML = '';

  const wrap = h('section', {class:'card'});
  const shell = h('div', {class:'quiz-wrap'});

  // Left: question
  const qCard = h('div', {class:'question-card'});
  const head = h('div', {class:'header-quiz'});
  head.appendChild(h('div', {class:'title', html:STATE.certi}));

qCard.appendChild(head);

  const q = STATE.qs[STATE.idx];
  const dom = h('div', {class:'domain', html: (q.category||'').toUpperCase()});
  qCard.appendChild(dom);
  const title = h('h2', {class:'quiz-question', html: `<b>${STATE.idx+1}.</b> ${q.question}`});
  qCard.appendChild(title);

  q.options.forEach((txt, i) => {
    const chosen = STATE.answers[STATE.idx];
    const selected = chosen === i;
    const isCorrect = q.correctAnswer === i;
    const classes = ['option'];
    if (selected){
      classes.push('selected');
      classes.push(isCorrect ? 'ok':'bad');
    }
    const line = h('div', {class: classes.join(' ')});
    line.onclick = () => onSelect(i);
    line.appendChild(h('span', {class:'lead', html: String.fromCharCode(65+i)+'.'}));
    line.appendChild(h('span', {html: txt}));
    qCard.appendChild(line);
  });

  // Explanation (only after answer)
  const chosen = STATE.answers[STATE.idx];
  if (typeof chosen !== 'undefined'){
    const box = h('div', {class:'expl'});
    const correctLetter = String.fromCharCode(65 + q.correctAnswer);
    box.appendChild(h('div', {class:'ttl', html:`Correct answer: <strong>${correctLetter}</strong></br>`}));
    box.appendChild(h('div', {class:'explain', html: q.explanationRich || q.explanation}));
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

  // Controls
  const ctr = h('div', {class:'controls'});
  const back = h('button', {class:'btn secondary', html:'Back'});
  if (STATE.idx===0){ back.disabled = true; back.classList.add('disabled'); }
  back.onclick = () => { STATE.idx=Math.max(0,STATE.idx-1); renderQuiz(); }
  const next = h('button', {class:'btn', html: STATE.idx===STATE.qs.length-1 ? 'Finish' : 'Next'});
  next.onclick = () => {
    if (STATE.idx===STATE.qs.length-1) return finish();
    STATE.idx++; renderQuiz();
  };
  ctr.appendChild(back); ctr.appendChild(next);
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

function onSelect(idx){
  STATE.answers[STATE.idx] = idx;
  renderQuiz();
}

function finish(){
  const total = STATE.qs.length;
  let score = 0;
  for (let i=0;i<total;i++){
    if (STATE.answers[i]===STATE.qs[i].correctAnswer) score++;
  }
  const percent = Math.round((score/total)*100);
  saveHistory({ ts:new Date().toISOString(), track: STATE.track || 'az-104-architect', total, correct: score, pct: percent });
  // back to landing
  location.hash = '';
  // minimal toast
  alert(`Quiz finished! ${score}/${total} (${percent}%)`);
  window.location.href = "/history.html"; // redirige al raíz
}

/* History using localStorage */
const LS_KEY = 'certify_history';
function getHistory(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch(e){ return []; } }
function saveHistory(item){ const arr = getHistory(); arr.unshift(item); while(arr.length>50) arr.pop(); localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
function computeStats(){
  const arr = getHistory();
  if (arr.length===0) return {totalAttempts:0, overall:0};
  const overall = Math.round(arr.reduce((s,r)=>s + (typeof r.pct==='number'? r.pct : (r.percent||0)),0)/arr.length);
  return {totalAttempts:arr.length, overall};
}

function __getHistory(){ try { return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); } catch(e){ return []; } }
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
  const rec = { ts:new Date().toISOString(), track: STATE.track || 'architect', total, correct, pct };
  const hist = __getHistory(); hist.unshift(rec); while (hist.length>50) hist.pop(); __setHistory(hist);
}

function refreshLastResultsDOM(){
  const side = document.querySelector('#view .side') || document.querySelector('.side');
  if (!side) return;
  // Find existing last-results panel by its header text
  const panels = side.querySelectorAll('.panel');
  panels.forEach(p=>{
    const h3 = p.querySelector('h3'); 
    if (h3 && /YOUR LAST QUIZ RESULTS/i.test(h3.textContent)) p.remove();
  });
  // Re-render at end of side
  try { renderLastResults({appendChild: (el)=> side.appendChild(el)}); } catch(e){}
}



document.addEventListener('DOMContentLoaded', ()=>{
  try{
    // Remove/disable any Cloud Practitioner option on landing while preserving layout
    document.querySelectorAll('*').forEach(el=>{
      if (/practitioner/i.test(el.textContent||'')) { el.style.display='none'; }
    });
  }catch(e){}
});
