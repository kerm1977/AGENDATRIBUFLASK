function importarNotasJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    showConfirm(
        'Importar Notas',
        'Esto AGREGARÁ las notas del archivo a las notas actuales. ¿Continuar?',
        async () => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.notas && Array.isArray(data.notas)) {
                        data.notas.forEach(n => {
                            if (!notas.find(x => x.id === n.id)) {
                                notas.push(n);
                            }
                        });
                        await saveData();
                        renderNotas();
                        event.target.value = '';
                        showToast('Notas importadas');
                    } else {
                        throw new Error('Formato inválido');
                    }
                } catch (error) {
                    showToast('El archivo no es un respaldo de notas válido', 'danger');
                }
            };
            reader.readAsText(file);
        }
    );
}

// === FIN MÓDULO JS: NOTAS / FLYER / UTILIDADES DE NOTAS ===

