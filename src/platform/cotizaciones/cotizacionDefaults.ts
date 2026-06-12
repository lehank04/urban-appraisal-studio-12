import { addDaysISO, nowISO, todayISO } from '@/shared/utils/dateUtils';
import { CotizacionINMOVAL } from './cotizacionTypes';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function crearCotizacionINMOVALBase(params: {
  id: string;
  numero: string;
  expedienteId?: string;
  clienteNombre?: string;
}): CotizacionINMOVAL {
  const fecha = todayISO();
  const ahora = nowISO();

  return {
    id: params.id,
    numero: params.numero,
    expedienteId: params.expedienteId,

    tipoModulo: 'urbano',

    cliente: {
      nombre: params.clienteNombre || 'Cliente pendiente',
    },

    servicio: 'Servicio de avalúo',
    descripcionServicio: '',

    items: [],

    subtotal: 0,
    descuento: 0,
    impuestos: 0,
    total: 0,
    moneda: 'US$',

    fecha,
    fechaVencimiento: addDaysISO(fecha, 30),

    formaPago: '',
    tiempoEntrega: '',
    entregables: [],

    condiciones: [
      {
        id: createId(),
        texto: 'La cotización está sujeta a la información suministrada por el cliente.',
      },
      {
        id: createId(),
        texto: 'El inicio del servicio queda sujeto a la aprobación de la cotización.',
      },
    ],

    estado: 'borrador',

    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}