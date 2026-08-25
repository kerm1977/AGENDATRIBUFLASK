function detenerConfetti() {
    if (confettiAnimId) {
        cancelAnimationFrame(confettiAnimId);
        confettiAnimId = null;
    }
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function renderDirectorioList(filterText = "", filterTipo = "", filterPais = "") {
    const listDiv = document.getElementById('lista-directorio');
    listDiv.innerHTML = '';

    const totalUsuarios = directorioPersonas.length;
    const totalLabel = `${totalUsuarios} usuario${totalUsuarios !== 1 ? 's' : ''}`;
    const totalBtn = document.getElementById('directorio-total');
    if(totalBtn) totalBtn.innerText = totalLabel;

    const cam = caminatas.find(c => c.id === currentCaminataId);
    const currentNames = cam && cam.pasajeros ? cam.pasajeros.map(p => p.nombre.toLowerCase()) : [];

    // Ordenar alfabéticamente por nombre
    let personas = [...directorioPersonas].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

    if(filterTipo) {
        personas = personas.filter(p => (p.tipo || 'Persona') === filterTipo);
    }
    if(filterPais) {
        personas = personas.filter(p => (p.pais || 'Costa Rica') === filterPais);
    }

    if(filterText) {
        const palabras = filterText.toLowerCase().trim().split(/\s+/).filter(w => w);
        personas = personas.filter(p => {
            const texto = [
                p.nombre || '',
                p.cedula || '',
                p.pasaporte || '',
                p.telefono || '',
                p.telefono2 || '',
                p.telefono3 || '',
                p.correo || '',
                p.notas || '',
                p.tipo || 'Persona',
                p.pais || 'Costa Rica',
                p.lugar || '',
                p.fechaNacimiento || '',
                p.tipoSangre || '',
                p.contactoEmergenciaNombre || '',
                p.telefonoEmergencia || '',
                p.nombreContacto || '',
                p.telefonoContacto || '',
                p.urlMapa || '',
                p.horario || '',
                (p.terreno || []).join(' '),
                p.precio || '',
                p.etapaCamino || ''
            ].join(' ').toLowerCase();
            return palabras.every(w => texto.includes(w));
        });
    }

    if(personas.length === 0) {
        listDiv.innerHTML = '<p class="text-muted small text-center my-4">Directorio vacío o no hay coincidencias.</p>';
        updateDirectorioCount();
        return;
    }

    // Encabezado de instrucción
    const hint = document.createElement('p');
    hint.className = 'text-muted small mb-2';
    hint.style.fontSize = '0.7rem';
    hint.innerHTML = '<i class="fas fa-info-circle"></i> Toca una tarjeta para ver toda la información del contacto (incluye a qué listas de caminata pertenece). Mantené presionado para editar directamente.';
    listDiv.appendChild(hint);

    const mostrarCheckbox = !!cam;

    personas.forEach((p, index) => {
        const isAlreadyInList = currentNames.includes((p.nombre || '').toLowerCase());
        const safeId = escapeJsString(p.id);
        const safeNombre = escapeHtml(p.nombre || '');
        const safeTelefono = escapeHtml(p.telefono || '');
        const tipo = p.tipo || 'Persona';
        const esGrupo = tipo !== 'Persona';
        const icono = iconoTipoDirectorio(tipo);
        const cantListas = listasDeCaminataDePersona(p).length;

        const waLink = enlaceWhatsAppDirectorio(p.telefono);
        const telefonoHtml = safeTelefono
            ? (waLink
                ? `<a href="${waLink}" target="_blank" rel="noopener" class="directorio-telefono-link whatsapp-activo" onclick="event.stopPropagation();" title="Enviar WhatsApp"><i class="fab fa-whatsapp me-1"></i>${safeTelefono}</a>`
                : `<span class="directorio-telefono-link">${safeTelefono}</span>`)
            : '';

        const item = document.createElement('div');
        item.className = `list-group-item ${isAlreadyInList ? 'bg-light text-muted' : ''}`;

        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center flex-grow-1" style="min-width:0; gap: 0.75rem;">
                    ${mostrarCheckbox ? `<input class="form-check-input me-1 directorio-cb flex-shrink-0" type="checkbox" id="dir-cb-${index}" value="${safeNombre}" ${isAlreadyInList ? 'disabled' : ''} onchange="updateDirectorioCount()">` : ''}
                    <div class="directorio-tipo-icon">
                        <i class="fas ${icono}"></i>
                    </div>
                    <div class="directorio-info flex-grow-1" data-id="${safeId}" style="min-width:0; cursor: pointer; user-select: none;">
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            <div class="${esGrupo ? 'fw-bold' : 'fw-medium'} text-dark">${safeNombre}</div>
                            ${esGrupo ? `<span class="badge bg-secondary" style="font-size:0.65rem;">${escapeHtml(tipo)}</span>` : ''}
                        </div>
                        ${telefonoHtml ? `<div class="small">${telefonoHtml}</div>` : ''}
                    </div>
                </div>
                <div class="d-flex gap-2 ms-2 align-items-center">
                    ${esCumpleProximo(p.fechaNacimiento) ? '<i class="fas fa-cake-candles text-warning" title="¡Cumpleaños próximo!"></i>' : ''}
                    ${cantListas > 0 ? `<span style="color: var(--primary-dark); font-weight: 700; font-size:0.8rem;" title="Pertenece a ${cantListas} lista${cantListas !== 1 ? 's' : ''} de caminata">${cantListas}</span>` : ''}
                    <i class="fas fa-trash text-danger action-icon" style="cursor:pointer; opacity: 0.7;" onclick="event.stopPropagation(); borrarDirectorio('${safeId}')" title="Eliminar del Directorio"></i>
                </div>
            </div>
        `;

        const info = item.querySelector('.directorio-info');
        let longPressFired = false;

        const startPress = (e) => {
            longPressFired = false;
            longPressTimer = setTimeout(() => {
                longPressFired = true;
                openEditarDirectorio(safeId);
            }, 600);
        };

        const endPress = (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        const clickInfo = (e) => {
            if (longPressFired) return;
            verInformacionContacto(safeId);
        };

        const dblClickInfo = (e) => {
            e.preventDefault();
            openEditarDirectorio(safeId);
        };

        info.addEventListener('touchstart', startPress, { passive: true });
        info.addEventListener('touchend', endPress);
        info.addEventListener('touchmove', endPress);
        info.addEventListener('mousedown', startPress);
        info.addEventListener('mouseup', endPress);
        info.addEventListener('mouseleave', endPress);
        info.addEventListener('click', clickInfo);
        info.addEventListener('dblclick', dblClickInfo);

        listDiv.appendChild(item);
    });
    updateDirectorioCount();
}
