function renderHistorialMontos(historial) {
    const cont = document.getElementById('historial-montos');
    const totalDiv = document.getElementById('cam-usu-total-recogido');
    cont.innerHTML = '';
    let total = 0;
    const cam = caminatas.find(c => c.id === currentCaminataId);
    const sym = cam ? (cam.moneda || '₡') : '₡';
    const nombre = document.getElementById('cam-usu-nombre').value || 'el caminante';

    if (historial && historial.length > 0) {
        historial.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'd-flex flex-column w-100 badge bg-light text-secondary border p-1';
            row.style.fontSize = '0.7rem';
            row.style.opacity = '0.5';

            const header = document.createElement('div');
            header.className = 'd-flex justify-content-between align-items-start w-100';
            header.style.flexWrap = 'wrap';

            const texto = document.createElement('span');
            texto.style.wordBreak = 'break-word';
            texto.style.whiteSpace = 'normal';
            texto.style.maxWidth = '100%';
            if (item.reversado) {
                const desc = item.descripcionReversion ? ` - ${item.descripcionReversion}` : '';
                const fechaEdit = item.fechaEdicionReversion ? ` (editado: ${item.fechaEdicionReversion})` : '';
                texto.innerHTML = `<del>${item.monto} - ${item.fecha}</del> <span class="text-danger">(reversado${desc}${fechaEdit})</span>`;
                texto.title = 'Doble clic para editar la descripción de reversión';
                texto.style.cursor = 'pointer';
                texto.ondblclick = () => editarDescripcionReversion(index);
            } else {
                const descPago = item.descripcionPago ? ` - ${item.descripcionPago}` : '';
                const formaPago = item.formaPago ? ` [${item.formaPago}]` : '';
                const monedaExtra = item.monedaPago === 'Dólares' && item.tipoCambio
                    ? ` (USD ${item.montoOriginal} × ${item.tipoCambio})`
                    : '';
                const fechaEditPago = item.fechaEdicionPago ? ` (editado: ${item.fechaEdicionPago})` : '';
                let detallePago = '';
                if (item.pagadoPor && item.pagadoPor !== nombre) {
                    detallePago = ` <span class="text-info">(Pagado por ${escapeHtml(item.pagadoPor)})</span>`;
                }
                if (item.destinoPago) {
                    const destino = cam && cam.pasajeros ? cam.pasajeros.find(p => p.id === item.destinoPago) : null;
                    const destinoNombre = destino ? destino.nombre : 'otro caminante';
                    detallePago = ` <span class="text-info">(Pago a ${escapeHtml(destinoNombre)} por ${escapeHtml(item.pagadoPor || 'alguien')})</span>`;
                }
                const estadoAbono = (item.estadoPago || item.estado || '') + (item.abonos ? ` / ${item.abonos}` : '');
                texto.innerHTML = `${item.monto} - ${item.fecha}${formaPago}${monedaExtra}${descPago}${fechaEditPago} <span class="badge bg-light text-secondary border" style="font-size:0.65rem;">${estadoAbono}</span>${detallePago}`;
                texto.title = 'Doble clic para editar la descripción de pago';
                texto.style.cursor = 'pointer';
                texto.ondblclick = () => editarPago(index);
                total += Number(item.monto || 0);
            }

            const acciones = document.createElement('span');
            acciones.style.flexShrink = '0';
            acciones.style.marginLeft = '0.5rem';
            if (!item.reversado) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-link p-0 text-muted';
                btn.title = 'Reversar / Devolución';
                btn.style.fontSize = '0.7rem';
                btn.onclick = () => reversarMonto(index);
                btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                acciones.appendChild(btn);
            }

            header.appendChild(texto);
            header.appendChild(acciones);
            row.appendChild(header);

            cont.appendChild(row);
        });
    }

    if (totalDiv) {
        const precio = Number(cam ? cam.precio || 0 : 0);
        const excedente = total - precio;
        const excedenteHtml = excedente > 0
            ? `<br><span class="text-success small">Pagó de más: ${sym}${excedente}</span>`
            : '';
        totalDiv.innerHTML = `Total recogido hasta el momento de ${nombre}: ${sym}${total}${excedenteHtml}`;
    }
}

