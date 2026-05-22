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

// -------------- ENTORNO: catálogos --------------------------
export const CAT_CLASIFICACION_ZONA = [
  'Urbano consolidado', 'Urbano en desarrollo', 'De transición', 'Rural', 'Suburbano',
];
export const CAT_INDICE_SATURACION = [
  'Baja (en desarrollo): 0% - 30% construido',
  'Media (en consolidación): 31% - 70% construido',
  'Alta (consolidada): 71% - 100% construido',
];
export const CAT_DENSIDAD = [
  'Alta: lotes <300 m² (residencial popular)',
  'Media: lotes 300-600 m² (residencial estándar)',
  'Escasa: lotes >600 m² (residencial exclusivo / periurbano)',
];
export const CAT_FLUJO_VEHICULAR = ['Nulo', 'Bajo', 'Medio', 'Alto'];
export const CAT_ESTADO_VIAL = ['Bueno', 'Regular', 'Malo', 'No aplica'];
export const CAT_IMPORTANCIA_VIA = ['Vía primaria (arterial)', 'Vía secundaria (colectora)', 'Vía local (residencial)'];

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
  'CASA DE HABITACIÓN - IU', 'LOTE DE TERRENO - LU', 'EDIFICIO COMERCIAL - EC',
  'BODEGA - BD', 'APARTAMENTO - AP', 'LOCAL COMERCIAL - LC',
];

export const REGIMENES = ['PRIVADA INDIVIDUAL', 'PROPIEDAD HORIZONTAL', 'COMUNAL'];
export const PROPOSITOS = [
  'REFERENCIA DE VALORES - RV',
  'GARANTÍA HIPOTECARIA - GH',
  'COMPRA-VENTA - CV',
  'SEGURO - SG',
  'CONTABLE - CT',
];

export const FORMAS_TERRENO = ['REGULAR', 'IRREGULAR', 'TRAPEZOIDAL', 'RECTANGULAR', 'TRIANGULAR'];

// FACTOR DE CONVERSIÓN OFICIAL INETER
export const FACTOR_CONVERSION_M2_VR2 = 1.418415;

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
