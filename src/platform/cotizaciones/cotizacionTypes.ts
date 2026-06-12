import {
    EstadoCotizacion,
    TipoModuloTecnico,
  } from '@/shared/types/inmovalCore';
  import {
    ClienteExpedienteINMOVAL,
    MonedaINMOVAL,
  } from '@/platform/expedientes/expedienteTypes';
  
  export type ItemCotizacionINMOVAL = {
    id: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  };
  
  export type CondicionCotizacionINMOVAL = {
    id: string;
    texto: string;
  };
  
  export type CotizacionINMOVAL = {
    id: string;
    numero: string;
  
    expedienteId?: string;
    tipoModulo: TipoModuloTecnico;
  
    cliente: ClienteExpedienteINMOVAL;
    solicitante?: ClienteExpedienteINMOVAL;
  
    servicio: string;
    descripcionServicio?: string;
  
    items: ItemCotizacionINMOVAL[];
  
    subtotal: number;
    descuento: number;
    impuestos: number;
    total: number;
    moneda: MonedaINMOVAL;
  
    fecha: string;
    fechaVencimiento?: string;
  
    formaPago?: string;
    tiempoEntrega?: string;
    entregables?: string[];
  
    condiciones: CondicionCotizacionINMOVAL[];
    estado: EstadoCotizacion;
  
    enviadaEn?: string;
    aprobadaEn?: string;
    rechazadaEn?: string;
    observaciones?: string;
  
    creadoPor?: string;
    creadoEn: string;
    actualizadoEn: string;
  };
  
  export function calcularSubtotalCotizacion(items: ItemCotizacionINMOVAL[]) {
    return items.reduce((total, item) => {
      const subtotalCalculado =
        Number(item.cantidad || 0) * Number(item.precioUnitario || 0);
  
      return total + Number(item.subtotal || subtotalCalculado || 0);
    }, 0);
  }
  
  export function calcularTotalCotizacion(params: {
    subtotal: number;
    descuento?: number;
    impuestos?: number;
  }) {
    const subtotal = Number(params.subtotal || 0);
    const descuento = Number(params.descuento || 0);
    const impuestos = Number(params.impuestos || 0);
  
    return Math.max(0, subtotal - descuento + impuestos);
  }
  
  export function cotizacionEstaVencida(params: {
    estado: EstadoCotizacion;
    fechaVencimiento?: string;
    fechaActualISO: string;
  }) {
    if (!params.fechaVencimiento) return false;
    if (params.estado === 'aprobada' || params.estado === 'rechazada') {
      return false;
    }
  
    return params.fechaVencimiento < params.fechaActualISO;
  }