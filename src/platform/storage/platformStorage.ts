import { InmovalStorageKey } from '@/platform/configuracion/inmovalStorageKeys';

export function readLocalStorageJSON<T>(
  key: InmovalStorageKey,
  fallback: T
): T {
  if (typeof window === 'undefined') return fallback;

  const raw = window.localStorage.getItem(key);

  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocalStorageJSON<T>(key: InmovalStorageKey, value: T) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeLocalStorageItem(key: InmovalStorageKey) {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(key);
}
