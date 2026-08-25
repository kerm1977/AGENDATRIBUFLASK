function manejarClickNota(e) {
    actualizarProgresoNota();
}

function sincronizarChecksNota() {
    const editor = document.getElementById('nota-contenido');
    if (!editor) return;
    editor.querySelectorAll('.casilla-checklist').forEach(cb => {
        if (cb.checked) cb.setAttribute('checked', 'checked');
        else cb.removeAttribute('checked');
    });
}

function actualizarProgresoNota() {
    const editor = document.getElementById('nota-contenido');
    const total = editor.querySelectorAll('.checklist-nota li').length;
    const completados = editor.querySelectorAll('.checklist-nota input[type="checkbox"]:checked').length;
    const cont = document.getElementById('nota-progreso-container');
    const barra = document.getElementById('nota-progreso-barra');
    const texto = document.getElementById('nota-progreso-texto');
    if (total === 0) {
        cont.style.display = 'none';
        return;
    }

    cont.style.display = 'flex';
    const porcentaje = Math.round((completados / total) * 100);
    barra.style.width = porcentaje + '%';
    texto.innerText = `${completados}/${total} (${porcentaje}%)`;
}

function actualizarBotonRecordatorio() {
    const btn = document.getElementById('btn-toggle-recordatorio');
    const icon = document.getElementById('icon-recordatorio');
    const text = document.getElementById('text-recordatorio');
    const fecha = notaRecordatorioFechaPendiente || notaRecordatorioFechaExistente;
    if (fecha) {
        btn.classList.remove('btn-light');
        btn.classList.add('btn-warning');
        icon.classList.remove('far');
        icon.classList.add('fas');
        text.innerText = `Recordatorio: ${formatearFechaRecordatorio(fecha)}`;
    } else {
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-light');
        icon.classList.remove('fas');
        icon.classList.add('far');
        text.innerText = 'Recordatorio';
    }
}

function formatearFechaRecordatorio(fechaStr) {
    if (!fechaStr) return '';
    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}/${mes}/${anio}`;
}

function compartirNotaWhatsApp() {
    const tituloInput = document.getElementById('nota-titulo');
    const contenidoEl = document.getElementById('nota-contenido');
    const titulo = (tituloInput ? tituloInput.value : '').trim() || 'Sin título';
    const contenido = (contenidoEl ? contenidoEl.innerText : '').trim();
    const texto = `*${titulo}*\n\n${contenido}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

function toggleRecordatorioNota() {
    const fecha = notaRecordatorioFechaPendiente || notaRecordatorioFechaExistente;
    if (fecha) {
        // Si ya tiene recordatorio, lo desactiva
        notaRecordatorioFechaPendiente = null;
        notaRecordatorioFechaExistente = null;
        actualizarBotonRecordatorio();
    } else {
        const input = document.getElementById('nota-fecha-recordatorio');
        input.value = obtenerFechaCRString();
        modalRecordatorioNota.show();
    }
}

function guardarFechaRecordatorio() {
    const input = document.getElementById('nota-fecha-recordatorio');
    const fecha = input.value;
    if (!fecha) {
        showToast('Seleccioná una fecha', 'warning');
        return;
    }
    notaRecordatorioFechaPendiente = fecha;
    notaRecordatorioFechaExistente = fecha;
    actualizarBotonRecordatorio();
    modalRecordatorioNota.hide();
}

// Recorre las notas y muestra un modal con los recordatorios de hoy.
let recordatoriosActuales = [];
function verificarRecordatorios() {
    const hoy = obtenerFechaCRString();
    const pendientes = notas.filter(n => n.recordatorioFecha === hoy && !n.recordatorioVisto);
    const modalAbierto = document.getElementById('modalRecordatoriosHoy').classList.contains('show');
    if (!modalAbierto && Date.now() < recordatoriosSnoozeHasta) return;

    if (pendientes.length === 0) {
        if (modalAbierto && modalRecordatoriosHoy) modalRecordatoriosHoy.hide();
        return;
    }

    recordatoriosActuales = pendientes;
    mostrarModalRecordatorios();
}

function mostrarModalRecordatorios() {
    if (!modalRecordatoriosHoy) return;
    const contenedor = document.getElementById('recordatorios-contenido');
    if (!contenedor) return;

    let html = '';
    recordatoriosActuales.forEach(n => {
        const contenidoTexto = (n.contenido || '').replace(/<[^>]+>/g, ' ').trim();
        html += `
            <div class="alert alert-light border-start border-4 border-warning" style="border-color: var(--primary-dark) !important;">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <strong class="d-block"><i class="far fa-bell me-1 text-warning"></i> ${escapeHtml(n.titulo)}</strong>
                    <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2" onclick="irANotaRecordatorio('${n.id}')" style="font-size: 0.75rem;">Ir a nota</button>
                </div>
                <p class="mb-0 small" style="white-space: pre-wrap;">${escapeHtml(contenidoTexto)}</p>
            </div>`;
    });
    contenedor.innerHTML = html;
    modalRecordatoriosHoy.show();
}

