// Módulo Técnico Urbano — Tipos base (Fase Técnica 02 / F1 + F1.5 + F1.6)
// F1.6 amplía el modelo a una estructura relacional: terrenos[], construcciones[],
// ambientes[], mejoras[] y comparables (seleccionados/descartados/snapshots).
// No reemplaza los campos planos previos: convivencia para compatibilidad.

export type EstadoSeccionModuloUrbano =
  | 'pendiente'
  | 'en_proceso'
  | 'completo'
  | 'requiere_revision'
  | 'no_aplica';

/**
 * Secciones que sólo aplican cuando el inmueble tiene construcción.
 * Para lote vacío deben quedar marcadas como 'no_aplica'.
 */
export const SECCIONES_SOLO_CONSTRUCCION: ReadonlyArray<
  'construcciones' | 'ambientes' | 'costo_reposicion' | 'depreciacion'
> = ['construcciones', 'ambientes', 'costo_reposicion', 'depreciacion'];

export function tipoRequiereConstruccion(tipo: TipoInmuebleUrbano | ''): boolean {
  if (!tipo) return true; // por defecto se asume con construcción
  return tipo !== 'lote_vacio';
}

export type TipoInmuebleUrbano =
  | 'casa_habitacion'
  | 'lote_vacio'
  | 'lote_con_mejoras'
  | 'local_comercial'
  | 'bodega'
  | 'oficina'
  | 'obra_en_proceso'
  | 'otro';

export type SeccionModuloUrbano =
  | 'identificacion'
  | 'legal'
  | 'entorno'
  | 'terreno'
  | 'construcciones'
  | 'ambientes'
  | 'fotografias'
  | 'comparables'
  | 'homologacion'
  | 'costo_reposicion'
  | 'depreciacion'
  | 'calculo_final'
  | 'informe'
  | 'anexos';

