
(function(){
  // External links new tab
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href]');
    if(!a) return;
    try{
      const url = new URL(a.href, location.href);
      if(url.origin !== location.origin) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    }catch(err){}
  }, true);

  // Progress
  const KEY='guide-progress-v3';
  const getP=()=>{ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}} };
  const setP=(p)=> localStorage.setItem(KEY, JSON.stringify(p));

  // Sidebar active
  document.querySelectorAll('.sidebar a[data-href]').forEach(a=>{
    if(location.pathname.endsWith(a.dataset.href)) a.style.borderColor='#3a4a88';
  });

  // Cards + Search
  const cards=document.querySelector('#cards'), search=document.querySelector('#search');
  if(cards && search){
    const DATA=JSON.parse(document.getElementById('DATASET').textContent);
    function render(list){
      cards.innerHTML='';
      const prog=getP();
      list.forEach(item=>{
        const a=document.createElement('a'); a.href=item.href; a.className='card';
        const h=document.createElement('h3'); h.textContent=item.title;
        const p=document.createElement('p'); p.textContent=item.desc;
        const ul=document.createElement('ul'); item.highlights.forEach(t=>{const li=document.createElement('li'); li.textContent=t; ul.appendChild(li);});
        const b=document.createElement('span'); b.className='pill badge mark'; b.textContent=prog[item.href]?'✓ Visto':'Marcar';
        b.onclick=(ev)=>{ev.preventDefault(); const pr=getP(); pr[item.href]=!pr[item.href]; setP(pr); render(list);};
        a.appendChild(h); a.appendChild(p); a.appendChild(ul); a.appendChild(b); cards.appendChild(a);
      });
    }
    function filter(){ const q=(search.value||'').toLowerCase().trim();
      render(DATA.filter(x=>(x.title+' '+x.desc+' '+x.tags.join(' ')+' '+x.highlights.join(' ')).toLowerCase().includes(q))); }
    search.addEventListener('input', filter); render(DATA);
  }

  // Quiz
  const quiz=document.getElementById('quiz');
  if(quiz){
    const data=JSON.parse(quiz.dataset.questions||'[]'); quiz.innerHTML='';
    let score=0,total=data.length;
    data.forEach((q,i)=>{
      const card=document.createElement('div'); card.className='card';
      const h=document.createElement('h3'); h.textContent='Pregunta '+(i+1);
      const p=document.createElement('p'); p.textContent=q.q; card.appendChild(h); card.appendChild(p);
      q.opts.forEach(opt=>{
        const b=document.createElement('button'); b.className='btn'; b.style.background='transparent';
        b.onclick=()=>{ if(b.dataset.done) return; b.dataset.done='1'; if(opt===q.a){ b.style.borderColor='#22c55e'; b.style.boxShadow='0 0 0 3px rgba(34,197,94,.25)'; score++; } else { b.style.borderColor='#ef4444'; b.style.boxShadow='0 0 0 3px rgba(239,68,68,.25)'; } result.textContent='Puntuación: '+score+'/'+total; };
        b.textContent=opt; card.appendChild(b);
      });
      quiz.appendChild(card);
    });
    const result=document.createElement('p'); result.className='pill quiz-result'; result.textContent='Puntuación: 0/'+total; quiz.appendChild(result);
  }
})();
