function convertirUrlsEnNotas(texto) {
    const t = (texto || '').toString();
    if (!t.trim()) return '';
    // Escapamos HTML primero y luego convertimos URLs en enlaces clickables.
    const esc = escapeHtml(t);
    return esc.replace(/(https?:\/\/[^\s<]+)/g, (match) => {
        return `<a href="${match}" target="_blank" rel="noopener" class="text-primary text-decoration-underline text-break d-inline-block" style="max-width:100%; word-break:break-all;">${match}</a>`;
    });
}

// ¡IMPORTANTE! Construye la ficha completa del contacto (modalVerDirectorio).
// Diseño aprobado por el usuario: no simplificar ni quitar secciones sin confirmar.