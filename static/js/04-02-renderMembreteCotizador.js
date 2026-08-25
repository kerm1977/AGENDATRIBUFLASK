function renderMembreteCotizador() {
    const m = configTema.membreteCotizador || {};
    const t1 = document.getElementById('ajustes-cot-telefono1');
    const t2 = document.getElementById('ajustes-cot-telefono2');
    const fb = document.getElementById('ajustes-cot-facebook');
    const wb = document.getElementById('ajustes-cot-web');
    const pf = document.getElementById('ajustes-cot-precio');
    const hf = document.getElementById('ajustes-cot-horario');
    const bf = document.getElementById('ajustes-cot-banos');
    const cf = document.getElementById('ajustes-cot-cortesia');
    const cif = document.getElementById('ajustes-cot-cierre');
    if (t1) t1.value = m.telefono1 || '';
    if (t2) t2.value = m.telefono2 || '';
    if (fb) fb.value = m.facebook || '';
    if (wb) wb.value = m.web || '';
    if (pf) pf.value = m.precioFrase || '';
    if (hf) hf.value = m.horarioFrase || '';
    if (bf) bf.value = m.banosFrase || '';
    if (cf) cf.value = m.cortesiaFrase || '';
    if (cif) cif.value = m.cierreFrase || '';
}

function guardarMembreteCotizador() {
    const t1 = document.getElementById('ajustes-cot-telefono1');
    const t2 = document.getElementById('ajustes-cot-telefono2');
    const fb = document.getElementById('ajustes-cot-facebook');
    const wb = document.getElementById('ajustes-cot-web');
    const pf = document.getElementById('ajustes-cot-precio');
    const hf = document.getElementById('ajustes-cot-horario');
    const bf = document.getElementById('ajustes-cot-banos');
    const cf = document.getElementById('ajustes-cot-cortesia');
    const cif = document.getElementById('ajustes-cot-cierre');
    if (!t1 || !t2 || !fb || !wb || !pf || !hf || !bf || !cf || !cif) return;
    configTema.membreteCotizador = {
        telefono1: t1.value,
        telefono2: t2.value,
        facebook: fb.value,
        web: wb.value,
        precioFrase: pf.value,
        horarioFrase: hf.value,
        banosFrase: bf.value,
        cortesiaFrase: cf.value,
        cierreFrase: cif.value
    };
    saveData();
    showToast('Membrete del cotizador guardado', 'success');
}

function abrirCotizador() {
    document.getElementById('cot-personas').value = 1;
    document.getElementById('cot-dias').value = 1;
    document.getElementById('cot-fecha-unica').value = '';
    document.getElementById('cot-fecha-ingreso').value = '';
    document.getElementById('cot-fecha-salida').value = '';
    document.getElementById('cot-tipo-requerimiento').value = '';
    document.getElementById('cot-hab-sencilla').value = 0;
    document.getElementById('cot-hab-doble').value = 0;
    document.getElementById('cot-hab-triple').value = 0;
    document.getElementById('cot-hab-cuadruple').value = 0;
    document.getElementById('cot-hab-pareja').value = 0;
    document.getElementById('cot-trans-cantidad').value = 1;
    document.getElementById('cot-trans-url').value = '';
    document.getElementById('cot-req-nota').value = '';
    cotRequerimientos = [];
    mostrarCamposRequerimientoCotizador();
    renderRequerimientosCotizador();
    actualizarResumenCotizador();
    toggleFechasCotizador();
    if (modalCotizador) modalCotizador.show();
}

function toggleFechasCotizador() {
    const dias = Number(document.getElementById('cot-dias').value || 1);
    const grupoUnica = document.getElementById('cot-grupo-fecha-unica');
    const grupoRango = document.getElementById('cot-grupo-fechas');
    if (dias > 1) {
        grupoUnica.classList.add('d-none');
        grupoRango.classList.remove('d-none');
    } else {
        grupoUnica.classList.remove('d-none');
        grupoRango.classList.add('d-none');
    }
}

function etiquetaTipoCotizador(tipo) {
    const map = {
        'hospedaje': 'Hospedaje',
        'lancha': 'Transporte Marítimo (Lancha)',
        'terrestre': 'Transporte Terrestre',
        'aereo': 'Transporte Aéreo',
        'guiado': 'Transporte Guiado',
        'nota': 'Nota / Descripción'
    };
    return map[tipo] || tipo;
}