export const SECCIONES_MODULO_URBANO: ReadonlyArray<{
  key: SeccionModuloUrbano;
  label: string;
}> = [
  { key: 'identificacion', label: 'Identificación' },
  { key: 'legal', label: 'Legal / documental' },
  { key: 'entorno', label: 'Entorno' },
  { key: 'terreno', label: 'Terreno' },
  { key: 'construcciones', label: 'Construcciones' },
  { key: 'ambientes', label: 'Ambientes' },
  { key: 'fotografias', label: 'Fotografías' },
  { key: 'comparables', label: 'Comparables' },
  { key: 'homologacion', label: 'Homologación' },
  { key: 'costo_reposicion', label: 'Costo / reposición' },
  { key: 'depreciacion', label: 'Depreciación' },
  { key: 'calculo_final', label: 'Cálculo final' },
  { key: 'informe', label: 'Informe' },
  { key: 'anexos', label: 'Anexos' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Bloques de captura (F1)
// ─────────────────────────────────────────────────────────────────────────────

export interface IdentificacionModuloUrbano {
  tipoInmueble: TipoInmuebleUrbano | '';
  propositoAvaluo: string;
  fechaInspeccion: string; // ISO yyyy-mm-dd
  cliente: string;
  usoActual: string;
  observacionesGenerales: string;
}

export interface UbicacionModuloUrbano {
  departamento: string;
  municipio: string;
  distrito: string;
  barrio: string;
  direccionExacta: string;
  coordenadasGps: string;
  referencia: string;
  distanciaCentroUrbanoKm: number | null;
}

export interface LegalModuloUrbano {
  numeroEscritura: string;
  notario: string;
  fechaEscritura: string;
  numeroCatastral: string;
  areaRegistral: number | null;
  areaCatastral: number | null;
  gravamenes: string;
}

export interface EntornoModuloUrbano {
  tipoZona: string;
  viasAcceso: string;
  serviciosPublicos: string;
  equipamientoUrbano: string;
}

/**
 * Resumen plano del terreno principal — se conserva por compatibilidad.
 * La fuente de verdad para F2+ pasa a ser `terrenos[]`.
 */
export interface TerrenoModuloUrbano {
  areaTerreno: number | null;
  frente: number | null;
  fondo: number | null;
  topografia: string;
  forma: string;
}

/**
 * Resumen plano de construcción — se conserva por compatibilidad.
 * La fuente de verdad para F2+ pasa a ser `construccionesDetalle[]`.
 */
export interface ConstruccionesModuloUrbano {
  anioConstruccion: number | null;
  tipoConstructivo: string;
  estadoConservacion: string;
  areaConstruidaPreliminar: number | null;
  niveles: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// F1.6 — Modelo relacional
// ─────────────────────────────────────────────────────────────────────────────

export type TipoTerrenoUrbano =
  | 'principal'
  | 'secundario'
  | 'excedente'
  | 'afectado'
  | 'util'
  | 'registral'
  | 'catastral'
  | 'otro';

export type UnidadAreaUrbano = 'm2' | 'vara2' | 'mz' | 'ha' | 'otro';

export interface TerrenoItem {
  id: string;
  codigo: string;            // nombre/código corto, p.ej. "T-01"
  nombre: string;
  tipo: TipoTerrenoUrbano;
  area: number | null;
  unidad: UnidadAreaUrbano;
  frente: number | null;
  fondo: number | null;
  forma: string;
  topografia: string;
  linderos: string;
  usoActual: string;
  afectaciones: string;
  observaciones: string;
  estado: 'activo' | 'descartado';
}

export type TipoMejoraUrbana =
  | 'cerco'
  | 'muro'
  | 'porton'
  | 'patio'
  | 'losa'
  | 'cisterna'
  | 'pozo'
  | 'tanque'
  | 'piscina'
  | 'jardin'
  | 'estacionamiento'
  | 'otro';

export interface MejoraItem {
  id: string;
  terrenoId: string | null;       // vínculo opcional a un terreno
  tipo: TipoMejoraUrbana;
  descripcion: string;
  unidad: string;                 // m, m², m³, unidad, etc.
  cantidad: number | null;
  estadoConservacion: string;
  observaciones: string;
}

export interface ConstruccionItem {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;                   // casa, bodega, anexo, etc.
  terrenoId: string | null;
  areaConstruida: number | null;
  niveles: number | null;
  anioConstruccion: number | null;
  edadAparente: number | null;
  sistemaConstructivo: string;
  estadoConservacion: string;
  vidaUtilEstimada: number | null;
  observaciones: string;
}

export type TipoAmbienteUrbano =
  | 'dormitorio'
  | 'sala'
  | 'comedor'
  | 'cocina'
  | 'bano'
  | 'estudio'
  | 'oficina'
  | 'patio_interior'
  | 'garaje'
  | 'bodega_interna'
  | 'otro';

export interface AmbienteItem {
  id: string;
  construccionId: string;         // requerido: pertenece a una construcción
  tipo: TipoAmbienteUrbano;
  nombre: string;
  cantidad: number | null;
  area: number | null;
  estado: string;
  observaciones: string;
}

// ── Comparables ──────────────────────────────────────────────────────────────

export interface FiltrosComparablesUrbano {
  municipio: string;
  zona: string;
  tipoInmueble: string;
  uso: string;
  areaMin: number | null;
  areaMax: number | null;
  precioMin: number | null;
  precioMax: number | null;
  fechaDesde: string;
  fechaHasta: string;
  fuente: string;
  estado: string;
  viaAcceso: string;
  servicios: string;
  topografia: string;
}

export interface ComparableSeleccionRef {
  id: string;                     // id propio dentro del módulo
  comparableId: string;           // id en la biblioteca
  fechaSeleccion: string;
  notas: string;
}

export interface ComparableDescarteRef {
  id: string;
  comparableId: string;
  motivo: string;
  fechaDescarte: string;
}

/**
 * Snapshot histórico del comparable usado: copia inmutable de los campos
 * relevantes para conservar evidencia aunque la biblioteca cambie luego.
 */
export interface ComparableSnapshot {
  id: string;
  comparableId: string;
  fechaSnapshot: string;
  payload: Record<string, unknown>;   // copia literal del comparable
}

export interface ComparablesBloque {
  filtros: FiltrosComparablesUrbano;
  seleccionados: ComparableSeleccionRef[];
  descartados: ComparableDescarteRef[];
  snapshots: ComparableSnapshot[];
}

// Placeholder reservado de F1.6 (no se elimina por compatibilidad)
export interface FactorHomologacion {
  id: string;
  nombre: string;
  tipo: string;
  valor: number | null;
  observaciones: string;
}

// ── Homologación preliminar (F2B) ────────────────────────────────────────────

export type TipoFactorHomologacion =
  | 'superficie'
  | 'ubicacion'
  | 'ambientes'
  | 'negociacion'
  | 'tipo_zona'
  | 'via_acceso'
  | 'servicios'
  | 'equipamiento'
  | 'topografia'
  | 'forma_posicion'
  | 'conservacion'
  | 'fuente_confiabilidad'
  | 'manual'
  | 'otro';

export const FACTORES_HOMOLOGACION_DEF: ReadonlyArray<{
  tipo: TipoFactorHomologacion;
  nombre: string;
}> = [
  { tipo: 'superficie', nombre: 'Superficie' },
  { tipo: 'ubicacion', nombre: 'Ubicación' },
  { tipo: 'ambientes', nombre: 'Ambientes' },
  { tipo: 'negociacion', nombre: 'Negociación / tiempo en mercado' },
  { tipo: 'tipo_zona', nombre: 'Tipo de zona' },
  { tipo: 'via_acceso', nombre: 'Vía de acceso' },
  { tipo: 'servicios', nombre: 'Servicios públicos' },
  { tipo: 'equipamiento', nombre: 'Equipamiento urbano' },
  { tipo: 'topografia', nombre: 'Topografía' },
  { tipo: 'forma_posicion', nombre: 'Forma / posición del terreno' },
  { tipo: 'conservacion', nombre: 'Estado de conservación' },
  { tipo: 'fuente_confiabilidad', nombre: 'Fuente / confiabilidad' },
  { tipo: 'manual', nombre: 'Factor manual adicional' },
];

export type OrigenFactorHomologacion = 'manual' | 'catalogo' | 'calculado';

export interface FactorHomologacionDetalle {
  id: string;
  comparableId: string;
  tipoFactor: TipoFactorHomologacion;
  nombre: string;
  valorSujeto: string;
  valorComparable: string;
  coeficiente: number;
  ponderacion: number | null;
  aplica: boolean;
  justificacion: string;
  origen: OrigenFactorHomologacion;
  fechaActualizacion: string;
}

export type BaseUnitariaHomologacion = 'terreno' | 'construccion';

export interface HomologacionComparable {
  comparableId: string;
  baseUnitaria: BaseUnitariaHomologacion;
  precioBase: number | null;
  /** Si el comparable no trae precio unitario, el perito puede capturarlo. */
  precioUnitarioBaseManual: number | null;
  observaciones: string;
  factores: FactorHomologacionDetalle[];
  fechaActualizacion: string;
}

export type CriterioAdopcionHomologacion =
  | 'pendiente'
  | 'promedio'
  | 'mediana'
  | 'manual';

export interface HomologacionBloque {
  comparables: HomologacionComparable[];
  valorUnitarioPromedio: number | null;
  valorUnitarioMediana: number | null;
  valorUnitarioAdoptado: number | null;
  criterioAdopcion: CriterioAdopcionHomologacion;
  observacionesHomologacion: string;
}

export interface PlaceholderModuloUrbano {
  pendiente: true;
  notas?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raíz del módulo urbano
// ─────────────────────────────────────────────────────────────────────────────

export interface ModuloUrbanoExpediente {
  id: string;
  expedienteId: string;
  version: 1;
  fechaCreacion: string;
  fechaActualizacion: string;

  // Captura básica (F1/F1.5)
  identificacion: IdentificacionModuloUrbano;
  ubicacion: UbicacionModuloUrbano;
  legal: LegalModuloUrbano;
  entorno: EntornoModuloUrbano;
  terreno: TerrenoModuloUrbano;                  // resumen plano (compat)
  construcciones: ConstruccionesModuloUrbano;    // resumen plano (compat)

  // Modelo relacional (F1.6)
  terrenos: TerrenoItem[];
  mejoras: MejoraItem[];
  construccionesDetalle: ConstruccionItem[];
  ambientesDetalle: AmbienteItem[];
  comparablesBloque: ComparablesBloque;
  factoresHomologacion: FactorHomologacion[];
  homologacionBloque: HomologacionBloque;

  // Placeholders (F2-F6)
  ambientes: PlaceholderModuloUrbano;
  fotografias: PlaceholderModuloUrbano;
  comparables: PlaceholderModuloUrbano;
  homologacion: PlaceholderModuloUrbano;
  costoReposicion: PlaceholderModuloUrbano;
  depreciacion: PlaceholderModuloUrbano;
  calculoFinal: PlaceholderModuloUrbano;
  informe: PlaceholderModuloUrbano;
  anexos: PlaceholderModuloUrbano;

  // Estado por sección
  estadosSeccion: Record<SeccionModuloUrbano, EstadoSeccionModuloUrbano>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function crearTerrenoVacio(): TerrenoItem {
  return {
    id: uid('ter'),
    codigo: '',
    nombre: '',
    tipo: 'principal',
    area: null,
    unidad: 'm2',
    frente: null,
    fondo: null,
    forma: '',
    topografia: '',
    linderos: '',
    usoActual: '',
    afectaciones: '',
    observaciones: '',
    estado: 'activo',
  };
}

export function crearMejoraVacia(): MejoraItem {
  return {
    id: uid('mej'),
    terrenoId: null,
    tipo: 'otro',
    descripcion: '',
    unidad: 'm2',
    cantidad: null,
    estadoConservacion: '',
    observaciones: '',
  };
}

export function crearConstruccionVacia(): ConstruccionItem {
  return {
    id: uid('con'),
    codigo: '',
    nombre: '',
    tipo: '',
    terrenoId: null,
    areaConstruida: null,
    niveles: null,
    anioConstruccion: null,
    edadAparente: null,
    sistemaConstructivo: '',
    estadoConservacion: '',
    vidaUtilEstimada: null,
    observaciones: '',
  };
}

export function crearAmbienteVacio(construccionId: string): AmbienteItem {
  return {
    id: uid('amb'),
    construccionId,
    tipo: 'otro',
    nombre: '',
    cantidad: null,
    area: null,
    estado: '',
    observaciones: '',
  };
}

export function crearFiltrosComparablesVacios(): FiltrosComparablesUrbano {
  return {
    municipio: '',
    zona: '',
    tipoInmueble: '',
    uso: '',
    areaMin: null,
    areaMax: null,
    precioMin: null,
    precioMax: null,
    fechaDesde: '',
    fechaHasta: '',
    fuente: '',
    estado: '',
    viaAcceso: '',
    servicios: '',
    topografia: '',
  };
}

export function crearComparablesBloqueVacio(): ComparablesBloque {
  return {
    filtros: crearFiltrosComparablesVacios(),
    seleccionados: [],
    descartados: [],
    snapshots: [],
  };
}

export function crearHomologacionBloqueVacio(): HomologacionBloque {
  return {
    comparables: [],
    valorUnitarioPromedio: null,
    valorUnitarioMediana: null,
    valorUnitarioAdoptado: null,
    criterioAdopcion: 'pendiente',
    observacionesHomologacion: '',
  };
}

export function crearHomologacionComparableVacio(
  comparableId: string,
  base: BaseUnitariaHomologacion = 'terreno',
): HomologacionComparable {
  return {
    comparableId,
    baseUnitaria: base,
    precioBase: null,
    precioUnitarioBaseManual: null,
    observaciones: '',
    factores: [],
    fechaActualizacion: new Date().toISOString(),
  };
}

export function crearFactorHomologacionDetalle(
  comparableId: string,
  tipo: TipoFactorHomologacion,
  nombre?: string,
): FactorHomologacionDetalle {
  const def = FACTORES_HOMOLOGACION_DEF.find((d) => d.tipo === tipo);
  return {
    id: uid('fac'),
    comparableId,
    tipoFactor: tipo,
    nombre: nombre ?? def?.nombre ?? 'Factor',
    valorSujeto: '',
    valorComparable: '',
    coeficiente: 1,
    ponderacion: null,
    aplica: true,
    justificacion: '',
    origen: 'manual',
    fechaActualizacion: new Date().toISOString(),
  };
}

export function crearModuloUrbanoVacio(expedienteId: string): ModuloUrbanoExpediente {
  const now = new Date().toISOString();
  const estadosSeccion = SECCIONES_MODULO_URBANO.reduce(
    (acc, s) => {
      acc[s.key] = 'pendiente';
      return acc;
    },
    {} as Record<SeccionModuloUrbano, EstadoSeccionModuloUrbano>,
  );

  return {
    id: uid('mu'),
    expedienteId,
    version: 1,
    fechaCreacion: now,
    fechaActualizacion: now,
    identificacion: {
      tipoInmueble: '',
      propositoAvaluo: '',
      fechaInspeccion: '',
      cliente: '',
      usoActual: '',
      observacionesGenerales: '',
    },
    ubicacion: {
      departamento: '',
      municipio: '',
      distrito: '',
      barrio: '',
      direccionExacta: '',
      coordenadasGps: '',
      referencia: '',
      distanciaCentroUrbanoKm: null,
    },
    legal: {
      numeroEscritura: '',
      notario: '',
      fechaEscritura: '',
      numeroCatastral: '',
      areaRegistral: null,
      areaCatastral: null,
      gravamenes: '',
    },
    entorno: {
      tipoZona: '',
      viasAcceso: '',
      serviciosPublicos: '',
      equipamientoUrbano: '',
    },
    terreno: {
      areaTerreno: null,
      frente: null,
      fondo: null,
      topografia: '',
      forma: '',
    },
    construcciones: {
      anioConstruccion: null,
      tipoConstructivo: '',
      estadoConservacion: '',
      areaConstruidaPreliminar: null,
      niveles: null,
    },
    terrenos: [],
    mejoras: [],
    construccionesDetalle: [],
    ambientesDetalle: [],
    comparablesBloque: crearComparablesBloqueVacio(),
    factoresHomologacion: [],
    homologacionBloque: crearHomologacionBloqueVacio(),
    ambientes: { pendiente: true },
    fotografias: { pendiente: true },
    comparables: { pendiente: true },
    homologacion: { pendiente: true },
    costoReposicion: { pendiente: true },
    depreciacion: { pendiente: true },
    calculoFinal: { pendiente: true },
    informe: { pendiente: true },
    anexos: { pendiente: true },
    estadosSeccion,
  };
}

/**
 * Migración suave: rellena campos relacionales agregados en F1.6 si el módulo
 * fue creado en F1/F1.5. No borra datos previos.
 */
export function migrarModuloUrbano(modulo: ModuloUrbanoExpediente): ModuloUrbanoExpediente {
  const m = modulo as Partial<ModuloUrbanoExpediente> & ModuloUrbanoExpediente;
  let changed = false;
  if (!Array.isArray(m.terrenos)) { m.terrenos = []; changed = true; }
  if (!Array.isArray(m.mejoras)) { m.mejoras = []; changed = true; }
  if (!Array.isArray(m.construccionesDetalle)) { m.construccionesDetalle = []; changed = true; }
  if (!Array.isArray(m.ambientesDetalle)) { m.ambientesDetalle = []; changed = true; }
  if (!Array.isArray(m.factoresHomologacion)) { m.factoresHomologacion = []; changed = true; }
  if (!m.comparablesBloque || typeof m.comparablesBloque !== 'object') {
    m.comparablesBloque = crearComparablesBloqueVacio();
    changed = true;
  } else {
    if (!m.comparablesBloque.filtros) {
      m.comparablesBloque.filtros = crearFiltrosComparablesVacios();
      changed = true;
    }
    if (!Array.isArray(m.comparablesBloque.seleccionados)) {
      m.comparablesBloque.seleccionados = [];
      changed = true;
    }
    if (!Array.isArray(m.comparablesBloque.descartados)) {
      m.comparablesBloque.descartados = [];
      changed = true;
    }
    if (!Array.isArray(m.comparablesBloque.snapshots)) {
      m.comparablesBloque.snapshots = [];
      changed = true;
    }
  }
  if (!m.homologacionBloque || typeof m.homologacionBloque !== 'object') {
    m.homologacionBloque = crearHomologacionBloqueVacio();
    changed = true;
  } else {
    if (!Array.isArray(m.homologacionBloque.comparables)) {
      m.homologacionBloque.comparables = [];
      changed = true;
    }
    if (m.homologacionBloque.criterioAdopcion == null) {
      m.homologacionBloque.criterioAdopcion = 'pendiente';
      changed = true;
    }
    for (const hc of m.homologacionBloque.comparables) {
      if (!Array.isArray(hc.factores)) { hc.factores = []; changed = true; }
    }
  }
  return changed ? { ...m } : m;
}
