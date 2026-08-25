# -*- coding: utf-8 -*-
"""
Genera templates/base.html a partir del <head> del original.

- Convierte CDNs a estáticos locales.
- Reemplaza el bloque <style>...</style> por links a los módulos CSS locales.
- Registra el service worker local.
- Añade los scripts de librerías locales al final del <body>.
"""
from pathlib import Path

BASE = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO")
ORIGINAL = Path(r"C:\Users\MINIOS\Desktop\AGENDATRIBUPRO-REFERENCIA\AGENDATRIBUPRO.original.html")
SALTO = "\r\n"

texto = ORIGINAL.read_bytes().decode("utf-8")

# El <head> original va desde la línea <!DOCTYPE ...> hasta </head>
# Extraemos exactamente todo el inicio del archivo hasta el cierre de </head>
inicio_head = texto.index("<!DOCTYPE html>")
fin_head = texto.index("</head>") + len("</head>")
head_original = texto[inicio_head:fin_head]

# Reemplazos exactos de CDNs a estáticos locales
reemplazos = {
    '    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">':
        '    <link rel="stylesheet" href="{{ url_for(\'static\', filename=\'vendor/css/bootstrap.min.css\') }}">',
    '    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">':
        '    <link rel="stylesheet" href="{{ url_for(\'static\', filename=\'vendor/css/all.min.css\') }}">',
    '    <link rel="manifest" href="manifest.json">':
        '    <link rel="manifest" href="{{ url_for(\'static\', filename=\'manifest.json\') }}">',
    '    <script src="https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js"></script>':
        '    <script src="{{ url_for(\'static\', filename=\'vendor/js/localforage.min.js\') }}"></script>',
}
for viejo, nuevo in reemplazos.items():
    head_original = head_original.replace(viejo, nuevo, 1)

# Reemplazar el bloque <style>...</style> por los módulos CSS locales
style_inicio = head_original.index("    <style>")
style_fin = head_original.index("    </style>") + len("    </style>")
css_block = head_original[style_inicio:style_fin]

css_links = '    <!-- Modulos CSS locales -->\r\n'
for arch in ["01-variables.css", "02-layout.css", "03-tema.css", "04-componentes.css", "05-editor.css"]:
    css_links += f'    <link rel="stylesheet" href="{{{{ url_for(\'static\', filename=\'css/{arch}\') }}}}">\r\n'

head = head_original.replace(css_block, css_links, 1)

cuerpo = [
    "<body>",
    "",
    "{% block body %}",
    "{% include '_cuerpo.html' %}",
    "{% endblock %}",
    "",
    "{% block scripts %}",
    "    <!-- Librerías JS locales (sin CDNs) -->",
    "    <script src=\"{{ url_for('static', filename='vendor/js/bootstrap.bundle.min.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='vendor/js/html2canvas.min.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='vendor/js/jspdf.umd.min.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='vendor/js/pdf.min.js') }}\"></script>",
    "    <script>",
    "        pdfjsLib.GlobalWorkerOptions.workerSrc = \"{{ url_for('static', filename='vendor/js/pdf.worker.min.js') }}\";",
    "    </script>",
    "",
    "    <!-- Modulos JS de la app (orden de carga importante) -->",
    "    <script src=\"{{ url_for('static', filename='js/00-estado.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='js/01-datos.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='js/02-navegacion.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='js/03-utilidades.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='js/04-ajustes.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='js/05-caminatas.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='js/06-directorio.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='js/07-notas.js') }}\"></script>",
    "    <script src=\"{{ url_for('static', filename='js/99-inicio.js') }}\"></script>",
    "",
    "    <!-- Registro del Service Worker para PWA -->",
    "    <script>",
    "        if ('serviceWorker' in navigator) {",
    "            navigator.serviceWorker.register('{{ url_for('static', filename='sw.js') }}')",
    "                .then(function(reg) { console.log('SW registrado:', reg.scope); })",
    "                .catch(function(err) { console.error('SW error:', err); });",
    "        }",
    "    </script>",
    "{% endblock %}",
    "</body>",
    "</html>",
    "",
]

html = head + SALTO + SALTO.join(cuerpo)
(BASE / "templates" / "base.html").write_bytes(html.encode("utf-8"))
print("base.html generado:", BASE / "templates" / "base.html")
