/* AGENDATRIBUPRO - Constantes de configuracion y estado global compartido
   Origen: AGENDATRIBUPRO.original.html lineas 2977-3143
   Extraido sin cambios de codigo (solo se quito la sangria de 8 espacios).
   No editar sin actualizar el original. */
// === BLOQUE MODULAR PROTEGIDO: CONSTANTS & STATE ===
// --- CONSTANTS & STATE ---
const DB_KEY_CAMINATAS = 'app_caminatas';
const DB_KEY_PERSONAS = 'app_personas_global'; // Nombres del directorio global de personas
const DB_KEY_DIRECTORIO = 'app_directorio_personas'; // Directorio con datos completos
const DB_KEY_NOTAS = 'app_notas';
const DB_KEY_CONSECUTIVO = 'app_consecutivo_factura';
const DB_KEY_ULTIMO_RESPALDO = 'app_ultimo_respaldo';
const DB_KEY_PRECIOS = 'app_precios_buseta';
const DB_KEY_HISTORIAL_RETIROS = 'app_historial_retiros';
const DB_KEY_HISTORIAL_ASISTENCIA = 'app_historial_asistencia';
const DB_KEY_CONFIG_TEMA = 'app_config_tema';
const DB_KEY_COTIZACIONES = 'app_cotizaciones_guardadas';

let caminatas = [];
let personasGlobales = []; // Para autocompletado
let directorioPersonas = []; // Datos completos del directorio
let notas = [];
let currentNotaId = null;
let consecutivoFactura = 1;
let ultimoRespaldo = 0;
let preciosBuseta = [];
let historialRetiros = []; // { nombre, camNombre, camId, fecha }
let historialAsistencia = []; // { nombre, camNombre, camId, camActividad, camLugar, camPais, camDificultad, camKm, camTransporte, camPrecio, camFormasPago, asistencia, fecha }
const TITULO_APP_DEFECTO = 'Caminatas de la Tribu de Los Libres';
const TITULO_DIRECTORIO_DEFECTO = 'Directorio Global';
const GRUPOS_DIRECTORIO_BASE = ['Persona', 'Restaurante', 'Transporte Terrestre', 'Lancha', 'Hotel', 'Cabina', 'Guía', 'Finca', 'Parque Nacional', 'Bosque Nuboso', 'Reserva Biológica', 'El Camino de Costa Rica'];
const TEMAS_DISPONIBLES = {
    naranja:   { nombre: 'Naranja (actual)', primary: '#f97316', primaryDark: '#ea580c', oscuro: false },
    lima:      { nombre: 'Verde lima',        primary: '#a3e635', primaryDark: '#65a30d', oscuro: false },
    fucsia:    { nombre: 'Fucsia',             primary: '#f472b6', primaryDark: '#db2777', oscuro: false },
    celeste:   { nombre: 'Celeste',            primary: '#38bdf8', primaryDark: '#0284c7', oscuro: false },
    turquesa:  { nombre: 'Turquesa',           primary: '#2dd4bf', primaryDark: '#0d9488', oscuro: false },
    beige:     { nombre: 'Beige',              primary: '#d6c9a8', primaryDark: '#a3925f', oscuro: false }
};
const FORMAS_PAGO_DEFAULT = {
    sinpe: [
        '86529837 - Jenny Ceciliano Cordoba',
        '87984232 - Jenny Ceciliano Cordoba',
        '86227500 - Kenneth Ruiz Matamoros'
    ],
    cuentas: [
        'Ninguna / Solo usar SINPE',
        'Jenny Ceciliano Cordoba (Colones MUCAP) - CR66080402010100715103',
        'Jenny Ceciliano Cordoba (Colones BCR) - CR62015202001268129163',
        'Kenneth Ruiz Matamoros (Colones MUCAP) - CR19080403012501524778',
        'Juan Carlos Ruiz (Colones BCR) - CR61015202001292863793',
        'Juan Carlos Ruiz (Dólares BCR) - CR50015202001410361158'
    ]
};

