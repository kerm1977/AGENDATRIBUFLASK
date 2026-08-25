function agregarFormaPago(tipo) {
    const inputId = tipo === 'sinpe' ? 'nuevo-sinpe' : 'nueva-cuenta';
    const input = document.getElementById(inputId);
    const valor = (input.value || '').trim();
    if (!valor) return;
    if (!configTema.formasPago[tipo].some(x => x.toLowerCase() === valor.toLowerCase())) {
        configTema.formasPago[tipo].push(valor);
        saveData();
    }
    input.value = '';
    renderFormasPago();
}

function eliminarFormaPago(tipo, index) {
    if (index < 0 || index >= configTema.formasPago[tipo].length) return;
    const nombre = tipo === 'sinpe' ? 'SINPE' : 'cuenta bancaria';
    const valor = configTema.formasPago[tipo][index];

    showConfirm(
        `1/3 - Eliminar ${nombre}`,
        `¿Estás seguro de que querés borrar este ${nombre}?\n\n"${valor}"`,
        () => {
            showConfirm(
                `2/3 - Advertencia`,
                `Esta acción no se puede deshacer. La información no se puede recuperar. ¿Continuar?`,
                () => {
                    showConfirm(
                        `3/3 - Confirmación final`,
                        `¿Borrar definitivamente este ${nombre}?`,
                        () => {
                            configTema.formasPago[tipo].splice(index, 1);
                            saveData();
                            renderFormasPago();
                            showToast(`${nombre.charAt(0).toUpperCase() + nombre.slice(1)} eliminado`, 'success');
                        },
                        'Sí, borrar'
                    );
                },
                'Sí, continuar'
            );
        },
        'Sí, estoy seguro'
    );
}

function editarFormaPago(tipo, index) {
    const actual = configTema.formasPago[tipo][index];
    if (actual === undefined) return;
    const nuevo = prompt(tipo === 'sinpe' ? 'Editar número SINPE:' : 'Editar cuenta bancaria:', actual);
    if (nuevo === null) return;
    const valor = nuevo.trim();
    if (!valor) return;
    configTema.formasPago[tipo][index] = valor;
    saveData();
    renderFormasPago();
}

function llenarTarjetaCuentas() {
    const sinpeLista = configTema.formasPago?.sinpe || [];
    const cuentasLista = configTema.formasPago?.cuentas || [];
    
    const sinpeCont = document.getElementById('tarjeta-cuentas-sinpe-lista');
    const cuentasCont = document.getElementById('tarjeta-cuentas-bancarias-lista');
    
    if (sinpeCont) {
        sinpeCont.innerHTML = sinpeLista.map(s => `
            <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; color: #111b21; font-size: 13px; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <i class="fas fa-mobile-alt" style="color: #25D366; margin-right: 8px;"></i>${escapeHtml(s)}
            </div>
        `).join('') || '<p style="color: #6c757d; font-size: 12px; font-style: italic;">Sin SINPE registrado</p>';
    }
    
    if (cuentasCont) {
        cuentasCont.innerHTML = cuentasLista.map(c => `
            <div style="background: #ffffff; border: 1px solid #dbeafe; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; color: #111b21; font-size: 13px; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <i class="fas fa-university" style="color: #2563eb; margin-right: 8px;"></i>${escapeHtml(c)}
            </div>
        `).join('') || '<p style="color: #6c757d; font-size: 12px; font-style: italic;">Sin cuentas registradas</p>';
    }
}

async function descargarTarjetaCuentasPNG() {
    llenarTarjetaCuentas();
    
    const preview = document.getElementById('tarjeta-cuentas-preview');
    if (!preview) return;
    
    try {
        // Hacer visible temporalmente para capturar
        const originalOpacity = preview.style.opacity;
        preview.style.opacity = '1';
        
        const canvas = await html2canvas(preview.firstElementChild, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            logging: false
        });
        
        preview.style.opacity = originalOpacity;
        
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `cuentas_tribu_de_los_libres_${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        
        showToast('Tarjeta descargada como PNG');
    } catch (err) {
        console.error('Error generando PNG:', err);
        showToast('Error al generar la imagen PNG', 'danger');
    }
}

function compartirTarjetaCuentasWhatsApp() {
    const sinpeLista = configTema.formasPago?.sinpe || [];
    const cuentasLista = configTema.formasPago?.cuentas || [];
    
    let texto = '💳 *CUENTAS DE LA TRIBU DE LOS LIBRES*\n\n';
    
    if (sinpeLista.length > 0) {
        texto += '📱 *SINPE Móvil:*\n';
        sinpeLista.forEach(s => {
            texto += `• ${s}\n`;
        });
        texto += '\n';
    }
    
    if (cuentasLista.length > 0) {
        texto += '🏦 *Cuentas Bancarias:*\n';
        cuentasLista.forEach(c => {
            texto += `• ${c}\n`;
        });
    }
    
    if (sinpeLista.length === 0 && cuentasLista.length === 0) {
        texto += 'No hay formas de pago configuradas.';
    }
    
    const encodedText = encodeURIComponent(texto.trim());
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
}

function descargarTarjetaCuentasTXT() {
    const sinpeLista = configTema.formasPago?.sinpe || [];
    const cuentasLista = configTema.formasPago?.cuentas || [];
    
    let texto = 'CUENTAS DE LA TRIBU DE LOS LIBRES\n';
    texto += '====================================\n\n';
    
    if (sinpeLista.length > 0) {
        texto += 'SINPE Móvil:\n';
        texto += '------------\n';
        sinpeLista.forEach(s => {
            texto += `• ${s}\n`;
        });
        texto += '\n';
    }
    
    if (cuentasLista.length > 0) {
        texto += 'Cuentas Bancarias:\n';
        texto += '------------------\n';
        cuentasLista.forEach(c => {
            texto += `• ${c}\n`;
        });
    }
    
    if (sinpeLista.length === 0 && cuentasLista.length === 0) {
        texto += 'No hay formas de pago configuradas.';
    }
    
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuentas_tribu_de_los_libres_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Tarjeta descargada como TXT');
}
