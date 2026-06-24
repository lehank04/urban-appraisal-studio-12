// Módulo Técnico Urbano — Tipos base (Fase Técnica 02 / F1)
// No reemplaza tipos existentes. Estructura mínima para captura inicial.

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
// Bloques de captura (F1: sólo campos básicos; el resto queda como placeholder)
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

export interface TerrenoModuloUrbano {
  areaTerreno: number | null;
  frente: number | null;
  fondo: number | null;
  topografia: string;
  forma: string;
}

export interface ConstruccionesModuloUrbano {
  anioConstruccion: number | null;
  tipoConstructivo: string;
  estadoConservacion: string;
  areaConstruidaPreliminar: number | null;
  niveles: number | null;
}

// Placeholders para fases posteriores (F2-F6). Se persisten como objetos
// vacíos para no romper la estructura cuando se llenen más adelante.
export interface PlaceholderModuloUrbano {
  pendiente: true;
  notas?: string;
}

export interface ModuloUrbanoExpediente {
  id: string;
  expedienteId: string;
  version: 1;
  fechaCreacion: string;
  fechaActualizacion: string;

  // Bloques con captura básica habilitada en F1
  identificacion: IdentificacionModuloUrbano;
  ubicacion: UbicacionModuloUrbano;
  legal: LegalModuloUrbano;
  entorno: EntornoModuloUrbano;
  terreno: TerrenoModuloUrbano;
  construcciones: ConstruccionesModuloUrbano;

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
    id: `mu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
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
