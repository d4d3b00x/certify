
/* Feature flags (default: all OFF to preserve current behavior) */
window.__CERTIFY_FLAGS__ = Object.assign({
  pwa: false,           // enable PWA (service worker + manifest)
  telemetry: false,     // enable console/log-based telemetry
  export: true          // enable hidden /export page for CSV/JSON exports
}, window.__CERTIFY_FLAGS__ || {});
