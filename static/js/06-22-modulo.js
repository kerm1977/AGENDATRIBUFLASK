function iniciarRespaldoAutomatico() {
    verificarRespaldoAutomatico();
    setInterval(() => {
        verificarRespaldoAutomatico();
    }, 60 * 60 * 1000); // Revisar cada hora
    setInterval(actualizarCuentaRegresivaRespaldo, 60 * 1000); // Actualizar cuenta regresiva cada minuto
}

// Las preferencias de "no volver a ver este cumpleaños" viven en localStorage
// (separado de localforage). Se incluyen aquí para que el respaldo sea 100% completo.
function obtenerPreferenciasCumpleanos() {
    const obj = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cumple_no_ver_')) {
            obj[key] = localStorage.getItem(key);
        }
    }
    return obj;
}

function restaurarPreferenciasCumpleanos(obj) {
    if (!obj) return;
    Object.entries(obj).forEach(([key, value]) => localStorage.setItem(key, value));
}

// Cuando el dispositivo no soporta compartir archivos directamente (Web Share API),
// igual abrimos WhatsApp para que el usuario elija con quién enviarlo y adjunte
// manualmente el archivo que se acaba de descargar.
function normalizarMonto(m) {
    return {
        ...m,
        monto: m.monto || 0,
        montoOriginal: m.montoOriginal || '',
        monedaPago: m.monedaPago || 'Colones',
        tipoCambio: m.tipoCambio || '',
        fecha: m.fecha || '',
        reversado: m.reversado === true,
        descripcionPago: m.descripcionPago || '',
        formaPago: m.formaPago || '',
        destinoPago: m.destinoPago || '',
        pagadoPor: m.pagadoPor || '',
        abonos: m.abonos || '',
        estadoPago: m.estadoPago || '',
        descripcionReversion: m.descripcionReversion || '',
        fechaEdicionReversion: m.fechaEdicionReversion || '',
        fechaEdicionPago: m.fechaEdicionPago || ''
    };
}

function normalizarPasajero(p) {
    return {
        ...p,
        id: p.id || Date.now().toString(),
        nombre: p.nombre || '',
        estado: p.estado || 'pendiente',
        abonos: p.abonos || '',
        historialMontos: (p.historialMontos || []).map(m => normalizarMonto(m)),
        nota: p.nota || '',
        notaPublica: p.notaPublica === true,
        mostrarDescReversion: p.mostrarDescReversion !== false,
        mostrarDescPago: p.mostrarDescPago !== false,
        mostrarReversiones: p.mostrarReversiones !== false,
        mostrarPagosActivos: p.mostrarPagosActivos !== false,
        mostrarTotalEnLista: p.mostrarTotalEnLista !== false,
        mostrarSaldoPendiente: p.mostrarSaldoPendiente === true,
        dolarizar: p.dolarizar === true,
        tipoCambioDolar: p.tipoCambioDolar || '',
        asistencia: p.asistencia || ''
    };
}

// NO MODIFICAR: Normalización completa de caminatas
function normalizarCaminata(cam) {
    const pasajeros = (cam.pasajeros || []).map(p => normalizarPasajero(p));
    return {
        ...cam,
        id: cam.id || '',
        nombre: cam.nombre || '',
        provincia: cam.provincia || '',
        tipo: cam.tipo || 'Local',
        actividad: cam.actividad || 'Caminata',
        fechaLocal: cam.fechaLocal || '',
        fechaIda: cam.fechaIda || '',
        fechaRegreso: cam.fechaRegreso || '',
        moneda: cam.moneda || '₡',
        precio: cam.precio || '',
        reservaMonto: cam.reservaMonto || '',
        precioBuseta: cam.precioBuseta || '0',
        cantidadBuses: cam.cantidadBuses || '1',
        cantidadGuias: cam.cantidadGuias || '2',
        usarBuseta: cam.usarBuseta !== false,
        reservaFecha: cam.reservaFecha || '',
        horaSalida: cam.horaSalida || '',
        lugarSalida: cam.lugarSalida || '',
        url: cam.url || '',
        incluye: Array.isArray(cam.incluye) ? [...cam.incluye] : [],
        otrosDescripcion: cam.otrosDescripcion || '',
        formasPago: Array.isArray(cam.formasPago) ? [...cam.formasPago] : [],
        lugaresRecoger: Array.isArray(cam.lugaresRecoger) ? [...cam.lugaresRecoger] : (cam.recoger ? String(cam.recoger).split(',').map(l => l.trim()).filter(Boolean) : []),
        equipo: Array.isArray(cam.equipo) ? [...cam.equipo] : (configTema.equipoRequerido || []).map(item => ({ item, estado: 'Si' })),
        notasAdicionales: cam.notasAdicionales || '',
        pasajeros: pasajeros,

        dificultad: cam.dificultad || '',
        kilometros: cam.kilometros || '',
        modoTransporte: cam.modoTransporte || 'Terrestre',
        aerolinea: cam.aerolinea || '',
        tieneVuelo: cam.tieneVuelo === true,
        tieneFechaVuelo: cam.tieneFechaVuelo === true,
        numeroVuelo: cam.numeroVuelo || '',
        vueloFechaSalida: cam.vueloFechaSalida || '',
        vueloHoraSalida: cam.vueloHoraSalida || '',
        vueloFechaRegreso: cam.vueloFechaRegreso || '',
        vueloHoraRegreso: cam.vueloHoraRegreso || '',
        incluirVueloWhatsApp: cam.incluirVueloWhatsApp === true,
        urls: Array.isArray(cam.urls) ? [...cam.urls] : (cam.url ? [cam.url] : []),
        mostrarIncluye: cam.mostrarIncluye !== false,
        mostrarFormasPago: cam.mostrarFormasPago !== false,
        mostrarInstrucciones: cam.mostrarInstrucciones !== false,
        mostrarUrls: cam.mostrarUrls !== false,
        mostrarCaminantes: cam.mostrarCaminantes !== false
    };
}

function normalizarDirectorioPersona(p) {
    return {
        ...p,
        id: p.id || '',
        nombre: p.nombre || '',
        cedula: p.cedula || '',
        pasaporte: p.pasaporte || '',
        telefono: p.telefono || '',
        telefono2: p.telefono2 || '',
        telefono3: p.telefono3 || '',
        correo: p.correo || '',
        notas: p.notas || '',
        tipo: p.tipo || '',
        pais: p.pais || '',
        lugar: p.lugar || '',
        fechaNacimiento: p.fechaNacimiento || '',
        tipoSangre: p.tipoSangre || '',
        contactoEmergenciaNombre: p.contactoEmergenciaNombre || '',
        telefonoEmergencia: p.telefonoEmergencia || '',
        nombreContacto: p.nombreContacto || '',
        telefonoContacto: p.telefonoContacto || '',
        urlMapa: p.urlMapa || '',
        horario: p.horario || '',
        terreno: p.terreno || [],
        precio: p.precio || '',
        etapaCamino: p.etapaCamino || ''
    };
}

function normalizarNota(n) {
    return {
        ...n,
        id: n.id || '',
        titulo: n.titulo || '',
        contenido: n.contenido || '',
        creada: n.creada || '',
        actualizada: n.actualizada || '',
        recordatorioFecha: n.recordatorioFecha || '',
        recordatorioVisto: n.recordatorioVisto === true
    };
}

function normalizarPrecioBuseta(p) {
    return {
        ...p,
        id: p.id || '',
        tipo: p.tipo || 'Local',
        provincia: p.provincia || '',
        nombre: p.nombre || '',
        monto: p.monto || 0
    };
}
