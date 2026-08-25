function listasDeCaminataDePersona(persona) {
    const nombreLower = (persona.nombre || '').toLowerCase().trim();
    const coincidencias = [];
    caminatas.forEach(cam => {
        if (cam.pasajeros) {
            const pas = cam.pasajeros.find(p => (p.nombre || '').toLowerCase().trim() === nombreLower);
            if (pas) coincidencias.push({ camId: cam.id, camNombre: cam.nombre, pasId: pas.id });
        }
    });
    return coincidencias;
}

let directorioViendoId = null;
let verContactoParticipacionesPagina = 1;
let verContactoRetirosPagina = 1;
const VER_CONTACTO_POR_PAGINA = 10;

function enlaceUrlClickeable(url) {
    const u = (url || '').trim();
    if (!u) return '';
    let href = u;
    if (!/^https?:\/\//i.test(href)) href = 'https://' + href;
    return `<a href="${href}" target="_blank" rel="noopener" class="text-primary text-decoration-underline small text-break d-inline-block" style="max-width:100%; word-break:break-all;">${escapeHtml(u)}</a>`;
}
