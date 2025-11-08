
(function(){
  document.addEventListener('click', function(e){
    const a=e.target.closest('a[href]'); if(!a) return;
    try{ const u=new URL(a.href, location.href); if(u.origin!==location.origin){ a.target='_blank'; a.rel='noopener noreferrer'; } }catch{}
  }, true);

  const KEY='guide-progress-v7', LAST='guide-last';
  const getP=()=>{ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}} };
  const setP=p=> localStorage.setItem(KEY, JSON.stringify(p));

  const slug=document.body.dataset.slug;
  if(slug){ const p=getP(); p[slug]=true; localStorage.setItem(LAST, slug); setP(p); }

  const cards=document.querySelector('#cards'), search=document.querySelector('#search');
  const chips=document.querySelector('#chips');
  const bar=document.querySelector('#progressbar'), pct=document.querySelector('#progresspct'), cont=document.querySelector('#continueBtn');
  const DATA=document.getElementById('DATASET')?JSON.parse(document.getElementById('DATASET').textContent):null;

  let activeDomain='all';

  function countsByDomain(){
    const p=getP();
    const map = {};
    DATA.forEach(x=>{
      map[x.domain] = map[x.domain] || {total:0, done:0};
      map[x.domain].total += 1;
      if(p[x.slug]) map[x.domain].done += 1;
    });
    return map;
  }

  function renderChips(){
    if(!chips || !DATA) return;
    const map = countsByDomain();
    const domains = Array.from(new Set(DATA.map(x=>x.domain))).sort();
    chips.innerHTML = '';
    const all = document.createElement('button');
    all.className='chip'+(activeDomain==='all'?' active':'');
    const p=getP(); const total=DATA.length; const done=DATA.filter(x=>p[x.slug]).length;
    all.innerHTML = `Todos <span class="count">${done}/${total}</span>`;
    all.onclick=()=>{ activeDomain='all'; renderChips(); filter(); };
    chips.appendChild(all);
    domains.forEach(d=>{
      const b=document.createElement('button');
      const c = map[d] || {total:0, done:0};
      b.className='chip'+(activeDomain===d?' active':'');
      b.innerHTML = `${d} <span class="count">${c.done}/${c.total}</span>`;
      b.onclick=()=>{ activeDomain = (activeDomain===d?'all':d); renderChips(); filter(); };
      chips.appendChild(b);
    });
  }

  function recompute(){
    if(!DATA||!bar||!pct) return;
    const p=getP(); const total=DATA.length; const done=DATA.filter(x=>p[x.slug]).length;
    const val = total? Math.round(100*done/total):0;
    bar.style.width=val+'%'; pct.textContent=val+'% completado ('+done+'/'+total+')';
    if(cont){ const last=localStorage.getItem(LAST); cont.style.display= last?'inline-flex':'none';
      if(last){ const hit=DATA.find(x=>x.slug===last); cont.onclick=()=>{ if(hit) location.href=hit.href; }; } }
    renderChips();
  }

  function render(list){
    if(!cards) return;
    cards.innerHTML='';
    const prog=getP();
    list.forEach(item=>{
      const a=document.createElement('a'); a.href=item.href; a.className='card'+(prog[item.slug]?' done':'');
      a.innerHTML=`<h3>${item.title}</h3><p>${item.desc}</p>`;
      const ul=document.createElement('ul'); item.highlights.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
      const b=document.createElement('span'); b.className='btn outline badge mark'+(prog[item.slug]?' done':'');
      b.textContent=prog[item.slug]?'✓ Visto':'Marcar'; b.title='Marcar como visto';
      b.onclick=(ev)=>{ ev.preventDefault(); const pr=getP(); pr[item.slug]=!pr[item.slug]; setP(pr); filter(); };
      a.appendChild(ul); a.appendChild(b); cards.appendChild(a);
    });
    recompute();
  }

  function filter(){
    const q=(search?.value||'').toLowerCase().trim();
    let list = DATA.filter(x => (x.title+' '+x.desc+' '+x.highlights.join(' ')+' '+x.domain).toLowerCase().includes(q));
    if(activeDomain!=='all'){ list = list.filter(x=>x.domain===activeDomain); }
    render(list);
  }

  if(cards && DATA){
    search && search.addEventListener('input', filter);
    filter();
    renderChips();
  }
  recompute();
})();
