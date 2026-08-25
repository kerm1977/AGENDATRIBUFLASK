async function generarFactura() {
    const cam = caminatas.find(c => c.id === currentCaminataId);
    if (!cam) return;
    const pasId = document.getElementById('caminante-id').value;
    const pas = cam.pasajeros ? cam.pasajeros.find(p => p.id === pasId) : null;
    const mostrarDescReversion = document.getElementById('cam-usu-mostrar-desc-reversion').checked;
    const mostrarDescPago = document.getElementById('cam-usu-mostrar-desc-pago').checked;
    const mostrarReversiones = document.getElementById('cam-usu-mostrar-reversiones').checked;
    const mostrarPagosActivos = document.getElementById('cam-usu-mostrar-pagos-activos').checked;
    const dolarizar = document.getElementById('cam-usu-dolarizar').checked;
    const tipoCambioDolar = Number(document.getElementById('cam-usu-tipo-cambio-dolar').value) || 1;
    const nombre = document.getElementById('cam-usu-nombre').value || 'Caminante';
    const sym = dolarizar ? '$' : (cam.moneda || '₡');
    const cv = (monto) => dolarizar ? (Number(monto || 0) / tipoCambioDolar).toFixed(2) : (monto || 0);
    const fechaLugarTexto = cam.tipo === 'Local'
        ? formatDateString(cam.fechaLocal)
        : `Ida: ${formatDateString(cam.fechaIda)} - Regreso: ${formatDateString(cam.fechaRegreso)}`;

    const totalPagado = (pas && pas.historialMontos)
        ? pas.historialMontos.filter(i => !i.reversado).reduce((s, i) => s + Number(i.monto || 0), 0)
        : 0;
    let historialHtml = '';
    if (pas && pas.historialMontos && pas.historialMontos.length > 0) {
        pas.historialMontos.forEach(item => {
            if (item.reversado && !mostrarReversiones) return;
            if (!item.reversado && !mostrarPagosActivos) return;
            const descPago = !item.reversado && mostrarDescPago && item.descripcionPago
                ? ` - ${item.descripcionPago}`
                : '';
            const formaPago = !item.reversado && item.formaPago
                ? ` [${item.formaPago}]`
                : '';
            const monedaExtra = !dolarizar && !item.reversado && item.monedaPago === 'Dólares' && item.tipoCambio
                ? ` - USD ${item.montoOriginal} × ${item.tipoCambio}`
                : '';
            const fechaEditPago = !item.reversado && mostrarDescPago && item.fechaEdicionPago
                ? ` - editado: ${escapeHtml(item.fechaEdicionPago)}`
                : '';
            let detalleTercero = '';
            if (!item.reversado && item.pagadoPor && item.pagadoPor !== nombre) {
                detalleTercero = ` (por ${escapeHtml(item.pagadoPor)})`;
            }
            if (!item.reversado && item.destinoPago) {
                const destino = cam.pasajeros.find(p => p.id === item.destinoPago);
                const destinoNombre = destino ? destino.nombre : 'otro';
                detalleTercero = ` (a ${escapeHtml(destinoNombre)} por ${escapeHtml(item.pagadoPor || 'alguien')})`;
            }
            const estadoPagoFactura = !item.reversado && (item.estadoPago || item.abonos)
                ? ` <span class="badge bg-light text-secondary border" style="font-size:0.65rem;">${item.estadoPago || ''}${item.abonos ? ' / ' + item.abonos : ''}</span>`
                : '';
            const montoFecha = item.reversado
                ? `<del>${sym}${cv(item.monto)} - ${item.fecha}</del>`
                : `${sym}${cv(item.monto)} - ${item.fecha}${monedaExtra}${formaPago}${descPago}${fechaEditPago}${estadoPagoFactura}${detalleTercero}`;
            const fechaEdit = mostrarDescReversion && item.fechaEdicionReversion
                ? ` - editado: ${escapeHtml(item.fechaEdicionReversion)}`
                : '';
            const descRev = mostrarDescReversion && item.descripcionReversion
                ? ` - ${escapeHtml(item.descripcionReversion)}`
                : '';
            const estado = item.reversado
                ? `<span class="text-danger">(reversado${descRev}${fechaEdit})</span>`
                : '<span class="text-success">activo</span>';
            historialHtml += `
                <div class="d-flex justify-content-between small text-muted border-bottom py-1">
                    <span>${montoFecha} ${estado}</span>
                </div>
            `;
        });
    } else {
        historialHtml = '<p class="small text-muted mb-0">No hay registros de pago.</p>';
    }

    const saldo = Number(cam.precio || 0) - totalPagado;
    const cancelado = totalPagado >= Number(cam.precio || 0);

    const consecutivo = String(consecutivoFactura).padStart(3, '0');
    consecutivoFactura++;
    await saveData();

    const sello = cancelado ? '<div class="watermark">CANCELADO</div>' : '';

    const body = document.getElementById('factura-body');
    body.innerHTML = `
        <div class="text-end small text-muted mb-2">#${consecutivo}</div>
        ${sello}
        <div class="text-center mb-3">
            <h5 class="fw-bold mb-0">${cam.nombre}</h5>
            ${cam.provincia ? `<small class="text-muted d-block">Provincia: ${escapeHtml(cam.provincia)}</small>` : ''}
            <small class="text-muted">Respaldo de pago</small>
        </div>
        <p class="small mb-1"><strong>Participante:</strong> ${escapeHtml(nombre)}</p>
        <p class="small mb-1"><strong>Fecha del lugar:</strong> ${fechaLugarTexto}</p>
        <p class="small mb-1"><strong>Fecha límite de reserva:</strong> ${formatDateString(cam.reservaFecha)}</p>
        <p class="small mb-1"><strong>Moneda:</strong> ${sym}</p>
        ${document.getElementById('cam-usu-nota-publica').checked && pas && pas.nota ? `<p class="small mb-1"><strong>Nota:</strong> ${escapeHtml(pas.nota.replace(/<[^>]*>/g, ''))}</p>` : ''}
        <hr class="my-2">
        <div class="d-flex justify-content-between small fw-bold">
            <span>Precio total del paquete</span>
            <span>${sym}${cv(cam.precio)}</span>
        </div>
        <div class="d-flex justify-content-between small text-muted">
            <span>Monto de reserva</span>
            <span>${sym}${cv(cam.reservaMonto)}</span>
        </div>
        <div class="d-flex justify-content-between small fw-bold mt-2">
            <span>Total pagado</span>
            <span>${sym}${cv(totalPagado)}</span>
        </div>
        <div class="d-flex justify-content-between small fw-bold ${saldo > 0 ? 'text-danger' : 'text-success'}">
            <span>Saldo pendiente</span>
            <span>${sym}${cv(Math.max(0, saldo))}</span>
        </div>
        <hr class="my-2">
        <p class="small fw-bold mb-1">Historial de pagos</p>
        ${historialHtml}
        <p class="text-center small text-muted mt-3 mb-0" style="font-size: 0.65rem;">Hecho con <i class="fas fa-heart text-danger"></i> por La Tribu de Los Libres</p>
        ${cancelado ? `<p class="text-center small text-success mt-2 mb-0">Gracias ${escapeHtml(nombre)}, por haberse unido a una aventura más con La Tribu de Los Libres.</p>` : ''}
    `;

    modalFactura.show();
}
