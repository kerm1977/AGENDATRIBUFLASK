async function confirmarReversion() {
    if (pendingReversionIndex === null) return;
    const pasId = document.getElementById('caminante-id').value;
    const cam = caminatas.find(c => c.id === currentCaminataId);
    if (!cam || !pasId) return;
    const pas = cam.pasajeros.find(p => p.id === pasId);
    if (!pas || !pas.historialMontos || !pas.historialMontos[pendingReversionIndex]) return;

    const descripcion = document.getElementById('reversion-descripcion').value.trim();
    if (!pas.historialMontos[pendingReversionIndex].reversado) {
        pas.historialMontos[pendingReversionIndex].reversado = true;
    }
    pas.historialMontos[pendingReversionIndex].descripcionReversion = descripcion || 'Sin descripción';
    pas.historialMontos[pendingReversionIndex].fechaEdicionReversion = new Date().toLocaleString();

    await saveData();
    renderHistorialMontos(pas.historialMontos);
    const camIndex = caminatas.findIndex(c => c.id === currentCaminataId);
    await actualizarEstadoPagoPorMonto(camIndex, pasId);
    modalReversion.hide();
    pendingReversionIndex = null;
}
