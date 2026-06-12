import { INMOVAL_STORAGE_KEYS } from '@/platform/configuracion/inmovalStorageKeys';
import {
  readLocalStorageJSON,
  writeLocalStorageJSON,
} from '@/platform/storage/platformStorage';
import { PeritoINMOVAL } from './peritoTypes';

const PERITOS_KEY = 'inmoval_peritos_indice_v1';

export function getPeritosINMOVAL() {
  return readLocalStorageJSON<PeritoINMOVAL[]>(
    PERITOS_KEY as typeof INMOVAL_STORAGE_KEYS.configuracionLocal,
    []
  );
}

export function savePeritosINMOVAL(peritos: PeritoINMOVAL[]) {
  writeLocalStorageJSON(
    PERITOS_KEY as typeof INMOVAL_STORAGE_KEYS.configuracionLocal,
    ordenarPeritos(peritos)
  );
}

export function upsertPeritoINMOVAL(perito: PeritoINMOVAL) {
  const actuales = getPeritosINMOVAL();
  const existe = actuales.some((item) => item.id === perito.id);

  const siguientes = existe
    ? actuales.map((item) => (item.id === perito.id ? perito : item))
    : [perito, ...actuales];

  savePeritosINMOVAL(siguientes);

  return perito;
}

export function removePeritoINMOVAL(id: string) {
  savePeritosINMOVAL(getPeritosINMOVAL().filter((item) => item.id !== id));
}

export function ordenarPeritos(peritos: PeritoINMOVAL[]) {
  return [...peritos].sort((a, b) => a.nombre.localeCompare(b.nombre));
}
