// URL de tu API Gateway (cámbiala por la real)
const NEWSLETTER_API_URL = "https://lqh97yxmt5.execute-api.eu-central-1.amazonaws.com/newsletter";

document.addEventListener("DOMContentLoaded", function () {
  // Cargar el HTML del footer
  fetch("/includes/footer.html")
    .then(response => {
      if (!response.ok) {
        throw new Error("No se pudo cargar footer.html");
      }
      return response.text();
    })
    .then(html => {
      const container = document.getElementById("global-footer");
      if (!container) return;
      container.innerHTML = html;

      // Una vez insertado el footer en el DOM, conectamos el formulario
      setupNewsletterForm();
    })
    .catch(error => console.error("Error cargando el footer:", error));
});

function setupNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  const emailInput = document.getElementById("newsletter-email");
  const submitBtn = document.getElementById("newsletter-submit");
  const statusEl = document.getElementById("newsletter-status");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = (emailInput.value || "").trim();

    // Validación sencilla en cliente
    if (!email || !email.includes("@")) {
      showStatus("Por favor, introduce un email válido.", "error", statusEl);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";
    showStatus("", "reset", statusEl);

    try {
      const res = await fetch(NEWSLETTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          sourcePage: window.location.pathname
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        showStatus(data.message || "¡Gracias! Te hemos suscrito.", "ok", statusEl);
        form.reset();
      } else {
        showStatus(
          data.message || "No se ha podido guardar tu correo. Inténtalo de nuevo.",
          "error",
          statusEl
        );
      }
    } catch (err) {
      console.error(err);
      showStatus("Error de conexión. Inténtalo de nuevo más tarde.", "error", statusEl);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Unirme";
    }
  });
}

function showStatus(message, type, el) {
  if (!el) return;
  if (type === "reset") {
    el.textContent = "";
    el.classList.remove("ok", "error");
    return;
  }
  el.textContent = message;
  el.classList.remove("ok", "error");
  if (type === "ok") el.classList.add("ok");
  if (type === "error") el.classList.add("error");
}