function createNewCaminata() {
    currentCaminataId = Date.now().toString(); // Generate ID
    
    // UI Resets
    document.getElementById('form-caminata').reset();
    document.getElementById('caminata-id').value = currentCaminataId;
    renderFormasPagoCaminata([]);
    renderUrlsCaminata([]);
    renderEquipoCaminata();
    
    // Limpiar explícitamente el HTML de la vista anterior para evitar caminantes fantasma
    document.getElementById('lista-caminantes').innerHTML = ''; 
    
    // Resetear contadores y resultados calculados
    document.getElementById('caminantes-count').innerText = '0';
    document.getElementById('cam-cantidad-participantes').innerText = '0';
    document.getElementById('cam-total-personas-pagan').innerText = '0';

    // Resetear campos de buseta (modal)
    document.getElementById('cam-usar-buseta').checked = true;
    document.getElementById('cam-precio-buseta').value = '';
    document.getElementById('cam-cantidad-busetas').value = '1';
    document.getElementById('cam-cantidad-guias').value = '2';

    actualizarSugerenciasCaminatas();
    
    toggleDateFields();
    updateCurrencySymbols();
    updateTotalTransporte();
    document.getElementById('caminantes-section').style.display = 'none';
    document.getElementById('detail-title').innerText = "Nueva Caminata";
    
    // Asegurar que el formulario esté expandido al crear
    document.getElementById('collapseHeader').classList.add('show');
    
    const infoCollapse = document.getElementById('collapseInfo');
    if (infoCollapse) { new bootstrap.Collapse(infoCollapse, { toggle: false }).show(); }
    
    navigate('caminata', "Crear Lista");
}

