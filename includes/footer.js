// Cargar dinánicamente el footer global en todas las páginas
document.addEventListener("DOMContentLoaded", function () {
  fetch("/includes/footer.html")
    .then(response => {
      if (!response.ok) {
        throw new Error("No se pudo cargar footer.html");
      }
      return response.text();
    })
    .then(html => {
      document.getElementById("global-footer").innerHTML = html;
    })
    .catch(error => console.error("Error cargando el footer:", error));
});
