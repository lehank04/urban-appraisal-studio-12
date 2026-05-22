// ============================================================
// CATÁLOGOS Y TABLAS DE CALIBRACIÓN — FORMATO INMOVAL
// Cada tabla mapea CLAVE → { calificación numérica, etiqueta }.
// Las claves se usan en sujeto y comparables; las calificaciones
// alimentan la homologación factor = sujeto / comparable.
// ============================================================

export interface OpcionCal {
  key: string;
  label: string;
  calificacion: number;
  descripcion?: string;
}

export interface TablaFactor {
  nombre: string;
  peso: number;                  // peso conceptual (informativo)
  opciones: OpcionCal[];
}

// Para "personalizado" en selects
export const CUSTOM_KEY = '__custom__';

// -------------- a. SUPERFICIE (sin tabla, fórmula directa) ----

// -------------- b. UBICACIÓN ----------------------------------
export const TABLA_UBICACION: TablaFactor = {
  nombre: 'Ubicación',
  peso: 0.010,
  opciones: [
    { key: 'CENTRICA',     label: 'Céntrica (<1km)',      calificacion: 1.000, descripcion: 'Máxima exposición. Centro de la localidad.' },
    { key: 'SEMI_CENTRICA',label: 'Semi-céntrica (1-2km)',calificacion: 0.990, descripcion: 'Residencial y servicios.' },
    { key: 'PERIFERICA',   label: 'Periférica (2-3km)',   calificacion: 0.980, descripcion: 'Expansión del casco urbano.' },
    { key: 'SUBURBANA',    label: 'Suburbana (>3km)',     calificacion: 0.970, descripcion: 'Entorno natural, alejada del bullicio.' },
  ],
};

// -------------- c. CANTIDAD DE AMBIENTES (coeficiente directo)
export const COEF_AMBIENTES = {
  dormitorio: 0.025,
  banoCompleto: 0.025,
  banoMedio: 0.010,
  cuartoBanoServicio: 0.060,
};

// -------------- d. NEGOCIACIÓN (% por tiempo en mercado) ------
export interface RangoNegociacion { key: string; label: string; factor: number; }
export const NEGOCIACION: RangoNegociacion[] = [
  { key: 'RECIENTE',   label: 'Reciente (<30 días)',    factor: 0.99 },
  { key: 'ESTANDAR',   label: 'Estándar (31-90 días)',  factor: 0.98 },
  { key: 'PROLONGADO', label: 'Prolongado (91-180 días)',factor: 0.97 },
  { key: 'ANTIGUO',    label: 'Antiguo (>180 días)',    factor: 0.96 },
];

export function rangoPorDias(dias: number): RangoNegociacion {
  if (dias < 31) return NEGOCIACION[0];
  if (dias <= 90) return NEGOCIACION[1];
  if (dias <= 180) return NEGOCIACION[2];
  return NEGOCIACION[3];
}

// -------------- e. TIPO DE ZONA -------------------------------
export const TABLA_ZONA: TablaFactor = {
  nombre: 'Tipo de zona',
  peso: 0.040,
  opciones: [
    { key: 'COMERCIAL',     label: 'Comercial',         calificacion: 1.160 },
    { key: 'MIXTO',         label: 'Mixto',             calificacion: 1.120 },
    { key: 'INDUSTRIAL',    label: 'Industrial',        calificacion: 1.080 },
    { key: 'TRANSICION',    label: 'De transición',     calificacion: 1.040 },
    { key: 'RESIDENCIAL',   label: 'Residencial (base)',calificacion: 1.000 },
    { key: 'INSTITUCIONAL', label: 'Institucional',     calificacion: 0.960 },
    { key: 'RURAL',         label: 'Rural',             calificacion: 0.920 },
    { key: 'PROTECCION',    label: 'De protección ecológica', calificacion: 0.880 },
  ],
};

