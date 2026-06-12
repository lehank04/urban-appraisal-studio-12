import { nowISO, todayISO } from '@/shared/utils/dateUtils';
import {
  calcularEstadoPagoExpediente,
  calcularSaldoExpediente,
  ExpedienteINMOVAL,
  MonedaINMOVAL,
} from './expedienteTypes';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function crearExpedienteINMOVALBase(params: {
  id: string;
  codigo: string;
  titulo?: string;
  clienteNombre?: string;
  moneda?: MonedaINMOVAL;
}): ExpedienteINMOVAL {
  const costoServicio = 0;
  const montoPagado = 0;

  const ahora = nowISO();

  return {
    id: params.id,
    codigo: params.codigo,
    titulo: params.titulo || `Expediente ${params.codigo}`,

    tipoModulo: 'urbano',
    estado: 'en_cotizacion',
    prioridad: 'normal',

    cliente: {
      nombre: params.clienteNombre || 'Cliente pendiente',
    },

    fechaSolicitud: todayISO(),

    pago: {
      costoServicio,
      montoPagado,
      saldo: calcularSaldoExpediente(costoServicio, montoPagado),
      moneda: params.moneda || 'US$',
      estadoPago: calcularEstadoPagoExpediente(costoServicio, montoPagado),
    },

    facturacion: {
      facturaEmitida: false,
    },

    revisiones: [],

    actividad: [
      {
        id: createId(),
        fecha: ahora,
        accion: 'Expediente creado',
        modulo: 'plataforma',
        detalle: 'Expediente creado desde contrato base INMOVAL.',
      },
    ],

    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}