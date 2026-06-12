import { nowISO } from '@/shared/utils/dateUtils';
import { ComparableIndiceINMOVAL } from '@/platform/comparables/comparableStorage';

export type EstadoComparableAvaluoINMOVAL =
  | 'preseleccionado'
  | 'usado'
  | 'descartado'
  | 'congelado';

export type RevisionComparableAvaluoINMOVAL =
  | 'Rev00'
  | 'Rev01'
  | 'Rev02'
  | 'Rev03'
  | 'Final';

export type ComparableAvaluoINMOVAL = {
  id: string;
  avaluoId: string;
  comparableId: string;
  comparableCodigo: string;
  estado: EstadoComparableAvaluoINMOVAL;
  revision: RevisionComparableAvaluoINMOVAL;
  snapshot: ComparableIndiceINMOVAL;
  justificacion?: string;
  ajusteResumen?: string;
  pesoTecnico?: number;
  congeladoEn?: string;
  creadoEn: string;
  actualizadoEn: string;
};

const AVALUO_COMPARABLES_KEY = 'inmoval_avaluo_comparables_v1';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `av-comp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getAllAvaluoComparablesINMOVAL(): ComparableAvaluoINMOVAL[] {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(AVALUO_COMPARABLES_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed as ComparableAvaluoINMOVAL[];
  } catch {
    return [];
  }
}

export function saveAllAvaluoComparablesINMOVAL(items: ComparableAvaluoINMOVAL[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(AVALUO_COMPARABLES_KEY, JSON.stringify(items));
}

export function getAvaluoComparablesINMOVAL(avaluoId: string) {
  return getAllAvaluoComparablesINMOVAL().filter(
    (item) => item.avaluoId === avaluoId
  );
}

export function addComparableToAvaluoINMOVAL(
  avaluoId: string,
  comparable: ComparableIndiceINMOVAL
) {
  const all = getAllAvaluoComparablesINMOVAL();
  const existente = all.find(
    (item) => item.avaluoId === avaluoId && item.comparableId === comparable.id
  );

  const ahora = nowISO();

  if (existente) {
    const actualizado: ComparableAvaluoINMOVAL = {
      ...existente,
      estado: 'preseleccionado',
      snapshot: comparable,
      actualizadoEn: ahora,
    };

    saveAllAvaluoComparablesINMOVAL(
      all.map((item) => (item.id === existente.id ? actualizado : item))
    );

    return actualizado;
  }

  const nuevo: ComparableAvaluoINMOVAL = {
    id: createId(),
    avaluoId,
    comparableId: comparable.id,
    comparableCodigo: comparable.codigo,
    estado: 'preseleccionado',
    revision: 'Rev00',
    snapshot: comparable,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };

  saveAllAvaluoComparablesINMOVAL([nuevo, ...all]);

  return nuevo;
}

export function updateComparableAvaluoINMOVAL(
  id: string,
  cambios: Partial<ComparableAvaluoINMOVAL>
) {
  const all = getAllAvaluoComparablesINMOVAL();
  const ahora = nowISO();

  saveAllAvaluoComparablesINMOVAL(
    all.map((item) =>
      item.id === id
        ? {
            ...item,
            ...cambios,
            actualizadoEn: ahora,
          }
        : item
    )
  );
}

export function congelarComparableAvaluoINMOVAL(id: string) {
  updateComparableAvaluoINMOVAL(id, {
    estado: 'congelado',
    congeladoEn: nowISO(),
  });
}

export function removeComparableAvaluoINMOVAL(id: string) {
  saveAllAvaluoComparablesINMOVAL(
    getAllAvaluoComparablesINMOVAL().filter((item) => item.id !== id)
  );
}
