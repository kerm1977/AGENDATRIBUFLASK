function actualizarEstadisticasSitio() {
    const elListas = document.getElementById('stat-listas-activas');
    if (!elListas) return;

    elListas.innerText = caminatas.length;
    document.getElementById('stat-contactos').innerText = directorioPersonas.length;
    document.getElementById('stat-notas').innerText = notas.length;

    const participaciones = obtenerTodasParticipaciones();
    const personasParticiparon = new Set(participaciones.map(p => (p.nombre || '').toLowerCase().trim())).size;
    document.getElementById('stat-personas-participaron').innerText = personasParticiparon;

    const personasRetiradas = new Set(historialRetiros.map(r => (r.nombre || '').toLowerCase().trim())).size;
    document.getElementById('stat-personas-retiradas').innerText = personasRetiradas;

    const totalBuseta = preciosBuseta.reduce((acc, p) => acc + Number(p.monto || 0), 0);
    document.getElementById('stat-total-buseta').innerText = `₡${totalBuseta}`;

    let asistenciaParticiparon = 0;
    let asistenciaNoParticiparon = 0;
    let asistenciaRetirados = 0;
    
    // Usar historial permanente de asistencia para mantener contadores aunque se eliminen caminatas
    historialAsistencia.forEach(reg => {
        if (reg.asistencia === 'participo') asistenciaParticiparon++;
        else if (reg.asistencia === 'no-participo') asistenciaNoParticiparon++;
    });
    
    // Contar retirados únicos del historial de retiros
    const retiradosUnicos = new Set(historialRetiros.map(r => (r.nombre || '').toLowerCase().trim())).size;
    asistenciaRetirados = retiradosUnicos;
    
    document.getElementById('stat-asistencia-participaron').innerText = asistenciaParticiparon;
    document.getElementById('stat-asistencia-no-participaron').innerText = asistenciaNoParticiparon;
    document.getElementById('stat-personas-retiradas').innerText = asistenciaRetirados;

    // NO MODIFICAR: Estadísticas por actividad e inactivos
    const actividadesOrden = ['Caminata', 'Internacional', 'Parque Nacional', 'El Camino de Costa Rica', 'Fiesta', 'Convivio', 'Reunión', 'Otro'];
    const porActividad = {};
    const participantesPorActividad = {};
    const retiradosPorActividad = {};
    actividadesOrden.forEach(a => { 
        porActividad[a] = 0; 
        participantesPorActividad[a] = new Set(); 
        retiradosPorActividad[a] = new Set();
    });

    caminatas.forEach(cam => {
        const act = cam.actividad || 'Otro';
        const agrupado = actividadesOrden.includes(act) ? act : 'Otro';
        porActividad[agrupado] = (porActividad[agrupado] || 0) + 1;
        (cam.pasajeros || []).forEach(pas => {
            const nombre = (pas.nombre || '').toLowerCase().trim();
            if (nombre) participantesPorActividad[agrupado].add(nombre);
        });
        
        // Contar retirados para esta caminata específica
        const retiradosEnCaminata = historialRetiros.filter(r => r.camId === cam.id);
        retiradosEnCaminata.forEach(r => {
            const nombre = (r.nombre || '').toLowerCase().trim();
            if (nombre) retiradosPorActividad[agrupado].add(nombre);
        });
    });

    const contActividad = document.getElementById('stat-por-actividad');
    if (caminatas.length === 0) {
        contActividad.innerHTML = '<p class="text-muted small text-center my-3 mb-0">Sin caminatas registradas.</p>';
    } else {
        let htmlResult = '';
        let actividadIndex = 0;
        
        actividadesOrden.forEach(act => {
            const total = porActividad[act] || 0;
            const participantes = (participantesPorActividad[act] || new Set()).size;
            const retirados = (retiradosPorActividad[act] || new Set()).size;
            
            if (total === 0) return; // Skip actividades sin caminatas
            
            actividadIndex++;
            const collapseId = `collapse-actividad-${actividadIndex}`;
            
            // Agregar acordeón para la actividad
            htmlResult += `
                <div class="accordion-item border">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                            <div class="d-flex align-items-center w-100" style="justify-content: space-between;">
                                <span>${escapeHtml(act)} <span class="text-success">(${participantes})</span> <span class="text-danger">(${retirados})</span></span>
                                <div class="d-flex flex-column small align-items-end gap-1 text-end" style="flex-shrink: 0; margin-right: 10px;">
                                    <span class="text-muted" title="Caminatas">${total} <i class="fas fa-hiking text-primary"></i></span>
                                    <span class="text-muted" title="Participantes">${participantes} <i class="fas fa-user-check text-success"></i></span>
                                    <span class="text-muted" title="Retirados">${retirados} <i class="fas fa-user-times text-danger"></i></span>
                                </div>
                            </div>
                        </button>
                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#stat-por-actividad-accordion">
                        <div class="accordion-body p-0">
                            <div class="small text-muted mb-2 px-3 pt-2 text-center w-100" style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px;">
                                Descripción
                            </div>
                            <hr class="mx-3 my-1" style="border-color: #adb5bd; opacity: 0.4;">
            `;
            
            // Agregar detalle específico según tipo de actividad
            const caminatasActividad = caminatas.filter(c => (c.actividad || 'Otro') === act);
            
            if (act === 'Internacional') {
                // Agrupar por país
                const porPais = {};
                caminatasActividad.forEach(cam => {
                    const pais = cam.pais || 'Otro';
                    if (!porPais[pais]) {
                        porPais[pais] = { caminatas: [], participantes: new Set(), retirados: new Set() };
                    }
                    porPais[pais].caminatas.push(cam);
                    (cam.pasajeros || []).forEach(pas => {
                        const nombre = (pas.nombre || '').toLowerCase().trim();
                        if (nombre) porPais[pais].participantes.add(nombre);
                    });
                    const retiradosEnCaminata = historialRetiros.filter(r => r.camId === cam.id);
                    retiradosEnCaminata.forEach(r => {
                        const nombre = (r.nombre || '').toLowerCase().trim();
                        if (nombre) porPais[pais].retirados.add(nombre);
                    });
                });
                
                Object.keys(porPais).forEach(pais => {
                    const data = porPais[pais];
                    htmlResult += `
                        <div class="list-group-item small ps-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>${escapeHtml(pais)}</span>
                                <div class="d-flex flex-column align-items-end gap-1" style="margin-right: 20px;">
                                    <span class="text-muted">${data.caminatas.length} <i class="fas fa-hiking text-primary"></i></span>
                                    <span class="text-success">${data.participantes.size} <i class="fas fa-user-check"></i></span>
                                    <span class="text-danger">${data.retirados.size} <i class="fas fa-user-times"></i></span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else if (act === 'El Camino de Costa Rica') {
                // Agrupar por etapa
                const porEtapa = {};
                caminatasActividad.forEach(cam => {
                    const etapa = cam.etapa || 'Sin etapa';
                    if (!porEtapa[etapa]) {
                        porEtapa[etapa] = { caminatas: [], participantes: new Set(), retirados: new Set() };
                    }
                    porEtapa[etapa].caminatas.push(cam);
                    (cam.pasajeros || []).forEach(pas => {
                        const nombre = (pas.nombre || '').toLowerCase().trim();
                        if (nombre) porEtapa[etapa].participantes.add(nombre);
                    });
                    const retiradosEnCaminata = historialRetiros.filter(r => r.camId === cam.id);
                    retiradosEnCaminata.forEach(r => {
                        const nombre = (r.nombre || '').toLowerCase().trim();
                        if (nombre) porEtapa[etapa].retirados.add(nombre);
                    });
                });
                
                Object.keys(porEtapa).forEach(etapa => {
                    const data = porEtapa[etapa];
                    htmlResult += `
                        <div class="list-group-item small ps-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>${escapeHtml(etapa)}</span>
                                <div class="d-flex flex-column align-items-end gap-1" style="margin-right: 20px;">
                                    <span class="text-muted">${data.caminatas.length} <i class="fas fa-hiking text-primary"></i></span>
                                    <span class="text-success">${data.participantes.size} <i class="fas fa-user-check"></i></span>
                                    <span class="text-danger">${data.retirados.size} <i class="fas fa-user-times"></i></span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else if (act === 'Parque Nacional') {
                // Mostrar caminadas individuales
                caminatasActividad.forEach(cam => {
                    const participantesCam = new Set();
                    const retiradosCam = new Set();
                    (cam.pasajeros || []).forEach(pas => {
                        const nombre = (pas.nombre || '').toLowerCase().trim();
                        if (nombre) participantesCam.add(nombre);
                    });
                    const retiradosEnCaminata = historialRetiros.filter(r => r.camId === cam.id);
                    retiradosEnCaminata.forEach(r => {
                        const nombre = (r.nombre || '').toLowerCase().trim();
                        if (nombre) retiradosCam.add(nombre);
                    });
                    
                    htmlResult += `
                        <div class="list-group-item small ps-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>${escapeHtml(cam.nombre)}</span>
                                <div class="d-flex flex-column align-items-end gap-1" style="margin-right: 20px;">
                                    <span class="text-success">${participantesCam.size} <i class="fas fa-user-check"></i></span>
                                    <span class="text-danger">${retiradosCam.size} <i class="fas fa-user-times"></i></span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                // Caminata, Fiesta, Convivio, Reunión, Otro: mostrar nombres de caminatas
                const esCaminataPrincipal = act === 'Caminata';
                caminatasActividad.forEach(cam => {
                    const participantesCam = new Set();
                    const retiradosCam = new Set();
                    (cam.pasajeros || []).forEach(pas => {
                        const nombre = (pas.nombre || '').toLowerCase().trim();
                        if (nombre) participantesCam.add(nombre);
                    });
                    const retiradosEnCaminata = historialRetiros.filter(r => r.camId === cam.id);
                    retiradosEnCaminata.forEach(r => {
                        const nombre = (r.nombre || '').toLowerCase().trim();
                        if (nombre) retiradosCam.add(nombre);
                    });
                    
                    const margenInferior = esCaminataPrincipal ? 'margin-bottom: 10px;' : '';
                    
                    htmlResult += `
                        <div class="list-group-item small ps-4" style="${margenInferior}">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>${escapeHtml(cam.nombre)}</span>
                                <div class="d-flex flex-column align-items-end gap-1" style="margin-right: 20px;">
                                    <span class="text-success">${participantesCam.size} <i class="fas fa-user-check"></i></span>
                                    <span class="text-danger">${retiradosCam.size} <i class="fas fa-user-times"></i></span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            htmlResult += `
                        </div>
                    </div>
                </div>
            `;
        });
        
        contActividad.innerHTML = htmlResult || '<p class="text-muted small text-center my-3 mb-0">Sin caminatas registradas.</p>';
    }

    // Contador de inactivos
    const inactivos = calcularInactivos();
    document.getElementById('stat-inactivos-count').innerText = inactivos.length;
}
