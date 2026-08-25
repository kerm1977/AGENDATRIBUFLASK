function parsearFechaNacimiento(fechaStr) {
    if (!fechaStr) return null;
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return null;
    const mes = parseInt(partes[1], 10);
    const dia = parseInt(partes[2], 10);
    if (!mes || !dia) return null;
    return { mes, dia };
}

// Devuelve la fecha de HOY (a medianoche) según la hora de Costa Rica,
// sin importar en qué zona horaria esté configurado el dispositivo.
function obtenerFechaCRString() {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Costa_Rica',
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date());
    } catch (e) {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    }
}

function obtenerHoyCR() {
    try {
        const partes = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Costa_Rica',
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date());
        const [anio, mes, dia] = partes.split('-').map(n => parseInt(n, 10));
        return new Date(anio, mes - 1, dia);
    } catch (e) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return hoy;
    }
}

function esCumpleHoy(fechaStr) {
    const f = parsearFechaNacimiento(fechaStr);
    if (!f) return false;
    const hoy = obtenerHoyCR();
    return (hoy.getMonth() + 1) === f.mes && hoy.getDate() === f.dia;
}

function esCumpleManana(fechaStr) {
    const f = parsearFechaNacimiento(fechaStr);
    if (!f) return false;
    const manana = obtenerHoyCR();
    manana.setDate(manana.getDate() + 1);
    return (manana.getMonth() + 1) === f.mes && manana.getDate() === f.dia;
}

// Devuelve cuántos días faltan para el próximo cumpleaños (0 = hoy), o null si no hay fecha.
function diasParaCumpleanos(fechaStr) {
    const f = parsearFechaNacimiento(fechaStr);
    if (!f) return null;
    const hoy = obtenerHoyCR();
    let proximo = new Date(hoy.getFullYear(), f.mes - 1, f.dia);
    if (proximo < hoy) proximo = new Date(hoy.getFullYear() + 1, f.mes - 1, f.dia);
    const msPorDia = 24 * 60 * 60 * 1000;
    return Math.round((proximo - hoy) / msPorDia);
}

// Del día del cumpleaños hasta 7 días antes se muestra el pastelito.
function esCumpleProximo(fechaStr) {
    const dias = diasParaCumpleanos(fechaStr);
    return dias !== null && dias >= 0 && dias <= 7;
}

function revisarCumpleanos() {
    if (!Array.isArray(directorioPersonas) || directorioPersonas.length === 0) return;
    const anioActual = obtenerHoyCR().getFullYear();
    const cumpleaneros = directorioPersonas.filter(p => {
        if (!esCumpleHoy(p.fechaNacimiento)) return false;
        const key = `cumple_no_ver_${p.id}_${anioActual}`;
        return localStorage.getItem(key) !== 'true';
    });

    if (cumpleaneros.length === 0) return;

    const nombres = cumpleaneros.map(p => p.nombre).join(', ');
    document.getElementById('banner-cumpleanos-texto').innerText =
        `Hoy es el cumpleaños de ${nombres}. ¡Mandale saludos de cumpleaños desde el directorio!`;

    const banner = document.getElementById('banner-cumpleanos');
    banner.style.display = 'flex';
    banner.dataset.personasIds = JSON.stringify(cumpleaneros.map(p => p.id));
    lanzarConfetti();
}

function cerrarBannerCumpleanos(noVerMasEsteAnio) {
    const banner = document.getElementById('banner-cumpleanos');
    if (noVerMasEsteAnio) {
        const anioActual = obtenerHoyCR().getFullYear();
        let ids = [];
        try { ids = JSON.parse(banner.dataset.personasIds || '[]'); } catch (e) { ids = []; }
        ids.forEach(id => localStorage.setItem(`cumple_no_ver_${id}_${anioActual}`, 'true'));
    }
    banner.style.display = 'none';
    detenerConfetti();
}

let confettiAnimId = null;
function lanzarConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colores = ['#f97316', '#ea580c', '#25D366', '#2563eb', '#dc2626', '#facc15'];
    const piezas = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: colores[Math.floor(Math.random() * colores.length)],
        velY: 2 + Math.random() * 3,
        velX: -1 + Math.random() * 2,
        rot: Math.random() * 360,
        velRot: -6 + Math.random() * 12
    }));

    function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        piezas.forEach(p => {
            p.y += p.velY;
            p.x += p.velX;
            p.rot += p.velRot;
            if (p.y > canvas.height) p.y = -20;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        confettiAnimId = requestAnimationFrame(frame);
    }
    frame();
}
