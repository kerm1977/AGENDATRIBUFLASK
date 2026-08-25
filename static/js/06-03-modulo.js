async function guardarPersonaDirectorio() {
    const nombre = document.getElementById('directorio-nombre').value.trim();
    const tipo = document.getElementById('directorio-tipo').value || 'Persona';
    const esPersona = tipo === 'Persona';
    const esCamino = tipo === 'El Camino de Costa Rica';
    const ocultarContacto = !esPersona && ['Parque Nacional', 'Bosque Nuboso', 'Reserva Biológica'].includes(tipo);
    const etapaCamino = esCamino ? (document.getElementById('directorio-etapa').value || '') : '';
    const pais = esCamino ? 'Costa Rica' : (document.getElementById('directorio-pais').value || 'Costa Rica');
    const lugar = esCamino
        ? (document.getElementById('directorio-lugar-camino').value.trim() || '')
        : ((pais === 'Costa Rica'
            ? document.getElementById('directorio-lugar').value
            : document.getElementById('directorio-lugar-texto').value.trim()) || '');
    const telefono = document.getElementById('directorio-telefono').value.trim();
    const correo = document.getElementById('directorio-correo').value.trim();
    const notas = document.getElementById('directorio-notas').value.trim();
    const cedula = esPersona ? document.getElementById('directorio-cedula').value.trim() : '';
    const pasaporte = esPersona ? document.getElementById('directorio-pasaporte').value.trim() : '';
    const fechaNacimiento = esPersona ? (document.getElementById('directorio-nacimiento').value || '') : '';
    const tipoSangre = esPersona ? (document.getElementById('directorio-tipo-sangre').value || '') : '';
    const contactoEmergenciaNombre = esPersona ? document.getElementById('directorio-contacto-emergencia-nombre').value.trim() : '';
    const telefonoEmergencia = esPersona ? document.getElementById('directorio-telefono-emergencia').value.trim() : '';

    // Campos exclusivos de lugares / organizaciones
    const telefono2 = !esPersona && !esCamino ? document.getElementById('directorio-telefono2').value.trim() : '';
    const telefono3 = !esPersona && !esCamino ? document.getElementById('directorio-telefono3').value.trim() : '';
    const nombreContacto = (!esPersona && !ocultarContacto) ? document.getElementById('directorio-nombre-contacto').value.trim() : '';
    const telefonoContacto = (!esPersona && !ocultarContacto && !esCamino) ? document.getElementById('directorio-telefono-contacto').value.trim() : '';
    const urlMapa = !esPersona && !esCamino ? document.getElementById('directorio-url-mapa').value.trim() : '';
    const horario = !esPersona && !esCamino ? document.getElementById('directorio-horario').value.trim() : '';
    const precio = !esPersona && !esCamino ? (document.getElementById('directorio-precio').value || '') : '';
    const terreno = !esPersona && !esCamino ? terrenoDirectorioSeleccionado() : [];

    const idExcluir = document.getElementById('directorio-editar-id').value;
    const extra = {
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
    };

    if (!nombre) {
        showToast('El nombre es obligatorio', 'warning');
        return;
    }

    const duplicado = validarDuplicadoDirectorio(nombre, cedula, pasaporte, telefono, correo, idExcluir);
    if (duplicado) {
        showConfirm(
            'Dato duplicado',
            `Ya existe una persona con ese ${duplicado.tipo}: "${duplicado.valor}". ¿Querés guardar de todos modos?`,
            async () => await guardarPersonaDirectorioConfirmado(nombre, cedula, pasaporte, telefono, correo, notas, idExcluir, tipo, pais, lugar, fechaNacimiento, extra),
            'Sí, guardar',
            'btn-warning'
        );
        return;
    }

    await guardarPersonaDirectorioConfirmado(nombre, cedula, pasaporte, telefono, correo, notas, idExcluir, tipo, pais, lugar, fechaNacimiento, extra);
}
