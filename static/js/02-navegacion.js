/* AGENDATRIBUPRO - Navegacion entre vistas, titulo y boton flotante
   Origen: AGENDATRIBUPRO.original.html lineas 3331-3440
   Extraido sin cambios de codigo (solo se quito la sangria de 8 espacios).
   No editar sin actualizar el original. */
// === INICIO BLOQUE MODULAR: NAVIGATION & UI HELPERS ===
// --- NAVIGATION & UI HELPERS ---
// FLASK: Esta función controla la visibilidad de vistas. En Flask/Jinja2
//        puede reemplazarse por rutas separadas (/) o HTMX con plantillas.
//        CRÍTICO: onclick en la bottom-nav y links llama a navigate().
function navigate(viewName, title = null) {
    title = title || configTema.tituloApp || TITULO_APP_DEFECTO;
    // Esconder todas
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    // Mostrar target
    document.getElementById(`view-${viewName}`).classList.add('active');
    
    // Update Title
    document.getElementById('app-title').innerText = title;

    // Update Bottom Nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if(viewName === 'home') document.getElementById('nav-home').classList.add('active');
    if(viewName === 'directorio') {
        document.getElementById('nav-directorio').classList.add('active');
        initDirectorioView();
    }
    if(viewName === 'notas') {
        document.getElementById('nav-notas').classList.add('active');
        renderNotas();
    }
    if(viewName === 'settings') {
        document.getElementById('nav-settings').classList.add('active');
        actualizarCuentaRegresivaRespaldo();
        actualizarContadorPreciosAjustes();
        actualizarEstadisticasSitio();
        renderConfigTema();
        renderFormasPago();
        renderInstruccionesAjustes();
        renderMembreteCotizador();
        renderCotizacionesGuardadas();
    }

    // Mostrar el icono "Buseta" solo en la vista de caminata, Directorio siempre
    const navBuseta = document.getElementById('nav-buseta');
    if(viewName === 'caminata') {
        navBuseta.style.display = 'flex';
    } else {
        navBuseta.style.display = 'none';
    }

    // Toggle FAB visibility and functionality
    const fab = document.getElementById('main-fab');
    if(viewName === 'home') {
        fab.style.display = 'flex';
        fab.innerHTML = '<i class="fas fa-plus"></i>';
        fab.onclick = createNewCaminata;
        fab.disabled = false;
        fab.style.backgroundColor = 'var(--primary-color)';
        fab.style.boxShadow = 'none';
        renderHome();
    } else if (viewName === 'caminata') {
        fab.style.display = 'flex';
        fab.innerHTML = '<i class="fab fa-whatsapp" style="font-size: 1.5rem;"></i>';
        fab.onclick = openWhatsAppPreview;
        updateFabState();
    } else if (viewName === 'precios') {
        fab.style.display = 'flex';
        fab.innerHTML = '<i class="fas fa-plus"></i>';
        fab.onclick = () => openPrecioBusetaModal();
        fab.disabled = false;
        fab.style.backgroundColor = 'var(--primary-color)';
        fab.style.boxShadow = 'none';
        renderPrecios();
    } else if (viewName === 'notas') {
        fab.style.display = 'flex';
        fab.innerHTML = '<i class="fas fa-plus"></i>';
        fab.onclick = () => abrirEditorNota();
        fab.disabled = false;
        fab.style.backgroundColor = 'var(--primary-color)';
        fab.style.boxShadow = 'none';
    } else if (viewName === 'directorio') {
        // El botón "Agregar contacto" ya está en el encabezado de esta vista;
        // se oculta el FAB para evitar dos botones "+" superpuestos.
        fab.style.display = 'none';
    } else {
        fab.style.display = 'none';
    }

    currentView = viewName;
    window.scrollTo(0, 0);
}

function updateFabState() {
    if (currentView !== 'caminata') return;
    const cam = caminatas.find(c => c.id === currentCaminataId);
    const fab = document.getElementById('main-fab');
    if (!cam) {
        fab.disabled = true;
        fab.style.backgroundColor = '#9ca3af';
        fab.style.boxShadow = 'none';
        return;
    }
    const faltaCaminantes = cam.mostrarCaminantes !== false && (!cam.pasajeros || cam.pasajeros.length === 0);
    if (faltaCaminantes) {
        fab.disabled = true;
        fab.style.backgroundColor = '#9ca3af';
        fab.style.boxShadow = 'none';
    } else {
        fab.disabled = false;
        fab.style.backgroundColor = '#25D366';
        fab.style.boxShadow = 'none';
    }
}