const PARQUES_NACIONALES = [
    { nombre: 'Parque Nacional Barbilla', provincia: 'Cartago y Limón' },
    { nombre: 'Parque Nacional Barra Honda', provincia: 'Guanacaste' },
    { nombre: 'Parque Nacional Braulio Carrillo', provincia: 'Heredia, San José, Cartago y Limón' },
    { nombre: 'Parque Nacional Cahuita', provincia: 'Limón' },
    { nombre: 'Parque Nacional Carara', provincia: 'Puntarenas y San José' },
    { nombre: 'Parque Nacional Chirripó', provincia: 'San José, Cartago, Limón y Puntarenas' },
    { nombre: 'Parque Nacional Corcovado', provincia: 'Puntarenas' },
    { nombre: 'Parque Nacional Diriá', provincia: 'Guanacaste' },
    { nombre: 'Parque Nacional Guanacaste', provincia: 'Guanacaste' },
    { nombre: 'Parque Nacional Isla del Coco', provincia: 'Puntarenas' },
    { nombre: 'Parque Nacional Isla San Lucas', provincia: 'Puntarenas' },
    { nombre: 'Parque Nacional Juan Castro Blanco (Parque Nacional del Agua)', provincia: 'Alajuela' },
    { nombre: 'Parque Internacional La Amistad', provincia: 'Puntarenas, San José y Limón' },
    { nombre: 'Parque Nacional La Cangreja', provincia: 'San José' },
    { nombre: 'Parque Nacional Los Quetzales', provincia: 'San José, Cartago y Puntarenas' },
    { nombre: 'Parque Nacional Manuel Antonio', provincia: 'Puntarenas' },
    { nombre: 'Parque Nacional Marino Ballena', provincia: 'Puntarenas' },
    { nombre: 'Parque Nacional Marino Las Baulas', provincia: 'Guanacaste' },
    { nombre: 'Parque Nacional Miravalles-Jorge Manuel Dengo', provincia: 'Alajuela y Guanacaste' },
    { nombre: 'Parque Nacional Palo Verde', provincia: 'Guanacaste' },
    { nombre: 'Parque Nacional Piedras Blancas', provincia: 'Puntarenas' },
    { nombre: 'Parque Nacional Rincón de la Vieja', provincia: 'Guanacaste y Alajuela' },
    { nombre: 'Parque Nacional Santa Rosa', provincia: 'Guanacaste' },
    { nombre: 'Parque Nacional Tapantí - Macizo de la Muerte', provincia: 'Cartago y San José' },
    { nombre: 'Parque Nacional Tortuguero', provincia: 'Limón' },
    { nombre: 'Parque Nacional Volcán Arenal', provincia: 'Alajuela' },
    { nombre: 'Parque Nacional Volcán Irazú', provincia: 'Cartago' },
    { nombre: 'Parque Nacional Volcán Poás', provincia: 'Alajuela' },
    { nombre: 'Parque Nacional Volcán Tenorio', provincia: 'Guanacaste y Alajuela' },
    { nombre: 'Parque Nacional Volcán Turrialba', provincia: 'Cartago' }
];

const EQUIPO_REQUERIDO_DEFAULT = [
    'Hidratación', 'Tennis ligera', 'Tennis runner', 'Tennis Hiking baja',
    'Zapato Caña media', 'Zapato Caña alta', 'Bastones', 'Foco o Head-lamp',
    'Snacks', 'Repelente', 'Poncho', 'Guantes', 'Bloqueador', 'Ropa de Cambio',
    'Pasaporte', 'Medicación (Crónicos)', 'Cargador Portatil'
];

