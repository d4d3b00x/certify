
(function(){
  const on = (name, payload={})=>{
    if (!window.__CERTIFY_FLAGS__ || !window.__CERTIFY_FLAGS__.telemetry) return;
    try{
      const rec = { name, ts:new Date().toISOString(), ...payload };
      // Default: console only. Hook your backend here if needed.
      console.log("[telemetry]", rec);
      // Example: local buffer (non-persistent)
      window.__CERTIFY_TELEM__ = window.__CERTIFY_TELEM__ || [];
      window.__CERTIFY_TELEM__.push(rec);
    }catch(e){ /* no-op */ }
  };
  window.__telem = { on };
})();
