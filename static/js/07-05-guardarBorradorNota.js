function guardarBorradorNota() {
    sincronizarChecksNota();
    const titulo = document.getElementById('nota-titulo').value || '';
    const contenido = document.getElementById('nota-contenido').innerHTML || '';
    localStorage.setItem('borrador_nota_titulo', titulo);
    localStorage.setItem('borrador_nota_contenido', contenido);
    localStorage.setItem('borrador_nota_id', currentNotaId || '');
}

function confirmarCancelarNota() {
    const titulo = document.getElementById('nota-titulo').value.trim();
    const contenido = document.getElementById('nota-contenido').innerHTML.trim();
    const hayContenido = titulo !== '' || (contenido !== '' && contenido !== '<br>' && contenido !== '<p><br></p>');

    if (!hayContenido) {
        limpiarBorradorNota();
        modalNota.hide();
        return;
    }

    modalCancelarNota.show();
}

function descartarNota() {
    modalCancelarNota.hide();
    limpiarBorradorNota();
    setTimeout(() => modalNota.hide(), 300);
}

function limpiarBorradorNota() {
    localStorage.removeItem('borrador_nota_titulo');
    localStorage.removeItem('borrador_nota_contenido');
    localStorage.removeItem('borrador_nota_id');
    document.getElementById('nota-titulo').value = '';
    document.getElementById('nota-contenido').innerHTML = '';
    currentNotaId = null;
}

function filterNotas() {
    const val = document.getElementById('search-notas').value;
    renderNotas(val);
}

function renderNotas(filterText = '') {
    const cont = document.getElementById('lista-notas');
    cont.innerHTML = '';

    let lista = [...notas].sort((a, b) => new Date(b.actualizada) - new Date(a.actualizada));

    if (filterText.trim()) {
        const lower = filterText.toLowerCase();
        lista = lista.filter(n => {
            const creada = n.creada ? new Date(n.creada).toLocaleString().toLowerCase() : '';
            const actualizada = n.actualizada ? new Date(n.actualizada).toLocaleString().toLowerCase() : '';
            const titulo = (n.titulo || '').toLowerCase();
            const contenidoTexto = (n.contenido || '').replace(/<[^>]*>?/gm, ' ').toLowerCase();
            return titulo.includes(lower) ||
                   creada.includes(lower) ||
                   actualizada.includes(lower) ||
                   contenidoTexto.includes(lower);
        });
    }

    if (lista.length === 0) {
        cont.innerHTML = '<p class="text-muted small text-center my-5">No hay notas. Tocá el botón + para crear una.</p>';
        return;
    }

    lista.forEach(nota => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6';

        const preview = nota.contenido
            ? nota.contenido.replace(/<[^>]*>?/gm, ' ').substring(0, 120) + (nota.contenido.length > 120 ? '...' : '')
            : '';

        const titulo = nota.titulo || 'Sin título';
        const actualizada = nota.actualizada ? new Date(nota.actualizada).toLocaleString() : '';

        col.innerHTML = `
            <div class="card border-0 shadow-sm" style="cursor: pointer;" onclick="abrirEditorNota('${escapeJsString(nota.id)}')">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="card-title fw-bold mb-1">${escapeHtml(titulo)}</h6>
                        <i class="fas fa-trash text-danger" style="cursor: pointer; opacity: 0.7;" onclick="event.stopPropagation(); confirmarEliminarNota('${escapeJsString(nota.id)}')" title="Eliminar nota"></i>
                    </div>
                    <p class="text-muted small mb-1" style="font-size: 0.8rem; min-height: 1.2em;">${escapeHtml(preview)}</p>
                    <div class="text-muted" style="font-size: 0.7rem;">${actualizada}</div>
                </div>
            </div>
        `;

        cont.appendChild(col);
    });
}

function confirmarEliminarNota(id) {
    const nota = notas.find(n => n.id === id);
    const titulo = nota ? nota.titulo : '';
    showConfirm(
        'Eliminar nota (1/3)',
        `¿Seguro que querés eliminar la nota "${titulo}"?`,
        () => {
            setTimeout(() => {
                showConfirm(
                    'Eliminar nota (2/3)',
                    'Una vez eliminada, no se puede recuperar. ¿Continuar?',
                    () => {
                        setTimeout(() => {
                            showConfirm(
                                'Eliminar nota (3/3)',
                                'Confirmación final. ¿Eliminar definitivamente?',
                                async () => {
                                    notas = notas.filter(n => n.id !== id);
                                    await saveData();
                                    renderNotas();
                                    showToast('Nota eliminada');
                                },
                                'Sí, eliminar',
                                'btn-danger'
                            );
                        }, 350);
                    },
                    'Continuar',
                    'btn-danger'
                );
            }, 350);
        },
        'Continuar',
        'btn-danger'
    );
}

function exportarNotasJSON() {
    const data = { notas: notas, exportDate: new Date().toISOString() };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Notas_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Notas exportadas');
}

async function exportarNotasWhatsApp() {
    const data = { notas: notas, exportDate: new Date().toISOString() };
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Notas_${dateStr}.json`;

    if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'application/json' })] })) {
        const file = new File([blob], fileName, { type: 'application/json' });
        await navigator.share({ title: 'Respaldo de Notas', text: 'Respaldo JSON de notas', files: [file] });
    } else {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(content);
        const link = document.createElement('a');
        link.href = dataStr;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('Notas descargadas. Se abrió WhatsApp para que elijas con quién compartirlas.');
        abrirWhatsAppParaAdjuntar(fileName);
    }
}

// NO MODIFICAR: Función para exportar notas a TXT
function exportarNotasTXT() {
    if (!notas || notas.length === 0) {
        showToast('No hay notas para exportar', 'warning');
        return;
    }
    const lineas = [];
    [...notas].sort((a, b) => new Date(a.creada || 0) - new Date(b.creada || 0)).forEach((nota) => {
        const titulo = (nota.titulo || '').trim() || 'Sin título';
        const creada = nota.creada ? new Date(nota.creada).toLocaleString() : '';
        const actualizada = nota.actualizada ? new Date(nota.actualizada).toLocaleString() : '';
        const contenido = (nota.contenido || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        lineas.push(`*${titulo}*`);
        if (creada) lineas.push(`- Creada: ${creada}`);
        if (actualizada) lineas.push(`- Actualizada: ${actualizada}`);
        if (contenido) {
            lineas.push('');
            lineas.push(contenido);
        }
        lineas.push('');
        lineas.push('────────────────────────────────────────');
        lineas.push('');
    });
    const texto = lineas.join('\n');
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Notas_${dateStr}.txt`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Notas exportadas a TXT');
}