const INSTRUCCIONES_DEFAULT = {
    otrasRecomendaciones: [
        'Llevar Medicamentos personales (ES SU RESPONSABILIDAD)',
        'Avisar a un familiar, compañer@ o conocido que se va a rezagar momentaneamente.',
        'Desayunaremos al llegar para evitar llevar peso.',
        'Siempre es opcional: pasar a comer a la salida (Decisión grupal).',
        'Evite arrecostarse a arboles o poner mochilas en el suelo (insectos).',
        'Si hay culebras, estar atentos.'
    ],
    normasGenerales: [
        'Ser Puntuales por respeto a l@s compañer@s.',
        'Nadie se queda atrás, ni se queda solo.',
        'NO discutir por campos de la buseta. Respetar armonía.',
        'NO participar si se siente mal o tiene compromisos tarde.',
        'NO criticar al rezagado ni al más rápido.',
        'NO alterar ni dañar el entorno.'
    ],
    indicacionesSeguridad: [
        'En caso de rayería, no abracemos árboles y apaguemos dispositivos.',
        'Mantenga distancia de +3m en tormenta eléctrica.',
        'Llevar Ropa de cambio (se queda en la buseta).',
        'Es probable topar con lluvias, llevar poncho.',
        'EN CASO DE DERRUMBE O RIESGO, SE SUSPENDE LA CAMINATA. NO ES RESPONSABILIDAD DE LA COORDINACIÓN SI EL CAMINO ESTÁ BLOQUEADO.',
        'Si es alérgico, lleve su medicamento (Cetirizina, etc) bajo su propio riesgo médico.',
        'CADA UNO CAMINA LIBREMENTE CON NOSOTROS.'
    ]
};

let configTema = {
    tituloApp: TITULO_APP_DEFECTO,
    tituloDirectorio: TITULO_DIRECTORIO_DEFECTO,
    gruposPersonalizados: [],
    temaColor: 'naranja',
    formasPago: JSON.parse(JSON.stringify(FORMAS_PAGO_DEFAULT)),
    equipoRequerido: [...EQUIPO_REQUERIDO_DEFAULT],
    instrucciones: JSON.parse(JSON.stringify(INSTRUCCIONES_DEFAULT)),
    membreteCotizador: {
        telefono1: '+506 86227500 - Kenneth Ruiz Matamoros',
        telefono2: '+506 86529837 - Jenny Ceciliano Cordoba',
        facebook: 'https://facebook.com/LaTribuDeLosLibres',
        web: 'www.latribu.top',
        precioFrase: 'Por favor requerimos el precio desglosado por persona y el global en Dólares USD',
        horarioFrase: 'El horario de Atención y con quien conversamos',
        banosFrase: 'Por favor, requerimos indicar si las habitaciones tienen baños independientes o si son baños compartidos.',
        cortesiaFrase: 'Por favor, indicar si el guía y el chofer del bus tienen el beneficio de estancia llamado cortesía.',
        cierreFrase: 'Muchísimas gracias'
    }
};
let currentCaminataId = null;
let currentView = 'home';
let confirmActionCallback = null; // Guarda la función a ejecutar en el modal de confirmación
let currentWhatsAppText = ""; // Variable global para guardar el texto puro sin que el HTML lo corrompa

const EMOJIS_ESTADO = {
    'pendiente': '🔴',
    'reservado': '🟡',
    'reserva-parcial': '🔵',
    'pago-parcial': '🟣',
    'abono': '🟠',
    'cancelado': '🟢'
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Bootstrap Modals
let modalCaminante, modalMultiCaminantes, modalConfirm, modalWhatsApp, modalAgregarDirectorio, modalFusionManual, modalBuseta, modalReversion, modalFactura, modalPago, modalPrecioBuseta, modalNota, modalCancelarNota, modalRecordatorioNota, modalRecordatoriosHoy, modalOracionTribu, modalSalir, modalSeleccionarCaminata, modalVerDirectorio, modalHistorialRetiros, modalHistorialParticipacion, modalCotizador;
let notaRecordatorioFechaPendiente = null;
let notaRecordatorioFechaExistente = null;
let recordatoriosSnoozeHasta = 0;
let pendingReversionIndex = null;
let pendingPagoIndex = null;
let pendingSaveData = null;
let longPressTimer = null;
let notaSavedRange = null;
let cotRequerimientos = [];
let cotizacionesGuardadas = [];
