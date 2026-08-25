# Reglas del proyecto AGENDATRIBUPRO / Flask

## 1. Límite de líneas por módulo

- Todo archivo `.js`, `.css` o `.html` debe tener **máximo 250 líneas**.
- Si un módulo alcanza más de 250 líneas, debe dividirse en módulos más pequeños.
- Usar `herramientas/partir_si_pasa.py` para partir automáticamente cualquier archivo que supere el límite.

## 2. Librerías y dependencias

- No se permiten CDNs. Todas las librerías (Bootstrap, Font Awesome, jsPDF, pdf.js, html2canvas, LocalForage) deben estar en `static/vendor/`.
- Los estilos propios van en `static/css/`.
- La lógica JavaScript propia va en `static/js/`, ordenada numéricamente por dependencia.

## 3. Persistencia

- La base de datos oficial es **SQLite** (`tribu.sqlite` por defecto).
- `loadData()` y `saveData()` deben leer/escribir a través de los endpoints `/api/data` de Flask.
- La importación de JSON debe terminar guardando en SQLite.

## 4. PWA

- `static/sw.js` no debe cachear en desarrollo.
- `static/manifest.json` debe apuntar a rutas locales bajo `/static/`.

## 5. Modularidad del HTML

- Las vistas, modales y parciales deben estar en `templates/vistas/`, `templates/modales/` y `templates/parciales/`.
- `templates/_cuerpo.html` debe reconstruirse idéntica al `<body>` original.
