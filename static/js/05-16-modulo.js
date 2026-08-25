function openModalMultiCaminantes() {
    const cam = caminatas.find(c => c.id === currentCaminataId);
    if (!cam) {
        showToast('No se encontró la caminata', 'danger');
        return;
    }
    document.getElementById('multi-caminantes-buscar').value = '';
    renderMultiSelectCaminantes();
    modalMultiCaminantes.show();
}

function renderMultiSelectCaminantes() {
    const cont = document.getElementById('multi-caminantes-lista');
    const buscar = document.getElementById('multi-caminantes-buscar');
    const filtro = (buscar ? buscar.value : '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!cont) return;

    const cam = caminatas.find(c => c.id === currentCaminataId);
    const actuales = new Set((cam && cam.pasajeros ? cam.pasajeros.map(p => p.nombre) : []));
    const base = new Set();

    personasGlobales.forEach(n => { if (n && typeof n === 'string') base.add(n); });
    directorioPersonas.forEach(p => { if (p && p.nombre) base.add(p.nombre); });

    const nombres = Array.from(base)
        .filter(n => !actuales.has(n))
        .filter(n => n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(filtro))
        .sort((a, b) => a.localeCompare(b));

    if (nombres.length === 0) {
        cont.innerHTML = '<p class="text-muted small text-center mb-0">No hay personas disponibles para agregar.</p>';
        return;
    }

    cont.innerHTML = nombres.map((n, i) => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${escapeHtml(n)}" id="multi-cam-${i}">
            <label class="form-check-label small text-muted" for="multi-cam-${i}">${escapeHtml(n)}</label>
        </div>
    `).join('');
}

async function agregarCaminantesSeleccionados() {
    const cont = document.getElementById('multi-caminantes-lista');
    if (!cont) return;
    const checkboxes = cont.querySelectorAll('input[type="checkbox"]:checked');
    const nombres = Array.from(checkboxes).map(cb => cb.value);

    if (nombres.length === 0) {
        showToast('Seleccioná al menos una persona', 'warning');
        return;
    }

    const camIndex = caminatas.findIndex(c => c.id === currentCaminataId);
    if (camIndex === -1) return;

    if (!caminatas[camIndex].pasajeros) caminatas[camIndex].pasajeros = [];

    let agregados = 0;
    nombres.forEach((nombre, i) => {
        const nombreNormalizado = nombre.toLowerCase();
        const existe = caminatas[camIndex].pasajeros.some(p => p.nombre.toLowerCase() === nombreNormalizado);
        if (existe) return;

        caminatas[camIndex].pasajeros.push({
            id: Date.now().toString() + '_' + i,
            nombre: nombre,
            estado: 'pendiente',
            abonos: '',
            historialMontos: [],
            nota: '',
            notaPublica: false,
            mostrarDescReversion: true,
            mostrarDescPago: true,
            mostrarReversiones: true,
            mostrarPagosActivos: true,
            mostrarTotalEnLista: true,
            mostrarSaldoPendiente: false,
            dolarizar: false,
            tipoCambioDolar: ''
        });

        if (!personasGlobales.includes(nombre)) personasGlobales.push(nombre);
        if (!directorioPersonas.find(p => p.nombre === nombre)) {
            directorioPersonas.push({
                id: Date.now().toString() + '_' + i,
                nombre: nombre,
                cedula: '',
                telefono: '',
                correo: ''
            });
        }
        agregados++;
    });

    await saveData();
    renderCaminantes();
    ajustarCantidadBusetas(camIndex);
    updateTotalTransporte();
    updateDineroARecoger();
    modalMultiCaminantes.hide();

    if (agregados > 0) {
        showToast(`${agregados} caminante(s) agregado(s)`, 'success');
    } else {
        showToast('Las personas seleccionadas ya estaban en la lista', 'warning');
    }
}

// Lógica para confirmar al intentar hacer pública la nota
function handleNotaPublicaToggle(element) {
    if (element.checked) {
        // Revertir temporalmente para esperar confirmación
        element.checked = false;
        showConfirm(
            "Advertencia de Privacidad",
            "¿Estás seguro de que deseas hacer pública esta nota? Al enviar la lista por WhatsApp, este detalle será visible para todas las personas del grupo.",
            () => {
                // Confirmado
                element.checked = true;
            },
            "Sí, hacer pública",
            "btn-warning"
        );
    }
}

// Lógica automática para cambio de estado basado en Abono
function checkEstadoAbono() {
    const abono = document.getElementById('cam-usu-abonos').value;
    const estado = document.getElementById('cam-usu-estado');
    
    if (abono === 'R') {
        estado.value = 'reservado';
    } else if (abono.startsWith('Ab+') || abono.startsWith('R+')) {
        estado.value = 'abono';
    }
}

// Lógica automática inversa: Si es Reserva Parcial, borrar Abonos
function checkAbonoByEstado() {
    const estado = document.getElementById('cam-usu-estado').value;
    const abono = document.getElementById('cam-usu-abonos');
    const abonoActual = abono.value;

    if (estado === 'pendiente') {
        abono.innerHTML = '<option value=""></option>';
        abono.value = '';
        abono.disabled = true;
        abono.classList.add('bg-light');
    } else if (estado === 'reservado') {
        abono.innerHTML = '<option value="">Ninguno</option><option value="R">R (Reserva)</option>';
        abono.value = abonoActual && (abonoActual === 'R' || abonoActual === '') ? abonoActual : '';
        abono.disabled = false;
        abono.classList.remove('bg-light');
    } else if (estado === 'abono') {
        let opciones = '<option value=""></option>';
        for (let i = 1; i <= 30; i++) {
            opciones += `<option value="Ab+${i}">Ab+${i}</option>`;
        }
        abono.innerHTML = opciones;
        abono.value = abonoActual && abonoActual.startsWith('Ab+') ? abonoActual : '';
        abono.disabled = false;
        abono.classList.remove('bg-light');
    } else {
        abono.innerHTML = '<option value=""></option>';
        abono.value = '';
        abono.disabled = true;
        abono.classList.add('bg-light');
    }
}
