import { nowISO } from '@/shared/utils/dateUtils';
import { ComparableIndiceINMOVAL } from '@/platform/comparables/comparableStorage';

export type EstadoComparableExpedienteINMOVAL =
  | 'seleccionado'
  | 'congelado'
  | 'descartado';

export type ComparableExpedienteINMOVAL = {
  id: string;
  expedienteId: string;
  comparableId: string;
  comparableCodigo: string;
  estado: EstadoComparableExpedienteINMOVAL;
  snapshot: ComparableIndiceINMOVAL;
  congeladoEn?: string;
  creadoEn: string;
  actualizadoEn: string;
};

const EXPEDIENTE_COMPARABLES_KEY = 'inmoval_expediente_comparables_v1';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `exp-comp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getAllExpedienteComparablesINMOVAL(): ComparableExpedienteINMOVAL[] {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(EXPEDIENTE_COMPARABLES_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed as ComparableExpedienteINMOVAL[];
  } catch {
    return [];
  }
}

export function saveAllExpedienteComparablesINMOVAL(
  items: ComparableExpedienteINMOVAL[]
) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(EXPEDIENTE_COMPARABLES_KEY, JSON.stringify(items));
}

export function getExpedienteComparablesINMOVAL(expedienteId: string) {
  return getAllExpedienteComparablesINMOVAL().filter(
    (item) => item.expedienteId === expedienteId
  );
}

export function addComparableToExpedienteINMOVAL(
  expedienteId: string,
  comparable: ComparableIndiceINMOVAL
) {
  const all = getAllExpedienteComparablesINMOVAL();
  const existente = all.find(
    (item) =>
      item.expedienteId === expedienteId && item.comparableId === comparable.id
  );

  const ahora = nowISO();

  if (existente) {
    const actualizado: ComparableExpedienteINMOVAL = {
      ...existente,
      estado: 'seleccionado',
      snapshot: comparable,
      actualizadoEn: ahora,
    };

    saveAllExpedienteComparablesINMOVAL(
      all.map((item) => (item.id === existente.id ? actualizado : item))
    );

    return actualizado;
  }

  const nuevo: ComparableExpedienteINMOVAL = {
    id: createId(),
    expedienteId,
    comparableId: comparable.id,
    comparableCodigo: comparable.codigo,
    estado: 'seleccionado',
    snapshot: comparable,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };

  saveAllExpedienteComparablesINMOVAL([nuevo, ...all]);

  return nuevo;
}

export function congelarComparableExpedienteINMOVAL(id: string) {
  const all = getAllExpedienteComparablesINMOVAL();
  const ahora = nowISO();

  saveAllExpedienteComparablesINMOVAL(
    all.map((item) =>
      item.id === id
        ? {
            ...item,
            estado: 'congelado',
            congeladoEn: ahora,
            actualizadoEn: ahora,
          }
        : item
    )
  );
}

export function descartarComparableExpedienteINMOVAL(id: string) {
  const all = getAllExpedienteComparablesINMOVAL();
  const ahora = nowISO();

  saveAllExpedienteComparablesINMOVAL(
    all.map((item) =>
      item.id === id
        ? {
            ...item,
            estado: 'descartado',
            actualizadoEn: ahora,
          }
        : item
    )
  );
}

export function removeComparableExpedienteINMOVAL(id: string) {
  saveAllExpedienteComparablesINMOVAL(
    getAllExpedienteComparablesINMOVAL().filter((item) => item.id !== id)
  );
}
