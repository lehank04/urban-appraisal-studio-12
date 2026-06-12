import {
  calcularEstadoPagoExpediente,
  calcularSaldoExpediente,
} from '@/platform/expedientes/expedienteTypes';
import { ExpedienteIndiceINMOVAL } from '@/platform/expedientes/expedienteIndexTypes';
import { upsertExpedienteIndiceINMOVAL } from '@/platform/expedientes/expedienteIndexStorage';
import { nowISO, todayISO } from '@/shared/utils/dateUtils';
import { CotizacionINMOVAL } from './cotizacionTypes';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildCodigoExpedienteDesdeCotizacion(cotizacion: CotizacionINMOVAL) {
  const cleanNumero = cotizacion.numero
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-10)
    .toUpperCase();

  return `EXP-${cleanNumero}`;
}

export function crearExpedienteIndiceDesdeCotizacion(
  cotizacion: CotizacionINMOVAL
): ExpedienteIndiceINMOVAL {
  const ahora = nowISO();
  const costoServicio = Number(cotizacion.total || 0);
  const montoPagado = 0;
  const saldo = calcularSaldoExpediente(costoServicio, montoPagado);

  return {
    id: cotizacion.expedienteId || createId(),
    codigo: buildCodigoExpedienteDesdeCotizacion(cotizacion),
    titulo: cotizacion.servicio || `Expediente de ${cotizacion.numero}`,

    tipoModulo: cotizacion.tipoModulo,
    estado: 'cotizacion_aprobada',
    prioridad: 'normal',

    clienteNombre: cotizacion.cliente?.nombre || 'Cliente pendiente',

    fechaSolicitud: todayISO(),

    costoServicio,
    montoPagado,
    saldo,
    moneda: cotizacion.moneda,
    estadoPago: calcularEstadoPagoExpediente(costoServicio, montoPagado),

    facturaEmitida: false,

    revisionActivaCodigo: 'Rev00',
    totalRevisiones: 0,

    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}

export function crearExpedienteDeCotizacionAprobada(
  cotizacion: CotizacionINMOVAL
) {
  const expediente = crearExpedienteIndiceDesdeCotizacion(cotizacion);

  upsertExpedienteIndiceINMOVAL(expediente);

  return expediente;
}