// -------------- f. VÍA DE ACCESO ------------------------------
export const TABLA_VIA: TablaFactor = {
  nombre: 'Vía de acceso',
  peso: 0.035,
  opciones: [
    { key: 'CONCRETO',  label: 'Concreto hidráulico', calificacion: 1.000 },
    { key: 'ASFALTO',   label: 'Asfalto',             calificacion: 0.965 },
    { key: 'ADOQUINADA',label: 'Adoquinada',          calificacion: 0.930 },
    { key: 'MACADAN',   label: 'Macadán / selecto',   calificacion: 0.895 },
    { key: 'TIERRA',    label: 'Tierra',              calificacion: 0.860 },
  ],
};

// -------------- g. SERVICIOS PÚBLICOS -------------------------
export const TABLA_SERVICIOS: TablaFactor = {
  nombre: 'Servicios públicos',
  peso: 0.025,
  opciones: [
    { key: 'OPTIMO',     label: 'Óptimo',     calificacion: 1.000 },
    { key: 'ESTANDAR',   label: 'Estándar',   calificacion: 0.975 },
    { key: 'BASICO',     label: 'Básico',     calificacion: 0.950 },
    { key: 'INEXISTENTE',label: 'Inexistente',calificacion: 0.925 },
  ],
};

// -------------- h. EQUIPAMIENTO URBANO ------------------------
export const TABLA_EQUIPAMIENTO: TablaFactor = {
  nombre: 'Equipamiento urbano',
  peso: 0.025,
  opciones: [
    { key: 'MUY_ALTA', label: 'Muy alta', calificacion: 1.000 },
    { key: 'ALTA',     label: 'Alta',     calificacion: 0.975 },
    { key: 'MEDIA',    label: 'Media',    calificacion: 0.950 },
    { key: 'BAJA',     label: 'Baja',     calificacion: 0.925 },
    { key: 'NULA',     label: 'Nula',     calificacion: 0.900 },
  ],
};

// -------------- i. TOPOGRAFÍA ---------------------------------
export const TABLA_TOPOGRAFIA: TablaFactor = {
  nombre: 'Topografía',
  peso: 0.030,
  opciones: [
    { key: 'PLANA',     label: 'Plana',     calificacion: 1.000 },
    { key: 'IRREGULAR', label: 'Irregular', calificacion: 0.970 },
    { key: 'QUEBRADA',  label: 'Quebrada',  calificacion: 0.940 },
  ],
};

// -------------- j. POSICIÓN EN LA MANZANA (solo terreno) ------
export const TABLA_POSICION: TablaFactor = {
  nombre: 'Posición en la manzana',
  peso: 0.020,
  opciones: [
    { key: 'ESQUINERO',     label: 'Esquinero',       calificacion: 1.000 },
    { key: 'CALLE_A_CALLE', label: 'De calle a calle',calificacion: 0.980 },
    { key: 'MEDIANERO',     label: 'Medianero',       calificacion: 0.960 },
    { key: 'INTERIOR',      label: 'Lote interior',   calificacion: 0.940 },
  ],
};

// -------------- ROSS-HEIDECKE: coeficiente de conservación Q --
export interface EstadoConservacionRH {
  fe: number;        // criterio FE 10..2
  q: number;         // factor Q
  label: string;
  descripcion: string;
}
export const ROSS_HEIDECKE: EstadoConservacionRH[] = [
  { fe: 10, q: 1.000, label: 'Nueva construcción',  descripcion: 'Recién terminada o sin uso.' },
  { fe: 9,  q: 0.990, label: 'Nuevo sin uso',       descripcion: 'Sin uso, en perfecto estado operativo.' },
  { fe: 8,  q: 0.975, label: 'Muy bueno',           descripcion: 'Mantenimiento preventivo regular.' },
  { fe: 7,  q: 0.915, label: 'Bueno',               descripcion: 'Estructura y sistemas en óptimas condiciones.' },
  { fe: 6,  q: 0.820, label: 'Reparación leve',     descripcion: 'Deterioros visibles, reparaciones menores.' },
  { fe: 5,  q: 0.660, label: 'Reparación media',    descripcion: 'Reparaciones moderadas.' },
  { fe: 4,  q: 0.470, label: 'Reparación importante', descripcion: 'Intervenciones sustanciales.' },
  { fe: 3,  q: 0.250, label: 'Reparación grave',    descripcion: 'Deterioro generalizado.' },
  { fe: 2,  q: 0.135, label: 'En desecho',          descripcion: 'Ruinoso o no habitable.' },
];

