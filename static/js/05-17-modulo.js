async function actualizarEstadoPagoPorMonto(camIndex, pasId) {
    const cam = caminatas[camIndex];
    const pas = cam.pasajeros ? cam.pasajeros.find(p => p.id === pasId) : null;
    if (!pas || !pas.historialMontos) return;
    const totalPagado = pas.historialMontos
        .filter(i => !i.reversado)
        .reduce((s, i) => s + Number(i.monto || 0), 0);

    const precio = Number(cam.precio || 0);
    const reservaMonto = Number(cam.reservaMonto || 0);

    // Si alcanzó el precio total, queda cancelado
    if (totalPagado >= precio && precio) {
        pas.estado = 'cancelado';
        pas.abonos = '';
    } else if (totalPagado >= reservaMonto && reservaMonto) {
        // Si pagó al menos la reserva, pasa a reservado
        // pero deja que el administrador elija si pone 'R' o nada en abonos
        pas.estado = 'reservado';
    }

    await saveData();
}

function ajustarCantidadBusetas(camIndex) {
    const cam = caminatas[camIndex];
    if (!cam || cam.usarBuseta === false) return;
    const total = (cam.pasajeros || []).length;
    let cantidad = 1;
    if (total > 31) cantidad = 3;
    else if (total > 17) cantidad = 2;
    cam.cantidadBuses = String(cantidad);
    const input = document.getElementById('cam-cantidad-busetas');
    if (input) input.value = String(cantidad);
    updateTotalTransporte();
    updateDeudaPorPersona();
    updateDineroARecoger();
}

async function saveCaminante() {
    const nombreInput = document.getElementById('cam-usu-nombre');
    const nombre = nombreInput.value.trim();
    const estado = document.getElementById('cam-usu-estado').value;
    const abonos = document.getElementById('cam-usu-abonos').value;
    const montoNuevo = document.getElementById('cam-usu-monto-cancelado').value;
    const tipoDestino = document.getElementById('cam-usu-pago-destino').value;
    const destinoPago = document.getElementById('cam-usu-otro-caminante').value;
    const montoActual = document.getElementById('cam-usu-monto-actual').value;
    const montoOtro = document.getElementById('cam-usu-monto-otro').value;
    const pasId = document.getElementById('caminante-id').value;
    const notaHtml = document.getElementById('cam-usu-nota').innerHTML;
    const notaPublica = document.getElementById('cam-usu-nota-publica').checked;
    const mostrarDescReversion = document.getElementById('cam-usu-mostrar-desc-reversion').checked;
    const mostrarDescPago = document.getElementById('cam-usu-mostrar-desc-pago').checked;
    const mostrarReversiones = document.getElementById('cam-usu-mostrar-reversiones').checked;
    const mostrarPagosActivos = document.getElementById('cam-usu-mostrar-pagos-activos').checked;
    const mostrarTotalEnLista = document.getElementById('cam-usu-mostrar-total-lista').checked;
    const mostrarSaldoPendiente = document.getElementById('cam-usu-mostrar-saldo-pendiente').checked;
    const dolarizar = document.getElementById('cam-usu-dolarizar').checked;
    const tipoCambioDolar = document.getElementById('cam-usu-tipo-cambio-dolar').value;

    if (dolarizar) {
        document.getElementById('dolarizar-tipo-cambio').classList.remove('d-none');
    } else {
        document.getElementById('dolarizar-tipo-cambio').classList.add('d-none');
    }

    if(!nombre) {
        showToast("El nombre es requerido", "danger");
        return;
    }

    // Validar que no tenga error activo
    if(document.getElementById('name-error').style.display === 'block') {
         showToast("Corrige el nombre antes de guardar", "danger");
         return;
    }

    const camIndex = caminatas.findIndex(c => c.id === currentCaminataId);
    if(camIndex === -1) return;

    if(!caminatas[camIndex].pasajeros) caminatas[camIndex].pasajeros = [];

    // Validación de Duplicados
    const nombreNormalizado = nombre.toLowerCase();
    const esDuplicado = caminatas[camIndex].pasajeros.some(p => p.nombre.toLowerCase() === nombreNormalizado && p.id !== pasId);

    if (esDuplicado) {
        showToast("Este caminante ya está en la lista", "danger");
        return;
    }

    const data = { nombre, estado, abonos, pasId, notaHtml, notaPublica, mostrarDescReversion, mostrarDescPago, mostrarReversiones, mostrarPagosActivos, mostrarTotalEnLista, mostrarSaldoPendiente, dolarizar, tipoCambioDolar };

    if (montoNuevo) {
        pendingSaveData = { ...data, montoNuevo, tipoDestino, destinoPago, montoActual, montoOtro };
        document.getElementById('pago-descripcion').value = '';
        document.getElementById('pago-forma').value = 'SINPE';
        document.getElementById('pago-moneda').value = 'Colones';
        document.getElementById('pago-tipo-cambio').value = '';
        document.getElementById('pago-tipo-cambio-container').classList.add('d-none');
        modalPago.show();
        return;
    }

    await guardarCaminante({ ...data, montoDataList: [] });
}

