export type TipoComparableINMOVAL =
  | 'venta'
  | 'oferta'
  | 'renta'
  | 'avaluo'
  | 'referencia';

export type AplicacionMercadoComparableINMOVAL =
  | 'construido'
  | 'terreno'
  | 'ambos';

export type EstadoComparableINMOVAL =
  | 'activo'
  | 'congelado'
  | 'archivado';

export type MonedaComparableINMOVAL = 'US$' | 'C$';

export type ComparableIndiceINMOVAL = {
  id: string;
  codigo: string;
  titulo: string;

  tipo: TipoComparableINMOVAL;
  aplicaMercado?: AplicacionMercadoComparableINMOVAL;
  estado: EstadoComparableINMOVAL;

  fuente?: string;
  contacto?: string;
  telefono?: string;
  url?: string;

  testigoWebImagenDataUrl?: string;
  testigoWebImagenNombre?: string;
  testigoWebCapturadoEn?: string;
  testigoWebNotas?: string;

  fecha: string;

  ubicacion: string;
  barrio?: string;
  municipio?: string;
  departamento?: string;

  areaTerreno?: number;
  areaConstruccion?: number;

  precio: number;
  moneda: MonedaComparableINMOVAL;

  precioUnitarioTerreno?: number;
  precioUnitarioConstruccion?: number;

  observaciones?: string;

  expedienteOrigenId?: string;
  expedienteOrigenCodigo?: string;

  creadoEn: string;
  actualizadoEn: string;
};

export type ComparableFiltrosINMOVAL = {
  busqueda?: string;
  tipo?: TipoComparableINMOVAL | 'todos';
  estado?: EstadoComparableINMOVAL | 'todos';
};

const COMPARABLES_KEY = 'inmoval_comparables_indice_v1';

export function getComparablesIndiceINMOVAL(): ComparableIndiceINMOVAL[] {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(COMPARABLES_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed as ComparableIndiceINMOVAL[];
  } catch {
    return [];
  }
}

export function saveComparablesIndiceINMOVAL(
  comparables: ComparableIndiceINMOVAL[]
) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(COMPARABLES_KEY, JSON.stringify(comparables));
}

export function upsertComparableINMOVAL(comparable: ComparableIndiceINMOVAL) {
  const comparables = getComparablesIndiceINMOVAL();
  const index = comparables.findIndex((item) => item.id === comparable.id);

  if (index >= 0) {
    comparables[index] = comparable;
  } else {
    comparables.unshift(comparable);
  }

  saveComparablesIndiceINMOVAL(comparables);
}

export function removeComparableINMOVAL(id: string) {
  const comparables = getComparablesIndiceINMOVAL().filter(
    (item) => item.id !== id
  );

  saveComparablesIndiceINMOVAL(comparables);
}

export function comparableCoincideConBusqueda(
  comparable: ComparableIndiceINMOVAL,
  busqueda?: string
) {
  if (!busqueda?.trim()) return true;

  const q = busqueda.trim().toLowerCase();

  return [
    comparable.codigo,
    comparable.titulo,
    comparable.ubicacion,
    comparable.barrio,
    comparable.municipio,
    comparable.departamento,
    comparable.fuente,
    comparable.contacto,
    comparable.expedienteOrigenCodigo,
    comparable.observaciones,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

export function filtrarComparablesINMOVAL(
  comparables: ComparableIndiceINMOVAL[],
  filtros: ComparableFiltrosINMOVAL
) {
  return comparables.filter((comparable) => {
    if (filtros.tipo && filtros.tipo !== 'todos' && comparable.tipo !== filtros.tipo) {
      return false;
    }

    if (
      filtros.estado &&
      filtros.estado !== 'todos' &&
      comparable.estado !== filtros.estado
    ) {
      return false;
    }

    return comparableCoincideConBusqueda(comparable, filtros.busqueda);
  });
}