export const factorQ = (fe: number) => ROSS_HEIDECKE.find((r) => r.fe === fe)?.q ?? 1;

// -------------- ETAPAS DE REPOSICIÓN (ponderación automática) --
export interface EtapaPonderacion {
  id: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  pct: number;                  // % de incidencia sobre Costos Directos
}

export const ETAPAS_DIRECTOS: EtapaPonderacion[] = [
  { id: 'preliminares',  nombre: 'OBRAS PRELIMINARES', unidad: 'M²', pct: 0.03,
    descripcion: 'Limpieza del terreno, trazo y nivelación, construcciones provisionales para iniciar la obra.' },
  { id: 'fundaciones',   nombre: 'FUNDACIONES Y ESTRUCTURA', unidad: 'M³', pct: 0.12,
    descripcion: 'Cimentación superficial y lineal de concreto reforzado bajo muros de carga.' },
  { id: 'sistema',       nombre: 'SISTEMA CONSTRUCTIVO (ESTRUCTURA Y CERRAMIENTO)', unidad: 'M²', pct: 0.25,
    descripcion: 'Mampostería confinada: muros de carga con columnas y vigas de concreto reforzado.' },
  { id: 'est_techo',     nombre: 'ESTRUCTURA DE TECHO', unidad: 'M²', pct: 0.17,
    descripcion: 'Estructura metálica (perlines): vigas de acero liviano tipo C o Z.' },
  { id: 'cubierta',      nombre: 'CUBIERTA DE TECHO', unidad: 'M²', pct: 0.11,
    descripcion: 'Lámina de zinc galvanizada, durabilidad y rapidez de instalación.' },
  { id: 'pisos',         nombre: 'ACABADO DE PISOS', unidad: 'M²', pct: 0.14,
    descripcion: 'Concreto lujado o pulido: superficie lisa, durable, apariencia moderna.' },
  { id: 'cielo',         nombre: 'ACABADO DE CIELO', unidad: 'M²', pct: 0.00,
    descripcion: 'No aplica / a definir.' },
  { id: 'puertas',       nombre: 'PUERTAS', unidad: 'UND', pct: 0.03, descripcion: 'Puertas interiores y exteriores.' },
  { id: 'ventanas',      nombre: 'VENTANAS', unidad: 'UND', pct: 0.00, descripcion: 'Ventanas según diseño.' },
  { id: 'sanitarias',    nombre: 'INSTALACIONES SANITARIAS', unidad: 'GLB', pct: 0.07, descripcion: 'Obras sanitarias.' },
  { id: 'electricas',    nombre: 'INSTALACIONES ELÉCTRICAS', unidad: 'GLB', pct: 0.08, descripcion: 'Obras eléctricas.' },
];

export const ETAPAS_INDIRECTOS: EtapaPonderacion[] = [
  { id: 'diseno',  nombre: 'DISEÑO, SUPERVISIÓN, ETC.', unidad: 'GLB', pct: 0.20, descripcion: 'Honorarios profesionales.' },
  { id: 'admin',   nombre: 'ADMINISTRACIÓN Y UTILIDADES', unidad: 'GLB', pct: 0.70, descripcion: 'Administración de obra y utilidad del constructor.' },
  { id: 'imprev',  nombre: 'IMPREVISTOS', unidad: 'GLB', pct: 0.10, descripcion: 'Reserva para imprevistos.' },
];

export const RATIO_INDIRECTOS = 0.15;   // 15% de los directos
export const RATIO_IVA = 0.15;
export const RATIO_IBI = 0.01;

