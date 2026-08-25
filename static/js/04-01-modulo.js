/* AGENDATRIBUPRO - Ajustes: normas, instrucciones, cotizador
   Origen: AGENDATRIBUPRO.original.html lineas 3489-4187
   Extraido sin cambios de codigo (solo se quito la sangria de 8 espacios).
   No editar sin actualizar el original. */
function generarEncabezadoWhatsApp(cam) {
    let texto = '';

    if (cam.actividad === 'Parque Nacional') {
        texto += `*${(cam.nombre || '').toUpperCase()}*\n`;
        if (cam.provincia) texto += `- Provincia: ${cam.provincia}\n`;
    } else if (cam.actividad === 'El Camino de Costa Rica') {
        texto += `*EL CAMINO DE COSTA RICA - ${(cam.nombre || '').toUpperCase()}*\n`;
        if (cam.provincia) texto += `- Provincia: ${cam.provincia}\n`;
    } else if (cam.actividad === 'Internacional') {
        if (cam.provincia) {
            texto += `*${(cam.provincia || '').toUpperCase()} - ${(cam.nombre || '').toUpperCase()}*\n`;
        } else {
            texto += `*${(cam.nombre || '').toUpperCase()}*\n`;
        }
    } else {
        texto += `*${(cam.nombre || '').toUpperCase()}*\n`;
        if (cam.actividad) texto += `- Actividad: ${cam.actividad}\n`;
    }

    if (cam.tipo === 'Local') {
        texto += `- Fecha: ${formatDateString(cam.fechaLocal)}\n`;
    } else {
        texto += `- Ida: ${formatDateString(cam.fechaIda)}\n`;
        texto += `- Regreso: ${formatDateString(cam.fechaRegreso)}\n`;
    }

    if (cam.horaSalida) texto += `- Hora de salida: ${cam.horaSalida}\n`;
    if (cam.dificultad) texto += `- Dificultad: ${cam.dificultad}\n`;
    if (cam.kilometros) texto += `- Kilómetros: ${cam.kilometros} km\n`;

    if (cam.actividad === 'Internacional') {
        if (cam.modoTransporte) texto += `- Transporte: ${cam.modoTransporte}\n`;
        if (cam.modoTransporte === 'Aéreo' && cam.aerolinea) texto += `- Aerolínea: ${cam.aerolinea}\n`;
        if (cam.incluirVueloWhatsApp) {
            if (cam.tieneVuelo && cam.numeroVuelo) texto += `- Vuelo: ${cam.numeroVuelo}\n`;
            if (cam.tieneFechaVuelo) {
                if (cam.vueloFechaSalida) texto += `- Salida del vuelo: ${formatDateString(cam.vueloFechaSalida)} ${cam.vueloHoraSalida || ''}\n`;
                if (cam.vueloFechaRegreso) texto += `- Regreso del vuelo: ${formatDateString(cam.vueloFechaRegreso)} ${cam.vueloHoraRegreso || ''}\n`;
            }
        }
    }

    texto += `- Precio: ${cam.moneda}${cam.precio}\n`;

    const reservaFechaStr = formatDateStringShort(cam.reservaFecha);
    texto += `- Reserva con: ${cam.moneda}${cam.reservaMonto} (Límite: ${reservaFechaStr})\n`;

    if (cam.mostrarIncluye !== false && cam.incluye && cam.incluye.length > 0) {
        const listaIncluye = cam.incluye.map(item => {
            if (item === 'Otros' && cam.otrosDescripcion) return `Otros (${cam.otrosDescripcion})`;
            return item;
        }).join(', ');
        texto += `- Incluye: ${listaIncluye}\n`;
    }

    if (cam.mostrarFormasPago !== false && cam.formasPago && cam.formasPago.length > 0) {
        texto += `- Formas de pago: ${cam.formasPago.join(', ')}\n`;
    }
    if (cam.mostrarUrls !== false && cam.urls && cam.urls.length > 0) {
        cam.urls.forEach(u => { if (u) texto += `- Enlace: ${u}\n`; });
    } else if (cam.mostrarUrls !== false && cam.url) {
        texto += `- Enlace: ${cam.url}\n`;
    }
    if (cam.lugarSalida && cam.lugarSalida !== 'Cada quien llega por sus propios medios') texto += `- Lugar de salida: ${cam.lugarSalida}\n`;
    if (cam.lugaresRecoger && cam.lugaresRecoger.length > 0 && (cam.actividad !== 'Internacional' || cam.tieneLugarSalida)) texto += `- Lugares para recoger: ${cam.lugaresRecoger.join(', ')}\n`;

    return texto;
}

