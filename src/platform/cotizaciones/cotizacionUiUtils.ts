import { EstadoCotizacion } from '@/shared/types/inmovalCore';

export function getEstadoCotizacionLabel(estado: EstadoCotizacion) {
  const labels: Record<EstadoCotizacion, string> = {
    borrador: 'Borrador',
    enviada: 'Enviada',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    vencida: 'Vencida',
  };

  return labels[estado];
}

export function getEstadoCotizacionClass(estado: EstadoCotizacion) {
  if (estado === 'aprobada') {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  }

  if (estado === 'rechazada' || estado === 'vencida') {
    return 'border-rose-400/30 bg-rose-400/10 text-rose-200';
  }

  if (estado === 'enviada') {
    return 'border-sky-400/30 bg-sky-400/10 text-sky-200';
  }

  return 'border-slate-500/40 bg-slate-500/10 text-slate-300';
}

export function formatMoneyCotizacion(value: number, moneda: string) {
  return `${moneda} ${Number(value || 0).toLocaleString('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function cotizacionCoincideConBusqueda(params: {
  numero: string;
  clienteNombre?: string;
  servicio?: string;
  busqueda?: string;
}) {
  if (!params.busqueda?.trim()) return true;

  const q = params.busqueda.trim().toLowerCase();

  return [
    params.numero,
    params.clienteNombre,
    params.servicio,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}