async function confirmarPago() {
    const descripcionPago = document.getElementById('pago-descripcion').value.trim();
    const formaPago = document.getElementById('pago-forma').value;

    if (pendingPagoIndex !== null) {
        const pasId = document.getElementById('caminante-id').value;
        const cam = caminatas.find(c => c.id === currentCaminataId);
        if (!cam || !pasId) return;
        const pas = cam.pasajeros.find(p => p.id === pasId);
        if (pas && pas.historialMontos && pas.historialMontos[pendingPagoIndex]) {
            pas.historialMontos[pendingPagoIndex].descripcionPago = descripcionPago;
            pas.historialMontos[pendingPagoIndex].formaPago = formaPago;
            pas.historialMontos[pendingPagoIndex].fechaEdicionPago = new Date().toLocaleString();
            await saveData();
            renderHistorialMontos(pas.historialMontos);
            const camIndex = caminatas.findIndex(c => c.id === currentCaminataId);
            await actualizarEstadoPagoPorMonto(camIndex, pasId);
        }
        pendingPagoIndex = null;
        modalPago.hide();
        return;
    }

    if (!pendingSaveData) return;
    const monedaPago = document.getElementById('pago-moneda').value;
    const tipoCambio = document.getElementById('pago-tipo-cambio').value;
    const tc = monedaPago === 'Dólares' ? Number(tipoCambio) : 1;
    if (monedaPago === 'Dólares' && !tc) {
        showToast("Ingrese el tipo de cambio", "danger");
        return;
    }

    const tipoDestino = pendingSaveData.tipoDestino || 'este';
    const montoNuevo = Number(pendingSaveData.montoNuevo) || 0;

    function crearMontoData(montoOriginal, destinoId) {
        let monto = Number(montoOriginal);
        if (monedaPago === 'Dólares') {
            monto = monto * tc;
        }
        return {
            monto: monto,
            montoOriginal: String(montoOriginal),
            monedaPago: monedaPago,
            tipoCambio: monedaPago === 'Dólares' ? tipoCambio : '',
            fecha: new Date().toLocaleString(),
            reversado: false,
            descripcionPago: descripcionPago || '',
            formaPago: formaPago,
            destinoPago: destinoId || '',
            pagadoPor: pendingSaveData.nombre || ''
        };
    }

    let montoDataList = [];

    if (tipoDestino === 'este' || tipoDestino === '') {
        montoDataList.push(crearMontoData(montoNuevo, ''));
    } else if (tipoDestino === 'otro') {
        montoDataList.push(crearMontoData(montoNuevo, pendingSaveData.destinoPago));
    } else if (tipoDestino === 'mitad') {
        const m1 = Math.floor(montoNuevo / 2);
        const m2 = Math.ceil(montoNuevo / 2);
        montoDataList.push(crearMontoData(m1, ''));
        montoDataList.push(crearMontoData(m2, pendingSaveData.destinoPago));
    } else if (tipoDestino === 'personalizado') {
        const m1 = Number(pendingSaveData.montoActual) || 0;
        const m2 = Number(pendingSaveData.montoOtro) || 0;
        if (m1 > 0) montoDataList.push(crearMontoData(m1, ''));
        if (m2 > 0) montoDataList.push(crearMontoData(m2, pendingSaveData.destinoPago));
    }

    await guardarCaminante({ ...pendingSaveData, montoDataList });
    modalPago.hide();
    pendingSaveData = null;
}
