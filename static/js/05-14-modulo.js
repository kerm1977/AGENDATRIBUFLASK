async function descargarFactura() {
    const element = document.getElementById('factura-body');
    if (typeof html2canvas === 'undefined') {
        showToast("No se pudo cargar el generador de imágenes", "danger");
        return;
    }
    try {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
        const nombre = document.getElementById('cam-usu-nombre').value || 'caminante';
        const fileName = `factura-${nombre.replace(/\s+/g, '_')}.png`;

        canvas.toBlob(async (blob) => {
            if (!blob) {
                showToast("Error al generar el archivo", "danger");
                return;
            }

            if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'image/png' })] })) {
                const file = new File([blob], fileName, { type: 'image/png' });
                await navigator.share({
                    title: `Factura ${nombre}`,
                    text: `Factura de caminata`,
                    files: [file]
                });
                showToast("Factura lista para compartir");
            } else {
                const link = document.createElement('a');
                link.download = fileName;
                link.href = URL.createObjectURL(blob);
                link.click();
                showToast("Factura descargada");
            }
        }, 'image/png');
    } catch (err) {
        showToast("Error al generar la imagen", "danger");
    }
}
