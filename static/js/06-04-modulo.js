async function guardarPersonaDirectorioConfirmado(nombre, cedula, pasaporte, telefono, correo, notas, idExcluir, tipo = 'Persona', pais = 'Costa Rica', lugar = '', fechaNacimiento = '', extra = {}) {
    const formattedName = nombre.split(' ').filter(w => w).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    const {
        tipoSangre = '',
        contactoEmergenciaNombre = '',
        telefonoEmergencia = '',
        telefono2 = '',
        telefono3 = '',
        nombreContacto = '',
        telefonoContacto = '',
        urlMapa = '',
        horario = '',
        terreno = [],
        precio = '',
        etapaCamino = ''
    } = extra;

    if (idExcluir) {
        const index = directorioPersonas.findIndex(p => p.id === idExcluir);
        if (index > -1) {
            const oldNombre = directorioPersonas[index].nombre;
            directorioPersonas[index].nombre = formattedName;
            directorioPersonas[index].cedula = cedula;
            directorioPersonas[index].pasaporte = pasaporte;
            directorioPersonas[index].telefono = telefono;
            directorioPersonas[index].correo = correo;
            directorioPersonas[index].notas = notas;
            directorioPersonas[index].tipo = tipo;
            directorioPersonas[index].pais = pais;
            directorioPersonas[index].lugar = lugar;
            directorioPersonas[index].fechaNacimiento = fechaNacimiento;
            directorioPersonas[index].tipoSangre = tipoSangre;
            directorioPersonas[index].contactoEmergenciaNombre = contactoEmergenciaNombre;
            directorioPersonas[index].telefonoEmergencia = telefonoEmergencia;
            directorioPersonas[index].telefono2 = telefono2;
            directorioPersonas[index].telefono3 = telefono3;
            directorioPersonas[index].nombreContacto = nombreContacto;
            directorioPersonas[index].telefonoContacto = telefonoContacto;
            directorioPersonas[index].urlMapa = urlMapa;
            directorioPersonas[index].horario = horario;
            directorioPersonas[index].terreno = terreno;
            directorioPersonas[index].precio = precio;
            directorioPersonas[index].etapaCamino = etapaCamino;

            // Actualizar personasGlobales y caminatas si cambió el nombre
            if (oldNombre !== formattedName) {
                const pIndex = personasGlobales.indexOf(oldNombre);
                if (pIndex > -1) personasGlobales[pIndex] = formattedName;
                caminatas.forEach(cam => {
                    if (cam.pasajeros) {
                        cam.pasajeros.forEach(pas => {
                            if (pas.nombre === oldNombre) pas.nombre = formattedName;
                        });
                    }
                });
            }
        }
    } else {
        directorioPersonas.push({
            id: Date.now().toString(),
            nombre: formattedName,
            cedula,
            pasaporte,
            telefono,
            correo,
            notas,
            tipo,
            pais,
            lugar,
            fechaNacimiento,
            tipoSangre,
            contactoEmergenciaNombre,
            telefonoEmergencia,
            telefono2,
            telefono3,
            nombreContacto,
            telefonoContacto,
            urlMapa,
            horario,
            terreno,
            precio,
            etapaCamino
        });
        if (!personasGlobales.includes(formattedName)) {
            personasGlobales.push(formattedName);
        }
    }

    await saveData();
    modalAgregarDirectorio.hide();
    renderDirectorioList(document.getElementById('search-directorio').value);
    if (currentView === 'caminata') {
        renderCaminantes(document.getElementById('search-caminante').value);
    }
    showToast('Contacto guardado en el directorio');
}

function borrarDirectorio(id) {
    const persona = directorioPersonas.find(p => p.id === id);
    const nombre = persona ? persona.nombre : '';
    showConfirm(
        "Eliminar (1/3)",
        `¿Estás seguro de que deseas borrar a "${nombre}" del directorio global? (No se borrará de las caminatas donde ya esté agregado)`,
        () => {
            setTimeout(() => {
                showConfirm(
                    "Eliminar (2/3)",
                    "Esta acción borra el registro del directorio. ¿Continuar?",
                    () => {
                        setTimeout(() => {
                            showConfirm(
                                "Eliminar (3/3)",
                                "Una vez eliminado, el registro no se puede recuperar. ¿Confirmar?",
                                async () => {
                                    directorioPersonas = directorioPersonas.filter(p => p.id !== id);
                                    personasGlobales = personasGlobales.filter(p => p !== nombre);
                                    await saveData();
                                    renderDirectorioList(document.getElementById('search-directorio').value);
                                    showToast("Persona eliminada del directorio");
                                },
                                "Sí, eliminar",
                                "btn-danger"
                            );
                        }, 350);
                    },
                    "Continuar",
                    "btn-danger"
                );
            }, 350);
        },
        "Continuar",
        "btn-danger"
    );
}

const ICONOS_DIRECTORIO = {
    'Persona': 'fa-user',
    'Restaurante': 'fa-utensils',
    'Transporte Terrestre': 'fa-bus',
    'Lancha': 'fa-ship',
    'Hotel': 'fa-hotel',
    'Cabina': 'fa-bed',
    'Guía': 'fa-map-signs',
    'Finca': 'fa-tractor',
    'Parque Nacional': 'fa-tree',
    'Bosque Nuboso': 'fa-cloud',
    'Reserva Biológica': 'fa-leaf',
    'El Camino de Costa Rica': 'fa-hiking'
};

function iconoTipoDirectorio(tipo) {
    return ICONOS_DIRECTORIO[tipo] || 'fa-user';
}

function colorTipoDirectorio(tipo) {
    const map = {
        'Restaurante': '#dc2626',
        'Transporte Terrestre': '#2563eb',
        'Lancha': '#0891b2',
        'Hotel': '#7c3aed',
        'Cabina': '#0d9488',
        'Guía': '#ea580c',
        'Finca': '#65a30d',
        'Parque Nacional': '#15803d',
        'Bosque Nuboso': '#5f6c79',
        'Reserva Biológica': '#15803d',
        'El Camino de Costa Rica': '#0ea5e9',
        'Persona': '#6b7280'
    };
    return map[tipo] || '#6b7280';
}

function enlaceWhatsAppDirectorio(telefono) {
    const soloDigitos = (telefono || '').replace(/\D/g, '');
    if (!soloDigitos) return '';
    let numero = soloDigitos;
    if (/^[678]\d{7}$/.test(numero)) {
        numero = '506' + numero;
    }
    return `https://wa.me/${numero}`;
}

// --- CUMPLEAÑOS ---