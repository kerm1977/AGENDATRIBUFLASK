/* AGENDATRIBUPRO - Avisos, confirmaciones y escapado de HTML/JS
   Origen: AGENDATRIBUPRO.original.html lineas 3441-3488
   Extraido sin cambios de codigo (solo se quito la sangria de 8 espacios).
   No editar sin actualizar el original. */
function showToast(msg, type = "success") {
    const toast = document.createElement('div');
    toast.className = `position-fixed top-0 start-50 translate-middle-x mt-3 p-3 bg-${type} text-white rounded shadow`;
    toast.style.zIndex = 9999;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// Utilidad para texto enriquecido
function formatDoc(cmd, value = null) {
    document.execCommand(cmd, false, value);
    document.getElementById('cam-usu-nota').focus();
}

// --- CUSTOM CONFIRM MODAL ---
function showConfirm(title, message, callback, btnText = "Sí, proceder", btnClass = "btn-danger") {
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-message').innerText = message;
    
    const actionBtn = document.getElementById('confirm-action-btn');
    actionBtn.innerText = btnText;
    actionBtn.className = `btn btn-sm px-4 ${btnClass}`;
    
    confirmActionCallback = callback;
    modalConfirm.show();
}

function executeConfirmAction() {
    const cb = confirmActionCallback;
    confirmActionCallback = null;
    modalConfirm.hide();
    if (typeof cb === 'function') {
        setTimeout(cb, 300);
    }
}

// --- UTILS: escaping and WhatsApp preview ---
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : text;
    return div.innerHTML;
}

function escapeJsString(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

