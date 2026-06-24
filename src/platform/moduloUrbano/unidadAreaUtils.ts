// Helpers de conversión de unidades de área para el módulo urbano (F2C.1).
// Conversión NO se aplica de forma agresiva: estos helpers están disponibles para
// uso futuro y para mostrar advertencias cuando la unidad del terreno no coincide
// con la unidad base de la valoración.

import type { UnidadAreaUrbano, UnidadBaseValor } from './moduloUrbanoTypes';

// Factores hacia m² (base canónica).
// 1 vara² ≈ 0.6987 m²  (vara = 0.836 m, vara² ≈ 0.6987 m²)
// 1 manzana (mz, Centroamérica) = 10,000 vr² ≈ 6,987 m²
// 1 hectárea (ha) = 10,000 m²
const FACTORES_A_M2: Record<UnidadBaseValor, number> = {
  m2: 1,
  vara2: 0.6987,
  mz: 6987,
  ha: 10000,
};

export type UnidadAreaConocida = UnidadBaseValor;

export function esUnidadConocida(u: UnidadAreaUrbano | string | null | undefined): u is UnidadAreaConocida {
  return u === 'm2' || u === 'vara2' || u === 'mz' || u === 'ha';
}

/**
 * Convierte un área de una unidad a otra.
 * Devuelve null si alguna unidad no es convertible (ej. 'otro').
 */
export function convertirArea(
  valor: number,
  desde: UnidadAreaUrbano | string,
  hacia: UnidadBaseValor,
): number | null {
  if (!Number.isFinite(valor)) return null;
  if (!esUnidadConocida(desde) || !esUnidadConocida(hacia)) return null;
  if (desde === hacia) return valor;
  const enM2 = valor * FACTORES_A_M2[desde];
  return enM2 / FACTORES_A_M2[hacia];
}

export function unidadesCoinciden(
  unidadTerreno: UnidadAreaUrbano | string | null | undefined,
  unidadBase: UnidadBaseValor,
): boolean {
  return unidadTerreno === unidadBase;
}

const NOMBRE_UNIDAD: Record<UnidadAreaConocida, string> = {
  m2: 'm²',
  vara2: 'vara²',
  mz: 'manzana',
  ha: 'hectárea',
};

export function nombreUnidad(u: UnidadAreaUrbano | string | null | undefined): string {
  if (esUnidadConocida(u)) return NOMBRE_UNIDAD[u];
  return String(u ?? '—');
}

/**
 * Genera un mensaje de advertencia cuando la unidad del terreno no coincide
 * con la unidad base de la valoración. Devuelve null si no hay advertencia.
 */
export function advertenciaUnidad(
  unidadTerreno: UnidadAreaUrbano | string | null | undefined,
  unidadBase: UnidadBaseValor,
): string | null {
  if (!unidadTerreno) return null;
  if (unidadesCoinciden(unidadTerreno, unidadBase)) return null;

  if (unidadBase === 'mz' || unidadBase === 'ha') {
    return `Unidad base ${nombreUnidad(unidadBase)} requiere revisión técnica (terreno en ${nombreUnidad(unidadTerreno)}).`;
  }
  if (esUnidadConocida(unidadTerreno)) {
    return `Unidad del terreno (${nombreUnidad(unidadTerreno)}) no coincide con la unidad base (${nombreUnidad(unidadBase)}). Verificar conversión manual del área homologable.`;
  }
  return `Unidad del terreno (${String(unidadTerreno)}) no es estándar; revisar manualmente respecto a la unidad base (${nombreUnidad(unidadBase)}).`;
}