// ============================================================
// CATÁLOGOS OFICIALES INMOVAL (checklist de inspección)
// Todas las listas admiten valor personalizado vía StringSelectWithCustom
// ============================================================

// Q7 — Documentación legal recibida
export const CAT_DOCUMENTACION_LEGAL = [
  'Escritura de propiedad',
  'Plano catastral',
  'Constancia municipal',
  'Compra-venta',
  'Otro',
];

// Q9 — Clasificación de la zona
export const CAT_CLASIFICACION_ZONA = [
  'Residencial: uso exclusivo para vivienda (unifamiliar o multifamiliar).',
  'Comercial: destinada al intercambio de bienes y servicios.',
  'Industrial: transformación, manufactura, almacenamiento y logística.',
  'Mixto: coexistencia de usos compatibles (comercio + vivienda/oficinas).',
  'Institucional (equipamiento): servicios públicos o privados a la comunidad.',
  'Rural: fuera del perímetro urbano, actividades primarias.',
  'De transición: rural con alta potencialidad de cambio a urbano.',
  'De protección ecológica: uso restringido por importancia ambiental.',
];

// Q10 — Tipo de construcciones predominantes
export const CAT_CONSTRUCCIONES_PREDOMINANTES = [
  'Viviendas unifamiliares (interés social, estándar o de lujo)',
  'Edificios de apartamentos o condominios',
  'Módulos o locales comerciales',
  'Edificios de oficinas',
  'Naves industriales o bodegas',
  'Centros comerciales',
  'Hoteles o restaurantes',
  'Edificaciones de uso mixto (comercio y vivienda)',
  'Institucionales (colegios, hospitales, gobierno)',
  'Quintas o casas de hacienda',
];

// Q11 — Índice de saturación de la zona
export const CAT_INDICE_SATURACION = [
  'Baja (en desarrollo): 0% - 30% construido',
  'Media (en consolidación): 31% - 70% construido',
  'Alta (consolidada): 71% - 90% construido',
  'Total (saturada): 91% - 100% construido',
];

// Q12 — Densidad poblacional
export const CAT_DENSIDAD = [
  'Densa (vivienda popular / interés social): alta concentración, viviendas "pared con pared".',
  'Semidensa (urbanizaciones modernas): alta ocupación con traza urbana ordenada.',
  'Media / Normal (residencial estándar): jardines, patios y espacio entre viviendas.',
  'Escasa (residencial exclusivo / periurbano): baja densidad, casas dispersas.',
  'Flotante (zonas comerciales / oficinas): alta densidad diurna, vacía de noche.',
  'Nula (baldíos / áreas protegidas): sin población residente.',
];

// Q13-Q14 — Accesibilidad: tipo de rodamiento
export const CAT_RODAMIENTO = [
  'Calle de tierra: sin revestimiento, dependiente del clima.',
  'Calle adoquinada: bloques prefabricados de concreto.',
  'Calle asfalto: superficie flexible con agregados pétreos y ligante asfáltico.',
  'Concreto hidráulico: rígido, máxima durabilidad.',
  'Macadán (material selecto): no pavimentada, mejorada con piedra y grava compactada.',
];

// Q15-Q16 — Accesibilidad: importancia de la vía
export const CAT_IMPORTANCIA_VIA = [
  'Vía primaria (arterial): conecta ciudades o zonas amplias de alto tráfico.',
  'Vía colectora (secundaria): distribuye tráfico desde vías primarias a barrios.',
  'Vía local (residencial): acceso directo a viviendas dentro de un barrio.',
  'Vía peatonal (andén): exclusiva para tránsito de peatones.',
];

// Q17-Q18 — Accesibilidad: estado de la vía
export const CAT_ESTADO_VIAL = [
  'Bueno: óptimas condiciones, sin baches ni grietas significativas.',
  'Regular: transitable con desgaste, grietas menores o pequeños baches.',
  'Malo: deterioro evidente, baches numerosos y falta de mantenimiento.',
  'No aplica',
];

