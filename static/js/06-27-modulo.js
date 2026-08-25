async function buscarSimilitudesDuplicados() {
    if (directorioPersonas.length < 2) {
        showToast('No hay suficientes contactos para comparar', 'warning');
        return;
    }

    const gruposNombre = {};
    const duplicadosCedula = [];
    const duplicadosPasaporte = [];
    const duplicadosTelefono = [];

    directorioPersonas.forEach(p => {
        const clave = dosPalabrasNombre(p.nombre);
        if (!clave) return;
        if (!gruposNombre[clave]) gruposNombre[clave] = [];
        gruposNombre[clave].push(p);
    });

    const gruposNombreDup = Object.values(gruposNombre).filter(g => g.length > 1);
    const contactosPorNombre = new Set();
    gruposNombreDup.forEach(g => g.forEach(p => contactosPorNombre.add(p.id)));

    const encontrarDuplicados = (campo) => {
        const mapa = {};
        directorioPersonas.forEach(p => {
            const val = (p[campo] || '').trim().toLowerCase();
            if (!val) return;
            if (!mapa[val]) mapa[val] = [];
            mapa[val].push(p);
        });
        return Object.values(mapa).filter(g => g.length > 1);
    };

    const gruposCedula = encontrarDuplicados('cedula');
    const gruposPasaporte = encontrarDuplicados('pasaporte');
    const gruposTelefono = encontrarDuplicados('telefono');

    const totalNombres = contactosPorNombre.size;
    const totalCedulas = gruposCedula.reduce((acc, g) => acc + g.length, 0);
    const totalPasaportes = gruposPasaporte.reduce((acc, g) => acc + g.length, 0);
    const totalTelefonos = gruposTelefono.reduce((acc, g) => acc + g.length, 0);
    const totalDuplicados = totalNombres + totalCedulas + totalPasaportes + totalTelefonos;

    if (totalDuplicados === 0) {
        showToast('No se encontraron similitudes ni duplicados', 'success');
        return;
    }

    const detalles = [];
    if (totalNombres > 0) detalles.push(`${totalNombres} por nombre`);
    if (totalCedulas > 0) detalles.push(`${totalCedulas} por cédula`);
    if (totalPasaportes > 0) detalles.push(`${totalPasaportes} por pasaporte`);
    if (totalTelefonos > 0) detalles.push(`${totalTelefonos} por teléfono`);

    const mensaje = `Se encontraron ${totalDuplicados} contactos duplicados:\n${detalles.join('\n')}\n\n¿Querés fusionarlos ahora?`;

    showConfirm(
        'Duplicados encontrados',
        mensaje,
        async () => await fusionarSimilitudesDuplicados(gruposNombreDup, gruposCedula, gruposPasaporte, gruposTelefono),
        'Fusionar',
        'btn-warning'
    );
}
