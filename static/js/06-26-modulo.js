function generarTextoDirectorio(persona) {
    if (!persona) return '';
    const sr = (valor) => {
        const v = (valor === null || valor === undefined) ? '' : valor.toString().trim();
        return v !== '' ? v : 'Sin registrar';
    };
    const tipo = persona.tipo || 'Persona';
    const esPersona = tipo === 'Persona';
    const esCamino = tipo === 'El Camino de Costa Rica';
    const ocultarContacto = !esPersona && ['Parque Nacional', 'Bosque Nuboso', 'Reserva Biológica'].includes(tipo);

    let texto = `*${sr(persona.nombre)}*\n`;
    texto += `Grupo: ${sr(tipo)}\n`;
    if (esCamino) {
        texto += `Etapa: ${sr(persona.etapaCamino)}\n`;
        texto += `Nombre del lugar: ${sr(persona.lugar)}\n`;
        texto += `Nombre de contacto: ${sr(persona.nombreContacto)}\n`;
    } else if (!esPersona) {
        texto += `País: ${sr(persona.pais || 'Costa Rica')}\n`;
        texto += `Lugar: ${sr(persona.lugar)}\n`;
    }
    if (esPersona) {
        texto += `Cédula: ${sr(persona.cedula)}\n`;
        texto += `Pasaporte: ${sr(persona.pasaporte)}\n`;
    }
    texto += `Teléfono: ${sr(persona.telefono)}\n`;
    if (!esPersona && !esCamino && persona.telefono2) texto += `Teléfono 2: ${sr(persona.telefono2)}\n`;
    if (!esPersona && !esCamino && persona.telefono3) texto += `Teléfono 3: ${sr(persona.telefono3)}\n`;
    texto += `Correo electrónico: ${sr(persona.correo)}\n`;
    if (esPersona) {
        texto += `Fecha de nacimiento: ${sr(persona.fechaNacimiento)}\n`;
        texto += `Tipo de sangre: ${sr(persona.tipoSangre)}\n`;
        texto += `Contacto de emergencia: ${sr(persona.contactoEmergenciaNombre)}\n`;
        texto += `Teléfono de emergencia: ${sr(persona.telefonoEmergencia)}\n`;
    } else if (!esCamino) {
        if (!ocultarContacto) texto += `Nombre de contacto: ${sr(persona.nombreContacto)}\n`;
        if (!ocultarContacto) texto += `Teléfono de contacto: ${sr(persona.telefonoContacto)}\n`;
        texto += `URL de Google Maps: ${sr(persona.urlMapa)}\n`;
        if (persona.horario) texto += `Horario de atención: ${sr(persona.horario)}\n`;
        if (persona.terreno && persona.terreno.length) texto += `Terreno: ${persona.terreno.join(', ')}\n`;
        if (persona.precio) texto += `Precio de ingreso: ₡${persona.precio} por persona\n`;
    }
    texto += `Notas: ${sr(persona.notas)}\n`;
    return texto.trim();
}

function compartirWhatsAppDirectorio() {
    if (!directorioEnEdicion) return;
    const waLink = enlaceWhatsAppDirectorio(directorioEnEdicion.telefono);
    if (waLink) {
        window.open(waLink, '_blank');
    } else {
        const texto = generarTextoDirectorio(directorioEnEdicion);
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    }
}

function dosPalabrasNombre(nombre) {
    const partes = (nombre || '').toLowerCase().trim().split(/\s+/).filter(w => w);
    return partes.slice(0, 2).join(' ');
}