// Q19-Q20 — Accesibilidad: flujo vehicular
export const CAT_FLUJO_VEHICULAR = [
  'Alto: tráfico constante y denso (vías primarias / arteriales).',
  'Moderado: tráfico frecuente con pausas (vías colectoras / secundarias).',
  'Bajo: tráfico esporádico (vías locales / residenciales).',
  'Nulo: tráfico casi inexistente (calles sin salida / entradas privadas).',
];

// Q21 — Servicios básicos disponibles
export const CAT_SERVICIOS_BASICOS = [
  'Agua potable',
  'Aguas residuales',
  'Energía eléctrica',
  'Telecomunicaciones',
  'Vialidad',
  'Alumbrado público',
];

// Q22 — Equipamiento urbano
export const CAT_EQUIPAMIENTO_URBANO = [
  'Escuelas',
  'Hospitales',
  'Centro de salud',
  'Centros de recreación',
  'Centros de abasto',
  'Transporte público',
];

// Q23 — Riesgos ambientales
export const CAT_RIESGOS_AMBIENTALES = [
  'Contaminación acústica (ruido): niveles constantes o excesivos cercanos.',
  'Contaminación visual: cableado aéreo, vallas invasivas, edificaciones abandonadas.',
  'Contaminación atmosférica (olores/emisiones): humo, polvo, plantas de tratamiento, vertederos.',
  'Riesgos para la salud o seguridad: alta tensión, antenas, zonas inundables, laderas inestables.',
];

// Q25 — Topografía
export const CAT_TOPOGRAFIA = [
  'Plana: sin inclinación significativa, óptima para construcción.',
  'Irregular: ondulaciones y desniveles visibles, requiere nivelación.',
  'Quebrada: pendientes fuertes, requiere obras de ingeniería significativas.',
];

// Q26 — Forma del terreno
export const CAT_FORMA_TERRENO = [
  'Regular: forma similar a un polígono geométrico definido (cuadrado, rectángulo).',
  'Irregular: sin semejanza a forma geométrica definida, linderos y ángulos desiguales.',
];

// Q27 — Características panorámicas
export const CAT_PANORAMICAS = [
  'Vista a lagos o lagunas',
  'Vista a montañas o volcanes',
  'Vista al mar',
  'Paisaje urbano (perfil de ciudad desde zonas altas)',
  'Colindancia con áreas verdes (parques, reservas, arboledas)',
];

// Q28 — Posición en la manzana
export const CAT_POSICION_MANZANA = [
  'Esquinero: intersección de dos calles, dos frentes — máximo potencial.',
  'De calle a calle: atraviesa la manzana, frente a dos calles paralelas.',
  'Medianero: entre dos lotes, un único frente — condición base.',
  'Lote interior: sin frente directo a la vía pública.',
];

// Q30, Q32, Q34, Q36 — Delimitantes de linderos
export const CAT_DELIMITANTES = [
  'Muro de mampostería (bloque): bloques de concreto unidos por mortero.',
  'Muro de mampostería (cantera): piedra cantera labrada, estética colonial.',
  'Muro de losetas prefabricadas: postes y láminas de concreto prefabricado.',
  'Cerco de malla ciclón: postes metálicos y malla de alambre tejido.',
  'Cerco de alambre de púas: postes y varias hileras de alambre de púas.',
  'Cerco eléctrico: postes aisladores y líneas de alto voltaje.',
  'Delimitante vecino: estructura construida por la propiedad colindante.',
  'Mojones: hitos de concreto o piedra en los vértices; no impiden el paso.',
  'No existe delimitante físico: división puramente registral o topográfica.',
];

// Q40-Q41 — Estado de conservación (infra principal / obras complementarias)
export const CAT_ESTADO_CONSERVACION = [
  'Nuevo: recién terminada o sin uso, sin deterioro ni desgaste.',
  'Bueno: mantenimiento preventivo regular, desgaste mínimo por uso normal.',
  'Reparación leve / sencilla: deterioros visibles, reparaciones menores no estructurales.',
  'Reparación importante: deterioro generalizado que afecta funcionalidad.',
  'En desecho: estado ruinoso o no habitable, daños estructurales severos.',
];

