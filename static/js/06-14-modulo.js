function borrarPrecioBuseta(id) {
    showConfirm(
        "1/3 - Borrar precio",
        "¿Estás seguro de eliminar este precio?",
        () => {
            showConfirm(
                "2/3 - Atención",
                "Si lo borrás, no se puede deshacer la acción.",
                () => {
                    showConfirm(
                        "3/3 - Confirmación final",
                        "¿Eliminar definitivamente este precio?",
                        async () => {
                            preciosBuseta = preciosBuseta.filter(p => p.id !== id);
                            await saveData();
                            renderPrecios();
                            actualizarContadorPreciosAjustes();
                            showToast("Precio eliminado");
                        },
                        "Eliminar",
                        "btn-danger"
                    );
                },
                "Continuar",
                "btn-danger"
            );
        },
        "Sí",
        "btn-danger"
    );
}

function filterPrecios() {
    const val = document.getElementById('search-precio').value;
    renderPrecios(val);
}

// Suma cuántos precios hay asignados en total, agrupados por provincia/lugar
// (ej: Cartago 1 + San José 2 + Alajuela 3 + Guanacaste 4 = 10).