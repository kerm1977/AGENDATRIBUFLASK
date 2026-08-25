async function exportarEncabezadoWhatsApp() {
    if (!validateCaminataForm()) return;
    await saveCaminataHeader(null, true, true);
}

async function saveCaminataHeader(e, noCollapse = false, previewOnly = false) {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateCaminataForm()) return;
    
    const id = document.getElementById('caminata-id').value;
    const actividad = document.getElementById('cam-actividad').value || 'Caminata';
    const tipo = actividad === 'Internacional' ? 'Internacional' : 'Local';

    const usarBusetaEl = document.getElementById('cam-usar-buseta');
    const usarBuseta = actividad === 'Internacional'
        ? document.getElementById('cam-modo-transporte').value === 'Terrestre'
        : (usarBusetaEl ? usarBusetaEl.checked : true);
    const precioBuseta = usarBuseta ? document.getElementById('cam-precio-buseta').value : '0';
    const cantidadBuses = usarBuseta ? document.getElementById('cam-cantidad-busetas').value : '1';
    const cantidadGuias = usarBuseta ? document.getElementById('cam-cantidad-guias').value : '0';

    const incluyeSeleccionados = Array.from(document.querySelectorAll('input[name="incluye"]:checked')).map(cb => cb.value);
    const otrosInput = document.getElementById('otrosDescripcion');
    const otrosDescripcion = otrosInput ? otrosInput.value.trim() : '';
    const formasPagoSeleccionadas = Array.from(document.querySelectorAll('input[name="cam-formas-pago"]:checked')).map(cb => cb.value);
    const lugaresRecogerInput = document.getElementById('cam-lugares-recoger');
    const lugaresRecoger = lugaresRecogerInput ? lugaresRecogerInput.value.split(',').map(l => l.trim()).filter(Boolean) : [];
    const equipo = (configTema.equipoRequerido || []).map((item, index) => {
        const radios = document.getElementsByName(`cam-equip_${index}`);
        let estado = 'Si';
        for (const r of radios) { if (r.checked) { estado = r.value; break; } }
        return { item, estado };
    });
    const notasInstruccionesInput = document.getElementById('cam-notas-instrucciones');
    const notasAdicionales = notasInstruccionesInput ? notasInstruccionesInput.value.trim() : '';

    const provinciaValue = actividad === 'Internacional'
        ? document.getElementById('cam-pais').value
        : document.getElementById('cam-provincia').value;

    let camData = {
        id: id,
        nombre: document.getElementById('cam-nombre').value,
        provincia: provinciaValue,
        dificultad: document.getElementById('cam-dificultad').value,
        kilometros: document.getElementById('cam-kilometros').value,
        aerolinea: document.getElementById('cam-aerolinea').value,
        modoTransporte: document.getElementById('cam-modo-transporte').value,
        tieneVuelo: document.getElementById('cam-tiene-vuelo').checked,
        tieneFechaVuelo: document.getElementById('cam-tiene-fecha-vuelo').checked,
        numeroVuelo: document.getElementById('cam-numero-vuelo').value,
        vueloFechaSalida: document.getElementById('cam-vuelo-fecha-salida').value,
        vueloHoraSalida: document.getElementById('cam-vuelo-hora-salida').value,
        vueloFechaRegreso: document.getElementById('cam-vuelo-fecha-regreso').value,
        vueloHoraRegreso: document.getElementById('cam-vuelo-hora-regreso').value,
        incluirVueloWhatsApp: document.getElementById('cam-incluir-vuelo-whatsapp').checked,
        tipo: tipo,
        actividad: actividad,
        fechaLocal: tipo === 'Local' ? document.getElementById('cam-fecha-local').value : '',
        fechaIda: tipo === 'Internacional' ? document.getElementById('cam-fecha-ida').value : '',
        fechaRegreso: tipo === 'Internacional' ? document.getElementById('cam-fecha-regreso').value : '',
        moneda: document.getElementById('cam-moneda').value,
        precio: document.getElementById('cam-precio').value,
        reservaMonto: document.getElementById('cam-reserva-monto').value,
        precioBuseta: precioBuseta,
        cantidadBuses: cantidadBuses,
        cantidadGuias: cantidadGuias,
        usarBuseta: usarBuseta,
        reservaFecha: document.getElementById('cam-reserva-fecha').value,
        horaSalida: document.getElementById('cam-hora-salida').value,
        tieneLugarSalida: document.getElementById('cam-tiene-lugar-salida').checked,
        lugarSalida: document.getElementById('cam-lugar-salida').value,
        urls: Array.from(document.querySelectorAll('.cam-url-input')).map(input => input.value.trim()).filter(Boolean),
        mostrarIncluye: document.getElementById('cam-mostrar-incluye').checked,
        mostrarFormasPago: document.getElementById('cam-mostrar-formas-pago').checked,
        mostrarInstrucciones: document.getElementById('cam-mostrar-instrucciones').checked,
        mostrarUrls: document.getElementById('cam-mostrar-urls').checked,
        mostrarCaminantes: document.getElementById('cam-mostrar-caminantes').checked,
        incluye: incluyeSeleccionados,
        otrosDescripcion: otrosDescripcion,
        formasPago: formasPagoSeleccionadas,
        lugaresRecoger: lugaresRecoger,
        equipo: equipo,
        notasAdicionales: notasAdicionales,
        pasajeros: [] // default interno vacío
    };

    if (previewOnly) {
        await exportarTextoWhatsApp(generarEncabezadoWhatsApp(camData));
        return;
    }

    const existingIndex = caminatas.findIndex(c => c.id === id);
    
    if (existingIndex > -1) {
        // Preserve caminantes
        camData.pasajeros = caminatas[existingIndex].pasajeros || [];
        caminatas[existingIndex] = camData;
    } else {
        caminatas.push(camData);
    }

    if (usarBuseta && Number(precioBuseta) > 0 && camData.nombre && camData.provincia) {
        const existePrecio = preciosBuseta.find(p => p.nombre.toLowerCase() === camData.nombre.toLowerCase());
        if (existePrecio) {
            existePrecio.provincia = camData.provincia;
            existePrecio.monto = Number(precioBuseta);
            existePrecio.tipo = camData.tipo || 'Local';
        } else {
            preciosBuseta.push({
                id: Date.now().toString(),
                tipo: camData.tipo || 'Local',
                provincia: camData.provincia,
                nombre: camData.nombre,
                monto: Number(precioBuseta)
            });
        }
    }

    await saveData();
    document.getElementById('caminantes-section').style.display = 'block';
    document.getElementById('detail-title').innerText = "Editar Caminata";
    
    if (!noCollapse) {
        document.getElementById('collapseHeader').classList.remove('show');
    }
    
    showToast("Encabezado guardado correctamente");
    
    renderCaminantes(); // Asegura de renderizar correctamente
    // Actualizar título de la navbar
    document.getElementById('app-title').innerText = camData.nombre;
}

function confirmarBorradoCaminata(id) {
    showConfirm(
        "Eliminar Caminata",
        "Se borrará esta lista y todos sus caminantes. Los registros de asistencia (participó/no participó) se mantendrán en el historial permanente. ¿Continuar?",
        async () => {
            caminatas = caminatas.filter(c => c.id !== id);
            await saveData();
            renderHome();
            showToast("Caminata eliminada (historial de asistencia preservado)");
        }
    );
}

// --- STREAMING_CHUNK: Form Utilities ---
function actualizarMontoReserva() {
    const precioInput = document.getElementById('cam-precio');
    const reservaInput = document.getElementById('cam-reserva-monto');
    if (!precioInput || !reservaInput) return;

    const precio = Number(precioInput.value);
    if (!precio) return;

    let reserva = '';
    if (precio < 10000) {
        reserva = 3000;
    } else if (precio === 15000) {
        reserva = 5000;
    } else if (precio > 50000) {
        reserva = 10000;
    } else {
        return; // no cambiar si no aplica regla, mantener manual
    }

    reservaInput.value = reserva;
}
