function toggleTipoYFechasCaminata() {
    const actividad = document.getElementById('cam-actividad').value;
    const localDiv = document.getElementById('fecha-local-container');
    const intDiv = document.getElementById('fecha-internacional-container');
    const horaSalidaContainer = document.getElementById('cam-hora-salida-container');

    if (actividad === 'Internacional') {
        if (localDiv) {
            localDiv.classList.add('d-none');
            const fechaLocal = document.getElementById('cam-fecha-local');
            if (fechaLocal) fechaLocal.required = false;
        }
        if (intDiv) {
            intDiv.classList.remove('d-none');
        }
        if (horaSalidaContainer) horaSalidaContainer.classList.remove('d-none');
        toggleDateFields();
    } else {
        if (horaSalidaContainer) horaSalidaContainer.classList.remove('d-none');
        if (localDiv) localDiv.classList.remove('d-none');
        if (intDiv) intDiv.classList.add('d-none');
        toggleDateFields();
    }
}

function toggleActividadCaminata() {
    const actividad = document.getElementById('cam-actividad').value;
    const etapaContainer = document.getElementById('cam-etapa-container');
    const parqueContainer = document.getElementById('cam-parque-container');
    const nombreContainer = document.getElementById('cam-nombre-container');
    const etapa = document.getElementById('cam-etapa');
    const parque = document.getElementById('cam-parque');
    const nombre = document.getElementById('cam-nombre');
    const nombreLabel = document.getElementById('cam-nombre-label');
    const ubicacionLabel = document.getElementById('cam-ubicacion-label');
    const provincia = document.getElementById('cam-provincia');
    const pais = document.getElementById('cam-pais');

    if (actividad === 'Internacional') {
        etapaContainer.classList.add('d-none');
        parqueContainer.classList.add('d-none');
        nombreContainer.classList.remove('d-none');
        nombre.required = true;
        etapa.required = false;
        parque.required = false;
        nombreLabel.innerText = 'Nombre del lugar';
        nombre.placeholder = 'Ej: Machu Picchu, Tikal, Ciudad de México';
        ubicacionLabel.innerText = 'País';
        provincia.classList.add('d-none');
        pais.classList.remove('d-none');
        togglePaisCaminata();
        if (etapa.value) etapa.value = '';
        if (parque.value) parque.value = '';
    } else if (actividad === 'El Camino de Costa Rica') {
        parqueContainer.classList.add('d-none');
        etapaContainer.classList.remove('d-none');
        nombreContainer.classList.add('d-none');
        nombre.required = false;
        parque.required = false;
        etapa.required = true;
        if (etapa.value) {
            nombre.value = etapa.value;
            asignarProvinciaPorEtapa(etapa.value);
        }
        if (parque.value) parque.value = '';
        nombreLabel.innerText = 'Nombre de La Caminata';
        nombre.placeholder = 'Ej: Volcán Arenal';
        ubicacionLabel.innerText = 'Provincia';
        provincia.classList.remove('d-none');
        pais.classList.add('d-none');
        pais.value = provincia.value || '';
        togglePaisCaminata();
    } else if (actividad === 'Parque Nacional') {
        poblarSelectParquesNacionales();
        etapaContainer.classList.add('d-none');
        parqueContainer.classList.remove('d-none');
        nombreContainer.classList.add('d-none');
        nombre.required = false;
        etapa.required = false;
        parque.required = true;
        if (etapa.value) etapa.value = '';
        if (parque.value) {
            nombre.value = parque.value;
            asignarNombreDesdeParque(false);
        }
        nombreLabel.innerText = 'Nombre de La Caminata';
        nombre.placeholder = 'Ej: Volcán Arenal';
        ubicacionLabel.innerText = 'Provincia';
        provincia.classList.remove('d-none');
        pais.classList.add('d-none');
        pais.value = provincia.value || '';
        togglePaisCaminata();
    } else {
        etapaContainer.classList.add('d-none');
        parqueContainer.classList.add('d-none');
        nombreContainer.classList.remove('d-none');
        nombre.required = true;
        etapa.required = false;
        parque.required = false;
        if (etapa.value) etapa.value = '';
        if (parque.value) parque.value = '';
        nombreLabel.innerText = 'Nombre de La Caminata';
        nombre.placeholder = 'Ej: Volcán Arenal';
        ubicacionLabel.innerText = 'Provincia';
        provincia.classList.remove('d-none');
        pais.classList.add('d-none');
        pais.value = provincia.value || '';
        togglePaisCaminata();
    }
    toggleTipoYFechasCaminata();
}

function poblarSelectParquesNacionales() {
    const select = document.getElementById('cam-parque');
    if (!select || select.dataset.poblado === 'true') return;
    let html = '<option value="" selected>Seleccioná un parque</option>';
    PARQUES_NACIONALES.forEach(p => {
        html += `<option value="${escapeHtml(p.nombre)}" data-provincia="${escapeHtml(p.provincia)}">${escapeHtml(p.nombre)}</option>`;
    });
    select.innerHTML = html;
    select.dataset.poblado = 'true';
}

function renderFormasPagoCaminata(seleccionados) {
    const cont = document.getElementById('cam-formas-pago-lista');
    const vacio = document.getElementById('cam-formas-pago-vacio');
    if (!cont) return;

    const sinpe = (configTema.formasPago && configTema.formasPago.sinpe) ? configTema.formasPago.sinpe : [];
    const cuentas = (configTema.formasPago && configTema.formasPago.cuentas) ? configTema.formasPago.cuentas : [];
    const todo = [...sinpe, ...cuentas];

    cont.innerHTML = '';
    if (todo.length === 0) {
        if (vacio) vacio.classList.remove('d-none');
        return;
    }
    if (vacio) vacio.classList.add('d-none');

    todo.forEach((valor, i) => {
        const safeId = 'cam-pago-' + i;
        const checked = (seleccionados || []).includes(valor) ? 'checked' : '';
        cont.innerHTML += `
            <div class="col-12">
                <input type="checkbox" id="${safeId}" name="cam-formas-pago" value="${escapeHtml(valor)}" class="me-1 d-none" ${checked}>
                <label for="${safeId}" class="border rounded px-2 py-2 d-block text-start text-break mb-0" style="cursor:pointer;font-size:0.75rem;">${escapeHtml(valor)}</label>
            </div>
        `;
    });
}

function renderUrlsCaminata(urls) {
    const cont = document.getElementById('cam-url-lista');
    if (!cont) return;
    let html = '';
    (urls || []).forEach((u, i) => {
        html += `
            <div class="input-group mb-2 cam-url-fila" data-index="${i}">
                <input type="url" class="form-control cam-url-input" value="${escapeHtml(u)}" placeholder="Ej: https://chat.whatsapp.com/...">
                <button type="button" class="btn btn-outline-danger" onclick="eliminarUrlCaminata(${i})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    cont.innerHTML = html;
    const btn = document.getElementById('cam-agregar-url');
    if (btn) btn.classList.toggle('d-none', (urls || []).length >= 5);
}

function agregarUrlCaminata() {
    const cont = document.getElementById('cam-url-lista');
    const current = Array.from(cont.querySelectorAll('.cam-url-input')).map(input => input.value);
    if (current.length >= 5) return;
    current.push('');
    renderUrlsCaminata(current);
}
