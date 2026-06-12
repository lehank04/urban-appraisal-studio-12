import { crearCotizacionINMOVALBase } from './cotizacionDefaults';
import {
  calcularSubtotalCotizacion,
  calcularTotalCotizacion,
  CotizacionINMOVAL,
} from './cotizacionTypes';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildNumeroCotizacion() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `COT-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

export function crearCotizacionDemoINMOVAL(params?: {
  clienteNombre?: string;
  servicio?: string;
  total?: number;
}): CotizacionINMOVAL {
  const total = Number(params?.total || 350);

  const cotizacion = crearCotizacionINMOVALBase({
    id: createId(),
    numero: buildNumeroCotizacion(),
    clienteNombre: params?.clienteNombre || 'Cliente de prueba',
  });

  const item = {
    id: createId(),
    descripcion: params?.servicio || 'Avalúo de inmueble urbano',
    cantidad: 1,
    precioUnitario: total,
    subtotal: total,
  };

  const subtotal = calcularSubtotalCotizacion([item]);

  return {
    ...cotizacion,
    servicio: params?.servicio || 'Avalúo de inmueble urbano',
    descripcionServicio:
      'Cotización de prueba generada desde Plataforma INMOVAL.',
    items: [item],
    subtotal,
    descuento: 0,
    impuestos: 0,
    total: calcularTotalCotizacion({
      subtotal,
      descuento: 0,
      impuestos: 0,
    }),
    estado: 'borrador',
  };
}
