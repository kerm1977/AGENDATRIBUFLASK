/* AGENDATRIBUPRO - Arranque: modales, listeners y primera carga. Va ultimo
   Origen: AGENDATRIBUPRO.original.html lineas 3145-3224
   Extraido sin cambios de codigo (solo se quito la sangria de 8 espacios).
   No editar sin actualizar el original. */
// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar instancias de modales
    modalCaminante = new bootstrap.Modal(document.getElementById('modalCaminante'));
    modalMultiCaminantes = new bootstrap.Modal(document.getElementById('modalMultiCaminantes'));
    modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirm'));
    modalWhatsApp = new bootstrap.Modal(document.getElementById('modalWhatsApp'));
    modalBuseta = new bootstrap.Modal(document.getElementById('modalBuseta'));
    modalReversion = new bootstrap.Modal(document.getElementById('modalReversion'));
    modalFactura = new bootstrap.Modal(document.getElementById('modalFactura'));
    modalPago = new bootstrap.Modal(document.getElementById('modalPago'));
    modalPrecioBuseta = new bootstrap.Modal(document.getElementById('modalPrecioBuseta'));
    modalAgregarDirectorio = new bootstrap.Modal(document.getElementById('modalAgregarDirectorio'));
    modalFusionManual = new bootstrap.Modal(document.getElementById('modalFusionManual'));
    modalNota = new bootstrap.Modal(document.getElementById('modalNota'));
    modalCancelarNota = new bootstrap.Modal(document.getElementById('modalCancelarNota'));
    modalRecordatorioNota = new bootstrap.Modal(document.getElementById('modalRecordatorioNota'));
    modalRecordatoriosHoy = new bootstrap.Modal(document.getElementById('modalRecordatoriosHoy'));
    modalOracionTribu = new bootstrap.Modal(document.getElementById('modalOracionTribu'));
    modalSalir = new bootstrap.Modal(document.getElementById('modalSalir'));
    modalSeleccionarCaminata = new bootstrap.Modal(document.getElementById('modalSeleccionarCaminata'));
    modalVerDirectorio = new bootstrap.Modal(document.getElementById('modalVerDirectorio'));
    modalCotizador = new bootstrap.Modal(document.getElementById('modalCotizador'));
    modalHistorialRetiros = new bootstrap.Modal(document.getElementById('modalHistorialRetiros'));
    modalHistorialParticipacion = new bootstrap.Modal(document.getElementById('modalHistorialParticipacion'));

    // Prevenir cierre accidental con botón atrás
    history.pushState({ page: 'app' }, '', location.href);
    window.addEventListener('popstate', manejarBotonAtras);

    // Configurar LocalForage (preferir IndexedDB)
    localforage.config({
        name: 'WhatsAppListManager',
        storeName: 'data',
        driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, localforage.WEBSQL]
    });

    // Listeners
    document.getElementById('cam-moneda').addEventListener('change', updateCurrencySymbols);
    document.getElementById('cam-precio-buseta').addEventListener('input', updateTotalTransporte);
    document.getElementById('cam-cantidad-busetas').addEventListener('change', updateTotalTransporte);
    document.getElementById('cam-cantidad-guias').addEventListener('input', updateTotalDineroCaminata);
    document.getElementById('cam-precio').addEventListener('input', updateTotalDineroCaminata);
    document.getElementById('form-caminata').addEventListener('submit', saveCaminataHeader);
    document.getElementById('confirm-action-btn').addEventListener('click', executeConfirmAction);
    document.getElementById('nota-contenido').addEventListener('keydown', manejarEnterChecklist);

    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        const editor = document.getElementById('nota-contenido');
        if (sel.rangeCount && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
            notaSavedRange = sel.getRangeAt(0).cloneRange();
        }
    });

    // Cargar Datos
    await loadData();
    aplicarTema(configTema.temaColor);
    const escalaGuardada = parseFloat(localStorage.getItem('escala_fuente_app'));
    if (!isNaN(escalaGuardada) && escalaGuardada > 0) {
        escalaFuenteApp = escalaGuardada;
        aplicarEscalaAccesibilidad();
    }
    poblarSelectGrupoTipo();
    iniciarRespaldoAutomatico();
    renderHome();
    revisarCumpleanos();
    verificarRecordatorios();
    setInterval(verificarRecordatorios, 60 * 1000); // Revisar recordatorios cada minuto
    
    // Cerrar dropdown de sugerencias al hacer click fuera
    document.addEventListener('click', function(e) {
        const suggList = document.getElementById('suggestions-list');
        const inputPas = document.getElementById('cam-usu-nombre');
        if (e.target !== inputPas && e.target !== suggList) {
            suggList.style.display = 'none';
        }
    });

});
