document.addEventListener("DOMContentLoaded", function() {
  const footerHTML = `
  <footer style="background-color: #0d1117; color: #c9d1d9; padding: 40px 0; font-family: 'Segoe UI', sans-serif;">
    <div style="max-width: 1100px; margin: auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px;">
      <div style="flex: 1 1 250px; min-width: 220px;">
        <h3 style="color: #ffffff; margin-bottom: 10px;">ITHub.es</h3>
        <p style="margin: 6px 0;">Aprende, practica y aprueba tus certificaciones<br>
        mientras compites con el resto del mundo.</p>
        <p style="margin-top: 12px;">Todo lo que necesitas en un sólo lugar.</p>
        <p style="margin-top: 20px; font-size: 14px; color: #8b949e;">© 2025 ITHub.es</p>
      </div>

      <div style="flex: 1 1 150px; min-width: 120px;">
        <h4 style="color: #ffffff; margin-bottom: 10px;">Simuladores</h4>
        <p><a href="#" style="color: #58a6ff; text-decoration: none;">AZ-104</a></p>
        <p><a href="#" style="color: #58a6ff; text-decoration: none;">SAA-C03</a></p>
        <p><a href="#" style="color: #58a6ff; text-decoration: none;">AZ-305</a></p>
      </div>

      <div style="flex: 1 1 200px; min-width: 160px;">
        <h4 style="color: #ffffff; margin-bottom: 10px;">Contenidos</h4>
        <p><a href="#" style="color: #58a6ff; text-decoration: none;">Azure · Landing Zone</a></p>
        <p><a href="#" style="color: #58a6ff; text-decoration: none;">Azure · Storage (AZ-104)</a></p>
        <p><a href="#" style="color: #58a6ff; text-decoration: none;">Azure · Conectividad híbrida</a></p>
        <p><a href="#" style="color: #58a6ff; text-decoration: none;">AWS · S3 diseño</a></p>
        <p><a href="#" style="color: #58a6ff; text-decoration: none;">AWS · SQS & SNS</a></p>
      </div>

      <div style="flex: 1 1 180px; min-width: 160px;">
        <h4 style="color: #ffffff; margin-bottom: 10px;">Colaborador</h4>
        <p>💬 <a href="https://mundoazure.cloud" target="_blank" style="color: #58a6ff; text-decoration: none;">https://mundoazure.cloud</a></p>

        <h4 style="color: #ffffff; margin-top: 20px; margin-bottom: 10px;">Contacto</h4>
        <p>💬 <a href="#" style="color: #58a6ff; text-decoration: none;">Contáctanos</a></p>
      </div>
    </div>
  </footer>
  `;

  // Inserta el footer al final del body
  document.body.insertAdjacentHTML("beforeend", footerHTML);
});
