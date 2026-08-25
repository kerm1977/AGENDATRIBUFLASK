/* AGENDATRIBUPRO - Caminatas: home, caminantes, buseta
   Origen: AGENDATRIBUPRO.original.html lineas 4188-6691
   Extraido sin cambios de codigo (solo se quito la sangria de 8 espacios).
   No editar sin actualizar el original. */
// === INICIO BLOQUE MODULAR PROTEGIDO: LISTAS / CAMINATAS ===
// --- STREAMING_CHUNK: Caminata Management (Home) ---
// FLASK: Este módulo genera HTML dinámico. Recomendación: endpoint
//        /api/caminatas con JSON + plantilla Jinja2. Conservar filtro
//        y paginación en backend. CRÍTICO: createNewCaminata, openCaminata,
//        confirmarBorradoCaminata y marcarAsistencia usan onclick en HTML.
let caminatasPaginaActual = 1;
const CAMINATAS_POR_PAGINA = 5;

function renderHome() {
    const listContainer = document.getElementById('caminatas-list');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('buscar-caminatas');
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    const paginacionDiv = document.getElementById('caminatas-paginacion');
    
    listContainer.innerHTML = '';
    
    let caminatasFiltradas = [...caminatas];
    
    // Aplicar filtro de búsqueda
    if (searchText) {
        const palabras = searchText.trim().split(/\s+/).filter(w => w);
        caminatasFiltradas = caminatasFiltradas.filter(cam => {
            const texto = [
                cam.nombre || '',
                cam.actividad || '',
                cam.lugar || '',
                cam.provincia || '',
                cam.pais || 'Costa Rica',
                cam.dificultad || '',
                cam.km || '',
                cam.transporte || '',
                cam.lugarSalida || '',
                cam.lugaresRecoger || '',
                cam.precio || '',
                cam.moneda || '',
                cam.precioBuseta || '',
                cam.formasPago || '',
                cam.reservaMonto || '',
                cam.tipo || '',
                cam.etapa || '',
                cam.parque || ''
            ].join(' ').toLowerCase();
            return palabras.every(w => texto.includes(w));
        });
    }
    
    if (caminatasFiltradas.length === 0) {
        if (caminatas.length === 0) {
            emptyState.classList.remove('d-none');
            emptyState.innerHTML = `
                <i class="fas fa-hiking fa-4x text-muted mb-3"></i>
                <h5 class="text-muted">No hay caminatas creadas.</h5>
                <p class="text-muted small">Toca el botón + para crear una nueva.</p>
            `;
        } else {
            emptyState.classList.remove('d-none');
            emptyState.innerHTML = `
                <i class="fas fa-search fa-4x text-muted mb-3"></i>
                <h5 class="text-muted">No se encontraron caminatas con ese criterio.</h5>
                <p class="text-muted small">Intenta con otra búsqueda.</p>
            `;
        }
        paginacionDiv.style.display = 'none';
    } else {
        emptyState.classList.add('d-none');
        
        // Ordenar más recientes primero
        const sorted = caminatasFiltradas.reverse();
        
        // Calcular paginación
        const totalPaginas = Math.ceil(sorted.length / CAMINATAS_POR_PAGINA);
        caminatasPaginaActual = Math.min(caminatasPaginaActual, totalPaginas);
        const inicio = (caminatasPaginaActual - 1) * CAMINATAS_POR_PAGINA;
        const fin = inicio + CAMINATAS_POR_PAGINA;
        const caminatasPagina = sorted.slice(inicio, fin);
        
        caminatasPagina.forEach(cam => {
            // Mantenemos cam.pasajeros en el JSON para no perder compatibilidad con respaldos
            const caminantesCount = cam.pasajeros ? cam.pasajeros.length : 0;
            
            let fechaText = "";
            if(cam.tipo === 'Local' && cam.fechaLocal) {
                fechaText = formatDateString(cam.fechaLocal);
            } else if (cam.tipo === 'Internacional' && cam.fechaIda) {
                 fechaText = `${formatDateStringShort(cam.fechaIda)} al ${formatDateStringShort(cam.fechaRegreso)}`;
            }

            const safeId = escapeJsString(cam.id);
            const card = document.createElement('div');
            card.className = 'list-card';
            card.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div onclick="openCaminata('${safeId}')" style="cursor:pointer; flex-grow:1;">
                        <h6 class="mb-1 fw-bold text-primary-dark">${escapeHtml(cam.nombre)}</h6>
                        <div class="text-muted small mb-2">
                            <i class="far fa-calendar-alt me-1"></i> ${fechaText || 'Fecha no definida'} <br>
                            <i class="fas fa-users me-1"></i> ${caminantesCount} Caminantes <br>
                            <i class="fas fa-tag me-1"></i> Precio por persona: ${cam.moneda || '₡'}${Number(cam.precio || 0)} <br>
                            ${cam.usarBuseta ? `<i class="fas fa-bus me-1"></i> Precio buseta: ${cam.moneda || '₡'}${Number(cam.precioBuseta || 0)}` : ''}
                        </div>
                        <span class="badge bg-secondary">${escapeHtml(cam.tipo)}</span>
                    </div>
                    <button class="btn btn-sm text-danger" aria-label="Eliminar caminata" onclick="confirmarBorradoCaminata('${safeId}')" style="padding:0; margin-left:10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            listContainer.appendChild(card);
        });
        
        // Mostrar paginación solo si hay más de una página
        if (totalPaginas > 1) {
            paginacionDiv.style.display = 'flex';
            document.getElementById('caminatas-pagina-info').innerText = `Página ${caminatasPaginaActual} de ${totalPaginas}`;
            document.getElementById('caminatas-anterior').disabled = caminatasPaginaActual <= 1;
            document.getElementById('caminatas-siguiente').disabled = caminatasPaginaActual >= totalPaginas;
        } else {
            paginacionDiv.style.display = 'none';
        }
    }
}

function filtrarCaminatas() {
    caminatasPaginaActual = 1; // Resetear a página 1 al buscar
    renderHome();
}

function cambiarPaginaCaminatas(delta) {
    caminatasPaginaActual += delta;
    renderHome();
}
