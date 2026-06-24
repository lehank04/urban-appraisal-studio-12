import type {
  ValoracionConstruccionBloque,
  ValoracionConstruccionItem,
} from './moduloUrbanoTypes';

export type AdvertenciaValoracionConstruccion = {
  tipo: 'error' | 'warning' | 'info';
  mensaje: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizarNoNegativo(value: number | null | undefined): number | null {
  if (!isFiniteNumber(value)) return null;
  return Math.max(value, 0);
}

function normalizarPorcentajeDecimal(value: number | null | undefined): number | null {
  if (!isFiniteNumber(value)) return null;
  return Math.min(Math.max(value, 0), 1);
}

function normalizarCoeficienteConservacion(value: number | null | undefined): number {
  if (!isFiniteNumber(value) || value <= 0) return 1;
  return Math.min(Math.max(value, 0.1), 2);
}

export function calcularDepreciacionPorcentajeConstruccion(
  item: ValoracionConstruccionItem,
): number | null {
  if (item.metodoDepreciacion === 'manual') {
    return normalizarPorcentajeDecimal(item.depreciacionPorcentaje);
  }

  if (item.metodoDepreciacion === 'lineal') {
    const edad = normalizarNoNegativo(item.edad);
    const vidaUtil = normalizarNoNegativo(item.vidaUtil);

    if (edad == null || vidaUtil == null || vidaUtil <= 0) return null;

    const baseLineal = Math.min(Math.max(edad / vidaUtil, 0), 1);
    const coefConservacion = normalizarCoeficienteConservacion(item.coeficienteConservacion);

    return Math.min(Math.max(baseLineal * coefConservacion, 0), 1);
  }

  // Ross-Heidecke queda pendiente de fórmula validada. Mientras tanto usa %
  // manual si el perito lo captura, pero no inventa tabla técnica.
  if (item.metodoDepreciacion === 'ross_heidecke_pendiente') {
    return normalizarPorcentajeDecimal(item.depreciacionPorcentaje);
  }

  return normalizarPorcentajeDecimal(item.depreciacionPorcentaje);
}

/**
 * F3B — Cálculos permitidos:
 * - VRN = área construida × valor unitario de reposición
 * - depreciación = VRN × depreciación %
 * - VRN neto = VRN − depreciación
 *
 * Método lineal:
 * - depreciación % = edad / vida útil
 * - si existe coeficienteConservacion, se usa como ajuste multiplicador
 * - se limita entre 0 % y 100 %
 *
 * Ross-Heidecke:
 * - reservado hasta validar tabla/fórmula. No se inventa.
 */
export function calcularValoracionConstruccionItem(
  item: ValoracionConstruccionItem,
): ValoracionConstruccionItem {
  const area = normalizarNoNegativo(item.areaConstruida);
  const vu = normalizarNoNegativo(item.valorUnitarioReposicion);

  let valorReposicionNuevo: number | null = null;
  if (area != null && vu != null) {
    valorReposicionNuevo = area * vu;
  }

  const depreciacionPorcentaje = calcularDepreciacionPorcentajeConstruccion(item);

  let depreciacionMonto: number | null = null;
  let valorReposicionNeto: number | null = null;

  if (valorReposicionNuevo != null) {
    if (depreciacionPorcentaje != null) {
      depreciacionMonto = valorReposicionNuevo * depreciacionPorcentaje;
      valorReposicionNeto = Math.max(valorReposicionNuevo - depreciacionMonto, 0);
    } else {
      depreciacionMonto = null;
      valorReposicionNeto = valorReposicionNuevo;
    }
  }

  return {
    ...item,
    areaConstruida: area,
    valorUnitarioReposicion: vu,
    depreciacionPorcentaje,
    valorReposicionNuevo,
    depreciacionMonto,
    valorReposicionNeto,
  };
}

export function obtenerAdvertenciasValoracionConstruccion(
  item: ValoracionConstruccionItem,
): AdvertenciaValoracionConstruccion[] {
  const advertencias: AdvertenciaValoracionConstruccion[] = [];

  if (item.areaConstruida == null || !Number.isFinite(item.areaConstruida) || item.areaConstruida <= 0) {
    advertencias.push({
      tipo: 'warning',
      mensaje: 'Falta área construida válida.',
    });
  }

  if (
    item.valorUnitarioReposicion == null ||
    !Number.isFinite(item.valorUnitarioReposicion) ||
    item.valorUnitarioReposicion <= 0
  ) {
    advertencias.push({
      tipo: 'warning',
      mensaje: 'Falta valor unitario de reposición válido.',
    });
  }

  if (item.vidaUtil == null || !Number.isFinite(item.vidaUtil) || item.vidaUtil <= 0) {
    advertencias.push({
      tipo: 'warning',
      mensaje: 'Vida útil debe ser mayor que 0.',
    });
  }

  if (
    item.edad != null &&
    item.vidaUtil != null &&
    Number.isFinite(item.edad) &&
    Number.isFinite(item.vidaUtil) &&
    item.vidaUtil > 0 &&
    item.edad > item.vidaUtil
  ) {
    advertencias.push({
      tipo: 'warning',
      mensaje: 'La edad supera la vida útil. Revisar depreciación.',
    });
  }

  if (
    item.depreciacionPorcentaje != null &&
    Number.isFinite(item.depreciacionPorcentaje) &&
    item.depreciacionPorcentaje >= 1
  ) {
    advertencias.push({
      tipo: 'warning',
      mensaje: 'La depreciación llegó al 100 %. El VRN neto puede quedar en cero.',
    });
  }

  if (
    item.metodoDepreciacion === 'ross_heidecke_pendiente' &&
    item.depreciacionPorcentaje == null
  ) {
    advertencias.push({
      tipo: 'info',
      mensaje: 'Ross-Heidecke está pendiente de fórmula validada. Capture % manual temporal.',
    });
  }

  return advertencias;
}

export function calcularTotalesValoracionConstruccion(
  items: ValoracionConstruccionItem[],
): Pick<
  ValoracionConstruccionBloque,
  'totalReposicionNuevo' | 'totalDepreciacion' | 'totalReposicionNeto'
> & {
  porcentajeDepreciacionPromedio: number | null;
} {
  let totalReposicionNuevo: number | null = null;
  let totalDepreciacion: number | null = null;
  let totalReposicionNeto: number | null = null;
  const porcentajes: number[] = [];

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

    if (item.depreciacionPorcentaje != null && Number.isFinite(item.depreciacionPorcentaje)) {
      porcentajes.push(item.depreciacionPorcentaje);
    }
  }

  const porcentajeDepreciacionPromedio = porcentajes.length
    ? porcentajes.reduce((acc, value) => acc + value, 0) / porcentajes.length
    : null;

  return {
    totalReposicionNuevo,
    totalDepreciacion,
    totalReposicionNeto,
    porcentajeDepreciacionPromedio,
  };
}

export function recalcularValoracionConstruccionBloque(
  bloque: ValoracionConstruccionBloque,
): ValoracionConstruccionBloque {
  const items = bloque.items.map(calcularValoracionConstruccionItem);
  const totales = calcularTotalesValoracionConstruccion(items);
  return {
    ...bloque,
    items,
    totalReposicionNuevo: totales.totalReposicionNuevo,
    totalDepreciacion: totales.totalDepreciacion,
    totalReposicionNeto: totales.totalReposicionNeto,
  };
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
