function initFlyerEditor() {
    const canvas = document.getElementById('flyer-canvas');
    if (!canvas) return;
    flyerSetCanvasSize('9:16');
    flyerUpdateLabels();
    if (!flyerListenersAdded) flyerAddListeners();
}

function flyerAddListeners() {
    if (flyerListenersAdded) return;
    flyerListenersAdded = true;
    const canvas = document.getElementById('flyer-canvas');
    const fileInput = document.getElementById('flyer-file-input');
    const scaleInput = document.getElementById('flyer-scale');
    const rotateInput = document.getElementById('flyer-rotate');
    const posXInput = document.getElementById('flyer-pos-x');
    const posYInput = document.getElementById('flyer-pos-y');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (!f) return;
            flyerCurrentFileName = f.name.replace(/\.[^/.]+$/, '');
            if (f.type === 'application/pdf') {
                flyerLoadPdf(f);
            } else {
                flyerLoadImage(URL.createObjectURL(f));
            }
        });
    }

    [scaleInput, rotateInput, posXInput, posYInput].forEach(el => {
        if (el) el.addEventListener('input', () => { flyerUpdateLabels(); flyerDraw(); });
    });

    document.querySelectorAll('input[name="flyer-aspect"]').forEach(r => {
        r.addEventListener('change', () => flyerSetCanvasSize(flyerGetSelectedAspect()));
    });

    const collapseFlyer = document.getElementById('acc-flyer-editor');
    if (collapseFlyer) {
        collapseFlyer.addEventListener('shown.bs.collapse', () => {
            flyerSetCanvasSize(flyerGetSelectedAspect());
            flyerUpdateLabels();
            flyerDraw();
        });
    }
}

function flyerGetSelectedAspect() {
    const radios = document.getElementsByName('flyer-aspect');
    for (const r of radios) if (r.checked) return r.value;
    return '9:16';
}

function flyerSetCanvasSize(ratio) {
    const canvas = document.getElementById('flyer-canvas');
    if (!canvas) return;
    const [w, h] = FLYER_RATIOS[ratio];
    canvas.width = w;
    canvas.height = h;
    flyerDraw();
}

function flyerDraw() {
    const canvas = document.getElementById('flyer-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    if (!flyerImg) return;

    const posXInput = document.getElementById('flyer-pos-x');
    const posYInput = document.getElementById('flyer-pos-y');
    const rotateInput = document.getElementById('flyer-rotate');
    const scaleInput = document.getElementById('flyer-scale');

    const cx = w / 2 + parseInt(posXInput ? posXInput.value : 0, 10);
    const cy = h / 2 + parseInt(posYInput ? posYInput.value : 0, 10);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(parseInt(rotateInput ? rotateInput.value : 0, 10) * Math.PI / 180);
    const s = parseFloat(scaleInput ? scaleInput.value : 1);
    ctx.scale(s, s);
    ctx.drawImage(flyerImg, -flyerImg.width / 2, -flyerImg.height / 2);
    ctx.restore();
}

function flyerUpdateLabels() {
    const scaleInput = document.getElementById('flyer-scale');
    const rotateInput = document.getElementById('flyer-rotate');
    const posXInput = document.getElementById('flyer-pos-x');
    const posYInput = document.getElementById('flyer-pos-y');

    const scaleEl = document.getElementById('flyer-val-scale');
    const rotateEl = document.getElementById('flyer-val-rotate');
    const posXEl = document.getElementById('flyer-val-pos-x');
    const posYEl = document.getElementById('flyer-val-pos-y');

    if (scaleEl && scaleInput) scaleEl.innerText = Math.round(parseFloat(scaleInput.value) * 100) + '%';
    if (rotateEl && rotateInput) rotateEl.innerText = rotateInput.value + '°';
    if (posXEl && posXInput) posXEl.innerText = posXInput.value;
    if (posYEl && posYInput) posYEl.innerText = posYInput.value;
}

function flyerLoadImage(url) {
    const temp = new Image();
    temp.onload = () => { flyerImg = temp; flyerCentrarImagen(); };
    temp.src = url;
}

function flyerCentrarImagen() {
    const canvas = document.getElementById('flyer-canvas');
    if (!canvas) return;
    if (!flyerImg) return;

    // Calcular escala para que la imagen quepa centrada dejando un pequeño margen
    const scaleX = canvas.width / flyerImg.width;
    const scaleY = canvas.height / flyerImg.height;
    const s = Math.min(scaleX, scaleY) * 0.95;

    document.getElementById('flyer-scale').value = s.toFixed(2);
    document.getElementById('flyer-rotate').value = 0;
    document.getElementById('flyer-pos-x').value = 0;
    document.getElementById('flyer-pos-y').value = 0;

    flyerUpdateLabels();
    flyerDraw();
}

function flyerLoadPdf(file) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument({ data: typedarray }).promise.then(pdf => {
            pdf.getPage(1).then(page => {
                const scale = 2;
                const viewport = page.getViewport({ scale });
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = viewport.width;
                tempCanvas.height = viewport.height;
                page.render({ canvasContext: tempCtx, viewport }).promise.then(() => {
                    flyerLoadImage(tempCanvas.toDataURL());
                });
            });
        });
    };
    fileReader.readAsArrayBuffer(file);
}

