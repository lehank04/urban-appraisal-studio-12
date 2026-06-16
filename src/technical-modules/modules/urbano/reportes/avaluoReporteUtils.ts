import { ComparableAvaluoINMOVAL } from '@/technical-modules/modules/urbano/comparables/avaluoComparablesStorage';

export function getComparablesParaAnexoTestigos(
  comparables: ComparableAvaluoINMOVAL[]
) {
  return comparables.filter(
    (item) =>
      item.estado === 'usado' ||
      item.estado === 'congelado'
  );
}

export function formatMoneyReporte(value: number, moneda: string) {
  return `${moneda} ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getEstadoReporteLabel(estado: string) {
  if (estado === 'congelado') return 'Congelado para reporte';
  if (estado === 'usado') return 'Usado en avalÃºo';
  if (estado === 'descartado') return 'Descartado';
  return 'Preseleccionado';
}

export function getTestigoStatusLabel(hasTestigo: boolean) {
  return hasTestigo ? 'Con testigo web' : 'Sin testigo web';
}

