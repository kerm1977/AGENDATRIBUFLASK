function parseHtmlForWhatsApp(html) {
    if (!html) return "";
    let text = html;
    // Reemplazar quiebres de línea HTML y divs
    text = text.replace(/<br\s*[\/]?>/gi, "\n");
    text = text.replace(/<\/div>\s*<div[^>]*>/gi, "\n");
    text = text.replace(/<div[^>]*>/gi, "");
    text = text.replace(/<\/div>/gi, "\n");
    text = text.replace(/<\/p>/gi, "\n");
    // Reemplazar viñetas y números (aproximación rápida)
    text = text.replace(/<li>(.*?)<\/li>/gi, "- $1\n");
    // Reemplazar negritas
    text = text.replace(/<b>(.*?)<\/b>/gi, "*$1*");
    text = text.replace(/<strong>(.*?)<\/strong>/gi, "*$1*");
    // Quitar el resto de etiquetas HTML que WhatsApp no soporta (incluyendo alineaciones)
    text = text.replace(/<[^>]+>/g, '');
    
    // Decodificar entidades especiales (ej. &nbsp; a espacio)
    let doc = new DOMParser().parseFromString(text, "text/html");
    let cleanText = doc.documentElement.textContent || "";
    
    // Limpiar dobles saltos de línea innecesarios al inicio y final
    return cleanText.trim();
}

function enviarPorWhatsAppDirecto() {
    const cam = caminatas.find(c => c.id === currentCaminataId);
    if(!cam || !cam.pasajeros || cam.pasajeros.length === 0) {
        showToast("No hay caminantes para enviar", "warning");
        return;
    }
    const texto = generarMensajeWhatsApp(cam);
    const encodedText = encodeURIComponent(texto);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
}

// --- STREAMING_CHUNK: Precios de Buseta ---
function actualizarProvinciasPrecioBuseta() {
    const tipo = document.getElementById('precio-buseta-tipo').value;
    const select = document.getElementById('precio-buseta-provincia');
    select.innerHTML = '';
    if (tipo === 'Internacional') {
        const opciones = ['Nicaragua', 'Panamá'];
        opciones.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.innerText = op;
            select.appendChild(option);
        });
    } else {
        const opciones = ['San José', 'Cartago', 'Alajuela', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];
        opciones.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.innerText = op;
            select.appendChild(option);
        });
    }
}

function openPrecioBusetaModal(id = null) {
    const label = document.getElementById('precio-buseta-label');
    const idInput = document.getElementById('precio-buseta-id');
    const tipoInput = document.getElementById('precio-buseta-tipo');
    const provinciaInput = document.getElementById('precio-buseta-provincia');
    const nombreInput = document.getElementById('precio-buseta-nombre');
    const montoInput = document.getElementById('precio-buseta-monto');

    if (id) {
        const item = preciosBuseta.find(p => p.id === id);
        if (!item) return;
        label.innerText = 'Editar Precio';
        idInput.value = item.id;
        tipoInput.value = item.tipo || 'Local';
        actualizarProvinciasPrecioBuseta();
        provinciaInput.value = item.provincia || '';
        nombreInput.value = item.nombre;
        montoInput.value = item.monto;
    } else {
        label.innerText = 'Agregar Precio';
        idInput.value = '';
        tipoInput.value = 'Local';
        actualizarProvinciasPrecioBuseta();
        provinciaInput.value = 'San José';
        nombreInput.value = '';
        montoInput.value = '';
    }
    modalPrecioBuseta.show();
}

function compartirPreciosWhatsApp() {
    if (preciosBuseta.length === 0) {
        showToast("No hay precios para compartir", "danger");
        return;
    }

    const sorted = [...preciosBuseta].sort((a, b) => {
        const provA = (a.provincia || '').toLowerCase();
        const provB = (b.provincia || '').toLowerCase();
        if (provA !== provB) return provA.localeCompare(provB);
        return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
    });

    const grupos = {};
    sorted.forEach(item => {
        const key = item.provincia || 'Sin provincia';
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(item);
    });

    let mensaje = '*Lista de precios de Buseta Transavi*\n\n';
    Object.keys(grupos).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).forEach(provincia => {
        mensaje += `*${provincia}*\n`;
        grupos[provincia].forEach(item => {
            mensaje += `• ${item.nombre}: ₡${item.monto}\n`;
        });
        mensaje += '\n';
    });

    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
}

async function guardarPrecioBuseta() {
    const id = document.getElementById('precio-buseta-id').value;
    const tipo = document.getElementById('precio-buseta-tipo').value;
    const provincia = document.getElementById('precio-buseta-provincia').value.trim();
    const nombre = document.getElementById('precio-buseta-nombre').value.trim();
    const monto = Number(document.getElementById('precio-buseta-monto').value);

    if (!provincia) {
        showToast("La provincia/país es requerido", "danger");
        return;
    }
    if (!nombre) {
        showToast("El nombre es requerido", "danger");
        return;
    }
    if (!monto || monto <= 0) {
        showToast("El monto debe ser mayor a 0", "danger");
        return;
    }

    if (id) {
        const index = preciosBuseta.findIndex(p => p.id === id);
        if (index > -1) {
            preciosBuseta[index].tipo = tipo;
            preciosBuseta[index].provincia = provincia;
            preciosBuseta[index].nombre = nombre;
            preciosBuseta[index].monto = monto;
        }
    } else {
        preciosBuseta.push({
            id: Date.now().toString(),
            tipo: tipo,
            provincia: provincia,
            nombre: nombre,
            monto: monto
        });
    }

    await saveData();
    renderPrecios();
    actualizarContadorPreciosAjustes();
    modalPrecioBuseta.hide();
    showToast("Precio guardado");
}
