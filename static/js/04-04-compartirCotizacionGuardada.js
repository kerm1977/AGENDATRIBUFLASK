function compartirCotizacionGuardada(id) {
    const cot = cotizacionesGuardadas.find(c => c.id === id);
    if (!cot) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(cot.mensaje)}`, '_blank');
}

function cambiarEstadoEquipoRequerido(index, nuevoEstado) {
    if (!configTema.equipoRequerido || !configTema.equipoRequerido[index]) return;
    const eq = configTema.equipoRequerido[index];
    if (typeof eq === 'string') {
        configTema.equipoRequerido[index] = { item: eq, estado: nuevoEstado };
    } else {
        eq.estado = nuevoEstado;
    }
    saveData();
    renderInstruccionesAjustes();
}

function agregarEquipoRequerido() {
    const input = document.getElementById('ajustes-nuevo-equipo');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    const existe = (configTema.equipoRequerido || []).some(e => (typeof e === 'object' ? e.item : e) === val);
    if (existe) {
        showToast('Ese ítem ya existe', 'warning');
        return;
    }
    configTema.equipoRequerido = configTema.equipoRequerido || [];
    configTema.equipoRequerido.push({ item: val, estado: 'Si' });
    input.value = '';
    saveData();
    renderInstruccionesAjustes();
    showToast('Equipo agregado', 'success');
}

function eliminarEquipoRequerido(index) {
    if (!configTema.equipoRequerido || !configTema.equipoRequerido[index]) return;
    const eq = configTema.equipoRequerido[index];
    const item = typeof eq === 'object' ? eq.item : eq;

    showConfirm(
        `1/3 - Eliminar equipo`,
        `¿Estás seguro de que querés borrar este ítem del equipo requerido?\n\n"${item}"`,
        () => {
            showConfirm(
                `2/3 - Advertencia`,
                `Esta acción no se puede deshacer. La información no se puede recuperar. ¿Continuar?`,
                () => {
                    showConfirm(
                        `3/3 - Confirmación final`,
                        `¿Borrar definitivamente este ítem del equipo requerido?`,
                        () => {
                            configTema.equipoRequerido.splice(index, 1);
                            saveData();
                            renderInstruccionesAjustes();
                            showToast('Equipo eliminado', 'success');
                        },
                        'Sí, borrar'
                    );
                },
                'Sí, continuar'
            );
        },
        'Sí, estoy seguro'
    );
}

function openWhatsAppPreview() {
    const cam = caminatas.find(c => c.id === currentCaminataId);
    if (!cam) {
        showToast("Caminata no encontrada", "warning");
        return;
    }

    currentWhatsAppText = generarMensajeWhatsApp(cam);
    document.getElementById('whatsapp-text-preview').innerText = currentWhatsAppText;
    modalWhatsApp.show();
}

function copyToClipboard() {
    if (!currentWhatsAppText) return;
    navigator.clipboard.writeText(currentWhatsAppText).then(() => {
        showToast("Mensaje copiado al portapapeles");
    }).catch(() => {
        showToast("No se pudo copiar", "danger");
    });
}

function enviarPorWhatsApp() {
    const cam = caminatas.find(c => c.id === currentCaminataId);
    if (!cam) {
        showToast("Caminata no encontrada", "warning");
        return;
    }
    const texto = generarMensajeWhatsApp(cam);
    const encodedText = encodeURIComponent(texto);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
}

// === FIN MÓDULO JS: AJUSTES ===