function openCaminata(id) {
    const cam = caminatas.find(c => c.id === id);
    if (!cam) return;

    currentCaminataId = id;
    
    actualizarSugerenciasCaminatas();

    // Populate form
    document.getElementById('caminata-id').value = cam.id;
    document.getElementById('cam-nombre').value = toTitleCase(cam.nombre || '');
    document.getElementById('cam-dificultad').value = cam.dificultad || '';
    document.getElementById('cam-kilometros').value = cam.kilometros || '';
    document.getElementById('cam-actividad').value = cam.actividad || 'Caminata';
    document.getElementById('cam-etapa').value = cam.actividad === 'El Camino de Costa Rica' ? (cam.nombre || '') : '';
    document.getElementById('cam-modo-transporte').value = cam.modoTransporte || 'Terrestre';
    poblarSelectParquesNacionales();
    document.getElementById('cam-parque').value = cam.actividad === 'Parque Nacional' ? (cam.nombre || '') : '';
    toggleActividadCaminata();
    if (cam.actividad === 'Internacional') {
        document.getElementById('cam-pais').value = cam.provincia || '';
        togglePaisCaminata();
    } else {
        asegurarOpcionProvincia(cam.provincia || '');
    }
    document.getElementById('cam-aerolinea').value = cam.aerolinea || '';
    document.getElementById('cam-tiene-vuelo').checked = cam.tieneVuelo || false;
    document.getElementById('cam-tiene-fecha-vuelo').checked = cam.tieneFechaVuelo || false;
    document.getElementById('cam-numero-vuelo').value = cam.numeroVuelo || '';
    document.getElementById('cam-vuelo-fecha-salida').value = cam.vueloFechaSalida || '';
    document.getElementById('cam-vuelo-hora-salida').value = cam.vueloHoraSalida || '';
    document.getElementById('cam-vuelo-fecha-regreso').value = cam.vueloFechaRegreso || '';
    document.getElementById('cam-vuelo-hora-regreso').value = cam.vueloHoraRegreso || '';
    document.getElementById('cam-incluir-vuelo-whatsapp').checked = cam.incluirVueloWhatsApp || false;
    document.getElementById('cam-tiene-lugar-salida').checked = cam.tieneLugarSalida || false;
    if (cam.tieneLugarSalida) document.getElementById('cam-lugar-salida').value = cam.lugarSalida || '';
    else document.getElementById('cam-lugar-salida').value = 'Cada quien llega por sus propios medios';
    toggleDetallesVuelo();
    toggleLugarSalidaAeropuerto();
    document.getElementById('cam-fecha-local').value = cam.fechaLocal || '';
    document.getElementById('cam-fecha-ida').value = cam.fechaIda || '';
    document.getElementById('cam-fecha-regreso').value = cam.fechaRegreso || '';
    document.getElementById('cam-moneda').value = cam.moneda || '₡';
    document.getElementById('cam-precio').value = cam.precio || '';
    document.getElementById('cam-reserva-monto').value = cam.reservaMonto || '';
    document.getElementById('cam-precio-buseta').value = cam.precioBuseta || '';
    document.getElementById('cam-cantidad-busetas').value = cam.cantidadBuses || '1';
    document.getElementById('cam-cantidad-guias').value = cam.cantidadGuias || '2';
    document.getElementById('cam-usar-buseta').checked = cam.usarBuseta !== false;
    document.getElementById('cam-reserva-fecha').value = cam.reservaFecha || '';
    document.getElementById('cam-hora-salida').value = cam.horaSalida || '';
    updateTimePreview();
    document.getElementById('cam-lugar-salida').value = cam.lugarSalida || '';
    const recogerInput = document.getElementById('cam-lugares-recoger');
    if (recogerInput) recogerInput.value = (cam.lugaresRecoger || []).join(', ');
    renderUrlsCaminata(cam.urls || (cam.url ? [cam.url] : []));

    document.getElementById('cam-mostrar-incluye').checked = cam.mostrarIncluye !== false;
    document.getElementById('cam-mostrar-formas-pago').checked = cam.mostrarFormasPago !== false;
    document.getElementById('cam-mostrar-instrucciones').checked = cam.mostrarInstrucciones !== false;
    document.getElementById('cam-mostrar-urls').checked = cam.mostrarUrls !== false;
    document.getElementById('cam-mostrar-caminantes').checked = cam.mostrarCaminantes !== false;

    document.querySelectorAll('input[name="incluye"]').forEach(cb => cb.checked = false);
    (cam.incluye || []).forEach(item => {
        const cb = document.querySelector(`input[name="incluye"][value="${item}"]`);
        if (cb) cb.checked = true;
    });
    document.getElementById('otrosDescripcion').value = cam.otrosDescripcion || '';
    toggleOtherDesc();
    renderFormasPagoCaminata(cam.formasPago || []);
    renderEquipoCaminata(cam);
    const notasInstruccionesInput = document.getElementById('cam-notas-instrucciones');
    if (notasInstruccionesInput) notasInstruccionesInput.value = cam.notasAdicionales || '';

    if (cam.actividad === 'Internacional') {
        toggleTipoYFechasCaminata();
    } else {
        toggleDateFields();
    }
    toggleBusetaSection(document.getElementById('cam-usar-buseta'));
    updateCurrencySymbols();
    updateTotalTransporte();

    // Colapsar el formulario de encabezado para que no estorbe
    document.getElementById('collapseHeader').classList.remove('show');

    // Show caminantes section
    document.getElementById('caminantes-section').style.display = 'block';
    document.getElementById('detail-title').innerText = "Editar Caminata";
    
    const infoCollapse = document.getElementById('collapseInfo');
    if (infoCollapse) { new bootstrap.Collapse(infoCollapse, { toggle: false }).show(); }
    
    renderCaminantes();
    navigate('caminata', cam.nombre);
}

async function exportarTextoWhatsApp(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        showToast('Encabezado copiado al portapapeles');
    } catch (err) {
        window.prompt('Copiá el encabezado (Ctrl+C):', texto);
    }
}

function validateCaminataForm() {
    const form = document.getElementById('form-caminata');
    for (const el of form.elements) {
        if (el.required && !el.disabled && !el.value.trim()) {
            const collapseEl = el.closest('.accordion-collapse');
            if (collapseEl) {
                const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
                bsCollapse.show();
            }
            el.focus();
            el.reportValidity();
            return false;
        }
    }
    return true;
}