// Uso actual del lote (Cap IV)
export const CAT_USO_LOTE = [
  'CASA DE HABITACIÓN',
  'APARTAMENTO',
  'LOCAL COMERCIAL',
  'TERRENO BALDÍO',
  'PROYECTO EN CONSTRUCCIÓN',
];

// Estado de ocupación del lote (Cap IV)
export const CAT_ESTADO_OCUPACION_LOTE = [
  'HABITADO',
  'DESOCUPADO',
  'EN OPERACIÓN',
  'EN OBRA',
  'TERRENO SIN USO',
];



// -------------- DESCRIPCIONES CONSTRUCTIVAS (catálogo) --------
export const ELEMENTOS_CONSTRUCTIVOS = [
  'Cimientos', 'Sistema constructivo', 'Estructura de techo', 'Cubierta de techo',
  'Divisiones internas', 'Entrepiso', 'Acabado de piso', 'Acabado de cielo',
  'Acabado de muros', 'Puertas', 'Ventanas', 'Sistema eléctrico',
  'Sistema de tratamiento de aguas', 'Detalle de baños', 'Detalles de cocina',
  'Iluminación', 'Equipos',
];

export const AMBIENTES_CATALOGO = [
  'Acceso / Porche', 'Dormitorio', 'Baño completo', 'Baño medio', 'Sala',
  'Cocina', 'Comedor', 'Terraza', 'Cuarto de lavado', 'Dormitorio servicio',
  'Baño servicio', 'Bodega interna', 'Garaje integrado', 'Estudio',
];

export const ETAPAS_DIRECTAS = [
  'Obras preliminares', 'Fundaciones y estructura', 'Sistema constructivo',
  'Entrepiso', 'Estructura de techo', 'Cubierta de techo', 'Acabado de pisos',
  'Acabado de cielo', 'Puertas', 'Ventanas', 'Obras sanitarias', 'Obras eléctricas',
];
export const ETAPAS_INDIRECTAS = ['Diseño, supervisión, etc.', 'Administración y utilidades', 'Imprevistos'];
export const ETAPAS_IMPUESTOS = ['Impuesto al Valor Agregado (IVA) 15%', 'Impuesto Municipalidad (IBI) 1%'];

export const TIPOS_INMUEBLE = [
  'IUC01 - Residencial · Vivienda Básica / Interés Social',
  'IUC02 - Residencial · Vivienda Media / Residencial Ampliada',
  'IUC03 - Residencial · Vivienda de Lujo / Condominio / Diseños Especiales',
  'IUT01 - Terreno Urbano · 160-300 m²',
  'IUT02 - Terreno Urbano · 300-700 m²',
  'IUT03 - Terreno Urbano · 700-1000 m²',
  'IRT01 - Terreno Semi Urbano · 1000-3000 m²',
  'IRT02 - Terreno Semi Urbano · 3000-7000 m²',
  'IUL01 - Terreno Semi Urbano · 7000-10000 m²',
  'IUL02 - Terreno por manzana · 1-5 mz',
  'IUE01 - Terreno por manzana · 5-10 mz',
  'IUE02 - Terreno por manzana · 10-20 mz',
  'IUE03 - Terreno por manzana · >20 mz',
  'IUI01 - Locales comerciales · Bodega / Ofibodega Estándar',
  'IUI02 - Locales comerciales · Centro Logístico / Distribución (CEDIS)',
];

export const REGIMENES = ['PRIVADA INDIVIDUAL', 'PROPIEDAD HORIZONTAL', 'COMUNAL'];
export const PROPOSITOS = [
  'OTORGAMIENTO DE CREDITO - OC',
  'REESTRUCTURACIÓN DE CREDITO - RC',
  'BIENES EN USO - BU',
  'BIENES ADJUDICADOS - BA',
  'POLIZA DE SEGURO - PS',
  'PARTICULAR / VENTA - PV',
  'REFERENCIA DE VALORES - RV',
];