function generarBloqueInstrucciones(cam) {
    let texto = '';
    texto += `\n*EQUIPO REQUERIDO:*\n`;

    let hayEquipo = false;
    (cam.equipo || []).forEach(eq => {
        if (eq.estado !== 'No') {
            texto += `- ${eq.item}: ${eq.estado}\n`;
            hayEquipo = true;
        }
    });
    if (!hayEquipo) texto += '- Ninguno seleccionado\n';

    const otras = configTema.instrucciones.otrasRecomendaciones || [];
    if (otras.length > 0) {
        texto += `\n*OTRAS RECOMENDACIONES:*\n`;
        otras.forEach(i => texto += `- ${i}\n`);
    }

    const normas = configTema.instrucciones.normasGenerales || [];
    if (normas.length > 0) {
        texto += `\n*NORMAS GENERALES:*\n`;
        normas.forEach(i => texto += `- ${i}\n`);
    }

    const seguridad = configTema.instrucciones.indicacionesSeguridad || [];
    if (seguridad.length > 0) {
        texto += `\n*INDICACIONES DE SEGURIDAD:*\n`;
        seguridad.forEach(i => texto += `- ${i}\n`);
    }

    if (cam.notasAdicionales && cam.notasAdicionales.trim() !== '') {
        texto += `\n*NOTAS ADICIONALES:*\n${cam.notasAdicionales}\n`;
    }

    return texto;
}

function generarMensajeWhatsApp(cam) {
    let texto = generarEncabezadoWhatsApp(cam);

    if (cam.mostrarCaminantes !== false) {
        texto += `\n🔴- Pendiente\n`;
        texto += `🟡- Reservado\n`;
        texto += `🔵- Reserva Parcial\n`;
        texto += `🟣- Pago Parcial\n`;
        texto += `🟢- Cancelado\n`;
        texto += `🟠- Abono\n\n`;

        texto += `*LISTA DE ASISTENCIA:*\n`;

        const prioridad = {
            'cancelado': 1,
            'abono': 2,
            'pago-parcial': 3,
            'reservado': 4,
            'reserva-parcial': 5,
            'pendiente': 6
        };
        const pasajerosOrdenados = [...(cam.pasajeros || [])].sort((a, b) => {
            const pa = prioridad[a.estado] || 99;
            const pb = prioridad[b.estado] || 99;
            if (pa !== pb) return pa - pb;
            return a.nombre.localeCompare(b.nombre);
        });

        pasajerosOrdenados.forEach((pas, index) => {
            const emoji = EMOJIS_ESTADO[pas.estado] || '⚪';
            let suffix = "";
            if (pas.estado === 'abono') {
                let displayAbono = (pas.abonos || "Ab").replace('R+', 'Ab+');
                suffix = ` (${displayAbono})`;
            } else if (pas.estado === 'cancelado') {
                suffix = " ✅";
            }
            texto += `${index + 1}. ${emoji}${pas.nombre}${suffix}\n`;

            if (pas.notaPublica && pas.nota && pas.nota.trim() !== '') {
                let parsedNota = parseHtmlForWhatsApp(pas.nota);
                if (parsedNota) {
                    texto += `   _Nota: ${parsedNota.replace(/\n/g, '\n   ')}_\n`;
                }
            }
        });
    }

    if (cam.mostrarInstrucciones !== false) {
        texto += generarBloqueInstrucciones(cam);
    }

    return texto;
}

// === FIN MÓDULO JS: NAVEGACIÓN Y UTILIDADES ===
// === INICIO BLOQUE MODULAR PROTEGIDO: AJUSTES ===
// --- AJUSTES: Normas e Instrucciones ---
// FLASK: Módulo de ajustes: tema, títulos, formas de pago, instrucciones,
//        equipo, respaldos, estadísticas y tarjeta de cuentas. La mayoría
//        de funciones actualizan configTema y llaman saveData(). En Flask
//        estas funciones deberían hacer POST al endpoint /api/config y
//        luego re-renderizar la sección de ajustes parcial.
function renderInstruccionesAjustes() {
    document.getElementById('ajustes-otras').value = (configTema.instrucciones.otrasRecomendaciones || []).join('\n');
    document.getElementById('ajustes-normas').value = (configTema.instrucciones.normasGenerales || []).join('\n');
    document.getElementById('ajustes-seguridad').value = (configTema.instrucciones.indicacionesSeguridad || []).join('\n');

    const cont = document.getElementById('ajustes-equipo-lista');
    if (!cont) return;
    const equipos = configTema.equipoRequerido || [];
    if (equipos.length === 0) {
        cont.innerHTML = '<p class="text-muted small mb-0">No hay equipo configurado.</p>';
        return;
    }
    cont.innerHTML = equipos.map((item, index) => {
        const texto = typeof item === 'string' ? item : (item.item || '');
        return `
        <div class="d-flex justify-content-between align-items-center bg-light rounded px-2 py-1 mb-1">
            <span class="small text-muted">${escapeHtml(texto)}</span>
            <button type="button" class="btn btn-sm text-danger" onclick="eliminarEquipoRequerido(${index})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
    }).join('');
}

function guardarInstruccionesAjustes() {
    const parseLines = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.split('\n').map(l => l.trim()).filter(l => l.length > 0) : [];
    };
    configTema.instrucciones = {
        otrasRecomendaciones: parseLines('ajustes-otras'),
        normasGenerales: parseLines('ajustes-normas'),
        indicacionesSeguridad: parseLines('ajustes-seguridad')
    };
    saveData();
    showToast('Normas e instrucciones guardadas', 'success');
}
