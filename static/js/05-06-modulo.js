function eliminarUrlCaminata(index) {
    const cont = document.getElementById('cam-url-lista');
    const current = Array.from(cont.querySelectorAll('.cam-url-input')).map(input => input.value);
    current.splice(index, 1);
    renderUrlsCaminata(current);
}

function renderEquipoCaminata(cam) {
    const tbody = document.getElementById('cam-equipo-tbody');
    if (!tbody) return;

    const equipos = configTema.equipoRequerido || [];
    tbody.innerHTML = '';

    equipos.forEach((item, index) => {
        let estado = 'Si';
        if (cam && cam.equipo && cam.equipo[index]) {
            estado = cam.equipo[index].estado;
        }
        const checkedSi = estado === 'Si' ? 'checked' : '';
        const checkedNo = estado === 'No' ? 'checked' : '';
        const checkedOpc = estado === 'Opcional' ? 'checked' : '';
        tbody.innerHTML += `
            <tr>
                <td class="ps-0 fw-medium">${item}</td>
                <td class="text-center"><input type="radio" name="cam-equip_${index}" value="Si" class="form-check-input" style="cursor: pointer;" ${checkedSi}></td>
                <td class="text-center"><input type="radio" name="cam-equip_${index}" value="No" class="form-check-input" style="cursor: pointer;" ${checkedNo}></td>
                <td class="text-center pe-0"><input type="radio" name="cam-equip_${index}" value="Opcional" class="form-check-input" style="cursor: pointer;" ${checkedOpc}></td>
            </tr>
        `;
    });
}

async function enviarInstruccionesCaminata() {
    const form = document.getElementById('form-caminata');
    if (!form.reportValidity()) return;

    await saveCaminataHeader({ preventDefault: () => {} }, true);

    const id = document.getElementById('caminata-id').value;
    const cam = caminatas.find(c => c.id === id);
    if (!cam) {
        showToast('Caminata no encontrada', 'danger');
        return;
    }

    let texto = generarEncabezadoWhatsApp(cam);
    texto += generarBloqueInstrucciones(cam);

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

function asignarNombreDesdeParque(guardarNombre = true) {
    const parque = document.getElementById('cam-parque');
    const nombre = document.getElementById('cam-nombre');
    if (parque.value && document.getElementById('cam-actividad').value === 'Parque Nacional') {
        const dato = PARQUES_NACIONALES.find(p => p.nombre === parque.value);
        if (dato) {
            if (guardarNombre) nombre.value = dato.nombre;
            asegurarOpcionProvincia(dato.provincia);
        }
    }
}

function asegurarOpcionProvincia(provincia) {
    const select = document.getElementById('cam-provincia');
    if (!select || !provincia) return;
    let option = Array.from(select.options).find(o => o.value === provincia);
    if (!option) {
        option = document.createElement('option');
        option.value = provincia;
        option.innerText = provincia;
        select.appendChild(option);
    }
    select.value = provincia;

    const pais = document.getElementById('cam-pais');
    if (pais) {
        let optPais = Array.from(pais.options).find(o => o.value === provincia);
        if (!optPais) {
            optPais = document.createElement('option');
            optPais.value = provincia;
            optPais.innerText = provincia;
            pais.appendChild(optPais);
        }
    }
}

function asignarNombreDesdeEtapa() {
    const etapa = document.getElementById('cam-etapa');
    const nombre = document.getElementById('cam-nombre');
    if (etapa.value && document.getElementById('cam-actividad').value === 'El Camino de Costa Rica') {
        nombre.value = etapa.value;
        asignarProvinciaPorEtapa(etapa.value);
    }
}

function asignarProvinciaPorEtapa(etapa) {
    const limon = ['Etapa 1A', 'Etapas 1A y B', 'Etapa 2', 'Etapa 3 y 4'];
    const cartago = ['Etapa 5', 'Etapa 6', 'Etapa 7', 'Etapa 8', 'Etapa 9', 'Etapa 10', 'Etapa 11'];
    const sanJose = ['Etapa 12', 'Etapa 13'];
    const puntarenas = ['Etapas 13 y 14', 'Etapa 14', 'Etapa 15', 'Etapa 16 (Final)'];

    let provincia = '';
    if (limon.includes(etapa)) provincia = 'Limón';
    else if (cartago.includes(etapa)) provincia = 'Cartago';
    else if (sanJose.includes(etapa)) provincia = 'San José';
    else if (puntarenas.includes(etapa)) provincia = 'Puntarenas';

    if (provincia) asegurarOpcionProvincia(provincia);
}

function toggleDateFields() {
    const esInternacional = document.getElementById('cam-actividad').value === 'Internacional';
    const localDiv = document.getElementById('fecha-local-container');
    const intDiv = document.getElementById('fecha-internacional-container');

    if (!esInternacional) {
        localDiv.style.display = 'block';
        document.getElementById('cam-fecha-local').required = true;

        intDiv.style.display = 'none';
        document.getElementById('cam-fecha-ida').required = false;
        document.getElementById('cam-fecha-regreso').required = false;
    } else {
        localDiv.style.display = 'none';
        document.getElementById('cam-fecha-local').required = false;

        intDiv.style.display = 'block';
        document.getElementById('cam-fecha-ida').required = true;
        document.getElementById('cam-fecha-regreso').required = true;
    }
}

function updateCurrencySymbols() {
    const sym = document.getElementById('cam-moneda').value;
    document.querySelectorAll('.currency-symbol').forEach(el => el.innerText = sym);
    updateTotalTransporte();
    updateDineroARecoger();
}

function updateTotalTransporte() {
    const sym = document.getElementById('cam-moneda').value || '₡';
    const precioBuseta = Number(document.getElementById('cam-precio-buseta').value || 0);
    const cantidadBuses = Number(document.getElementById('cam-cantidad-busetas').value || 1);
    const total = precioBuseta * cantidadBuses;
    document.getElementById('cam-total-transporte').innerText = `${sym}${total}`;
    updateTotalLibreCaminata();
}

function toggleBusetaSection(checkbox) {
    const ids = ['cam-precio-buseta', 'cam-cantidad-busetas', 'cam-cantidad-guias'];

    if (checkbox.checked) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            el.disabled = false;
            el.required = true;
            if (id === 'cam-cantidad-busetas' && !el.value) el.value = '1';
            if (id === 'cam-cantidad-guias' && !el.value) el.value = '2';
        });
    } else {
        ids.forEach(id => {
            const el = document.getElementById(id);
            el.disabled = true;
            el.required = false;
            if (id === 'cam-precio-buseta' || id === 'cam-cantidad-guias') el.value = '0';
            if (id === 'cam-cantidad-busetas') el.value = '1';
        });
    }
    updateTotalTransporte();
    updateDeudaPorPersona();
    updateDineroARecoger();
}
