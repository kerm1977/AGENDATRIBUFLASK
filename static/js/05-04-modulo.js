function actualizarMonedaPorTipoPrecio() {
    const actividad = document.getElementById('cam-actividad').value;
    const precio = document.getElementById('cam-precio').value;
    const monedaSelect = document.getElementById('cam-moneda');
    if (!monedaSelect) return;

    if (actividad === 'Internacional') {
        if (precio.length <= 3 && Number(precio) > 0) {
            monedaSelect.value = '$';
        } else if (precio.length > 3) {
            monedaSelect.value = '₡';
        }
    }
    updateCurrencySymbols();
}

function togglePagoDestino() {
    const tipo = document.getElementById('cam-usu-pago-destino').value;
    const otroContainer = document.getElementById('cam-usu-otro-container');
    const personalizadoContainer = document.getElementById('cam-usu-montos-personalizado');

    if (tipo === 'este') {
        otroContainer.classList.add('d-none');
        personalizadoContainer.classList.add('d-none');
    } else if (tipo === 'otro') {
        otroContainer.classList.remove('d-none');
        personalizadoContainer.classList.add('d-none');
    } else if (tipo === 'mitad') {
        otroContainer.classList.remove('d-none');
        personalizadoContainer.classList.add('d-none');
        calcularMontosDivididos();
    } else if (tipo === 'personalizado') {
        otroContainer.classList.remove('d-none');
        personalizadoContainer.classList.remove('d-none');
    }
}

function calcularMontosDivididos() {
    const total = Number(document.getElementById('cam-usu-monto-cancelado').value) || 0;
    const tipo = document.getElementById('cam-usu-pago-destino').value;
    const montoActualInput = document.getElementById('cam-usu-monto-actual');
    const montoOtroInput = document.getElementById('cam-usu-monto-otro');

    if (tipo === 'mitad') {
        montoActualInput.value = Math.floor(total / 2);
        montoOtroInput.value = Math.ceil(total / 2);
    }
}

function calcularMontoOtro() {
    const total = Number(document.getElementById('cam-usu-monto-cancelado').value) || 0;
    const actual = Number(document.getElementById('cam-usu-monto-actual').value) || 0;
    document.getElementById('cam-usu-monto-otro').value = Math.max(0, total - actual);
}

function calcularMontoActual() {
    const total = Number(document.getElementById('cam-usu-monto-cancelado').value) || 0;
    const otro = Number(document.getElementById('cam-usu-monto-otro').value) || 0;
    document.getElementById('cam-usu-monto-actual').value = Math.max(0, total - otro);
}

function toTitleCase(str) {
    if (!str) return str;
    return str.toLowerCase().replace(/(?:^|\s)\S/g, m => m.toUpperCase());
}

function toggleDetallesVuelo() {
    const tieneVuelo = document.getElementById('cam-tiene-vuelo')?.checked;
    const numeroContainer = document.getElementById('cam-numero-vuelo-container');
    const tieneFecha = document.getElementById('cam-tiene-fecha-vuelo')?.checked;
    const fechasContainer = document.getElementById('cam-fechas-vuelo-container');

    if (numeroContainer) numeroContainer.classList.toggle('d-none', !tieneVuelo);
    if (fechasContainer) fechasContainer.classList.toggle('d-none', !tieneFecha);
}

function toggleLugarSalidaAeropuerto() {
    const actividad = document.getElementById('cam-actividad').value;
    const tieneLugarSalida = document.getElementById('cam-tiene-lugar-salida')?.checked;
    const lugarContainer = document.getElementById('cam-lugar-salida-container');
    const lugaresRecogerContainer = document.getElementById('cam-lugares-recoger-container');
    const lugarSelect = document.getElementById('cam-lugar-salida');

    if (actividad !== 'Internacional') {
        if (lugarContainer) lugarContainer.classList.remove('d-none');
        if (lugaresRecogerContainer) lugaresRecogerContainer.classList.remove('d-none');
        return;
    }

    if (tieneLugarSalida) {
        if (lugarContainer) lugarContainer.classList.remove('d-none');
        if (lugaresRecogerContainer) lugaresRecogerContainer.classList.remove('d-none');
        if (lugarSelect && lugarSelect.value === 'Cada quien llega por sus propios medios') lugarSelect.value = '';
    } else {
        if (lugarContainer) lugarContainer.classList.add('d-none');
        if (lugaresRecogerContainer) lugaresRecogerContainer.classList.add('d-none');
        if (lugarSelect) lugarSelect.value = 'Cada quien llega por sus propios medios';
        if (document.getElementById('cam-lugares-recoger')) document.getElementById('cam-lugares-recoger').value = '';
    }
}

function togglePaisCaminata() {
    const actividad = document.getElementById('cam-actividad').value;
    const pais = document.getElementById('cam-pais').value;
    const modoTransporte = document.getElementById('cam-modo-transporte')?.value || 'Terrestre';
    const aerolineaContainer = document.getElementById('cam-aerolinea-container');
    const modoTransporteContainer = document.getElementById('cam-modo-transporte-container');
    const busetaMini = document.getElementById('buseta-mini-form');
    const usarBuseta = document.getElementById('cam-usar-buseta');
    const aerolinea = document.getElementById('cam-aerolinea');

    if (actividad !== 'Internacional') {
        aerolineaContainer.classList.add('d-none');
        if (modoTransporteContainer) modoTransporteContainer.classList.add('d-none');
        if (aerolinea) aerolinea.value = '';
        busetaMini.classList.remove('d-none');
        if (usarBuseta) toggleBusetaSection(usarBuseta);
        else toggleBusetaSection({ checked: true });
        toggleDetallesVuelo();
        toggleLugarSalidaAeropuerto();
        return;
    }

    if (modoTransporteContainer) modoTransporteContainer.classList.remove('d-none');

    if (modoTransporte === 'Terrestre') {
        aerolineaContainer.classList.add('d-none');
        if (aerolinea) aerolinea.value = '';
        busetaMini.classList.remove('d-none');
        if (usarBuseta) { usarBuseta.checked = true; toggleBusetaSection(usarBuseta); }
        else toggleBusetaSection({ checked: true });
    } else {
        busetaMini.classList.add('d-none');
        aerolineaContainer.classList.remove('d-none');
        if (usarBuseta) { usarBuseta.checked = false; toggleBusetaSection(usarBuseta); }
        else toggleBusetaSection({ checked: false });
    }

    toggleDetallesVuelo();
    toggleLugarSalidaAeropuerto();
}