export const FORMAS_TERRENO = ['REGULAR', 'IRREGULAR', 'TRAPEZOIDAL', 'RECTANGULAR', 'TRIANGULAR'];

// FACTOR DE CONVERSIÓN OFICIAL INETER (m² → vr²)
export const FACTOR_CONVERSION_M2_VR2 = 1.418415;

// -------------- UNIDADES DE SUPERFICIE --------------
// Factor para convertir 1 unidad → m² (tabla INETER)
export const M2_PER_UNIT: Record<string, number> = {
  'm²': 1,
  'vr²': 1 / 1.418415,
  'pie²': 1 / 10.76391,
  'yarda²': 1 / 1.1960,
  'área': 100,
  'hectárea': 10000,
  'manzana': 7050.12,
  'caballería': 427900,
  'acre': 4046,
};
export const UNIDADES_AREA = Object.keys(M2_PER_UNIT);

export const ORIGENES_AREA = ['escritura', 'plano', 'levantamiento', 'contrato', 'personalizado'] as const;
export type OrigenArea = typeof ORIGENES_AREA[number];

/** Convierte un valor entre unidades de área */
export const convertArea = (value: number, from: string, to: string): number => {
  const f = M2_PER_UNIT[from] ?? 1;
  const t = M2_PER_UNIT[to] ?? 1;
  return (value * f) / t;
};

/** Tolerancia oficial de diferencia de áreas (inmuebles urbanos) */
export const toleranciaArea = (areaM2: number): { pct: number; rango: string } => {
  if (areaM2 < 200) return { pct: 0.025, rango: 'MENOR DE 200 M²' };
  if (areaM2 <= 1000) return { pct: 0.020, rango: 'ENTRE 200 M² Y 1,000 M²' };
  return { pct: 0.010, rango: 'MAYOR A 1,000 M²' };
};

// helper para obtener opción
export const findOpcion = (tabla: TablaFactor, key: string) =>
  tabla.opciones.find((o) => o.key === key) || tabla.opciones[0];

// -------------- CATÁLOGOS LEGADOS (UI prototipo) --------------
export const CATALOGOS = {
  tipoAvaluo: ['Comercial', 'Reposición', 'Hipotecario', 'Catastral', 'Judicial', 'Seguro'],
  finalidad: ['Garantía hipotecaria', 'Compra-venta', 'Referencia de valor', 'Seguro', 'Contable', 'Sucesión'],
  moneda: ['US$', 'C$', 'L', '$', '€'],
  unidadMedida: ['m²', 'ml', 'und', 'glb', 'm³'],
  estadoConservacion: ['Nuevo', 'Muy bueno', 'Bueno', 'Regular', 'Malo', 'Ruinoso'],
  forma: FORMAS_TERRENO,
  topografia: ['Plana', 'Irregular', 'Quebrada', 'Pendiente leve', 'Pendiente fuerte'],
  tipoAcceso: ['Concreto', 'Asfalto', 'Adoquinada', 'Macadán', 'Tierra'],
  serviciosPublicos: ['Óptimo', 'Estándar', 'Básico', 'Inexistente'],
  zonificacion: ['Residencial', 'Comercial', 'Mixto', 'Industrial', 'Transición', 'Institucional', 'Rural', 'Protección'],
  usoActual: ['Vivienda', 'Comercio', 'Bodega', 'Mixto', 'Sin uso', 'Industrial'],
  usoPotencial: ['Vivienda', 'Comercio', 'Bodega', 'Mixto', 'Industrial', 'Desarrollo'],
  entorno: ['Urbano consolidado', 'Urbano en desarrollo', 'Transición', 'Suburbano', 'Rural'],
  tipoInfra: [
    { value: 'principal',     label: 'Principal' },
    { value: 'complementaria',label: 'Complementaria' },
    { value: 'obra_exterior', label: 'Obra exterior' },
  ],
};
