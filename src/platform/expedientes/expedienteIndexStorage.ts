import { INMOVAL_STORAGE_KEYS } from '@/platform/configuracion/inmovalStorageKeys';
import {
  readLocalStorageJSON,
  writeLocalStorageJSON,
} from '@/platform/storage/platformStorage';
import {
  ExpedienteIndiceFiltrosINMOVAL,
  ExpedienteIndiceINMOVAL,
  expedienteIndiceCoincideConBusqueda,
} from './expedienteIndexTypes';

export function getExpedientesIndiceINMOVAL() {
  return readLocalStorageJSON<ExpedienteIndiceINMOVAL[]>(
    INMOVAL_STORAGE_KEYS.expedientesIndice,
    []
  );
}

export function saveExpedientesIndiceINMOVAL(
  expedientes: ExpedienteIndiceINMOVAL[]
) {
  writeLocalStorageJSON(
    INMOVAL_STORAGE_KEYS.expedientesIndice,
    ordenarExpedientesIndice(expedientes)
  );
}

export function upsertExpedienteIndiceINMOVAL(
  expediente: ExpedienteIndiceINMOVAL
) {
  const actuales = getExpedientesIndiceINMOVAL();
  const existe = actuales.some((item) => item.id === expediente.id);

  const siguientes = existe
    ? actuales.map((item) => (item.id === expediente.id ? expediente : item))
    : [expediente, ...actuales];

  saveExpedientesIndiceINMOVAL(siguientes);

  return expediente;
}

export function removeExpedienteIndiceINMOVAL(id: string) {
  const actuales = getExpedientesIndiceINMOVAL();
  const siguientes = actuales.filter((item) => item.id !== id);

  saveExpedientesIndiceINMOVAL(siguientes);
}

export function filtrarExpedientesIndiceINMOVAL(
  expedientes: ExpedienteIndiceINMOVAL[],
  filtros: ExpedienteIndiceFiltrosINMOVAL
) {
  return ordenarExpedientesIndice(
    expedientes.filter((expediente) => {
      if (!expedienteIndiceCoincideConBusqueda(expediente, filtros.busqueda)) {
        return false;
      }

      if (
        filtros.tipoModulo &&
        filtros.tipoModulo !== 'todos' &&
        expediente.tipoModulo !== filtros.tipoModulo
      ) {
        return false;
      }

      if (
        filtros.estado &&
        filtros.estado !== 'todos' &&
        expediente.estado !== filtros.estado
      ) {
        return false;
      }

      if (
        filtros.prioridad &&
        filtros.prioridad !== 'todos' &&
        expediente.prioridad !== filtros.prioridad
      ) {
        return false;
      }

      if (
        filtros.estadoPago &&
        filtros.estadoPago !== 'todos' &&
        expediente.estadoPago !== filtros.estadoPago
      ) {
        return false;
      }

      return true;
    })
  );
}

export function ordenarExpedientesIndice(
  expedientes: ExpedienteIndiceINMOVAL[]
) {
  return [...expedientes].sort((a, b) =>
    b.actualizadoEn.localeCompare(a.actualizadoEn)
  );
}
