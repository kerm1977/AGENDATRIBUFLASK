function mergeUniqueStrings(existing, incoming) {
    const set = new Set(existing || []);
    (incoming || []).forEach(s => { if (s) set.add(s); });
    return Array.from(set);
}

// NO MODIFICAR: Fusión de caminatas importadas
function mergeCaminatas(existing, incoming) {
    const result = [...(existing || [])];
    if (!incoming || !Array.isArray(incoming)) return result;
    incoming.forEach(cam => {
        if (!cam) return;
        const existsById = result.some(c => c.id === cam.id);
        if (existsById) return;
        const existsByData = result.some(c =>
            c.id !== cam.id &&
            c.nombre === cam.nombre &&
            (c.fechaLocal === cam.fechaLocal || c.fechaIda === cam.fechaIda) &&
            c.tipo === cam.tipo
        );
        if (existsByData) return;

        // Normalizar campos de respaldos antiguos
        if (!cam.lugaresRecoger && cam.recoger) {
            cam.lugaresRecoger = String(cam.recoger).split(',').map(l => l.trim()).filter(Boolean);
        }
        if (!Array.isArray(cam.lugaresRecoger)) cam.lugaresRecoger = [];
        if (cam.incluye === undefined) cam.incluye = [];
        if (cam.formasPago === undefined) cam.formasPago = [];
        if (cam.otrosDescripcion === undefined) cam.otrosDescripcion = '';
        if (cam.horaSalida === undefined) cam.horaSalida = '';
        if (cam.lugarSalida === undefined) cam.lugarSalida = '';
        if (cam.notasAdicionales === undefined) cam.notasAdicionales = '';
        if (!cam.equipo || !Array.isArray(cam.equipo)) {
            cam.equipo = (configTema.equipoRequerido || []).map(item => ({ item, estado: 'Si' }));
        }
        if (!cam.pasajeros || !Array.isArray(cam.pasajeros)) cam.pasajeros = [];
        cam.pasajeros.forEach(p => {
            if (!p.id) p.id = Date.now().toString();
            if (!p.estado) p.estado = 'pendiente';
            if (!p.abonos) p.abonos = '';
            if (!p.historialMontos) p.historialMontos = [];
            if (p.nota === undefined) p.nota = '';
            if (p.notaPublica === undefined) p.notaPublica = false;
            if (p.mostrarTotalEnLista === undefined) p.mostrarTotalEnLista = true;
        });

        if (cam.dificultad === undefined) cam.dificultad = '';
        if (cam.kilometros === undefined) cam.kilometros = '';
        if (cam.modoTransporte === undefined) cam.modoTransporte = 'Terrestre';
        if (cam.aerolinea === undefined) cam.aerolinea = '';
        if (cam.tieneVuelo === undefined) cam.tieneVuelo = false;
        if (cam.tieneFechaVuelo === undefined) cam.tieneFechaVuelo = false;
        if (cam.numeroVuelo === undefined) cam.numeroVuelo = '';
        if (cam.vueloFechaSalida === undefined) cam.vueloFechaSalida = '';
        if (cam.vueloHoraSalida === undefined) cam.vueloHoraSalida = '';
        if (cam.vueloFechaRegreso === undefined) cam.vueloFechaRegreso = '';
        if (cam.vueloHoraRegreso === undefined) cam.vueloHoraRegreso = '';
        if (cam.incluirVueloWhatsApp === undefined) cam.incluirVueloWhatsApp = false;
        if (!Array.isArray(cam.urls)) cam.urls = (cam.url ? [cam.url] : []);
        if (cam.mostrarIncluye === undefined) cam.mostrarIncluye = true;
        if (cam.mostrarFormasPago === undefined) cam.mostrarFormasPago = true;
        if (cam.mostrarInstrucciones === undefined) cam.mostrarInstrucciones = true;
        if (cam.mostrarUrls === undefined) cam.mostrarUrls = true;
        if (cam.mostrarCaminantes === undefined) cam.mostrarCaminantes = true;

        result.push(cam);
    });
    return result;
}

function mergeConfigTema(existing, incoming) {
    const merged = { ...existing, ...incoming };
    if (!incoming) return merged;

    if (merged.tituloApp === TITULO_APP_DEFECTO && incoming.tituloApp) merged.tituloApp = incoming.tituloApp;
    if (merged.tituloDirectorio === TITULO_DIRECTORIO_DEFECTO && incoming.tituloDirectorio) merged.tituloDirectorio = incoming.tituloDirectorio;
    if (merged.temaColor === 'naranja' && incoming.temaColor) merged.temaColor = incoming.temaColor;

    merged.gruposPersonalizados = mergeUniqueStrings(merged.gruposPersonalizados, incoming.gruposPersonalizados);

    merged.formasPago = {
        sinpe: mergeUniqueStrings(merged.formasPago && merged.formasPago.sinpe, incoming.formasPago && incoming.formasPago.sinpe),
        cuentas: mergeUniqueStrings(merged.formasPago && merged.formasPago.cuentas, incoming.formasPago && incoming.formasPago.cuentas)
    };

    merged.equipoRequerido = mergeUniqueStrings(merged.equipoRequerido, incoming.equipoRequerido);

    const ins = merged.instrucciones || { otrasRecomendaciones: [], normasGenerales: [], indicacionesSeguridad: [] };
    const inIns = (incoming.instrucciones || {});
    merged.instrucciones = {
        otrasRecomendaciones: mergeUniqueStrings(ins.otrasRecomendaciones, inIns.otrasRecomendaciones),
        normasGenerales: mergeUniqueStrings(ins.normasGenerales, inIns.normasGenerales),
        indicacionesSeguridad: mergeUniqueStrings(ins.indicacionesSeguridad, inIns.indicacionesSeguridad)
    };

    return merged;
}

function mergePreferenciasCumpleanos(existing, incoming) {
    if (!incoming) return;
    Object.entries(incoming).forEach(([key, value]) => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, value);
        }
    });
}

// NO MODIFICAR: Importación de respaldos completa