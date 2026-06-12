import { INMOVAL_STORAGE_KEYS } from '@/platform/configuracion/inmovalStorageKeys';
import {
  readLocalStorageJSON,
  writeLocalStorageJSON,
} from '@/platform/storage/platformStorage';
import { ActividadINMOVAL } from '@/shared/types/inmovalCore';
import { ordenarActividadPorFechaDesc } from './actividadUtils';

export function getActividadINMOVAL() {
  return readLocalStorageJSON<ActividadINMOVAL[]>(
    INMOVAL_STORAGE_KEYS.actividad,
    []
  );
}

export function saveActividadINMOVAL(actividad: ActividadINMOVAL[]) {
  writeLocalStorageJSON(
    INMOVAL_STORAGE_KEYS.actividad,
    ordenarActividadPorFechaDesc(actividad)
  );
}

export function appendActividadINMOVAL(nuevaActividad: ActividadINMOVAL) {
  const actuales = getActividadINMOVAL();
  const siguientes = ordenarActividadPorFechaDesc([
    nuevaActividad,
    ...actuales,
  ]);

  saveActividadINMOVAL(siguientes);

  return nuevaActividad;
}

export function clearActividadINMOVAL() {
  saveActividadINMOVAL([]);
}
