import {
    ActividadINMOVAL,
    EstadoExpedienteINMOVAL,
    EstadoPagoINMOVAL,
    EstadoRevisionAvaluo,
    RolUsuarioINMOVAL,
    TipoModuloTecnico,
  } from '@/shared/types/inmovalCore';
  
  export type PrioridadExpedienteINMOVAL =
    | 'baja'
    | 'normal'
    | 'alta'
    | 'urgente';
  
  export type MonedaINMOVAL = 'US$' | 'C$';
  
  export type ClienteExpedienteINMOVAL = {
    id?: string;
    nombre: string;
    tipo?: 'persona_natural' | 'persona_juridica' | 'institucion' | 'banco' | 'otro';
    identificacion?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
  };
  
  export type PeritoExpedienteINMOVAL = {
    id?: string;
    nombre: string;
    email?: string;
    telefono?: string;
    codigo?: string;
    rol?: RolUsuarioINMOVAL;
  };
  
  export type PagoExpedienteINMOVAL = {
    costoServicio: number;
    montoPagado: number;
    saldo: number;
    moneda: MonedaINMOVAL;
    estadoPago: EstadoPagoINMOVAL;
  };
  
  export type FacturacionExpedienteINMOVAL = {
    facturaEmitida: boolean;
    numeroFactura?: string;
    fechaFactura?: string;
    observaciones?: string;
  };
  
  export type RevisionResumenINMOVAL = {
    id: string;
    codigo: string;
    nombre: string;
    estado: EstadoRevisionAvaluo;
    fechaCreacion: string;
    fechaActualizacion: string;
    creadaPor?: string;
    observaciones?: string;
    esRevisionActiva: boolean;
    esFinal: boolean;
  };
  
  export type ExpedienteINMOVAL = {
    id: string;
    codigo: string;
    titulo: string;
  
    tipoModulo: TipoModuloTecnico;
    estado: EstadoExpedienteINMOVAL;
    prioridad: PrioridadExpedienteINMOVAL;
  
    cliente: ClienteExpedienteINMOVAL;
    solicitante?: ClienteExpedienteINMOVAL;
    propietario?: ClienteExpedienteINMOVAL;
    peritoAsignado?: PeritoExpedienteINMOVAL;
  
    fechaSolicitud: string;
    fechaEntregaEstimada?: string;
    fechaCierre?: string;
  
    pago: PagoExpedienteINMOVAL;
    facturacion: FacturacionExpedienteINMOVAL;
  
    cotizacionId?: string;
    revisionActivaId?: string;
    revisiones: RevisionResumenINMOVAL[];
  
    driveFolderId?: string;
    driveFileId?: string;
    driveUrl?: string;
  
    archivoImvNombre?: string;
    archivoImvVersion?: string;
  
    observacionesAdministrativas?: string;
    actividad: ActividadINMOVAL[];
  
    creadoPor?: string;
    creadoEn: string;
    actualizadoEn: string;
  };
  
  export function calcularSaldoExpediente(
    costoServicio: number,
    montoPagado: number
  ) {
    return Math.max(0, Number(costoServicio || 0) - Number(montoPagado || 0));
  }
  
  export function calcularEstadoPagoExpediente(
    costoServicio: number,
    montoPagado: number
  ): EstadoPagoINMOVAL {
    const costo = Number(costoServicio || 0);
    const pagado = Number(montoPagado || 0);
  
    if (costo <= 0) return 'no_aplica';
    if (pagado <= 0) return 'pendiente';
    if (pagado >= costo) return 'pagado';
  
    return 'parcial';
  }
  
  export function expedientePuedeCerrarse(expediente: ExpedienteINMOVAL) {
    return (
      expediente.pago.estadoPago === 'pagado' &&
      expediente.facturacion.facturaEmitida
    );
  }