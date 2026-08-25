function toggleOtherDesc() {
    const check = document.getElementById('checkOtros');
    const cont = document.getElementById('otrosDescContainer');
    if (!check || !cont) return;
    cont.classList.toggle('d-none', !check.checked);
    if (!check.checked) {
        const input = document.getElementById('otrosDescripcion');
        if (input) input.value = '';
    }
}

function updateTimePreview() {
    const input = document.getElementById('cam-hora-salida');
    const preview = document.getElementById('cam-time-preview');
    if (!input || !preview) return;
    const val = input.value;
    if (!val) {
        preview.innerText = '';
        return;
    }
    const [h, m] = val.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    preview.innerText = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function updateDeudaPorPersona() {
    const cam = caminatas.find(c => c.id === currentCaminataId);
    const totalCaminantes = cam ? (cam.pasajeros || []).length : 0;
    const guias = Number(document.getElementById('cam-cantidad-guias').value || 0);
    const personasPagan = Math.max(0, totalCaminantes - guias);
    const sym = document.getElementById('cam-moneda').value || '₡';
    const precioBuseta = Number(document.getElementById('cam-precio-buseta').value || 0);
    const cantidadBuses = Number(document.getElementById('cam-cantidad-busetas').value || 1);
    const totalBusetas = precioBuseta * cantidadBuses;
    const deudaDiv = document.getElementById('cam-deuda-por-persona');
    if (deudaDiv) {
        if (personasPagan > 0) {
            deudaDiv.innerText = `${sym}${Math.round(totalBusetas / personasPagan)}`;
        } else {
            deudaDiv.innerText = '—';
        }
    }
}

function updateDineroARecoger() {
    const cam = caminatas.find(c => c.id === currentCaminataId);
    const totalCaminantes = cam ? (cam.pasajeros || []).length : 0;
    const guias = Number(document.getElementById('cam-cantidad-guias').value || 0);
    const personasPagan = Math.max(0, totalCaminantes - guias);
    const sym = document.getElementById('cam-moneda').value || '₡';
    const precioCaminata = Number(document.getElementById('cam-precio').value || 0);
    const precioBuseta = Number(document.getElementById('cam-precio-buseta').value || 0);
    const cantidadBuses = Number(document.getElementById('cam-cantidad-busetas').value || 1);
    const totalTransporte = precioBuseta * cantidadBuses;
    const totalCaminata = precioCaminata * personasPagan;
    const totalRecoger = totalCaminata + totalTransporte;
    const recogerDiv = document.getElementById('cam-dinero-a-recoger');
    if (recogerDiv) {
        recogerDiv.innerText = `${sym}${totalRecoger}`;
    }
    const netoDiv = document.getElementById('cam-dinero-menos-transporte');
    if (netoDiv) {
        const neto = totalCaminata;
        const label = document.getElementById('label-dinero-menos-transporte');
        if (neto < 0) {
            netoDiv.classList.add('text-danger');
            netoDiv.innerText = `${sym}${neto}`;
            if (label) label.innerText = 'Dinero a Recoger menos Total de Transporte (faltante)';
        } else {
            netoDiv.classList.remove('text-danger');
            netoDiv.innerText = `${sym}${neto}`;
            if (label) label.innerText = 'Dinero a Recoger menos Total de Transporte';
        }
    }
}

// Formato: 15 de Octubre de 2024
function formatDateString(isoString) {
    if(!isoString) return "";
    const [year, month, day] = isoString.split('-');
    return `${parseInt(day, 10)} de ${MESES[parseInt(month, 10)-1]} del ${year}`;
}

// Formato corto: 15 Oct 2024
function formatDateStringShort(isoString) {
    if(!isoString) return "";
    const [year, month, day] = isoString.split('-');
    return `${parseInt(day, 10)} ${MESES[parseInt(month, 10)-1].substring(0,3)} ${year}`;
}

// --- SUGERENCIAS DE CAMINATAS ---
function actualizarSugerenciasCaminatas() {
    const datalist = document.getElementById('sug-caminatas');
    if (!datalist) return;
    datalist.innerHTML = '';

    const nombres = new Set();
    preciosBuseta.forEach(p => nombres.add(p.nombre));
    caminatas.forEach(c => nombres.add(c.nombre));

    nombres.forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        datalist.appendChild(option);
    });
}

function cargarSugerenciaCaminata(input) {
    const nombre = input.value.trim();
    if (!nombre) return;

    const precio = preciosBuseta.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
    if (precio) {
        if (precio.provincia) document.getElementById('cam-provincia').value = precio.provincia;
        if (precio.monto && document.getElementById('cam-precio-buseta')) {
            document.getElementById('cam-precio-buseta').value = precio.monto;
        }
        actualizarMonedaPorTipoPrecio();
        toggleDateFields();
        return;
    }

    const cam = caminatas.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    if (cam) {
        if (cam.provincia) document.getElementById('cam-provincia').value = cam.provincia;
        actualizarMonedaPorTipoPrecio();
    }
}

// --- STREAMING_CHUNK: Caminantes Management ---