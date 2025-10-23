// auth.js
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
  catch { return null; }
}

function renderAuthBar() {
  const u = getCurrentUser();
  const bar = document.getElementById("authBar");
  if (!bar) return;
  if (u) {
    bar.textContent = `✅ ${u.name} (${u.email})`;
  } else {
    bar.textContent = "🔒 No autenticado";
  }
}

document.addEventListener("DOMContentLoaded", renderAuthBar);
