/* AGENDATRIBUPRO - Capa de datos: loadData y saveData sobre LocalForage
   Origen: AGENDATRIBUPRO.original.html lineas 3226-3330
   Extraido sin cambios de codigo (solo se quito la sangria de 8 espacios).
   No editar sin actualizar el original. */
// --- DATABASE OPERATIONS ---
// FLASK: Reemplazar por carga desde SQLAlchemy. Mantener la estructura
//        de normalización (normalizarCaminata, normalizarDirectorioPersona,
//        normalizarNota, normalizarPrecioBuseta) como helpers de validación.
// NO MODIFICAR: Carga y normalización exacta de todos los datos
async function loadData() {
    try {
        const resp = await fetch('/api/data');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();

        if (data && Object.keys(data).length > 0) {
            caminatas = (data.caminatas || []).map(c => normalizarCaminata(c));
            personasGlobales = data.personasGlobales || [];
            directorioPersonas = (data.directorioPersonas || []).map(p => normalizarDirectorioPersona(p));
            notas = (data.notas || []).map(n => normalizarNota(n));
            consecutivoFactura = data.consecutivoFactura || 1;
            ultimoRespaldo = data.ultimoRespaldo || 0;
            preciosBuseta = (data.preciosBuseta || []).map(p => normalizarPrecioBuseta(p));
            historialRetiros = (data.historialRetiros || []).map(r => normalizarRetiro(r));
            historialAsistencia = data.historialAsistencia || [];
            cotizacionesGuardadas = (data.cotizacionesGuardadas || data.cotizaciones || []).map(c => ({ ...c, fecha: c.fecha || new Date().toISOString() }));

            if (data.configTema) {
                configTema = {
                    ...data.configTema,
                    tituloApp: data.configTema.tituloApp || TITULO_APP_DEFECTO,
                    tituloDirectorio: data.configTema.tituloDirectorio || TITULO_DIRECTORIO_DEFECTO,
                    gruposPersonalizados: data.configTema.gruposPersonalizados || [],
                    temaColor: data.configTema.temaColor || 'naranja',
                    formasPago: {
                        sinpe: (data.configTema.formasPago && data.configTema.formasPago.sinpe) ? data.configTema.formasPago.sinpe : [...FORMAS_PAGO_DEFAULT.sinpe],
                        cuentas: (data.configTema.formasPago && data.configTema.formasPago.cuentas) ? data.configTema.formasPago.cuentas : [...FORMAS_PAGO_DEFAULT.cuentas]
                    },
                    equipoRequerido: (data.configTema.equipoRequerido && data.configTema.equipoRequerido.length) ? data.configTema.equipoRequerido : [...EQUIPO_REQUERIDO_DEFAULT],
                    instrucciones: {
                        otrasRecomendaciones: (data.configTema.instrucciones && data.configTema.instrucciones.otrasRecomendaciones && data.configTema.instrucciones.otrasRecomendaciones.length) ? data.configTema.instrucciones.otrasRecomendaciones : [...INSTRUCCIONES_DEFAULT.otrasRecomendaciones],
                        normasGenerales: (data.configTema.instrucciones && data.configTema.instrucciones.normasGenerales && data.configTema.instrucciones.normasGenerales.length) ? data.configTema.instrucciones.normasGenerales : [...INSTRUCCIONES_DEFAULT.normasGenerales],
                        indicacionesSeguridad: (data.configTema.instrucciones && data.configTema.instrucciones.indicacionesSeguridad && data.configTema.instrucciones.indicacionesSeguridad.length) ? data.configTema.instrucciones.indicacionesSeguridad : [...INSTRUCCIONES_DEFAULT.indicacionesSeguridad]
                    },
                    membreteCotizador: (data.configTema.membreteCotizador) ? {
                        telefono1: data.configTema.membreteCotizador.telefono1 || '+506 86227500 - Kenneth Ruiz Matamoros',
                        telefono2: data.configTema.membreteCotizador.telefono2 || '+506 86529837 - Jenny Ceciliano Cordoba',
                        facebook: data.configTema.membreteCotizador.facebook || 'https://facebook.com/LaTribuDeLosLibres',
                        web: data.configTema.membreteCotizador.web || 'www.latribu.top',
                        precioFrase: data.configTema.membreteCotizador.precioFrase || 'Por favor requerimos el precio desglosado por persona y el global en Dólares USD',
                        horarioFrase: data.configTema.membreteCotizador.horarioFrase || 'El horario de Atención y con quien conversamos',
                        banosFrase: data.configTema.membreteCotizador.banosFrase || 'Por favor, requerimos indicar si las habitaciones tienen baños independientes o si son baños compartidos.',
                        cortesiaFrase: data.configTema.membreteCotizador.cortesiaFrase || 'Por favor, indicar si el guía y el chofer del bus tienen el beneficio de estancia llamado cortesía.',
                        cierreFrase: data.configTema.membreteCotizador.cierreFrase || 'Muchísimas gracias'
                    } : {
                        telefono1: '+506 86227500 - Kenneth Ruiz Matamoros',
                        telefono2: '+506 86529837 - Jenny Ceciliano Cordoba',
                        facebook: 'https://facebook.com/LaTribuDeLosLibres',
                        web: 'www.latribu.top',
                        precioFrase: 'Por favor requerimos el precio desglosado por persona y el global en Dólares USD',
                        horarioFrase: 'El horario de Atención y con quien conversamos',
                        banosFrase: 'Por favor, requerimos indicar si las habitaciones tienen baños compartidos o si son baños compartidos.',
                        cortesiaFrase: 'Por favor, indicar si el guía y el chofer del bus tienen el beneficio de estancia llamado cortesía.',
                        cierreFrase: 'Muchísimas gracias'
                    }
                };
            }

            // Compatibilidad: si no hay directorio, regenerarlo desde nombres globales
            if (directorioPersonas.length === 0 && personasGlobales.length > 0) {
                directorioPersonas = personasGlobales.map((n, i) => ({
                    id: 'dir_' + Date.now() + '_' + i,
                    nombre: n,
                    cedula: '',
                    pasaporte: '',
                    telefono: '',
                    correo: '',
                    notas: ''
                }));
                await saveData();
            }
        }
    } catch (err) {
        console.error("Error loading data:", err);
        showToast("Error al cargar desde SQLite", "danger");
    }
}

// Guardado de todos los datos a SQLite via Flask
async function saveData() {
    try {
        const payload = {
            caminatas: (caminatas || []).map(c => normalizarCaminata(c)),
            personasGlobales: [...(personasGlobales || [])],
            directorioPersonas: (directorioPersonas || []).map(p => normalizarDirectorioPersona(p)),
            notas: (notas || []).map(n => normalizarNota(n)),
            consecutivoFactura: consecutivoFactura || 1,
            ultimoRespaldo: ultimoRespaldo || 0,
            preciosBuseta: (preciosBuseta || []).map(p => normalizarPrecioBuseta(p)),
            historialRetiros: (historialRetiros || []).map(r => normalizarRetiro(r)),
            historialAsistencia: historialAsistencia || [],
            cotizacionesGuardadas: (cotizacionesGuardadas || []).map(c => ({ ...c, fecha: c.fecha || new Date().toISOString() })),
            configTema: normalizarConfigTema ? normalizarConfigTema(configTema) : configTema,
            exportDate: new Date().toISOString()
        };

        const resp = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
    } catch (err) {
        console.error("Error saving data:", err);
        showToast("Error al guardar en SQLite", "danger");
    }
}

// === FIN BLOQUE MODULAR: CONSTANTS & STATE ===
