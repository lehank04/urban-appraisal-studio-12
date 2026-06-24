import type {
  ValoracionConstruccionBloque,
  ValoracionConstruccionItem,
} from './moduloUrbanoTypes';

/**
 * F3A — Cálculos permitidos:
 * - valorReposicionNuevo = areaConstruida × valorUnitarioReposicion
 * - depreciacionMonto = valorReposicionNuevo × depreciacionPorcentaje
 * - valorReposicionNeto = valorReposicionNuevo − depreciacionMonto
 *
 * En método lineal, depreciacionPorcentaje = min(edad / vidaUtil, 1).
 * Ross-Heidecke complejo queda pendiente; usa depreciacionPorcentaje manual.
 */
export function calcularValoracionConstruccionItem(
  item: ValoracionConstruccionItem,
): ValoracionConstruccionItem {
  const area = item.areaConstruida;
  const vu = item.valorUnitarioReposicion;

  let valorReposicionNuevo: number | null = null;
  if (
    area != null &&
    vu != null &&
    Number.isFinite(area) &&
    Number.isFinite(vu) &&
    area >= 0 &&
    vu >= 0
  ) {
    valorReposicionNuevo = area * vu;
  }

  let depreciacionPorcentaje = item.depreciacionPorcentaje;
  if (item.metodoDepreciacion === 'lineal') {
    const edad = item.edad;
    const vidaUtil = item.vidaUtil;
    if (
      edad != null &&
      vidaUtil != null &&
      Number.isFinite(edad) &&
      Number.isFinite(vidaUtil) &&
      vidaUtil > 0
    ) {
      depreciacionPorcentaje = Math.min(Math.max(edad / vidaUtil, 0), 1);
    }
  }

  let depreciacionMonto: number | null = null;
  let valorReposicionNeto: number | null = null;

  if (valorReposicionNuevo != null) {
    if (
      depreciacionPorcentaje != null &&
      Number.isFinite(depreciacionPorcentaje)
    ) {
      const pct = Math.min(Math.max(depreciacionPorcentaje, 0), 1);
      depreciacionMonto = valorReposicionNuevo * pct;
      valorReposicionNeto = valorReposicionNuevo - depreciacionMonto;
    } else {
      valorReposicionNeto = valorReposicionNuevo;
    }
  }

  return {
    ...item,
    depreciacionPorcentaje,
    valorReposicionNuevo,
    depreciacionMonto,
    valorReposicionNeto,
  };
}

export function calcularTotalesValoracionConstruccion(
  items: ValoracionConstruccionItem[],
): Pick<
  ValoracionConstruccionBloque,
  'totalReposicionNuevo' | 'totalDepreciacion' | 'totalReposicionNeto'
> {
  let totalReposicionNuevo: number | null = null;
  let totalDepreciacion: number | null = null;
  let totalReposicionNeto: number | null = null;

  for (const raw of items) {
    const item = calcularValoracionConstruccionItem(raw);
    if (item.valorReposicionNuevo != null) {
      totalReposicionNuevo =
        (totalReposicionNuevo ?? 0) + item.valorReposicionNuevo;
    }
    if (item.depreciacionMonto != null) {
      totalDepreciacion = (totalDepreciacion ?? 0) + item.depreciacionMonto;
    }
    if (item.valorReposicionNeto != null) {
      totalReposicionNeto = (totalReposicionNeto ?? 0) + item.valorReposicionNeto;
    }
  }

  return { totalReposicionNuevo, totalDepreciacion, totalReposicionNeto };
}

export function recalcularValoracionConstruccionBloque(
  bloque: ValoracionConstruccionBloque,
): ValoracionConstruccionBloque {
  const items = bloque.items.map(calcularValoracionConstruccionItem);
  const totales = calcularTotalesValoracionConstruccion(items);
  return { ...bloque, items, ...totales };
}

/** Convierte fracción decimal (0.15) a porcentaje entero para inputs (15). */
export function fraccionAPorcentajeUI(fraccion: number | null): string {
  if (fraccion == null || !Number.isFinite(fraccion)) return '';
  return String(Math.round(fraccion * 10000) / 100);
}

/** Convierte porcentaje de UI (15) a fracción decimal (0.15). */
export function porcentajeUIAFraccion(valor: string): number | null {
  if (valor.trim() === '') return null;
  const n = Number(valor);
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(n / 100, 0), 1);
}
