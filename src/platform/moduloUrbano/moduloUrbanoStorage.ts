// Módulo Técnico Urbano — Persistencia local (Fase Técnica 02 / F1)
// Clave nueva, NO colisiona con claves existentes.

import {
  crearModuloUrbanoVacio,
  type ModuloUrbanoExpediente,
} from './moduloUrbanoTypes';

export const STORAGE_KEY_MODULO_URBANO = 'inmoval_modulo_urbano_v1';

function readAll(): ModuloUrbanoExpediente[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_MODULO_URBANO);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ModuloUrbanoExpediente[]) : [];
  } catch {
    return [];
  }
}

function writeAll(modulos: ModuloUrbanoExpediente[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY_MODULO_URBANO,
      JSON.stringify(modulos),
    );
  } catch {
    // ignorar errores de cuota — no es bloqueante en F1
  }
}

export function getModulosUrbanos(): ModuloUrbanoExpediente[] {
  return readAll();
}

export function getModuloUrbanoPorExpediente(
  expedienteId: string,
): ModuloUrbanoExpediente | null {
  if (!expedienteId) return null;
  return readAll().find((m) => m.expedienteId === expedienteId) ?? null;
}

export function upsertModuloUrbano(modulo: ModuloUrbanoExpediente): ModuloUrbanoExpediente {
  const all = readAll();
  const idx = all.findIndex((m) => m.id === modulo.id);
  const actualizado: ModuloUrbanoExpediente = {
    ...modulo,
    fechaActualizacion: new Date().toISOString(),
  };
  if (idx >= 0) {
    all[idx] = actualizado;
  } else {
    all.push(actualizado);
  }
  writeAll(all);
  return actualizado;
}

/**
 * Devuelve el módulo urbano del expediente; si no existe, lo crea vacío y
 * lo persiste. Vínculo por `expedienteId`.
 */
export function ensureModuloUrbano(expedienteId: string): ModuloUrbanoExpediente {
  const existente = getModuloUrbanoPorExpediente(expedienteId);
  if (existente) return existente;
  const nuevo = crearModuloUrbanoVacio(expedienteId);
  return upsertModuloUrbano(nuevo);
}