async function openCaminanteModal(caminanteId = null) {
    document.getElementById('form-caminante').reset();
    document.getElementById('cam-usu-nota').innerHTML = ''; // Limpiar nota HTML
    document.getElementById('name-error').style.display = 'none';
    document.getElementById('suggestions-list').style.display = 'none';

    const divOpciones = document.getElementById('opciones-caminante');
    const cam = caminatas.find(c => c.id === currentCaminataId);

    // Llenar select de destino de pago
    const selectOtro = document.getElementById('cam-usu-otro-caminante');
    if (selectOtro) {
        selectOtro.innerHTML = '';
        if (cam && cam.pasajeros) {
            cam.pasajeros.forEach(p => {
                if (p.id !== caminanteId) {
                    const option = document.createElement('option');
                    option.value = p.id;
                    option.innerText = p.nombre;
                    selectOtro.appendChild(option);
                }
            });
        }
    }

    document.getElementById('cam-usu-pago-destino').value = 'este';
    document.getElementById('cam-usu-monto-actual').value = '';
    document.getElementById('cam-usu-monto-otro').value = '';
    togglePagoDestino();

    if (caminanteId) {
        // Modo Edición
        const camIndex = caminatas.findIndex(c => c.id === currentCaminataId);
        const pas = cam.pasajeros.find(p => p.id === caminanteId);

        await actualizarEstadoPagoPorMonto(camIndex, pas.id);
        
        document.getElementById('modalCaminanteLabel').innerText = 'Editar Caminante';
        document.getElementById('caminante-id').value = pas.id;
        document.getElementById('cam-usu-nombre').value = pas.nombre;
        document.getElementById('cam-usu-estado').value = pas.estado;
        document.getElementById('cam-usu-monto-cancelado').value = '';
        document.getElementById('cam-usu-nota').innerHTML = pas.nota || '';
        renderHistorialMontos(pas.historialMontos || []);

        // Configurar el interruptor de nota pública
        document.getElementById('cam-usu-nota-publica').checked = pas.notaPublica || false;
        document.getElementById('cam-usu-mostrar-desc-reversion').checked = pas.mostrarDescReversion !== false;
        document.getElementById('cam-usu-mostrar-desc-pago').checked = pas.mostrarDescPago !== false;
        document.getElementById('cam-usu-mostrar-reversiones').checked = pas.mostrarReversiones !== false;
        document.getElementById('cam-usu-mostrar-pagos-activos').checked = pas.mostrarPagosActivos !== false;
        document.getElementById('cam-usu-mostrar-total-lista').checked = pas.mostrarTotalEnLista !== false;
        document.getElementById('cam-usu-mostrar-saldo-pendiente').checked = pas.mostrarSaldoPendiente === true;
        document.getElementById('cam-usu-dolarizar').checked = pas.dolarizar === true;
        document.getElementById('cam-usu-tipo-cambio-dolar').value = pas.tipoCambioDolar || '';
        toggleDolarizar();

        // Mapeo automático de R+X a Ab+X para compatibilidad retroactiva en el dropdown
        let currentAbono = pas.abonos || '';
        currentAbono = currentAbono.replace('R+', 'Ab+');
        checkAbonoByEstado();
        document.getElementById('cam-usu-abonos').value = currentAbono; 
        
        divOpciones.classList.remove('d-none');
    } else {
        // Modo Nuevo
        document.getElementById('modalCaminanteLabel').innerText = 'Agregar Caminante';
        document.getElementById('caminante-id').value = '';
        document.getElementById('cam-usu-abonos').value = '';
        document.getElementById('cam-usu-monto-cancelado').value = '';
        document.getElementById('cam-usu-estado').value = 'pendiente'; // Por defecto pendiente ahora
        checkAbonoByEstado();
        document.getElementById('cam-usu-nota-publica').checked = false; // Privada por defecto al crear
        document.getElementById('cam-usu-mostrar-desc-reversion').checked = true;
        document.getElementById('cam-usu-mostrar-desc-pago').checked = true;
        document.getElementById('cam-usu-mostrar-reversiones').checked = true;
        document.getElementById('cam-usu-mostrar-pagos-activos').checked = true;
        document.getElementById('cam-usu-mostrar-total-lista').checked = true;
        document.getElementById('cam-usu-mostrar-saldo-pendiente').checked = false;
        document.getElementById('cam-usu-dolarizar').checked = false;
        document.getElementById('cam-usu-tipo-cambio-dolar').value = '';
        toggleDolarizar();
        renderHistorialMontos([]);
        divOpciones.classList.add('d-none');
    }

    modalCaminante.show();
}
