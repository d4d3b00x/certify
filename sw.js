
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open('certify-v1').then(cache => cache.addAll([
    './','./index.html','./style.css','./app.js','./questions.js','./history.html','./quiz-over.png','./flags.js','./telemetry.js'
  ])));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k=> k==='certify-v1'? null : caches.delete(k)))));
});
self.addEventListener('fetch', (e)=>{
  e.respondWith((async()=>{
    const r = await caches.match(e.request);
    if (r) return r;
    try { 
      const net = await fetch(e.request);
      const cache = await caches.open('certify-v1'); cache.put(e.request, net.clone());
      return net;
    } catch(err){ return r || Response.error(); }
  })());
});
