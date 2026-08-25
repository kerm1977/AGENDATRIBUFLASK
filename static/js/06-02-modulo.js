function toggleCamposDirectorioPorTipo() {
    const tipo = document.getElementById('directorio-tipo').value;
    const pais = document.getElementById('directorio-pais').value;
    const esPersona = tipo === 'Persona';
    const esCamino = tipo === 'El Camino de Costa Rica';
    const esCostaRica = pais === 'Costa Rica';
    const ocultarContacto = ['Parque Nacional', 'Bosque Nuboso', 'Reserva Biológica'].includes(tipo);

    const campoPais = document.getElementById('directorio-campo-pais');
    const campoLugar = document.getElementById('directorio-campo-lugar');
    const campoLugarTexto = document.getElementById('directorio-campo-lugar-texto');
    const camposPersona = document.getElementById('directorio-campos-persona');
    const camposLugar = document.getElementById('directorio-campos-lugar');
    const camposCamino = document.getElementById('directorio-campos-camino');
    const camposContacto = document.getElementById('directorio-campos-contacto-entidad');
    const telefonoLabel = document.getElementById('directorio-telefono-label');

    // Usamos classList (d-none) en vez de style.display para que no
    // choque con el !important de las utilidades de Bootstrap.
    if (campoPais) campoPais.classList.toggle('d-none', esPersona || esCamino);
    if (camposPersona) camposPersona.classList.toggle('d-none', !esPersona);
    if (camposLugar) camposLugar.classList.toggle('d-none', esPersona || esCamino);
    if (camposCamino) camposCamino.classList.toggle('d-none', !esCamino);
    if (camposContacto) camposContacto.classList.toggle('d-none', ocultarContacto);
    if (telefonoLabel) telefonoLabel.innerText = esPersona ? 'Teléfono' : 'Teléfono principal';

    if (esPersona) {
        if (campoLugar) campoLugar.classList.add('d-none');
        if (campoLugarTexto) campoLugarTexto.classList.add('d-none');
    } else if (esCostaRica && !esCamino) {
        if (campoLugar) campoLugar.classList.remove('d-none');
        if (campoLugarTexto) campoLugarTexto.classList.add('d-none');
    } else if (!esCamino) {
        if (campoLugar) campoLugar.classList.add('d-none');
        if (campoLugarTexto) campoLugarTexto.classList.remove('d-none');
    }
}

function validarDuplicadoDirectorio(nombre, cedula, pasaporte, telefono, correo, idExcluir = '') {
    const n = (nombre || '').toLowerCase().trim();
    const c = (cedula || '').toLowerCase().trim();
    const pas = (pasaporte || '').toLowerCase().trim();
    const t = (telefono || '').toLowerCase().trim();
    const m = (correo || '').toLowerCase().trim();

    // Función para obtener primeras dos palabras
    const dosPalabras = (texto) => {
        const partes = texto.split(/\s+/).filter(w => w);
        return partes.slice(0, 2).join(' ');
    };

    const n2 = dosPalabras(n);

    // Duplicado por nombre: igual completo o mismo primeras dos palabras
    const duplicadoNombre = n && directorioPersonas.find(p => {
        if (p.id === idExcluir) return false;
        const pn = (p.nombre || '').toLowerCase().trim();
        const pn2 = dosPalabras(pn);
        return pn === n || pn2 === n2;
    });
    if (duplicadoNombre) {
        return { tipo: 'nombre similar', valor: duplicadoNombre.nombre };
    }

    // Duplicado por cédula
    const duplicadoCedula = c && directorioPersonas.find(p => p.id !== idExcluir && (p.cedula || '').toLowerCase() === c);
    if (duplicadoCedula) return { tipo: 'cédula', valor: duplicadoCedula.nombre || duplicadoCedula.cedula };

    // Duplicado por pasaporte
    const duplicadoPasaporte = pas && directorioPersonas.find(p => p.id !== idExcluir && (p.pasaporte || '').toLowerCase() === pas);
    if (duplicadoPasaporte) return { tipo: 'pasaporte', valor: duplicadoPasaporte.nombre || duplicadoPasaporte.pasaporte };

    // Duplicado por teléfono
    const duplicadoTelefono = t && directorioPersonas.find(p => p.id !== idExcluir && (p.telefono || '').toLowerCase() === t);
    if (duplicadoTelefono) return { tipo: 'teléfono', valor: duplicadoTelefono.nombre || duplicadoTelefono.telefono };

    // Duplicado por correo
    const duplicadoCorreo = m && directorioPersonas.find(p => p.id !== idExcluir && (p.correo || '').toLowerCase() === m);
    if (duplicadoCorreo) return { tipo: 'correo', valor: duplicadoCorreo.nombre || duplicadoCorreo.correo };

    return null;
}