function mostrarCamposRequerimientoCotizador() {
    const tipo = document.getElementById('cot-tipo-requerimiento').value;
    const camposHab = document.getElementById('cot-campos-habitacion');
    const camposTrans = document.getElementById('cot-campos-transporte');
    const camposNota = document.getElementById('cot-campos-nota');
    camposHab.classList.add('d-none');
    camposTrans.classList.add('d-none');
    camposNota.classList.add('d-none');
    if (tipo === 'hospedaje') camposHab.classList.remove('d-none');
    if (['lancha', 'terrestre', 'aereo', 'guiado'].includes(tipo)) camposTrans.classList.remove('d-none');
    if (tipo === 'nota') camposNota.classList.remove('d-none');
}

function agregarRequerimientoCotizador() {
    const tipo = document.getElementById('cot-tipo-requerimiento').value;
    if (!tipo) {
        showToast('Seleccioná un tipo de requerimiento', 'warning');
        return;
    }
    if (tipo === 'hospedaje') {
        const sencilla = Number(document.getElementById('cot-hab-sencilla').value || 0);
        const doble = Number(document.getElementById('cot-hab-doble').value || 0);
        const triple = Number(document.getElementById('cot-hab-triple').value || 0);
        const cuadruple = Number(document.getElementById('cot-hab-cuadruple').value || 0);
        const pareja = Number(document.getElementById('cot-hab-pareja').value || 0);
        if (sencilla + doble + triple + cuadruple + pareja === 0) {
            showToast('Indicá al menos una habitación', 'warning');
            return;
        }
        cotRequerimientos.push({
            id: Date.now().toString(),
            tipo,
            sencilla,
            doble,
            triple,
            cuadruple,
            pareja
        });
        document.getElementById('cot-hab-sencilla').value = 0;
        document.getElementById('cot-hab-doble').value = 0;
        document.getElementById('cot-hab-triple').value = 0;
        document.getElementById('cot-hab-cuadruple').value = 0;
        document.getElementById('cot-hab-pareja').value = 0;
    } else if (tipo === 'nota') {
        const nota = document.getElementById('cot-req-nota').value.trim();
        if (!nota) {
            showToast('Escribí una nota', 'warning');
            return;
        }
        cotRequerimientos.push({ id: Date.now().toString(), tipo, nota });
        document.getElementById('cot-req-nota').value = '';
    } else {
        const cantidad = Number(document.getElementById('cot-trans-cantidad').value || 0);
        let url = document.getElementById('cot-trans-url').value.trim();
        if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
        if (cantidad <= 0) {
            showToast('Indicá una cantidad de personas', 'warning');
            return;
        }
        cotRequerimientos.push({ id: Date.now().toString(), tipo, cantidad, url });
        document.getElementById('cot-trans-cantidad').value = 1;
        document.getElementById('cot-trans-url').value = '';
    }
    document.getElementById('cot-tipo-requerimiento').value = '';
    mostrarCamposRequerimientoCotizador();
    renderRequerimientosCotizador();
    showToast('Requerimiento agregado', 'success');
}

function eliminarRequerimientoCotizador(id) {
    cotRequerimientos = cotRequerimientos.filter(r => r.id !== id);
    renderRequerimientosCotizador();
}

function renderRequerimientosCotizador() {
    const cont = document.getElementById('cot-lista-requerimientos');
    if (!cont) return;
    if (cotRequerimientos.length === 0) {
        cont.innerHTML = '<p class="text-muted small mb-0">Aún no hay requerimientos agregados.</p>';
        return;
    }
    cont.innerHTML = cotRequerimientos.map(req => {
        let detalle = '';
        if (req.tipo === 'hospedaje') {
            const partes = [];
            if (req.sencilla > 0) partes.push(`Sencilla: ${req.sencilla}`);
            if (req.doble > 0) partes.push(`Doble: ${req.doble}`);
            if (req.triple > 0) partes.push(`Triple: ${req.triple}`);
            if (req.cuadruple > 0) partes.push(`Cuádruple: ${req.cuadruple}`);
            if (req.pareja > 0) partes.push(`Pareja: ${req.pareja}`);
            detalle = partes.join(' · ');
        } else if (req.tipo === 'nota') {
            detalle = escapeHtml(req.nota);
        } else {
            detalle = `Cantidad de personas: ${req.cantidad}`;
            if (req.url) detalle += ` · URL: ${escapeHtml(req.url)}`;
        }
        return `
            <div class="d-flex justify-content-between align-items-center bg-light rounded px-2 py-1 mb-1">
                <span class="small text-muted"><b>${etiquetaTipoCotizador(req.tipo)}</b> — ${detalle}</span>
                <button type="button" class="btn btn-sm text-danger" onclick="eliminarRequerimientoCotizador('${req.id}')" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    }).join('');
    actualizarResumenCotizador();
}