function flyerResetAjustes() {
    if (flyerImg) {
        flyerCentrarImagen();
    } else {
        document.getElementById('flyer-scale').value = 1;
        document.getElementById('flyer-rotate').value = 0;
        document.getElementById('flyer-pos-x').value = 0;
        document.getElementById('flyer-pos-y').value = 0;
        flyerUpdateLabels();
        flyerDraw();
    }
}

function flyerExportarPNG() {
    const canvas = document.getElementById('flyer-canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = flyerCurrentFileName + '_' + flyerGetSelectedAspect().replace(':', 'x') + '.png';
    a.click();
}

function flyerExportarPDF() {
    const canvas = document.getElementById('flyer-canvas');
    if (!canvas) return;
    const { jsPDF } = window.jspdf;
    const ratio = flyerGetSelectedAspect();
    const w = canvas.width;
    const h = canvas.height;
    const pxToMm = 0.264583;
    const pageW = w * pxToMm;
    const pageH = h * pxToMm;
    const orientation = w > h ? 'l' : 'p';
    const doc = new jsPDF({ orientation: orientation, unit: 'mm', format: [pageW, pageH] });
    const data = canvas.toDataURL('image/jpeg', 1.0);
    doc.addImage(data, 'JPEG', 0, 0, pageW, pageH);
    doc.save(flyerCurrentFileName + '_' + ratio.replace(':', 'x') + '.pdf');
}

async function guardarNota() {
    try {
        sincronizarChecksNota();
        const titulo = document.getElementById('nota-titulo').value.trim() || 'Sin título';
        const contenido = document.getElementById('nota-contenido').innerHTML;
        const fecha = new Date().toISOString();

        const recordatorioFecha = notaRecordatorioFechaPendiente || notaRecordatorioFechaExistente || null;

        if (currentNotaId) {
        const index = notas.findIndex(n => n.id === currentNotaId);
        if (index > -1) {
            const notaExistente = notas[index];
            const oldRecordatorioFecha = notaExistente.recordatorioFecha;
            const oldRecordatorioVisto = notaExistente.recordatorioVisto;

            notaExistente.titulo = titulo;
            notaExistente.contenido = contenido;
            notaExistente.actualizada = fecha;
            notaExistente.recordatorioFecha = recordatorioFecha;

            if (!recordatorioFecha) {
                // Recordatorio desactivado: se conserva el visto anterior por si se reactiva
                notaExistente.recordatorioVisto = oldRecordatorioVisto;
            } else if (recordatorioFecha === oldRecordatorioFecha) {
                // Misma fecha: se conserva el visto anterior
                notaExistente.recordatorioVisto = oldRecordatorioVisto;
            } else {
                // Fecha distinta: se reinicia el visto
                notaExistente.recordatorioVisto = false;
            }
        }
    } else {
        notas.push({
            id: Date.now().toString(),
            titulo,
            contenido,
            creada: fecha,
            actualizada: fecha,
            recordatorioFecha: recordatorioFecha,
            recordatorioVisto: false
        });
    }

        await saveData();
        localStorage.removeItem('borrador_nota_titulo');
        localStorage.removeItem('borrador_nota_contenido');
        localStorage.removeItem('borrador_nota_id');
        modalNota.hide();
        renderNotas();
        showToast('Nota guardada');
    } catch (err) {
        console.error('Error guardando nota:', err);
        showToast('Error al guardar la nota', 'danger');
    }
}