async function irANotaRecordatorio(notaId) {
    const nota = notas.find(n => n.id === notaId);
    if (!nota) return;
    nota.recordatorioVisto = true;
    await saveData();
    if (modalRecordatoriosHoy) modalRecordatoriosHoy.hide();
    recordatoriosSnoozeHasta = Date.now() + 5 * 60 * 1000;
    recordatoriosActuales = recordatoriosActuales.filter(n => n.id !== notaId);
    setTimeout(() => abrirEditorNota(notaId), 300);
}

async function descartarRecordatoriosModal() {
    recordatoriosActuales.forEach(n => n.recordatorioVisto = true);
    await saveData();
    if (modalRecordatoriosHoy) modalRecordatoriosHoy.hide();
    recordatoriosActuales = [];
}

function verRecordatoriosDespues() {
    if (modalRecordatoriosHoy) modalRecordatoriosHoy.hide();
    // Pospone 30 minutos el recordatorio; tras ese tiempo vuelve a aparecer.
    recordatoriosSnoozeHasta = Date.now() + 30 * 60 * 1000;
}

// --- ORACIÓN DE LA TRIBU ---
const ORACION_TRIBU = `Oración de La Tribu

GRACIAS SEÑOR POR ESTE HERMOSO DÍA QUE NOS HAS REGALADO.

POR NUESTROS AMIGOS Y AMIGAS QUE NOS ACOMPAÑAN EN ESTA ACTIVIDAD Y AQUELLOS QUE NO PUDIERON ESTAR HOY CON NOSOTROS.

NOS AMPARAMOS A TU PROTECCIÓN Y LA DE NUESTROS FAMILIARES QUE NOS ESPERAN EN CASA.

PROTEGE A LOS INDEFENSOS QUE SUFREN LA AGRESIÓN Y ABANDONO DE CUALQUIER TIPO.

PONEMOS A TODAS LAS PERSONAS QUE ESTÁN EN LOS HOSPITALES, A LOS PRIVADOS DE LIBERTAD Y DE MOVIMIENTO QUE DESEAN TENER LA OPORTUNIDAD QUE NOSOTROS TENEMOS EN ESTE DÍA... ACOMPÁÑALOS Y DALES FUERZA PARA VENCER SU ANGUSTIA.

QUE TU PROTECCIÓN LLEGUE A LOS DEMÁS GRUPOS Y SENDERISTAS DEL MUNDO QUE COMPARTEN NUESTRA MISMA PASIÓN PARA QUE LLEVEMOS UN CORAZÓN PASIVO, ALEGRE Y SERENO CON UN ESPÍRITU PROTECTOR DE LA NATURALEZA Y NUESTRO ENTORNO, DISFRUTANDO ASÍ CADA PASO QUE DAMOS EN NUESTRA NACIÓN Y NUESTRA TIERRA.

QUE HOY LA NATURALEZA Y LA MONTAÑA SE SOMETAN A TU ORDEN Y A TU PROTECCIÓN..... PARA QUE CONVIVAMOS CON ELLA DE MANERA PASIVA Y ARMONIOSA.

FORTALECE NUESTRA AMISTAD, NUESTRA HERMANDAD Y DIOS CUBRA CON SU SANGRE PRECIOSA A ESTE GRUPO LLAMADO LA TRIBU.`;

let tamanioOracion = 1.25;
function abrirOracionTribu() {
    const contenedor = document.getElementById('oracion-contenido');
    if (!contenedor) return;
    const guardada = localStorage.getItem('tribu_oracion') || ORACION_TRIBU;
    contenedor.innerText = guardada;
    contenedor.style.fontSize = tamanioOracion + 'rem';
    modalOracionTribu.show();
}

function guardarOracionTribu() {
    const contenedor = document.getElementById('oracion-contenido');
    if (contenedor) {
        localStorage.setItem('tribu_oracion', contenedor.innerText);
    }
}

function cambiarTamanioOracion(delta) {
    tamanioOracion = Math.max(0.8, Math.min(3.0, tamanioOracion + delta));
    const contenedor = document.getElementById('oracion-contenido');
    if (contenedor) contenedor.style.fontSize = tamanioOracion + 'rem';
}

function compartirOracionWhatsApp() {
    const contenedor = document.getElementById('oracion-contenido');
    const texto = contenedor ? contenedor.innerText : ORACION_TRIBU;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

// --- EDITOR DE FLYERS ---
const FLYER_RATIOS = { '9:16': [1080, 1920], '16:9': [1920, 1080] };
let flyerImg = null;
let flyerCurrentFileName = 'flyer';
let flyerListenersAdded = false;
