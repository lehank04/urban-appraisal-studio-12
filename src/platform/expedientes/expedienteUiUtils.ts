import {
  EstadoExpedienteINMOVAL,
  EstadoPagoINMOVAL,
  TipoModuloTecnico,
} from '@/shared/types/inmovalCore';
import { PrioridadExpedienteINMOVAL } from './expedienteTypes';

export function getEstadoExpedienteLabel(estado: EstadoExpedienteINMOVAL) {
  const labels: Record<EstadoExpedienteINMOVAL, string> = {
    en_cotizacion: 'Nuevo',
    cotizacion_enviada: 'Cotización enviada',
    cotizacion_aprobada: 'Nuevo',
    pendiente_inspeccion: 'Pendiente de inspección',
    en_inspeccion: 'En inspección',
    en_elaboracion: 'En elaboración',
    en_revision: 'En revisión',
    avaluo_en_revision: 'Avalúo en revisión',
    listo_para_entrega: 'Listo para entrega',
    correcciones: 'Correcciones',
    aprobado: 'Aprobado',
    entregado: 'Entregado',
    facturado: 'Facturado',
    cerrado: 'Cerrado',
    cancelado: 'Cancelado',
  };

  return labels[estado];
}

export function getEstadoPagoLabel(estado: EstadoPagoINMOVAL) {
  const labels: Record<EstadoPagoINMOVAL, string> = {
    pendiente: 'Pendiente',
    parcial: 'Parcial',
    pagado: 'Pagado',
    no_aplica: 'No aplica',
  };

  return labels[estado];
}

export function getPrioridadLabel(prioridad: PrioridadExpedienteINMOVAL) {
  const labels: Record<PrioridadExpedienteINMOVAL, string> = {
    baja: 'Baja',
    normal: 'Normal',
    alta: 'Alta',
    urgente: 'Urgente',
  };

  return labels[prioridad];
}

export function getModuloLabel(modulo: TipoModuloTecnico) {
  const labels: Record<TipoModuloTecnico, string> = {
    urbano: 'Urbano',
    rural: 'Rural',
    maquinaria: 'Maquinaria',
    vehiculo: 'Vehículos',
    vehiculos: 'Vehículos',
    especial: 'Especiales',
    especiales: 'Especiales',
  };

  return labels[modulo];
}

export function getEstadoExpedienteClass(estado: EstadoExpedienteINMOVAL) {
  if (estado === 'cerrado') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (estado === 'cancelado') return 'border-rose-400/30 bg-rose-400/10 text-rose-200';
  if (estado === 'correcciones') return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
  if (estado === 'en_revision') return 'border-sky-400/30 bg-sky-400/10 text-sky-200';
  if (estado === 'en_elaboracion' || estado === 'en_inspeccion') {
    return 'border-indigo-400/30 bg-indigo-400/10 text-indigo-200';
  }

  return 'border-slate-500/40 bg-slate-500/10 text-slate-300';
}

export function getPrioridadClass(prioridad: PrioridadExpedienteINMOVAL) {
  if (prioridad === 'urgente') return 'border-rose-400/30 bg-rose-400/10 text-rose-200';
  if (prioridad === 'alta') return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
  if (prioridad === 'baja') return 'border-slate-500/40 bg-slate-500/10 text-slate-300';

  return 'border-sky-400/30 bg-sky-400/10 text-sky-200';
}

export function getEstadoPagoClass(estado: EstadoPagoINMOVAL) {
  if (estado === 'pagado') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (estado === 'parcial') return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
  if (estado === 'pendiente') return 'border-rose-400/30 bg-rose-400/10 text-rose-200';

  return 'border-slate-500/40 bg-slate-500/10 text-slate-300';
}

export function formatMoneyINMOVAL(value: number, moneda: string) {
  return `${moneda} ${Number(value || 0).toLocaleString('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
