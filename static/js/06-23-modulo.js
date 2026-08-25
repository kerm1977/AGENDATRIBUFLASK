function normalizarRetiro(r) {
    return {
        ...r,
        nombre: r.nombre || '',
        camNombre: r.camNombre || '',
        camId: r.camId || '',
        fecha: r.fecha || ''
    };
}

function normalizarConfigTema(ct) {
    const base = {
        tituloApp: TITULO_APP_DEFECTO,
        tituloDirectorio: TITULO_DIRECTORIO_DEFECTO,
        gruposPersonalizados: [],
        temaColor: 'naranja',
        formasPago: { sinpe: [...FORMAS_PAGO_DEFAULT.sinpe], cuentas: [...FORMAS_PAGO_DEFAULT.cuentas] },
        equipoRequerido: [...EQUIPO_REQUERIDO_DEFAULT],
        instrucciones: JSON.parse(JSON.stringify(INSTRUCCIONES_DEFAULT))
    };
    if (!ct) return base;
    return {
        ...ct,
        tituloApp: ct.tituloApp || base.tituloApp,
        tituloDirectorio: ct.tituloDirectorio || base.tituloDirectorio,
        gruposPersonalizados: Array.isArray(ct.gruposPersonalizados) ? [...ct.gruposPersonalizados] : base.gruposPersonalizados,
        temaColor: ct.temaColor || base.temaColor,
        formasPago: {
            sinpe: (ct.formasPago && Array.isArray(ct.formasPago.sinpe)) ? [...ct.formasPago.sinpe] : [...base.formasPago.sinpe],
            cuentas: (ct.formasPago && Array.isArray(ct.formasPago.cuentas)) ? [...ct.formasPago.cuentas] : [...base.formasPago.cuentas]
        },
        equipoRequerido: Array.isArray(ct.equipoRequerido) ? [...ct.equipoRequerido] : base.equipoRequerido,
        instrucciones: {
            otrasRecomendaciones: (ct.instrucciones && Array.isArray(ct.instrucciones.otrasRecomendaciones)) ? [...ct.instrucciones.otrasRecomendaciones] : [...base.instrucciones.otrasRecomendaciones],
            normasGenerales: (ct.instrucciones && Array.isArray(ct.instrucciones.normasGenerales)) ? [...ct.instrucciones.normasGenerales] : [...base.instrucciones.normasGenerales],
            indicacionesSeguridad: (ct.instrucciones && Array.isArray(ct.instrucciones.indicacionesSeguridad)) ? [...ct.instrucciones.indicacionesSeguridad] : [...base.instrucciones.indicacionesSeguridad]
        }
    };
}

// NO MODIFICAR: Respaldo completo con todos los campos
function obtenerRespaldoCompleto() {
    return {
        caminatas: (caminatas || []).map(c => normalizarCaminata(c)),
        personasGlobales: [...(personasGlobales || [])],
        directorioPersonas: (directorioPersonas || []).map(p => normalizarDirectorioPersona(p)),
        notas: (notas || []).map(n => normalizarNota(n)),
        consecutivoFactura: consecutivoFactura || 1,
        preciosBuseta: (preciosBuseta || []).map(p => normalizarPrecioBuseta(p)),
        ultimoRespaldo: ultimoRespaldo || 0,
        historialRetiros: (historialRetiros || []).map(r => normalizarRetiro(r)),
        preferenciasCumpleanos: obtenerPreferenciasCumpleanos() || {},
        configTema: normalizarConfigTema(configTema),
        exportDate: new Date().toISOString()
    };
}

function exportData() {
    const dataToExport = obtenerRespaldoCompleto();

    const content = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Respaldo_Caminatas_${dateStr}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportDataWhatsApp() {
    const dataToExport = obtenerRespaldoCompleto();

    const content = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Respaldo_Caminatas_${dateStr}.json`;
    const file = new File([blob], fileName, { type: 'application/json' });

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Respaldo Caminatas',
                text: 'Respaldo completo de la aplicación Caminatas de la Tribu de Los Libres',
                files: [file]
            });
            showToast('Respaldo listo para compartir', 'success');
            return;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error compartiendo:', err);
            }
        }
    }

    // Fallback: descargar el archivo para que lo comparta manualmente
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('No se pudo compartir automáticamente. Se descargó el archivo; compartilo manualmente.', 'warning');
}

// NO MODIFICAR: Función para exportar respaldo completo a TXT (contiene JSON exacto para importación)
function exportarRespaldoTXT() {
    const dataToExport = obtenerRespaldoCompleto();
    const content = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Respaldo_Caminatas_${dateStr}.txt`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Respaldo TXT completo exportado (contiene JSON)', 'success');
}

function mergeByIdOrProps(existing, incoming, props = ['id']) {
    const result = [...(existing || [])];
    if (!incoming || !Array.isArray(incoming)) return result;
    incoming.forEach(item => {
        if (!item || typeof item !== 'object') return;
        const exists = result.some(e => props.every(p => e[p] === item[p]));
        if (!exists) result.push(item);
    });
    return result;
}
