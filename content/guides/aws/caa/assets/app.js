
(function(){
  // External links in new tab
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href]'); if(!a) return;
    try{ const url = new URL(a.href, location.href);
      if(url.origin !== location.origin){ a.target='_blank'; a.rel='noopener noreferrer'; }
    }catch{}
  }, true);

  // Progress across pages
  const KEY='guide-progress-v4';
  const LAST='guide-last';
  const getP=()=>{ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}} };
  const setP=(p)=> localStorage.setItem(KEY, JSON.stringify(p));

  // Auto-mark current page
  const pageSlug = document.body.dataset.slug;
  if(pageSlug){
    const p=getP(); p[pageSlug]=true; localStorage.setItem(LAST, pageSlug); setP(p);
  }

  // Home widgets
  const cards = document.querySelector('#cards');
  const search = document.querySelector('#search');
  const bar = document.querySelector('#progressbar');
  const pct = document.querySelector('#progresspct');
  const contBtn = document.querySelector('#continueBtn');
  const DATA = document.getElementById('DATASET') ? JSON.parse(document.getElementById('DATASET').textContent) : null;

  function recomputeProgress(){
    if(!DATA || !bar || !pct) return;
    const p=getP();
    const total = DATA.length;
    const done = DATA.filter(x=>p[x.slug]).length;
    const val = total? Math.round(100*done/total) : 0;
    bar.style.width = val+'%';
    pct.textContent = val + '% completado ('+done+'/'+total+')';
    if(contBtn){
      const last = localStorage.getItem(LAST);
      contBtn.style.display = last ? 'inline-flex' : 'none';
      if(last){ contBtn.onclick = ()=>{ location.href = DATA.find(x=>x.slug===last)?.href || '#'; }; }
    }
  }

  if(cards && search && DATA){
    function render(list){
      cards.innerHTML='';
      const prog=getP();
      list.forEach(item=>{
        const a = document.createElement('a'); a.href=item.href; a.className='card';
        const h = document.createElement('h3'); h.textContent=item.title;
        const p = document.createElement('p'); p.textContent=item.desc;
        const ul = document.createElement('ul'); item.highlights.forEach(v=>{ const li=document.createElement('li'); li.textContent=v; ul.appendChild(li); });
        const b = document.createElement('span'); b.className='userpill badge'; b.textContent = prog[item.slug]?'✓ Visto':'Marcar';
        b.onclick=(ev)=>{ ev.preventDefault(); const pr=getP(); pr[item.slug]=!pr[item.slug]; setP(pr); render(list); recomputeProgress(); };
        a.appendChild(h); a.appendChild(p); a.appendChild(ul); a.appendChild(b);
        cards.appendChild(a);
      });
      recomputeProgress();
    }
    function filter(){
      const q=(search.value||'').toLowerCase().trim();
      render(DATA.filter(x => (x.title+' '+x.desc+' '+x.tags.join(' ')+' '+x.highlights.join(' ')).toLowerCase().includes(q)));
    }
    search.addEventListener('input', filter);
    render(DATA);
  }

  recomputeProgress();
})();
