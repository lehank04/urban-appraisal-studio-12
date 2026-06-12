import { INMOVAL_STORAGE_KEYS } from '@/platform/configuracion/inmovalStorageKeys';
import {
  readLocalStorageJSON,
  writeLocalStorageJSON,
} from '@/platform/storage/platformStorage';
import { ClienteINMOVAL } from './clienteTypes';

const CLIENTES_KEY = 'inmoval_clientes_indice_v1';

export function getClientesINMOVAL() {
  return readLocalStorageJSON<ClienteINMOVAL[]>(
    CLIENTES_KEY as typeof INMOVAL_STORAGE_KEYS.configuracionLocal,
    []
  );
}

export function saveClientesINMOVAL(clientes: ClienteINMOVAL[]) {
  writeLocalStorageJSON(
    CLIENTES_KEY as typeof INMOVAL_STORAGE_KEYS.configuracionLocal,
    ordenarClientes(clientes)
  );
}

export function upsertClienteINMOVAL(cliente: ClienteINMOVAL) {
  const actuales = getClientesINMOVAL();
  const existe = actuales.some((item) => item.id === cliente.id);

  const siguientes = existe
    ? actuales.map((item) => (item.id === cliente.id ? cliente : item))
    : [cliente, ...actuales];

  saveClientesINMOVAL(siguientes);

  return cliente;
}

export function removeClienteINMOVAL(id: string) {
  saveClientesINMOVAL(getClientesINMOVAL().filter((item) => item.id !== id));
}

export function ordenarClientes(clientes: ClienteINMOVAL[]) {
  return [...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
}
