
(function(){
  document.addEventListener('click', function(e){
    const a=e.target.closest('a[href]'); if(!a) return;
    try{const u=new URL(a.href,location.href); if(u.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}}catch{}
  }, true);
  const KEY='guide-progress-v5', LAST='guide-last';
  const getP=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const setP=p=>localStorage.setItem(KEY,JSON.stringify(p));
  const slug=document.body.dataset.slug; if(slug){const p=getP(); p[slug]=true; localStorage.setItem(LAST,slug); setP(p);}
  const cards=document.querySelector('#cards'),search=document.querySelector('#search');
  const bar=document.querySelector('#progressbar'),pct=document.querySelector('#progresspct'),cont=document.querySelector('#continueBtn');
  const DATA=document.getElementById('DATASET')?JSON.parse(document.getElementById('DATASET').textContent):null;
  function recompute(){ if(!DATA||!bar||!pct) return; const p=getP(); const total=DATA.length; const done=DATA.filter(x=>p[x.slug]).length; const val= total? Math.round(100*done/total):0; bar.style.width=val+'%'; pct.textContent=val+'% completado ('+done+'/'+total+')'; if(cont){const last=localStorage.getItem(LAST); cont.style.display= last?'inline-flex':'none'; if(last){const hit=DATA.find(x=>x.slug===last); cont.onclick=()=>{ if(hit) location.href=hit.href; };}} }
  if(cards&&search&&DATA){
    function render(list){ cards.innerHTML=''; const prog=getP(); list.forEach(item=>{ const a=document.createElement('a'); a.href=item.href; a.className='card'; a.innerHTML=`<h3>${item.title}</h3><p>${item.desc}</p>`; const ul=document.createElement('ul'); item.highlights.forEach(t=>{const li=document.createElement('li'); li.textContent=t; ul.appendChild(li);}); const b=document.createElement('span'); b.className='btn outline badge mark'; b.textContent=prog[item.slug]?'✓ Visto':'Marcar'; b.onclick=(ev)=>{ev.preventDefault(); const pr=getP(); pr[item.slug]=!pr[item.slug]; setP(pr); render(list); recompute();}; a.appendChild(ul); a.appendChild(b); cards.appendChild(a);}); recompute(); }
    function filter(){ const q=(search.value||'').toLowerCase().trim(); render(DATA.filter(x=>(x.title+' '+x.desc+' '+x.highlights.join(' ')).toLowerCase().includes(q))); }
    search.addEventListener('input', filter); render(DATA);
  }
  recompute();
})();
