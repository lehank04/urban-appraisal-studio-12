import { INMOVAL_STORAGE_KEYS } from '@/platform/configuracion/inmovalStorageKeys';
import {
  readLocalStorageJSON,
  writeLocalStorageJSON,
} from '@/platform/storage/platformStorage';
import { CotizacionINMOVAL } from './cotizacionTypes';

export function getCotizacionesIndiceINMOVAL() {
  return readLocalStorageJSON<CotizacionINMOVAL[]>(
    INMOVAL_STORAGE_KEYS.cotizacionesIndice,
    []
  );
}

export function saveCotizacionesIndiceINMOVAL(
  cotizaciones: CotizacionINMOVAL[]
) {
  writeLocalStorageJSON(
    INMOVAL_STORAGE_KEYS.cotizacionesIndice,
    ordenarCotizaciones(cotizaciones)
  );
}

export function upsertCotizacionINMOVAL(cotizacion: CotizacionINMOVAL) {
  const actuales = getCotizacionesIndiceINMOVAL();
  const existe = actuales.some((item) => item.id === cotizacion.id);

  const siguientes = existe
    ? actuales.map((item) => (item.id === cotizacion.id ? cotizacion : item))
    : [cotizacion, ...actuales];

  saveCotizacionesIndiceINMOVAL(siguientes);

  return cotizacion;
}

export function removeCotizacionINMOVAL(id: string) {
  const actuales = getCotizacionesIndiceINMOVAL();
  saveCotizacionesIndiceINMOVAL(actuales.filter((item) => item.id !== id));
}

export function ordenarCotizaciones(cotizaciones: CotizacionINMOVAL[]) {
  return [...cotizaciones].sort((a, b) =>
    b.actualizadoEn.localeCompare(a.actualizadoEn)
  );
}
