
# CertiFY (Improved, same UI/flow)

> Mismas pantallas y comportamiento. Las mejoras están **detrás de flags** y por defecto están **desactivadas** para no alterar la apariencia ni el funcionamiento actual.

## Novedades internas (opt-in)

- **PWA/Offline** (flag `pwa`): `manifest.webmanifest` + `sw.js` para cachear assets y funcionar sin conexión.
- **Telemetría opcional** (flag `telemetry`): disparos `quiz_start` y `quiz_finish` (con `{score,total,percent}`) — por defecto solo consola.
- **Exportación oculta** (flag `export`): página `/export.html` (no enlazada) para descargar historial en JSON/CSV.
- **Mejoras A11y**: landmarks con `role` y `alt` en imágenes.
- **Sin cambios visuales ni de flujo** por defecto.

## Cómo activar flags (AWS Amplify / Hosting estático)

Edita `flags.js` o define la variable global en un `<script>` antes de `flags.js`:

```html
<script>
  window.__CERTIFY_FLAGS__ = { pwa: true, telemetry: true, export: true };
</script>
<script src="flags.js"></script>
```

## Exportación de resultados

- Visita `/export.html` (no hay enlace en la UI).
- Requiere `window.__CERTIFY_FLAGS__.export = true` (ya viene así por defecto).

## Telemetría

- Los eventos se registran en `console.log`. Integra tu backend sustituyendo el `console.log` en `telemetry.js` (por ejemplo AWS Pinpoint/AppSync).

## PWA

- Activa `pwa: true` para registrar `sw.js` y adjuntar `manifest.webmanifest` dinámicamente.
- No cambia estilos; simplemente habilita offline y progressive install.

## Despliegue en Amplify

- Hosting estático: publica todo el contenido del zip al root del hosting.
- No requiere build. (Opcionalmente puedes añadir un pipeline con lint/tests si conviertes el repo a Node).

## Notas

- Todo mantiene el **mismo estilo y flujo**. Las nuevas capacidades son opt‑in.
