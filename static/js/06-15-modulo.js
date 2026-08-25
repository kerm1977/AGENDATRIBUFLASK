function actualizarContadorPreciosAjustes() {
    const span = document.getElementById('ajustes-precios-total');
    if (!span) return;
    const total = preciosBuseta.length;
    span.innerText = total > 0 ? `(${total})` : '';
}

// Estadísticas generales del sitio, mostradas arriba de todo en Ajustes.